/**
 * 🎮 Session Control Types - Simple Version
 *
 * Basic types for session management functionality.
 * Focused on Start/End session with duration tracking.
 */

// ==================== BASIC TYPES ====================

export type SessionStatus = 'idle' | 'active' | 'completed';

export interface SessionState {
  readonly status: SessionStatus;
  readonly startTime: number | null;
  readonly duration: number;
  readonly isExpanded: boolean;
  readonly isLoading: boolean;
}

// ==================== COMPUTED HELPERS ====================

export interface SessionDisplayInfo {
  readonly statusText: string;
  readonly actionButtonText: string;
  readonly formattedDuration: string;
  readonly statusBadgeClasses: string;
  readonly statusIndicatorClasses: string;
}

// ==================== EVENT TYPES ====================

export interface SessionActionPayload {
  readonly action: 'start' | 'end' | 'reset' | 'toggle';
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

// ==================== VALIDATION HELPERS ====================

export const isValidSessionStatus = (status: unknown): status is SessionStatus => {
  return typeof status === 'string' && ['idle', 'active', 'completed'].includes(status);
};
