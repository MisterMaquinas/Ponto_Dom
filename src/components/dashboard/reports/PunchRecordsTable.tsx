
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Download, User, Eye, FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import PunchRecordsFilters from './PunchRecordsFilters';

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
  employee_schedule?: {
    work_start_time?: string | null;
    work_end_time?: string | null;
    break_start_time?: string | null;
    break_end_time?: string | null;
  };
}

interface PunchRecordsTableProps {
  companyId?: string;
}

const PunchRecordsTable = ({ companyId }: PunchRecordsTableProps) => {
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PunchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Filtros
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedPunchType, setSelectedPunchType] = useState('todos');
  const [selectedTimeRange, setSelectedTimeRange] = useState('hoje');

  useEffect(() => {
    if (companyId) {
      loadPunchRecords();
    }
  }, [companyId]);

  useEffect(() => {
    // Aplicar filtros automaticamente
    applyFilters();
  }, [punchRecords, dateFrom, dateTo, selectedEmployee, selectedPunchType, selectedTimeRange]);

  useEffect(() => {
    // Definir datas baseadas no período selecionado
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (selectedTimeRange) {
      case 'hoje':
        setDateFrom(todayStr);
        setDateTo(todayStr);
        break;
      case 'ontem':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        setDateFrom(yesterdayStr);
        setDateTo(yesterdayStr);
        break;
      case 'semana':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        setDateFrom(startOfWeek.toISOString().split('T')[0]);
        setDateTo(todayStr);
        break;
      case 'mes':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateFrom(startOfMonth.toISOString().split('T')[0]);
        setDateTo(todayStr);
        break;
      case 'personalizado':
        // Manter datas atuais para período personalizado
        break;
    }
  }, [selectedTimeRange]);

  const loadPunchRecords = async () => {
    try {
      console.log('Loading punch records for companyId:', companyId);
      
      const { data: userPunchRecords, error: userError } = await supabase
        .from('punch_records')
        .select('*')
        .order('timestamp', { ascending: false });

      if (userError) throw userError;

      const { data: employeePunchRecords, error: employeeError } = await supabase
        .from('employee_punch_records')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Employee punch records:', employeePunchRecords);
      console.log('Employee error:', employeeError);

      if (employeeError) throw employeeError;

      const normalizedUserRecords = (userPunchRecords || []).map((record: any) => ({
        id: record.id,
        user_id: record.user_id,
        punch_type: record.punch_type,
        timestamp: record.timestamp,
        confidence_score: record.confidence_score,
        face_image_url: undefined,
        users: {
          name: record.user_id
        }
      }));

      const normalizedEmployeeRecords = (employeePunchRecords || []).map((record: any) => ({
        id: record.id,
        user_id: record.employee_id,
        punch_type: record.punch_type,
        timestamp: record.created_at,
        confidence_score: record.face_confidence,
        face_image_url: record.photo_url,
        users: {
          name: record.employee_id
        },
        employee_schedule: undefined
      }));

      // Combinar todos os registros e ordenar por timestamp
      const allRecords = [...normalizedUserRecords, ...normalizedEmployeeRecords]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setPunchRecords(allRecords);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...punchRecords];

    // Filtro por data
    if (dateFrom) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
        return recordDate >= dateFrom;
      });
    }

    if (dateTo) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
        return recordDate <= dateTo;
      });
    }

    // Filtro por funcionário
    if (selectedEmployee.trim()) {
      filtered = filtered.filter(record =>
        record.users.name.toLowerCase().includes(selectedEmployee.toLowerCase())
      );
    }

    // Filtro por tipo de registro
    if (selectedPunchType !== 'todos') {
      filtered = filtered.filter(record => record.punch_type === selectedPunchType);
    }

    setFilteredRecords(filtered);
  };

  const handleSearch = () => {
    applyFilters();
    toast({
      title: "Filtros aplicados",
      description: `${filteredRecords.length} registros encontrados.`,
    });
  };

  const handleClearFilters = () => {
    setSelectedEmployee('');
    setSelectedPunchType('todos');
    setSelectedTimeRange('hoje');
    setDateFrom('');
    setDateTo('');
  };

  const handleExport = () => {
    try {
      const csvHeaders = ['Nome', 'Data/Hora', 'Tipo', 'Confiança (%)'];
      const csvData = filteredRecords.map(record => [
        record.users.name,
        new Date(record.timestamp).toLocaleString('pt-BR'),
        record.punch_type === 'entrada' || record.punch_type === 'entry' || record.punch_type === 'clock_in' ? 'Entrada' :
        record.punch_type === 'saida' || record.punch_type === 'exit' || record.punch_type === 'clock_out' ? 'Saída' :
        record.punch_type === 'intervalo_inicio' || record.punch_type === 'break_start' ? 'Início Intervalo' :
        record.punch_type === 'intervalo_fim' || record.punch_type === 'break_end' ? 'Fim Intervalo' : record.punch_type,
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
    const isHighConfidence = confidence && confidence > 0.9;
    
    switch (punchType) {
      case 'entrada':
      case 'entry':
      case 'clock_in':
        return (
          <div className="flex items-center gap-2">
            <Badge className={`${isHighConfidence ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'}`}>
              Entrada
            </Badge>
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        );
      case 'saida':
      case 'exit':
      case 'clock_out':
        return (
          <div className="flex items-center gap-2">
            <Badge className={`${isHighConfidence ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'}`}>
              Saída
            </Badge>
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        );
      case 'intervalo_inicio':
      case 'break_start':
        return (
          <div className="flex items-center gap-2">
            <Badge className={`${isHighConfidence ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}>
              Início Intervalo
            </Badge>
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        );
      case 'intervalo_fim':
      case 'break_end':
        return (
          <div className="flex items-center gap-2">
            <Badge className={`${isHighConfidence ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-800'}`}>
              Fim Intervalo
            </Badge>
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {punchType}
            </Badge>
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        );
    }
  };

  const isLate = (timestamp: string, punchType: string, employeeSchedule?: {
    work_start_time?: string | null;
    work_end_time?: string | null;
    break_start_time?: string | null;
    break_end_time?: string | null;
  }) => {
    // Se não há dados de horário do funcionário, não pode determinar atraso
    if (!employeeSchedule?.work_start_time) return false;
    
    const punchTime = new Date(timestamp);
    const punchHour = punchTime.getHours();
    const punchMinute = punchTime.getMinutes();
    
    // Converter horário de trabalho para horas e minutos
    const [workStartHour, workStartMinute] = employeeSchedule.work_start_time.split(':').map(Number);
    
    // Verificar atraso apenas para entrada
    if (punchType === 'entrada' || punchType === 'entry' || punchType === 'clock_in') {
      const punchTimeInMinutes = punchHour * 60 + punchMinute;
      const workStartTimeInMinutes = workStartHour * 60 + workStartMinute;
      
      return punchTimeInMinutes > workStartTimeInMinutes;
    }
    
    // Para outros tipos de ponto, não considera atraso por enquanto
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <PunchRecordsFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        selectedEmployee={selectedEmployee}
        selectedPunchType={selectedPunchType}
        selectedTimeRange={selectedTimeRange}
        loading={loading}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onEmployeeChange={setSelectedEmployee}
        onPunchTypeChange={setSelectedPunchType}
        onTimeRangeChange={setSelectedTimeRange}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      {/* Tabela de registros */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Registros de Ponto ({filteredRecords.length})
            </CardTitle>
            <Button 
              onClick={handleExport} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={filteredRecords.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar ({filteredRecords.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando registros...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {punchRecords.length === 0 
                  ? "Nenhum registro de ponto encontrado." 
                  : "Nenhum registro encontrado com os filtros aplicados."
                }
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {punchRecords.length === 0 
                  ? "Os registros aparecerão aqui quando os funcionários começarem a bater ponto."
                  : "Tente ajustar os filtros para encontrar os registros desejados."
                }
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
                  {filteredRecords.map((record) => (
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
                        {record.employee_schedule?.work_start_time ? (
                          isLate(record.timestamp, record.punch_type, record.employee_schedule) ? (
                            <Badge variant="destructive">Atrasado</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">No Horário</Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-gray-500">-</Badge>
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
    </div>
  );
};

export default PunchRecordsTable;
