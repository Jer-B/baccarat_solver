/**
 * 🎮 Session Control Validation - Simple Version
 *
 * Basic validation for session management functionality.
 */

import { z } from 'zod';
import type { SessionStatus } from '@/types/core/sessionControlTypes';
import { isValidSessionStatus } from '@/types/core/sessionControlTypes';

// ==================== BASIC SCHEMAS ====================

export const SessionStatusSchema = z.enum(['idle', 'active', 'completed']);

export const SessionStateSchema = z.object({
  status: SessionStatusSchema,
  startTime: z.number().nullable(),
  duration: z.number().min(0),
  isExpanded: z.boolean(),
  isLoading: z.boolean(),
});

// ==================== VALIDATION FUNCTIONS ====================

export const validateSessionStatus = isValidSessionStatus;

export const validateSessionState = (state: unknown) => {
  return SessionStateSchema.safeParse(state);
};

// ==================== BUSINESS RULES ====================

export const canStartSession = (status: SessionStatus): boolean => {
  return status === 'idle' || status === 'completed';
};

export const canEndSession = (status: SessionStatus): boolean => {
  return status === 'active';
};

export const canResetSession = (status: SessionStatus): boolean => {
  return status !== 'active';
};
