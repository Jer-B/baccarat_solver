/**
 * 🔍 Session Recording Validation - CDD Excellence
 *
 * Validation schemas for session recording database operations.
 * Ensures data integrity for DB operations.
 *
 * @fileoverview Session recording Zod validation schemas
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { z } from 'zod';

// ==================== BASE SCHEMAS ====================

export const SessionRecordIdSchema = z.string().uuid('Must be valid UUID');

export const SessionNameSchema = z
  .string()
  .min(1, 'Session name required')
  .max(100, 'Session name too long')
  .trim()
  .refine(
    name => {
      // Only accept new sequential format: Session {number} {MMDD}-{HH:MM}
      const sequentialWithDatePattern = /^Session\s+\d+\s+\d{4}-\d{2}:\d{2}$/;
      return sequentialWithDatePattern.test(name);
    },
    {
      message: 'Session name must follow format "Session {number} {MMDD}-{HH:MM}"',
    }
  );

export const TimestampSchema = z.string().datetime('Must be valid ISO datetime string');

export const DurationSecondsSchema = z
  .number()
  .int('Duration must be integer')
  .min(0, 'Duration cannot be negative');

export const SessionStatusSchema = z.enum(['active', 'completed', 'interrupted'] as const);

export const LifecycleFlagSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const BalanceSchema = z
  .number()
  .finite('Balance must be finite number')
  .multipleOf(0.01, 'Balance must have max 2 decimal places')
  .nullable()
  .optional();

// ==================== OPERATION SCHEMAS ====================

/**
 * Schema for creating new session record
 */
export const CreateSessionRecordSchema = z.object({
  session_name: SessionNameSchema,
  started_at: TimestampSchema,
  start_balance: BalanceSchema,
  cards_remaining: z.number().int().min(0).nullable().optional(),
});

/**
 * Schema for ending session record
 */
export const EndSessionRecordSchema = z.object({
  ended_at: TimestampSchema,
  duration_seconds: DurationSecondsSchema,
  status: z.union([z.literal('completed'), z.literal('interrupted')]),
  end_balance: BalanceSchema,
  total_hands: z.number().int().min(0).optional(),
});

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validates session creation data
 */
export const validateCreateSessionData = (data: unknown) => {
  return CreateSessionRecordSchema.safeParse(data);
};

/**
 * Validates session end data
 */
export const validateEndSessionData = (data: unknown) => {
  return EndSessionRecordSchema.safeParse(data);
};

// ==================== QUERY VALIDATION ====================

/**
 * Schema for validating session name query results
 */
export const SessionNameListSchema = z.array(z.string()).default([]);

/**
 * Validates session name query function results
 */
export const validateSessionNameQuery = (data: unknown) => {
  return SessionNameListSchema.safeParse(data);
};

/**
 * Schema for validating session number extraction
 */
export const SessionNumberSchema = z.number().int().min(1).max(999999);

/**
 * Validates extracted session number
 */
export const validateSessionNumber = (data: unknown) => {
  return SessionNumberSchema.safeParse(data);
};

// ==================== CONSTANTS ====================

export const VALIDATION_ERRORS = {
  INVALID_SESSION_NAME: 'Invalid session name format',
  INVALID_TIMESTAMP: 'Invalid timestamp format',
  INVALID_DURATION: 'Invalid duration value',
  INVALID_STATUS: 'Invalid session status',
  INVALID_BALANCE: 'Invalid balance amount',
  INVALID_QUERY_RESULT: 'Invalid session name query result',
  INVALID_SESSION_NUMBER: 'Invalid session number extracted',
  DATABASE_QUERY_FAILED: 'Failed to query existing session names',
} as const;
