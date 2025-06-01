// =============================================================================
// CURRENT HAND SETTINGS CONFIGURATION - CDD/HEADLESS SYSTEM
// =============================================================================
// Comprehensive configuration for CurrentHand CDD architecture
// Following professional patterns established in sessionControlSettings.ts and payoutSettings.ts

// =============================================================================
// CORE CONFIGURATION CONSTANTS
// =============================================================================

export const CURRENT_HAND_DEFAULTS = {
  // Auto-complete settings
  AUTO_COMPLETE_ENABLED: false,
  AUTO_COMPLETE_CARD_COUNT: 6,
  AUTO_COMPLETE_DELAY_MS: 1000,

  // Hand validation limits
  MIN_CARDS_FOR_COMPLETE_HAND: 4,
  MAX_CARDS_PER_HAND: 6,
  MAX_CARDS_PER_SIDE: 3,

  // Natural hand threshold
  NATURAL_HAND_VALUE: 8,
  PERFECT_NATURAL_VALUE: 9,

  // Round completion timing
  ROUND_RESULT_DISPLAY_DURATION: 3000,
  HAND_ANIMATION_DURATION: 300,

  // Payout reference display
  SHOW_PAYOUT_REFERENCE: true,
  PAYOUT_REFERENCE_COLUMNS: 2,

  // Winner determination
  TIE_THRESHOLD: 0, // Exact match for tie

  // Balance update settings
  AUTO_UPDATE_BALANCE: true,
  SHOW_BALANCE_CHANGES: true,

  // Professional algorithm integration
  ENABLE_KELLY_INTEGRATION: true,
  ENABLE_MONTE_CARLO_INTEGRATION: true,
  ENABLE_BURN_ANALYSIS_INTEGRATION: true,
} as const;

// =============================================================================
// STYLING CONFIGURATION
// =============================================================================

export const CURRENT_HAND_STYLING = {
  // Main container
  MAIN_CONTAINER: 'card',
  MAIN_TITLE: 'text-xl font-semibold',

  // Header section
  HEADER_CONTAINER: 'flex items-center justify-between mb-4',
  CONTROLS_CONTAINER: 'flex items-center space-x-3',

  // Auto-complete control
  AUTO_COMPLETE_LABEL: 'flex items-center space-x-2 text-sm cursor-pointer',
  AUTO_COMPLETE_CHECKBOX: 'rounded border-gray-300 text-purple-600 focus:ring-purple-500',
  AUTO_COMPLETE_TEXT: 'text-gray-700',

  // Complete round button
  COMPLETE_BUTTON_BASE: 'px-3 py-1 rounded-md text-sm transition-colors',

  // Hand grid layout
  HAND_GRID: 'grid grid-cols-2 gap-4',

  // Side containers (Player/Banker)
  SIDE_CONTAINER_BASE: 'p-3 rounded-lg border-2 transition-all duration-300',
  SIDE_HEADER: 'flex items-center justify-between mb-2',
  SIDE_TITLE_CONTAINER: 'flex items-center space-x-2',
  SIDE_VALUE_CONTAINER: 'flex items-center space-x-2',
  SIDE_CARDS_CONTAINER: 'flex space-x-2',

  // Side titles
  SIDE_TITLE: 'font-medium text-gray-700',

  // Kanji SVG styling
  KANJI_SVG: 'width="24" height="24" viewBox="0 0 24 24"',
  KANJI_TEXT:
    'x="12" y="18" text-anchor="middle" font-family="serif" font-size="16" fill="currentColor"',

  // Bet amount display
  BET_AMOUNT_BADGE_BASE: 'text-white px-2 py-1 rounded-full text-xs font-bold',

  // Hand values
  HAND_VALUE_BASE: 'text-lg font-bold',
  NATURAL_INDICATOR: 'text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded',

  // Other bet types display
  OTHER_BETS_CONTAINER: 'mt-4 p-3 rounded-lg border-2 transition-all duration-300',
  OTHER_BETS_CONTENT: 'flex items-center justify-center space-x-2',
  OTHER_BET_LABEL: 'font-medium text-gray-700',
  OTHER_BET_AMOUNT: 'text-white px-3 py-1 rounded-full text-sm font-bold',

  // Hand summary section
  SUMMARY_CONTAINER: 'mt-4 pt-4 border-t border-gray-200',
  SUMMARY_GRID: 'grid grid-cols-1 md:grid-cols-3 gap-4 text-sm',
  SUMMARY_ITEM: 'text-center',
  SUMMARY_LABEL: 'font-medium text-gray-700',
  SUMMARY_VALUE: 'text-lg font-bold text-gray-600',

  // Payout reference section
  PAYOUT_REFERENCE_CONTAINER: 'mt-4 pt-4 border-t border-gray-200',
  PAYOUT_REFERENCE_TITLE: 'text-sm font-semibold text-gray-800 mb-2',
  PAYOUT_REFERENCE_GRID: 'grid grid-cols-2 gap-2 text-xs',
  PAYOUT_REFERENCE_COLUMN: 'space-y-1',
  PAYOUT_REFERENCE_ROW: 'flex justify-between',

  // Loading and transition states
  LOADING_OVERLAY: 'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center',
  LOADING_SPINNER: 'animate-spin h-8 w-8 text-purple-600',
  FADE_TRANSITION: 'transition-opacity duration-300',
} as const;

