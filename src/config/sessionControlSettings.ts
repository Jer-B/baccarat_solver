/**
 * Session Control Settings Configuration
 *
 * Centralized configuration for all Session Control sections
 * to eliminate hardcoded values and enable CDD compliance.
 */

// =============================================================================
// SESSION CONTROL MAIN CONFIGURATION
// =============================================================================

export const SESSION_CONTROL = {
  /** Main container styling */
  STYLING: {
    MAIN_CONTAINER: 'card bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200',
    HEADER_CONTAINER: 'flex items-center justify-between',
    HEADER_LEFT: 'flex items-center space-x-4',
    TITLE: 'text-xl font-semibold text-indigo-800',

    /** Status indicator */
    STATUS_CONTAINER: 'flex items-center space-x-2',
    STATUS_INDICATOR_BASE: 'w-3 h-3 rounded-full',
    STATUS_ACTIVE: 'bg-green-500 animate-pulse',
    STATUS_INACTIVE: 'bg-red-500',
    STATUS_TEXT_BASE: 'text-sm font-medium',
    STATUS_TEXT_ACTIVE: 'text-green-700',
    STATUS_TEXT_INACTIVE: 'text-red-700',

    /** Duration display */
    DURATION_TEXT: 'text-sm text-gray-600',

    /** Action buttons */
    BUTTON_CONTAINER: 'flex items-center space-x-3',
    START_BUTTON:
      'px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed',
    END_BUTTON:
      'px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors flex items-center space-x-2',
    BUTTON_ICON: 'w-4 h-4',
  },

  /** Labels and text */
  LABELS: {
    TITLE: 'Session Control',
    STATUS_ACTIVE: 'Session Active',
    STATUS_INACTIVE: 'Session Inactive',
    DURATION_PREFIX: 'Duration:',
    START_BUTTON: 'Start Session',
    END_BUTTON: 'End Session',
  },

  /** SVG icon paths */
  ICONS: {
    START_SESSION: {
      PATHS: [
        'M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z',
      ],
      VIEWBOX: '0 0 24 24',
    },
    END_SESSION: {
      PATHS: ['M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 'M9 10h6v4H9z'],
      VIEWBOX: '0 0 24 24',
    },
  },

  /** Session timing constants */
  TIMING: {
    MILLISECONDS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
  },

  /** Fallback values */
  FALLBACKS: {
    BALANCE: 500,
  },
} as const;

// =============================================================================
// SESSION CONTROL DEFAULTS CONFIGURATION
// =============================================================================

export const SESSION_CONTROL_DEFAULTS = {
  /** Session state defaults */
  SESSION_STATE: {
    USE_PREVIOUS_END_BALANCE: false as boolean,
    PREVIOUS_END_BALANCE: 0 as number,
    AUTO_BURN_ENABLED: true as boolean,
    AUTO_BURN_COUNT: 3 as number,
    MANUAL_BURN_COUNT: 3 as number,
  },

  /** Session timing defaults */
  TIMING: {
    INITIAL_START_TIME: null as number | null,
    INITIAL_DURATION: '0:00',
  },

  /** Session validation */
  VALIDATION: {
    MIN_BALANCE_FOR_START: 1,
  },
} as const;

// =============================================================================
// VALIDATION STYLING CONFIGURATION
// =============================================================================

export const VALIDATION_STYLING = {
  /** Error message styling */
  ERROR_MESSAGE: 'text-xs text-red-600 mt-1',
  WARNING_MESSAGE: 'text-xs text-yellow-600 mt-1',
  SUCCESS_MESSAGE: 'text-xs text-green-600 mt-1',
  INFO_MESSAGE: 'text-xs text-blue-600 mt-1',

  /** Field state styling */
  FIELD_ERROR: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  FIELD_WARNING: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
  FIELD_SUCCESS: 'border-green-300 focus:border-green-500 focus:ring-green-500',
  FIELD_NORMAL: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
} as const;

// =============================================================================
// BALANCE SETTINGS CONFIGURATION
// =============================================================================

export const BALANCE_SETTINGS = {
  /** Balance input constraints */
  CONSTRAINTS: {
    MIN_BALANCE: 1,
    MAX_BALANCE: 1000000000000,
    STEP: 0.01,
  },

  /** Default values */
  DEFAULTS: {
    STARTING_BALANCE: 500,
    FALLBACK_BALANCE: 500,
    USE_PREVIOUS_BALANCE: false,
  },

  /** Labels and text */
  LABELS: {
    SECTION_TITLE: '💰 Balance Settings',
    STARTING_BALANCE: 'Starting Balance:',
    PREVIOUS_SESSION: 'Previous Session:',
    USE_PREVIOUS_BALANCE: 'Use previous end balance',
    CURRENCY_SYMBOL: '$',
    PLACEHOLDER: '500.00',
  },

  /** Action buttons */
  BUTTONS: {
    REFRESH_PREVIOUS:
      'ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400',
    REFRESH_TEXT_LOADING: 'Loading...',
    REFRESH_TEXT_DEFAULT: 'Refresh',
  },

  /** Info panel configuration */
  INFO_PANEL: {
    TITLE: '💡 Balance Settings Information',
    SECTION: 'sessionControl',
    SUBSECTION: 'balanceInfo',
    CONTENT: {
      BALANCE_MANAGEMENT: {
        TITLE: 'Balance Management:',
        POINTS: [
          '• Starting balance is locked during active sessions',
          '• End balance is automatically calculated and recorded',
          '• Use previous end balance for continuous bankroll tracking',
        ],
      },
      PROFESSIONAL_FEATURES: {
        TITLE: 'Professional Features:',
        POINTS: [
          '• Track profit/loss across multiple sessions',
          '• Automatically save session financial data',
          '• Seamless bankroll continuity between sessions',
        ],
      },
    },
  },

  /** CSS classes */
  STYLING: {
    SECTION_CONTAINER: 'mt-6 p-4 bg-white bg-opacity-60 border border-green-100 rounded-lg',
    HEADER: 'flex items-center justify-between mb-3',
    TITLE: 'text-sm font-semibold text-gray-700',
    GRID: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    FIELD_CONTAINER: 'space-y-2',
    LABEL: 'text-sm text-gray-600',
    INPUT_WRAPPER: 'flex items-center space-x-2',
    CURRENCY: 'text-sm text-gray-500',
    INPUT:
      'flex-1 text-gray-900 rounded px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed',
    CHECKBOX_LABEL: 'flex items-center space-x-2 cursor-pointer',
    CHECKBOX: 'text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed',
    CHECKBOX_TEXT: 'text-sm font-medium text-gray-700',
    PREVIOUS_BALANCE: 'text-xs text-green-600',
    INFO_CONTAINER: 'bg-green-50 p-3 rounded-lg mt-4 border border-green-200',
    INFO_HEADER: 'flex items-center justify-between mb-2',
    INFO_TITLE: 'text-sm font-semibold text-green-800',
    INFO_CONTENT: 'text-xs text-green-700 grid grid-cols-1 md:grid-cols-2 gap-4',
    INFO_SECTION_TITLE: 'font-medium mb-1',
    /** Validation styling */
    VALIDATION_ERROR: 'text-xs text-red-600 mt-1',
    VALIDATION_WARNING: 'text-xs text-yellow-600 mt-1',
    VALIDATION_SUCCESS: 'text-xs text-green-600 mt-1',
  },
} as const;

// =============================================================================
// DECK SETTINGS CONFIGURATION
// =============================================================================

export const DECK_SETTINGS = {
  /** Deck constraints */
  CONSTRAINTS: {
    MIN_CUT_CARD: 10,
    MAX_CUT_CARD: 50,
    DECK_OPTIONS: [1, 2, 3, 4, 5, 6, 7, 8] as const,
  },

  /** Default values */
  DEFAULTS: {
    NUMBER_OF_DECKS: 8,
    CUT_CARD_POSITION: 45,
  },

  /** Labels and text */
  LABELS: {
    SECTION_TITLE: '⚙️ Deck Settings',
    NUMBER_OF_DECKS: 'Number of Decks:',
    CUT_CARD_POSITION: 'Cut Card Position:',
    CUT_CARD_TOOLTIP: 'Cut card position: Number of cards from bottom when shuffle is required',
    CARDS_UNIT: 'cards',
    PLACEHOLDER: 'Cards from bottom',
    INITIALIZE_LABEL: 'New Shoe',
  },

  /** Action buttons */
  BUTTONS: {
    NEW_SHOE:
      'px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors',
    NEW_SHOE_TEXT: 'New Shoe',
  },

  /** Info panel configuration */
  INFO_PANEL: {
    TITLE: '🃏 Cut Card System',
    SECTION: 'sessionControl',
    SUBSECTION: 'deckInfo',
    CONTENT: {
      HOW_IT_WORKS: {
        TITLE: 'How It Works:',
        POINTS: [
          '• Cut card placed {cutCardPosition} cards from bottom',
          '• When reached → finish current hand, then shuffle',
          '• Prevents deep penetration for security',
        ],
      },
      SETTINGS_GUIDE: {
        TITLE: 'Settings Guide:',
        POINTS: [
          '• Lower (10-30): More penetration, better for counting',
          '• Higher (50-104): Less penetration, more secure',
          '• Casino typical: 52-78 cards (1-1.5 decks)',
        ],
      },
    },
  },

  /** CSS classes */
  STYLING: {
    SECTION_CONTAINER: 'mt-6 p-4 bg-white bg-opacity-60 border border-blue-100 rounded-lg',
    HEADER: 'flex items-center justify-between mb-3',
    TITLE: 'text-sm font-semibold text-gray-700',
    GRID: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    FIELD_CONTAINER: 'space-y-2',
    LABEL: 'text-sm text-gray-600',
    SELECT:
      'w-full text-gray-900 rounded px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed',
    INPUT_WRAPPER: 'flex items-center space-x-2',
    INPUT:
      'flex-1 text-gray-900 rounded px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed',
    UNIT_LABEL: 'text-xs text-gray-500',
    INFO_CONTAINER: 'bg-blue-50 p-3 rounded-lg mt-4 border border-blue-200',
    INFO_HEADER: 'flex items-center justify-between mb-2',
    INFO_TITLE: 'text-sm font-semibold text-blue-800',
    INFO_CONTENT: 'grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700',
    INFO_SECTION_TITLE: 'font-medium mb-1',
    /** Validation styling */
    VALIDATION_ERROR: 'text-xs text-red-600 mt-1',
    VALIDATION_WARNING: 'text-xs text-yellow-600 mt-1',
    VALIDATION_SUCCESS: 'text-xs text-green-600 mt-1',
  },
} as const;

// =============================================================================
// BURN SETTINGS CONFIGURATION
// =============================================================================

export const BURN_SETTINGS = {
  /** Burn constraints */
  CONSTRAINTS: {
    MIN_BURN_COUNT: 0,
    MAX_BURN_COUNT: 10,
    MIN_MANUAL_BURN: 1,
  },

  /** Default values */
  DEFAULTS: {
    AUTO_BURN_ENABLED: true,
    AUTO_BURN_COUNT: 3,
    MANUAL_BURN_COUNT: 3,
    MANUAL_BURN_RESET: 3,
  },

  /** Labels and text */
  LABELS: {
    SECTION_TITLE: '🔥 Burn Card Settings',
    SECTION_SUBTITLE: '* For the professional burn card tracking algorithm',
    AUTO_BURN_LABEL: 'Auto Burn at Session Start',
    MANUAL_BURN_LABEL: 'Manual Burn:',
    BURN_BUTTON: '🔥 Burn Now',
    CARDS_UNIT: 'cards',
    CARDS_REMAINING: '{count} cards remaining',
    PLACEHOLDER_AUTO: '3',
    PLACEHOLDER_MANUAL: '3',
    TOOLTIP_MANUAL: 'Burn cards manually at any time',
  },

  /** Action buttons */
  BUTTONS: {
    AUTO_BURN_NOW:
      'px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 transition-colors',
    AUTO_BURN_TEXT_EXECUTING: 'Burning...',
    AUTO_BURN_TEXT_DEFAULT: 'Auto Burn Now',
  },

  /** Dynamic status messages */
  STATUS_MESSAGES: {
    AUTO_ENABLED_WITH_COUNT: 'Will burn {count} cards when session starts',
    AUTO_ENABLED_NO_COUNT: 'No cards will be burned automatically',
    AUTO_DISABLED: 'Manual burn only',
  },

  /** Info panel configuration */
  INFO_PANEL: {
    TITLE: '💡 Burn Card Information',
    SECTION: 'sessionControl',
    SUBSECTION: 'burnInfo',
    CONTENT: {
      AUTO_BURN_FEATURES: {
        TITLE: 'Auto Burn Features:',
        POINTS: [
          '• Auto burn simulates casino burn procedures at session start',
          '• Manual burn can be used anytime during play',
          '• Set to 0 for no automatic burning',
        ],
      },
      PROFESSIONAL_TRACKING: {
        TITLE: 'Professional Tracking:',
        POINTS: [
          '• Burned cards are tracked professionally without revealing content',
          '• Algorithm analyzes patterns to estimate burned card compositions',
          '• Professional burn estimation improves edge calculations over time',
        ],
      },
    },
  },

  /** CSS classes */
  STYLING: {
    SECTION_CONTAINER: 'mt-6 p-4 bg-white bg-opacity-60 border border-orange-100 rounded-lg',
    HEADER: 'flex items-center justify-between mb-3',
    TITLE: 'text-sm font-semibold text-orange-800',
    SUBTITLE: 'text-xs text-orange-600',
    AUTO_BURN_CONTAINER: 'flex items-center justify-between mb-3',
    AUTO_BURN_CONTROLS: 'flex items-center space-x-3',
    CHECKBOX_LABEL: 'flex items-center space-x-2 cursor-pointer',
    CHECKBOX:
      'w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2',
    CHECKBOX_TEXT: 'text-sm font-medium text-gray-700',
    INPUT_CONTROLS: 'flex items-center space-x-2',
    COUNT_INPUT:
      'w-16 px-2 py-1 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400',
    UNIT_LABEL: 'text-xs text-gray-600',
    STATUS_TEXT: 'text-xs text-gray-500 max-w-xs',
    MANUAL_SECTION: 'flex items-center justify-between pt-2 border-t border-orange-100',
    MANUAL_CONTROLS: 'flex items-center space-x-3',
    MANUAL_LABEL: 'text-sm text-gray-700',
    MANUAL_INPUT: 'w-16 px-2 py-1 text-sm border border-gray-300 rounded-md',
    BURN_BUTTON_ENABLED:
      'px-3 py-1 rounded-md text-sm font-medium transition-colors bg-orange-600 text-white hover:bg-orange-700',
    BURN_BUTTON_DISABLED:
      'px-3 py-1 rounded-md text-sm font-medium transition-colors bg-gray-400 text-gray-200 cursor-not-allowed',
    CARDS_REMAINING: 'text-xs text-gray-500',
    INFO_CONTAINER: 'bg-orange-50 p-3 rounded-lg mt-4 border border-orange-200',
    INFO_HEADER: 'flex items-center justify-between mb-2',
    INFO_TITLE: 'text-sm font-semibold text-orange-800',
    INFO_CONTENT: 'text-xs text-orange-700 grid grid-cols-1 md:grid-cols-2 gap-4',
    INFO_SECTION_TITLE: 'font-medium mb-1',
    /** Validation styling */
    VALIDATION_ERROR: 'text-xs text-red-600 mt-1',
    VALIDATION_WARNING: 'text-xs text-yellow-600 mt-1',
    VALIDATION_SUCCESS: 'text-xs text-green-600 mt-1',
  },
} as const;

// =============================================================================
// FORM FIELD CONFIGURATION
// =============================================================================

export const FORM_FIELDS = {
  /** Common form field patterns */
  PATTERNS: {
    NUMBER_INPUT: {
      COMMON_CLASSES:
        'text-gray-900 rounded px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2',
      DISABLED_CLASSES: 'disabled:bg-gray-100 disabled:cursor-not-allowed',
    },
    CHECKBOX: {
      COMMON_CLASSES: 'focus:ring-2',
      DISABLED_CLASSES: 'disabled:cursor-not-allowed',
    },
    SELECT: {
      COMMON_CLASSES:
        'w-full text-gray-900 rounded px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2',
      DISABLED_CLASSES: 'disabled:bg-gray-100 disabled:cursor-not-allowed',
    },
  },

  /** Validation messages */
  VALIDATION: {
    REQUIRED: 'This field is required',
    MIN_VALUE: 'Value must be at least {min}',
    MAX_VALUE: 'Value must be at most {max}',
    INVALID_NUMBER: 'Please enter a valid number',
  },
} as const;

// =============================================================================
// EVENT NAMES CONFIGURATION
// =============================================================================

export const SESSION_CONTROL_EVENTS = {
  /** Balance events */
  BALANCE: {
    UPDATE_STARTING_BALANCE: 'update:startingBalance',
    UPDATE_USE_PREVIOUS: 'update:usePreviousBalance',
    BALANCE_CHANGE: 'balance-change',
  },

  /** Deck events */
  DECK: {
    UPDATE_NUMBER_OF_DECKS: 'update:numberOfDecks',
    UPDATE_CUT_CARD_POSITION: 'update:cutCardPosition',
    INITIALIZE_SHOE: 'initialize-shoe',
    DECK_CHANGE: 'deck-change',
  },

  /** Burn events */
  BURN: {
    UPDATE_AUTO_BURN_ENABLED: 'update:autoBurnEnabled',
    UPDATE_AUTO_BURN_COUNT: 'update:autoBurnCount',
    UPDATE_MANUAL_BURN_COUNT: 'update:manualBurnCount',
    MANUAL_BURN: 'manual-burn',
    AUTO_BURN: 'auto-burn',
    BURN_CHANGE: 'burn-change',
  },
} as const;

// =============================================================================
// COMPREHENSIVE SESSION CONTROL SETTINGS
// =============================================================================

export const SESSION_CONTROL_SETTINGS = {
  main: SESSION_CONTROL,
  defaults: SESSION_CONTROL_DEFAULTS,
  validation: VALIDATION_STYLING,
  balance: BALANCE_SETTINGS,
  deck: DECK_SETTINGS,
  burn: BURN_SETTINGS,
  form: FORM_FIELDS,
  events: SESSION_CONTROL_EVENTS,
} as const;

// Type exports for TypeScript support
export type SessionControlMain = typeof SESSION_CONTROL;
export type SessionControlDefaults = typeof SESSION_CONTROL_DEFAULTS;
export type ValidationStyling = typeof VALIDATION_STYLING;
export type BalanceSettings = typeof BALANCE_SETTINGS;
export type DeckSettings = typeof DECK_SETTINGS;
export type BurnSettings = typeof BURN_SETTINGS;
export type FormFields = typeof FORM_FIELDS;
export type SessionControlEvents = typeof SESSION_CONTROL_EVENTS;
export type SessionControlSettings = typeof SESSION_CONTROL_SETTINGS;
