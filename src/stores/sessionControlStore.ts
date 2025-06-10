/**
 * 🎮 Session Control Store - Simple Version
 *
 * Basic Pinia store for session management functionality.
 */

import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { UI_TIMING } from '../utils';
import type { SessionStatus, SessionState } from '@/types/core/sessionControlTypes';
import {
  validateSessionStatus,
  canStartSession,
  canEndSession,
  canResetSession,
} from '@/utils/validation/sessionControlValidation';

export const useSessionControlStore = defineStore('sessionControl', () => {
  // ==================== STATE ====================

  const status = ref<SessionStatus>('idle');
  const startTime = ref<number | null>(null);
  const duration = ref(0);
  const isExpanded = ref(true);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Timer references
  const timerInterval = ref<number | null>(null);
  const autoTransitionTimeout = ref<number | null>(null);

  // ==================== GETTERS ====================

  const sessionState = computed(
    (): SessionState => ({
      status: status.value,
      startTime: startTime.value,
      duration: duration.value,
      isExpanded: isExpanded.value,
      isLoading: isLoading.value,
    })
  );

  const isSessionActive = computed(() => status.value === 'active');

  const formattedDuration = computed(() => {
    const totalSeconds = Math.floor(duration.value / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Always show HH:MM:SS format
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  const statusText = computed(() => {
    switch (status.value) {
      case 'idle':
        return 'Ready to Start';
      case 'active':
        return 'Session Active';
      case 'completed':
        return 'Session Completed';
      default:
        return 'Unknown Status';
    }
  });

  const actionButtonText = computed(() => {
    switch (status.value) {
      case 'idle':
      case 'completed': // Both idle and completed show "Start Session"
        return 'Start Session';
      case 'active':
        return 'End Session';
      default:
        return 'Unknown Action';
    }
  });

  // ==================== ACTIONS ====================

  const updateDuration = () => {
    if (status.value === 'active' && startTime.value) {
      duration.value = Date.now() - startTime.value;
    }
  };

  const startTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
    }

    timerInterval.value = window.setInterval(updateDuration, UI_TIMING.TIMER_UPDATE_INTERVAL);
  };

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  };

  const clearAutoTransition = () => {
    if (autoTransitionTimeout.value) {
      clearTimeout(autoTransitionTimeout.value);
      autoTransitionTimeout.value = null;
    }
  };

  const startSession = async (): Promise<void> => {
    // Validate current status before starting
    if (!validateSessionStatus(status.value)) {
      throw new Error(`Invalid session status: ${status.value}`);
    }

    // Can start from both idle and completed states
    if (!canStartSession(status.value) && status.value !== 'completed') {
      throw new Error(`Cannot start session from status: ${status.value}`);
    }

    try {
      isLoading.value = true;
      error.value = null;
      clearAutoTransition(); // Clear any pending transitions

      // Artificial async delay operation
      await new Promise(resolve => setTimeout(resolve, UI_TIMING.START_OPERATION_DELAY));

      status.value = 'active';
      startTime.value = Date.now();
      duration.value = 0; // Always start fresh from zero
      startTimer();

      console.log(
        '[session-store][start] Session started successfully, timer initialized from zero'
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start session';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const endSession = async (): Promise<void> => {
    // Validate current status before ending
    if (!validateSessionStatus(status.value)) {
      throw new Error(`Invalid session status: ${status.value}`);
    }

    if (!canEndSession(status.value)) {
      throw new Error(`Cannot end session from status: ${status.value}`);
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Artificial async delay operation + reset game states
      await new Promise(resolve => setTimeout(resolve, UI_TIMING.END_OPERATION_DELAY));

      status.value = 'completed';
      stopTimer();

      // Reset duration when session ends
      duration.value = 0;
      startTime.value = null;

      // Auto-transition after configured delay
      autoTransitionTimeout.value = window.setTimeout(() => {
        status.value = 'idle';
        // Ensure duration stays at zero during transition
        duration.value = 0;
        startTime.value = null;
        console.log('[session-store][auto-transition] Status changed to ready for new session');
      }, UI_TIMING.AUTO_TRANSITION_DELAY);

      console.log(
        '[session-store][end] Session ended successfully, duration reset, auto-transition scheduled'
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to end session';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const resetSession = async (): Promise<void> => {
    // Validate current status before resetting
    if (!validateSessionStatus(status.value)) {
      throw new Error(`Invalid session status: ${status.value}`);
    }

    if (!canResetSession(status.value)) {
      throw new Error(`Cannot reset session from status: ${status.value}`);
    }

    try {
      isLoading.value = true;
      error.value = null;
      clearAutoTransition();

      // Artificial async delay operation
      await new Promise(resolve => setTimeout(resolve, UI_TIMING.RESET_OPERATION_DELAY));

      status.value = 'idle';
      startTime.value = null;
      duration.value = 0; // Reset duration to zero
      stopTimer();

      console.log('[session-store][reset] Session reset successfully, all values cleared');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reset session';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleExpansion = (): void => {
    isExpanded.value = !isExpanded.value;
    console.log('[session-store][toggle] Expansion toggled:', isExpanded.value);
  };

  const clearError = (): void => {
    error.value = null;
  };

  // ==================== CLEANUP ====================

  const cleanup = (): void => {
    stopTimer();
    clearAutoTransition();
    console.log('[session-store][cleanup] Store cleaned up');
  };

  // ==================== RETURN API ====================

  return {
    // State
    status: readonly(status),
    startTime: readonly(startTime),
    duration: readonly(duration),
    isExpanded: readonly(isExpanded),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    sessionState,
    isSessionActive,
    formattedDuration,
    statusText,
    actionButtonText,

    // Actions
    startSession,
    endSession,
    resetSession,
    toggleExpansion,
    clearError,
    cleanup,
  };
});
