/**
 * 🎯 Theme System - Error Handler Utilities
 *
 * Excellence-level error handling system for theme operations with comprehensive
 * error management, monitoring, and automatic recovery mechanisms.
 */

import type { ThemeMode } from '@/types/core/themeTypes';
import type {
  ThemeError,
  ThemeErrorWithRecovery,
  ErrorRecoveryResult,
  ErrorRecoveryStrategy,
  ErrorMonitorConfig,
  ErrorStatistics,
  ComponentErrorContext,
  StoreErrorContext,
  ValidationErrorContext,
  ThemeErrorHandler as ThemeErrorHandlerType,
} from '@/types/errors/themeErrorTypes';
import { ThemeErrorType, ThemeErrorSeverity } from '@/types/errors/themeErrorTypes';
import { THEME_CONSTANTS } from '@/types/core/themeTypes';
import {
  createThemeError,
  createErrorRecovery,
  getErrorRecoveryStrategy,
  isRecoverableError,
} from '@/utils/validation/themeValidation';

// ==================== THEME ERROR HANDLER CLASS ====================

/**
 * Centralized theme error handler with monitoring and recovery capabilities
 */
export class ThemeErrorHandler {
  private static instance: ThemeErrorHandler | null = null;
  private errorHistory: ThemeErrorWithRecovery[] = [];
  private errorStats: ErrorStatistics;
  private config: ErrorMonitorConfig;

  private constructor(config?: Partial<ErrorMonitorConfig>) {
    this.config = {
      maxHistorySize: 100,
      analysisWindow: 3600000, // 1 hour
      errorThreshold: 10,
      autoRecovery: true,
      ...config,
    };

    this.errorStats = this.initializeStats();
    this.startMonitoring();
  }

  /**
   * Get singleton instance of error handler
   */
  public static getInstance(config?: Partial<ErrorMonitorConfig>): ThemeErrorHandler {
    if (!ThemeErrorHandler.instance) {
      ThemeErrorHandler.instance = new ThemeErrorHandler(config);
    }
    return ThemeErrorHandler.instance;
  }

