/**
 * 🎯 Theme System - Error Type Definitions
 *
 * Comprehensive error type definitions for theme system error handling.
 * Contains error enums, interfaces, and recovery strategy types.
 *
 */

import type { ThemeMode } from '@/types/core/themeTypes';

// ==================== THEME ERROR ENUMS ====================

/**
 * Comprehensive theme error type enumeration
 */
export enum ThemeErrorType {
  /** Invalid theme mode provided */
  INVALID_THEME = 'INVALID_THEME',

  /** Theme persistence operation failed */
  PERSISTENCE_FAILED = 'PERSISTENCE_FAILED',

  /** Theme system initialization failed */
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',

  /** DOM access failed (SSR environment) */
  DOM_ACCESS_FAILED = 'DOM_ACCESS_FAILED',

  /** Theme validation failed */
  VALIDATION_FAILED = 'VALIDATION_FAILED',

  /** Theme configuration error */
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',

  /** Network-related theme error */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /** Theme component render error */
  COMPONENT_ERROR = 'COMPONENT_ERROR',
}

/**
 * Error severity levels for prioritization
 */
export enum ThemeErrorSeverity {
  /** Low impact, system continues normally */
  LOW = 'LOW',

  /** Medium impact, some features may be affected */
  MEDIUM = 'MEDIUM',

  /** High impact, significant functionality impaired */
  HIGH = 'HIGH',

  /** Critical impact, system may be unusable */
  CRITICAL = 'CRITICAL',
}

// ==================== THEME ERROR INTERFACES ====================

/**
 * Base theme error interface extending native Error
 */
export interface ThemeError extends Error {
  /** Specific theme error type */
  type: ThemeErrorType;

  /** Error severity level */
  severity: ThemeErrorSeverity;

  /** Theme context when error occurred */
  theme?: ThemeMode;

  /** Additional error context data */
  context?: Record<string, unknown>;

  /** Timestamp when error occurred */
  timestamp: number;

  /** Whether error is recoverable */
  recoverable: boolean;

  /** Component where error originated */
  component?: string;

  /** Operation that failed */
  operation?: string;

  /** Stack trace of error origin */
  stack?: string;
}

/**
 * Extended theme error with recovery information
 */
export interface ThemeErrorWithRecovery extends ThemeError {
  /** Recovery strategy information */
  recovery: ErrorRecoveryStrategy;

  /** Whether recovery was attempted */
  recoveryAttempted: boolean;

  /** Whether recovery was successful */
  recoverySuccessful?: boolean;

  /** Recovery attempt timestamp */
  recoveryTimestamp?: number;
}

// ==================== ERROR RECOVERY TYPES ====================

/**
 * Error recovery strategy interface
 */
export interface ErrorRecoveryStrategy {
  /** Whether error can be recovered from */
  canRecover: boolean;

  /** Fallback theme to use */
  fallbackTheme?: ThemeMode;

  /** Function to retry the failed operation */
  retryAction?: () => void | Promise<void>;

  /** User-friendly error message */
  userMessage?: string;

  /** Technical error details for developers */
  technicalDetails?: string;

  /** Recommended actions for recovery */
  recommendedActions?: string[];

  /** Maximum retry attempts allowed */
  maxRetries?: number;

  /** Delay between retry attempts (ms) */
  retryDelay?: number;
}

/**
 * Error recovery result interface
 */
export interface ErrorRecoveryResult {
  /** Whether recovery was successful */
  success: boolean;

  /** Theme applied after recovery */
  appliedTheme?: ThemeMode;

  /** Recovery strategy used */
  strategy: ErrorRecoveryStrategy;

  /** Error that triggered recovery */
  originalError: ThemeError;

  /** Recovery execution time (ms) */
  recoveryTime: number;

  /** Additional recovery details */
  details?: Record<string, unknown>;
}

// ==================== ERROR CONTEXT TYPES ====================

/**
 * Error context for component-level errors
 */
export interface ComponentErrorContext {
  /** Component name */
  componentName: string;

  /** Component instance ID */
  instanceId?: string;

  /** Component props at time of error */
  props?: Record<string, unknown>;

  /** Component state at time of error */
  state?: Record<string, unknown>;

  /** Vue lifecycle hook where error occurred */
  lifecycle?: string;
}

/**
 * Error context for store-level errors
 */
export interface StoreErrorContext {
  /** Store name */
  storeName: string;

  /** Store state at time of error */
  state?: Record<string, unknown>;

  /** Action being executed */
  action?: string;

  /** Mutation being committed */
  mutation?: string;
}

/**
 * Error context for validation errors
 */
export interface ValidationErrorContext {
  /** Value being validated */
  value: unknown;

  /** Expected value type or format */
  expected: string;

  /** Validation schema used */
  schema?: string;

  /** Validation errors from Zod */
  zodErrors?: Array<{
    path: (string | number)[];
    message: string;
    code: string;
  }>;
}

// ==================== ERROR HANDLER TYPES ====================

/**
 * Error handler function type
 */
export type ThemeErrorHandler = (
  error: ThemeError,
  context?: ComponentErrorContext | StoreErrorContext | ValidationErrorContext
) => Promise<ErrorRecoveryResult> | ErrorRecoveryResult;

/**
 * Error monitor configuration
 */
export interface ErrorMonitorConfig {
  /** Maximum errors to store in history */
  maxHistorySize: number;

  /** Time window for error analysis (ms) */
  analysisWindow: number;

  /** Error frequency threshold for alerts */
  errorThreshold: number;

  /** Whether to enable automatic recovery */
  autoRecovery: boolean;

  /** Custom error handler */
  customHandler?: ThemeErrorHandler;
}

/**
 * Error statistics interface
 */
export interface ErrorStatistics {
  /** Total error count */
  total: number;

  /** Errors by type */
  byType: Record<ThemeErrorType, number>;

  /** Errors by severity */
  bySeverity: Record<ThemeErrorSeverity, number>;

  /** Critical error count */
  criticalCount: number;

  /** Recoverable error count */
  recoverableCount: number;

  /** Average recovery time (ms) */
  averageRecoveryTime: number;

  /** Error frequency (errors per hour) */
  errorFrequency: number;
}

// ==================== ERROR FACTORY TYPES ====================

/**
 * Error creation options
 */
export interface CreateErrorOptions {
  /** Error severity level */
  severity?: ThemeErrorSeverity;

  /** Theme context */
  theme?: ThemeMode;

  /** Additional context data */
  context?: Record<string, unknown>;

  /** Whether error is recoverable */
  recoverable?: boolean;

  /** Component name */
  component?: string;

  /** Operation name */
  operation?: string;

  /** Original error that caused this error */
  cause?: Error;
}
