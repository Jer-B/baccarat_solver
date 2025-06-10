/**
 * 🎯 Session Game Types - CDD Excellence
 *
 * Types for session game state management.
 * Tracks hands played, balances, and game progression.
 *
 * @fileoverview Session game state types
 * @version 1.0.0
 * @author CDD Architecture Team
 */

// ==================== GAME STATE TYPES ====================

/**
 * Complete session game state
 */
export interface SessionGameState {
  readonly totalHands: number;
  readonly currentHandNumber: number;
  readonly startBalance: number | null;
  readonly currentBalance: number | null;
  readonly cardsRemaining: number | null;
  readonly isHandInProgress: boolean;
  readonly lastHandResult: HandResult | null;
}

/**
 * Result of a completed hand
 */
export interface HandResult {
  readonly outcome: HandOutcome;
  readonly won: boolean;
  readonly betAmount?: number;
  readonly cardsUsed?: number;
  readonly playerCards?: string[];
  readonly bankerCards?: string[];
  readonly burnCards?: string[];
}

/**
 * Possible hand outcomes
 */
export type HandOutcome = 'player' | 'banker' | 'tie';

// ==================== GAME STATISTICS ====================

/**
 * Session game statistics
 */
export interface SessionGameStats {
  readonly totalHands: number;
  readonly currentHandNumber: number;
  readonly startBalance: number | null;
  readonly currentBalance: number | null;
  readonly balanceChange: number | null;
  readonly cardsRemaining: number | null;
  readonly isHandInProgress: boolean;
  readonly hasPlayedHands: boolean;
}

// ==================== TYPE GUARDS ====================

export const isValidHandOutcome = (outcome: unknown): outcome is HandOutcome => {
  return typeof outcome === 'string' && ['player', 'banker', 'tie'].includes(outcome);
};

export const isValidHandResult = (result: unknown): result is HandResult => {
  if (!result || typeof result !== 'object') return false;

  const r = result as Record<string, unknown>;
  return (
    isValidHandOutcome(r.outcome) &&
    typeof r.won === 'boolean' &&
    (r.betAmount === undefined || typeof r.betAmount === 'number') &&
    (r.cardsUsed === undefined || typeof r.cardsUsed === 'number')
  );
};

// ==================== FACTORY FUNCTIONS ====================

export const createHandResult = (
  outcome: HandOutcome,
  won: boolean,
  betAmount?: number,
  cardsUsed?: number
): HandResult => ({
  outcome,
  won,
  betAmount,
  cardsUsed,
});

export const createEmptyGameState = (): SessionGameState => ({
  totalHands: 0,
  currentHandNumber: 0,
  startBalance: null,
  currentBalance: null,
  cardsRemaining: null,
  isHandInProgress: false,
  lastHandResult: null,
});
