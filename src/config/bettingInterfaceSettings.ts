// =============================================================================
// BETTING INTERFACE SETTINGS CONFIGURATION - CDD/HEADLESS SYSTEM
// =============================================================================
// Comprehensive configuration for BettingInterface & Statistics CDD architecture
// Following professional patterns established in sessionControlSettings.ts

// =============================================================================
// CORE CONFIGURATION CONSTANTS
// =============================================================================

export const BETTING_INTERFACE_DEFAULTS = {
  // Default values
  DEFAULT_BET_AMOUNT: 10,
  MIN_BET_AMOUNT: 0.5,
  MAX_BET_AMOUNT: 125000,
  BET_STEP: 0.5,

  // Risk management
  LOW_BALANCE_WARNING_RATIO: 0.5,
  LARGE_BET_WARNING_THRESHOLD: 100,

  // UI defaults
  ENABLE_SOUND_EFFECTS: false,
  ENABLE_ANIMATIONS: true,
  AUTO_CLEAR_ON_NEW_SESSION: false,

  // Button layout configuration
  BET_BUTTONS_PER_ROW: 3,
  PAIR_BUTTONS_PER_ROW: 2,

  // Validation timing
  VALIDATION_DEBOUNCE_MS: 300,

  // Statistics refresh interval
  STATS_REFRESH_INTERVAL_MS: 1000,

  // Professional formatting
  CURRENCY_DECIMALS: 2,
  PERCENTAGE_DECIMALS: 1,
} as const;

// =============================================================================
// MAIN BETTING INTERFACE CONFIGURATION
// =============================================================================

