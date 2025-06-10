/**
 * 📱 Offline Session Recording Service - CDD Excellence
 *
 * Complete offline implementation for session recording.
 * Mirrors online service API for seamless switching.
 * Handles local persistence and data integrity.
 *
 * @fileoverview Offline session recording with local persistence
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { useOfflineSessionStore } from '../stores/offlineSessionStore';
import type {
  CreateSessionRecordData,
  EndSessionRecordData,
  SessionRecordingResult,
  SessionRecordId,
  SessionRecordingContext,
  UserSessionRecord,
} from '../types/core/sessionRecordingTypes';
import {
  validateCreateSessionData,
  validateEndSessionData,
} from '../utils/validation/sessionRecordingValidation';

// ==================== OFFLINE SESSION RECORDING SERVICE ====================

class OfflineSessionRecordingService {
  private _store: ReturnType<typeof useOfflineSessionStore> | null = null;

  /**
   * Lazy store initialization to avoid Pinia initialization issues
   */
  private getStore(): ReturnType<typeof useOfflineSessionStore> {
    if (!this._store) {
      this._store = useOfflineSessionStore();
      console.log('[offline-recording][initialization] Store initialized lazily');
    }
    return this._store;
  }

  // ==================== SESSION START RECORDING ====================

  /**
   * Records session start locally
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
      console.log('[offline-recording][start] Recording session start offline', {
        sessionName: data.session_name,
        timestamp: data.started_at,
        mode: 'offline',
      });

      // Validate input data (same validation as online)
      const validation = validateCreateSessionData(data);
      if (!validation.success) {
        console.warn('[offline-recording][start] Validation failed', validation.error.errors);
        return {
          success: false,
          error: 'Invalid session start data: ' + validation.error.errors[0]?.message,
        };
      }

      // Get store and create offline session
      const store = this.getStore();
      const offlineSession = store.createOfflineSession(data);

      // Convert to UserSessionRecord format for API compatibility
      const sessionRecord: UserSessionRecord = {
        id: offlineSession.localId as SessionRecordId,
        session_name: offlineSession.session_name,
        started_at: offlineSession.started_at,
        ended_at: offlineSession.ended_at,
        duration_seconds: offlineSession.duration_seconds,
        start_balance: offlineSession.start_balance,
        end_balance: offlineSession.end_balance,
        cards_remaining: offlineSession.cards_remaining,
        total_hands: offlineSession.total_hands,
        status: offlineSession.status,
        session_lifecycle_flag: offlineSession.session_lifecycle_flag,
        created_at: offlineSession.created_at,
        updated_at: offlineSession.updated_at,
      };

      console.log('[offline-recording][start] Session recorded offline successfully', {
        localId: offlineSession.localId,
        sessionName: offlineSession.session_name,
        syncStatus: offlineSession.syncStatus,
      });

      return {
        success: true,
        data: sessionRecord,
        recordId: offlineSession.localId as SessionRecordId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[offline-recording][start] Unexpected error', {
        error: errorMessage,
        context,
      });

      return {
        success: false,
        error: `Offline session start recording failed: ${errorMessage}`,
      };
    }
  }

  // ==================== SESSION END RECORDING ====================

  /**
   * Records session end locally
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
      console.log('[offline-recording][end] Recording session end offline', {
        localId: recordId,
        duration: data.duration_seconds,
        status: data.status,
        mode: 'offline',
      });

      // Validate input data (same validation as online)
      const validation = validateEndSessionData(data);
      if (!validation.success) {
        console.warn('[offline-recording][end] Validation failed', validation.error.errors);
        return {
          success: false,
          error: 'Invalid session end data: ' + validation.error.errors[0]?.message,
        };
      }

      // Get store and update offline session
      const store = this.getStore();
      const updatedSession = store.updateOfflineSession(recordId as string, data);

      if (!updatedSession) {
        console.error('[offline-recording][end] Session not found offline', {
          localId: recordId,
          context,
        });
        return {
          success: false,
          error: 'Offline session record not found for ending',
        };
      }

      // Convert to UserSessionRecord format for API compatibility
      const sessionRecord: UserSessionRecord = {
        id: updatedSession.localId as SessionRecordId,
        session_name: updatedSession.session_name,
        started_at: updatedSession.started_at,
        ended_at: updatedSession.ended_at,
        duration_seconds: updatedSession.duration_seconds,
        start_balance: updatedSession.start_balance,
        end_balance: updatedSession.end_balance,
        cards_remaining: updatedSession.cards_remaining,
        total_hands: updatedSession.total_hands,
        status: updatedSession.status,
        session_lifecycle_flag: updatedSession.session_lifecycle_flag,
        created_at: updatedSession.created_at,
        updated_at: updatedSession.updated_at,
      };

      console.log('[offline-recording][end] Session end recorded offline successfully', {
        localId: updatedSession.localId,
        duration: updatedSession.duration_seconds,
        status: updatedSession.status,
        syncStatus: updatedSession.syncStatus,
      });

      return {
        success: true,
        data: sessionRecord,
        recordId: updatedSession.localId as SessionRecordId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[offline-recording][end] Unexpected error', {
        error: errorMessage,
        context,
      });

      return {
        success: false,
        error: `Offline session end recording failed: ${errorMessage}`,
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Gets existing session names from offline store
   */
  async getExistingSessionNames(): Promise<string[]> {
    try {
      const store = this.getStore();
      const sessions = store.activeSessions;
      const sessionNames = sessions.map(session => session.session_name);

      console.log('[offline-recording][utility] Retrieved offline session names', {
        count: sessionNames.length,
        mode: 'offline',
      });

      return sessionNames;
    } catch (error) {
      console.error('[offline-recording][utility] Failed to get offline session names', error);
      return [];
    }
  }

  /**
   * Offline connection check (always returns true for offline mode)
   */
  async checkConnection(): Promise<boolean> {
    console.log('[offline-recording][connection] Offline mode connection check', {
      mode: 'offline',
      result: true,
    });
    return true; // Offline mode is always "connected" to local storage
  }

  // ==================== OFFLINE-SPECIFIC METHODS ====================

  /**
   * Gets offline session statistics
   */
  getOfflineStats() {
    const store = this.getStore();
    return store.offlineStats;
  }

  /**
   * Gets pending sync count
   */
  getPendingSyncCount(): number {
    const store = this.getStore();
    return store.pendingSyncCount;
  }

  /**
   * Gets all offline sessions
   */
  getAllOfflineSessions() {
    const store = this.getStore();
    return store.activeSessions;
  }

  /**
   * Gets current offline session
   */
  getCurrentOfflineSession() {
    const store = this.getStore();
    return store.currentSession;
  }

  /**
   * Clears sync errors
   */
  clearSyncErrors(): void {
    const store = this.getStore();
    store.clearSyncErrors();
  }

  /**
   * Cleanup old synced sessions
   */
  cleanupSyncedSessions(olderThanDays: number = 7): void {
    const store = this.getStore();
    store.cleanupSyncedSessions(olderThanDays);
  }

  /**
   * Clears ALL offline data - DESTRUCTIVE OPERATION
   * WARNING: This cannot be undone!
   */
  clearAllOfflineData(): void {
    console.warn('[offline-recording][cleanup] Clearing ALL offline data - DESTRUCTIVE OPERATION');
    const store = this.getStore();
    store.clearAllOfflineData();
    console.warn('[offline-recording][cleanup] ALL offline data has been cleared');
  }
}

// ==================== SINGLETON EXPORT ====================

export const offlineSessionRecordingService = new OfflineSessionRecordingService();