// =============================================================================
// COLOR SYSTEM
// =============================================================================

export const CURRENT_HAND_COLORS = {
  // Complete Round Button States
  COMPLETE_ENABLED: 'bg-red-500 text-white hover:bg-red-600',
  COMPLETE_DISABLED: 'bg-gray-400 text-gray-200 cursor-not-allowed',

  // Player Side Colors
  PLAYER_DEFAULT_BORDER: 'border-gray-200',
  PLAYER_BET_ACTIVE: 'bg-blue-50 border-blue-400 shadow-lg ring-2 ring-blue-300',
  PLAYER_VALUE_ACTIVE: 'text-blue-600',
  PLAYER_VALUE_INACTIVE: 'text-gray-400',
  PLAYER_NATURAL_HIGHLIGHT: 'bg-yellow-100 px-2 py-1 rounded',
  PLAYER_KANJI: 'text-blue-600',
  PLAYER_BET_BADGE: 'bg-blue-600',
  PLAYER_PAYOUT_TEXT: 'text-blue-600 font-medium',

  // Banker Side Colors
  BANKER_DEFAULT_BORDER: 'border-gray-200',
  BANKER_BET_ACTIVE: 'bg-red-50 border-red-400 shadow-lg ring-2 ring-red-300',
  BANKER_VALUE_ACTIVE: 'text-red-600',
  BANKER_VALUE_INACTIVE: 'text-gray-400',
  BANKER_NATURAL_HIGHLIGHT: 'bg-yellow-100 px-2 py-1 rounded',
  BANKER_KANJI: 'text-red-600',
  BANKER_BET_BADGE: 'bg-red-600',
  BANKER_PAYOUT_TEXT: 'text-red-600 font-medium',

  // Other Bet Type Colors
  TIE_BET_ACTIVE: 'bg-green-50 border-green-400 shadow-lg ring-2 ring-green-300',
  TIE_BET_BADGE: 'bg-green-600',
  TIE_PAYOUT_TEXT: 'text-green-600 font-medium',

  PLAYER_PAIR_BET_ACTIVE: 'bg-purple-50 border-purple-400 shadow-lg ring-2 ring-purple-300',
  PLAYER_PAIR_BET_BADGE: 'bg-purple-600',
  PAIR_PAYOUT_TEXT: 'text-purple-600 font-medium',

  BANKER_PAIR_BET_ACTIVE: 'bg-orange-50 border-orange-400 shadow-lg ring-2 ring-orange-300',
  BANKER_PAIR_BET_BADGE: 'bg-orange-600',

  // Winner indication colors
  WINNER_PLAYER: 'text-blue-600',
  WINNER_BANKER: 'text-red-600',
  WINNER_TIE: 'text-green-600',
  WINNER_UNKNOWN: 'text-gray-500',

  // Natural hand highlighting
  NATURAL_BACKGROUND: 'bg-yellow-100',
  NATURAL_TEXT: 'text-yellow-700',
  NATURAL_BORDER: 'border-yellow-300',
} as const;

// =============================================================================
// LABELS AND TEXT CONTENT
// =============================================================================

