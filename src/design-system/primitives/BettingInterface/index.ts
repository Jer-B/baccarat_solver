// =============================================================================
// HEADLESS BETTING INTERFACE PRIMITIVE - TYPESCRIPT INTERFACES
// =============================================================================

import type { PayoutValues } from '@/config/payoutSettings';
import type {
  BetType,
  CurrentBetState,
  BettingValidationResult,
  BetPlacementEvent,
  StatisticsUpdateEvent,
} from '@/config/bettingInterfaceSettings';

// =============================================================================
// PROPS INTERFACE
// =============================================================================

export interface BettingInterfaceProps {
  // Initial betting state
  initialBetAmount?: number;
  initialSelectedBet?: BetType | null;

  // Balance integration (from Session Control)
  currentBalance: number;

  // Live Payout Settings Integration - CRITICAL FOR REAL-TIME DISPLAY
  currentPayoutValues: PayoutValues;

  // Payout Settings Context - NEW: For selected mode display
  selectedPresetName?: string | null;
  useManualConfig?: boolean;

  // Session state dependencies
  sessionActive?: boolean;
  canPerformActions?: boolean;

  // Current round bet state
  currentRoundBet?: CurrentBetState;

  // Validation configuration
  enableValidation?: boolean;
  enableRiskWarnings?: boolean;

  // Professional algorithm integration
  kellyRecommendation?: {
    optimalBetSize: number;
    kellyPercentage: number;
    edge: number;
  };

  monteCarloResults?: {
    riskOfRuin: number;
    expectedValue: number;
    confidenceRange: { lower: number; upper: number };
  };

  burnAnalysisData?: {
    burnAdjustedEdge: number;
    confidence: number;
  };

  // UI configuration
  showPayoutInfo?: boolean;
  showCurrentBetStatus?: boolean;
  showStatistics?: boolean;

  // Loading states
  isPlacingBet?: boolean;
  isValidatingBet?: boolean;

  // Integration handlers - For PayoutSettings connection
  handlers?: {
    // PayoutSettings event handlers
    onPayoutChange?: (payoutValues: PayoutValues) => void;
    onPayoutPresetSelected?: (presetId: string) => void;

    // Session Control event handlers
    onBalanceUpdate?: (newBalance: number) => void;
    onSessionStateChange?: (active: boolean) => void;

    // Professional algorithm handlers
    onKellyCalculation?: (recommendation: any) => void;
    onRiskAssessment?: (assessment: any) => void;
  };
}

// =============================================================================
// EMITS INTERFACE
// =============================================================================

export interface BettingInterfaceEmits {
  // Core betting events
  'bet-amount-changed': [amount: number];
  'bet-type-selected': [betType: BetType];
  'bet-placed': [event: BetPlacementEvent];
  'bet-cleared': [];

  // Validation events
  'validation-error': [result: BettingValidationResult];
  'validation-success': [result: BettingValidationResult];

  // Integration events - PayoutSettings connection
  'payout-settings-requested': [];

  // Session integration events
  'balance-update-requested': [newBalance: number];
  'session-action-required': [action: 'start' | 'stop'];

  // Statistics events
  'statistics-updated': [event: StatisticsUpdateEvent];
  'performance-calculated': [metrics: Record<string, number>];

  // Professional algorithm events
  'kelly-calculation-requested': [betAmount: number, betType: BetType];
  'risk-assessment-requested': [betAmount: number, balance: number];
}

// =============================================================================
// STATE INTERFACE
// =============================================================================

export interface BettingInterfaceState {
  // Current betting configuration
  betAmount: number;
  selectedBet: BetType | null;

  // Real-time payout calculations (using live PayoutSettings)
  payoutCalculations: {
    // Selected mode display information
    selectedModeDisplay: {
      type: 'manual' | 'preset';
      name: string;
      isDefault?: boolean;
    };

    // Payout ratios by bet type
    player: { payout: string; commission: string };
    banker: { payout: string; commission: string };
    tie: { payout: string; commission: string };
    playerPair: { payout: string; commission: string };
    bankerPair: { payout: string; commission: string };
  };

  // Current bet state
  currentBet: CurrentBetState;

  // Validation state
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };

  // Professional algorithm integration
  algorithms: {
    kelly: {
      optimalBetSize: number;
      recommendation: string;
      riskAdjustment: number;
    };
    monteCarlo: {
      expectedReturn: number;
      riskAssessment: string;
      confidenceLevel: number;
    };
    burnAnalysis: {
      edgeAdjustment: number;
      recommendedBetType: BetType | null;
    };
  };

  // UI state
  ui: {
    isPlacingBet: boolean;
    isValidating: boolean;
    showPayoutInfo: boolean;
    showCurrentBetStatus: boolean;
  };

  // Statistics (live calculation)
  statistics: {
    totalHands: number;
    winRate: number;
    roi: number;
    currentStreak: number;
    streakType: 'win' | 'loss' | 'none';
  };
}

// =============================================================================
// SLOT PROPS INTERFACE
// =============================================================================

export interface BettingInterfaceSlotProps {
  // Current state
  state: BettingInterfaceState;

