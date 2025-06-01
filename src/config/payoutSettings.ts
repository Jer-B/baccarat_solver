// =============================================================================
// PAYOUT SETTINGS CONFIGURATION - CDD/HEADLESS SYSTEM
// =============================================================================
// Comprehensive configuration for PayoutSettings CDD architecture
// Following professional patterns established in sessionControlSettings.ts

// =============================================================================
// CORE CONFIGURATION CONSTANTS
// =============================================================================

export const PAYOUT_SETTINGS_DEFAULTS = {
  // Default payout values (Vegas style)
  PLAYER_PAYOUT: 1.0,
  BANKER_PAYOUT: 1.0,
  BANKER_COMMISSION: 0.05, // 5%
  TIE_PAYOUT: 8.0,
  PLAYER_PAIR_PAYOUT: 11.0,
  BANKER_PAIR_PAYOUT: 11.0,

  // Validation ranges
  MIN_PAYOUT: 0.0,
  MAX_PAYOUT: 100.0,
  MIN_COMMISSION: 0.0,
  MAX_COMMISSION: 1.0, // 100%
  COMMISSION_STEP: 0.001, // 0.1%
  PAYOUT_STEP: 0.1,

  // Example bet amount for calculations
  EXAMPLE_BET_AMOUNT: 10,

  // Preset management
  MAX_CUSTOM_PRESETS: 50,
  MAX_PRESET_NAME_LENGTH: 50,
  MIN_PRESET_NAME_LENGTH: 3,
} as const;

// =============================================================================
// MAIN PAYOUT SETTINGS CONFIGURATION
// =============================================================================

