// =============================================================================
// SCOREBOARD SETTINGS CONFIGURATION - CDD/HEADLESS SYSTEM
// =============================================================================
// Comprehensive configuration for Scoreboard CDD architecture
// Following professional patterns established in sessionControlSettings.ts
//
// 🎯 GOAL: Extract ALL hardcoded values while preserving EXACT SAME LOGIC & UI

// =============================================================================
// CORE CONFIGURATION CONSTANTS
// =============================================================================

export const SCOREBOARD_DEFAULTS = {
  // Grid dimensions (EXACT CURRENT VALUES)
  GRID_DIMENSIONS: {
    BIG_ROAD: {
      ROWS: 6,
      COLS: 20,
    },
    BEAD_PLATE: {
      ROWS: 6,
      COLS: 22,
    },
    PATTERN_ANALYSIS: {
      ROWS: 6,
      COLS: 20,
    },
  },

  // Cell dimensions (EXACT CURRENT SIZING)
  CELL_DIMENSIONS: {
    BIG_ROAD: {
      WIDTH: 'w-8',
      HEIGHT: 'h-8',
      MIN_WIDTH: '32px',
    },
    BEAD_PLATE: {
      WIDTH: 'w-6',
      HEIGHT: 'h-6',
      MIN_WIDTH: '24px',
    },
    PATTERN: {
      WIDTH: 'w-8',
      HEIGHT: 'h-8',
      MIN_WIDTH: '32px',
    },
  },

  // Pattern analysis starting points (EXACT CURRENT LOGIC)
  PATTERN_START_HANDS: {
    BIG_EYE_BOY: 2, // Starts from hand 2
    SMALL_ROAD: 3, // Starts from hand 3
    COCKROACH_PIG: 4, // Starts from hand 4
  },

  // Default active view
  DEFAULT_VIEW: 'bigroad' as const,

  // Betting information display
  BET_INFO: {
    FONT_SIZE_BIG_ROAD: '8px',
    FONT_SIZE_BEAD_PLATE: '7px',
    CROSS_SIZE_BIG_ROAD: { width: '16px', height: '16px' },
    CROSS_SIZE_BEAD_PLATE: { width: '12px', height: '12px' },
  },

  // Bead circle dimensions
  BEAD_CIRCLE: {
    SIZE: 'w-5 h-5', // 20px
    PAIR_DOT_SIZE: 'w-3 h-3', // 12px
    PAIR_FONT_SIZE: '8px',
  },

  // Pattern dot dimensions
  PATTERN_DOT: {
    SIZE: 'w-4 h-4', // 16px
  },
} as const;

// =============================================================================
// MAIN SCOREBOARD CONFIGURATION
// =============================================================================

