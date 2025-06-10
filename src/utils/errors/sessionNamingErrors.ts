/**
 * 🚨 Session Naming Error Handling - CDD Excellence
 *
 * Comprehensive error handling for session naming operations.
 * Handles database query failures, validation errors, and recovery strategies.
 *
 * @fileoverview Session naming error handling utilities
 * @version 1.0.0
 * @author CDD Architecture Team
 */

// ==================== ERROR TYPES ====================

/**
 * Base class for session naming errors
 */
export class SessionNamingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SessionNamingError';
  }
}

/**
 * Database query failed during session naming
 */
export class DatabaseQueryError extends SessionNamingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_QUERY_FAILED', context);
    this.name = 'DatabaseQueryError';
  }
}

/**
 * Invalid session name format detected
 */
export class InvalidSessionNameError extends SessionNamingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'INVALID_SESSION_NAME', context);
    this.name = 'InvalidSessionNameError';
  }
}

/**
 * Session number extraction failed
 */
export class SessionNumberExtractionError extends SessionNamingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SESSION_NUMBER_EXTRACTION_FAILED', context);
    this.name = 'SessionNumberExtractionError';
  }
}

/**
 * Sequential naming limit exceeded (too many sessions)
 */
export class SequentialLimitError extends SessionNamingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SEQUENTIAL_LIMIT_EXCEEDED', context);
    this.name = 'SequentialLimitError';
  }
}

// ==================== ERROR HANDLING UTILITIES ====================

/**
 * Result type for session naming operations
 */
export type SessionNamingResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: SessionNamingError };

/**
 * Safe wrapper for session name generation with error handling
 */
export const safeGenerateSessionName = async (
  queryFn: () => Promise<string[]>,
  fallbackFn: () => string
): Promise<SessionNamingResult<string>> => {
  try {
    console.log('[session-naming][safe] Attempting sequential session name generation');

    // Validate query function
    if (typeof queryFn !== 'function') {
      throw new DatabaseQueryError('Query function is not a valid function', { queryFn });
    }

    // Execute query
    let existingNames: string[];
    try {
      existingNames = await queryFn();
    } catch (queryError) {
      throw new DatabaseQueryError('Failed to query existing session names', {
        originalError: queryError instanceof Error ? queryError.message : 'Unknown error',
        queryFunction: queryFn.name || 'anonymous',
      });
    }

    // Validate query result
    if (!Array.isArray(existingNames)) {
      throw new DatabaseQueryError('Query function returned invalid result (not an array)', {
        result: existingNames,
        type: typeof existingNames,
      });
    }

    // Filter valid names
    const validNames = existingNames.filter(name => typeof name === 'string' && name.length > 0);

    if (validNames.length !== existingNames.length) {
      console.warn('[session-naming][safe] Some session names were invalid', {
        total: existingNames.length,
        valid: validNames.length,
        invalid: existingNames.length - validNames.length,
      });
    }

    // Generate session name
    const { sessionNamingService } = await import('../../services/sessionNamingService');
    const sessionName = await sessionNamingService.generateSessionName(queryFn);

    console.log('[session-naming][safe] Sequential session name generated successfully', {
      sessionName,
      totalExisting: existingNames.length,
      validExisting: validNames.length,
    });

    return { success: true, data: sessionName };
  } catch (error) {
    console.error('[session-naming][safe] Sequential naming failed, using fallback', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof SessionNamingError ? error.code : 'UNKNOWN',
    });

    // Use fallback naming
    try {
      const fallbackName = fallbackFn();

      console.log('[session-naming][safe] Fallback session name generated', {
        fallbackName,
        reason: error instanceof Error ? error.message : 'Unknown error',
      });

      return { success: true, data: fallbackName };
    } catch (fallbackError) {
      const sessionError = new SessionNamingError(
        'Both sequential and fallback naming failed',
        'COMPLETE_NAMING_FAILURE',
        {
          sequentialError: error instanceof Error ? error.message : 'Unknown error',
          fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
        }
      );

      return { success: false, error: sessionError };
    }
  }
};

/**
 * Validate session name format
 */
export const validateSessionNameFormat = (sessionName: string): SessionNamingResult<string> => {
  try {
    if (!sessionName || typeof sessionName !== 'string') {
      throw new InvalidSessionNameError('Session name must be a non-empty string', { sessionName });
    }

    const trimmedName = sessionName.trim();
    if (trimmedName.length === 0) {
      throw new InvalidSessionNameError('Session name cannot be empty or whitespace only', {
        sessionName,
      });
    }

    if (trimmedName.length > 100) {
      throw new InvalidSessionNameError('Session name too long (max 100 characters)', {
        sessionName,
        length: trimmedName.length,
      });
    }

    // Check format patterns - only accept new format: Session {number} {MMDD}-{HH:MM}
    const sequentialWithDatePattern = /^Session\s+\d+\s+\d{4}-\d{2}:\d{2}$/; // Session 1 0609-13:09

    if (!sequentialWithDatePattern.test(trimmedName)) {
      throw new InvalidSessionNameError(
        'Session name must follow format "Session {number} {MMDD}-{HH:MM}"',
        { sessionName: trimmedName }
      );
    }

    return { success: true, data: trimmedName };
  } catch (error) {
    if (error instanceof SessionNamingError) {
      return { success: false, error };
    }

    return {
      success: false,
      error: new InvalidSessionNameError('Unexpected validation error', { sessionName, error }),
    };
  }
};

/**
 * Extract session number from session name
 */
export const extractSessionNumber = (sessionName: string): SessionNamingResult<number> => {
  try {
    const { SESSION_NAMING } = require('../../config/sessionConfig');
    const match = sessionName.match(SESSION_NAMING.NUMBER_PATTERN);

    if (!match) {
      throw new SessionNumberExtractionError('Session name does not match sequential pattern', {
        sessionName,
        pattern: SESSION_NAMING.NUMBER_PATTERN.toString(),
      });
    }

    const number = parseInt(match[1], 10);

    if (isNaN(number) || number <= 0) {
      throw new SessionNumberExtractionError('Invalid session number extracted', {
        sessionName,
        extractedValue: match[1],
        parsedNumber: number,
      });
    }

    if (number > 999999) {
      throw new SequentialLimitError('Session number exceeds maximum limit', {
        sessionName,
        number,
        maxLimit: 999999,
      });
    }

    return { success: true, data: number };
  } catch (error) {
    if (error instanceof SessionNamingError) {
      return { success: false, error };
    }

    return {
      success: false,
      error: new SessionNumberExtractionError('Unexpected extraction error', {
        sessionName,
        error,
      }),
    };
  }
};

// ==================== ERROR RECOVERY STRATEGIES ====================

export const SESSION_NAMING_RECOVERY = {
  /**
   * Default fallback when all naming strategies fail
   */
  EMERGENCY_FALLBACK: () => `Session-Emergency-${Date.now()}`,

  /**
   * Retry configuration for database operations
   */
  RETRY_CONFIG: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  },

  /**
   * Maximum session number before switching to timestamp format
   */
  MAX_SEQUENTIAL_NUMBER: 999999,
} as const;
