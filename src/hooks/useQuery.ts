// =====================================
// SISTEMA DE CACHE E QUERIES OTIMIZADO
// =====================================

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ApiResponse, PaginatedResponse, UnifiedPunchRecord, ReportStats, Employee, User } from '@/types';
import { ErrorHandler, type AppError } from '@/utils/errorHandler';
import { CACHE_KEYS, REPORT_CACHE_DURATION } from '@/utils/constants';
import { generateCacheKey, isCacheExpired } from '@/utils/helpers';

// =====================================
// CONFIGURAÇÃO DE CACHE
// =====================================

export const QUERY_KEYS = {
  // Usuários e autenticação
  USERS: 'users',
  USER_BY_ID: 'user',
  CURRENT_USER: 'currentUser',
  
  // Empresas e filiais
  COMPANIES: 'companies',
  COMPANY_BY_ID: 'company',
  BRANCHES: 'branches',
  BRANCH_BY_ID: 'branch',
  
  // Funcionários
  EMPLOYEES: 'employees',
  EMPLOYEE_BY_ID: 'employee',
  EMPLOYEES_BY_BRANCH: 'employeesByBranch',
  
  // Registros de ponto
  PUNCH_RECORDS: 'punchRecords',
  UNIFIED_PUNCH_RECORDS: 'unifiedPunchRecords',
  EMPLOYEE_PUNCH_RECORDS: 'employeePunchRecords',
  
  // Relatórios e estatísticas
  REPORT_STATS: 'reportStats',
  PUNCH_RECORDS_FILTERED: 'punchRecordsFiltered',
  EMPLOYEE_REPORT: 'employeeReport',
  PRODUCTIVITY_REPORT: 'productivityReport',
  
  // Biometria
  BIOMETRIC_LOGS: 'biometricLogs',
  FACE_RECOGNITION_LOGS: 'faceRecognitionLogs',
  USER_BIOMETRIC_PHOTOS: 'userBiometricPhotos'
} as const;

export const STALE_TIME = {
  SHORT: 2 * 60 * 1000,    // 2 minutos
  MEDIUM: 5 * 60 * 1000,   // 5 minutos
  LONG: 15 * 60 * 1000,    // 15 minutos
  VERY_LONG: 60 * 60 * 1000 // 1 hora
} as const;

// =====================================
// HOOKS DE USUÁRIOS
// =====================================

export const useUsers = (companyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, companyId],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;
      return (data || []) as User[];
    },
    staleTime: STALE_TIME.MEDIUM,
    enabled: !!companyId
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_BY_ID, userId],
    queryFn: async (): Promise<User> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as User;
    },
    staleTime: STALE_TIME.LONG,
    enabled: !!userId
  });
};

// =====================================
// HOOKS DE FUNCIONÁRIOS
// =====================================

export const useEmployees = (branchId?: string, companyId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES, { branchId, companyId }],
    queryFn: async (): Promise<Employee[]> => {
      let query = supabase
        .from('employees')
        .select(`
          *,
          branches!inner(company_id, name)
        `)
        .eq('is_active', true)
        .order('name');

      if (branchId) {
        query = query.eq('branch_id', branchId);
      } else if (companyId) {
        query = query.eq('branches.company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: STALE_TIME.MEDIUM,
    enabled: !!(branchId || companyId)
  });
};

