// =====================================
// CONSTANTES DO SISTEMA
// =====================================

import type { PunchType, UserRole, RecognitionStatus } from '@/types';

// =====================================
// CONFIGURAÇÕES DE PONTO
// =====================================

export const PUNCH_TYPES: Record<PunchType, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  intervalo_inicio: 'Saída (Intervalo)',
  intervalo_fim: 'Volta (Intervalo)'
} as const;

export const PUNCH_TYPE_COLORS: Record<PunchType, string> = {
  entrada: 'bg-green-500 text-white',
  saida: 'bg-red-500 text-white',
  intervalo_inicio: 'bg-orange-500 text-white',
  intervalo_fim: 'bg-blue-500 text-white'
} as const;

// =====================================
// CONFIGURAÇÕES DE BIOMETRIA
// =====================================

export const BIOMETRIC_CONFIG = {
  MIN_CONFIDENCE: 0.75,
  HIGH_CONFIDENCE: 0.9,
  CAPTURE_QUALITY: 0.8,
  VIDEO_CONSTRAINTS: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user'
  },
  COUNTDOWN_DURATION: 3
} as const;

export const RECOGNITION_STATUS_MAP: Record<RecognitionStatus, string> = {
  success: 'Sucesso',
  failed: 'Falhou',
  low_confidence: 'Baixa Confiança',
  processing: 'Processando'
} as const;

export const RECOGNITION_STATUS_COLORS: Record<RecognitionStatus, string> = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  low_confidence: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800'
} as const;

// =====================================
// CONFIGURAÇÕES DE USUÁRIOS
// =====================================

export const USER_ROLES: Record<UserRole, string> = {
  master: 'Master',
  admin: 'Administrador',
  manager: 'Gerente',
  supervisor: 'Supervisor',
  user: 'Usuário'
} as const;

export const USER_ROLE_HIERARCHY: Record<UserRole, number> = {
  master: 5,
  admin: 4,
  manager: 3,
  supervisor: 2,
  user: 1
} as const;

export const DEFAULT_USER_LIMITS: Record<UserRole, number> = {
  master: 999,
  admin: 1,
  manager: 5,
  supervisor: 10,
  user: 50
} as const;

// =====================================
// CONFIGURAÇÕES DE RELATÓRIOS
// =====================================

export const REPORT_TIME_RANGES = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  semana: 'Esta Semana',
  mes: 'Este Mês',
  personalizado: 'Período Personalizado'
} as const;

export const REPORT_CACHE_DURATION = {
  STATS: 5 * 60 * 1000, // 5 minutos
  PUNCH_RECORDS: 2 * 60 * 1000, // 2 minutos
  BIOMETRIC_LOGS: 10 * 60 * 1000, // 10 minutos
  EMPLOYEE_REPORT: 15 * 60 * 1000 // 15 minutos
} as const;

// =====================================
// CONFIGURAÇÕES DE INTERFACE
// =====================================

export const UI_CONFIG = {
  ITEMS_PER_PAGE: 50,
  MOBILE_BREAKPOINT: 768,
  TOAST_DURATION: 5000,
  LOADING_DELAY: 300,
  DEBOUNCE_DELAY: 500
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// =====================================
// MENSAGENS DO SISTEMA
// =====================================

export const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'Usuário criado com sucesso!',
    USER_UPDATED: 'Usuário atualizado com sucesso!',
    USER_DELETED: 'Usuário removido com sucesso!',
    PUNCH_REGISTERED: 'Ponto registrado com sucesso!',
    BIOMETRIC_REGISTERED: 'Biometria registrada com sucesso!',
    REPORT_EXPORTED: 'Relatório exportado com sucesso!'
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    PERMISSION_DENIED: 'Acesso negado',
    USER_NOT_FOUND: 'Usuário não encontrado',
    INVALID_CREDENTIALS: 'Credenciais inválidas',
    CAMERA_ACCESS: 'Não foi possível acessar a câmera',
    BIOMETRIC_FAILED: 'Falha na verificação biométrica',
    CONFIDENCE_LOW: 'Confiança da biometria muito baixa'
  },
  INFO: {
    LOADING: 'Carregando...',
    PROCESSING: 'Processando...',
    NO_DATA: 'Nenhum dado encontrado',
    SELECT_OPTION: 'Selecione uma opção'
  }
} as const;

// =====================================
// CONFIGURAÇÕES DE VALIDAÇÃO
// =====================================

export const VALIDATION_RULES = {
  CPF_LENGTH: 11,
  RG_MIN_LENGTH: 7,
  RG_MAX_LENGTH: 12,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  PHONE_LENGTH: 11,
  ZIP_CODE_LENGTH: 8
} as const;

export const REGEX_PATTERNS = {
  CPF: /^\d{11}$/,
  RG: /^\d{7,12}$/,
  PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  ZIP_CODE: /^\d{5}-?\d{3}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

// =====================================
// CONFIGURAÇÕES DE ARQUIVO
// =====================================

export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXPORT_FORMATS: ['csv', 'xlsx', 'pdf']
} as const;

// =====================================
// CONFIGURAÇÕES DE CACHE
// =====================================

export const CACHE_KEYS = {
  USER_DATA: 'user_data',
  COMPANY_DATA: 'company_data',
  BRANCH_DATA: 'branch_data',
  EMPLOYEE_LIST: 'employee_list',
  PUNCH_RECORDS: 'punch_records',
  REPORT_STATS: 'report_stats'
} as const;

// =====================================
// CONFIGURAÇÕES DE NOTIFICAÇÃO
// =====================================

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

// =====================================
// CONFIGURAÇÕES DE TEMA
// =====================================

export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  STORAGE_KEY: 'ponto_verificado_theme',
  TRANSITION_DURATION: '300ms'
} as const;

// =====================================
// CONFIGURAÇÕES DE SISTEMA
// =====================================

export const SYSTEM_CONFIG = {
  APP_NAME: 'PONTO VERIFICADO',
  VERSION: '1.0.0',
  API_VERSION: 'v1',
  COMPANY_NAME: 'PONTO VERIFICADO Solutions'
} as const;

// =====================================
// CONFIGURAÇÕES DE STORAGE
// =====================================

export const STORAGE_BUCKETS = {
  BIOMETRIC_PHOTOS: 'biometric-photos',
  FACE_RECOGNITION: 'face-recognition',
  EMPLOYEE_PHOTOS: 'employee-photos',
  DOCUMENTS: 'documents'
} as const;

// =====================================
// CONFIGURAÇÕES DE EXPORT
// =====================================

export const EXPORT_CONFIG = {
  CSV_HEADERS: {
    PUNCH_RECORDS: ['Nome', 'Data/Hora', 'Tipo', 'Confiança (%)', 'Local'],
    EMPLOYEES: ['Nome', 'CPF', 'RG', 'Cargo', 'Contato', 'Status'],
    BIOMETRIC_LOGS: ['Funcionário', 'Data/Hora', 'Status', 'Confiança (%)']
  },
  PDF_CONFIG: {
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    format: 'A4' as const,
    orientation: 'portrait' as const
  }
} as const;