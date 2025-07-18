// =====================================
// SISTEMA DE TRATAMENTO DE ERROS
// =====================================

import type { ApiResponse } from '@/types';
import { toast } from '@/hooks/use-toast';
import { MESSAGES } from './constants';

// =====================================
// TIPOS DE ERRO
// =====================================

export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  SERVER = 'SERVER_ERROR',
  BIOMETRIC = 'BIOMETRIC_ERROR',
  CAMERA = 'CAMERA_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

export interface AppError extends Error {
  type: ErrorType;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  timestamp: string;
  stack?: string;
}

// =====================================
// CLASSE DE ERRO CUSTOMIZADA
// =====================================

class CustomErrorClass extends Error implements AppError {
  type: ErrorType;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  timestamp: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'CustomError';
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Manter stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomErrorClass);
    }
  }
}

export const CustomError = CustomErrorClass;

// =====================================
// FACTORY DE ERROS
// =====================================

const createErrorFactory = {
  network: (message?: string, details?: Record<string, any>) =>
    new CustomErrorClass(
      message || MESSAGES.ERROR.NETWORK,
      ErrorType.NETWORK,
      'NETWORK_ERROR',
      0,
      details
    ),

  validation: (message: string, field?: string, details?: Record<string, any>) =>
    new CustomErrorClass(
      message,
      ErrorType.VALIDATION,
      'VALIDATION_ERROR',
      400,
      { field, ...details }
    ),

  authentication: (message?: string, details?: Record<string, any>) =>
    new CustomErrorClass(
      message || MESSAGES.ERROR.INVALID_CREDENTIALS,
      ErrorType.AUTHENTICATION,
      'AUTH_ERROR',
      401,
      details
    ),

  authorization: (message?: string, details?: Record<string, any>) =>
    new CustomErrorClass(
      message || MESSAGES.ERROR.PERMISSION_DENIED,
      ErrorType.AUTHORIZATION,
      'AUTHORIZATION_ERROR',
      403,
      details
    ),

  notFound: (resource: string, details?: Record<string, any>) =>
    new CustomErrorClass(
      `${resource} não encontrado`,
      ErrorType.NOT_FOUND,
      'NOT_FOUND_ERROR',
      404,
      { resource, ...details }
    ),

  server: (message?: string, details?: Record<string, any>) =>
    new CustomErrorClass(
      message || 'Erro interno do servidor',
      ErrorType.SERVER,
      'SERVER_ERROR',
      500,
      details
    ),

  biometric: (message?: string, confidence?: number, details?: Record<string, any>) =>
    new CustomErrorClass(
      message || MESSAGES.ERROR.BIOMETRIC_FAILED,
      ErrorType.BIOMETRIC,
      'BIOMETRIC_ERROR',
      422,
      { confidence, ...details }
    ),

  camera: (message?: string, details?: Record<string, any>) =>
    new CustomErrorClass(
      message || MESSAGES.ERROR.CAMERA_ACCESS,
      ErrorType.CAMERA,
      'CAMERA_ERROR',
      403,
      details
    )
};

export const createError = createErrorFactory;

// =====================================
// DETECTOR DE TIPO DE ERRO
// =====================================

