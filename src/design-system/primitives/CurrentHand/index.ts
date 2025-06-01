// =============================================================================
// HEADLESS CURRENT HAND PRIMITIVE - TYPESCRIPT INTERFACES
// =============================================================================

import type { Card, HandResult } from '@/types/cards';
import type { PayoutValues } from '@/config/payoutSettings';
import type { BetType } from '@/config/bettingInterfaceSettings';
import type { BetResult } from '@/services/bettingService';
import type {
  PayoutReference,
  HandCompletionEvent,
  AutoCompleteEvent,
  HandValidationResult,
} from '@/config/currentHandSettings';

// =============================================================================
// PROPS INTERFACE
// =============================================================================

export interface CurrentHandProps {
  // Hand state dependencies
  playerCards?: Card[];
  bankerCards?: Card[];

  // Session state dependencies - From Session Control
  sessionActive?: boolean;
  canPerformActions?: boolean;

  // Live PayoutSettings Integration - CRITICAL FOR REAL-TIME CALCULATIONS
  currentPayoutValues: PayoutValues;

  // BettingInterface Integration - For balance updates and bet settlement
  currentBalance: number;
  currentRoundBet?: {
    hasBet: boolean;
    betType: BetType | null;
    betAmount: number;
    placedAt: Date | null;
  };

  // Auto-complete configuration
  autoCompleteEnabled?: boolean;
  autoCompleteCardCount?: number;
  autoCompleteDelay?: number;

  // Display configuration
  showPayoutReference?: boolean;
  showHandSummary?: boolean;
  showNaturalHighlight?: boolean;

  // Professional algorithm integration
  kellyRecommendation?: {
    optimalBetSize: number;
    kellyPercentage: number;
    edge: number;
    riskAdjustment: number;
  };

  monteCarloAssessment?: {
    expectedValue: number;
    riskOfRuin: number;
    confidenceRange: { lower: number; upper: number };
  };

  burnAnalysisData?: {
    burnAdjustedEdge: number;
    confidence: number;
    recommendation: string;
  };

  // Validation configuration
  enableValidation?: boolean;
  requireBetForCompletion?: boolean;

  // Loading states
  isProcessingHand?: boolean;
  isSettlingBets?: boolean;

  // Integration handlers - For cross-component communication
  handlers?: {
    // PayoutSettings event handlers
    onPayoutChange?: (payoutValues: PayoutValues) => void;
    onPayoutPresetSelected?: (presetId: string) => void;

    // BettingInterface event handlers
    onBalanceUpdate?: (newBalance: number) => void;
    onBetSettlement?: (betResult: BetResult) => void;

    // Session Control event handlers
    onSessionStateChange?: (active: boolean) => void;
    onRoundCompletion?: (handResult: HandResult) => void;

    // Professional algorithm handlers
    onKellyCalculation?: (recommendation: any) => void;
    onMonteCarloAssessment?: (assessment: any) => void;
    onBurnAnalysisUpdate?: (data: any) => void;
  };
}

// =============================================================================
// EMITS INTERFACE
// =============================================================================

export interface CurrentHandEmits {
  // Hand lifecycle events
  'hand-started': [cards: Card[]];
  'hand-updated': [playerCards: Card[], bankerCards: Card[]];
  'hand-completed': [event: HandCompletionEvent];
  'hand-cleared': [];

  // Card management events
  'card-added': [card: Card, side: 'player' | 'banker'];
  'cards-dealt': [playerCards: Card[], bankerCards: Card[]];

  // Auto-complete events
  'auto-complete-enabled': [event: AutoCompleteEvent];
  'auto-complete-disabled': [];
  'auto-complete-triggered': [cardCount: number];

  // Winner determination events
  'winner-determined': [
    winner: 'player' | 'banker' | 'tie',
    playerValue: number,
    bankerValue: number,
  ];
  'natural-detected': [side: 'player' | 'banker', value: number];
  'tie-detected': [value: number];

  // BettingInterface integration events
  'bet-settled': [betResult: BetResult];
  'balance-updated': [newBalance: number];
  'payout-calculated': [amount: number, betType: BetType];

  // PayoutSettings integration events
  'payout-values-changed': [payoutValues: PayoutValues];
  'payout-reference-updated': [reference: PayoutReference];

  // Professional algorithm events
  'kelly-calculation-requested': [betAmount: number, edge: number];
  'monte-carlo-assessment-requested': [parameters: any];
  'burn-analysis-updated': [data: any];

  // Validation events
  'validation-error': [result: HandValidationResult];
  'validation-success': [result: HandValidationResult];

