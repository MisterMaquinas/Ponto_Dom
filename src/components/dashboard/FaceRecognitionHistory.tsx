import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, User, Camera, Download, Search, Eye, Filter } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FaceRecognitionLog {
  id: string;
  user_id: string;
  recognition_timestamp: string;
  confidence_score: number;
  face_image_url: string;
  recognition_status: 'success' | 'failed' | 'low_confidence';
  device_info: any;
  location: any;
  user?: {
    name: string;
    username: string;
  };
}

interface FaceRecognitionHistoryProps {
  companyId?: string;
  userId?: string;
  showUserFilter?: boolean;
}

const FaceRecognitionHistory = ({ companyId, userId, showUserFilter = true }: FaceRecognitionHistoryProps) => {
  const [logs, setLogs] = useState<FaceRecognitionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, [companyId, userId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('face_recognition_logs')
        .select(`
          *,
          users!inner (
            name,
            username,
            company_id
          )
        `)
        .order('recognition_timestamp', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (companyId) {
        query = query.eq('users.company_id', companyId);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Erro ao carregar logs:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar histórico de reconhecimento",
          variant: "destructive",
        });
        return;
      }

      const processedLogs = data?.map(log => ({
        ...log,
        recognition_status: log.recognition_status as 'success' | 'failed' | 'low_confidence',
        user: log.users
      })) || [];

      setLogs(processedLogs);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, confidence: number) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Sucesso ({Math.round(confidence * 100)}%)</Badge>;
      case 'low_confidence':
        return <Badge className="bg-yellow-100 text-yellow-800">Baixa Confiança ({Math.round(confidence * 100)}%)</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falha</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      log.recognition_timestamp.startsWith(dateFilter);
    
    const matchesStatus = !statusFilter || log.recognition_status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const exportLogs = () => {
    const csv = [
      ['Data/Hora', 'Usuário', 'Username', 'Status', 'Confiança', 'Dispositivo'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.recognition_timestamp).toLocaleString('pt-BR'),
        log.user?.name || 'N/A',
        log.user?.username || 'N/A',
        log.recognition_status,
        Math.round(log.confidence_score * 100) + '%',
        log.device_info?.platform || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_reconhecimento_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado!",
      description: "Histórico exportado com sucesso",
    });
  };

  const viewImage = async (imagePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('face-recognition')
        .createSignedUrl(imagePath, 3600);
      
      if (data?.signedUrl) {
        setSelectedImage(data.signedUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar imagem",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Histórico de Reconhecimento Facial
            </CardTitle>
            <Button onClick={exportLogs} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-auto"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="">Todos os status</option>
              <option value="success">Sucesso</option>
              <option value="low_confidence">Baixa Confiança</option>
              <option value="failed">Falha</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando histórico...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum registro de reconhecimento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {log.user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{log.user?.name || 'Usuário não encontrado'}</h4>
                            {getStatusBadge(log.recognition_status, log.confidence_score)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.recognition_timestamp).toLocaleString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.user?.username}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewImage(log.face_image_url)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver Foto
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Imagem do Reconhecimento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {selectedImage && (
                                <img 
                                  src={selectedImage} 
                                  alt="Reconhecimento facial" 
                                  className="w-full rounded-lg"
                                />
                              )}
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Usuário:</strong> {log.user?.name}</p>
                                <p><strong>Data:</strong> {new Date(log.recognition_timestamp).toLocaleString('pt-BR')}</p>
                                <p><strong>Confiança:</strong> {Math.round(log.confidence_score * 100)}%</p>
                                {log.device_info && (
                                  <p><strong>Dispositivo:</strong> {log.device_info.platform}</p>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {log.device_info && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-500 grid grid-cols-2 gap-2">
                          <span>Plataforma: {log.device_info.platform}</span>
                          <span>Idioma: {log.device_info.language}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceRecognitionHistory;