const detectErrorType = (error: any): ErrorType => {
  // Se já é um CustomError, retorna o tipo
  if (error instanceof CustomError) {
    return error.type;
  }

  // Detectar por código de status HTTP
  if (error.statusCode || error.status) {
    const status = error.statusCode || error.status;
    switch (status) {
      case 400: return ErrorType.VALIDATION;
      case 401: return ErrorType.AUTHENTICATION;
      case 403: return ErrorType.AUTHORIZATION;
      case 404: return ErrorType.NOT_FOUND;
      case 422: return ErrorType.VALIDATION;
      case 500:
      case 502:
      case 503: return ErrorType.SERVER;
      default: return ErrorType.UNKNOWN;
    }
  }

  // Detectar por mensagem ou propriedades
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return ErrorType.NETWORK;
  }
  
  if (message.includes('unauthorized') || message.includes('invalid credentials')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (message.includes('permission') || message.includes('forbidden')) {
    return ErrorType.AUTHORIZATION;
  }
  
  if (message.includes('not found')) {
    return ErrorType.NOT_FOUND;
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  
  if (message.includes('camera') || message.includes('getUserMedia')) {
    return ErrorType.CAMERA;
  }
  
  if (message.includes('biometric') || message.includes('recognition') || message.includes('confidence')) {
    return ErrorType.BIOMETRIC;
  }

  return ErrorType.UNKNOWN;
};

// =====================================
// NORMALIZADOR DE ERRO
// =====================================

const normalizeErrorFn = (error: any): AppError => {
  // Se já é um AppError, retorna
  if (error instanceof CustomErrorClass) {
    return error;
  }

  // Extrair informações do erro
  const message = error.message || error.error || error.toString() || MESSAGES.ERROR.GENERIC;
  const type = detectErrorType(error);
  const code = error.code || error.name;
  const statusCode = error.statusCode || error.status;
  const details = {
    originalError: error,
    stack: error.stack,
    ...error
  };

  return new CustomErrorClass(message, type, code, statusCode, details);
};

export const normalizeError = normalizeErrorFn;

// =====================================
// LOGGER DE ERRO
// =====================================

interface ErrorLog {
  error: AppError;
  context?: string;
  userId?: string;
  companyId?: string;
  additional?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];

  log(error: AppError, context?: string, additional?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      error,
      context,
      additional,
      userId: this.getCurrentUserId(),
      companyId: this.getCurrentCompanyId()
    };

    this.logs.push(errorLog);

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔥 ${error.type}: ${error.message}`);
      console.log('Context:', context);
      console.log('Details:', error.details);
      console.log('Stack:', error.stack);
      console.log('Additional:', additional);
      console.groupEnd();
    }

    // Aqui você pode integrar com serviços de logging como Sentry
    this.sendToExternalService(errorLog);
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  private getCurrentUserId(): string | undefined {
    // Implementar lógica para obter ID do usuário atual
    return undefined;
  }

  private getCurrentCompanyId(): string | undefined {
    // Implementar lógica para obter ID da empresa atual
    return undefined;
  }

  private sendToExternalService(errorLog: ErrorLog): void {
    // Implementar integração com serviços de logging externos
    // Por exemplo: Sentry, LogRocket, etc.
  }
}

const errorLoggerInstance = new ErrorLogger();
export const errorLogger = errorLoggerInstance;

// =====================================
// MANIPULADOR GLOBAL DE ERRO
// =====================================

export class ErrorHandler {
  static handle(error: any, context?: string, showToast = true): AppError {
    const normalizedError = normalizeErrorFn(error);
    
    // Log do erro
    errorLogger.log(normalizedError, context);

    // Mostrar toast se solicitado
    if (showToast) {
      this.showErrorToast(normalizedError);
    }

    return normalizedError;
  }

  static handleAsync<T>(
    promise: Promise<T>,
    context?: string,
    showToast = true
  ): Promise<ApiResponse<T>> {
    return promise
      .then((data): ApiResponse<T> => ({
        data,
        success: true
      }))
      .catch((error): ApiResponse<T> => {
        const handledError = this.handle(error, context, showToast);
        return {
          error: handledError.message,
          success: false
        };
      });
  }

  static async handleSupabaseQuery<T>(
    query: Promise<{ data: T | null; error: any }>,
    context?: string,
    showToast = true
  ): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await query;
      
      if (error) {
        throw new CustomErrorClass(
          error.message,
          ErrorType.SERVER,
          error.code,
          undefined,
          error
        );
      }

      return {
        data: data as T,
        success: true
      };
    } catch (error) {
      const handledError = this.handle(error, context, showToast);
      return {
        error: handledError.message,
        success: false
      };
    }
  }

  private static showErrorToast(error: AppError): void {
    let title = 'Erro';
    let variant: 'default' | 'destructive' = 'destructive';

    switch (error.type) {
      case ErrorType.NETWORK:
        title = 'Erro de Conexão';
        break;
      case ErrorType.AUTHENTICATION:
        title = 'Erro de Autenticação';
        break;
      case ErrorType.AUTHORIZATION:
        title = 'Acesso Negado';
        break;
      case ErrorType.VALIDATION:
        title = 'Dados Inválidos';
        break;
      case ErrorType.BIOMETRIC:
        title = 'Erro Biométrico';
        break;
      case ErrorType.CAMERA:
        title = 'Erro de Câmera';
        break;
      default:
        title = 'Erro';
    }

    toast({
      title,
      description: error.message,
      variant,
    });
  }
}

// =====================================
// BOUNDARY DE ERRO PARA REACT
// =====================================

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

export const handleReactError = (error: Error, errorInfo: React.ErrorInfo): AppError => {
  const appError = new CustomErrorClass(
    error.message,
    ErrorType.UNKNOWN,
    'REACT_ERROR',
    undefined,
    {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    }
  );

  errorLogger.log(appError, 'React Error Boundary');
  
  return appError;
};

// =====================================
// UTILITÁRIOS DE RETRY
// =====================================

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  condition?: (error: AppError) => boolean;
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    condition = (error) => error.type === ErrorType.NETWORK
  } = options;

  let lastError: AppError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = normalizeErrorFn(error);
      
      // Se não deve fazer retry ou é a última tentativa
      if (!condition(lastError) || attempt === maxAttempts) {
        throw lastError;
      }

      // Calcular delay (com backoff exponencial se habilitado)
      const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      
      // Log da tentativa
      errorLogger.log(
        lastError, 
        `Retry attempt ${attempt}/${maxAttempts}`,
        { attempt, delay: currentDelay }
      );

      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }

  throw lastError!;
};

// Export default
export { ErrorHandler as default };