export const PAYOUT_SETTINGS = {
  // Component identification
  COMPONENT_NAME: 'PayoutSettings',

  // Labels and text content
  LABELS: {
    TITLE: 'Payout Settings',
    PRESET_SECTION_TITLE: '🎰 Casino Presets',
    MANUAL_SETTINGS_TITLE: '⚙️ Manual Settings',
    PAYOUT_EXAMPLES_TITLE: '💰 Payout Examples',
    PRESET_INFO_TITLE: '📋 Preset Information',

    // Form field labels
    PLAYER_PAYOUT_LABEL: 'Player Payout',
    BANKER_PAYOUT_LABEL: 'Banker Payout',
    BANKER_COMMISSION_LABEL: 'Banker Commission',
    TIE_PAYOUT_LABEL: 'Tie Payout',
    PLAYER_PAIR_LABEL: 'Player Pair',
    BANKER_PAIR_LABEL: 'Banker Pair',

    // Button labels
    RESET_TO_DEFAULTS_BUTTON: 'Reset to Defaults',
    ADD_CUSTOM_PRESET_BUTTON: '+ Add Custom',
    SAVE_PRESET_BUTTON: 'Save Preset',
    CANCEL_BUTTON: 'Cancel',
    DELETE_PRESET_BUTTON: 'Delete',
    SET_DEFAULT_BUTTON: 'Set as Default',

    // Payout ratio suffixes
    PAYOUT_RATIO_SUFFIX: ':1',
    COMMISSION_SUFFIX: '%',

    // Example calculations
    EXAMPLE_BET_PREFIX: 'for $',
    EXAMPLE_BET_SUFFIX: ' bet',
    TOTAL_RETURN_LABEL: 'total return',
    PROFIT_LABEL: 'profit',

    // Preset type indicators
    DEFAULT_INDICATOR: '(Default)',
    SYSTEM_PRESET_INDICATOR: '(System)',
  },

  // Main styling configuration
  STYLING: {
    // Main container
    MAIN_CONTAINER: 'card bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200',

    // Header styling
    HEADER_CONTAINER: 'flex items-center justify-between mb-4',
    TITLE: 'text-xl font-semibold text-yellow-800',

    // Button container
    BUTTON_CONTAINER: 'flex items-center space-x-2',

    // Preset management section
    PRESET_SECTION: 'mb-6 p-4 bg-white rounded-lg border border-yellow-200',
    PRESET_SECTION_HEADER: 'flex items-center justify-between mb-3',
    PRESET_SECTION_TITLE: 'text-lg font-semibold text-yellow-800',

    // Preset selector
    PRESET_SELECTOR_CONTAINER: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4',
    PRESET_BUTTON_BASE: 'px-4 py-3 rounded-lg border text-left transition-all duration-200',
    PRESET_BUTTON_DEFAULT: 'bg-green-50 border-green-300 text-green-800 ring-2 ring-green-200',
    PRESET_BUTTON_SYSTEM: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
    PRESET_BUTTON_CUSTOM: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
    PRESET_BUTTON_SELECTED: 'ring-2 ring-yellow-400',

    // Preset button content
    PRESET_NAME: 'font-medium text-sm',
    PRESET_DETAILS: 'text-xs opacity-75 mt-1',
    PRESET_INDICATORS: 'flex items-center space-x-2 mt-2',
    PRESET_BADGE_DEFAULT: 'px-2 py-1 bg-green-200 text-green-800 rounded text-xs',
    PRESET_BADGE_SYSTEM: 'px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs',

    // Manual settings grid
    MANUAL_SETTINGS_SECTION: 'mb-6',
    MANUAL_SETTINGS_GRID: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4',

    // Form field styling
    FORM_FIELD_CONTAINER: 'space-y-1',
    FORM_FIELD_LABEL: 'block text-sm font-medium text-gray-700',
    FORM_FIELD_INPUT_CONTAINER: 'flex items-center space-x-1',
    FORM_FIELD_INPUT:
      'w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500',
    FORM_FIELD_SUFFIX: 'text-sm text-gray-600',

    // Action buttons
    BUTTON_BASE: 'px-3 py-1 rounded-md text-sm font-medium transition-colors',
    RESET_BUTTON: 'bg-gray-500 text-white hover:bg-gray-600',
    ADD_PRESET_BUTTON: 'bg-purple-500 text-white hover:bg-purple-600',
    SAVE_BUTTON: 'bg-green-500 text-white hover:bg-green-600',
    CANCEL_BUTTON: 'bg-gray-500 text-white hover:bg-gray-600',
    DELETE_BUTTON: 'bg-red-500 text-white hover:bg-red-600',
    SET_DEFAULT_BUTTON: 'bg-blue-500 text-white hover:bg-blue-600',

    // Info panels
    INFO_PANEL_BASE: 'mt-4 p-3 rounded-lg border',
    PAYOUT_EXAMPLES_PANEL: 'bg-white border-gray-200',
    PRESET_INFO_PANEL: 'bg-blue-50 border-blue-200',

    INFO_PANEL_HEADER: 'flex items-center justify-between mb-2',
    INFO_PANEL_TITLE: 'text-sm font-semibold',
    INFO_PANEL_CONTENT_GRID: 'grid grid-cols-2 md:grid-cols-3 gap-4 text-xs',

    // Example calculations
    EXAMPLE_ITEM: 'space-y-1',
    EXAMPLE_LABEL: 'font-medium',
    EXAMPLE_RETURN: 'text-gray-900',
    EXAMPLE_PROFIT: 'text-gray-600',

    // Colors for different bet types
    PLAYER_COLOR: 'text-blue-600',
    BANKER_COLOR: 'text-red-600',
    TIE_COLOR: 'text-green-600',
    PLAYER_PAIR_COLOR: 'text-purple-600',
    BANKER_PAIR_COLOR: 'text-orange-600',
  },

  // Icons configuration
  ICONS: {
    ADD_PRESET: {
      VIEWBOX: '0 0 20 20',
      PATHS: [
        'M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z',
      ],
    },
    DELETE_PRESET: {
      VIEWBOX: '0 0 20 20',
      PATHS: [
        'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z',
        'M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM6 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z',
      ],
    },
    SET_DEFAULT: {
      VIEWBOX: '0 0 20 20',
      PATHS: [
        'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z',
      ],
    },
  },

  // Form validation
  VALIDATION: {
    REQUIRED_FIELDS: [
      'player_payout',
      'banker_payout',
      'banker_commission',
      'tie_payout',
      'player_pair_payout',
      'banker_pair_payout',
    ],
    NUMERIC_FIELDS: [
      'player_payout',
      'banker_payout',
      'banker_commission',
      'tie_payout',
      'player_pair_payout',
      'banker_pair_payout',
    ],
    PRESET_NAME_PATTERN: /^[a-zA-Z0-9\s\-_()&]+$/,
  },

  // Animation and transitions
  ANIMATIONS: {
    PRESET_TRANSITION: 'transition-all duration-200',
    BUTTON_TRANSITION: 'transition-colors duration-150',
    PANEL_TRANSITION: 'transition-opacity duration-200',
  },
} as const;

// =============================================================================
// PAYOUT EXAMPLES CONFIGURATION
// =============================================================================

