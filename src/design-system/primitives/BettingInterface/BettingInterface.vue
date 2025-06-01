<template>
  <!-- =============================================================================
  HEADLESS BETTING INTERFACE PRIMITIVE COMPONENT
  ============================================================================== -->
  <!-- Pure logic component with slot-based API for Betting Interface -->
  <!-- Integrates with PayoutSettings for real-time payout display -->
  <div>
    <slot :state="state" :actions="actions" :utils="utils" :config="config" :handlers="handlers" />
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// IMPORTS
// =============================================================================

import { ref, computed, watch, nextTick } from 'vue';
import type {
  BettingInterfaceProps,
  BettingInterfaceEmits,
  BettingInterfaceState,
  BettingInterfaceSlotProps,
  PayoutIntegration,
} from './index';
import type { PayoutValues } from '@/config/payoutSettings';
import type { BetType } from '@/config/bettingInterfaceSettings';

// Import configuration modules
import {
  BETTING_INTERFACE_DEFAULTS,
  BETTING_INTERFACE_SETTINGS,
  BET_TYPES,
  BETTING_VALIDATION,
  BETTING_UTILS,
} from '@/config/bettingInterfaceSettings';

// =============================================================================
// PROPS & EMITS DEFINITIONS
// =============================================================================

const props = withDefaults(defineProps<BettingInterfaceProps>(), {
  initialBetAmount: BETTING_INTERFACE_DEFAULTS.DEFAULT_BET_AMOUNT,
  initialSelectedBet: null,
  sessionActive: false,
  canPerformActions: true,
  enableValidation: true,
  enableRiskWarnings: true,
  showPayoutInfo: true,
  showCurrentBetStatus: true,
  showStatistics: true,
  isPlacingBet: false,
  isValidatingBet: false,
});

const emit = defineEmits<BettingInterfaceEmits>();

// =============================================================================
// REACTIVE STATE
// =============================================================================

// Core betting state
const betAmount = ref<number>(props.initialBetAmount);
const selectedBet = ref<BetType | null>(props.initialSelectedBet);

// UI state
const isPlacingBet = ref<boolean>(props.isPlacingBet);
const isValidating = ref<boolean>(props.isValidatingBet);
const showPayoutInfo = ref<boolean>(props.showPayoutInfo);
const showCurrentBetStatus = ref<boolean>(props.showCurrentBetStatus);

// Validation state
const validationErrors = ref<string[]>([]);
const validationWarnings = ref<string[]>([]);

// Statistics state (would be connected to a statistics store in real implementation)
const statisticsData = ref({
  totalHands: 0,
  winRate: 0,
  roi: 0,
  currentStreak: 0,
  streakType: 'none' as 'win' | 'loss' | 'none',
});

// =============================================================================
// PAYOUT INTEGRATION - CRITICAL FOR REAL-TIME DISPLAY
// =============================================================================

// Real-time payout calculations using live PayoutSettings values
const payoutCalculations = computed(() => {
  const payouts = props.currentPayoutValues;

  return {
    player: {
      payout: `${payouts.player_payout}:1`,
      commission: '0%', // Player bets have no commission
    },
    banker: {
      payout: `${payouts.banker_payout}:1`,
      commission: utils.formatPercentage(payouts.banker_commission),
    },
    tie: {
      payout: `${payouts.tie_payout}:1`,
      commission: '0%',
    },
    playerPair: {
      payout: `${payouts.player_pair_payout}:1`,
      commission: '0%',
    },
    bankerPair: {
      payout: `${payouts.banker_pair_payout}:1`,
      commission: '0%',
    },
  };
});

// =============================================================================
// COMPUTED STATE
// =============================================================================

