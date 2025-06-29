
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Download, User, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PunchRecord {
  id: string;
  user_id: string;
  punch_type: string;
  timestamp: string;
  confidence_score?: number;
  face_image_url?: string;
  users: {
    name: string;
  };
}

interface PunchRecordsTableProps {
  companyId?: string;
}

const PunchRecordsTable = ({ companyId }: PunchRecordsTableProps) => {
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      loadPunchRecords();
    }
  }, [companyId]);

  const loadPunchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('punch_records')
        .select(`
          *,
          users!inner(name, company_id)
        `)
        .eq('users.company_id', companyId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPunchRecords(data || []);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const csvHeaders = ['Nome', 'Data/Hora', 'Tipo', 'Confiança (%)'];
      const csvData = punchRecords.map(record => [
        record.users.name,
        new Date(record.timestamp).toLocaleString('pt-BR'),
        record.punch_type === 'entry' ? 'Entrada' : 'Saída',
        record.confidence_score ? Math.round(record.confidence_score * 100) : 'N/A'
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `registros_ponto_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Relatório exportado!",
        description: "O arquivo CSV foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (punchType: string, confidence?: number) => {
    const isEntry = punchType === 'entry';
    return (
      <div className="flex items-center gap-2">
        <Badge className={isEntry ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
          {isEntry ? 'Entrada' : 'Saída'}
        </Badge>
        {confidence && (
          <Badge variant="outline" className="text-xs">
            {Math.round(confidence * 100)}%
          </Badge>
        )}
      </div>
    );
  };

  const isLate = (timestamp: string, punchType: string) => {
    const punchTime = new Date(timestamp);
    const hour = punchTime.getHours();
    const minute = punchTime.getMinutes();
    
    if (punchType === 'entry') {
      // Considerando 8:00 como horário padrão de entrada
      return hour > 8 || (hour === 8 && minute > 0);
    }
    return false;
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Registros de Ponto - PontoDom
            </CardTitle>
            <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando registros...</p>
            </div>
          ) : punchRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum registro de ponto encontrado.</p>
              <p className="text-sm text-gray-400 mt-2">
                Os registros aparecerão aqui quando os funcionários começarem a bater ponto.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Funcionário</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Foto</th>
                  </tr>
                </thead>
                <tbody>
                  {punchRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{record.users.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div className="font-mono text-sm">
                          {new Date(record.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(record.punch_type, record.confidence_score)}
                      </td>
                      <td className="py-3 px-4">
                        {isLate(record.timestamp, record.punch_type) ? (
                          <Badge variant="destructive">Atrasado</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">No Horário</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.face_image_url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedImage(record.face_image_url)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Foto do Registro</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img 
                src={selectedImage} 
                alt="Foto do registro de ponto" 
                className="w-full rounded-lg border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PunchRecordsTable;