export const SCOREBOARD_SETTINGS = {
  // Component identification
  COMPONENT_NAME: 'BaccaratScoreboard',
  VERSION: '1.0.0',

  // Labels and text content (EXACT CURRENT TEXT)
  LABELS: {
    MAIN_TITLE: 'Scoreboard',

    // View button labels (EXACT CURRENT TEXT)
    BIG_ROAD_LABEL: 'Big Road',
    BEAD_PLATE_LABEL: 'Bead Plate',
    BIG_EYE_BOY_LABEL: 'Big Eye Boy',
    SMALL_ROAD_LABEL: 'Small Road',
    COCKROACH_PIG_LABEL: 'Cockroach Pig',
    CLEAR_BUTTON_LABEL: 'Clear',

    // Statistics labels (EXACT CURRENT TEXT)
    PLAYER_STAT_LABEL: 'Player',
    BANKER_STAT_LABEL: 'Banker',
    TIE_STAT_LABEL: 'Tie',
    TOTAL_STAT_LABEL: 'Total',

    // Result symbols (EXACT CURRENT LOGIC)
    PLAYER_SYMBOL: 'P',
    BANKER_SYMBOL: 'B',
    TIE_SYMBOL: 'T',

    // Pair indicators (EXACT CURRENT LOGIC)
    PLAYER_PAIR_SYMBOL: 'P',
    BANKER_PAIR_SYMBOL: 'B',
    PAIR_DOT_SYMBOL: '•',

    // Streak display (EXACT CURRENT LOGIC)
    CURRENT_STREAK_LABEL: 'Current Streak:',
    HAND_NUMBER_LABEL: 'Hand #',
    STREAK_MULTIPLIER: '×',

    // Pattern descriptions (SIMPLE 5-YEAR-OLD EXPLANATIONS)
    PATTERN_DESCRIPTIONS: {
      BIGROAD:
        '🏗️ BIG ROAD: Shows game results in columns. Same results stack down, different results start new columns. Click any cell to see hand details and betting info (if you placed a bet). Pairs shown as dots: Blue dot (•) = Player Pair, Red dot (•) = Banker Pair.',
      BEADPLATE:
        '📿 BEAD PLATE: Shows all results in order like beads on a string. Read left to right, top to bottom. Click any cell for hand details. Player = Blue, Banker = Red, Tie = Green. Pair indicators: P in black circle = Player Pair, B in black circle = Banker Pair.',
      BIGEYEBOY:
        '👁️‍🗨️ BIG EYE BOY: Looks at the last 2 columns and asks "Do they grow the same way?" 🔵 Blue = "Yes, they\'re similar!" (regular), 🔴 Red = "No, they\'re different!" (irregular). Simple rule: Blue = Same, Red = Different! This helps you see if the game has repeating patterns.',
      SMALLROAD:
        '🛤️ SMALL ROAD: Looks at the last 3 columns and asks "Do they grow the same way?" 🔵 Blue = "Yes, they\'re similar!" (same pattern), 🔴 Red = "No, they\'re different!" (different pattern). Simple rule: Blue = Same, Red = Different! This shows deeper patterns than Big Eye Boy.',
      COCKROACHPIG:
        '🐷 COCKROACH PIG: Looks at the last 4 columns and asks "Do they grow the same way?" 🔵 Blue = "Yes, they\'re similar!" (same pattern), 🔴 Red = "No, they\'re different!" (different pattern). Simple rule: Blue = Same, Red = Different! This shows the deepest patterns. Named because it\'s as ugly as a cockroach but as useful as a pig!',
    },

    // Pattern description background colors (matching old implementation)
    PATTERN_DESCRIPTION_COLORS: {
      BIGROAD: 'bg-blue-50',
      BEADPLATE: 'bg-blue-50',
      BIGEYEBOY: 'bg-green-50',
      SMALLROAD: 'bg-purple-50',
      COCKROACHPIG: 'bg-orange-50',
    },

    // Tooltip content (EXACT CURRENT LOGIC)
    TOOLTIP_LABELS: {
      HAND_PREFIX: 'Hand #',
      PLAYER_CARDS_LABEL: 'Player:',
      BANKER_CARDS_LABEL: 'Banker:',
      TOTAL_LABEL: 'Total:',
      PLAYER_PAIR_INDICATOR: '+ Player Pair',
      BANKER_PAIR_INDICATOR: '+ Banker Pair',
      BET_LABEL: 'Bet:',
      RESULT_LABEL: 'Result:',
      PAYOUT_LABEL: 'Payout:',
      NET_LABEL: 'Net:',
      WON_TEXT: 'WON',
      LOST_TEXT: 'LOST',
      POSITIVE_PREFIX: '+',
    },
  },

  // Professional color scheme (EXACT CURRENT COLORS)
  COLORS: {
    // Main container
    MAIN_BACKGROUND: 'bg-white',
    MAIN_BORDER: 'rounded-lg shadow-lg',
    MAIN_PADDING: 'p-6',

    // View buttons (EXACT CURRENT COLORS)
    BUTTON_BASE: 'px-3 py-1 text-sm rounded',
    BIG_ROAD_ACTIVE: 'bg-blue-500 text-white',
    BEAD_PLATE_ACTIVE: 'bg-blue-500 text-white',
    BIG_EYE_BOY_ACTIVE: 'bg-green-500 text-white',
    SMALL_ROAD_ACTIVE: 'bg-purple-500 text-white',
    COCKROACH_PIG_ACTIVE: 'bg-orange-500 text-white',
    BUTTON_INACTIVE: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    CLEAR_BUTTON: 'bg-red-500 text-white hover:bg-red-600',

    // Statistics cards (EXACT CURRENT COLORS)
    PLAYER_STAT_BG: 'bg-blue-50',
    PLAYER_STAT_TEXT: 'text-blue-600',
    BANKER_STAT_BG: 'bg-red-50',
    BANKER_STAT_TEXT: 'text-red-600',
    TIE_STAT_BG: 'bg-green-50',
    TIE_STAT_TEXT: 'text-green-600',
    TOTAL_STAT_BG: 'bg-gray-50',
    TOTAL_STAT_TEXT: 'text-gray-600',
    STAT_VALUE: 'text-2xl font-bold',
    STAT_LABEL: 'text-xs text-gray-600',

    // Big Road cells (EXACT CURRENT COLORS)
    BIG_ROAD_CELL_BASE:
      'border border-gray-300 flex items-center justify-center text-xs font-bold relative',
    BIG_ROAD_EMPTY: 'bg-white',
    BIG_ROAD_PLAYER: 'bg-blue-100 text-blue-800 border-blue-300',
    BIG_ROAD_BANKER: 'bg-red-100 text-red-800 border-red-300',
    BIG_ROAD_TIE: 'bg-green-100 text-green-800 border-green-300',

    // Bead Plate colors (EXACT CURRENT COLORS)
    BEAD_PLAYER: 'bg-blue-500',
    BEAD_BANKER: 'bg-red-500',
    BEAD_TIE: 'bg-green-500',
    BEAD_CIRCLE_BASE: 'rounded-full flex items-center justify-center text-xs font-bold text-white',

    // Pattern analysis colors (EXACT CURRENT COLORS)
    PATTERN_CELL_BASE: 'border border-gray-300 flex items-center justify-center relative',
    PATTERN_EMPTY: 'bg-white',
    PATTERN_RED: 'bg-red-500',
    PATTERN_BLUE: 'bg-blue-500',
    PATTERN_DOT_BASE: 'rounded-full',

    // Pair indicators (EXACT CURRENT COLORS)
    PLAYER_PAIR_COLOR: 'text-blue-600',
    BANKER_PAIR_COLOR: 'text-red-600',
    PAIR_INDICATORS_POSITION: 'absolute top-0 right-0 flex flex-col',
    PAIR_DOT_BASE: 'text-xs leading-none',

    // Betting information (EXACT CURRENT COLORS)
    BET_INFO_OVERLAY:
      'absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none',
    BET_AMOUNT_BG: 'text-xs font-bold text-white bg-black bg-opacity-70 px-1 rounded',
    BET_AMOUNT_BEAD_BG: 'text-xs font-bold text-white bg-black bg-opacity-80 px-1 rounded',
    LOSS_CROSS_BG: 'absolute top-0 right-0 bg-white rounded-full p-0.5',
    LOSS_CROSS_COLOR: 'text-red-600',

    // Bead plate specific (EXACT CURRENT COLORS)
    BEAD_CONTENT: 'relative w-full h-full flex items-center justify-center',
    BEAD_PAIRS_POSITION: 'absolute -top-1 -right-1 flex flex-col text-xs',
    BEAD_PAIR_DOT:
      'text-white bg-black rounded-full flex items-center justify-center text-xs leading-none',

    // Container backgrounds (EXACT CURRENT COLORS)
    SCOREBOARD_CONTAINER: 'border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-x-auto',
    PATTERN_DESCRIPTION_BG: 'mb-3 p-2 rounded text-sm',
    BIG_ROAD_DESCRIPTION: 'bg-blue-50',
    BEAD_PLATE_DESCRIPTION: 'bg-blue-50',
    BIG_EYE_BOY_DESCRIPTION: 'bg-green-50',
    SMALL_ROAD_DESCRIPTION: 'bg-purple-50',
    COCKROACH_PIG_DESCRIPTION: 'bg-orange-50',

    // Streak display (EXACT CURRENT COLORS)
    STREAK_CONTAINER: 'mt-4 p-3 bg-gray-50 rounded',
    STREAK_LAYOUT: 'flex justify-between items-center text-sm',
    STREAK_PLAYER: 'bg-blue-500',
    STREAK_BANKER: 'bg-red-500',
    STREAK_TIE: 'bg-green-500',
    STREAK_BADGE: 'ml-2 px-2 py-1 rounded text-white',
    STREAK_FONT_WEIGHT: 'font-medium',
  },

  // Grid layouts (EXACT CURRENT STRUCTURE)
  LAYOUTS: {
    STATISTICS_GRID: 'grid grid-cols-4 gap-4 mb-4 text-center',
    STATISTICS_CARD: 'p-2 rounded',

    BIG_ROAD_GRID: 'grid gap-1',
    BIG_ROAD_ROW: 'flex gap-1',

    BEAD_PLATE_GRID: 'grid gap-1',
    BEAD_PLATE_ROW: 'flex gap-1',

    PATTERN_GRID: 'grid gap-1',
    PATTERN_ROW: 'flex gap-1',

    BUTTON_CONTAINER: 'flex gap-2 flex-wrap',
    HEADER_LAYOUT: 'flex items-center justify-between mb-4',
    TITLE_STYLE: 'text-lg font-semibold text-gray-900',
  },

  // CSS Grid template rows (EXACT CURRENT VALUES)
  GRID_TEMPLATES: {
    BIG_ROAD: 'repeat(6, 1fr)',
    BEAD_PLATE: 'repeat(6, 1fr)',
    PATTERN: 'repeat(6, 1fr)',
  },
} as const;