export const PAYOUT_EXAMPLES = {
  BET_TYPES: [
    {
      key: 'player',
      label: 'Player Win',
      colorClass: PAYOUT_SETTINGS.STYLING.PLAYER_COLOR,
      payoutField: 'player_payout' as const,
      hasCommission: false,
    },
    {
      key: 'banker',
      label: 'Banker Win',
      colorClass: PAYOUT_SETTINGS.STYLING.BANKER_COLOR,
      payoutField: 'banker_payout' as const,
      hasCommission: true,
    },
    {
      key: 'tie',
      label: 'Tie Win',
      colorClass: PAYOUT_SETTINGS.STYLING.TIE_COLOR,
      payoutField: 'tie_payout' as const,
      hasCommission: false,
    },
    {
      key: 'playerPair',
      label: 'Player Pair',
      colorClass: PAYOUT_SETTINGS.STYLING.PLAYER_PAIR_COLOR,
      payoutField: 'player_pair_payout' as const,
      hasCommission: false,
    },
    {
      key: 'bankerPair',
      label: 'Banker Pair',
      colorClass: PAYOUT_SETTINGS.STYLING.BANKER_PAIR_COLOR,
      payoutField: 'banker_pair_payout' as const,
      hasCommission: false,
    },
  ],
} as const;

// =============================================================================
// FORM FIELD CONFIGURATIONS
// =============================================================================

export const PAYOUT_FORM_FIELDS = {
  player_payout: {
    key: 'player_payout',
    label: PAYOUT_SETTINGS.LABELS.PLAYER_PAYOUT_LABEL,
    suffix: PAYOUT_SETTINGS.LABELS.PAYOUT_RATIO_SUFFIX,
    type: 'number',
    min: PAYOUT_SETTINGS_DEFAULTS.MIN_PAYOUT,
    max: PAYOUT_SETTINGS_DEFAULTS.MAX_PAYOUT,
    step: PAYOUT_SETTINGS_DEFAULTS.PAYOUT_STEP,
    default: PAYOUT_SETTINGS_DEFAULTS.PLAYER_PAYOUT,
  },
  banker_payout: {
    key: 'banker_payout',
    label: PAYOUT_SETTINGS.LABELS.BANKER_PAYOUT_LABEL,
    suffix: PAYOUT_SETTINGS.LABELS.PAYOUT_RATIO_SUFFIX,
    type: 'number',
    min: PAYOUT_SETTINGS_DEFAULTS.MIN_PAYOUT,
    max: PAYOUT_SETTINGS_DEFAULTS.MAX_PAYOUT,
    step: PAYOUT_SETTINGS_DEFAULTS.PAYOUT_STEP,
    default: PAYOUT_SETTINGS_DEFAULTS.BANKER_PAYOUT,
  },
  banker_commission: {
    key: 'banker_commission',
    label: PAYOUT_SETTINGS.LABELS.BANKER_COMMISSION_LABEL,
    suffix: PAYOUT_SETTINGS.LABELS.COMMISSION_SUFFIX,
    type: 'number',
    min: PAYOUT_SETTINGS_DEFAULTS.MIN_COMMISSION,
    max: PAYOUT_SETTINGS_DEFAULTS.MAX_COMMISSION,
    step: PAYOUT_SETTINGS_DEFAULTS.COMMISSION_STEP,
    default: PAYOUT_SETTINGS_DEFAULTS.BANKER_COMMISSION,
    isPercentage: true,
  },
  tie_payout: {
    key: 'tie_payout',
    label: PAYOUT_SETTINGS.LABELS.TIE_PAYOUT_LABEL,
    suffix: PAYOUT_SETTINGS.LABELS.PAYOUT_RATIO_SUFFIX,
    type: 'number',
    min: PAYOUT_SETTINGS_DEFAULTS.MIN_PAYOUT,
    max: PAYOUT_SETTINGS_DEFAULTS.MAX_PAYOUT,
    step: PAYOUT_SETTINGS_DEFAULTS.PAYOUT_STEP,
    default: PAYOUT_SETTINGS_DEFAULTS.TIE_PAYOUT,
  },
  player_pair_payout: {
    key: 'player_pair_payout',
    label: PAYOUT_SETTINGS.LABELS.PLAYER_PAIR_LABEL,
    suffix: PAYOUT_SETTINGS.LABELS.PAYOUT_RATIO_SUFFIX,
    type: 'number',
    min: PAYOUT_SETTINGS_DEFAULTS.MIN_PAYOUT,
    max: PAYOUT_SETTINGS_DEFAULTS.MAX_PAYOUT,
    step: PAYOUT_SETTINGS_DEFAULTS.PAYOUT_STEP,
    default: PAYOUT_SETTINGS_DEFAULTS.PLAYER_PAIR_PAYOUT,
  },
  banker_pair_payout: {
    key: 'banker_pair_payout',
    label: PAYOUT_SETTINGS.LABELS.BANKER_PAIR_LABEL,
    suffix: PAYOUT_SETTINGS.LABELS.PAYOUT_RATIO_SUFFIX,
    type: 'number',
    min: PAYOUT_SETTINGS_DEFAULTS.MIN_PAYOUT,
    max: PAYOUT_SETTINGS_DEFAULTS.MAX_PAYOUT,
    step: PAYOUT_SETTINGS_DEFAULTS.PAYOUT_STEP,
    default: PAYOUT_SETTINGS_DEFAULTS.BANKER_PAIR_PAYOUT,
  },
} as const;

