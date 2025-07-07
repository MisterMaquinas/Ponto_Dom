import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyData = (companyId: string) => {
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalEmployees: 0,
    activeBranches: 0
  });
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar filiais da empresa
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select(`
          *,
          employees!employees_branch_id_fkey(id)
        `)
        .eq('company_id', companyId)
        .order('name');

      if (branchesError) throw branchesError;

      // Calcular estatísticas
      const totalBranches = branchesData?.length || 0;
      const activeBranches = branchesData?.filter(b => b.is_active).length || 0;
      
      // Contar funcionários de todas as filiais
      let totalEmployees = 0;
      const branchesWithEmployeeCount = branchesData?.map(branch => {
        const employeeCount = branch.employees?.length || 0;
        totalEmployees += employeeCount;
        return {
          ...branch,
          employee_count: employeeCount
        };
      }) || [];

      setStats({
        totalBranches,
        totalEmployees,
        activeBranches
      });

      setBranches(branchesWithEmployeeCount);

    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  return {
    stats,
    branches,
    loading,
    loadData
  };
};