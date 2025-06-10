/**
 * 🎮 Session Configuration - CDD Excellence
 *
 * Simple, centralized configuration for session control and recording.
 * Pure configuration only - no business logic.
 *
 * @fileoverview Session management configuration
 * @version 1.0.0
 * @author CDD Architecture Team
 */

// ==================== SESSION NAMING ====================

export const SESSION_NAMING = {
  /**
   * Sequential naming format: Session {number} {MMDD}-{HH:MM}
   * Example: "Session 1 0609-13:09", "Session 2 0609-14:25"
   */
  PREFIX: 'Session',
  FORMAT_TEMPLATE: 'Session {number} {MMDD}-{HH:MM}',

  /**
   * Pattern to extract session number from existing session names
   * Matches: "Session 1 0609-13:09", "Session 2 0610-09:15", etc.
   */
  NUMBER_PATTERN: /^Session\s+(\d+)\s+\d{4}-\d{2}:\d{2}$/,

  /**
   * Date formatting constants for fallback naming
   */
  DATE_FORMAT: {
    YEAR_DIGITS: 4,
    MONTH_PADDING: 2,
    DAY_PADDING: 2,
    HOUR_PADDING: 2,
    MINUTE_PADDING: 2,
    SECOND_PADDING: 2,
    MONTH_BASE: 1, // JavaScript months are 0-based, add 1
    PADDING_CHAR: '0',
  },

  /**
   * Session name validation limits
   */
  VALIDATION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
} as const;

// ==================== SESSION DATABASE ====================

export const SESSION_DATABASE = {
  TABLE_NAME: 'user_sessions',

  DEFAULTS: {
    START_BALANCE: null,
    END_BALANCE: null,
    CARDS_REMAINING: null,
  },

  LIFECYCLE_FLAGS: {
    ACTIVE: 1,
    COMPLETED: 2,
    INTERRUPTED: 3,
  },

  STATUS: {
    ACTIVE: 'active' as const,
    COMPLETED: 'completed' as const,
    INTERRUPTED: 'interrupted' as const,
  },
} as const;

// ==================== CONFIGURATION CONSTANTS ====================

/**
 * Maximum allowed session number before requiring cleanup
 */
export const MAX_SESSION_NUMBER = 999999;

/**
 * Session naming pattern validation regex
 */
export const SESSION_NAME_PATTERNS = {
  SEQUENTIAL: /^Session\s+\d+\s+\d{4}-\d{2}:\d{2}$/,
  FALLBACK: /^Session-\d{8}-\d{6}$/,
} as const;

/**
 * Status to lifecycle flag mapping for DRY compliance
 */
export const STATUS_TO_LIFECYCLE_FLAG = {
  active: SESSION_DATABASE.LIFECYCLE_FLAGS.ACTIVE,
  completed: SESSION_DATABASE.LIFECYCLE_FLAGS.COMPLETED,
  interrupted: SESSION_DATABASE.LIFECYCLE_FLAGS.INTERRUPTED,
} as const;

/**
 * Game session constants
 */
export const SESSION_GAME_CONSTANTS = {
  INITIAL_TOTAL_HANDS: 0,
} as const;
