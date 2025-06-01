/**
 * Notification Settings Configuration
 *
 * Centralized configuration for all notification banners including
 * session requirements, messages, icons, and auto-hide behavior.
 */

import type { NotificationType } from '@/design-system/primitives/NotificationBanner';

// =============================================================================
// NOTIFICATION TYPE CONFIGURATIONS
// =============================================================================

export interface NotificationConfig {
  title: string;
  message: string;
  isDismissible: boolean;
  hasAction: boolean;
  actionLabel: string;
  autoHide: boolean;
  autoHideDelay: number;
  ariaLive: 'polite' | 'assertive' | 'off';
}

export const NOTIFICATION_CONFIGS: Record<string, NotificationConfig> = {
  SESSION_REQUIRED: {
    title: 'Session Required',
    message: 'Betting, demo hands, and hand clearing are disabled until you start a session.',
    isDismissible: false,
    hasAction: false,
    actionLabel: '',
    autoHide: false,
    autoHideDelay: 0,
    ariaLive: 'polite',
  },
  DATABASE_CONNECTION_FAILED: {
    title: 'Database Connection Failed',
    message: 'Unable to connect to database. Sessions will work locally.',
    isDismissible: true,
    hasAction: true,
    actionLabel: 'Retry',
    autoHide: false,
    autoHideDelay: 0,
    ariaLive: 'assertive',
  },
  SESSION_STARTED: {
    title: 'Session Started',
    message: 'Gaming session is now active. You can place bets and deal cards.',
    isDismissible: true,
    hasAction: false,
    actionLabel: '',
    autoHide: true,
    autoHideDelay: 4000,
    ariaLive: 'polite',
  },
  SESSION_ENDED: {
    title: 'Session Ended',
    message: 'Gaming session has been completed. View results in history.',
    isDismissible: true,
    hasAction: false,
    actionLabel: '',
    autoHide: true,
    autoHideDelay: 5000,
    ariaLive: 'polite',
  },
  ANALYSIS_COMPLETE: {
    title: 'Analysis Complete',
    message: 'Burn card analysis has been completed successfully.',
    isDismissible: true,
    hasAction: false,
    actionLabel: '',
    autoHide: true,
    autoHideDelay: 4000,
    ariaLive: 'polite',
  },
  RISK_WARNING: {
    title: 'Risk Warning',
    message: 'Current bet size exceeds recommended risk threshold.',
    isDismissible: true,
    hasAction: true,
    actionLabel: 'Adjust',
    autoHide: false,
    autoHideDelay: 0,
    ariaLive: 'assertive',
  },
} as const;

// =============================================================================
// NOTIFICATION TYPE MAPPINGS
// =============================================================================

export const NOTIFICATION_TYPE_MAPPINGS: Record<string, NotificationType> = {
  SESSION_REQUIRED: 'session',
  DATABASE_CONNECTION_FAILED: 'error',
  SESSION_STARTED: 'success',
  SESSION_ENDED: 'info',
  ANALYSIS_COMPLETE: 'success',
  RISK_WARNING: 'warning',
} as const;

// =============================================================================
// NOTIFICATION TIMING CONFIGURATIONS
// =============================================================================

export const NOTIFICATION_TIMEOUTS = {
  SUCCESS: 4000,
  INFO: 4000,
  WARNING: 5000,
  ERROR: 6000,
  SESSION: 0, // Never auto-hide session notifications
} as const;

// =============================================================================
// ACCESSIBILITY CONFIGURATIONS
// =============================================================================

export const NOTIFICATION_ACCESSIBILITY = {
  ROLE: 'alert',
  ARIA_LIVE_POLITE: 'polite' as const,
  ARIA_LIVE_ASSERTIVE: 'assertive' as const,
  ARIA_LABEL_PREFIX: 'Notification:',
} as const;

// =============================================================================
// STRUCTURED LOGGING CATEGORIES
// =============================================================================

export const NOTIFICATION_LOG_CATEGORIES = {
  SESSION_REQUIRED: '[session-tracking][notification]',
  DATABASE_CONNECTION: '[data-persistence][notification]',
  SESSION_LIFECYCLE: '[session-tracking][notification]',
  ANALYSIS_RESULTS: '[burn-analysis][notification]',
  RISK_MANAGEMENT: '[risk-management][notification]',
  USER_INTERFACE: '[user-interface][notification]',
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get notification configuration by key
 */
export function getNotificationConfig(key: string): NotificationConfig | null {
  return NOTIFICATION_CONFIGS[key] || null;
}

/**
 * Get notification type by key
 */
export function getNotificationType(key: string): NotificationType {
  return NOTIFICATION_TYPE_MAPPINGS[key] || 'info';
}

/**
 * Get auto-hide delay based on notification type
 */
export function getAutoHideDelay(type: NotificationType): number {
  switch (type) {
    case 'success':
      return NOTIFICATION_TIMEOUTS.SUCCESS;
    case 'info':
      return NOTIFICATION_TIMEOUTS.INFO;
    case 'warning':
      return NOTIFICATION_TIMEOUTS.WARNING;
    case 'error':
      return NOTIFICATION_TIMEOUTS.ERROR;
    case 'session':
      return NOTIFICATION_TIMEOUTS.SESSION;
    default:
      return NOTIFICATION_TIMEOUTS.INFO;
  }
}

/**
 * Get appropriate aria-live value based on notification type
 */
export function getAriaLive(type: NotificationType): 'polite' | 'assertive' | 'off' {
  switch (type) {
    case 'error':
    case 'warning':
      return NOTIFICATION_ACCESSIBILITY.ARIA_LIVE_ASSERTIVE;
    case 'success':
    case 'info':
    case 'session':
    default:
      return NOTIFICATION_ACCESSIBILITY.ARIA_LIVE_POLITE;
  }
}

/**
 * Generate structured log category for notification
 */
export function getLogCategory(key: string): string {
  if (key.includes('SESSION')) {
    return NOTIFICATION_LOG_CATEGORIES.SESSION_LIFECYCLE;
  }
  if (key.includes('DATABASE')) {
    return NOTIFICATION_LOG_CATEGORIES.DATABASE_CONNECTION;
  }
  if (key.includes('ANALYSIS')) {
    return NOTIFICATION_LOG_CATEGORIES.ANALYSIS_RESULTS;
  }
  if (key.includes('RISK')) {
    return NOTIFICATION_LOG_CATEGORIES.RISK_MANAGEMENT;
  }
  return NOTIFICATION_LOG_CATEGORIES.USER_INTERFACE;
}