// =============================================================================
// EVENT TYPE DEFINITIONS
// =============================================================================

export const PAYOUT_SETTINGS_EVENTS = {
  // Payout value changes
  PAYOUT_CHANGE: 'payout-change',
  PRESET_SELECTED: 'preset-selected',
  PRESET_CREATED: 'preset-created',
  PRESET_UPDATED: 'preset-updated',
  PRESET_DELETED: 'preset-deleted',
  DEFAULT_PRESET_CHANGED: 'default-preset-changed',

  // User actions
  RESET_TO_DEFAULTS: 'reset-to-defaults',
  MANUAL_VALUE_CHANGE: 'manual-value-change',

  // Validation events
  VALIDATION_ERROR: 'validation-error',
  VALIDATION_SUCCESS: 'validation-success',
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type PayoutSettingsEvent = keyof typeof PAYOUT_SETTINGS_EVENTS;

export interface PayoutValues {
  player_payout: number;
  banker_payout: number;
  banker_commission: number;
  tie_payout: number;
  player_pair_payout: number;
  banker_pair_payout: number;
}

export interface PayoutChangeEvent {
  values: PayoutValues;
  source: 'preset' | 'manual' | 'reset';
  presetId?: string;
  presetName?: string;
}

export interface ValidationError {
  field: keyof PayoutValues;
  message: string;
  value: number;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const PAYOUT_UTILS = {
  /**
   * Calculate total payout for a bet
   */
  calculateTotalPayout: (betAmount: number, payoutRatio: number, commission = 0): number => {
    const winnings = betAmount * payoutRatio;
    const commissionAmount = commission > 0 ? winnings * commission : 0;
    return betAmount + winnings - commissionAmount;
  },

  /**
   * Calculate profit from a bet
   */
  calculateProfit: (betAmount: number, payoutRatio: number, commission = 0): number => {
    const totalPayout = PAYOUT_UTILS.calculateTotalPayout(betAmount, payoutRatio, commission);
    return totalPayout - betAmount;
  },

  /**
   * Format currency amount
   */
  formatCurrency: (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  },

  /**
   * Format percentage
   */
  formatPercentage: (decimal: number): string => {
    return `${(decimal * 100).toFixed(1)}%`;
  },

  /**
   * Validate payout values
   */
  validatePayoutValues: (values: Partial<PayoutValues>): ValidationError[] => {
    const errors: ValidationError[] = [];

    Object.entries(values).forEach(([field, value]) => {
      if (typeof value !== 'number' || isNaN(value) || value < 0) {
        errors.push({
          field: field as keyof PayoutValues,
          message: 'Must be a positive number',
          value: value as number,
        });
      }

      if (field === 'banker_commission' && value > 1) {
        errors.push({
          field: 'banker_commission',
          message: 'Commission cannot exceed 100%',
          value: value as number,
        });
      }
    });

    return errors;
  },

  /**
   * Create default payout values
   */
  createDefaultPayoutValues: (): PayoutValues => ({
    player_payout: PAYOUT_SETTINGS_DEFAULTS.PLAYER_PAYOUT,
    banker_payout: PAYOUT_SETTINGS_DEFAULTS.BANKER_PAYOUT,
    banker_commission: PAYOUT_SETTINGS_DEFAULTS.BANKER_COMMISSION,
    tie_payout: PAYOUT_SETTINGS_DEFAULTS.TIE_PAYOUT,
    player_pair_payout: PAYOUT_SETTINGS_DEFAULTS.PLAYER_PAIR_PAYOUT,
    banker_pair_payout: PAYOUT_SETTINGS_DEFAULTS.BANKER_PAIR_PAYOUT,
  }),
} as const;
