
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ReportsStatsProps {
  companyId: string;
}

const ReportsStats = ({ companyId }: ReportsStatsProps) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    employeesWithEntry: 0,
    employeesWithoutEntry: 0,
    todayRecords: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [companyId]);

  const loadStats = async () => {
    try {
      // Buscar todos os funcionários da empresa
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          name,
          branches!inner(company_id)
        `)
        .eq('branches.company_id', companyId)
        .eq('is_active', true);

      if (employeesError) throw employeesError;

      const totalEmployees = (employees || []).length;

      // Buscar registros de entrada de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayEntries, error: entriesError } = await supabase
        .from('employee_punch_records')
        .select(`
          employee_id,
          punch_type,
          timestamp,
          employees!inner(
            branches!inner(company_id)
          )
        `)
        .eq('employees.branches.company_id', companyId)
        .eq('punch_type', 'entrada')
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`);

      if (entriesError) throw entriesError;

      // Contar funcionários únicos que fizeram entrada hoje
      const uniqueEmployeesWithEntry = new Set(
        (todayEntries || []).map(record => record.employee_id)
      ).size;

      // Buscar total de registros de hoje (para estatística geral)
      const { data: todayRecords, error: recordsError } = await supabase
        .from('employee_punch_records')
        .select(`
          id,
          employees!inner(
            branches!inner(company_id)
          )
        `)
        .eq('employees.branches.company_id', companyId)
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`);

      if (recordsError) throw recordsError;

      const employeesWithoutEntry = totalEmployees - uniqueEmployeesWithEntry;

      setStats({
        totalEmployees,
        employeesWithEntry: uniqueEmployeesWithEntry,
        employeesWithoutEntry,
        todayRecords: (todayRecords || []).length
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {loading ? '...' : stats.totalEmployees}
          </div>
          <div className="text-sm text-muted-foreground">Funcionários Cadastrados</div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {loading ? '...' : stats.employeesWithEntry}
          </div>
          <div className="text-sm text-muted-foreground">Fizeram Entrada Hoje</div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">
            {loading ? '...' : stats.employeesWithoutEntry}
          </div>
          <div className="text-sm text-muted-foreground">Não Registraram Entrada</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsStats;
