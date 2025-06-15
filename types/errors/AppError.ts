/**
 * Application error types and handling utilities
 */

/**
 * Error codes for application errors
 */
export enum ErrorCode {
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  APP_ERROR = 'APP_ERROR',
  
  // API errors
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Authentication errors
  AUTH_ERROR = 'AUTH_ERROR',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  
  // Resource errors
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',
  
  // Book errors
  BOOK_FETCH_FAILED = 'BOOK_FETCH_FAILED',
  BOOK_NOT_FOUND = 'BOOK_NOT_FOUND',
  BOOK_BORROW_FAILED = 'BOOK_BORROW_FAILED',
  BOOK_RETURN_FAILED = 'BOOK_RETURN_FAILED',
  
  // Reading errors
  READING_PROGRESS_ERROR = 'READING_PROGRESS_ERROR',
  READING_COMPLETE_ERROR = 'READING_COMPLETE_ERROR',
}

/**
 * Base class for all application errors
 */
export class AppError extends Error {
  /**
   * Unique error code
   */
  code: ErrorCode;

  /**
   * Error details
   */
  details?: any;

  /**
   * Constructor
   * @param params Error parameters
   */
  constructor(params: { 
    message: string; 
    code?: ErrorCode; 
    details?: any;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.code = params.code || ErrorCode.APP_ERROR;
    this.details = params.details;
    
    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, AppError.prototype);
  }
  
  /**
   * Log error to console
   */
  logError(): void {
    console.error(`[${this.code}] ${this.message}`, this.details || '');
  }
}

/**
 * Error thrown when API requests fail
 */
export class ApiError extends AppError {
  /**
   * HTTP status code
   */
  status: number;

  /**
   * Request URL
   */
  url: string;

  /**
   * Request method
   */
  method: string;

  /**
   * Response data
   */
  data?: any;

  /**
   * Constructor
   * @param message Error message
   * @param details Error details
   */
  constructor(
    message: string,
    details: {
      status: number;
      url: string;
      method: string;
      data?: any;
    }
  ) {
    super({
      message,
      code: ErrorCode.API_ERROR,
      details
    });
    this.name = 'ApiError';
    this.status = details.status;
    this.url = details.url;
    this.method = details.method;
    this.data = details.data;
    
    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Error thrown when network requests fail
 */
export class NetworkError extends AppError {
  /**
   * Request URL
   */
  url?: string;

  /**
   * Original error
   */
  originalError?: Error;

  /**
   * Request timeout
   */
  timeout?: number;

  /**
   * Constructor
   * @param message Error message
   * @param details Error details
   */
  constructor(
    message: string,
    details?: {
      url?: string;
      originalError?: Error;
      timeout?: number;
    }
  ) {
    super({
      message,
      code: ErrorCode.NETWORK_ERROR,
      details
    });
    this.name = 'NetworkError';
    this.url = details?.url;
    this.originalError = details?.originalError;
    this.timeout = details?.timeout;
    
    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AppError {
  /**
   * Validation errors
   */
  errors: Record<string, string[]>;

  /**
   * Constructor
   * @param message Error message
   * @param errors Validation errors
   */
  constructor(message: string, errors: Record<string, string[]>) {
    super({
      message,
      code: ErrorCode.VALIDATION_ERROR,
      details: { errors }
    });
    this.name = 'ValidationError';
    this.errors = errors;
    
    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthError extends AppError {
  /**
   * Constructor
   * @param message Error message
   * @param details Error details
   */
  constructor(message: string, details?: any) {
    super({
      message,
      code: ErrorCode.AUTH_ERROR,
      details
    });
    this.name = 'AuthError';
    
    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Error thrown when an operation is not authorized
 */
export class ForbiddenError extends AppError {
  /**
   * Constructor
   * @param message Error message
   * @param details Error details
   */
  constructor(message: string = 'You do not have permission to perform this action', details?: any) {
    super({
      message,
      code: ErrorCode.FORBIDDEN_ERROR,
      details
    });
    this.name = 'ForbiddenError';
    
    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends AppError {
  /**
   * Constructor
   * @param message Error message
   * @param details Error details
   */
  constructor(message: string = 'The requested resource was not found', details?: any) {
    super({
      message,
      code: ErrorCode.NOT_FOUND_ERROR,
      details
    });
    this.name = 'NotFoundError';
    
    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Parse unknown error into AppError
 * @param error Unknown error
 * @returns AppError instance
 */
export function parseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError({
      message: error.message,
      code: ErrorCode.UNKNOWN_ERROR,
      details: { originalError: error }
    });
  }
  
  if (typeof error === 'string') {
    return new AppError({ message: error });
  }
  
  return new AppError({
    message: 'An unknown error occurred',
    code: ErrorCode.UNKNOWN_ERROR,
    details: { originalError: error }
  });
} 