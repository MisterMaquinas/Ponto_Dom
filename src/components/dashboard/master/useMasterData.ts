
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface CompanyStats {
  totalCompanies: number;
  totalAdmins: number;
  totalEmployees: number;
  totalUsers: number;
  activeCompanies: number;
  totalBranches?: number;
}

interface Company {
  id: string;
  name: string;
  created_at: string;
  admin_name: string;
  admin_username: string;
  employee_count: number;
  status: 'Ativa' | 'Inativa';
  branch_count?: number;
}

export const useMasterData = () => {
  const [stats, setStats] = useState<CompanyStats>({
    totalCompanies: 0,
    totalAdmins: 0,
    totalEmployees: 0,
    totalUsers: 0,
    activeCompanies: 0
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar empresas com seus administradores
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          created_at
        `);

      if (companiesError) {
        console.error('Erro ao carregar empresas:', companiesError);
        setCompanies([]);
        setStats({
          totalCompanies: 0,
          totalAdmins: 0,
          totalEmployees: 0,
          totalUsers: 0,
          activeCompanies: 0
        });
        return;
      }

      // Carregar administradores separadamente
      const { data: adminsData, error: adminsError } = await supabase
        .from('users')
        .select('id, name, username, company_id, is_admin')
        .eq('is_admin', true);

      if (adminsError) {
        console.error('Erro ao carregar admins:', adminsError);
      }

      // Carregar contagem de filiais
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id, company_id');

      if (branchesError) {
        console.error('Erro ao carregar filiais:', branchesError);
      }

      // Carregar contagem total de funcionários por empresa
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id, branch_id');

      if (employeeError) {
        console.error('Erro ao carregar funcionários:', employeeError);
      }

      // Carregar contagem total de usuários
      const { data: allUsersData, error: allUsersError } = await supabase
        .from('users')
        .select('id');

      if (allUsersError) {
        console.error('Erro ao carregar total de usuários:', allUsersError);
      }

      // Processar dados das empresas
      const processedCompanies: Company[] = (companiesData || []).map(company => {
        const admin = (adminsData || []).find(admin => admin.company_id === company.id);
        
        // Contar filiais da empresa
        const companyBranches = (branchesData || []).filter(branch => branch.company_id === company.id);
        const branchIds = companyBranches.map(branch => branch.id);
        
        // Contar funcionários de todas as filiais da empresa
        const employeeCount = (employeeData || []).filter(emp => branchIds.includes(emp.branch_id)).length;
        
        return {
          id: company.id,
          name: company.name,
          created_at: company.created_at,
          admin_name: admin?.name || 'N/A',
          admin_username: admin?.username || 'N/A',
          employee_count: employeeCount,
          branch_count: companyBranches.length,
          status: 'Ativa' as const
        };
      });

      setCompanies(processedCompanies);

      // Calcular estatísticas
      const totalEmployees = (employeeData || []).length;
      const totalUsers = (allUsersData || []).length;
      const totalBranches = (branchesData || []).length;
      const newStats: CompanyStats = {
        totalCompanies: processedCompanies.length,
        totalAdmins: (adminsData || []).length,
        totalEmployees: totalEmployees,
        totalUsers: totalUsers,
        activeCompanies: processedCompanies.length,
        totalBranches: totalBranches
      };

      setStats(newStats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setCompanies([]);
      setStats({
        totalCompanies: 0,
        totalAdmins: 0,
        totalEmployees: 0,
        totalUsers: 0,
        activeCompanies: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    stats,
    companies,
    loading,
    loadData
  };
};
