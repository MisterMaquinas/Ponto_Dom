import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Users, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleProductivityReportProps {
  onBack: () => void;
  onLogout?: () => void;
  userData?: any;
}

interface BranchSummary {
  id: string;
  name: string;
  totalPunches: number;
  totalEmployees: number;
  onTimePunches: number;
  latePunches: number;
}

const SimpleProductivityReport = ({ onBack, onLogout, userData }: SimpleProductivityReportProps) => {
  const [branchSummaries, setBranchSummaries] = useState<BranchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('thisMonth');
  const [totalStats, setTotalStats] = useState({
    totalPunches: 0,
    totalEmployees: 0,
    totalBranches: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [period]);

  const getPeriodDates = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        };
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return {
          start: startOfWeek,
          end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
        };
      case 'thisMonth':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
      default:
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const { start, end } = getPeriodDates();

      // Buscar dados de punch records
      let query = supabase
        .from('unified_punch_records')
        .select('*')
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString());

      if (userData?.companyId) {
        query = query.eq('company_id', userData.companyId);
      }

      const { data: punchData, error } = await query;
      
      if (error) throw error;

      // Processar dados por filial
      const branchData: Record<string, {
        name: string;
        punches: number;
        employees: Set<string>;
        onTime: number;
        late: number;
      }> = {};

      punchData?.forEach(record => {
        const branchId = record.branch_id || 'unknown';
        const branchName = record.branch_name || 'Sem filial';

        if (!branchData[branchId]) {
          branchData[branchId] = {
            name: branchName,
            punches: 0,
            employees: new Set(),
            onTime: 0,
            late: 0
          };
        }

        branchData[branchId].punches++;
        
        if (record.employee_id) {
          branchData[branchId].employees.add(record.employee_id);
        }

        // Contar pontos na hora e atrasados (apenas entradas)
        if (record.punch_type === 'entrada') {
          const punchTime = new Date(record.timestamp || '');
          const hour = punchTime.getHours();
          const minute = punchTime.getMinutes();
          
          // Considerando tolerância de 15 minutos após 8h
          if (hour < 8 || (hour === 8 && minute <= 15)) {
            branchData[branchId].onTime++;
          } else {
            branchData[branchId].late++;
          }
        }
      });

      // Converter para array
      const summaries: BranchSummary[] = Object.entries(branchData).map(([id, data]) => ({
        id,
        name: data.name,
        totalPunches: data.punches,
        totalEmployees: data.employees.size,
        onTimePunches: data.onTime,
        latePunches: data.late
      }));

      setBranchSummaries(summaries);

      // Calcular totais
      const totalPunches = summaries.reduce((sum, branch) => sum + branch.totalPunches, 0);
      const totalEmployees = summaries.reduce((sum, branch) => sum + branch.totalEmployees, 0);
      const totalBranches = summaries.length;

      setTotalStats({
        totalPunches,
        totalEmployees,
        totalBranches
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do relatório",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatório de Registros</h1>
                <p className="text-gray-600">Controle simples de pontos batidos</p>
              </div>
            </div>
            {onLogout && (
              <Button onClick={onLogout} variant="outline">
                Sair
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtro de Período */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Período:</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="thisWeek">Esta semana</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Registros</p>
                  <p className="text-3xl font-bold text-gray-900">{totalStats.totalPunches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funcionários</p>
                  <p className="text-3xl font-bold text-gray-900">{totalStats.totalEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Filiais Ativas</p>
                  <p className="text-3xl font-bold text-gray-900">{totalStats.totalBranches}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dados por Filial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {branchSummaries.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum registro encontrado para o período selecionado</p>
            </div>
          ) : (
            branchSummaries.map((branch) => (
              <Card key={branch.id} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {branch.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total de Registros</p>
                      <p className="text-2xl font-bold text-blue-600">{branch.totalPunches}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Funcionários</p>
                      <p className="text-2xl font-bold text-green-600">{branch.totalEmployees}</p>
                    </div>
                  </div>

                  {/* Pontualidade */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Pontualidade nas Entradas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">No Horário</p>
                        <p className="text-xl font-bold text-green-600">{branch.onTimePunches}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Atrasados</p>
                        <p className="text-xl font-bold text-red-600">{branch.latePunches}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleProductivityReport;