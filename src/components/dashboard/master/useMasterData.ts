
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface CompanyStats {
  totalCompanies: number;
  totalAdmins: number;
  totalEmployees: number;
  totalUsers: number;
  activeCompanies: number;
}

interface Company {
  id: string;
  name: string;
  created_at: string;
  admin_name: string;
  admin_username: string;
  employee_count: number;
  status: 'Ativa' | 'Inativa';
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
        .select('id, name, username, company_id')
        .eq('role', 'admin');

      if (adminsError) {
        console.error('Erro ao carregar admins:', adminsError);
      }

      // Carregar contagem total de funcionários por empresa
      const { data: employeeData, error: employeeError } = await supabase
        .from('users')
        .select('company_id, role')
        .neq('role', 'admin');

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
        const employeeCount = (employeeData || []).filter(emp => emp.company_id === company.id).length;
        
        return {
          id: company.id,
          name: company.name,
          created_at: company.created_at,
          admin_name: admin?.name || 'N/A',
          admin_username: admin?.username || 'N/A',
          employee_count: employeeCount,
          status: 'Ativa' as const
        };
      });

      setCompanies(processedCompanies);

      // Calcular estatísticas
      const totalEmployees = (employeeData || []).length;
      const totalUsers = (allUsersData || []).length;
      const newStats: CompanyStats = {
        totalCompanies: processedCompanies.length,
        totalAdmins: processedCompanies.length,
        totalEmployees: totalEmployees,
        totalUsers: totalUsers,
        activeCompanies: processedCompanies.length
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
