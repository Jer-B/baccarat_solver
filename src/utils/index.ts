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

// ==================== NAVIGATION TIMING CONSTANTS ====================

/**
 * Navigation and routing timing constants
 */
export const NAVIGATION_TIMING = {
  /** Number of retry attempts for navigation operations */
  RETRY_ATTEMPTS: 3,

  /** Delay between navigation retry attempts (ms) */
  RETRY_DELAY_MS: 5000,

  /** Timeout for navigation transitions (ms) */
  TRANSITION_TIMEOUT_MS: 3000,

  /** Default animation duration for route transitions (ms) */
  ROUTE_TRANSITION_DURATION: 300,

  /** Debounce delay for rapid navigation attempts (ms) */
  NAVIGATION_DEBOUNCE: 150,
} as const;

// ==================== UI TIMING CONSTANTS ====================

/**
 * User interface timing constants for buttons, transitions, and animations
 */
export const UI_TIMING = {
  /** Timer update interval for real-time displays (ms) */
  TIMER_UPDATE_INTERVAL: 1000,

  /** Auto transition delay for status changes (ms) */
  AUTO_TRANSITION_DELAY: 3500,

  /** Artificial delay for start operations to show loading state (ms) */
  START_OPERATION_DELAY: 500,

  /** Artificial delay for end operations to show completion state (ms) */
  END_OPERATION_DELAY: 500,

  /** Artificial delay for reset operations (ms) */
  RESET_OPERATION_DELAY: 300,

  /** Standard button click feedback delay (ms) */
  BUTTON_FEEDBACK_DELAY: 200,

  /** Modal animation duration (ms) */
  MODAL_ANIMATION_DURATION: 300,

  /** Tooltip show/hide delay (ms) */
  TOOLTIP_DELAY: 800,

  /** Loading spinner minimum display time (ms) */
  LOADING_MINIMUM_DISPLAY: 400,
} as const;

// ==================== FUTURE UTILITY IMPORTS ====================
// Add future utility imports here as the application grows
// export * from './api/apiUtils';
// export * from './dom/domUtils';
// export * from './string/stringUtils';
// export * from './date/dateUtils';
// export * from './validation/formValidation';
// export * from './errors/apiErrorHandler';
