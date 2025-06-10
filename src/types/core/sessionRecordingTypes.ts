/**
 * 🏗️ Session Recording Types - CDD Excellence
 *
 * Types for database session recording operations.
 * Clean separation from session control logic.
 *
 * @fileoverview Session recording branded types and database interfaces
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { sessionNamingService } from '../../services/sessionNamingService';

// ==================== BRANDED TYPES ====================

type Brand<T, TBrand> = T & { readonly __brand: TBrand };

export type SessionRecordId = Brand<string, 'SessionRecordId'>;
export type SessionDurationSeconds = Brand<number, 'SessionDurationSeconds'>;

// ==================== DATABASE ENUMS ====================

export type SessionRecordStatus = 'active' | 'completed' | 'interrupted';
export type SessionLifecycleFlag = 1 | 2 | 3; // 1=active, 2=completed, 3=interrupted

// ==================== DATABASE INTERFACES ====================

/**
 * Complete user session record from database
 */
export interface UserSessionRecord {
  readonly id: SessionRecordId;
  readonly created_at: string;
  readonly updated_at: string;
  readonly started_at: string;
  readonly ended_at: string | null;
  readonly duration_seconds: SessionDurationSeconds | null;
  readonly total_hands: number;
  readonly status: SessionRecordStatus;
  readonly session_name: string;
  readonly cards_remaining: number | null;
  readonly start_balance: number | null;
  readonly end_balance: number | null;
  readonly session_lifecycle_flag: SessionLifecycleFlag;
}

/**
 * Data required to create new session record
 */
export interface CreateSessionRecordData {
  readonly session_name: string;
  readonly started_at: string;
  readonly start_balance?: number | null;
  readonly cards_remaining?: number | null;
}

/**
 * Data for updating session record on end
 */
export interface EndSessionRecordData {
  readonly ended_at: string;
  readonly duration_seconds: SessionDurationSeconds;
  readonly status: 'completed' | 'interrupted';
  readonly end_balance?: number | null;
  readonly total_hands?: number;
}

// ==================== OPERATION RESULT TYPES ====================

/**
 * Result of session recording operations
 */
export interface SessionRecordingResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly recordId?: SessionRecordId;
}

/**
 * Session recording operation context
 */
export interface SessionRecordingContext {
  readonly operation: 'start' | 'end';
  readonly timestamp: string;
  readonly sessionName: string;
  readonly duration?: SessionDurationSeconds;
}

// ==================== FACTORY FUNCTIONS ====================

export const createSessionRecordId = (id: string): SessionRecordId => {
  return id as SessionRecordId;
};

export const createSessionDurationSeconds = (seconds: number): SessionDurationSeconds => {
  return Math.floor(Math.abs(seconds)) as SessionDurationSeconds;
};

export const createSessionName = async (
  sessionQueryFn?: () => Promise<string[]>
): Promise<string> => {
  return await sessionNamingService.generateSessionName(sessionQueryFn);
};

// ==================== TYPE GUARDS ====================

export const isValidSessionRecordStatus = (status: unknown): status is SessionRecordStatus => {
  return typeof status === 'string' && ['active', 'completed', 'interrupted'].includes(status);
};

export const isValidSessionLifecycleFlag = (flag: unknown): flag is SessionLifecycleFlag => {
  return typeof flag === 'number' && [1, 2, 3].includes(flag);
};
