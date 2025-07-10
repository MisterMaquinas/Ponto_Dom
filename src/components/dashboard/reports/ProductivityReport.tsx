import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, TrendingUp, Clock, Calendar } from 'lucide-react';

interface ProductivityReportProps {
  onBack: () => void;
}

const ProductivityReport = ({ onBack }: ProductivityReportProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchProductivityData();
  }, [timeFrame]);

  const fetchProductivityData = async () => {
    try {
      const daysBack = timeFrame === 'week' ? 7 : 30;
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
      
      const { data: punchRecords, error } = await supabase
        .from('employee_punch_records')
        .select(`
          *,
          employees(name, position, custom_position, branches(name, companies(name)))
        `)
        .gte('timestamp', startDate.toISOString());

      if (error) throw error;

      // Agrupar dados por funcionário
      const groupedData = punchRecords?.reduce((acc: any, record: any) => {
        const employeeId = record.employee_id;
        if (!acc[employeeId]) {
          acc[employeeId] = {
            employee: record.employees,
            totalPunches: 0,
            daysWorked: new Set(),
            averageConfidence: 0,
            confidenceSum: 0,
            confidenceCount: 0,
          };
        }
        
        acc[employeeId].totalPunches++;
        acc[employeeId].daysWorked.add(
          new Date(record.timestamp).toDateString()
        );
        
        if (record.face_confidence) {
          acc[employeeId].confidenceSum += record.face_confidence;
          acc[employeeId].confidenceCount++;
        }
        
        return acc;
      }, {});

      // Converter para array e calcular médias
      const productivityData = Object.values(groupedData || {}).map((item: any) => ({
        ...item,
        daysWorked: item.daysWorked.size,
        averageConfidence: item.confidenceCount > 0 
          ? (item.confidenceSum / item.confidenceCount).toFixed(1)
          : 0,
        punchesPerDay: (item.totalPunches / item.daysWorked.size).toFixed(1),
      }));

      // Ordenar por total de pontos
      productivityData.sort((a: any, b: any) => b.totalPunches - a.totalPunches);
      
      setData(productivityData);
    } catch (error) {
      console.error('Erro ao buscar dados de produtividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const totalPunches = data.reduce((sum, item) => sum + item.totalPunches, 0);
    const totalDaysWorked = data.reduce((sum, item) => sum + item.daysWorked, 0);
    const avgConfidence = data.length > 0 
      ? (data.reduce((sum, item) => sum + parseFloat(item.averageConfidence), 0) / data.length).toFixed(1)
      : 0;
    
    return { totalPunches, totalDaysWorked, avgConfidence };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            ← Voltar aos Relatórios
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatório de Produtividade</h1>
              <p className="text-gray-600">Análise de produtividade por funcionário</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={timeFrame === 'week' ? 'default' : 'outline'}
                onClick={() => setTimeFrame('week')}
              >
                Última Semana
              </Button>
              <Button 
                variant={timeFrame === 'month' ? 'default' : 'outline'}
                onClick={() => setTimeFrame('month')}
              >
                Último Mês
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Pontos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalPunches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Dias Trabalhados</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalDaysWorked}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Confiança Média</p>
                  <p className="text-2xl font-bold text-green-600">{stats.avgConfidence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Funcionários Ativos</p>
                  <p className="text-2xl font-bold text-orange-600">{data.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Produtividade por Funcionário ({timeFrame === 'week' ? 'Última Semana' : 'Último Mês'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Filial</TableHead>
                    <TableHead>Total Pontos</TableHead>
                    <TableHead>Dias Trabalhados</TableHead>
                    <TableHead>Pontos/Dia</TableHead>
                    <TableHead>Confiança Média</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => {
                    const performance = parseFloat(item.punchesPerDay);
                    let performanceColor = 'bg-gray-100 text-gray-800';
                    let performanceText = 'Regular';
                    
                    if (performance >= 2) {
                      performanceColor = 'bg-green-100 text-green-800';
                      performanceText = 'Excelente';
                    } else if (performance >= 1.5) {
                      performanceColor = 'bg-blue-100 text-blue-800';
                      performanceText = 'Boa';
                    } else if (performance >= 1) {
                      performanceColor = 'bg-yellow-100 text-yellow-800';
                      performanceText = 'Média';
                    } else {
                      performanceColor = 'bg-red-100 text-red-800';
                      performanceText = 'Baixa';
                    }

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.employee?.name}</TableCell>
                        <TableCell>{item.employee?.custom_position || item.employee?.position}</TableCell>
                        <TableCell>
                          {item.employee?.branches?.name}
                          <br />
                          <span className="text-xs text-gray-500">
                            {item.employee?.branches?.companies?.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {item.totalPunches}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{item.daysWorked}</TableCell>
                        <TableCell className="text-center">{item.punchesPerDay}</TableCell>
                        <TableCell className="text-center">
                          {item.averageConfidence > 0 ? `${item.averageConfidence}%` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-sm ${performanceColor}`}>
                            {performanceText}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductivityReport;