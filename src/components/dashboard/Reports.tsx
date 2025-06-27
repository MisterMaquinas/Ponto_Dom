
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Calendar, Clock, Filter, Building, Camera } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FaceRecognitionHistory from './FaceRecognitionHistory';

interface ReportsProps {
  onBack: () => void;
  userType: 'admin' | 'manager' | 'supervisor';
  onLogout: () => void;
  userData: any;
}

interface PunchRecord {
  id: string;
  user_id: string;
  name: string;
  date: string;
  entry_time: string;
  exit_time?: string;
  status: 'complete' | 'incomplete' | 'late';
  confidence_score?: number;
}

const Reports = ({ onBack, userType, onLogout, userData }: ReportsProps) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPunchRecords = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('punch_records')
        .select(`
          *,
          users!inner (
            name,
            username,
            company_id
          )
        `)
        .eq('users.company_id', userData.companyId)
        .order('timestamp', { ascending: false });

      if (dateFrom) {
        query = query.gte('timestamp', dateFrom + 'T00:00:00');
      }
      if (dateTo) {
        query = query.lte('timestamp', dateTo + 'T23:59:59');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar registros:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar registros de ponto",
          variant: "destructive",
        });
        return;
      }

      // Processar dados para o formato esperado
      const processedRecords = (data || []).map(record => ({
        id: record.id,
        user_id: record.user_id,
        name: record.users.name,
        date: new Date(record.timestamp).toISOString().split('T')[0],
        entry_time: new Date(record.timestamp).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        exit_time: undefined, // Por enquanto só entrada
        status: 'complete' as const,
        confidence_score: record.confidence_score
      }));

      setPunchRecords(processedRecords);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar registros de ponto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPunchRecords();
  }, [userData.companyId]);

  const handleSearch = () => {
    loadPunchRecords();
  };

  const getStatusBadge = (status: string, confidence?: number) => {
    switch (status) {
      case 'complete':
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Completo</Badge>
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        );
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Atraso</Badge>;
      case 'incomplete':
        return <Badge className="bg-red-100 text-red-800">Incompleto</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const exportPunchReport = () => {
    if (punchRecords.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há registros de ponto para exportar",
        variant: "destructive",
      });
      return;
    }

    const csv = [
      ['Nome', 'Data', 'Entrada', 'Saída', 'Status', 'Confiança'].join(','),
      ...punchRecords.map(record => [
        record.name,
        new Date(record.date).toLocaleDateString('pt-BR'),
        record.entry_time,
        record.exit_time || '--:--',
        record.status,
        record.confidence_score ? Math.round(record.confidence_score * 100) + '%' : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_ponto_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Relatório exportado!",
      description: "O arquivo foi baixado com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatórios Detalhados</h1>
                <p className="text-gray-600">Registros de ponto e reconhecimento facial</p>
                {userData?.companyName && (
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">{userData.companyName}</span>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="punch-records" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="punch-records" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Registros de Ponto
            </TabsTrigger>
            <TabsTrigger value="face-recognition" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Reconhecimento Facial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="punch-records" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros de Pesquisa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Inicial
                    </label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Final
                    </label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funcionário
                    </label>
                    <Input
                      type="text"
                      placeholder="Digite o nome"
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleSearch}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Carregando...' : 'Pesquisar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Registros de Ponto
                  </CardTitle>
                  <Button onClick={exportPunchReport} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
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
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Entrada</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Saída</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {punchRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {record.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">{record.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(record.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4 text-gray-900 font-mono">{record.entry_time}</td>
                            <td className="py-3 px-4 text-gray-900 font-mono">{record.exit_time || '--:--'}</td>
                            <td className="py-3 px-4">{getStatusBadge(record.status, record.confidence_score)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="face-recognition">
            <FaceRecognitionHistory 
              companyId={userData.companyId}
              showUserFilter={true}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {punchRecords.length > 0 ? '100%' : '0%'}
              </div>
              <div className="text-sm text-gray-600">Taxa de Reconhecimento</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {punchRecords.length}
              </div>
              <div className="text-sm text-gray-600">Registros Hoje</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {punchRecords.filter(r => r.confidence_score && r.confidence_score >= 0.9).length}
              </div>
              <div className="text-sm text-gray-600">Alta Confiança ({'>'}90%)</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
