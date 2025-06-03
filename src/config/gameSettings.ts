/**
 * Game Settings Constants
 *
 * Centralized configuration for all game-related default values
 * to eliminate magic numbers throughout the application.
 */

// =============================================================================
// SESSION CONTROL DEFAULTS
// =============================================================================

export const SESSION_DEFAULTS = {
  // Session settings
  AUTO_BURN_ENABLED: true,
  AUTO_BURN_COUNT: 3,
  MANUAL_BURN_COUNT: 3,
  STARTING_BALANCE: 10000,

  // Session constraints
  MIN_BURN_COUNT: 0,
  MAX_BURN_COUNT: 10,
  MIN_STARTING_BALANCE: 1,
  MAX_STARTING_BALANCE: 999999999999,

  // Balance settings
  USE_PREVIOUS_END_BALANCE: false,
  FALLBACK_BALANCE: 10000,

  // Time calculation constants
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  TIMER_UPDATE_INTERVAL: 1000,
  MANUAL_BURN_RESET_VALUE: 3,

  /** Default session name prefix */
  SESSION_NAME_PREFIX: 'Session',

  /** Session timeout duration in milliseconds (30 minutes) */
  SESSION_TIMEOUT: 30 * 60 * 1000,
} as const;

// =============================================================================
// DECK CONFIGURATION DEFAULTS
// =============================================================================

export const DECK_DEFAULTS = {
  /** Default number of decks in the shoe */
  NUMBER_OF_DECKS: 8,

  /** Default cut card position (cards from bottom of shoe) */
  CUT_CARD_POSITION: 56,

  /** Minimum allowed cut card position */
  MIN_CUT_CARD_POSITION: 10,

  /** Maximum allowed cut card position (2 decks worth) */
  MAX_CUT_CARD_POSITION: 104,

  /** Available deck options for selection */
  DECK_OPTIONS: [1, 2, 3, 4, 5, 6, 7, 8] as const,

  /** Cards per deck */
  CARDS_PER_DECK: 52,

  /** Number of cards of each rank per deck */
  CARDS_PER_RANK_PER_DECK: 4,
} as const;

// =============================================================================
// BURN CARD DEFAULTS
// =============================================================================

export const BURN_DEFAULTS = {
  /** Default auto burn enabled state */
  AUTO_BURN_ENABLED: true,

  /** Default number of cards to auto burn at session start */
  AUTO_BURN_COUNT: 3,

  /** Default number of cards for manual burn */
  MANUAL_BURN_COUNT: 3,

  /** Minimum burn count */
  MIN_BURN_COUNT: 0,

  /** Maximum burn count */
  MAX_BURN_COUNT: 10,

  /** Reset value for manual burn count after use */
  MANUAL_BURN_RESET_VALUE: 3,
} as const;

// =============================================================================
// BETTING DEFAULTS
// =============================================================================

export const BETTING_DEFAULTS = {
  /** Default bet amount */
  DEFAULT_BET_AMOUNT: 10,

  /** Minimum bet amount */
  MIN_BET_AMOUNT: 0.5,

  /** Maximum bet amount */
  MAX_BET_AMOUNT: 125000,

  /** Default bet step increment */
  BET_STEP: 0.5,

  /** Quick bet amounts */
  QUICK_BET_AMOUNTS: [5, 10, 25, 50, 100, 250],

  /** UI state defaults */
  LAST_BET_TYPE: null,
  SHOW_PAYOUT_REFERENCE: true,
} as const;

// =============================================================================
// CARD COMPOSITION LIMITS
// =============================================================================

export const CARD_LIMITS = {
  /** Get maximum 0-value cards (A,2,3,4,5,6,7,8,9 - 9 ranks × 4 suits per deck) */
  getMaxZeroValueCards: (numberOfDecks: number) =>
    numberOfDecks * 9 * DECK_DEFAULTS.CARDS_PER_RANK_PER_DECK,

  /** Get maximum value cards for a specific rank (4 suits per deck) */
  getMaxCardsPerRank: (numberOfDecks: number) =>
    numberOfDecks * DECK_DEFAULTS.CARDS_PER_RANK_PER_DECK,

  /** Get total cards in shoe */
  getTotalCards: (numberOfDecks: number) => numberOfDecks * DECK_DEFAULTS.CARDS_PER_DECK,
} as const;

// =============================================================================
// ANALYSIS THRESHOLDS
// =============================================================================

export const ANALYSIS_THRESHOLDS = {
  /** Threshold for "rich" rank (more than 70% cards remaining) */
  RICH_THRESHOLD: 0.7,

  /** Threshold for "depleted" rank (less than 30% cards remaining) */
  DEPLETED_THRESHOLD: 0.3,

  /** High pair probability threshold (8%+) */
  HIGH_PAIR_PROBABILITY: 0.08,

  /** Medium pair probability threshold (6%-8%) */
  MEDIUM_PAIR_PROBABILITY: 0.06,

  /** Average cards per round for estimation */
  AVERAGE_CARDS_PER_ROUND: 6,
} as const;

// =============================================================================
// SHUFFLE WARNING THRESHOLDS
// =============================================================================

