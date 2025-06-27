
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Camera } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FaceRecognitionHistory from './FaceRecognitionHistory';
import ReportsHeader from './reports/ReportsHeader';
import PunchRecordsFilters from './reports/PunchRecordsFilters';
import PunchRecordsTable from './reports/PunchRecordsTable';
import ReportsStats from './reports/ReportsStats';

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
      <ReportsHeader 
        onBack={onBack}
        onLogout={onLogout}
        userData={userData}
      />

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
            <PunchRecordsFilters
              dateFrom={dateFrom}
              dateTo={dateTo}
              selectedEmployee={selectedEmployee}
              loading={loading}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onEmployeeChange={setSelectedEmployee}
              onSearch={handleSearch}
            />

            <PunchRecordsTable
              punchRecords={punchRecords}
              loading={loading}
              onExport={exportPunchReport}
            />
          </TabsContent>

          <TabsContent value="face-recognition">
            <FaceRecognitionHistory 
              companyId={userData.companyId}
              showUserFilter={true}
            />
          </TabsContent>
        </Tabs>

        <ReportsStats punchRecords={punchRecords} />
      </div>
    </div>
  );
};

export default Reports;
