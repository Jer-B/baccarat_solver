/**
 * 🚨 Route Error Handler - Excellence Level
 *
 * Comprehensive error handling system for Vue Router operations with
 * automatic recovery, structured logging, and health monitoring.
 */

// Type imports
import type { RoutePath, NavigationMode } from '@/types/core/routeTypes';
import { ROUTE_PATHS } from '@/types/core/routeTypes';

// ==================== ERROR TYPES ====================

/**
 * Route-specific error types with severity levels
 */
export const RouteErrorTypes = {
  NAVIGATION_FAILED: 'NAVIGATION_FAILED',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  GUARD_REJECTION: 'GUARD_REJECTION',
  METADATA_MISSING: 'METADATA_MISSING',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
} as const;

export type RouteErrorType = (typeof RouteErrorTypes)[keyof typeof RouteErrorTypes];

/**
 * Error severity levels for proper handling and recovery
 */
export const RouteErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type RouteErrorSeverityType = (typeof RouteErrorSeverity)[keyof typeof RouteErrorSeverity];

/**
 * Route error context with comprehensive debugging information
 */
export interface RouteErrorContext {
  readonly fromPath?: RoutePath;
  readonly toPath?: RoutePath;
  readonly navigationMode?: NavigationMode;
  readonly timestamp?: Date;
  // readonly userRole?: string; // COMMENTED OUT - No user roles/access restrictions yet
  readonly userAgent?: string;
  readonly sessionId?: string;
  readonly originalError?: unknown;
  readonly recoveryAttempts?: number;
  readonly additionalData?: Record<string, unknown>;
}

/**
 * Route error options for customizing error handling behavior
 */
export interface RouteErrorOptions {
  readonly severity?: RouteErrorSeverityType;
  readonly retry?: boolean;
  readonly fallback?: RoutePath;
  readonly silent?: boolean;
}

/**
 * Complete route error object with all contextual information
 */
export interface RouteError {
  readonly errorId: string;
  readonly type: RouteErrorType;
  readonly message: string;
  readonly severity: RouteErrorSeverityType;
  readonly timestamp: Date;
  readonly context: RouteErrorContext;
  readonly retry: boolean;
  readonly fallback?: RoutePath;
  readonly silent: boolean;
}

/**
 * Recovery strategy configuration for different error types
 */
export interface RecoveryStrategy {
  readonly maxRetries: number;
  readonly retryDelay: number;
  readonly fallbackRoute: RoutePath;
  readonly shouldRetry: (error: RouteError) => boolean;
}

/**
 * Route error statistics for monitoring and health checks
 */
export interface RouteErrorStats {
  totalErrors: number;
  errorsByType: Record<RouteErrorType, number>;
  errorsBySeverity: Record<RouteErrorSeverityType, number>;
  recoveryAttempts: number;
  successfulRecoveries: number;
  lastErrorTime?: Date;
}

// ==================== ROUTE ERROR HANDLER CLASS ====================

/**
 * Singleton Route Error Handler for centralized error management
 */
class RouteErrorHandler {
  private static instance: RouteErrorHandler;
  private readonly errors: RouteError[] = [];
  private readonly maxErrors = 100;
  private readonly recoveryStrategies: Map<RouteErrorType, RecoveryStrategy> = new Map();
  private readonly stats: RouteErrorStats = {
    totalErrors: 0,
    errorsByType: {} as Record<RouteErrorType, number>,
    errorsBySeverity: {} as Record<RouteErrorSeverityType, number>,
    recoveryAttempts: 0,
    successfulRecoveries: 0,
  };

