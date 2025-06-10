/**
 * 🎯 Theme System - Validation Utilities
 *
 * Excellence-level validation utilities for theme operations with comprehensive
 * error handling and recovery mechanisms.
 */

import { z } from 'zod';
import type { ThemeMode } from '@/types/core/themeTypes';
import type { ThemeToggleProps } from '@/types/components/themeComponentTypes';
import type {
  ThemeError,
  ErrorRecoveryStrategy,
  CreateErrorOptions,
} from '@/types/errors/themeErrorTypes';
import { ThemeErrorType, ThemeErrorSeverity } from '@/types/errors/themeErrorTypes';
import {
  THEME_CONSTANTS,
  THEME_MODES,
  ThemeModeSchema,
  ThemeStateSchema,
  PersistenceDataSchema,
  isValidThemeMode,
  parseThemeMode,
} from '@/types/core/themeTypes';

// ==================== VALIDATION RESULT TYPES ====================

/**
 * Generic validation result with discriminated union for type safety
 */
export type ValidationResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ThemeError };

/**
 * Theme-specific operation result type
 */
export type ThemeOperationResult<T = void> = ValidationResult<T>;

// ==================== ERROR CREATION UTILITIES ====================

/**
 * Create a structured theme error with comprehensive context
 */
export const createThemeError = (
  type: ThemeErrorType,
  message: string,
  options: CreateErrorOptions = {}
): ThemeError => {
  const error = new Error(message) as ThemeError;

  // Core error properties
  error.type = type;
  error.severity = options.severity ?? ThemeErrorSeverity.MEDIUM;
  error.timestamp = Date.now();
  error.recoverable = options.recoverable ?? true;

  // Context information
  error.theme = options.theme;
  error.context = options.context;
  error.component = options.component;
  error.operation = options.operation;

  // Chain original error if provided
  if (options.cause) {
    error.stack = `${error.stack}\nCaused by: ${options.cause.stack}`;
  }

  return error;
};

/**
 * Create error recovery strategy with intelligent defaults
 */
