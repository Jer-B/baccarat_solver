/**
 * 🗄️ Session Recording Service - CDD Excellence
 *
 * Clean Supabase integration for session recording.
 * Handles only session start/end recording operations.
 *
 * @fileoverview Session recording database service
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { supabase } from '../lib/supabase';
import {
  SESSION_DATABASE,
  SESSION_GAME_CONSTANTS,
  STATUS_TO_LIFECYCLE_FLAG,
} from '../config/sessionConfig';
import type {
  UserSessionRecord,
  CreateSessionRecordData,
  EndSessionRecordData,
  SessionRecordingResult,
  SessionRecordId,
  SessionRecordingContext,
} from '../types/core/sessionRecordingTypes';
import {
  validateCreateSessionData,
  validateEndSessionData,
} from '../utils/validation/sessionRecordingValidation';

// ==================== SESSION RECORDING SERVICE ====================

class SessionRecordingService {
  private readonly tableName = SESSION_DATABASE.TABLE_NAME;

  constructor() {
    console.log(
      '[session-recording][initialization] Service initialized with existing Supabase client'
    );
  }

  // ==================== SESSION START RECORDING ====================

  /**
   * Records session start to database
   */
  async recordSessionStart(
    data: CreateSessionRecordData
  ): Promise<SessionRecordingResult<UserSessionRecord>> {
    const context: SessionRecordingContext = {
      operation: 'start',
      timestamp: data.started_at,
      sessionName: data.session_name,
    };

    try {
      console.log('[session-recording][start] Recording session start', {
        sessionName: data.session_name,
        timestamp: data.started_at,
      });

      // Validate input data
      const validation = validateCreateSessionData(data);
      if (!validation.success) {
        console.warn('[session-recording][start] Validation failed', validation.error.errors);
        return {
          success: false,
          error: 'Invalid session start data: ' + validation.error.errors[0]?.message,
        };
      }

      // Insert session record
      const { data: sessionRecord, error } = await supabase
        .from(this.tableName)
        .insert([
          {
            session_name: data.session_name,
            started_at: data.started_at,
            start_balance: data.start_balance || null,
            cards_remaining: data.cards_remaining || null,
            status: 'active' as const,
            session_lifecycle_flag: 1,
            total_hands: SESSION_GAME_CONSTANTS.INITIAL_TOTAL_HANDS,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('[session-recording][start] Database error', {
          error: error.message,
          context,
        });
        return {
          success: false,
          error: `Failed to record session start: ${error.message}`,
        };
      }

      console.log('[session-recording][start] Session recorded successfully', {
        recordId: sessionRecord.id,
        sessionName: sessionRecord.session_name,
      });

      return {
        success: true,
        data: sessionRecord as UserSessionRecord,
        recordId: sessionRecord.id as SessionRecordId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[session-recording][start] Unexpected error', {
        error: errorMessage,
        context,
      });

      return {
        success: false,
        error: `Session start recording failed: ${errorMessage}`,
      };
    }
  }

  // ==================== SESSION END RECORDING ====================

  /**
   * Records session end to database
   */
  async recordSessionEnd(
    recordId: SessionRecordId,
    data: EndSessionRecordData
  ): Promise<SessionRecordingResult<UserSessionRecord>> {
    const context: SessionRecordingContext = {
      operation: 'end',
      timestamp: data.ended_at,
      sessionName: 'session-end',
      duration: data.duration_seconds,
    };

    try {
      console.log('[session-recording][end] Recording session end', {
        recordId,
        duration: data.duration_seconds,
        status: data.status,
      });

      // Validate input data
      const validation = validateEndSessionData(data);
      if (!validation.success) {
        console.warn('[session-recording][end] Validation failed', validation.error.errors);
        return {
          success: false,
          error: 'Invalid session end data: ' + validation.error.errors[0]?.message,
        };
      }

      // Update session record
      const { data: sessionRecord, error } = await supabase
        .from(this.tableName)
        .update({
          ended_at: data.ended_at,
          duration_seconds: data.duration_seconds,
          status: data.status,
          end_balance: data.end_balance || null,
          total_hands: data.total_hands || 0,
          session_lifecycle_flag: STATUS_TO_LIFECYCLE_FLAG[data.status],
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) {
        console.error('[session-recording][end] Database error', { error: error.message, context });
        return {
          success: false,
          error: `Failed to record session end: ${error.message}`,
        };
      }

      if (!sessionRecord) {
        console.error('[session-recording][end] Session record not found', { recordId, context });
        return {
          success: false,
          error: 'Session record not found for ending',
        };
      }

      console.log('[session-recording][end] Session end recorded successfully', {
        recordId: sessionRecord.id,
        duration: sessionRecord.duration_seconds,
        status: sessionRecord.status,
      });

      return {
        success: true,
        data: sessionRecord as UserSessionRecord,
        recordId: sessionRecord.id as SessionRecordId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[session-recording][end] Unexpected error', { error: errorMessage, context });

      return {
        success: false,
        error: `Session end recording failed: ${errorMessage}`,
      };
    }
  }

  // ==================== SESSION NAME QUERY ====================

  /**
   * Get all existing session names for sequential numbering
   */
  async getExistingSessionNames(): Promise<string[]> {
    try {
      console.log('[session-recording][query] Fetching existing session names');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('session_name')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[session-recording][query] Database error', {
          error: error.message,
        });
        return []; // Return empty array on error
      }

      const sessionNames = data?.map(record => record.session_name).filter(Boolean) || [];

      console.log('[session-recording][query] Retrieved session names', {
        count: sessionNames.length,
        names: sessionNames.slice(0, 5), // Log first 5 for debugging
      });

      return sessionNames;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[session-recording][query] Unexpected error', {
        error: errorMessage,
      });
      return []; // Return empty array on error
    }
  }
}

// ==================== SINGLETON EXPORT ====================

export const sessionRecordingService = new SessionRecordingService();
export type { SessionRecordingService };