  // UI state events
  'loading-started': [operation: string];
  'loading-completed': [operation: string];
  'round-completion-requested': [];
}

// =============================================================================
// STATE INTERFACE - Enhanced for Real-time Integration
// =============================================================================

export interface CurrentHandState {
  // Hand composition
  playerCards: Card[];
  bankerCards: Card[];

  // Hand values (calculated in real-time)
  playerValue: number;
  bankerValue: number;

  // Hand status
  isComplete: boolean;
  hasNatural: boolean;
  winner: 'player' | 'banker' | 'tie' | null;
  handStatus: 'incomplete' | 'ready' | 'natural' | 'complete';

  // Auto-complete management
  autoComplete: {
    enabled: boolean;
    cardCount: number;
    delay: number;
    canTrigger: boolean;
    isTriggered: boolean;
  };

  // Round state with betting integration
  round: {
    canCompleteRound: boolean;
    canClearHand: boolean;
    hasBet: boolean;
    betType: BetType | null;
    betAmount: number;
    requiresBet: boolean;
  };

  // Live PayoutSettings integration
  payout: {
    currentValues: PayoutValues;
    reference: PayoutReference;
    showReference: boolean;
    lastUpdated: Date;
  };

  // BettingInterface integration
  betting: {
    currentBalance: number;
    pendingSettlement: boolean;
    lastBetResult?: BetResult;
    balanceChange?: number;
  };

  // Professional algorithms integration
  algorithms: {
    kelly: {
      recommendation?: {
        optimalBetSize: number;
        kellyPercentage: number;
        edge: number;
        riskAdjustment: number;
      };
      isEnabled: boolean;
    };

    monteCarlo: {
      assessment?: {
        expectedValue: number;
        riskOfRuin: number;
        confidenceRange: { lower: number; upper: number };
      };
      isEnabled: boolean;
    };

    burnAnalysis: {
      data?: {
        burnAdjustedEdge: number;
        confidence: number;
        recommendation: string;
      };
      isEnabled: boolean;
    };
  };

  // Validation state
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    canComplete: boolean;
    requiresBet: boolean;
  };

  // UI state
  ui: {
    isLoading: boolean;
    isProcessingCompletion: boolean;
    isSettlingBets: boolean;
    showPayoutReference: boolean;
    showHandSummary: boolean;
    showNaturalHighlight: boolean;
  };

  // Hand summary calculations
  summary: {
    currentWinner: string;
    cardsDealt: number;
    totalCards: number;
    playerCardCount: number;
    bankerCardCount: number;
  };
}

// =============================================================================
// ACTIONS INTERFACE - Comprehensive Hand Management
// =============================================================================

export interface CurrentHandActions {
  // Card management
  addCard: (card: Card, side: 'player' | 'banker') => void;
  dealCards: (playerCards: Card[], bankerCards: Card[]) => void;
  clearHand: () => void;

  // Auto-complete management
  enableAutoComplete: () => void;
  disableAutoComplete: () => void;
  triggerAutoComplete: () => void;

  // Hand completion with betting integration
  completeRound: () => Promise<void>;
  completeHandWithoutBet: () => void;

  // Winner determination
  calculateWinner: () => 'player' | 'banker' | 'tie' | null;
  checkForNatural: () => boolean;

  // PayoutSettings integration actions
  updatePayoutValues: (payoutValues: PayoutValues) => void;
  refreshPayoutReference: () => void;

  // BettingInterface integration actions
  settleBet: (handResult: HandResult) => Promise<BetResult | undefined>;
  updateBalance: (newBalance: number) => void;

  // Professional algorithm actions
  requestKellyCalculation: () => void;
  requestMonteCarloAssessment: () => void;
  updateBurnAnalysis: (data: any) => void;

  // Validation actions
  validateHand: () => HandValidationResult;
  validateCompletion: () => boolean;

  // UI state actions
  togglePayoutReference: () => void;
  toggleHandSummary: () => void;
  setLoadingState: (loading: boolean, operation?: string) => void;
}

// =============================================================================
// UTILITY FUNCTIONS INTERFACE - Real-time Calculations
// =============================================================================

export interface CurrentHandUtils {
  // Hand calculations (using live PayoutSettings)
  calculateHandValue: (cards: Card[]) => number;
  determineWinner: (playerValue: number, bankerValue: number) => 'player' | 'banker' | 'tie';
  hasNatural: (playerValue: number, bankerValue: number) => boolean;