export const CURRENT_HAND_LABELS = {
  // Main title
  MAIN_TITLE: 'Current Hand',

  // Auto-complete
  AUTO_COMPLETE_LABEL: 'Auto-complete at 6 cards',

  // Complete round button
  COMPLETE_ROUND_WITH_BET: 'Complete Round',
  CLEAR_HAND_NO_BET: 'Clear Hand',

  // Side titles
  PLAYER_TITLE: 'Player',
  BANKER_TITLE: 'Banker',

  // Kanji characters
  PLAYER_KANJI: '閑', // Idle/Leisure (Player)
  BANKER_KANJI: '庄', // House/Manor (Banker)

  // Natural indicator
  NATURAL_INDICATOR: 'Natural',

  // Other bet type labels
  TIE_BET_LABEL: 'Tie Bet',
  PLAYER_PAIR_BET_LABEL: 'Player Pair Bet',
  BANKER_PAIR_BET_LABEL: 'Banker Pair Bet',

  // Hand summary labels
  CURRENT_WINNER_LABEL: 'Current Winner',
  CARDS_DEALT_LABEL: 'Cards Dealt',
  HAND_STATUS_LABEL: 'Hand Status',

  // Hand status values
  STATUS_INCOMPLETE: 'In Progress',
  STATUS_READY_FOR_COMPLETION: 'Ready to Complete',
  STATUS_NATURAL: 'Natural Hand',
  STATUS_COMPLETE: 'Complete',

  // Winner labels
  WINNER_PLAYER: 'Player',
  WINNER_BANKER: 'Banker',
  WINNER_TIE: 'Tie',
  WINNER_UNKNOWN: 'In Progress',

  // Payout reference
  PAYOUT_REFERENCE_TITLE: '💰 Quick Payout Reference',
  PLAYER_PAYOUT_LABEL: 'Player:',
  BANKER_PAYOUT_LABEL: 'Banker:',
  TIE_PAYOUT_LABEL: 'Tie:',
  PAIRS_PAYOUT_LABEL: 'Pairs:',

  // Commission display
  COMMISSION_SUFFIX: 'commission',

  // Balance update messages
  BALANCE_UPDATED: 'Balance updated',
  ROUND_SETTLED: 'Round settled',

  // Professional algorithm labels
  KELLY_RECOMMENDATION: 'Kelly Suggestion:',
  RISK_ASSESSMENT: 'Risk Level:',
  BURN_ADJUSTMENT: 'Burn Adjusted Edge:',
} as const;

// =============================================================================
// ICONS AND EMOJIS
// =============================================================================

export const CURRENT_HAND_ICONS = {
  // Payout reference
  MONEY_EMOJI: '💰',

  // Professional algorithms
  KELLY_EMOJI: '🎯',
  RISK_EMOJI: '⚠️',
  BURN_EMOJI: '🔥',
  EDGE_EMOJI: '📈',

  // Hand status
  NATURAL_EMOJI: '✨',
  WINNER_EMOJI: '🏆',
  TIE_EMOJI: '🤝',

  // Actions
  COMPLETE_EMOJI: '✅',
  CLEAR_EMOJI: '🗑️',
  AUTO_EMOJI: '🤖',
} as const;

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const CURRENT_HAND_VALIDATION = {
  // Hand completion validation
  MIN_CARDS_REQUIRED: {
    value: 4,
    message: 'Minimum 4 cards required to complete hand',
  },

  MAX_CARDS_ALLOWED: {
    value: 6,
    message: 'Maximum 6 cards allowed per hand',
  },

  // Session validation
  SESSION_REQUIRED: {
    message: 'Session must be active to complete hand',
  },

  BET_REQUIRED_FOR_COMPLETION: {
    message: 'Bet must be placed to complete round',
  },

  // Hand state validation
  CARDS_REQUIRED_FOR_CLEAR: {
    message: 'No cards to clear',
  },

  // Balance validation
  SUFFICIENT_BALANCE_REQUIRED: {
    message: 'Insufficient balance for bet amount',
  },

  // Payout validation
  PAYOUT_VALUES_REQUIRED: {
    message: 'Payout values must be configured',
  },
} as const;

// =============================================================================
// EVENT DEFINITIONS
// =============================================================================

