/**
 * 🎯 Utilities System - Main Index
 *
 * Centralized utility exports with organized structure for validation, error handling,
 * and other utility functions. This file provides single import location for all utilities.
 */

// ==================== VALIDATION UTILITIES ====================
export * from './validation/themeValidation';

// ==================== ERROR HANDLING UTILITIES ====================
export * from './errors/themeErrorHandler';

// ==================== UTILITY CONSTANTS ====================

/**
 * Common utility constants used across the application
 */
export const UTILITY_CONSTANTS = {
  /** Default timeout for async operations (ms) */
  DEFAULT_TIMEOUT: 5000,

  /** Default retry attempts for failed operations */
  DEFAULT_RETRY_ATTEMPTS: 3,

  /** Default delay between retry attempts (ms) */
  DEFAULT_RETRY_DELAY: 1000,

  /** Maximum safe integer for calculations */
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,

  /** Minimum safe integer for calculations */
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,

  /** Default debounce delay for UI interactions (ms) */
  DEFAULT_DEBOUNCE_DELAY: 300,
} as const;

// ==================== FUTURE UTILITY IMPORTS ====================
// Add future utility imports here as the application grows
// export * from './api/apiUtils';
// export * from './dom/domUtils';
// export * from './string/stringUtils';
// export * from './date/dateUtils';
// export * from './validation/formValidation';
// export * from './errors/apiErrorHandler';
