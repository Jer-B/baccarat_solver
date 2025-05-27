import { POSITION, type PluginOptions } from 'vue-toastification';

/**
 * Toast notification configuration for professional gambling analysis application
 *
 * Configuration follows professional UX standards:
 * - No pause on hover for uninterrupted workflow
 * - 4-second timeout for optimal readability
 * - Top-right position for non-intrusive notifications
 * - Drag-to-dismiss for quick interaction
 * - Maximum 5 toasts to prevent UI clutter
 */
export const toastConfig: PluginOptions = {
  // Position and timing
  position: POSITION.TOP_RIGHT,
  timeout: 4000, // 4 seconds for optimal readability

  // Interaction behavior
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: false, // Don't pause timer when hovering - maintains consistent timing

  // Drag behavior
  draggable: true,
  draggablePercent: 0.6, // 60% drag distance to dismiss

  // Visual settings
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,

  // Animation and layout
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5, // Limit to prevent UI clutter
  newestOnTop: true,
};

/**
 * Timeout configurations for different notification types
 * Used by useNotifications composable for consistent timing
 */
export const TOAST_TIMEOUTS = {
  SUCCESS: 4000, // Standard success messages
  INFO: 4000, // General information
  WARNING: 5000, // Warnings need slightly more time
  ERROR: 6000, // Errors need more time to read
  CRITICAL: 8000, // Critical errors need maximum time
} as const;

/**
 * Toast notification categories for structured logging
 * Maps to the [feature][category] logging format
 */
export const TOAST_CATEGORIES = {
  SESSION: 'session-tracking',
  ANALYSIS: 'burn-analysis',
  KELLY: 'kelly-criterion',
  MONTE_CARLO: 'monte-carlo',
  RISK: 'risk-management',
  BANKROLL: 'bankroll-management',
  UI: 'user-interface',
  VALIDATION: 'validation',
  ERROR: 'error-handling',
} as const;

export type ToastCategory = (typeof TOAST_CATEGORIES)[keyof typeof TOAST_CATEGORIES];
