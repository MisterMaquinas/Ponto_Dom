// =====================================
// TIPOS CENTRALIZADOS DO SISTEMA
// =====================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// =====================================
// TIPOS DE USUÁRIOS E AUTENTICAÇÃO
// =====================================

export type UserRole = 'master' | 'admin' | 'manager' | 'supervisor' | 'user';

export interface User extends BaseEntity {
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  username: string;
  password: string;
  role: UserRole;
  company_id: string;
  face_data?: string;
  created_by: string;
}

export interface Company extends BaseEntity {
  name: string;
}

export interface Branch extends BaseEntity {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  company_id: string;
  is_active: boolean;
  manager_username?: string;
  manager_password?: string;
}

export interface Employee extends BaseEntity {
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  position: string;
  custom_position?: string;
  branch_id: string;
  is_active: boolean;
  face_encoding?: string;
  reference_photo_url?: string;
  created_by: string;
}

// =====================================
// TIPOS DE PONTO E BIOMETRIA
// =====================================

export type PunchType = 'entrada' | 'saida' | 'intervalo_inicio' | 'intervalo_fim';

export interface BasePunchRecord {
  id: string;
  punch_type: PunchType;
  timestamp: string;
  face_confidence?: number;
  photo_url?: string;
  device_info?: Record<string, any>;
  location?: Record<string, any>;
  created_at: string;
}

export interface PunchRecord extends BasePunchRecord {
  user_id: string;
  confidence_score?: number;
  face_image_url?: string;
  verification_log_id?: string;
  updated_at: string;
}

export interface EmployeePunchRecord extends BasePunchRecord {
  employee_id: string;
  branch_id: string;
  confirmed_by_employee?: boolean;
  receipt_sent?: boolean;
}

// View unificada de registros de ponto
export interface UnifiedPunchRecord {
  id: string;
  employee_id: string;
  record_source: 'user' | 'employee';
  punch_type: PunchType;
  timestamp: string;
  face_confidence?: number;
  photo_url?: string;
  device_info?: Record<string, any>;
  location?: Record<string, any>;
  branch_id?: string;
  confirmed_by_employee?: boolean;
  receipt_sent?: boolean;
  created_at: string;
  employee_name: string;
  company_id: string;
  employee_role: string;
  employee_position?: string;
  company_name: string;
  branch_name?: string;
}

// =====================================
// TIPOS DE BIOMETRIA
// =====================================

export type BiometricMode = 'register' | 'verify' | 'employee';
export type RecognitionStatus = 'success' | 'failed' | 'low_confidence' | 'processing';

export interface BiometricPhoto extends BaseEntity {
  user_id: string;
  reference_photo_url: string;
  face_encoding?: string;
  is_active: boolean;
}

export interface VerificationLog {
  id: string;
  user_id: string;
  reference_photo_url: string;
  attempt_photo_url?: string;
  verification_result: 'success' | 'failed' | 'error';
  confidence_score: number;
  similarity_score?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
  };
}

export interface BiometricVerificationLog extends BaseEntity {
  user_id: string;
  reference_photo_url: string;
  attempt_photo_url: string;
  verification_result: string;
  similarity_score?: number;
  error_message?: string;
  device_info?: Record<string, any>;
}

export interface FaceRecognitionLog extends BaseEntity {
  user_id: string;
  face_image_url: string;
  confidence_score: number;
  recognition_status: RecognitionStatus;
  recognition_timestamp: string;
  punch_record_id?: string;
  device_info?: Record<string, any>;
  location?: Record<string, any>;
}

export interface FaceRecognitionResult {
  employee?: Employee;
  confidence: number;
  status: RecognitionStatus;
}

// =====================================
// TIPOS DE RELATÓRIOS
// =====================================

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  employeeName?: string;
  punchType?: PunchType | 'todos';
  timeRange?: 'hoje' | 'ontem' | 'semana' | 'mes' | 'personalizado';
  branchId?: string;
  status?: string;
}

export interface ReportStats {
  totalEmployees: number;
  employeesWithEntry: number;
  employeesWithoutEntry: number;
  todayRecords: number;
  averageConfidence?: number;
  totalPunchRecords: number;
}

export interface ReportCache extends BaseEntity {
  cache_key: string;
  company_id: string;
  report_type: string;
  filters?: Record<string, any>;
  data: Record<string, any>;
  expires_at: string;
}

// =====================================
// TIPOS DE FORMULÁRIOS
// =====================================

export interface UserFormData {
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  username: string;
  password: string;
  role: UserRole;
  face_data?: string;
}

export interface EmployeeFormData {
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  position: string;
  custom_position?: string;
  branch_id: string;
}

// =====================================
// TIPOS DE COMPROVANTES
// =====================================

export interface PunchReceiptData {
  name: string;
  timestamp: string;
  hash: string;
  position?: string;
  branch?: string;
  confidence?: number;
  type?: PunchType;
}

// =====================================
// TIPOS DE RESPOSTA DE API
// =====================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================================
// TIPOS DE COMPONENTES UI
// =====================================

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// =====================================
// TIPOS DE ESTADO GLOBAL
// =====================================

export interface AppState {
  user: User | null;
  company: Company | null;
  selectedBranch: Branch | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userType: UserRole | null;
  loading: boolean;
}

// =====================================
// TIPOS DE CONFIGURAÇÃO
// =====================================

export interface AppConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'development' | 'production' | 'staging';
  features: {
    realTimeUpdates: boolean;
    pushNotifications: boolean;
    analytics: boolean;
  };
}

// =====================================
// TIPOS DE EVENTOS
// =====================================

export interface SystemEvent {
  type: string;
  payload: Record<string, any>;
  timestamp: string;
  source: string;
}

export interface PunchRegisteredEvent extends SystemEvent {
  type: 'punch_registered';
  payload: {
    punchData: PunchReceiptData;
    employee: Employee | User;
  };
}

// =====================================
// TIPOS DE VALIDAÇÃO
// =====================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// =====================================
// UTILITÁRIOS DE TIPO
// =====================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};