export const CURRENT_HAND_EVENTS = {
  // Hand lifecycle events
  HAND_STARTED: 'hand-started',
  HAND_UPDATED: 'hand-updated',
  HAND_COMPLETED: 'hand-completed',
  HAND_CLEARED: 'hand-cleared',

  // Card events
  CARD_ADDED: 'card-added',
  CARDS_DEALT: 'cards-dealt',

  // Auto-complete events
  AUTO_COMPLETE_ENABLED: 'auto-complete-enabled',
  AUTO_COMPLETE_DISABLED: 'auto-complete-disabled',
  AUTO_COMPLETE_TRIGGERED: 'auto-complete-triggered',

  // Winner determination events
  WINNER_DETERMINED: 'winner-determined',
  NATURAL_DETECTED: 'natural-detected',
  TIE_DETECTED: 'tie-detected',

  // Betting integration events
  BET_SETTLED: 'bet-settled',
  BALANCE_UPDATED: 'balance-updated',
  PAYOUT_CALCULATED: 'payout-calculated',

  // PayoutSettings integration events
  PAYOUT_VALUES_CHANGED: 'payout-values-changed',
  PAYOUT_REFERENCE_UPDATED: 'payout-reference-updated',

  // Professional algorithm events
  KELLY_CALCULATION_REQUESTED: 'kelly-calculation-requested',
  MONTE_CARLO_ASSESSMENT_REQUESTED: 'monte-carlo-assessment-requested',
  BURN_ANALYSIS_UPDATED: 'burn-analysis-updated',

  // Validation events
  VALIDATION_ERROR: 'validation-error',
  VALIDATION_SUCCESS: 'validation-success',

  // UI state events
  LOADING_STARTED: 'loading-started',
  LOADING_COMPLETED: 'loading-completed',
} as const;

// =============================================================================
// PROFESSIONAL ALGORITHM INTEGRATION
// =============================================================================

export const CURRENT_HAND_ALGORITHMS = {
  // Kelly Criterion integration
  KELLY: {
    ENABLE_RECOMMENDATIONS: true,
    SHOW_OPTIMAL_BET_SIZE: true,
    RISK_ADJUSTMENT_FACTORS: [0.25, 0.5, 0.75, 1.0] as const,
    CONFIDENCE_THRESHOLD: 0.7,
  },

  // Monte Carlo integration
  MONTE_CARLO: {
    ENABLE_RISK_ASSESSMENT: true,
    SHOW_EXPECTED_VALUE: true,
    SIMULATION_ITERATIONS: 10000,
    CONFIDENCE_INTERVAL: 0.95,
  },

  // Burn Analysis integration
  BURN_ANALYSIS: {
    ENABLE_EDGE_ADJUSTMENT: true,
    SHOW_BURN_IMPACT: true,
    MINIMUM_CONFIDENCE: 0.6,
    EDGE_ADJUSTMENT_SENSITIVITY: 0.01,
  },
} as const;

// =============================================================================
// PAYOUT INTEGRATION CONFIGURATION
// =============================================================================

export const CURRENT_HAND_PAYOUT_INTEGRATION = {
  // Live PayoutSettings connection
  USE_LIVE_PAYOUT_VALUES: true,
  UPDATE_ON_PAYOUT_CHANGE: true,
  SHOW_COMMISSION_IN_REFERENCE: true,
  FORMAT_CURRENCY_AMOUNTS: true,

  // Payout calculation settings
  CALCULATE_EXACT_PAYOUTS: true,
  INCLUDE_COMMISSION_IN_CALCULATIONS: true,
  ROUND_PAYOUT_AMOUNTS: true,
  DECIMAL_PLACES: 2,

  // Display formatting
  PAYOUT_RATIO_FORMAT: ':1',
  COMMISSION_FORMAT: '%',
  CURRENCY_SYMBOL: '$',

  // Real-time updates
  AUTO_UPDATE_ON_PRESET_CHANGE: true,
  SHOW_PAYOUT_CHANGE_NOTIFICATIONS: false, // Avoid spam
  ANIMATE_PAYOUT_UPDATES: true,
} as const;

// =============================================================================
// BETTING INTERFACE INTEGRATION
// =============================================================================