// =============================================================================
// PATTERN ANALYSIS CONFIGURATION
// =============================================================================

export const PATTERN_ANALYSIS_CONFIG = {
  // Algorithm parameters (EXACT CURRENT LOGIC)
  ALGORITHMS: {
    BIG_EYE_BOY: {
      NAME: 'Big Eye Boy',
      COMPARISON_OFFSET: 1,
      MIN_HANDS_REQUIRED: 2,
      REGULAR_RESULT: 'blue',
      IRREGULAR_RESULT: 'red',
    },
    SMALL_ROAD: {
      NAME: 'Small Road',
      COMPARISON_OFFSET: 2,
      MIN_HANDS_REQUIRED: 3,
      SAME_RESULT: 'blue',
      DIFFERENT_RESULT: 'red',
    },
    COCKROACH_PIG: {
      NAME: 'Cockroach Pig',
      COMPARISON_OFFSET: 3,
      MIN_HANDS_REQUIRED: 4,
      SAME_RESULT: 'blue',
      DIFFERENT_RESULT: 'red',
    },
  },

  // Pattern result types
  PATTERN_RESULTS: {
    RED: 'red' as const,
    BLUE: 'blue' as const,
    NULL: null,
  },

  // Tooltip patterns (EXACT CURRENT LOGIC)
  TOOLTIP_PATTERNS: {
    RED_COLOR_TEXT: 'Red',
    BLUE_COLOR_TEXT: 'Blue',
    HAND_SEPARATOR: ' - Hand #',
    COLON_SEPARATOR: ': ',
  },
} as const;