  /**
   * Handle theme error with comprehensive recovery
   */
  public async handleError(
    error: ThemeError | Error,
    context?: ComponentErrorContext | StoreErrorContext | ValidationErrorContext
  ): Promise<ErrorRecoveryResult> {
    const startTime = performance.now();

    // Convert to ThemeError if necessary
    const themeError = this.normalizeError(error, context);

    // Log error with structured logging
    this.logError(themeError, context);

    // Get recovery strategy
    const strategy = getErrorRecoveryStrategy(themeError);

    // Create error with recovery info
    const errorWithRecovery: ThemeErrorWithRecovery = {
      ...themeError,
      recovery: strategy,
      recoveryAttempted: false,
      recoverySuccessful: false,
      recoveryTimestamp: Date.now(),
    };

    // Add to history
    this.addToHistory(errorWithRecovery);

    // Update statistics
    this.updateStats(themeError);

    // Attempt recovery if enabled and possible
    let recoveryResult: ErrorRecoveryResult;

    if (this.config.autoRecovery && strategy.canRecover) {
      recoveryResult = await this.attemptRecovery(errorWithRecovery, context);
    } else {
      recoveryResult = {
        success: false,
        appliedTheme: strategy.fallbackTheme,
        strategy,
        originalError: themeError,
        recoveryTime: performance.now() - startTime,
        details: { reason: 'Auto-recovery disabled or error not recoverable' },
      };
    }

    // Log recovery result
    this.logRecoveryResult(recoveryResult, context);

    return recoveryResult;
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStatistics(): ErrorStatistics {
    return { ...this.errorStats };
  }

  /**
   * Get error history for analysis
   */
  public getErrorHistory(): ReadonlyArray<ThemeErrorWithRecovery> {
    return [...this.errorHistory];
  }

  /**
   * Clear error history and reset statistics
   */
  public clearHistory(): void {
    console.log('[theme-error-handler][cleanup] Clearing error history', {
      previousCount: this.errorHistory.length,
      timestamp: new Date().toISOString(),
    });

    this.errorHistory = [];
    this.errorStats = this.initializeStats();
  }

  /**
   * Check system health based on error patterns
   */
  public checkSystemHealth(): {
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const recentErrors = this.getRecentErrors();
    const criticalErrors = recentErrors.filter(e => e.severity === ThemeErrorSeverity.CRITICAL);
    const errorRate = this.calculateErrorRate();

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (criticalErrors.length > 0) {
      issues.push(`${criticalErrors.length} critical errors in the last hour`);
      recommendations.push('Investigate critical errors immediately');
    }

    if (errorRate > this.config.errorThreshold) {
      issues.push(`High error rate: ${errorRate.toFixed(2)} errors/hour`);
      recommendations.push('Review error patterns and consider system restart');
    }

    const isHealthy = issues.length === 0;

    console.log('[theme-error-handler][health-check] System health check completed', {
      isHealthy,
      issueCount: issues.length,
      errorRate: errorRate.toFixed(2),
      totalErrors: this.errorStats.total,
    });

    return { isHealthy, issues, recommendations };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Normalize any error to ThemeError format
   */
  private normalizeError(
    error: ThemeError | Error,
    context?: ComponentErrorContext | StoreErrorContext | ValidationErrorContext
  ): ThemeError {
    if ('type' in error && 'severity' in error) {
      return error as ThemeError;
    }

    // Convert generic Error to ThemeError
    return createThemeError(
      ThemeErrorType.COMPONENT_ERROR,
      error.message || 'Unknown error occurred',
      {
        severity: ThemeErrorSeverity.MEDIUM,
        recoverable: true,
        component: context && 'componentName' in context ? context.componentName : undefined,
        operation: context && 'action' in context ? context.action : undefined,
        cause: error,
        context: { originalError: error },
      }
    );
  }

  /**
   * Add error to history with size management
   */
  private addToHistory(error: ThemeErrorWithRecovery): void {
    this.errorHistory.push(error);

    // Maintain max history size
    if (this.errorHistory.length > this.config.maxHistorySize) {
      const removed = this.errorHistory.shift();
      console.log('[theme-error-handler][history] Removed oldest error from history', {
        removedType: removed?.type,
        currentSize: this.errorHistory.length,
        maxSize: this.config.maxHistorySize,
      });
    }
  }

  /**
   * Attempt error recovery with the provided strategy
   */
  private async attemptRecovery(
    error: ThemeErrorWithRecovery,
    context?: ComponentErrorContext | StoreErrorContext | ValidationErrorContext
  ): Promise<ErrorRecoveryResult> {
    const startTime = performance.now();

    console.log('[theme-error-handler][recovery] Attempting error recovery', {
      errorType: error.type,
      severity: error.severity,
      strategy: error.recovery.canRecover ? 'recovery' : 'fallback',
      component: context && 'componentName' in context ? context.componentName : undefined,
    });

    error.recoveryAttempted = true;
    error.recoveryTimestamp = Date.now();

    try {
      // Apply fallback theme if available
      if (error.recovery.fallbackTheme) {
        await this.applyFallbackTheme(error.recovery.fallbackTheme);
      }

      // Execute retry action if available
      if (error.recovery.retryAction) {
        await error.recovery.retryAction();
      }

      error.recoverySuccessful = true;

      const recoveryTime = performance.now() - startTime;

      return {
        success: true,
        appliedTheme: error.recovery.fallbackTheme,
        strategy: error.recovery,
        originalError: error,
        recoveryTime,
        details: {
          recoveryMethod: error.recovery.retryAction ? 'retry-action' : 'fallback-theme',
        },
      };
    } catch (recoveryError) {
      error.recoverySuccessful = false;

      console.error('[theme-error-handler][recovery] Recovery attempt failed', {
        originalError: error.message,
        recoveryError:
          recoveryError instanceof Error ? recoveryError.message : 'Unknown recovery error',
        component: context && 'componentName' in context ? context.componentName : undefined,
      });

      const recoveryTime = performance.now() - startTime;

      return {
        success: false,
        appliedTheme: error.recovery.fallbackTheme,
        strategy: error.recovery,
        originalError: error,
        recoveryTime,
        details: {
          recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Apply fallback theme safely
   */
  private async applyFallbackTheme(fallbackTheme: ThemeMode): Promise<void> {
    try {
      // This would integrate with your theme store
      // For now, we'll just apply to document element
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('data-theme', fallbackTheme);

        console.log('[theme-error-handler][fallback] Applied fallback theme', {
          theme: fallbackTheme,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('[theme-error-handler][fallback] Failed to apply fallback theme', {
        theme: fallbackTheme,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Initialize error statistics
   */
  private initializeStats(): ErrorStatistics {
    return {
      total: 0,
      byType: Object.fromEntries(Object.values(ThemeErrorType).map(type => [type, 0])) as Record<
        ThemeErrorType,
        number
      >,
      bySeverity: Object.fromEntries(
        Object.values(ThemeErrorSeverity).map(severity => [severity, 0])
      ) as Record<ThemeErrorSeverity, number>,
      criticalCount: 0,
      recoverableCount: 0,
      averageRecoveryTime: 0,
      errorFrequency: 0,
    };
  }

  /**
   * Update error statistics
   */
  private updateStats(error: ThemeError): void {
    this.errorStats.total++;
    this.errorStats.byType[error.type]++;
    this.errorStats.bySeverity[error.severity]++;

    if (error.severity === ThemeErrorSeverity.CRITICAL) {
      this.errorStats.criticalCount++;
    }

    if (error.recoverable) {
      this.errorStats.recoverableCount++;
    }

    // Update error frequency
    this.errorStats.errorFrequency = this.calculateErrorRate();
  }

  /**
   * Calculate current error rate (errors per hour)
   */
  private calculateErrorRate(): number {
    const recentErrors = this.getRecentErrors();
    const timeWindowHours = this.config.analysisWindow / 3600000;
    return recentErrors.length / timeWindowHours;
  }

  /**
   * Get errors from recent time window
   */
  private getRecentErrors(): ThemeErrorWithRecovery[] {
    const cutoff = Date.now() - this.config.analysisWindow;
    return this.errorHistory.filter(error => error.timestamp >= cutoff);
  }

  /**
   * Start monitoring for error patterns
   */
  private startMonitoring(): void {
    // Check for error patterns every 5 minutes
    setInterval(() => {
      this.analyzeErrorPatterns();
    }, 300000);

    console.log('[theme-error-handler][monitoring] Error monitoring started', {
      maxHistorySize: this.config.maxHistorySize,
      analysisWindow: `${this.config.analysisWindow / 60000} minutes`,
      errorThreshold: this.config.errorThreshold,
      autoRecovery: this.config.autoRecovery,
    });
  }

  /**
   * Analyze error patterns for proactive monitoring
   */
  private analyzeErrorPatterns(): void {
    const recentErrors = this.getRecentErrors();
    const health = this.checkSystemHealth();

    if (!health.isHealthy) {
      console.warn('[theme-error-handler][monitoring] System health issues detected', {
        issues: health.issues,
        recommendations: health.recommendations,
        recentErrorCount: recentErrors.length,
      });
    }

    // Check for recurring error patterns
    const errorPatterns = this.detectErrorPatterns(recentErrors);
    if (errorPatterns.length > 0) {
      console.warn('[theme-error-handler][monitoring] Recurring error patterns detected', {
        patterns: errorPatterns,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Detect recurring error patterns
   */
  private detectErrorPatterns(errors: ThemeErrorWithRecovery[]): string[] {
    const patterns: string[] = [];

    // Group errors by type and component
    const errorGroups = errors.reduce(
      (groups, error) => {
        const key = `${error.type}:${error.component || 'unknown'}`;
        groups[key] = (groups[key] || 0) + 1;
        return groups;
      },
      {} as Record<string, number>
    );

    // Find patterns with high frequency
    Object.entries(errorGroups).forEach(([pattern, count]) => {
      if (count >= 3) {
        patterns.push(`${pattern} (${count} occurrences)`);
      }
    });

    return patterns;
  }

  /**
   * Log error with structured logging
   */
  private logError(
    error: ThemeError,
    context?: ComponentErrorContext | StoreErrorContext | ValidationErrorContext
  ): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMethod = console[logLevel] || console.error;

    logMethod('[theme-error-handler][error] Theme error occurred', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      recoverable: error.recoverable,
      theme: error.theme,
      component: error.component,
      operation: error.operation,
      timestamp: new Date(error.timestamp).toISOString(),
      context: context ? this.sanitizeContext(context) : undefined,
    });
  }

  /**
   * Log recovery result
   */
  private logRecoveryResult(
    result: ErrorRecoveryResult,
    context?: ComponentErrorContext | StoreErrorContext | ValidationErrorContext
  ): void {
    const logMethod = result.success ? console.log : console.warn;

    logMethod(
      `[theme-error-handler][recovery] Recovery ${result.success ? 'succeeded' : 'failed'}`,
      {
        success: result.success,
        appliedTheme: result.appliedTheme,
        recoveryTime: `${result.recoveryTime.toFixed(2)}ms`,
        originalErrorType: result.originalError.type,
        component: context && 'componentName' in context ? context.componentName : undefined,
        details: result.details,
      }
    );
  }

  /**
   * Get appropriate log level for error severity
   */
  private getLogLevel(severity: ThemeErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ThemeErrorSeverity.LOW:
        return 'log';
      case ThemeErrorSeverity.MEDIUM:
        return 'warn';
      case ThemeErrorSeverity.HIGH:
      case ThemeErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'error';
    }
  }

  /**
   * Sanitize context for logging (remove sensitive data)
   */
  private sanitizeContext(
    context: ComponentErrorContext | StoreErrorContext | ValidationErrorContext
  ): Record<string, unknown> {
    const sanitized = { ...context };

    // Remove potentially sensitive data
    if ('props' in sanitized) {
      delete sanitized.props;
    }
    if ('state' in sanitized) {
      delete sanitized.state;
    }

    return sanitized;
  }
}

// ==================== CONVENIENCE FUNCTIONS ====================

/**
 * Handle theme operation result with automatic error handling
 */
export const handleThemeOperationResult = async <T>(
  result: { success: boolean; data?: T; error?: ThemeError },
  context?: {
    component?: string;
    operation?: string;
    fallbackTheme?: ThemeMode;
  }
): Promise<T | null> => {
  if (result.success && result.data !== undefined) {
    return result.data;
  }

  if (result.error) {
    const handler = ThemeErrorHandler.getInstance();
    const recoveryResult = await handler.handleError(result.error, {
      componentName: context?.component || 'unknown',
      instanceId: `${Date.now()}`,
    });

    if (recoveryResult.success && recoveryResult.appliedTheme) {
      console.log('[theme-error-handler][convenience] Operation recovered successfully', {
        component: context?.component,
        operation: context?.operation,
        appliedTheme: recoveryResult.appliedTheme,
      });
    }
  }

  return null;
};

/**
 * Create error boundary function for Vue components
 */
export const createThemeErrorBoundary = (
  componentName: string,
  customHandler?: (error: ThemeError, context?: any) => Promise<ErrorRecoveryResult>
): ((error: Error, info: { componentStack: string }) => void) => {
  return async (error: Error, info: { componentStack: string }) => {
    const handler = ThemeErrorHandler.getInstance();

    const themeError = createThemeError(
      ThemeErrorType.COMPONENT_ERROR,
      `Component error in ${componentName}: ${error.message}`,
      {
        severity: ThemeErrorSeverity.HIGH,
        component: componentName,
        context: {
          componentStack: info.componentStack,
          originalError: error,
        },
        cause: error,
      }
    );

    if (customHandler) {
      await customHandler(themeError, {
        componentName,
        lifecycle: 'error-boundary',
      });
    } else {
      await handler.handleError(themeError, {
        componentName,
        lifecycle: 'error-boundary',
      });
    }
  };
};

// ==================== ERROR MONITOR ====================

/**
 * Theme Error Monitor for system health tracking
 */
export class ThemeErrorMonitor {
  private handler: ThemeErrorHandler;
  private healthCheckInterval: number | null = null;

  constructor(config?: Partial<ErrorMonitorConfig>) {
    this.handler = ThemeErrorHandler.getInstance(config);
  }

  /**
   * Start health monitoring
   */
  public startMonitoring(intervalMs = 300000): void {
    if (this.healthCheckInterval) {
      this.stopMonitoring();
    }

    this.healthCheckInterval = window.setInterval(() => {
      const health = this.handler.checkSystemHealth();

      if (!health.isHealthy) {
        console.warn('[theme-error-monitor][health] System health alert', {
          issues: health.issues,
          recommendations: health.recommendations,
        });
      }
    }, intervalMs);

    console.log('[theme-error-monitor][monitoring] Health monitoring started', {
      interval: `${intervalMs / 1000}s`,
    });
  }

  /**
   * Stop health monitoring
   */
  public stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;

      console.log('[theme-error-monitor][monitoring] Health monitoring stopped');
    }
  }

  /**
   * Get current system status
   */
  public getSystemStatus(): {
    health: ReturnType<ThemeErrorHandler['checkSystemHealth']>;
    statistics: ErrorStatistics;
    recentErrors: number;
  } {
    const health = this.handler.checkSystemHealth();
    const statistics = this.handler.getErrorStatistics();
    const recentErrors = this.handler
      .getErrorHistory()
      .filter(error => Date.now() - error.timestamp < 3600000).length;

    return { health, statistics, recentErrors };
  }
}

// ==================== GLOBAL ERROR HANDLER INSTANCE ====================

/**
 * Global theme error handler instance for convenience
 */
export const globalThemeErrorHandler = ThemeErrorHandler.getInstance({
  autoRecovery: true,
  maxHistorySize: 100,
  errorThreshold: 10,
});

/**
 * Global theme error monitor instance for convenience
 */
export const globalThemeErrorMonitor = new ThemeErrorMonitor({
  autoRecovery: true,
  maxHistorySize: 100,
  errorThreshold: 10,
});
