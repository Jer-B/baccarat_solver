/**
 * 🎯 Session Recording Composable - CDD Excellence
 *
 * Integrates session recording with session control store.
 *  uses hybrid service for automatic online/offline switching.
 *
 * @fileoverview Session recording integration composable
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { ref, computed } from 'vue';
// import { sessionRecordingService } from '../services/sessionRecordingService';
import { hybridSessionRecordingService } from '../services/hybridSessionRecordingService';
import { useSessionControlStore } from '../stores/sessionControlStore';
import { useSessionGameStore } from '../stores/sessionGameStore';
import type {
  SessionRecordId,
  CreateSessionRecordData,
  EndSessionRecordData,
} from '../types/core/sessionRecordingTypes';
import {
  createSessionName,
  createSessionDurationSeconds,
} from '../types/core/sessionRecordingTypes';

// ==================== COMPOSABLE STATE ====================

interface SessionRecordingState {
  isRecording: boolean;
  currentRecordId: SessionRecordId | null;
  lastError: string | null;
  currentMode: 'online' | 'offline';
}

const state = ref<SessionRecordingState>({
  isRecording: false,
  currentRecordId: null,
  lastError: null,
  currentMode: 'offline',
});

// ==================== COMPOSABLE LOGIC ====================

export function useSessionRecording() {
  const sessionStore = useSessionControlStore();
  const gameStore = useSessionGameStore();

  // ==================== RECORDING OPERATIONS ====================

  /**
   * Records session start when store session starts
   */
  const recordStart = async (): Promise<void> => {
    try {
      console.log('[session-recording][composable] Starting session recording');

      state.value.isRecording = true;
      state.value.lastError = null;
      state.value.currentMode = hybridSessionRecordingService.getCurrentMode();

      // Generate sequential session name by querying existing sessions
      let sessionName: string;
      try {
        sessionName = await createSessionName(() =>
          hybridSessionRecordingService.getExistingSessionNames()
        );
        console.log('[session-recording][composable] Generated session name', {
          sessionName,
          mode: state.value.currentMode,
        });
      } catch (nameError) {
        console.warn(
          '[session-recording][composable] Failed to generate sequential name, using fallback',
          nameError
        );
        // Use fallback async function if sequential naming fails
        sessionName = await createSessionName(); // No query function = fallback
      }

      // Prepare recording data
      const recordingData: CreateSessionRecordData = {
        session_name: sessionName,
        started_at: new Date().toISOString(),
        start_balance: null, // Can be extended later
        cards_remaining: null, // Can be extended later
      };

      console.log('[session-recording][composable] Prepared recording data', {
        sessionName: recordingData.session_name,
        timestamp: recordingData.started_at,
        mode: state.value.currentMode,
      });

      // Record using hybrid service
      const result = await hybridSessionRecordingService.recordSessionStart(recordingData);

      if (result.success && result.recordId) {
        state.value.currentRecordId = result.recordId;
        console.log('[session-recording][composable] Session start recorded', {
          recordId: result.recordId,
          sessionName: recordingData.session_name,
          mode: state.value.currentMode,
        });
      } else {
        state.value.lastError = result.error || 'Failed to record session start';
        console.error('[session-recording][composable] Recording failed', {
          error: state.value.lastError,
          mode: state.value.currentMode,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown recording error';
      state.value.lastError = errorMessage;
      console.error('[session-recording][composable] Recording error', {
        error: errorMessage,
        mode: state.value.currentMode,
      });
    } finally {
      state.value.isRecording = false;
    }
  };

  /**
   * Records session end using hybrid service
   */
  const recordEnd = async (): Promise<void> => {
    try {
      if (!state.value.currentRecordId) {
        console.warn('[session-recording][composable] No current record to end');
        return;
      }

      console.log('[session-recording][composable] Ending hybrid session recording');

      state.value.isRecording = true;
      state.value.lastError = null;
      state.value.currentMode = hybridSessionRecordingService.getCurrentMode();

      // Calculate duration from session store
      const durationSeconds = createSessionDurationSeconds(sessionStore.duration);

      // Prepare end data
      const endData: EndSessionRecordData = {
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        status: 'completed' as const,
        end_balance: null, // Can be extended later
        total_hands: gameStore.getTotalHands(),
      };

      // Record using hybrid service
      const result = await hybridSessionRecordingService.recordSessionEnd(
        state.value.currentRecordId,
        endData
      );

      if (result.success) {
        console.log('[session-recording][composable] Session end recorded', {
          recordId: state.value.currentRecordId,
          duration: durationSeconds,
          mode: state.value.currentMode,
        });

        // Reset recording state
        state.value.currentRecordId = null;
      } else {
        state.value.lastError = result.error || 'Failed to record session end';
        console.error('[session-recording][composable] End recording failed', {
          error: state.value.lastError,
          mode: state.value.currentMode,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown recording error';
      state.value.lastError = errorMessage;
      console.error('[session-recording][composable] End recording error', {
        error: errorMessage,
        mode: state.value.currentMode,
      });
    } finally {
      state.value.isRecording = false;
    }
  };

  // ==================== INTEGRATION METHODS ====================

  /**
   * Integrates recording with session store start
   */
  const startSessionWithRecording = async (): Promise<void> => {
    // Start session in store
    sessionStore.startSession();

    // Record start using hybrid service
    await recordStart();
  };

  /**
   * Integrates recording with session store end
   */
  const endSessionWithRecording = async (): Promise<void> => {
    // Record end using hybrid service first
    await recordEnd();

    // End session in store
    sessionStore.endSession();
  };

  // ==================== UTILITY METHODS ====================

  /**
   * Clears any recording errors
   */
  const clearError = (): void => {
    state.value.lastError = null;
  };

  /**
   * Resets recording state (for development/testing)
   */
  const resetRecordingState = (): void => {
    state.value.isRecording = false;
    state.value.currentRecordId = null;
    state.value.lastError = null;
    state.value.currentMode = 'offline';
  };

  /**
   * Gets connection status and sync info
   */
  const getConnectionStatus = () => {
    return hybridSessionRecordingService.getConnectionStatus();
  };

  /**
   * Gets offline statistics
   */
  const getOfflineStats = () => {
    return hybridSessionRecordingService.getOfflineStats();
  };

  /**
   * Manual connection retry
   */
  const retryConnection = async (): Promise<boolean> => {
    return await hybridSessionRecordingService.retryConnection();
  };

  /**
   * Manual sync trigger
   */
  const triggerSync = async (): Promise<void> => {
    return await hybridSessionRecordingService.triggerSync();
  };

  /**
   * Clears all offline data - DESTRUCTIVE OPERATION
   * WARNING: This cannot be undone!
   */
  const clearAllOfflineData = (): void => {
    hybridSessionRecordingService.clearAllOfflineData();
  };

  // ==================== PUBLIC API ====================

  return {
    // Readonly state
    isRecording: computed(() => state.value.isRecording),
    lastError: computed(() => state.value.lastError),
    currentMode: computed(() => state.value.currentMode),

    // Integrated operations (preferred for components)
    startSessionWithRecording,
    endSessionWithRecording,

    // Direct recording operations (for advanced use)
    recordStart,
    recordEnd,

    // Utility methods
    clearError,
    resetRecordingState,

    // Hybrid service features
    getConnectionStatus,
    getOfflineStats,
    retryConnection,
    triggerSync,
    clearAllOfflineData,
  };
}