export const createErrorRecovery = (
  canRecover: boolean,
  options: {
    fallbackTheme?: ThemeMode;
    retryAction?: () => void | Promise<void>;
    userMessage?: string;
    technicalDetails?: string;
    recommendedActions?: string[];
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): ErrorRecoveryStrategy => ({
  canRecover,
  fallbackTheme: options.fallbackTheme ?? THEME_CONSTANTS.DEFAULT_THEME,
  retryAction: options.retryAction,
  userMessage: options.userMessage ?? 'An error occurred with theme operation',
  technicalDetails: options.technicalDetails,
  recommendedActions: options.recommendedActions,
  maxRetries: options.maxRetries ?? THEME_CONSTANTS.PERSISTENCE_RETRY_COUNT,
  retryDelay: options.retryDelay ?? THEME_CONSTANTS.ERROR_RECOVERY_DELAY,
});

// ==================== CORE VALIDATION FUNCTIONS ====================

/**
 * Validate theme mode with detailed error information and context
 */
export const validateThemeMode = (
  value: unknown,
  context?: CreateErrorOptions
): ThemeOperationResult<ThemeMode> => {
  try {
    const result = ThemeModeSchema.safeParse(value);

    if (!result.success) {
      return {
        success: false,
        error: createThemeError(
          ThemeErrorType.INVALID_THEME,
          `Invalid theme mode: ${value}. Expected: ${THEME_MODES.join(' | ')}`,
          {
            severity: ThemeErrorSeverity.LOW,
            context: {
              provided: value,
              expected: THEME_MODES,
              zodErrors: result.error.errors,
            },
            ...context,
          }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: createThemeError(
        ThemeErrorType.VALIDATION_FAILED,
        `Theme validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          severity: ThemeErrorSeverity.MEDIUM,
          context: { originalError: error },
          cause: error instanceof Error ? error : undefined,
          ...context,
        }
      ),
    };
  }
};

/**
 * Validate theme toggle component props with comprehensive checking
 */
export const validateThemeToggleProps = (
  props: unknown,
  context?: CreateErrorOptions
): ThemeOperationResult<ThemeToggleProps> => {
  try {
    // Create Zod schema for theme toggle props
    const ThemeTogglePropsSchema = z.object({
      disabled: z.boolean().optional().default(false),
      size: z.enum(['sm', 'base', 'lg']).optional().default('base'),
      showLabels: z.boolean().optional().default(true),
    });

    const result = ThemeTogglePropsSchema.safeParse(props);

    if (!result.success) {
      return {
        success: false,
        error: createThemeError(ThemeErrorType.VALIDATION_FAILED, 'Invalid theme toggle props', {
          severity: ThemeErrorSeverity.LOW,
          context: {
            provided: props,
            zodErrors: result.error.errors,
          },
          ...context,
        }),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: createThemeError(
        ThemeErrorType.VALIDATION_FAILED,
        `Props validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          severity: ThemeErrorSeverity.MEDIUM,
          cause: error instanceof Error ? error : undefined,
          ...context,
        }
      ),
    };
  }
};

/**
 * Validate persistence data from localStorage with data integrity checks
 */
export const validatePersistenceData = (
  data: unknown,
  context?: CreateErrorOptions
): ThemeOperationResult<{ currentTheme: ThemeMode }> => {
  try {
    const result = PersistenceDataSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        error: createThemeError(
          ThemeErrorType.PERSISTENCE_FAILED,
          'Invalid persistence data format',
          {
            severity: ThemeErrorSeverity.LOW,
            recoverable: true,
            context: {
              provided: data,
              zodErrors: result.error.errors,
            },
            ...context,
          }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: createThemeError(
        ThemeErrorType.PERSISTENCE_FAILED,
        `Persistence validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          severity: ThemeErrorSeverity.MEDIUM,
          cause: error instanceof Error ? error : undefined,
          ...context,
        }
      ),
    };
  }
};

// ==================== ENVIRONMENT VALIDATION ====================

/**
 * Validate DOM access for theme application with SSR detection
 */
export const validateDOMAccess = (context?: CreateErrorOptions): ThemeOperationResult<Document> => {
  try {
    if (typeof document === 'undefined') {
      return {
        success: false,
        error: createThemeError(
          ThemeErrorType.DOM_ACCESS_FAILED,
          'DOM not available (running in server-side environment)',
          {
            severity: ThemeErrorSeverity.HIGH,
            recoverable: false,
            context: { environment: 'server' },
            ...context,
          }
        ),
      };
    }

    if (!document.documentElement) {
      return {
        success: false,
        error: createThemeError(
          ThemeErrorType.DOM_ACCESS_FAILED,
          'Document element not available',
          {
            severity: ThemeErrorSeverity.CRITICAL,
            recoverable: false,
            context: { documentReady: Boolean(document) },
            ...context,
          }
        ),
      };
    }

    return { success: true, data: document };
  } catch (error) {
    return {
      success: false,
      error: createThemeError(
        ThemeErrorType.DOM_ACCESS_FAILED,
        `DOM access failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          severity: ThemeErrorSeverity.CRITICAL,
          recoverable: false,
          cause: error instanceof Error ? error : undefined,
          ...context,
        }
      ),
    };
  }
};

/**
 * Validate localStorage availability with quota checking
 */
export const validateStorageAccess = (
  context?: CreateErrorOptions
): ThemeOperationResult<Storage> => {
  try {
    if (typeof localStorage === 'undefined') {
      return {
        success: false,
        error: createThemeError(ThemeErrorType.PERSISTENCE_FAILED, 'localStorage not available', {
          severity: ThemeErrorSeverity.MEDIUM,
          recoverable: true,
          context: {
            environment: typeof window === 'undefined' ? 'server' : 'browser',
          },
          ...context,
        }),
      };
    }

    // Test storage availability and quota
    const testKey = '__theme_test__';
    const testValue = 'test';

    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (retrieved !== testValue) {
      return {
        success: false,
        error: createThemeError(
          ThemeErrorType.PERSISTENCE_FAILED,
          'localStorage read/write test failed',
          {
            severity: ThemeErrorSeverity.MEDIUM,
            recoverable: true,
            context: { testResult: retrieved },
            ...context,
          }
        ),
      };
    }

    return { success: true, data: localStorage };
  } catch (error) {
    return {
      success: false,
      error: createThemeError(
        ThemeErrorType.PERSISTENCE_FAILED,
        `Storage access failed: ${error instanceof Error ? error.message : 'Storage quota exceeded or disabled'}`,
        {
          severity: ThemeErrorSeverity.MEDIUM,
          recoverable: true,
          cause: error instanceof Error ? error : undefined,
          ...context,
        }
      ),
    };
  }
};

// ==================== BATCH VALIDATION ====================

/**
 * Validate complete theme environment for initialization
 */
export const validateThemeEnvironment = (
  context?: CreateErrorOptions
): ThemeOperationResult<{
  dom: Document;
  storage: Storage | null;
}> => {
  const domResult = validateDOMAccess(context);
  if (!domResult.success) {
    return domResult as ThemeOperationResult<never>;
  }

  const storageResult = validateStorageAccess(context);

  // Storage failure is recoverable - theme can work without persistence
  if (!storageResult.success) {
    console.warn(
      '[theme-validation][environment] Storage validation failed, continuing without persistence',
      {
        error: storageResult.error.message,
        component: context?.component,
        operation: context?.operation,
      }
    );
  }

  return {
    success: true,
    data: {
      dom: domResult.data,
      storage: storageResult.success ? storageResult.data : null,
    },
  };
};

// ==================== SAFE OPERATION WRAPPERS ====================

/**
 * Safely execute theme operation with comprehensive error handling
 */
export const safeThemeOperation = async <T>(
  operation: () => T | Promise<T>,
  operationName: string,
  context?: CreateErrorOptions
): Promise<ThemeOperationResult<T>> => {
  try {
    const startTime = performance.now();
    const result = await operation();
    const duration = performance.now() - startTime;

    // Log successful operation for monitoring
    console.log(`[theme-validation][operation] ${operationName} completed successfully`, {
      duration: `${duration.toFixed(2)}ms`,
      component: context?.component,
      operation: context?.operation,
    });

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: createThemeError(
        ThemeErrorType.INITIALIZATION_FAILED,
        `${operationName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          severity: ThemeErrorSeverity.HIGH,
          context: { operationName },
          cause: error instanceof Error ? error : undefined,
          ...context,
        }
      ),
    };
  }
};

/**
 * Retry theme operation with intelligent exponential backoff
 */
export const retryThemeOperation = async <T>(
  operation: () => Promise<ThemeOperationResult<T>>,
  maxRetries = THEME_CONSTANTS.PERSISTENCE_RETRY_COUNT,
  baseDelay = THEME_CONSTANTS.ERROR_RECOVERY_DELAY,
  context?: CreateErrorOptions
): Promise<ThemeOperationResult<T>> => {
  let lastError: ThemeError | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[theme-validation][retry] Attempt ${attempt}/${maxRetries}`, {
      component: context?.component,
      operation: context?.operation,
    });

    const result = await operation();

    if (result.success) {
      if (attempt > 1) {
        console.log(`[theme-validation][retry] Operation succeeded after ${attempt} attempts`, {
          component: context?.component,
          operation: context?.operation,
        });
      }
      return result;
    }

    lastError = result.error;

    // Don't retry if error is not recoverable
    if (!result.error.recoverable) {
      console.warn('[theme-validation][retry] Error not recoverable, stopping retries', {
        error: result.error.message,
        type: result.error.type,
        component: context?.component,
      });
      break;
    }

    // Don't wait after the last attempt
    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`[theme-validation][retry] Waiting ${delay}ms before next attempt`, {
        attempt,
        delay,
        component: context?.component,
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error:
      lastError ||
      createThemeError(ThemeErrorType.INITIALIZATION_FAILED, 'All retry attempts failed', {
        severity: ThemeErrorSeverity.HIGH,
        context: { maxRetries, attempts: maxRetries },
        ...context,
      }),
  };
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if error is recoverable with detailed analysis
 */
export const isRecoverableError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  return 'recoverable' in error && Boolean(error.recoverable);
};

/**
 * Get error recovery strategy based on error type and context
 */
export const getErrorRecoveryStrategy = (error: ThemeError): ErrorRecoveryStrategy => {
  switch (error.type) {
    case ThemeErrorType.INVALID_THEME:
      return createErrorRecovery(true, {
        fallbackTheme: THEME_CONSTANTS.DEFAULT_THEME,
        userMessage: 'Invalid theme detected, switching to default theme',
        technicalDetails: `Theme validation failed: ${error.message}`,
        recommendedActions: ['Verify theme configuration', 'Check for typos in theme names'],
      });

    case ThemeErrorType.PERSISTENCE_FAILED:
      return createErrorRecovery(true, {
        fallbackTheme: THEME_CONSTANTS.DEFAULT_THEME,
        userMessage: 'Theme settings could not be saved, but functionality continues',
        technicalDetails: `Storage operation failed: ${error.message}`,
        recommendedActions: ['Check browser storage settings', 'Clear browser data if needed'],
      });

    case ThemeErrorType.DOM_ACCESS_FAILED:
      return createErrorRecovery(false, {
        userMessage: 'Theme system requires browser environment',
        technicalDetails: `DOM not accessible: ${error.message}`,
        recommendedActions: [
          'Ensure code runs in browser environment',
          'Check for SSR compatibility',
        ],
      });

    case ThemeErrorType.INITIALIZATION_FAILED:
      return createErrorRecovery(true, {
        fallbackTheme: THEME_CONSTANTS.DEFAULT_THEME,
        retryAction: () => window.location.reload(),
        userMessage: 'Theme initialization failed, try refreshing the page',
        technicalDetails: `Initialization error: ${error.message}`,
        recommendedActions: [
          'Refresh the page',
          'Check browser console for details',
          'Clear browser cache',
        ],
        maxRetries: 2,
      });

    case ThemeErrorType.VALIDATION_FAILED:
      return createErrorRecovery(true, {
        fallbackTheme: THEME_CONSTANTS.DEFAULT_THEME,
        userMessage: 'Theme validation failed, using default settings',
        technicalDetails: `Validation error: ${error.message}`,
        recommendedActions: ['Check data format', 'Verify input parameters'],
      });

    case ThemeErrorType.COMPONENT_ERROR:
      return createErrorRecovery(true, {
        fallbackTheme: THEME_CONSTANTS.DEFAULT_THEME,
        userMessage: 'Component error occurred, theme reset to default',
        technicalDetails: `Component error: ${error.message}`,
        recommendedActions: [
          'Check component props',
          'Verify component state',
          'Review error logs',
        ],
      });

    default:
      return createErrorRecovery(false, {
        userMessage: 'An unexpected theme error occurred',
        technicalDetails: `Unknown error type: ${error.type} - ${error.message}`,
        recommendedActions: ['Contact support', 'Check application logs'],
      });
  }
};

// ==================== ADDITIONAL VALIDATION FUNCTIONS ====================

/**
 * Validate complete theme state with all properties
 */
export const validateThemeState = (
  state: unknown,
  context?: CreateErrorOptions
): ThemeOperationResult<{ currentTheme: ThemeMode }> => {
  try {
    const result = ThemeStateSchema.safeParse(state);

    if (!result.success) {
      return {
        success: false,
        error: createThemeError(ThemeErrorType.VALIDATION_FAILED, 'Invalid theme state structure', {
          severity: ThemeErrorSeverity.MEDIUM,
          context: {
            provided: state,
            zodErrors: result.error.errors,
          },
          ...context,
        }),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: createThemeError(
        ThemeErrorType.VALIDATION_FAILED,
        `Theme state validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          severity: ThemeErrorSeverity.MEDIUM,
          cause: error instanceof Error ? error : undefined,
          ...context,
        }
      ),
    };
  }
};

/**
 * Quick theme mode validation using helper function
 */
export const quickValidateThemeMode = (mode: unknown): boolean => {
  return isValidThemeMode(mode);
};

/**
 * Parse theme mode from string with error handling
 */
export const parseThemeModeFromString = (
  input: string,
  context?: CreateErrorOptions
): ThemeOperationResult<ThemeMode> => {
  try {
    const parsed = parseThemeMode(input);
    if (parsed) {
      return { success: true, data: parsed };
    }

    return {
      success: false,
      error: createThemeError(
        ThemeErrorType.INVALID_THEME,
        `Could not parse theme mode from: ${input}`,
        {
          severity: ThemeErrorSeverity.LOW,
          context: { input, availableModes: THEME_MODES },
          ...context,
        }
      ),
    };
  } catch (error) {
    return {
      success: false,
      error: createThemeError(
        ThemeErrorType.VALIDATION_FAILED,
        `Theme parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          severity: ThemeErrorSeverity.MEDIUM,
          cause: error instanceof Error ? error : undefined,
          ...context,
        }
      ),
    };
  }
};