export const CURRENT_HAND_BETTING_INTEGRATION = {
  // Balance updates
  AUTO_UPDATE_BALANCE_ON_COMPLETION: true,
  SHOW_BALANCE_CHANGE_ANIMATION: true,
  BALANCE_UPDATE_DELAY_MS: 500,

  // Bet settlement
  SETTLE_BETS_ON_COMPLETION: true,
  SHOW_WIN_LOSS_NOTIFICATIONS: true,
  CALCULATE_NET_RESULT: true,

  // Round management
  CLEAR_BETS_AFTER_SETTLEMENT: true,
  START_NEW_ROUND_AUTOMATICALLY: true,
  RESET_BET_SELECTION: false, // Keep for convenience

  // Validation integration
  VALIDATE_BET_BEFORE_COMPLETION: true,
  REQUIRE_BET_FOR_ROUND_COMPLETION: true,
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface CurrentHandState {
  // Hand composition
  playerCards: Card[];
  bankerCards: Card[];

  // Hand values
  playerValue: number;
  bankerValue: number;

  // Hand status
  isComplete: boolean;
  hasNatural: boolean;
  winner: 'player' | 'banker' | 'tie' | null;

  // Auto-complete
  autoCompleteEnabled: boolean;
  canAutoComplete: boolean;

  // Round state
  canCompleteRound: boolean;
  hasBet: boolean;
  betType: BetType | null;
  betAmount: number;

  // Payout integration
  currentPayoutValues: PayoutValues;
  payoutReference: PayoutReference;

  // Professional algorithms
  kellyRecommendation?: KellyRecommendation;
  monteCarloAssessment?: MonteCarloAssessment;
  burnAnalysisData?: BurnAnalysisData;

  // UI state
  isLoading: boolean;
  showPayoutReference: boolean;
}

export interface PayoutReference {
  player: string;
  banker: string;
  bankerCommission: string;
  tie: string;
  playerPair: string;
  bankerPair: string;
}

export interface HandCompletionEvent {
  handResult: HandResult;
  betResult?: BetResult;
  balanceUpdate?: number;
  timestamp: number;
}

export interface AutoCompleteEvent {
  enabled: boolean;
  cardCount: number;
  triggerDelay: number;
}

export interface HandValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canComplete: boolean;
  requiresBet: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const CURRENT_HAND_UTILS = {
  /**
   * Calculate hand value using Baccarat rules
   */
  calculateHandValue: (cards: Card[]): number => {
    return cards.reduce((sum, card) => sum + card.value, 0) % 10;
  },

  /**
   * Determine hand winner
   */
  determineWinner: (playerValue: number, bankerValue: number): 'player' | 'banker' | 'tie' => {
    if (playerValue > bankerValue) {
      return 'player';
    }
    if (bankerValue > playerValue) {
      return 'banker';
    }
    return 'tie';
  },

  /**
   * Check if hand has natural (8 or 9)
   */
  hasNatural: (playerValue: number, bankerValue: number): boolean => {
    return playerValue >= 8 || bankerValue >= 8;
  },

  /**
   * Format hand status text
   */
  formatHandStatus: (
    playerCards: Card[],
    bankerCards: Card[],
    playerValue: number,
    bankerValue: number
  ): string => {
    const totalCards = playerCards.length + bankerCards.length;

    if (totalCards === 0) {
      return CURRENT_HAND_LABELS.STATUS_INCOMPLETE;
    }
    if (CURRENT_HAND_UTILS.hasNatural(playerValue, bankerValue)) {
      return CURRENT_HAND_LABELS.STATUS_NATURAL;
    }
    if (totalCards >= 4) {
      return CURRENT_HAND_LABELS.STATUS_READY_FOR_COMPLETION;
    }
    return CURRENT_HAND_LABELS.STATUS_INCOMPLETE;
  },

  /**
   * Get winner display class
   */
  getWinnerClass: (winner: string): string => {
    switch (winner) {
      case 'player':
        return CURRENT_HAND_COLORS.WINNER_PLAYER;
      case 'banker':
        return CURRENT_HAND_COLORS.WINNER_BANKER;
      case 'tie':
        return CURRENT_HAND_COLORS.WINNER_TIE;
      default:
        return CURRENT_HAND_COLORS.WINNER_UNKNOWN;
    }
  },

  /**
   * Format payout reference using live PayoutSettings
   */
  formatPayoutReference: (payoutValues: PayoutValues): PayoutReference => {
    return {
      player: `${payoutValues.player_payout}:1`,
      banker: `${payoutValues.banker_payout}:1`,
      bankerCommission: `${(payoutValues.banker_commission * 100).toFixed(1)}%`,
      tie: `${payoutValues.tie_payout}:1`,
      playerPair: `${payoutValues.player_pair_payout}:1`,
      bankerPair: `${payoutValues.banker_pair_payout}:1`,
    };
  },

  /**
   * Validate hand completion requirements
   */
  validateHandCompletion: (
    playerCards: Card[],
    bankerCards: Card[],
    sessionActive: boolean,
    hasBet: boolean
  ): HandValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const totalCards = playerCards.length + bankerCards.length;

    // Session validation
    if (!sessionActive) {
      errors.push(CURRENT_HAND_VALIDATION.SESSION_REQUIRED.message);
    }

    // Card count validation
    if (totalCards < CURRENT_HAND_VALIDATION.MIN_CARDS_REQUIRED.value) {
      errors.push(CURRENT_HAND_VALIDATION.MIN_CARDS_REQUIRED.message);
    }

    // Bet validation for round completion
    if (!hasBet && totalCards > 0) {
      errors.push(CURRENT_HAND_VALIDATION.BET_REQUIRED_FOR_COMPLETION.message);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canComplete: errors.length === 0 && totalCards >= 4,
      requiresBet: true,
    };
  },
};

