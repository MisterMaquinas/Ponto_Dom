// =====================================
// FUNÇÕES UTILITÁRIAS DO SISTEMA
// =====================================

import type { PunchType, UserRole, RecognitionStatus } from '@/types';
import { 
  PUNCH_TYPES, 
  PUNCH_TYPE_COLORS, 
  USER_ROLE_HIERARCHY,
  RECOGNITION_STATUS_MAP,
  RECOGNITION_STATUS_COLORS,
  BIOMETRIC_CONFIG,
  REGEX_PATTERNS
} from './constants';

// =====================================
// UTILITÁRIOS DE FORMATAÇÃO
// =====================================

/**
 * Formata uma data para o padrão brasileiro
 */
export const formatDate = (date: string | Date, includeTime = false): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
  }

  return dateObj.toLocaleDateString('pt-BR', options);
};

/**
 * Formata apenas o horário
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Horário inválido';
  }

  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
};

/**
 * Formata CPF
 */
export const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11) return cpf;
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata telefone
 */
export const formatPhone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

/**
 * Formata CEP
 */
export const formatZipCode = (zipCode: string): string => {
  const numbers = zipCode.replace(/\D/g, '');
  if (numbers.length === 8) {
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return zipCode;
};

/**
 * Formata porcentagem de confiança
 */
export const formatConfidence = (confidence: number): string => {
  if (isNaN(confidence) || confidence < 0 || confidence > 1) {
    return '0%';
  }
  return `${Math.round(confidence * 100)}%`;
};

// =====================================
// UTILITÁRIOS DE VALIDAÇÃO
// =====================================

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11 || /^(\d)\1{10}$/.test(numbers)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  return remainder === parseInt(numbers.charAt(10));
};

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

/**
 * Valida telefone
 */
export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Valida CEP
 */
export const validateZipCode = (zipCode: string): boolean => {
  const numbers = zipCode.replace(/\D/g, '');
  return numbers.length === 8;
};

/**
 * Valida confiança biométrica
 */
export const validateConfidence = (confidence: number): boolean => {
  return confidence >= BIOMETRIC_CONFIG.MIN_CONFIDENCE;
};

// =====================================
// UTILITÁRIOS DE PONTO
// =====================================

/**
 * Obtém o label do tipo de ponto
 */
export const getPunchTypeLabel = (type: PunchType): string => {
  return PUNCH_TYPES[type] || type;
};

/**
 * Obtém a cor do tipo de ponto
 */
export const getPunchTypeColor = (type: PunchType): string => {
  return PUNCH_TYPE_COLORS[type] || 'bg-gray-500 text-white';
};

/**
 * Verifica se o horário está atrasado
 */
export const isLate = (timestamp: string, punchType: PunchType, employeeSchedule?: {
  work_start_time?: string | null;
  work_end_time?: string | null;
  break_start_time?: string | null;
  break_end_time?: string | null;
}): boolean => {
  // Se não há dados de horário do funcionário, não pode determinar atraso
  if (!employeeSchedule?.work_start_time) return false;
  
  const punchTime = new Date(timestamp);
  const punchHour = punchTime.getHours();
  const punchMinute = punchTime.getMinutes();
  
  // Converter horário de trabalho para horas e minutos
  const [workStartHour, workStartMinute] = employeeSchedule.work_start_time.split(':').map(Number);
  
  // Verificar atraso apenas para entrada
  if (punchType === 'entrada') {
    const punchTimeInMinutes = punchHour * 60 + punchMinute;
    const workStartTimeInMinutes = workStartHour * 60 + workStartMinute;
    
    return punchTimeInMinutes > workStartTimeInMinutes;
  }
  
  // Para outros tipos de ponto, não considera atraso por enquanto
  return false;
};

/**
 * Sugere tipo de ponto baseado no horário
 */
export const suggestPunchType = (): PunchType => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) return 'entrada';
  if (hour >= 11 && hour < 13) return 'intervalo_inicio';
  if (hour >= 13 && hour < 15) return 'intervalo_fim';
  if (hour >= 17 && hour < 22) return 'saida';
  
  return 'entrada';
};

// =====================================
// UTILITÁRIOS DE USUÁRIOS
// =====================================

/**
 * Verifica se um role pode gerenciar outro
 */
export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  return USER_ROLE_HIERARCHY[managerRole] > USER_ROLE_HIERARCHY[targetRole];
};

/**
 * Obtém roles que um usuário pode gerenciar
 */
export const getManageableRoles = (userRole: UserRole): UserRole[] => {
  const userLevel = USER_ROLE_HIERARCHY[userRole];
  return Object.entries(USER_ROLE_HIERARCHY)
    .filter(([, level]) => level < userLevel)
    .map(([role]) => role as UserRole);
};

// =====================================
// UTILITÁRIOS DE BIOMETRIA
// =====================================

/**
 * Obtém o label do status de reconhecimento
 */
export const getRecognitionStatusLabel = (status: RecognitionStatus): string => {
  return RECOGNITION_STATUS_MAP[status] || status;
};

/**
 * Obtém a cor do status de reconhecimento
 */
export const getRecognitionStatusColor = (status: RecognitionStatus): string => {
  return RECOGNITION_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Verifica se a confiança é alta
 */
export const isHighConfidence = (confidence: number): boolean => {
  return confidence >= BIOMETRIC_CONFIG.HIGH_CONFIDENCE;
};

// =====================================
// UTILITÁRIOS DE DATA
// =====================================

/**
 * Obtém datas baseadas no período selecionado
 */
export const getDateRange = (timeRange: string): { dateFrom: string; dateTo: string } => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  switch (timeRange) {
    case 'hoje':
      return { dateFrom: todayStr, dateTo: todayStr };
    
    case 'ontem':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      return { dateFrom: yesterdayStr, dateTo: yesterdayStr };
    
    case 'semana':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { 
        dateFrom: startOfWeek.toISOString().split('T')[0], 
        dateTo: todayStr 
      };
    
    case 'mes':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { 
        dateFrom: startOfMonth.toISOString().split('T')[0], 
        dateTo: todayStr 
      };
    
    default:
      return { dateFrom: todayStr, dateTo: todayStr };
  }
};

/**
 * Verifica se uma data está dentro do range
 */
export const isDateInRange = (date: string, dateFrom: string, dateTo: string): boolean => {
  const checkDate = new Date(date).toISOString().split('T')[0];
  return checkDate >= dateFrom && checkDate <= dateTo;
};

// =====================================
// UTILITÁRIOS DE EXPORT
// =====================================

/**
 * Gera nome de arquivo com timestamp
 */
export const generateFileName = (basename: string, extension: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${basename}_${timestamp}.${extension}`;
};

/**
 * Converte dados para CSV
 */
export const convertToCSV = (data: any[], headers: string[]): string => {
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = Array.isArray(row) ? row[headers.indexOf(header)] : row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

// =====================================
// UTILITÁRIOS DE ERRO
// =====================================

/**
 * Extrai mensagem de erro legível
 */
export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Erro desconhecido';
};

/**
 * Verifica se é erro de rede
 */
export const isNetworkError = (error: any): boolean => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('network') ||
         error?.message?.includes('fetch');
};

// =====================================
// UTILITÁRIOS DE PERFORMANCE
// =====================================

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// =====================================
// UTILITÁRIOS DE CACHE
// =====================================

/**
 * Gera chave de cache
 */
export const generateCacheKey = (prefix: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);
  
  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

/**
 * Verifica se cache expirou
 */
export const isCacheExpired = (timestamp: string, duration: number): boolean => {
  return Date.now() - new Date(timestamp).getTime() > duration;
};