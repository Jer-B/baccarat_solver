// =============================================================================
// CURRENT HAND SETTINGS - COMPREHENSIVE CONFIGURATION
// =============================================================================
// Professional configuration file for Current Hand component
// Follows DRY principles and provides centralized control

import type { BetType } from '@/config/bettingInterfaceSettings';
import type { PayoutValues } from '@/config/payoutSettings';
import type { Card, HandResult } from '@/types/cards';

// =============================================================================
// INTERFACES
// =============================================================================

export interface PayoutReference {
  player: string;
  banker: string;
  tie: string;
  playerPair: string;
  bankerPair: string;
  commission: string;
}

export interface HandValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canComplete: boolean;
  requiresBet: boolean;
}

export interface HandCompletionEvent {
  handResult: HandResult;
  betResult?: any;
  balanceUpdate?: number;
  timestamp: number;
}

// =============================================================================
// CORE CONFIGURATION
// =============================================================================

export const CURRENT_HAND_SETTINGS = {
  // Component identification
  COMPONENT_NAME: 'CurrentHand',
  VERSION: '8.0.0',

  // Magic numbers and thresholds
  MAGIC_NUMBERS: {
    NATURAL_THRESHOLD: 8,
    MIN_CARDS_FOR_VALIDATION: 4,
    DEFAULT_AUTO_COMPLETE_CARD_COUNT: 6,
    AUTO_COMPLETE_DELAY_MS: 1000,
    DEFAULT_EDGE_PERCENTAGE: 0.01,
    MAX_HAND_VALUE: 9,
    CARD_VALUES: {
      ACE: 1,
      FACE_CARD_VALUE: 0,
      NUMBER_CARD_MULTIPLIER: 1,
    },
  } as const,

  // Default values
  DEFAULTS: {
    MIN_CARDS_FOR_COMPLETE_HAND: 4,
    AUTO_COMPLETE_ENABLED: false,
    REQUIRE_BET_FOR_COMPLETION: true,
    SHOW_PAYOUT_REFERENCE: true,
    SHOW_HAND_SUMMARY: true,
    SHOW_NATURAL_HIGHLIGHT: true,
    ENABLE_VALIDATION: true,
    LOADING_TIMEOUT_MS: 5000,
  } as const,

  // UI Labels and text
  LABELS: {
    COMPONENT_TITLE: 'Current Hand',
    AUTO_COMPLETE_CHECKBOX: 'Auto-complete at',
    AUTO_COMPLETE_SUFFIX: 'cards',
    AUTO_COMPLETE_BUTTON: 'Auto-Complete',
    AUTO_COMPLETE_TOOLTIP: 'Automatically complete hand with random cards',
    COMPLETE_ROUND_BUTTON: 'Complete Round',
    COMPLETE_BUTTON: 'Complete Round',
    COMPLETE_TOOLTIP: 'Complete the current round and settle bets',
    CLEAR_HAND_BUTTON: 'Clear Hand',
    CLEAR_BUTTON: 'Clear Hand',
    CLEAR_TOOLTIP: 'Clear all cards and reset the hand',
    PLAYER_LABEL: 'Player',
    PLAYER_TITLE: '閑 Player',
    BANKER_LABEL: 'Banker',
    BANKER_TITLE: '庄 Banker',
    CARD_ADD_TOOLTIP: 'Click to add a random card',
    CARD_REMOVE_TOOLTIP: 'Click to remove this card',
    NATURAL_BADGE: 'Natural',
    TIE_BET_LABEL: 'Tie Bet',
    PLAYER_PAIR_BET_LABEL: 'Player Pair Bet',
    BANKER_PAIR_BET_LABEL: 'Banker Pair Bet',
    PROFESSIONAL_ANALYSIS_TITLE: '🧮 Professional Analysis',
    ALGORITHM_TITLE: '🧠 Professional Analysis',
    KELLY_CRITERION_LABEL: 'Kelly Criterion',
    RISK_ASSESSMENT_LABEL: 'Risk Assessment',
    RECOMMENDATION_LABEL: 'Recommendation',
    PAYOUT_VALUES_TITLE: 'Current Payout Values',
    HAND_SUMMARY_TITLE: 'Hand Summary',
    CURRENT_LEADER_LABEL: 'Current Leader',
    CARDS_DEALT_LABEL: 'Cards Dealt',
    PLAYER_CARDS_LABEL: 'Player Cards',
    BANKER_CARDS_LABEL: 'Banker Cards',
    VALIDATION_ERRORS_TITLE: 'Validation Errors',
    WARNINGS_TITLE: 'Warnings',
    LOADING_COMPLETION: 'Completing hand...',
    LOADING_DEFAULT: 'Loading...',
    HIDE_BUTTON: 'Hide',
    WINNER_PLAYER: 'Player',
    WINNER_BANKER: 'Banker',
    WINNER_TIE: 'Tie',
    WINNER_UNKNOWN: 'Unknown',
    KELLY_RECOMMENDATION: 'Kelly recommends:',
    BURN_ADJUSTMENT: 'Burn adjustment:',
  } as const,

  // Color scheme and styling
  COLORS: {
    PLAYER_PRIMARY: 'text-blue-600',
    PLAYER_BACKGROUND: 'bg-blue-50',
    PLAYER_BORDER: 'border-blue-400',
    PLAYER_RING: 'ring-blue-300',
    PLAYER_BET_BADGE: 'bg-blue-600',

    BANKER_PRIMARY: 'text-red-600',
    BANKER_BACKGROUND: 'bg-red-50',
    BANKER_BORDER: 'border-red-400',
    BANKER_RING: 'ring-red-300',
    BANKER_BET_BADGE: 'bg-red-600',

    TIE_BACKGROUND: 'bg-green-50',
    TIE_BORDER: 'border-green-400',
    TIE_RING: 'ring-green-300',
    TIE_BET_BADGE: 'bg-green-600',

    PLAYER_PAIR_BACKGROUND: 'bg-purple-50',
    PLAYER_PAIR_BORDER: 'border-purple-400',
    PLAYER_PAIR_RING: 'ring-purple-300',
    PLAYER_PAIR_BET_BADGE: 'bg-purple-600',

    BANKER_PAIR_BACKGROUND: 'bg-orange-50',
    BANKER_PAIR_BORDER: 'border-orange-400',
    BANKER_PAIR_RING: 'ring-orange-300',
    BANKER_PAIR_BET_BADGE: 'bg-orange-600',

    NATURAL_BACKGROUND: 'bg-yellow-100',
    NATURAL_BORDER: 'border-yellow-200',
    NATURAL_TEXT: 'text-yellow-700',
    NATURAL_BADGE_BG: 'bg-yellow-200',

    COMPLETE_BUTTON_ENABLED: 'bg-red-500 text-white hover:bg-red-600',
    COMPLETE_BUTTON_DISABLED: 'bg-gray-400 text-gray-200 cursor-not-allowed',

    ALGORITHM_GRADIENT: 'bg-gradient-to-r from-purple-50 to-indigo-50',
    ALGORITHM_BORDER: 'border-purple-200',
    ALGORITHM_TITLE: 'text-purple-800',
    ALGORITHM_PANEL: 'bg-white border-purple-100',

    PAYOUT_BACKGROUND: 'bg-gray-50',
    PAYOUT_BORDER: 'border-gray-200',

    SUMMARY_BACKGROUND: 'bg-blue-50',
    SUMMARY_BORDER: 'border-blue-200',
    SUMMARY_TEXT: 'text-blue-600',
    SUMMARY_SUBTITLE: 'text-blue-500',

    ERROR_BACKGROUND: 'bg-red-50',
    ERROR_BORDER: 'border-red-200',
    ERROR_TITLE: 'text-red-700',
    ERROR_TEXT: 'text-red-600',
    ERROR_BULLET: 'text-red-500',

    WARNING_BACKGROUND: 'bg-yellow-50',
    WARNING_BORDER: 'border-yellow-200',
    WARNING_TITLE: 'text-yellow-700',
    WARNING_TEXT: 'text-yellow-600',
    WARNING_BULLET: 'text-yellow-500',

    LOADING_SPINNER: 'border-purple-600',
    LOADING_TEXT: 'text-purple-600',
  } as const,

  // CSS Classes
  CLASSES: {
    CONTAINER: 'space-y-4',
    HEADER: 'flex items-center justify-between mb-4',
    TITLE: 'text-xl font-semibold',
    AUTO_COMPLETE_LABEL: 'flex items-center space-x-2 text-sm cursor-pointer',
    AUTO_COMPLETE_CHECKBOX: 'rounded border-gray-300 text-purple-600 focus:ring-purple-500',
    AUTO_COMPLETE_TEXT: 'text-gray-700',
    AUTO_COMPLETE_BUTTON:
      'px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium',
    CONTROLS: 'flex items-center space-x-3',
    BUTTON_BASE: 'px-3 py-1 rounded-md text-sm transition-colors',

    // Hand layout classes
    HAND_CONTAINER: 'grid grid-cols-2 gap-6 mb-6',
    PLAYER_SECTION: 'space-y-3',
    BANKER_SECTION: 'space-y-3',
    HAND_GRID: 'grid grid-cols-2 gap-4',
    HAND_SIDE_BASE: 'p-3 rounded-lg border-2 transition-all duration-300',
    HAND_SIDE_DEFAULT: 'border-gray-200',
    HAND_HEADER: 'flex items-center justify-between mb-2',
    HAND_TITLE_CONTAINER: 'flex items-center space-x-2',
    HAND_TITLE: 'font-medium text-gray-700 text-lg',
    HAND_VALUE: 'text-2xl font-bold text-gray-900',
    KANJI_SVG: 'text-blue-600',
    BET_BADGE_BASE: 'text-white px-2 py-1 rounded-full text-xs font-bold',
    VALUE_CONTAINER: 'flex items-center space-x-2',
    VALUE_BASE: 'text-lg font-bold',
    VALUE_INACTIVE: 'text-gray-400',
    NATURAL_VALUE_HIGHLIGHT: 'bg-yellow-100 px-2 py-1 rounded',
    NATURAL_BADGE: 'text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded',

    // Card display classes
    CARDS_CONTAINER: 'flex space-x-2',
    CARD_SLOT:
      'w-12 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer hover:border-gray-400 transition-colors',
    EMPTY_CARD_SLOT:
      'w-12 h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all',

    // Status and results classes
    STATUS_CONTAINER: 'space-y-3 mb-4',
    WINNER_DISPLAY:
      'text-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg',
    WINNER_TEXT: 'text-lg font-bold',
    NATURAL_INDICATOR:
      'ml-2 px-2 py-1 bg-yellow-300 text-yellow-800 text-xs font-bold rounded-full',
    PAIRS_DISPLAY: 'flex justify-center space-x-4',
    PAIR_INDICATOR: 'px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full',

    // Algorithm panel classes
    ALGORITHM_PANEL:
      'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 space-y-3',
    ALGORITHM_HEADER: 'flex items-center justify-between',
    ALGORITHM_TITLE: 'text-lg font-semibold text-purple-800',
    ALGORITHM_TRIGGER_BUTTON:
      'px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm',
    ALGORITHM_RESULTS: 'space-y-4',
    UNIFIED_RECOMMENDATION: 'bg-white rounded-lg p-4 border border-purple-100',
    RECOMMENDATION_CONTENT: 'space-y-2',
    RECOMMENDATION_BET: 'text-sm',
    BET_TYPE_DISPLAY: 'font-semibold text-purple-600',
    CONFIDENCE_DISPLAY: 'text-sm text-gray-600',
    RATIONALE_DISPLAY: 'text-sm text-gray-700',
    WARNINGS_DISPLAY: 'text-sm text-amber-600 bg-amber-50 p-2 rounded',
    KELLY_PANEL: 'bg-white rounded-lg p-3 border border-green-100',
    KELLY_CONTENT: 'space-y-1',
    KELLY_BET_SIZE: 'text-sm font-medium text-green-700',
    KELLY_RISK: 'text-xs text-green-600',
    MONTE_CARLO_PANEL: 'bg-white rounded-lg p-3 border border-blue-100',
    MONTE_CARLO_CONTENT: 'space-y-1',
    MONTE_CARLO_BEST: 'text-sm font-medium text-blue-700',
    MONTE_CARLO_RISK: 'text-xs text-blue-600',

    // Action button classes
    ACTIONS_CONTAINER: 'flex justify-center space-x-4 pt-4',
    COMPLETE_BUTTON:
      'px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium',
    CLEAR_BUTTON:
      'px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium',

    // Other classes (existing)
    OTHER_BETS_CONTAINER: 'mt-4 p-3 rounded-lg border-2 transition-all duration-300',
    OTHER_BETS_CONTENT: 'flex items-center justify-center space-x-2',
    OTHER_BETS_LABEL: 'font-medium text-gray-700',
    ALGORITHM_CONTAINER:
      'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 space-y-3',
    ALGORITHM_TITLE_BASE: 'text-sm font-semibold text-purple-800 flex items-center gap-2',
    ALGORITHM_STATUS_BASE: 'px-2 py-1 text-xs rounded-full',
    ALGORITHM_GRID: 'grid grid-cols-1 md:grid-cols-3 gap-3',
    ALGORITHM_ITEM: 'text-center',
    ALGORITHM_SUBTITLE: 'text-xs text-gray-500 mb-1',
    ALGORITHM_VALUE: 'text-sm font-semibold',
    ALGORITHM_CONFIDENCE: 'text-xs text-gray-400',
    PAYOUT_REFERENCE_CONTAINER: 'bg-gray-50 border border-gray-200 rounded-lg p-3',
    PAYOUT_REFERENCE_HEADER: 'flex items-center justify-between mb-2',
    PAYOUT_REFERENCE_TITLE: 'text-sm font-medium text-gray-700',
    PAYOUT_REFERENCE_HIDE: 'text-xs text-purple-600 hover:text-purple-800 underline',
    PAYOUT_REFERENCE_GRID: 'grid grid-cols-2 md:grid-cols-5 gap-2 text-xs',
    PAYOUT_REFERENCE_ITEM: 'text-center',
    PAYOUT_REFERENCE_LABEL: 'text-gray-500',
    PAYOUT_REFERENCE_VALUE: 'font-semibold',
    SUMMARY_CONTAINER: 'bg-blue-50 border border-blue-200 rounded-lg p-3',
    SUMMARY_GRID: 'grid grid-cols-2 md:grid-cols-4 gap-3 text-sm',
    SUMMARY_ITEM: 'text-center',
    SUMMARY_VALUE: 'text-blue-600 font-semibold',
    SUMMARY_LABEL: 'text-blue-500 text-xs',
    LOADING_CONTAINER: 'text-center py-4',
    LOADING_CONTENT: 'inline-flex items-center space-x-2 text-purple-600',
    LOADING_SPINNER: 'animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600',
    LOADING_TEXT: 'text-sm',
    ERROR_CONTAINER: 'bg-red-50 border border-red-200 rounded-lg p-3',
    ERROR_TITLE: 'text-sm font-medium text-red-700 mb-1',
    ERROR_LIST: 'text-sm text-red-600 space-y-1',
    ERROR_ITEM: 'flex items-start space-x-1',
    WARNING_CONTAINER: 'bg-yellow-50 border border-yellow-200 rounded-lg p-3',
    WARNING_TITLE: 'text-sm font-medium text-yellow-700 mb-1',
    WARNING_LIST: 'text-sm text-yellow-600 space-y-1',
    WARNING_ITEM: 'flex items-start space-x-1',
  } as const,

  // Professional algorithm configuration
  ALGORITHMS: {
    KELLY: {
      ENABLE_RECOMMENDATIONS: true,
      DEFAULT_EDGE: 0.01,
      MAX_FRACTION: 0.25,
      MIN_CONFIDENCE: 0.8,
    },
    MONTE_CARLO: {
      ENABLE_RISK_ASSESSMENT: true,
      DEFAULT_ITERATIONS: 10000,
      MIN_SIMULATIONS: 1000,
      MAX_SIMULATIONS: 100000,
    },
    BURN_ANALYSIS: {
      ENABLE_EDGE_ADJUSTMENT: true,
      DEFAULT_BURN_COUNT: 0,
      MAX_BURN_CARDS: 14,
    },
  } as const,

  // Event names
  EVENTS: {
    // Hand lifecycle
    HAND_COMPLETED: 'hand-completed',
    HAND_CLEARED: 'hand-cleared',
    HAND_STARTED: 'hand-started',
    HAND_UPDATED: 'hand-updated',

    // Card events
    CARD_ADDED: 'card-added',
    CARDS_DEALT: 'cards-dealt',

    // Auto-complete events
    AUTO_COMPLETE_ENABLED: 'auto-complete-enabled',
    AUTO_COMPLETE_DISABLED: 'auto-complete-disabled',
    AUTO_COMPLETE_TRIGGERED: 'auto-complete-triggered',
    AUTO_COMPLETE_TOGGLED: 'auto-complete-toggled',

    // Winner determination
    WINNER_DETERMINED: 'winner-determined',
    NATURAL_DETECTED: 'natural-detected',
    TIE_DETECTED: 'tie-detected',

    // Betting integration
    BET_SETTLED: 'bet-settled',
    BET_SETTLED_WITH_DETAILS: 'bet-settled-with-details',
    BALANCE_UPDATED: 'balance-updated',
    PAYOUT_CALCULATED: 'payout-calculated',
    PAYOUT_CALCULATION_REQUESTED: 'payout-calculation-requested',

    // PayoutSettings integration
    PAYOUT_VALUES_CHANGED: 'payout-values-changed',
    PAYOUT_REFERENCE_UPDATED: 'payout-reference-updated',
    EXPECTED_PAYOUT_CHANGED: 'expected-payout-changed',

    // Professional algorithms
    KELLY_CALCULATION_REQUESTED: 'kelly-calculation-requested',
    MONTE_CARLO_ASSESSMENT_REQUESTED: 'monte-carlo-assessment-requested',
    BURN_ANALYSIS_UPDATED: 'burn-analysis-updated',
    ALGORITHM_CALCULATION_COMPLETED: 'algorithm-calculation-completed',
    ALGORITHM_STATUS_CHANGED: 'algorithm-status-changed',
    ALGORITHM_RECOMMENDATION_CHANGED: 'algorithm-recommendation-changed',

    // Validation
    VALIDATION_ERROR: 'validation-error',
    VALIDATION_SUCCESS: 'validation-success',

    // UI state
    LOADING_STARTED: 'loading-started',
    LOADING_COMPLETED: 'loading-completed',

    // Component lifecycle
    COMPONENT_READY: 'component-ready',
    COMPONENT_UNMOUNTED: 'component-unmounted',

    // Session integration
    SESSION_SYNC_REQUESTED: 'session-sync-requested',

    // User interactions
    USER_INTERACTION: 'user-interaction',

    // Integration errors
    INTEGRATION_ERROR: 'integration-error',
  } as const,

  // Validation rules
  VALIDATION: {
    MIN_CARDS_REQUIRED: 4,
    MAX_CARDS_PER_SIDE: 3,
    REQUIRE_SESSION_ACTIVE: true,
    REQUIRE_BET_FOR_COMPLETION: true,
    CARD_VALIDATION_ENABLED: true,
  } as const,

  // Error messages
  ERROR_MESSAGES: {
    INSUFFICIENT_CARDS: 'At least 4 cards required to complete hand',
    SESSION_INACTIVE: 'Session must be active to complete hand',
    BET_REQUIRED: 'A bet is required to complete the round',
    INVALID_CARD: 'Invalid card detected',
    CALCULATION_FAILED: 'Failed to calculate hand value',
    SETTLEMENT_FAILED: 'Failed to settle bet',
    ALGORITHM_ERROR: 'Professional algorithm calculation failed',
    PAYOUT_CALCULATION_ERROR: 'Failed to calculate payout',
    BALANCE_UPDATE_ERROR: 'Failed to update balance',
  } as const,

  // Warning messages
  WARNING_MESSAGES: {
    AUTO_COMPLETE_ENABLED: 'Auto-complete is enabled',
    NO_BET_PLACED: 'No bet has been placed for this round',
    LOW_CONFIDENCE: 'Algorithm confidence is below recommended threshold',
    INSUFFICIENT_BALANCE: 'Balance may be insufficient for recommended bet',
  } as const,
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const CURRENT_HAND_UTILS = {
  // Hand value calculation
  calculateHandValue: (cards: Card[]): number => {
    const total = cards.reduce((sum, card) => {
      const rank = card.rank.toUpperCase();
      if (rank === 'A') return sum + CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.CARD_VALUES.ACE;
      if (['K', 'Q', 'J'].includes(rank))
        return sum + CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.CARD_VALUES.FACE_CARD_VALUE;
      return (
        sum +
        parseInt(rank) * CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.CARD_VALUES.NUMBER_CARD_MULTIPLIER
      );
    }, 0);
    return total % 10;
  },

  // Winner determination
  determineWinner: (playerValue: number, bankerValue: number): 'player' | 'banker' | 'tie' => {
    if (playerValue === bankerValue) return 'tie';
    return playerValue > bankerValue ? 'player' : 'banker';
  },

  // Natural detection
  hasNatural: (value: number): boolean => {
    return value >= CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.NATURAL_THRESHOLD;
  },

  // PayoutSettings integration
  formatPayoutReference: (payoutValues: PayoutValues): PayoutReference => {
    return {
      player: `${payoutValues.player_payout}:1`,
      banker: `${payoutValues.banker_payout}:1`,
      tie: `${payoutValues.tie_payout}:1`,
      playerPair: `${payoutValues.player_pair_payout}:1`,
      bankerPair: `${payoutValues.banker_pair_payout}:1`,
      commission: `${(payoutValues.banker_commission * 100).toFixed(1)}%`,
    };
  },

  // Hand validation
  validateHandCompletion: (
    playerCards: Card[],
    bankerCards: Card[],
    sessionActive: boolean,
    hasBet: boolean
  ): HandValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const totalCards = playerCards.length + bankerCards.length;

    // Check minimum cards
    if (totalCards < CURRENT_HAND_SETTINGS.VALIDATION.MIN_CARDS_REQUIRED) {
      errors.push(CURRENT_HAND_SETTINGS.ERROR_MESSAGES.INSUFFICIENT_CARDS);
    }

    // Check session active
    if (CURRENT_HAND_SETTINGS.VALIDATION.REQUIRE_SESSION_ACTIVE && !sessionActive) {
      errors.push(CURRENT_HAND_SETTINGS.ERROR_MESSAGES.SESSION_INACTIVE);
    }

    // Check bet requirement
    if (CURRENT_HAND_SETTINGS.VALIDATION.REQUIRE_BET_FOR_COMPLETION && !hasBet) {
      warnings.push(CURRENT_HAND_SETTINGS.WARNING_MESSAGES.NO_BET_PLACED);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canComplete: errors.length === 0,
      requiresBet: CURRENT_HAND_SETTINGS.VALIDATION.REQUIRE_BET_FOR_COMPLETION,
    };
  },

  // UI helpers
  formatHandStatus: (status: string): string => {
    switch (status) {
      case 'natural':
        return 'Natural';
      case 'ready':
        return 'Ready to Complete';
      case 'complete':
        return 'Complete';
      case 'incomplete':
        return 'In Progress';
      default:
        return 'Unknown';
    }
  },

  getWinnerClass: (winner: string | null): string => {
    switch (winner) {
      case 'player':
        return CURRENT_HAND_SETTINGS.COLORS.PLAYER_PRIMARY;
      case 'banker':
        return CURRENT_HAND_SETTINGS.COLORS.BANKER_PRIMARY;
      case 'tie':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  },

  // Professional algorithm helpers
  formatAlgorithmStatus: (status: string): string => {
    switch (status) {
      case 'high_confidence':
        return 'High Confidence';
      case 'low_confidence':
        return 'Low Confidence';
      case 'calculating':
        return 'Calculating...';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Inactive';
    }
  },

  getAlgorithmStatusColor: (status: string): string => {
    switch (status) {
      case 'high_confidence':
        return 'bg-green-100 text-green-700';
      case 'low_confidence':
        return 'bg-yellow-100 text-yellow-700';
      case 'calculating':
        return 'bg-blue-100 text-blue-700';
      case 'warning':
        return 'bg-orange-100 text-orange-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  },

  // Currency and formatting helpers
  formatCurrency: (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  },

  formatPercentage: (decimal: number): string => {
    return `${(decimal * 100).toFixed(1)}%`;
  },

  formatConfidence: (confidence: number): string => {
    return `${(confidence * 100).toFixed(0)}% confidence`;
  },
} as const;

// Export type for external usage
export type CurrentHandSettings = typeof CURRENT_HAND_SETTINGS;
export type CurrentHandUtils = typeof CURRENT_HAND_UTILS;