// =============================================================================
// TOOLTIP CONFIGURATION
// =============================================================================

export const TOOLTIP_SETTINGS = {
  // Formatting patterns (EXACT CURRENT LOGIC)
  FORMATTING: {
    NEWLINE: '\n',
    CARD_SEPARATOR: ', ',
    SUIT_CHAR_INDEX: 0,
    CURRENCY_SYMBOL: '$',
    DECIMAL_PLACES: 2,
    POSITIVE_SIGN: '+',
    NEGATIVE_SIGN: '',
  },

  // Card display formatting (EXACT CURRENT LOGIC)
  CARD_DISPLAY: {
    RANK_SUIT_SEPARATOR: '',
    SUIT_UPPERCASE: true,
    TOTAL_MODULO: 10,
  },

  // Betting info formatting (EXACT CURRENT LOGIC)
  BET_INFO_FORMAT: {
    BET_TYPE_UPPERCASE: true,
    CURRENCY_DECIMAL_PLACES: 2,
    NET_SHOW_SIGN: true,
  },
} as const;

// =============================================================================
// VIEW TYPES AND CONFIGURATIONS
// =============================================================================

export const VIEW_TYPES = {
  BIG_ROAD: 'bigroad' as const,
  BEAD_PLATE: 'beadplate' as const,
  BIG_EYE_BOY: 'bigeyeboy' as const,
  SMALL_ROAD: 'smallroad' as const,
  COCKROACH_PIG: 'cockroachpig' as const,
} as const;

