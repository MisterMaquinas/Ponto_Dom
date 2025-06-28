
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Download, Filter, Clock, Users, Eye } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PunchRecordsTable from './reports/PunchRecordsTable';
import ReportsStats from './reports/ReportsStats';
import BiometricVerificationTable from './reports/BiometricVerificationTable';

interface ReportsProps {
  userData: any;
}

const Reports = ({ userData }: ReportsProps) => {
  const [punchRecords, setPunchRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'punch' | 'biometric'>('punch');

  useEffect(() => {
    if (activeTab === 'punch') {
      loadPunchRecords();
    }
  }, [userData.companyId, dateFilter, activeTab]);

  const loadPunchRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('punch_records')
        .select(`
          *,
          users!inner(name, company_id)
        `)
        .eq('users.company_id', userData.companyId)
        .gte('timestamp', `${dateFilter}T00:00:00`)
        .lte('timestamp', `${dateFilter}T23:59:59`)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Processar dados para o formato esperado
      const processedRecords = data.map(record => ({
        id: record.id,
        user_id: record.user_id,
        name: record.users.name,
        date: record.timestamp.split('T')[0],
        entry_time: new Date(record.timestamp).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        exit_time: undefined, // Implementar lógica de saída depois
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

  const exportData = () => {
    // Implementar exportação
    toast({
      title: "Exportação",
      description: "Funcionalidade de exportação será implementada em breve",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Empresa: {userData.companyName}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto"
              />
            </div>
            <Button onClick={exportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('punch')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'punch'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Registros de Ponto
              </div>
            </button>
            <button
              onClick={() => setActiveTab('biometric')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'biometric'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Verificações Biométricas
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'punch' ? (
            <>
              <ReportsStats punchRecords={punchRecords} />
              <div className="mt-8">
                <PunchRecordsTable 
                  punchRecords={punchRecords}
                  loading={loading}
                  onExport={exportData}
                />
              </div>
            </>
          ) : (
            <BiometricVerificationTable companyId={userData.companyId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
