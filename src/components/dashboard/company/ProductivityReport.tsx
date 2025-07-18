import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart3, Clock, TrendingUp, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProductivityReportProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface ProductivityData {
  branchId: string;
  branchName: string;
  totalPunches: number;
  uniqueEmployees: number;
  averagePunchesPerEmployee: number;
  onTimePercentage: number;
  latePercentage: number;
}

const ProductivityReport = ({ onBack, onLogout, userData }: ProductivityReportProps) => {
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [stats, setStats] = useState({
    totalPunches: 0,
    totalEmployees: 0,
    averageProductivity: 0,
    bestBranch: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [userData.companyId, selectedPeriod, selectedBranch]);

  const getPeriodDates = () => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'thisWeek':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar filiais
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id, name')
        .eq('company_id', userData.companyId)
        .eq('is_active', true)
        .order('name');

      if (branchesError) throw branchesError;
      setBranches(branchesData || []);

      const { start, end } = getPeriodDates();

      // Carregar dados de produtividade usando a view unificada
      let query = supabase
        .from('unified_punch_records')
        .select('*')
        .eq('company_id', userData.companyId)
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString());

      if (selectedBranch !== 'all') {
        query = query.eq('branch_id', selectedBranch);
      }

      const { data: punchData, error: punchError } = await query;

      if (punchError) throw punchError;

      // Processar dados por filial
      const branchStats: Record<string, {
        totalPunches: number;
        employees: Set<string>;
        onTimePunches: number;
        latePunches: number;
        branchName: string;
      }> = {};

      punchData?.forEach(record => {
        const branchId = record.branch_id;
        if (!branchId) return;

        if (!branchStats[branchId]) {
          branchStats[branchId] = {
            totalPunches: 0,
            employees: new Set(),
            onTimePunches: 0,
            latePunches: 0,
            branchName: record.branch_name || 'Filial sem nome'
          };
        }

        branchStats[branchId].totalPunches++;
        branchStats[branchId].employees.add(record.employee_id || '');

        // Análise simplificada de pontualidade (assumindo entrada às 8h)
        if (record.punch_type === 'entrada') {
          const punchTime = new Date(record.timestamp || '');
          const hour = punchTime.getHours();
          const minute = punchTime.getMinutes();
          
          if (hour < 8 || (hour === 8 && minute <= 15)) {
            branchStats[branchId].onTimePunches++;
          } else {
            branchStats[branchId].latePunches++;
          }
        }
      });

      // Converter para array
      const productivity: ProductivityData[] = Object.entries(branchStats).map(([branchId, stats]) => {
        const uniqueEmployees = stats.employees.size;
        const totalPunches = stats.totalPunches;
        const totalEntries = stats.onTimePunches + stats.latePunches;
        
        return {
          branchId,
          branchName: stats.branchName,
          totalPunches,
          uniqueEmployees,
          averagePunchesPerEmployee: uniqueEmployees > 0 ? totalPunches / uniqueEmployees : 0,
          onTimePercentage: totalEntries > 0 ? (stats.onTimePunches / totalEntries) * 100 : 0,
          latePercentage: totalEntries > 0 ? (stats.latePunches / totalEntries) * 100 : 0
        };
      });

      setProductivityData(productivity);

      // Calcular estatísticas gerais
      const totalPunches = productivity.reduce((sum, branch) => sum + branch.totalPunches, 0);
      const totalEmployees = productivity.reduce((sum, branch) => sum + branch.uniqueEmployees, 0);
      const averageProductivity = productivity.length > 0 
        ? productivity.reduce((sum, branch) => sum + branch.averagePunchesPerEmployee, 0) / productivity.length 
        : 0;
      
      const bestBranch = productivity.length > 0
        ? productivity.reduce((best, current) => 
            current.averagePunchesPerEmployee > best.averagePunchesPerEmployee ? current : best
          ).branchName
        : '';

      setStats({
        totalPunches,
        totalEmployees,
        averageProductivity,
        bestBranch
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                <p className="text-gray-600">Análise de produtividade por filial e funcionário</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="thisWeek">Esta semana</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as filiais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as filiais</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Registros</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPunches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funcionários Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Média por Funcionário</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageProductivity.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Melhor Filial</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{stats.bestBranch || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dados por Filial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : productivityData.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Nenhum dado de produtividade encontrado para o período selecionado
              </p>
            </div>
          ) : (
            productivityData.map((branch) => (
              <Card key={branch.branchId} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {branch.branchName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total de Registros</p>
                      <p className="text-xl font-bold text-blue-600">{branch.totalPunches}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Funcionários</p>
                      <p className="text-xl font-bold text-green-600">{branch.uniqueEmployees}</p>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Média por Funcionário</p>
                    <p className="text-xl font-bold text-purple-600">
                      {branch.averagePunchesPerEmployee.toFixed(1)} registros
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pontualidade</span>
                      <span className="text-sm font-semibold text-green-600">
                        {branch.onTimePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${branch.onTimePercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Atrasos</span>
                      <span className="text-sm font-semibold text-red-600">
                        {branch.latePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${branch.latePercentage}%` }}
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

export default ProductivityReport;