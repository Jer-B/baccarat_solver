/**
 * 🔧 Offline Resilience Configuration - CDD Excellence
 *
 * Centralized configuration for offline resilience behavior.
 * Contains only values that actually affect system operation.
 *
 * @fileoverview Offline resilience system configuration
 * @version 1.0.0
 * @author CDD Architecture Team
 */

// ==================== SYNC BEHAVIOR ====================

export const SYNC_CONFIG = {
  /** Maximum retry attempts for failed sync operations */
  MAX_RETRIES: 3,

  /** Delay before triggering auto-sync after connection restored (ms) */
  SYNC_DELAY: 5000,

  /** Number of operations to process in each sync batch */
  BATCH_SIZE: 10,

  /** Timeout for individual sync operations (ms) */
  OPERATION_TIMEOUT: 30000,
} as const;

// ==================== CONNECTION MONITORING ====================

export const CONNECTION_CONFIG = {
  /** Health check interval (ms) */
  HEALTH_CHECK_INTERVAL: 30000,

  /** Connection timeout for health checks (ms) */
  TIMEOUT: 10000,

  /** Number of consecutive failures before marking as unhealthy */
  FAILURE_THRESHOLD: 3,

  /** Cooldown period after connection failure (ms) */
  FAILURE_COOLDOWN: 30000,

  /** UI status refresh interval (ms) */
  UI_REFRESH_INTERVAL: 30000,
} as const;

// ==================== STORAGE MANAGEMENT ====================

export const STORAGE_CONFIG = {
  /** LocalStorage keys for offline data persistence */
  KEYS: {
    OFFLINE_SESSIONS: 'cdd-offline-sessions',
    SYNC_QUEUE: 'cdd-sync-queue',
    CURRENT_SESSION: 'cdd-current-session',
  } as const,

  /** Maximum offline sessions to keep in localStorage */
  MAX_OFFLINE_SESSIONS: 1000,

  /** Days to keep synced sessions in localStorage */
  CLEANUP_AFTER_DAYS: 7,

  /** Timeout before triggering cleanup after mode change (ms) */
  CLEANUP_TIMEOUT: 5000,
} as const;

// ==================== CLEANUP BEHAVIOR ====================

export const CLEANUP_CONFIG = {
  /** Retention policies */
  RETENTION: {
    /** Days to keep synced sessions */
    SYNCED_SESSIONS_DAYS: 7,

    /** Maximum error log entries to keep */
    MAX_ERROR_ENTRIES: 100,

    /** Maximum sync queue size before forced cleanup */
    MAX_QUEUE_SIZE: 500,
  } as const,

  /** Cleanup thresholds */
  THRESHOLDS: {
    /** Maximum offline sessions before cleanup warning */
    SESSION_WARNING_LIMIT: 800,

    /** Maximum offline sessions before forced cleanup */
    SESSION_FORCE_LIMIT: 1000,
  } as const,
} as const;

// ==================== ID GENERATION ====================

export const ID_GENERATION_CONFIG = {
  /** Random string generation settings */
  RANDOM: {
    BASE: 36,
    SLICE_START: 2,
    SLICE_LENGTH: 9,
  } as const,
} as const;

// ==================== CONFLICT RESOLUTION ====================

export const CONFLICT_CONFIG = {
  /** Consider sessions with same name + start time as duplicates (ms) */
  DUPLICATE_TIME_THRESHOLD: 60000, // 1 minute

  /** Maximum auto-resolution attempts */
  MAX_AUTO_ATTEMPTS: 5,
} as const;