const state = computed(
  (): BettingInterfaceState => ({
    // Current betting configuration
    betAmount: betAmount.value,
    selectedBet: selectedBet.value,

    // Real-time payout calculations (using live PayoutSettings)
    payoutCalculations: payoutCalculations.value,

    // Current bet state
    currentBet: props.currentRoundBet || {
      hasBet: false,
      betType: null,
      betAmount: 0,
      placedAt: null,
    },

    // Validation state
    validation: {
      isValid: validationErrors.value.length === 0,
      errors: validationErrors.value,
      warnings: validationWarnings.value,
      riskLevel: calculateRiskLevel(),
    },

    // Professional algorithm integration
    algorithms: {
      kelly: {
        optimalBetSize: props.kellyRecommendation?.optimalBetSize || 0,
        recommendation: generateKellyRecommendation(),
        riskAdjustment: props.kellyRecommendation?.kellyPercentage || 0,
      },
      monteCarlo: {
        expectedReturn: props.monteCarloResults?.expectedValue || 0,
        riskAssessment: generateMonteCarloAssessment(),
        confidenceLevel: props.burnAnalysisData?.confidence || 0,
      },
      burnAnalysis: {
        edgeAdjustment: props.burnAnalysisData?.burnAdjustedEdge || 0,
        recommendedBetType: calculateBurnRecommendation(),
      },
    },

    // UI state
    ui: {
      isPlacingBet: isPlacingBet.value,
      isValidating: isValidating.value,
      showPayoutInfo: showPayoutInfo.value,
      showCurrentBetStatus: showCurrentBetStatus.value,
    },

    // Statistics (live calculation)
    statistics: statisticsData.value,
  })
);

// =============================================================================
// ACTIONS
// =============================================================================

const actions = {
  // Betting actions
  updateBetAmount: (amount: number): void => {
    console.log('[betting-interface][action] Updating bet amount', {
      previousAmount: betAmount.value,
      newAmount: amount,
      balance: props.currentBalance,
    });

    betAmount.value = amount;
    actions.validateBet();
    emit('bet-amount-changed', amount);
  },

  selectBetType: (betType: BetType): void => {
    console.log('[betting-interface][action] Selecting bet type', {
      previousBet: selectedBet.value,
      newBet: betType,
      currentAmount: betAmount.value,
    });

    selectedBet.value = betType;
    actions.validateBet();
    emit('bet-type-selected', betType);
  },

  placeBet: async (): Promise<void> => {
    if (!selectedBet.value) {
      return;
    }

    console.log('[betting-interface][action] Placing bet', {
      betType: selectedBet.value,
      amount: betAmount.value,
      balance: props.currentBalance,
      payoutInfo: payoutCalculations.value[selectedBet.value],
    });

    isPlacingBet.value = true;

    try {
      const betEvent = {
        betType: selectedBet.value,
        betAmount: betAmount.value,
        balance: props.currentBalance,
        timestamp: new Date(),
      };

      emit('bet-placed', betEvent);
    } finally {
      isPlacingBet.value = false;
    }
  },

  clearBet: (): void => {
    console.log('[betting-interface][action] Clearing bet', {
      previousBet: selectedBet.value,
      previousAmount: betAmount.value,
    });

    selectedBet.value = null;
    betAmount.value = BETTING_INTERFACE_DEFAULTS.DEFAULT_BET_AMOUNT;
    validationErrors.value = [];
    validationWarnings.value = [];
    emit('bet-cleared');
  },

  // Validation actions
  validateBet: () => {
    const result = performValidation();
    validationErrors.value = result.errors;
    validationWarnings.value = result.warnings;

    if (result.isValid) {
      emit('validation-success', result);
    } else {
      emit('validation-error', result);
    }

    return result;
  },

  checkRiskLevel: (): 'low' | 'medium' | 'high' => {
    return calculateRiskLevel();
  },

  // Integration actions - PayoutSettings handlers
  requestPayoutUpdate: (): void => {
    console.log('[betting-interface][integration] Requesting payout update');
    emit('payout-settings-requested');
  },

  updatePayoutCalculations: (payoutValues: PayoutValues): void => {
    console.log('[betting-interface][integration] Updating payout calculations', {
      newPayouts: payoutValues,
      affectedCalculations: Object.keys(payoutCalculations.value),
    });

    emit('payout-update-needed', payoutValues);
  },

  // Professional algorithm actions
  calculateKellyOptimal: (): void => {
    if (selectedBet.value) {
      emit('kelly-calculation-requested', betAmount.value, selectedBet.value);
    }
  },

  assessMonteCarloRisk: (): void => {
    emit('risk-assessment-requested', betAmount.value, props.currentBalance);
  },

  applyBurnAnalysisAdjustment: (): void => {
    // Apply burn analysis recommendations to bet selection
    const recommendation = calculateBurnRecommendation();
    if (recommendation) {
      actions.selectBetType(recommendation);
    }
  },

  // Statistics actions
  updateStatistics: (): void => {
    // This would normally integrate with a statistics store
    const metrics = calculateCurrentStatistics();
    statisticsData.value = metrics;

    emit('statistics-updated', {
      metrics: {
        totalHands: metrics.totalHands,
        winRate: metrics.winRate,
        roi: metrics.roi,
        currentStreak: metrics.currentStreak,
      },
      calculations: {},
      timestamp: new Date(),
    });
  },

  recalculateMetrics: (): void => {
    actions.updateStatistics();
  },
};