// =============================================================================
// IMPORTS FOR TYPE SAFETY
// =============================================================================

import type { Card, HandResult } from '@/types/cards';
import type { PayoutValues } from '@/config/payoutSettings';
import type { BetType } from '@/config/bettingInterfaceSettings';
import type { BetResult } from '@/services/bettingService';

// Professional algorithm interfaces
interface KellyRecommendation {
  optimalBetSize: number;
  kellyPercentage: number;
  edge: number;
  riskAdjustment: number;
}

interface MonteCarloAssessment {
  expectedValue: number;
  riskOfRuin: number;
  confidenceRange: { lower: number; upper: number };
}

interface BurnAnalysisData {
  burnAdjustedEdge: number;
  confidence: number;
  recommendation: string;
}

// =============================================================================
// ✨ PHASE 8: MAGIC NUMBERS CONFIGURATION
// =============================================================================

export const CURRENT_HAND_MAGIC_NUMBERS = {
  // Auto-complete configuration
  DEFAULT_AUTO_COMPLETE_CARD_COUNT: 6,
  AUTO_COMPLETE_DELAY_MS: 1000,

  // Card dealing timing
  CARD_DEALING_DELAY_MS: 1000,

  // Edge calculation defaults
  DEFAULT_EDGE_PERCENTAGE: 0.01,

  // Hand validation
  MIN_CARDS_FOR_VALIDATION: 4,
  MAX_CARDS_PER_HAND: 3,

  // Natural detection
  NATURAL_THRESHOLD: 8,

  // Animation timing
  TRANSITION_DURATION_MS: 300,

  // Toast notification timeouts
  SUCCESS_TOAST_TIMEOUT_MS: 4000,
  WARNING_TOAST_TIMEOUT_MS: 3000,
  ERROR_TOAST_TIMEOUT_MS: 5000,
} as const;

// =============================================================================
// CONFIGURATION EXPORT
// =============================================================================

export const CURRENT_HAND_SETTINGS = {
  DEFAULTS: CURRENT_HAND_DEFAULTS,
  STYLING: CURRENT_HAND_STYLING,
  COLORS: CURRENT_HAND_COLORS,
  LABELS: CURRENT_HAND_LABELS,
  ICONS: CURRENT_HAND_ICONS,
  VALIDATION: CURRENT_HAND_VALIDATION,
  EVENTS: CURRENT_HAND_EVENTS,
  ALGORITHMS: CURRENT_HAND_ALGORITHMS,
  PAYOUT_INTEGRATION: CURRENT_HAND_PAYOUT_INTEGRATION,
  BETTING_INTEGRATION: CURRENT_HAND_BETTING_INTEGRATION,
  UTILS: CURRENT_HAND_UTILS,
  MAGIC_NUMBERS: CURRENT_HAND_MAGIC_NUMBERS,
} as const;