export const useEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEE_BY_ID, employeeId],
    queryFn: async (): Promise<Employee> => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          branches(*)
        `)
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME.LONG,
    enabled: !!employeeId
  });
};

// =====================================
// HOOKS DE REGISTROS DE PONTO
// =====================================

interface PunchRecordsFilters {
  companyId: string;
  dateFrom?: string;
  dateTo?: string;
  employeeName?: string;
  punchType?: string;
  branchId?: string;
}

export const useUnifiedPunchRecords = (filters: PunchRecordsFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.UNIFIED_PUNCH_RECORDS, filters],
    queryFn: async (): Promise<UnifiedPunchRecord[]> => {
      // Verificar cache primeiro
      const cacheKey = generateCacheKey('punch_records', filters);
      const { data: cachedData } = await supabase
        .from('report_cache')
        .select('data, expires_at')
        .eq('cache_key', cacheKey)
        .eq('company_id', filters.companyId)
        .single();

      if (cachedData && !isCacheExpired(cachedData.expires_at, REPORT_CACHE_DURATION.PUNCH_RECORDS)) {
        return cachedData.data as unknown as UnifiedPunchRecord[];
      }

      // Buscar dados da view unificada
      let query = supabase
        .from('unified_punch_records')
        .select('*')
        .eq('company_id', filters.companyId)
        .order('timestamp', { ascending: false });

      if (filters.dateFrom) {
        query = query.gte('timestamp', `${filters.dateFrom}T00:00:00`);
      }

      if (filters.dateTo) {
        query = query.lte('timestamp', `${filters.dateTo}T23:59:59`);
      }

      if (filters.employeeName) {
        query = query.ilike('employee_name', `%${filters.employeeName}%`);
      }

      if (filters.punchType && filters.punchType !== 'todos') {
        query = query.eq('punch_type', filters.punchType);
      }

      if (filters.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }

      const { data, error } = await query.limit(1000);
      if (error) throw error;

      // Salvar no cache
      const expiresAt = new Date(Date.now() + REPORT_CACHE_DURATION.PUNCH_RECORDS);
      await supabase
        .from('report_cache')
        .upsert({
          cache_key: cacheKey,
          company_id: filters.companyId,
          report_type: 'punch_records',
          filters: filters as any,
          data: data as any,
          expires_at: expiresAt.toISOString()
        });

      return (data || []) as UnifiedPunchRecord[];
    },
    staleTime: STALE_TIME.SHORT,
    enabled: !!filters.companyId
  });
};

// =====================================
// HOOKS DE RELATÓRIOS E ESTATÍSTICAS
// =====================================

export const useReportStats = (companyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORT_STATS, companyId],
    queryFn: async (): Promise<ReportStats> => {
      // Verificar cache
      const cacheKey = generateCacheKey('report_stats', { companyId });
      const { data: cachedData } = await supabase
        .from('report_cache')
        .select('data, expires_at')
        .eq('cache_key', cacheKey)
        .eq('company_id', companyId)
        .single();

      if (cachedData && !isCacheExpired(cachedData.expires_at, REPORT_CACHE_DURATION.STATS)) {
        return cachedData.data as unknown as ReportStats;
      }

      // Buscar dados atuais
      const today = new Date().toISOString().split('T')[0];

      // Total de funcionários
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          branches!inner(company_id)
        `)
        .eq('branches.company_id', companyId)
        .eq('is_active', true);

      if (employeesError) throw employeesError;

      // Entradas de hoje
      const { data: todayEntries, error: entriesError } = await supabase
        .from('employee_punch_records')
        .select(`
          employee_id,
          employees!inner(
            branches!inner(company_id)
          )
        `)
        .eq('employees.branches.company_id', companyId)
        .eq('punch_type', 'entrada')
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`);

      if (entriesError) throw entriesError;

      // Registros totais de hoje
      const { data: todayRecords, error: recordsError } = await supabase
        .from('unified_punch_records')
        .select('id')
        .eq('company_id', companyId)
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`);

      if (recordsError) throw recordsError;

      const totalEmployees = (employees || []).length;
      const uniqueEmployeesWithEntry = new Set(
        (todayEntries || []).map(record => record.employee_id)
      ).size;

      const stats: ReportStats = {
        totalEmployees,
        employeesWithEntry: uniqueEmployeesWithEntry,
        employeesWithoutEntry: totalEmployees - uniqueEmployeesWithEntry,
        todayRecords: (todayRecords || []).length,
        totalPunchRecords: 0 // Será calculado se necessário
      };

      // Salvar no cache
      const expiresAt = new Date(Date.now() + REPORT_CACHE_DURATION.STATS);
      await supabase
        .from('report_cache')
        .upsert({
          cache_key: cacheKey,
          company_id: companyId,
          report_type: 'stats',
          filters: { companyId } as any,
          data: stats as any,
          expires_at: expiresAt.toISOString()
        });

      return stats;
    },
    staleTime: STALE_TIME.SHORT,
    enabled: !!companyId
  });
};

// =====================================
// HOOKS DE BIOMETRIA
// =====================================

export const useBiometricLogs = (companyId: string, filters?: any) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BIOMETRIC_LOGS, companyId, filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('biometric_verification_logs')
        .select(`
          *,
          users!inner(name, company_id)
        `)
        .eq('users.company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    staleTime: STALE_TIME.MEDIUM,
    enabled: !!companyId
  });
};

// =====================================
// HOOKS DE MUTAÇÃO
// =====================================

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeData: any) => {
      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES_BY_BRANCH, data.branch_id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORT_STATS] });
    },
    onError: (error) => {
      ErrorHandler.handle(error, 'Create Employee');
    }
  });
};

export const useCreatePunchRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (punchData: any) => {
      const { data, error } = await supabase
        .from('employee_punch_records')
        .insert([punchData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar caches de registros de ponto
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PUNCH_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UNIFIED_PUNCH_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEE_PUNCH_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORT_STATS] });

      // Limpar cache manual
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.REPORT_STATS] });
    },
    onError: (error) => {
      ErrorHandler.handle(error, 'Create Punch Record');
    }
  });
};

// =====================================
// HOOK PARA LIMPEZA DE CACHE
// =====================================

export const useCacheManagement = () => {
  const queryClient = useQueryClient();

  const clearCache = (keys?: string[]) => {
    if (keys) {
      keys.forEach(key => {
        queryClient.removeQueries({ queryKey: [key] });
      });
    } else {
      queryClient.clear();
    }
  };

  const invalidateQueries = (keys: string[]) => {
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };

  const prefetchQuery = async (key: string[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: key,
      queryFn
    });
  };

  return {
    clearCache,
    invalidateQueries,
    prefetchQuery
  };
};

// =====================================
// PROVIDER CUSTOMIZADO
// =====================================

export { useQuery, useMutation, useQueryClient };