// =============================================================================
// UTILITY FUNCTIONS - INTEGRATION WITH PAYOUTSETTINGS
// =============================================================================

const utils = {
  // PayoutSettings integration utilities - CRITICAL CONNECTION
  formatCurrency: (amount: number): string => {
    return BETTING_UTILS.formatCurrency(amount);
  },

  // This formatPercentage connects to PayoutSettings formatPercentage
  formatPercentage: (decimal: number): string => {
    return BETTING_UTILS.formatPercentage(decimal);
  },

  formatPayout: (payout: number): string => {
    return `${payout}:1`;
  },

  // Professional calculation utilities
  calculateExpectedReturn: (betType: BetType, amount: number): number => {
    const payouts = props.currentPayoutValues;

    switch (betType) {
      case 'player':
        return amount * payouts.player_payout;
      case 'banker':
        return amount * payouts.banker_payout * (1 - payouts.banker_commission);
      case 'tie':
        return amount * payouts.tie_payout;
      case 'playerPair':
        return amount * payouts.player_pair_payout;
      case 'bankerPair':
        return amount * payouts.banker_pair_payout;
      default:
        return 0;
    }
  },

  calculateCommission: (amount: number, rate: number): number => {
    return amount * rate;
  },

  assessBetRisk: (amount: number, balance: number): string => {
    return BETTING_UTILS.assessBetRisk(amount, balance);
  },

  // Statistics utilities
  formatStatistic: (value: number, type: 'currency' | 'percentage' | 'number'): string => {
    switch (type) {
      case 'currency':
        return utils.formatCurrency(value);
      case 'percentage':
        return utils.formatPercentage(value);
      case 'number':
        return BETTING_UTILS.formatNumber(value);
      default:
        return value.toString();
    }
  },

  getStreakDisplay: (): string => {
    const { currentStreak, streakType } = statisticsData.value;
    if (streakType === 'none' || currentStreak === 0) {
      return 'No streak';
    }
    return `${currentStreak} ${streakType === 'win' ? 'wins' : 'losses'}`;
  },

  getRiskLevelColor: (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  },
};

// =============================================================================
// CONFIGURATION ACCESS
// =============================================================================

const config = {
  defaults: BETTING_INTERFACE_DEFAULTS,
  settings: BETTING_INTERFACE_SETTINGS,
  betTypes: BET_TYPES,
  validation: BETTING_VALIDATION,
};

// =============================================================================
// INTEGRATION HANDLERS
// =============================================================================