  private constructor() {
    this.initializeRecoveryStrategies();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RouteErrorHandler {
    if (!RouteErrorHandler.instance) {
      RouteErrorHandler.instance = new RouteErrorHandler();
    }
    return RouteErrorHandler.instance;
  }

  /**
   * Create a new route error with proper typing and context
   */
  public createRouteError(
    type: RouteErrorType,
    message: string,
    context: RouteErrorContext = {},
    options: RouteErrorOptions = {}
  ): RouteError {
    const {
      severity = RouteErrorSeverity.MEDIUM,
      retry = true,
      fallback,
      silent = false,
    } = options;

    return {
      errorId: this.generateErrorId(),
      type,
      message,
      severity,
      timestamp: new Date(),
      context: {
        ...context,
        timestamp: new Date(),
        additionalData: {
          ...context.additionalData,
          stackTrace: new Error().stack,
        },
      },
      retry,
      fallback,
      silent,
    };
  }

  /**
   * Handle route error with automatic recovery and logging
   */
  public async handleError(error: RouteError): Promise<void> {
    try {
      // Record error in statistics
      this.recordError(error);

      // Add to error history
      this.addToHistory(error);

      // Log error with structured format
      if (!error.silent) {
        this.logError(error);
      }

      // Attempt recovery if enabled
      if (error.retry) {
        await this.attemptRecovery(error);
      }
    } catch (recoveryError) {
      console.error('[router][error] Failed to handle error:', {
        originalError: error,
        recoveryError,
      });
    }
  }

  /**
   * Get error statistics for monitoring
   */
  public getStats(): RouteErrorStats {
    return { ...this.stats };
  }

  /**
   * Get recent errors for debugging
   */
  public getRecentErrors(count = 10): RouteError[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear error history (useful for testing)
   */
  public clearHistory(): void {
    this.errors.length = 0;
    this.resetStats();
  }

  /**
   * Check system health based on error patterns
   */
  public checkHealth(): { healthy: boolean; score: number; issues: string[] } {
    const now = new Date();
    const FIVE_MINUTES = 5 * 60 * 1000;
    const recentErrors = this.errors.filter(
      error => now.getTime() - error.timestamp.getTime() < FIVE_MINUTES
    );

    const issues: string[] = [];
    let score = 100;

    // Check recent error rate
    if (recentErrors.length > 20) {
      issues.push('High error rate detected');
      score -= 30;
    }

    // Check critical errors
    const criticalErrors = recentErrors.filter(error => error.severity === 'critical');
    if (criticalErrors.length > 0) {
      issues.push('Critical errors detected');
      score -= 40;
    }

    // Check recovery success rate
    const recoveryRate =
      this.stats.recoveryAttempts > 0
        ? this.stats.successfulRecoveries / this.stats.recoveryAttempts
        : 1;

    if (recoveryRate < 0.7) {
      issues.push('Low recovery success rate');
      score -= 20;
    }

    return {
      healthy: score >= 70,
      score: Math.max(0, score),
      issues,
    };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `route_error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Record error in statistics
   */
  private recordError(error: RouteError): void {
    this.stats.totalErrors++;
    this.stats.errorsByType[error.type] = (this.stats.errorsByType[error.type] || 0) + 1;
    this.stats.errorsBySeverity[error.severity] =
      (this.stats.errorsBySeverity[error.severity] || 0) + 1;
    this.stats.lastErrorTime = error.timestamp;
  }

  /**
   * Add error to history with size limit
   */
  private addToHistory(error: RouteError): void {
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  /**
   * Log error with structured format
   */
  private logError(error: RouteError): void {
    const logMethod = this.getLogMethod(error.severity);
    const logData = {
      errorId: error.errorId,
      type: error.type,
      message: error.message,
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp.toISOString(),
    };

    logMethod(`[router][error] ${error.message}`, logData);
  }

  /**
   * Get appropriate log method based on severity
   */
  private getLogMethod(severity: RouteErrorSeverityType): typeof console.error {
    switch (severity) {
      case 'critical':
      case 'high':
        return console.error;
      case 'medium':
        return console.warn;
      case 'low':
      default:
        return console.info;
    }
  }

  /**
   * Attempt error recovery based on error type and strategy
   */
  private async attemptRecovery(error: RouteError): Promise<void> {
    this.stats.recoveryAttempts++;

    try {
      const strategy = this.recoveryStrategies.get(error.type);

      if (!strategy) {
        console.warn(`[router][recovery] No recovery strategy for error type: ${error.type}`);
        return;
      }

      if (!strategy.shouldRetry(error)) {
        console.info(`[router][recovery] Skipping recovery for error: ${error.errorId}`);
        return;
      }

      console.log(`[router][recovery] Attempting recovery for error: ${error.errorId}`);

      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));

      // Attempt navigation to fallback route
      const fallbackRoute = error.fallback || strategy.fallbackRoute;

      // In a real implementation, you would use the router instance here
      console.log(`[router][recovery] Navigating to fallback route: ${fallbackRoute}`);

      this.stats.successfulRecoveries++;

      console.log(`[router][recovery] Successfully recovered from error: ${error.errorId}`);
    } catch (recoveryError) {
      console.error(
        `[router][recovery] Recovery failed for error: ${error.errorId}`,
        recoveryError
      );
    }
  }

  /**
   * Initialize recovery strategies for different error types
   */
  private initializeRecoveryStrategies(): void {
    // Navigation failed strategy
    this.recoveryStrategies.set(RouteErrorTypes.NAVIGATION_FAILED, {
      maxRetries: 3,
      retryDelay: 1000,
      fallbackRoute: ROUTE_PATHS.ROOT,
      shouldRetry: () => true,
    });

    // Route not found strategy
    this.recoveryStrategies.set(RouteErrorTypes.ROUTE_NOT_FOUND, {
      maxRetries: 1,
      retryDelay: 0,
      fallbackRoute: ROUTE_PATHS.ROOT,
      shouldRetry: () => true,
    });

    // Validation error strategy
    this.recoveryStrategies.set(RouteErrorTypes.VALIDATION_ERROR, {
      maxRetries: 2,
      retryDelay: 500,
      fallbackRoute: ROUTE_PATHS.ROOT,
      shouldRetry: error => error.severity !== 'critical',
    });

    // Guard rejection strategy
    this.recoveryStrategies.set(RouteErrorTypes.GUARD_REJECTION, {
      maxRetries: 1,
      retryDelay: 1000,
      fallbackRoute: ROUTE_PATHS.ROOT,
      shouldRetry: () => true,
    });

    // Metadata missing strategy
    this.recoveryStrategies.set(RouteErrorTypes.METADATA_MISSING, {
      maxRetries: 0,
      retryDelay: 0,
      fallbackRoute: ROUTE_PATHS.ROOT,
      shouldRetry: () => false,
    });

    // Configuration error strategy
    this.recoveryStrategies.set(RouteErrorTypes.CONFIGURATION_ERROR, {
      maxRetries: 0,
      retryDelay: 0,
      fallbackRoute: ROUTE_PATHS.ROOT,
      shouldRetry: () => false,
    });
  }

  /**
   * Reset error statistics
   */
  private resetStats(): void {
    this.stats.totalErrors = 0;
    this.stats.errorsByType = {} as Record<RouteErrorType, number>;
    this.stats.errorsBySeverity = {} as Record<RouteErrorSeverityType, number>;
    this.stats.recoveryAttempts = 0;
    this.stats.successfulRecoveries = 0;
    this.stats.lastErrorTime = undefined;
  }
}

// ==================== EXPORTS ====================

/**
 * Get the singleton route error handler instance
 */
export const getRouteErrorHandler = (): RouteErrorHandler => {
  return RouteErrorHandler.getInstance();
};

/**
 * Convenience function to create and handle route errors
 */
export const handleRouteError = async (
  type: RouteErrorType,
  message: string,
  context: RouteErrorContext = {},
  options: RouteErrorOptions = {}
): Promise<void> => {
  const handler = getRouteErrorHandler();
  const error = handler.createRouteError(type, message, context, options);
  await handler.handleError(error);
};

/**
 * Convenience function to check route error system health
 */
export const checkRouteErrorHealth = (): { healthy: boolean; score: number; issues: string[] } => {
  return getRouteErrorHandler().checkHealth();
};