export const VIEW_CONFIGURATIONS = {
  bigroad: {
    name: 'Big Road',
    gridType: 'BIG_ROAD',
    showPairs: true,
    showBetting: true,
    columnBased: true,
    skipTies: true,
  },
  beadplate: {
    name: 'Bead Plate',
    gridType: 'BEAD_PLATE',
    showPairs: true,
    showBetting: true,
    columnBased: false,
    skipTies: false,
  },
  bigeyeboy: {
    name: 'Big Eye Boy',
    gridType: 'PATTERN',
    showPairs: false,
    showBetting: false,
    columnBased: true,
    skipTies: true,
    patternType: 'BIG_EYE_BOY',
  },
  smallroad: {
    name: 'Small Road',
    gridType: 'PATTERN',
    showPairs: false,
    showBetting: false,
    columnBased: true,
    skipTies: true,
    patternType: 'SMALL_ROAD',
  },
  cockroachpig: {
    name: 'Cockroach Pig',
    gridType: 'PATTERN',
    showPairs: false,
    showBetting: false,
    columnBased: true,
    skipTies: true,
    patternType: 'COCKROACH_PIG',
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const SCOREBOARD_UTILS = {
  // Result symbol mapping (EXACT CURRENT LOGIC)
  getResultSymbol: (result: string): string => {
    switch (result) {
      case 'player':
        return SCOREBOARD_SETTINGS.LABELS.PLAYER_SYMBOL;
      case 'banker':
        return SCOREBOARD_SETTINGS.LABELS.BANKER_SYMBOL;
      case 'tie':
        return SCOREBOARD_SETTINGS.LABELS.TIE_SYMBOL;
      default:
        return '';
    }
  },

  // Grid dimensions helper
  getGridDimensions: (gridType: keyof typeof SCOREBOARD_DEFAULTS.GRID_DIMENSIONS) => {
    return SCOREBOARD_DEFAULTS.GRID_DIMENSIONS[gridType];
  },

  // Cell dimensions helper
  getCellDimensions: (cellType: keyof typeof SCOREBOARD_DEFAULTS.CELL_DIMENSIONS) => {
    return SCOREBOARD_DEFAULTS.CELL_DIMENSIONS[cellType];
  },

  // Pattern analysis helper
  getPatternConfig: (patternType: keyof typeof PATTERN_ANALYSIS_CONFIG.ALGORITHMS) => {
    return PATTERN_ANALYSIS_CONFIG.ALGORITHMS[patternType];
  },

  // View configuration helper
  getViewConfig: (viewType: keyof typeof VIEW_CONFIGURATIONS) => {
    return VIEW_CONFIGURATIONS[viewType];
  },

  // Color class helper
  getResultColorClass: (result: string, gridType: 'BIG_ROAD' | 'BEAD' | 'PATTERN') => {
    const colors = SCOREBOARD_SETTINGS.COLORS;

    if (gridType === 'BIG_ROAD') {
      switch (result) {
        case 'player':
          return colors.BIG_ROAD_PLAYER;
        case 'banker':
          return colors.BIG_ROAD_BANKER;
        case 'tie':
          return colors.BIG_ROAD_TIE;
        default:
          return colors.BIG_ROAD_EMPTY;
      }
    } else if (gridType === 'BEAD') {
      switch (result) {
        case 'player':
          return colors.BEAD_PLAYER;
        case 'banker':
          return colors.BEAD_BANKER;
        case 'tie':
          return colors.BEAD_TIE;
        default:
          return '';
      }
    } else if (gridType === 'PATTERN') {
      switch (result) {
        case 'red':
          return colors.PATTERN_RED;
        case 'blue':
          return colors.PATTERN_BLUE;
        default:
          return colors.PATTERN_EMPTY;
      }
    }

    return '';
  },

  // Streak color helper (EXACT CURRENT LOGIC)
  getStreakColorClass: (streakType: string) => {
    const colors = SCOREBOARD_SETTINGS.COLORS;
    switch (streakType) {
      case 'player':
        return colors.STREAK_PLAYER;
      case 'banker':
        return colors.STREAK_BANKER;
      case 'tie':
        return colors.STREAK_TIE;
      default:
        return colors.STREAK_PLAYER;
    }
  },

  // Button color helper (EXACT CURRENT LOGIC)
  getButtonColorClass: (viewType: string, isActive: boolean) => {
    const colors = SCOREBOARD_SETTINGS.COLORS;

    if (!isActive) {
      return colors.BUTTON_INACTIVE;
    }

    switch (viewType) {
      case VIEW_TYPES.BIG_ROAD:
      case VIEW_TYPES.BEAD_PLATE:
        return colors.BIG_ROAD_ACTIVE;
      case VIEW_TYPES.BIG_EYE_BOY:
        return colors.BIG_EYE_BOY_ACTIVE;
      case VIEW_TYPES.SMALL_ROAD:
        return colors.SMALL_ROAD_ACTIVE;
      case VIEW_TYPES.COCKROACH_PIG:
        return colors.COCKROACH_PIG_ACTIVE;
      default:
        return colors.BUTTON_INACTIVE;
    }
  },
};

// =============================================================================
// TYPESCRIPT INTERFACES
// =============================================================================

export interface ScoreboardCell {
  result: 'player' | 'banker' | 'tie' | null;
  playerPair: boolean;
  bankerPair: boolean;
  handNumber: number;
  playerCards?: any[];
  bankerCards?: any[];
  betInfo?: {
    betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair';
    betAmount: number;
    won: boolean;
    payout: number;
    netResult: number;
  };
}

export interface PatternCell {
  result: 'red' | 'blue' | null;
  handNumber: number;
}

export type ScoreboardView = (typeof VIEW_TYPES)[keyof typeof VIEW_TYPES];

export interface ScoreboardStats {
  player: number;
  banker: number;
  tie: number;
  total: number;
}

export interface CurrentStreak {
  type: string;
  count: number;
}

// =============================================================================
// COMPREHENSIVE SCOREBOARD SETTINGS EXPORT
// =============================================================================

export const COMPREHENSIVE_SCOREBOARD_SETTINGS = {
  defaults: SCOREBOARD_DEFAULTS,
  settings: SCOREBOARD_SETTINGS,
  patterns: PATTERN_ANALYSIS_CONFIG,
  tooltips: TOOLTIP_SETTINGS,
  views: VIEW_TYPES,
  viewConfigs: VIEW_CONFIGURATIONS,
  utils: SCOREBOARD_UTILS,
} as const;

// Export everything for easy access
export default COMPREHENSIVE_SCOREBOARD_SETTINGS;