  // PayoutSettings integration utilities
  formatPayoutReference: (payoutValues: PayoutValues) => PayoutReference;
  calculatePotentialPayout: (
    betType: BetType,
    betAmount: number,
    payoutValues: PayoutValues
  ) => number;
  formatCommission: (rate: number) => string;

  // BettingInterface integration utilities
  calculateBetResult: (
    betType: BetType,
    betAmount: number,
    handResult: HandResult,
    payoutValues: PayoutValues
  ) => BetResult;
  calculateBalanceChange: (betResult: BetResult) => number;

  // Hand status utilities
  formatHandStatus: (
    playerCards: Card[],
    bankerCards: Card[],
    playerValue: number,
    bankerValue: number
  ) => string;
  getWinnerClass: (winner: string) => string;
  getHandStatusColor: (status: string) => string;

  // Professional algorithm utilities
  formatKellyRecommendation: (recommendation: any) => string;
  formatMonteCarloAssessment: (assessment: any) => string;
  formatBurnAnalysisData: (data: any) => string;

  // Currency and percentage formatting (from PayoutSettings)
  formatCurrency: (amount: number) => string;
  formatPercentage: (decimal: number) => string; // From PayoutSettings integration

  // Validation utilities
  validateMinimumCards: (playerCards: Card[], bankerCards: Card[]) => boolean;
  validateSessionActive: (sessionActive: boolean) => boolean;
  validateBetRequirement: (hasBet: boolean, requiresBet: boolean) => boolean;
}

// =============================================================================
// SLOT PROPS INTERFACE - Complete API for Styled Wrappers
// =============================================================================

export interface CurrentHandSlotProps {
  // Current state
  state: CurrentHandState;

  // Actions
  actions: CurrentHandActions;

  // Utility functions
  utils: CurrentHandUtils;

  // Configuration (from currentHandSettings.ts)
  config: {
    STYLING: typeof import('@/config/currentHandSettings').CURRENT_HAND_STYLING;
    COLORS: typeof import('@/config/currentHandSettings').CURRENT_HAND_COLORS;
    LABELS: typeof import('@/config/currentHandSettings').CURRENT_HAND_LABELS;
    ICONS: typeof import('@/config/currentHandSettings').CURRENT_HAND_ICONS;
    DEFAULTS: typeof import('@/config/currentHandSettings').CURRENT_HAND_DEFAULTS;
  };

  // Integration handlers
  handlers: {
    // PayoutSettings integration
    onPayoutChange?: (payoutValues: PayoutValues) => void;
    onPayoutPresetSelected?: (presetId: string) => void;

    // BettingInterface integration
    onBalanceUpdate?: (newBalance: number) => void;
    onBetSettlement?: (betResult: BetResult) => void;

    // Session Control integration
    onSessionStateChange?: (active: boolean) => void;
    onRoundCompletion?: (handResult: HandResult) => void;

    // Professional algorithm integration
    onKellyCalculation?: (recommendation: any) => void;
    onMonteCarloAssessment?: (assessment: any) => void;
    onBurnAnalysisUpdate?: (data: any) => void;
  };
}

// =============================================================================
// INTEGRATION EVENTS - Cross-Component Communication
// =============================================================================

export interface PayoutIntegrationEvent {
  payoutValues: PayoutValues;
  reference: PayoutReference;
  timestamp: Date;
  source: 'preset-change' | 'manual-edit' | 'initialization';
}

export interface BettingIntegrationEvent {
  betResult: BetResult;
  newBalance: number;
  balanceChange: number;
  timestamp: Date;
  handResult: HandResult;
}

export interface AlgorithmIntegrationEvent {
  type: 'kelly' | 'monte-carlo' | 'burn-analysis';
  data: any;
  timestamp: Date;
  confidence: number;
}

// =============================================================================
// VALIDATION INTEGRATION
// =============================================================================

export interface CurrentHandValidation {
  // Real-time validation
  realTime: {
    handState: HandValidationResult;
    sessionState: HandValidationResult;
    betState: HandValidationResult;
    payoutState: HandValidationResult;
  };

  // Cross-validation with other systems
  crossValidation: {
    sessionControlValid: boolean;
    bettingInterfaceValid: boolean;
    payoutSettingsValid: boolean;
  };

  // Professional validation
  professionalValidation: {
    minimumCardRequirement: boolean;
    sessionActiveRequirement: boolean;
    betRequirement: boolean;
    balanceRequirement: boolean;
  };
}

// =============================================================================
// COMPONENT EXPORT
// =============================================================================

export { default as CurrentHand } from './CurrentHand.vue';