  // Actions
  actions: {
    // Betting actions
    updateBetAmount: (amount: number) => void;
    selectBetType: (betType: BetType) => void;
    placeBet: () => Promise<void>;
    clearBet: () => void;

    // Validation actions
    validateBet: () => BettingValidationResult;
    checkRiskLevel: () => 'low' | 'medium' | 'high';

    // Integration actions - PayoutSettings handlers
    requestPayoutUpdate: () => void;
    updatePayoutCalculations: (payoutValues: PayoutValues) => void;

    // Professional algorithm actions
    calculateKellyOptimal: () => void;
    assessMonteCarloRisk: () => void;
    applyBurnAnalysisAdjustment: () => void;

    // Statistics actions
    updateStatistics: () => void;
    recalculateMetrics: () => void;
  };

  // Utility functions - Integration with PayoutSettings formatPercentage
  utils: {
    // PayoutSettings integration utilities
    formatCurrency: (amount: number) => string;
    formatPercentage: (decimal: number) => string; // FROM PayoutSettings
    formatPayout: (payout: number) => string;

    // Professional calculation utilities
    calculateExpectedReturn: (betType: BetType, amount: number) => number;
    calculateCommission: (amount: number, rate: number) => number;
    assessBetRisk: (amount: number, balance: number) => string;

    // Statistics utilities
    formatStatistic: (value: number, type: 'currency' | 'percentage' | 'number') => string;
    getStreakDisplay: () => string;
    getRiskLevelColor: (level: 'low' | 'medium' | 'high') => string;
  };

  // Configuration access
  config: {
    defaults: typeof import('@/config/bettingInterfaceSettings').BETTING_INTERFACE_DEFAULTS;
    settings: typeof import('@/config/bettingInterfaceSettings').BETTING_INTERFACE_SETTINGS;
    betTypes: typeof import('@/config/bettingInterfaceSettings').BET_TYPES;
    validation: typeof import('@/config/bettingInterfaceSettings').BETTING_VALIDATION;
  };

  // Integration handlers - For PayoutSettings connection
  handlers: {
    // PayoutSettings event handlers
    onPayoutChange?: (payoutValues: PayoutValues) => void;
    onPayoutPresetSelected?: (presetId: string) => void;

    // Session Control event handlers
    onBalanceUpdate?: (newBalance: number) => void;
    onSessionStateChange?: (active: boolean) => void;

    // Professional algorithm handlers
    onKellyCalculation?: (recommendation: any) => void;
    onRiskAssessment?: (assessment: any) => void;
  };
}

// =============================================================================
// PAYOUT INTEGRATION INTERFACES
// =============================================================================

export interface PayoutIntegration {
  // Live payout values from PayoutSettings
  currentValues: PayoutValues;

  // Payout display calculations
  calculations: {
    playerReturn: (betAmount: number) => number;
    bankerReturn: (betAmount: number) => number;
    tieReturn: (betAmount: number) => number;
    playerPairReturn: (betAmount: number) => number;
    bankerPairReturn: (betAmount: number) => number;
  };

  // Commission calculations
  commissions: {
    bankerCommission: (winnings: number) => number;
    effectivePayout: (betType: BetType, betAmount: number) => number;
  };

  // Display formatting (using PayoutSettings formatPercentage)
  display: {
    formatPayoutRatio: (payout: number) => string;
    formatCommissionRate: (rate: number) => string;
    formatTotalReturn: (betAmount: number, payout: number) => string;
  };
}

// =============================================================================
// PROFESSIONAL ALGORITHM INTEGRATION
// =============================================================================

export interface AlgorithmIntegration {
  // Kelly Criterion integration
  kelly: {
    enabled: boolean;
    optimalBetSize: number;
    kellyPercentage: number;
    riskAdjustment: number;
    recommendation: string;
  };

  // Monte Carlo integration
  monteCarlo: {
    enabled: boolean;
    expectedValue: number;
    riskOfRuin: number;
    confidenceInterval: { lower: number; upper: number };
    recommendation: string;
  };

  // Burn Analysis integration
  burnAnalysis: {
    enabled: boolean;
    edgeAdjustment: number;
    confidence: number;
    recommendedBetType: BetType | null;
    reasoning: string;
  };
}

// =============================================================================
// VALIDATION INTEGRATION
// =============================================================================

export interface ValidationIntegration {
  // Real-time validation
  realTime: {
    betAmount: BettingValidationResult;
    betType: BettingValidationResult;
    balance: BettingValidationResult;
    session: BettingValidationResult;
  };

  // Professional risk assessment
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
    warnings: string[];
  };

  // Cross-validation with other systems
  crossValidation: {
    sessionControlValid: boolean;
    payoutSettingsValid: boolean;
    algorithmDataValid: boolean;
  };
}

// =============================================================================
// CONFIGURATION INTERFACES
// =============================================================================

export interface BettingInterfaceConfig {
  // Component configuration
  component: {
    name: string;
    version: string;
    headless: boolean;
  };

  // Integration configuration
  integrations: {
    payoutSettings: boolean;
    sessionControl: boolean;
    professionalAlgorithms: boolean;
    statistics: boolean;
  };

  // Performance configuration
  performance: {
    debounceValidation: number;
    refreshInterval: number;
    maxHistorySize: number;
  };
}

// =============================================================================
// COMPONENT EXPORT
// =============================================================================

export { default as BettingInterface } from './BettingInterface.vue';
