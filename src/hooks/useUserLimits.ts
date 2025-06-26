
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface UserCounts {
  admin: number;
  manager: number;
  supervisor: number;
  user: number;
}

interface CompanyLimits {
  max_admins: number;
  max_managers: number;
  max_supervisors: number;
  max_users: number;
}

export const useUserLimits = (companyId: string) => {
  const [userCounts, setUserCounts] = useState<UserCounts>({
    admin: 0,
    manager: 0,
    supervisor: 0,
    user: 0
  });
  
  const [companyLimits, setCompanyLimits] = useState<CompanyLimits>({
    max_admins: 1,
    max_managers: 5,
    max_supervisors: 10,
    max_users: 50
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadLimitsAndCounts();
    }
  }, [companyId]);

  const loadLimitsAndCounts = async () => {
    try {
      setLoading(true);

      // Buscar limites da empresa
      const { data: limitsData, error: limitsError } = await supabase
        .from('company_limits')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (limitsError && limitsError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao carregar limites:', limitsError);
      } else if (limitsData) {
        setCompanyLimits({
          max_admins: limitsData.max_admins,
          max_managers: limitsData.max_managers,
          max_supervisors: limitsData.max_supervisors,
          max_users: limitsData.max_users
        });
      }

      // Contar usuários atuais por role
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('role')
        .eq('company_id', companyId);

      if (usersError) {
        console.error('Erro ao carregar usuários:', usersError);
      } else if (usersData) {
        const counts = usersData.reduce((acc, user) => {
          acc[user.role as keyof UserCounts] = (acc[user.role as keyof UserCounts] || 0) + 1;
          return acc;
        }, { admin: 0, manager: 0, supervisor: 0, user: 0 });

        setUserCounts(counts);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateUser = (role: string): boolean => {
    switch (role) {
      case 'admin':
        return userCounts.admin < companyLimits.max_admins;
      case 'manager':
        return userCounts.manager < companyLimits.max_managers;
      case 'supervisor':
        return userCounts.supervisor < companyLimits.max_supervisors;
      case 'user':
        return userCounts.user < companyLimits.max_users;
      default:
        return true;
    }
  };

  const getRemainingSlots = (role: string): number => {
    switch (role) {
      case 'admin':
        return Math.max(0, companyLimits.max_admins - userCounts.admin);
      case 'manager':
        return Math.max(0, companyLimits.max_managers - userCounts.manager);
      case 'supervisor':
        return Math.max(0, companyLimits.max_supervisors - userCounts.supervisor);
      case 'user':
        return Math.max(0, companyLimits.max_users - userCounts.user);
      default:
        return 999;
    }
  };

  const getLimitMessage = (role: string): string => {
    const remaining = getRemainingSlots(role);
    const current = userCounts[role as keyof UserCounts] || 0;
    
    switch (role) {
      case 'admin':
        return `${current}/${companyLimits.max_admins} administradores (${remaining} restantes)`;
      case 'manager':
        return `${current}/${companyLimits.max_managers} gerentes (${remaining} restantes)`;
      case 'supervisor':
        return `${current}/${companyLimits.max_supervisors} supervisores (${remaining} restantes)`;
      case 'user':
        return `${current}/${companyLimits.max_users} usuários (${remaining} restantes)`;
      default:
        return '';
    }
  };

  return {
    userCounts,
    companyLimits,
    loading,
    canCreateUser,
    getRemainingSlots,
    getLimitMessage,
    refreshData: loadLimitsAndCounts
  };
};