export const BETTING_INTERFACE_SETTINGS = {
  // Component identification
  COMPONENT_NAME: 'BettingInterface',

  // Labels and text content
  LABELS: {
    MAIN_TITLE: 'Betting Interface & Statistics',
    BALANCE_LABEL: 'Current Balance',
    BET_AMOUNT_LABEL: 'Bet Amount',
    BET_SELECTION_LABEL: 'Bet On',
    PAIR_BETS_LABEL: 'Pair Bets',
    PLACE_BET_BUTTON: 'Place Bet',
    PAYOUT_INFO_TITLE: 'Payout Information',
    CURRENT_BET_TITLE: 'Current Bet Status',

    // Bet type labels
    PLAYER_BET_LABEL: 'Player',
    BANKER_BET_LABEL: 'Banker',
    TIE_BET_LABEL: 'Tie',
    PLAYER_PAIR_LABEL: 'P Pair',
    BANKER_PAIR_LABEL: 'B Pair',

    // Status messages
    WAITING_MESSAGE: 'Waiting for hand to complete...',

    // Professional terminology
    PROFESSIONAL_WIN_INDICATOR: 'WON',
    PROFESSIONAL_LOSS_INDICATOR: 'LOST',
    ROI_LABEL: 'ROI',
    EDGE_LABEL: 'Edge',
  },

  // Icons and visual elements
  ICONS: {
    CURRENCY_SYMBOL: '$',
    PERCENTAGE_SYMBOL: '%',
    WIN_EMOJI: '🎉',
    LOSS_EMOJI: '💸',
    BET_PLACED_EMOJI: '✅',
    WARNING_EMOJI: '⚠️',
    ERROR_EMOJI: '❌',
  },

  // Professional color scheme
  COLORS: {
    MAIN_GRADIENT: 'from-green-50 to-blue-50',
    BORDER_COLOR: 'border-green-200',
    TITLE_COLOR: 'text-green-800',

    // Bet button colors (preserve exact current UI)
    PLAYER_SELECTED: 'bg-blue-600 text-white',
    PLAYER_UNSELECTED: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    BANKER_SELECTED: 'bg-red-600 text-white',
    BANKER_UNSELECTED: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    TIE_SELECTED: 'bg-green-600 text-white',
    TIE_UNSELECTED: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    PLAYER_PAIR_SELECTED: 'bg-purple-600 text-white',
    PLAYER_PAIR_UNSELECTED: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    BANKER_PAIR_SELECTED: 'bg-orange-600 text-white',
    BANKER_PAIR_UNSELECTED: 'bg-gray-200 text-gray-700 hover:bg-gray-300',

    // Place bet button
    PLACE_BET_ENABLED: 'bg-green-600 text-white hover:bg-green-700',
    PLACE_BET_DISABLED: 'bg-gray-400 cursor-not-allowed',

    // Status indicators
    CURRENT_BET_BACKGROUND: 'bg-yellow-50 border-yellow-200',
    CURRENT_BET_TEXT: 'text-yellow-800',
    CURRENT_BET_SUBTITLE: 'text-yellow-600',
  },

  // Component styling configuration
  STYLING: {
    // Main container
    MAIN_CONTAINER: 'card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200',
    MAIN_TITLE: 'text-xl font-semibold mb-4 text-green-800',

    // Betting controls grid
    BETTING_CONTROLS_GRID: 'grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6',

    // Form fields
    FORM_FIELD_CONTAINER: 'space-y-1',
    FORM_FIELD_LABEL: 'block text-sm font-medium text-gray-700 mb-1',
    FORM_FIELD_INPUT:
      'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500',
    FORM_FIELD_NOTE: 'text-xs text-gray-500 mt-1',

    // Balance display (read-only)
    BALANCE_DISPLAY:
      'w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-medium',

    // Button groups
    BET_BUTTON_GRID: 'grid grid-cols-3 gap-1',
    PAIR_BUTTON_GRID: 'grid grid-cols-2 gap-1',
    BET_BUTTON_BASE: 'px-2 py-2 rounded-md font-medium transition-colors text-xs',

    // Place bet button
    PLACE_BET_BUTTON: 'w-full px-4 py-2 rounded-md transition-colors',

    // Info panels
    PAYOUT_INFO_PANEL: 'p-3 bg-white rounded-lg border mb-4',
    PAYOUT_INFO_HEADER: 'flex items-center justify-between mb-2',
    PAYOUT_INFO_TITLE: 'text-sm font-medium text-gray-700',
    PAYOUT_INFO_GRID: 'grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600',

    // Current bet status
    CURRENT_BET_PANEL: 'p-3 bg-yellow-50 border border-yellow-200 rounded-lg',
    CURRENT_BET_TITLE: 'text-sm font-medium text-yellow-800',
    CURRENT_BET_SUBTITLE: 'text-xs text-yellow-600 mt-1',
  },
} as const;

// =============================================================================
// BET TYPE CONFIGURATIONS
// =============================================================================

export const BET_TYPES = {
  MAIN_BETS: [
    {
      key: 'player' as const,
      label: 'Player',
      shortLabel: 'Player',
      selectedClass: 'bg-blue-600 text-white',
      unselectedClass: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      keyboardShortcut: 'P',
      color: 'blue',
    },
    {
      key: 'banker' as const,
      label: 'Banker',
      shortLabel: 'Banker',
      selectedClass: 'bg-red-600 text-white',
      unselectedClass: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      keyboardShortcut: 'B',
      color: 'red',
    },
    {
      key: 'tie' as const,
      label: 'Tie',
      shortLabel: 'Tie',
      selectedClass: 'bg-green-600 text-white',
      unselectedClass: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      keyboardShortcut: 'T',
      color: 'green',
    },
  ],

  PAIR_BETS: [
    {
      key: 'playerPair' as const,
      label: 'P Pair',
      shortLabel: 'P Pair',
      selectedClass: 'bg-purple-600 text-white',
      unselectedClass: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      keyboardShortcut: '1',
      color: 'purple',
    },
    {
      key: 'bankerPair' as const,
      label: 'B Pair',
      shortLabel: 'B Pair',
      selectedClass: 'bg-orange-600 text-white',
      unselectedClass: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      keyboardShortcut: '2',
      color: 'orange',
    },
  ],
} as const;

