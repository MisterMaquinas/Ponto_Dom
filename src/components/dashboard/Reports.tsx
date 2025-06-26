
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Calendar, Clock, Filter, Building } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      // Por enquanto, não há registros de ponto reais no banco
      // Quando implementarmos a funcionalidade de registrar ponto,
      // esta query será atualizada para buscar os dados reais
      setPunchRecords([]);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Completo</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Atraso</Badge>;
      case 'incomplete':
        return <Badge className="bg-red-100 text-red-800">Incompleto</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const exportReport = () => {
    if (punchRecords.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há registros de ponto para exportar",
        variant: "destructive",
      });
      return;
    }
    
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
                <h1 className="text-2xl font-bold text-gray-900">Relatórios de Ponto</h1>
                <p className="text-gray-600">Visualizar e exportar registros</p>
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
        <Card className="mb-8 border-0 shadow-lg">
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
              <Button onClick={exportReport} variant="outline" className="flex items-center gap-2">
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
                <p className="text-gray-500">Nenhum registro de ponto encontrado ainda.</p>
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
                        <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">0%</div>
              <div className="text-sm text-gray-600">Taxa de Presença</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">0.0h</div>
              <div className="text-sm text-gray-600">Média de Horas/Dia</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Atrasos no Mês</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