export const SHUFFLE_WARNINGS = {
  /** Cards remaining for "twenty cards" warning */
  TWENTY_CARDS_WARNING: 20,

  /** Cards remaining for "six cards" warning */
  SIX_CARDS_WARNING: 6,

  /** Additional buffer for cut card warnings */
  CUT_CARD_BUFFER: 6,

  /** Additional buffer for pre-cut card warnings */
  PRE_CUT_CARD_BUFFER: 20,
} as const;

// =============================================================================
// HAND VALIDATION
// =============================================================================

export const HAND_VALIDATION = {
  /** Minimum cards required for a complete hand */
  MIN_CARDS_FOR_COMPLETE_HAND: 4,

  /** Maximum cards possible in a hand (player + banker) */
  MAX_CARDS_PER_HAND: 6,

  /** Maximum cards for player or banker individually */
  MAX_CARDS_PER_SIDE: 3,
} as const;

// =============================================================================
// UI/UX CONSTANTS
// =============================================================================

export const UI_CONSTANTS = {
  /** Duration for toast notifications (milliseconds) */
  TOAST_DURATION: 3000,

  /** Delay for auto-save operations (milliseconds) */
  AUTO_SAVE_DELAY: 1000,

  /** Polling interval for real-time updates (milliseconds) */
  POLLING_INTERVAL: 5000,
} as const;

// =============================================================================
// BURN ESTIMATION SCENARIOS
// =============================================================================

export const BURN_SCENARIOS = {
  CONSERVATIVE: {
    count: 4,
    highCardBias: 0.3,
    confidence: 60,
  },
  AGGRESSIVE: {
    count: 7,
    highCardBias: 0.6,
    confidence: 45,
  },
  RANDOM: {
    count: 5,
    highCardBias: 0.5,
    confidence: 50,
  },
} as const;

// =============================================================================
// TOGGLE INTERFACE DEFAULTS
// =============================================================================

export const TOGGLE_SETTINGS = {
  /** Default info panels visibility SHOW state on application startup */
  INFO_PANELS_DEFAULT_VISIBLE: true,

  /** Default developer tools visibility SHOW state on application startup */
  DEV_TOOLS_DEFAULT_VISIBLE: false,

  /** Remember toggle states between sessions using localStorage */
  PERSIST_TOGGLE_STATES: false,

  /** Default size for header toggle buttons (Info Panels, Dev Tools) */
  HEADER_TOGGLE_SIZE: 'md' as const,

  /** Default size for small info section toggle buttons */
  INFO_SECTION_TOGGLE_SIZE: 'sm' as const,

  /** Enable/disable individual section toggles when global is off */
  INDIVIDUAL_TOGGLES_WHEN_GLOBAL_OFF: true,

  /** Icon configuration for toggle buttons */
  ICONS: {
    /** Info section toggle icons */
    INFO_ACTIVE: '👁️', // Eye emoji for "Hide" state
    INFO_INACTIVE: '👁️‍🗨️', // Eye with speech bubble for "Show" state

    /** Header toggle icons */
    INFO_PANELS_ACTIVE: '👁️', // Eye emoji for info panels
    INFO_PANELS_INACTIVE: '👁️‍🗨️', // Eye with speech bubble for info panels
    DEV_TOOLS_ACTIVE: '🛠️', // Tools emoji for dev tools
    DEV_TOOLS_INACTIVE: '🛠️', // Same icon for consistency

    /** Status indicators */
    LOADING: '⏳', // Loading spinner
    SUCCESS: '✅', // Success checkmark
    ERROR: '❌', // Error cross
    WARNING: '⚠️', // Warning triangle
  },

  /** Text configuration for accessibility and i18n readiness */
  TEXT: {
    HIDE: 'Hide',
    SHOW: 'Show',
    TOGGLE: 'Toggle',
    VISIBLE: 'visible',
    HIDDEN: 'hidden',
  },
} as const;

// =============================================================================
// COMPREHENSIVE GAME SETTINGS
// =============================================================================

export const GAME_SETTINGS = {
  session: SESSION_DEFAULTS,
  deck: DECK_DEFAULTS,
  burn: BURN_DEFAULTS,
  betting: BETTING_DEFAULTS,
  cardLimits: CARD_LIMITS,
  analysis: ANALYSIS_THRESHOLDS,
  shuffle: SHUFFLE_WARNINGS,
  hand: HAND_VALIDATION,
  ui: UI_CONSTANTS,
  burnScenarios: BURN_SCENARIOS,
  toggles: TOGGLE_SETTINGS,
} as const;

// Type exports for TypeScript support
export type SessionDefaults = typeof SESSION_DEFAULTS;
export type DeckDefaults = typeof DECK_DEFAULTS;
export type BurnDefaults = typeof BURN_DEFAULTS;
export type BettingDefaults = typeof BETTING_DEFAULTS;
export type CardLimits = typeof CARD_LIMITS;
export type AnalysisThresholds = typeof ANALYSIS_THRESHOLDS;
export type ShuffleWarnings = typeof SHUFFLE_WARNINGS;
export type HandValidation = typeof HAND_VALIDATION;
export type UIConstants = typeof UI_CONSTANTS;
export type BurnScenarios = typeof BURN_SCENARIOS;
export type GameSettings = typeof GAME_SETTINGS;