// =============================================================================
// STATISTICS DISPLAY CONFIGURATION
// =============================================================================

export const STATISTICS_SETTINGS = {
  // Statistics categories
  CATEGORIES: {
    FINANCIAL: 'financial',
    PERFORMANCE: 'performance',
    STREAK: 'streak',
    ACCURACY: 'accuracy',
  },

  // Display metrics
  METRICS: {
    TOTAL_HANDS: {
      key: 'totalHands',
      label: 'Total Hands',
      icon: '🎲',
      color: 'text-blue-600',
      format: 'number',
    },
    CORRECT_BETS: {
      key: 'correctBets',
      label: 'Correct Bets',
      icon: '✅',
      color: 'text-green-600',
      format: 'number',
    },
    INCORRECT_BETS: {
      key: 'incorrectBets',
      label: 'Incorrect Bets',
      icon: '❌',
      color: 'text-red-600',
      format: 'number',
    },
    TOTAL_WAGERED: {
      key: 'totalAmountWagered',
      label: 'Total Wagered',
      icon: '💰',
      color: 'text-purple-600',
      format: 'currency',
      decimals: 0,
    },
    WIN_LOSS: {
      key: 'totalWinLoss',
      label: 'Total Win/Loss',
      icon: '📊',
      color: 'conditional', // green if positive, red if negative
      format: 'currency',
      decimals: 0,
      showSign: true,
    },
    WIN_RATE: {
      key: 'winRate',
      label: 'Win Rate',
      icon: '📈',
      color: 'conditional', // green if >= 50%, red if < 50%
      format: 'percentage',
      decimals: 1,
      threshold: 0.5,
    },
    ROI: {
      key: 'roi',
      label: 'ROI',
      icon: '💹',
      color: 'conditional', // green if positive, red if negative
      format: 'percentage',
      decimals: 1,
      threshold: 0,
    },
  },

  // Professional formatting patterns
  FORMATTING: {
    CURRENCY_SYMBOL: '$',
    PERCENTAGE_SYMBOL: '%',
    POSITIVE_PREFIX: '+',
    NEGATIVE_PREFIX: '',
    LARGE_NUMBER_THRESHOLD: 1000,
  },
} as const;

// =============================================================================
// EVENT DEFINITIONS
// =============================================================================

export const BETTING_INTERFACE_EVENTS = {
  // Betting actions
  BET_AMOUNT_CHANGED: 'bet-amount-changed' as const,
  BET_TYPE_SELECTED: 'bet-type-selected' as const,
  BET_PLACED: 'bet-placed' as const,
  BET_CLEARED: 'bet-cleared' as const,

  // Validation events
  VALIDATION_ERROR: 'validation-error' as const,
  VALIDATION_SUCCESS: 'validation-success' as const,

  // Integration events
  PAYOUT_SETTINGS_REQUESTED: 'payout-settings-requested' as const,
  BALANCE_UPDATE_REQUESTED: 'balance-update-requested' as const,

  // Statistics events
  STATISTICS_UPDATED: 'statistics-updated' as const,
  PERFORMANCE_CALCULATED: 'performance-calculated' as const,
} as const;

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const BETTING_VALIDATION = {
  BET_AMOUNT: {
    MIN_VALUE: 0.2,
    MAX_VALUE: 125000,
    STEP: 0.1,
    DEFAULT: 10,
  },
  BALANCE: {
    MIN_PERCENTAGE: 0.01, // 1% of balance
    MAX_PERCENTAGE: 1.0, // 100% of balance
    WARNING_PERCENTAGE: 0.5, // Warn if betting more than 50% of balance
  },
  BET_TYPE: {
    REQUIRED: true,
    VALID_TYPES: ['player', 'banker', 'tie', 'playerPair', 'bankerPair'] as const,
  },
} as const;

