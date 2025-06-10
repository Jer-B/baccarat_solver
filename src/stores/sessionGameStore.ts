/**
 * 🎮 Session Game Store - CDD Excellence
 *
 * Tracks total hands played during active sessions.
 * Integrates with session control and recording systems.
 *
 * @fileoverview Session game state management store
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { SESSION_GAME_CONSTANTS } from '../config/sessionConfig';

export const useSessionGameStore = defineStore('sessionGame', () => {
  // ==================== STATE ====================

  const totalHands = ref(SESSION_GAME_CONSTANTS.INITIAL_TOTAL_HANDS);

  // ==================== GETTERS ====================

  const hasPlayedHands = computed(() => totalHands.value > 0);

  // ==================== ACTIONS ====================

  /**
   * Initialize game state for new session
   */
  const initializeSession = (): void => {
    totalHands.value = SESSION_GAME_CONSTANTS.INITIAL_TOTAL_HANDS;
    console.log('[session-game][init] Session initialized, total hands reset to 0');
  };

  /**
   * Increment total hands when a hand is completed
   */
  const incrementTotalHands = (): void => {
    totalHands.value += 1;
    console.log('[session-game][increment] Total hands incremented', {
      totalHands: totalHands.value,
    });
  };

  /**
   * Reset total hands count
   */
  const resetTotalHands = (): void => {
    totalHands.value = SESSION_GAME_CONSTANTS.INITIAL_TOTAL_HANDS;
    console.log('[session-game][reset] Total hands reset to 0');
  };

  /**
   * Get current total hands for database recording
   */
  const getTotalHands = (): number => {
    return totalHands.value;
  };

  // ==================== RETURN API ====================

  return {
    // Readonly state
    totalHands: readonly(totalHands),

    // Computed
    hasPlayedHands,

    // Actions
    initializeSession,
    incrementTotalHands,
    resetTotalHands,
    getTotalHands,
  };
});
