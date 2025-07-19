import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Users, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimplifiedProductivityReportProps {
  onBack: () => void;
  onLogout?: () => void;
  userData?: any;
}

interface ProductivityMetrics {
  totalPunches: number;
  activeEmployees: number;
  avgPunchesPerEmployee: number;
  onTimeRate: number;
  lateRate: number;
  productivityScore: number;
}

interface BranchData {
  id: string;
  name: string;
  metrics: ProductivityMetrics;
}

const SimplifiedProductivityReport = ({ onBack, onLogout, userData }: SimplifiedProductivityReportProps) => {
  const [branchData, setBranchData] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('thisMonth');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [overallMetrics, setOverallMetrics] = useState<ProductivityMetrics>({
    totalPunches: 0,
    activeEmployees: 0,
    avgPunchesPerEmployee: 0,
    onTimeRate: 0,
    lateRate: 0,
    productivityScore: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProductivityData();
  }, [period, selectedBranch]);

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

  const loadProductivityData = async () => {
    try {
      setLoading(true);
      const { start, end } = getPeriodDates();

      // Buscar dados unificados de punch records
      let query = supabase
        .from('unified_punch_records')
        .select('*')
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString());

      if (userData?.companyId) {
        query = query.eq('company_id', userData.companyId);
      }

      if (selectedBranch !== 'all') {
        query = query.eq('branch_id', selectedBranch);
      }

      const { data: punchData, error } = await query;
      
      if (error) throw error;

      // Processar dados por filial
      const branchStats: Record<string, {
        name: string;
        totalPunches: number;
        employees: Set<string>;
        onTimeCount: number;
        lateCount: number;
      }> = {};

      punchData?.forEach(record => {
        const branchId = record.branch_id || 'unknown';
        const branchName = record.branch_name || 'Filial';

        if (!branchStats[branchId]) {
          branchStats[branchId] = {
            name: branchName,
            totalPunches: 0,
            employees: new Set(),
            onTimeCount: 0,
            lateCount: 0
          };
        }

        branchStats[branchId].totalPunches++;
        if (record.employee_id) {
          branchStats[branchId].employees.add(record.employee_id);
        }

        // Análise de pontualidade simplificada
        if (record.punch_type === 'entrada') {
          const punchTime = new Date(record.timestamp || '');
          const hour = punchTime.getHours();
          const minute = punchTime.getMinutes();
          const totalMinutes = hour * 60 + minute;
          const workStartMinutes = 8 * 60; // 8:00

          if (totalMinutes <= workStartMinutes + 15) { // 15 min tolerância
            branchStats[branchId].onTimeCount++;
          } else {
            branchStats[branchId].lateCount++;
          }
        }
      });

      // Converter para estrutura final
      const processedBranches: BranchData[] = Object.entries(branchStats).map(([id, stats]) => {
        const totalEntries = stats.onTimeCount + stats.lateCount;
        const activeEmployees = stats.employees.size;
        const avgPunches = activeEmployees > 0 ? stats.totalPunches / activeEmployees : 0;
        const onTimeRate = totalEntries > 0 ? (stats.onTimeCount / totalEntries) * 100 : 0;
        const lateRate = totalEntries > 0 ? (stats.lateCount / totalEntries) * 100 : 0;

        // Score de produtividade (combina frequência e pontualidade)
        const frequencyScore = Math.min(avgPunches * 10, 50); // máximo 50 pontos
        const punctualityScore = onTimeRate * 0.5; // máximo 50 pontos
        const productivityScore = frequencyScore + punctualityScore;

        return {
          id,
          name: stats.name,
          metrics: {
            totalPunches: stats.totalPunches,
            activeEmployees,
            avgPunchesPerEmployee: avgPunches,
            onTimeRate,
            lateRate,
            productivityScore: Math.round(productivityScore)
          }
        };
      });

      setBranchData(processedBranches);

      // Calcular métricas gerais
      const totalPunches = processedBranches.reduce((sum, branch) => sum + branch.metrics.totalPunches, 0);
      const totalEmployees = processedBranches.reduce((sum, branch) => sum + branch.metrics.activeEmployees, 0);
      const avgPunches = totalEmployees > 0 ? totalPunches / totalEmployees : 0;
      const avgOnTime = processedBranches.length > 0 
        ? processedBranches.reduce((sum, branch) => sum + branch.metrics.onTimeRate, 0) / processedBranches.length 
        : 0;
      const avgLate = processedBranches.length > 0 
        ? processedBranches.reduce((sum, branch) => sum + branch.metrics.lateRate, 0) / processedBranches.length 
        : 0;
      const avgScore = processedBranches.length > 0 
        ? processedBranches.reduce((sum, branch) => sum + branch.metrics.productivityScore, 0) / processedBranches.length 
        : 0;

      setOverallMetrics({
        totalPunches,
        activeEmployees: totalEmployees,
        avgPunchesPerEmployee: avgPunches,
        onTimeRate: avgOnTime,
        lateRate: avgLate,
        productivityScore: Math.round(avgScore)
      });

    } catch (error) {
      console.error('Erro ao carregar dados de produtividade:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de produtividade",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Boa';
    if (score >= 40) return 'Regular';
    return 'Baixa';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatório...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Relatório de Produtividade</h1>
                <p className="text-gray-600">Análise simplificada de desempenho</p>
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
        {/* Filtros */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
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

        {/* Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Registros</p>
                  <p className="text-2xl font-bold text-gray-900">{overallMetrics.totalPunches}</p>
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
                  <p className="text-sm text-gray-600">Funcionários Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{overallMetrics.activeEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Média por Funcionário</p>
                  <p className="text-2xl font-bold text-gray-900">{overallMetrics.avgPunchesPerEmployee.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Score Produtividade</p>
                  <p className="text-2xl font-bold text-gray-900">{overallMetrics.productivityScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dados por Filial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {branchData.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum dado encontrado para o período selecionado</p>
            </div>
          ) : (
            branchData.map((branch) => (
              <Card key={branch.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {branch.name}
                    </CardTitle>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(branch.metrics.productivityScore)}`}>
                      {branch.metrics.productivityScore}/100 - {getScoreLabel(branch.metrics.productivityScore)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">Registros</p>
                      <p className="text-lg font-bold text-blue-600">{branch.metrics.totalPunches}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">Funcionários</p>
                      <p className="text-lg font-bold text-green-600">{branch.metrics.activeEmployees}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600">Média</p>
                      <p className="text-lg font-bold text-purple-600">{branch.metrics.avgPunchesPerEmployee.toFixed(1)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pontualidade</span>
                      <span className="text-sm font-semibold text-green-600">
                        {branch.metrics.onTimeRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(branch.metrics.onTimeRate, 100)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Atrasos</span>
                      <span className="text-sm font-semibold text-red-600">
                        {branch.metrics.lateRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(branch.metrics.lateRate, 100)}%` }}
                      ></div>
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

export default SimplifiedProductivityReport;