const handlers = {
  // PayoutSettings event handlers - CRITICAL INTEGRATION
  onPayoutChange: props.handlers?.onPayoutChange,
  onPayoutPresetSelected: props.handlers?.onPayoutPresetSelected,

  // Session Control event handlers
  onBalanceUpdate: props.handlers?.onBalanceUpdate,
  onSessionStateChange: props.handlers?.onSessionStateChange,

  // Professional algorithm handlers
  onKellyCalculation: props.handlers?.onKellyCalculation,
  onRiskAssessment: props.handlers?.onRiskAssessment,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const performValidation = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Bet amount validation
  if (betAmount.value < BETTING_VALIDATION.BET_AMOUNT.MIN_VALUE) {
    errors.push(`Minimum bet is ${utils.formatCurrency(BETTING_VALIDATION.BET_AMOUNT.MIN_VALUE)}`);
  }

  if (betAmount.value > BETTING_VALIDATION.BET_AMOUNT.MAX_VALUE) {
    errors.push(`Maximum bet is ${utils.formatCurrency(BETTING_VALIDATION.BET_AMOUNT.MAX_VALUE)}`);
  }

  if (betAmount.value > props.currentBalance) {
    errors.push('Insufficient balance for this bet');
  }

  // Risk warnings
  if (props.enableRiskWarnings) {
    const riskRatio = betAmount.value / props.currentBalance;
    if (riskRatio > BETTING_VALIDATION.BET_AMOUNT.BALANCE_RATIO_WARNING) {
      warnings.push(`This bet is ${utils.formatPercentage(riskRatio)} of your balance`);
    }

    if (betAmount.value > BETTING_VALIDATION.BET_AMOUNT.LARGE_BET_WARNING) {
      warnings.push('This is a large bet amount');
    }
  }

  // Bet type validation
  if (!selectedBet.value) {
    errors.push('Please select a bet type');
  }

  // Session validation
  if (!props.sessionActive && props.enableValidation) {
    errors.push('Session must be active to place bets');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

const calculateRiskLevel = (): 'low' | 'medium' | 'high' => {
  return BETTING_UTILS.assessBetRisk(betAmount.value, props.currentBalance);
};

const generateKellyRecommendation = (): string => {
  const kelly = props.kellyRecommendation;
  if (!kelly) {
    return 'No Kelly data available';
  }

  if (kelly.kellyPercentage > 0.1) {
    return 'High confidence bet recommended';
  }
  if (kelly.kellyPercentage > 0.05) {
    return 'Moderate bet recommended';
  }
  return 'Conservative bet recommended';
};

const generateMonteCarloAssessment = (): string => {
  const monteCarlo = props.monteCarloResults;
  if (!monteCarlo) {
    return 'No Monte Carlo data available';
  }

  if (monteCarlo.riskOfRuin > 0.1) {
    return 'High risk scenario';
  }
  if (monteCarlo.riskOfRuin > 0.05) {
    return 'Moderate risk scenario';
  }
  return 'Low risk scenario';
};

const calculateBurnRecommendation = (): BetType | null => {
  const burnData = props.burnAnalysisData;
  if (!burnData || burnData.confidence < 0.7) {
    return null;
  }

  // This would contain sophisticated burn analysis logic
  return burnData.burnAdjustedEdge > 0 ? 'player' : 'banker';
};

const calculateCurrentStatistics = () => {
  // This would normally connect to a statistics store
  return {
    totalHands: statisticsData.value.totalHands,
    winRate: statisticsData.value.winRate,
    roi: statisticsData.value.roi,
    currentStreak: statisticsData.value.currentStreak,
    streakType: statisticsData.value.streakType,
  };
};

// =============================================================================
// WATCHERS FOR PROPS CHANGES
// =============================================================================

// Watch for payout changes and recalculate
watch(
  () => props.currentPayoutValues,
  newPayouts => {
    console.log('[betting-interface][watch] Payout values changed', {
      newPayouts,
      recalculatingDisplays: true,
    });

    // Trigger recalculation of payout displays
    nextTick(() => {
      // Emit event to notify about payout integration update
      emit('payout-update-needed', newPayouts);
    });
  },
  { deep: true }
);

// Watch for balance changes
watch(
  () => props.currentBalance,
  (newBalance, oldBalance) => {
    console.log('[betting-interface][watch] Balance changed', {
      oldBalance,
      newBalance,
      currentBet: betAmount.value,
    });

    // Revalidate bet if balance changes
    if (props.enableValidation) {
      actions.validateBet();
    }
  }
);

// =============================================================================
// LIFECYCLE LOGGING
// =============================================================================

console.log('[betting-interface][lifecycle] Headless primitive initialized', {
  initialBetAmount: betAmount.value,
  initialSelectedBet: selectedBet.value,
  payoutIntegrationActive: Boolean(props.currentPayoutValues),
  sessionActive: props.sessionActive,
  validationEnabled: props.enableValidation,
});
</script>
