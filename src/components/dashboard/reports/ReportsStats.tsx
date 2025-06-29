
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ReportsStatsProps {
  companyId: string;
}

const ReportsStats = ({ companyId }: ReportsStatsProps) => {
  const [stats, setStats] = useState({
    totalRecords: 0,
    successfulRecognitions: 0,
    highConfidenceCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [companyId]);

  const loadStats = async () => {
    try {
      // Buscar registros de ponto da empresa
      const { data: punchRecords, error: punchError } = await supabase
        .from('punch_records')
        .select(`
          *,
          users!inner(company_id)
        `)
        .eq('users.company_id', companyId);

      if (punchError) throw punchError;

      // Buscar logs de verificação biométrica
      const { data: verificationLogs, error: verificationError } = await supabase
        .from('biometric_verification_logs')
        .select(`
          *,
          users!inner(company_id)
        `)
        .eq('users.company_id', companyId);

      if (verificationError) throw verificationError;

      const totalRecords = (punchRecords || []).length;
      const successfulRecognitions = (verificationLogs || []).filter(log => log.verification_result === 'success').length;
      const highConfidenceCount = (punchRecords || []).filter(r => r.confidence_score && r.confidence_score >= 0.9).length;

      setStats({
        totalRecords,
        successfulRecognitions,
        highConfidenceCount
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const recognitionRate = stats.totalRecords > 0 ? Math.round((stats.successfulRecognitions / stats.totalRecords) * 100) : 0;

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {loading ? '...' : `${recognitionRate}%`}
          </div>
          <div className="text-sm text-gray-600">Taxa de Reconhecimento</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {loading ? '...' : stats.totalRecords}
          </div>
          <div className="text-sm text-gray-600">Registros Hoje</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {loading ? '...' : stats.highConfidenceCount}
          </div>
          <div className="text-sm text-gray-600">Alta Confiança ({'>'}90%)</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsStats;