// =============================================================================
// INTEGRATION POINTS
// =============================================================================

export const INTEGRATION_POINTS = {
  // Payout Settings integration
  PAYOUT_SETTINGS: {
    HANDLER_PREFIX: 'handlePayout',
    EVENTS_TO_LISTEN: ['payout-change', 'preset-selected'],
    METHODS_TO_PROVIDE: ['formatPercentage', 'updatePayoutRates'],
  },

  // Session Control integration
  SESSION_CONTROL: {
    BALANCE_SOURCE: 'currentBalance',
    SESSION_STATE_DEPENDENCY: 'sessionActive',
    VALIDATION_DEPENDENCY: 'canPerformActions',
  },

  // Professional Algorithms integration
  ALGORITHMS: {
    KELLY_CRITERION: {
      BET_SIZE_RECOMMENDATION: 'optimalBetSize',
      EDGE_CALCULATION_DEPENDENCY: 'edgeCalculations',
    },
    MONTE_CARLO: {
      RISK_ASSESSMENT: 'riskOfRuin',
      EXPECTED_VALUE: 'expectedValue',
    },
    BURN_ANALYSIS: {
      EDGE_ADJUSTMENT: 'burnAdjustedEdge',
      CONFIDENCE_LEVEL: 'burnConfidence',
    },
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const BETTING_UTILS = {
  // Currency formatting with comma separators for large numbers
  formatCurrency: (
    amount: number,
    decimals = BETTING_INTERFACE_DEFAULTS.CURRENCY_DECIMALS
  ): string => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  },

  // Percentage formatting
  formatPercentage: (
    decimal: number,
    decimals = BETTING_INTERFACE_DEFAULTS.PERCENTAGE_DECIMALS
  ): string => {
    return `${(decimal * 100).toFixed(decimals)}%`;
  },

  // Professional number formatting with commas
  formatNumber: (num: number, decimals = 0): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= STATISTICS_SETTINGS.FORMATTING.LARGE_NUMBER_THRESHOLD) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  // Bet type validation
  isValidBetType: (betType: string): betType is BetType => {
    return BETTING_VALIDATION.BET_TYPE.VALID_TYPES.includes(betType as BetType);
  },

  // Professional ROI calculation
  calculateROI: (totalWinLoss: number, totalWagered: number): number => {
    return totalWagered > 0 ? totalWinLoss / totalWagered : 0;
  },

  // Risk assessment
  assessBetRisk: (betAmount: number, balance: number): 'low' | 'medium' | 'high' => {
    const ratio = betAmount / balance;
    if (ratio < 0.05) {
      return 'low';
    }
    if (ratio < 0.1) {
      return 'medium';
    }
    return 'high';
  },
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type BetType = 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair';

export interface BettingInterfaceState {
  betAmount: number;
  selectedBet: BetType | null;
  balance: number;
  isValidationEnabled: boolean;
  validationErrors: string[];
}

export interface CurrentBetState {
  hasBet: boolean;
  betType: BetType | null;
  betAmount: number;
  placedAt: Date | null;
}

export interface BettingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BetPlacementEvent {
  betType: BetType;
  betAmount: number;
  balance: number;
  timestamp: Date;
}

export interface StatisticsUpdateEvent {
  metrics: Record<string, number>;
  calculations: Record<string, number>;
  timestamp: Date;
}

// =============================================================================
// COMPREHENSIVE EXPORTS
// =============================================================================

export type BettingInterfaceDefaults = typeof BETTING_INTERFACE_DEFAULTS;
export type BettingInterfaceSettings = typeof BETTING_INTERFACE_SETTINGS;
export type BetTypeConfigs = typeof BET_TYPES;
export type StatisticsSettings = typeof STATISTICS_SETTINGS;
export type BettingValidation = typeof BETTING_VALIDATION;
export type IntegrationPoints = typeof INTEGRATION_POINTS;
