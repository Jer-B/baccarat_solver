<template>
  <!-- =============================================================================
  HEADLESS CURRENT HAND PRIMITIVE COMPONENT
  ============================================================================== -->
  <!-- Pure logic component with slot-based API for Current Hand functionality -->
  <!-- Integrates with PayoutSettings for real-time payout calculations -->
  <!-- Integrates with BettingInterface for balance updates and bet settlement -->
  <div>
    <slot
      :state="state"
      :actions="actions"
      :utils="utils"
      :config="config"
      :handlers="integrationHandlers"
    />
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// IMPORTS
// =============================================================================

// Type-only imports
import type {
  CurrentHandProps,
  CurrentHandEmits,
  CurrentHandActions,
  CurrentHandUtils,
  CurrentHandSlotProps,
} from './index';

// Vue composition API
import { ref, computed, watch, onMounted, nextTick } from 'vue';

// Configuration and utilities
import {
  CURRENT_HAND_SETTINGS,
  CURRENT_HAND_UTILS,
  type PayoutReference,
  type HandValidationResult,
  type HandCompletionEvent,
} from '@/config/currentHandSettings';

// Type imports
import type { Card, HandResult } from '@/types/cards';
import type { PayoutValues } from '@/config/payoutSettings';
import type { BetType } from '@/config/bettingInterfaceSettings';
import type { BetResult } from '@/services/bettingService';

// Professional algorithm integration
import { BettingService } from '@/services/bettingService';

// =============================================================================
// PROPS AND EMITS
// =============================================================================

const props = withDefaults(defineProps<CurrentHandProps>(), {
  playerCards: () => [],
  bankerCards: () => [],
  sessionActive: false,
  canPerformActions: true,
  autoCompleteEnabled: false,
  autoCompleteCardCount: 6,
  autoCompleteDelay: 1000,
  showPayoutReference: true,
  showHandSummary: true,
  showNaturalHighlight: true,
  enableValidation: true,
  requireBetForCompletion: true,
  isProcessingHand: false,
  isSettlingBets: false,
});

const emit = defineEmits<CurrentHandEmits>();

// =============================================================================
// REACTIVE STATE
// =============================================================================

// Hand composition
const playerCards = ref<Card[]>(props.playerCards || []);
const bankerCards = ref<Card[]>(props.bankerCards || []);

// Auto-complete management
const autoCompleteEnabled = ref(props.autoCompleteEnabled);
const autoCompleteTimer = ref<number | null>(null);
const autoCompleteTriggered = ref(false);

// UI state
const isLoading = ref(false);
const isProcessingCompletion = ref(false);
const isSettlingBets = ref(false);
const showPayoutReference = ref(props.showPayoutReference);
const showHandSummary = ref(props.showHandSummary);

// Validation state
const validationErrors = ref<string[]>([]);
const validationWarnings = ref<string[]>([]);

// Professional algorithms state
const kellyRecommendation = ref(props.kellyRecommendation);
const monteCarloAssessment = ref(props.monteCarloAssessment);
const burnAnalysisData = ref(props.burnAnalysisData);

// Payout integration state
const currentPayoutValues = ref<PayoutValues>(props.currentPayoutValues);
const payoutReference = ref<PayoutReference>(
  CURRENT_HAND_UTILS.formatPayoutReference(props.currentPayoutValues)
);

// Betting integration state
const currentBalance = ref(props.currentBalance);
const lastBetResult = ref<BetResult | undefined>();
const balanceChange = ref<number | undefined>();

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

// Hand values
const playerValue = computed((): number => {
  return CURRENT_HAND_UTILS.calculateHandValue(playerCards.value);
});

const bankerValue = computed((): number => {
  return CURRENT_HAND_UTILS.calculateHandValue(bankerCards.value);
});

// Hand status
const winner = computed((): 'player' | 'banker' | 'tie' | null => {
  const totalCards = playerCards.value.length + bankerCards.value.length;
  if (totalCards < 4) {
    return null;
  } // Not enough cards

  return CURRENT_HAND_UTILS.determineWinner(playerValue.value, bankerValue.value);
});

const hasNatural = computed((): boolean => {
  return CURRENT_HAND_UTILS.hasNatural(playerValue.value, bankerValue.value);
});

const handStatus = computed((): 'incomplete' | 'ready' | 'natural' | 'complete' => {
  const totalCards = playerCards.value.length + bankerCards.value.length;

  if (totalCards === 0) {
    return 'incomplete';
  }
  if (hasNatural.value) {
    return 'natural';
  }
  if (totalCards >= 4) {
    return 'ready';
  }
  return 'incomplete';
});

// Round state
const canCompleteRound = computed((): boolean => {
  if (!props.sessionActive) {
    return false;
  }
  if (isProcessingCompletion.value) {
    return false;
  }

  const totalCards = playerCards.value.length + bankerCards.value.length;
  const hasBet = props.currentRoundBet?.hasBet || false;

  // Must have minimum cards
  if (totalCards < CURRENT_HAND_SETTINGS.DEFAULTS.MIN_CARDS_FOR_COMPLETE_HAND) {
    return false;
  }

  // Must have bet if required
  if (props.requireBetForCompletion && !hasBet) {
    return false;
  }

  return true;
});

const canClearHand = computed((): boolean => {
  const totalCards = playerCards.value.length + bankerCards.value.length;
  return totalCards > 0 && !isProcessingCompletion.value;
});

// Auto-complete state
const canAutoComplete = computed((): boolean => {
  if (!autoCompleteEnabled.value) {
    return false;
  }
  if (autoCompleteTriggered.value) {
    return false;
  }

  const totalCards = playerCards.value.length + bankerCards.value.length;
  return totalCards >= (props.autoCompleteCardCount || 6);
});

// Hand summary
const handSummary = computed(() => {
  const totalCards = playerCards.value.length + bankerCards.value.length;
  const currentWinner = winner.value
    ? CURRENT_HAND_SETTINGS.LABELS[
        `WINNER_${winner.value.toUpperCase()}` as keyof typeof CURRENT_HAND_SETTINGS.LABELS
      ] || CURRENT_HAND_SETTINGS.LABELS.WINNER_UNKNOWN
    : CURRENT_HAND_SETTINGS.LABELS.WINNER_UNKNOWN;

  return {
    currentWinner,
    cardsDealt: totalCards,
    totalCards,
    playerCardCount: playerCards.value.length,
    bankerCardCount: bankerCards.value.length,
  };
});

// Main state object
const state = computed((): CurrentHandSlotProps['state'] => ({
  // Hand composition
  playerCards: playerCards.value,
  bankerCards: bankerCards.value,

  // Hand values
  playerValue: playerValue.value,
  bankerValue: bankerValue.value,

  // Hand status
  isComplete: handStatus.value === 'complete',
  hasNatural: hasNatural.value,
  winner: winner.value,
  handStatus: handStatus.value,

  // Auto-complete
  autoComplete: {
    enabled: autoCompleteEnabled.value,
    cardCount: props.autoCompleteCardCount || 6,
    delay: props.autoCompleteDelay || 1000,
    canTrigger: canAutoComplete.value,
    isTriggered: autoCompleteTriggered.value,
  },

  // Round state
  round: {
    canCompleteRound: canCompleteRound.value,
    canClearHand: canClearHand.value,
    hasBet: props.currentRoundBet?.hasBet || false,
    betType: props.currentRoundBet?.betType || null,
    betAmount: props.currentRoundBet?.betAmount || 0,
    requiresBet: props.requireBetForCompletion || false,
  },

  // Payout integration
  payout: {
    currentValues: currentPayoutValues.value,
    reference: payoutReference.value,
    showReference: showPayoutReference.value,
    lastUpdated: new Date(),
  },

  // Betting integration
  betting: {
    currentBalance: currentBalance.value,
    pendingSettlement: isSettlingBets.value,
    lastBetResult: lastBetResult.value,
    balanceChange: balanceChange.value,
  },

  // Professional algorithms
  algorithms: {
    kelly: {
      recommendation: kellyRecommendation.value,
      isEnabled: CURRENT_HAND_SETTINGS.ALGORITHMS.KELLY.ENABLE_RECOMMENDATIONS,
    },
    monteCarlo: {
      assessment: monteCarloAssessment.value,
      isEnabled: CURRENT_HAND_SETTINGS.ALGORITHMS.MONTE_CARLO.ENABLE_RISK_ASSESSMENT,
    },
    burnAnalysis: {
      data: burnAnalysisData.value,
      isEnabled: CURRENT_HAND_SETTINGS.ALGORITHMS.BURN_ANALYSIS.ENABLE_EDGE_ADJUSTMENT,
    },
  },

  // Validation
  validation: {
    isValid: validationErrors.value.length === 0,
    errors: validationErrors.value,
    warnings: validationWarnings.value,
    canComplete: canCompleteRound.value,
    requiresBet: props.requireBetForCompletion || false,
  },

  // UI state
  ui: {
    isLoading: isLoading.value,
    isProcessingCompletion: isProcessingCompletion.value,
    isSettlingBets: isSettlingBets.value,
    showPayoutReference: showPayoutReference.value,
    showHandSummary: showHandSummary.value,
    showNaturalHighlight: props.showNaturalHighlight || true,
  },

  // Summary
  summary: handSummary.value,
}));

// =============================================================================
// ACTIONS
// =============================================================================

const actions = computed(
  (): CurrentHandActions => ({
    // Card management
    addCard: (card: Card, side: 'player' | 'banker'): void => {
      console.log('[current-hand][action] Adding card', {
        card: `${card.rank}${card.suit}`,
        side,
        currentPlayerCards: playerCards.value.length,
        currentBankerCards: bankerCards.value.length,
      });

      if (side === 'player') {
        playerCards.value.push(card);
      } else {
        bankerCards.value.push(card);
      }

      emit('card-added', card, side);
      actions.value.validateHand();

      // Check for auto-complete
      nextTick(() => {
        if (canAutoComplete.value && !autoCompleteTriggered.value) {
          actions.value.triggerAutoComplete();
        }
      });
    },

    dealCards: (newPlayerCards: Card[], newBankerCards: Card[]): void => {
      console.log('[current-hand][action] Dealing cards', {
        playerCards: newPlayerCards.length,
        bankerCards: newBankerCards.length,
        totalCards: newPlayerCards.length + newBankerCards.length,
      });

      playerCards.value = [...newPlayerCards];
      bankerCards.value = [...newBankerCards];

      emit('cards-dealt', newPlayerCards, newBankerCards);
      emit('hand-updated', newPlayerCards, newBankerCards);
      actions.value.validateHand();
    },

    clearHand: (): void => {
      console.log('[current-hand][action] Clearing hand', {
        previousPlayerCards: playerCards.value.length,
        previousBankerCards: bankerCards.value.length,
      });

      playerCards.value = [];
      bankerCards.value = [];
      autoCompleteTriggered.value = false;

      if (autoCompleteTimer.value) {
        clearTimeout(autoCompleteTimer.value);
        autoCompleteTimer.value = null;
      }

      emit('hand-cleared');
      validationErrors.value = [];
      validationWarnings.value = [];
    },

    // Auto-complete management
    enableAutoComplete: (): void => {
      console.log('[current-hand][auto-complete] Enabling auto-complete');
      autoCompleteEnabled.value = true;

      emit('auto-complete-enabled', {
        enabled: true,
        cardCount: props.autoCompleteCardCount || 6,
        triggerDelay: props.autoCompleteDelay || 1000,
      });
    },

    disableAutoComplete: (): void => {
      console.log('[current-hand][auto-complete] Disabling auto-complete');
      autoCompleteEnabled.value = false;

      if (autoCompleteTimer.value) {
        clearTimeout(autoCompleteTimer.value);
        autoCompleteTimer.value = null;
      }

      emit('auto-complete-disabled');
    },

    triggerAutoComplete: (): void => {
      if (!canAutoComplete.value) {
        return;
      }

      console.log('[current-hand][auto-complete] Triggering auto-complete', {
        currentCards: playerCards.value.length + bankerCards.value.length,
        delay: props.autoCompleteDelay,
      });

      autoCompleteTriggered.value = true;

      autoCompleteTimer.value = window.setTimeout(() => {
        if (canCompleteRound.value) {
          actions.value.completeRound();
        }
        emit('auto-complete-triggered', playerCards.value.length + bankerCards.value.length);
      }, props.autoCompleteDelay || 1000);
    },

    // Hand completion with betting integration
    completeRound: async (): Promise<void> => {
      if (!canCompleteRound.value) {
        console.warn('[current-hand][completion] Cannot complete round - validation failed');
        return;
      }

      console.log('[current-hand][completion] Starting round completion', {
        playerValue: playerValue.value,
        bankerValue: bankerValue.value,
        winner: winner.value,
        hasBet: props.currentRoundBet?.hasBet,
        betType: props.currentRoundBet?.betType,
        betAmount: props.currentRoundBet?.betAmount,
      });

      isProcessingCompletion.value = true;
      emit('loading-started', 'completion');

      try {
        // Create hand result
        const handResult: HandResult = {
          player: playerCards.value,
          banker: bankerCards.value,
          winner: winner.value || 'tie',
          playerPair: false, // TODO: Implement pair detection
          bankerPair: false, // TODO: Implement pair detection
          playerTotal: playerValue.value,
          bankerTotal: bankerValue.value,
          natural: hasNatural.value,
          timestamp: Date.now(),
          handNumber: 1, // TODO: Get from session
        };

        // Settle bet if exists
        let betResult: BetResult | undefined;
        if (props.currentRoundBet?.hasBet && props.currentRoundBet?.betType) {
          betResult = await actions.value.settleBet(handResult);
        }

        // Create completion event
        const completionEvent: HandCompletionEvent = {
          handResult,
          betResult,
          balanceUpdate: betResult ? currentBalance.value : undefined,
          timestamp: Date.now(),
        };

        // Emit completion events
        emit('hand-completed', completionEvent);
        emit('winner-determined', winner.value || 'tie', playerValue.value, bankerValue.value);

        if (hasNatural.value) {
          const naturalSide = playerValue.value >= 8 ? 'player' : 'banker';
          emit('natural-detected', naturalSide, Math.max(playerValue.value, bankerValue.value));
        }

        if (winner.value === 'tie') {
          emit('tie-detected', playerValue.value);
        }

        // Notify integration handlers
        if (props.handlers?.onRoundCompletion) {
          props.handlers.onRoundCompletion(handResult);
        }

        console.log('[current-hand][completion] Round completed successfully', {
          winner: winner.value,
          betResult: betResult ? { won: betResult.won, payout: betResult.payout } : null,
          newBalance: currentBalance.value,
        });
      } catch (error) {
        console.error('[current-hand][completion] Error completing round:', error);
        validationErrors.value.push(`Failed to complete round: ${(error as Error).message}`);
        emit('validation-error', actions.value.validateHand());
      } finally {
        isProcessingCompletion.value = false;
        emit('loading-completed', 'completion');
      }
    },

    completeHandWithoutBet: (): void => {
      console.log('[current-hand][completion] Completing hand without bet settlement');

      const handResult: HandResult = {
        player: playerCards.value,
        banker: bankerCards.value,
        winner: winner.value || 'tie',
        playerPair: false,
        bankerPair: false,
        playerTotal: playerValue.value,
        bankerTotal: bankerValue.value,
        natural: hasNatural.value,
        timestamp: Date.now(),
        handNumber: 1,
      };

      emit('hand-completed', {
        handResult,
        timestamp: Date.now(),
      });
    },

    // Winner determination
    calculateWinner: (): 'player' | 'banker' | 'tie' | null => {
      return winner.value;
    },

    checkForNatural: (): boolean => {
      return hasNatural.value;
    },

    // PayoutSettings integration
    updatePayoutValues: (payoutValues: PayoutValues): void => {
      console.log('[current-hand][payout-integration] Updating payout values', {
        previousValues: currentPayoutValues.value,
        newValues: payoutValues,
      });

      currentPayoutValues.value = payoutValues;
      payoutReference.value = CURRENT_HAND_UTILS.formatPayoutReference(payoutValues);

      emit('payout-values-changed', payoutValues);
      emit('payout-reference-updated', payoutReference.value);

      if (props.handlers?.onPayoutChange) {
        props.handlers.onPayoutChange(payoutValues);
      }
    },

    refreshPayoutReference: (): void => {
      payoutReference.value = CURRENT_HAND_UTILS.formatPayoutReference(currentPayoutValues.value);
      emit('payout-reference-updated', payoutReference.value);
    },

    // BettingInterface integration
    settleBet: async (handResult: HandResult): Promise<BetResult | undefined> => {
      if (!props.currentRoundBet?.hasBet || !props.currentRoundBet?.betType) {
        return undefined;
      }

      console.log('[current-hand][betting-integration] Settling bet', {
        betType: props.currentRoundBet.betType,
        betAmount: props.currentRoundBet.betAmount,
        handResult: {
          winner: handResult.winner,
          playerTotal: handResult.playerTotal,
          bankerTotal: handResult.bankerTotal,
        },
      });

      isSettlingBets.value = true;

      try {
        // Calculate bet result using live PayoutSettings
        const betResult = BettingService.calculatePayout(
          props.currentRoundBet.betType,
          props.currentRoundBet.betAmount,
          handResult,
          {
            player: currentPayoutValues.value.player_payout,
            banker: currentPayoutValues.value.banker_payout,
            bankerCommission: currentPayoutValues.value.banker_commission,
            tie: currentPayoutValues.value.tie_payout,
            playerPair: currentPayoutValues.value.player_pair_payout,
            bankerPair: currentPayoutValues.value.banker_pair_payout,
          }
        );

        // Update balance
        const newBalance = currentBalance.value + betResult.payout;
        balanceChange.value = betResult.netResult;
        lastBetResult.value = betResult;

        actions.value.updateBalance(newBalance);

        emit('bet-settled', betResult);
        emit('payout-calculated', betResult.payout, props.currentRoundBet.betType);

        if (props.handlers?.onBetSettlement) {
          props.handlers.onBetSettlement(betResult);
        }

        console.log('[current-hand][betting-integration] Bet settled', {
          won: betResult.won,
          payout: betResult.payout,
          netResult: betResult.netResult,
          newBalance,
        });

        return betResult;
      } catch (error) {
        console.error('[current-hand][betting-integration] Error settling bet:', error);
        throw error;
      } finally {
        isSettlingBets.value = false;
      }
    },

    updateBalance: (newBalance: number): void => {
      console.log('[current-hand][betting-integration] Updating balance', {
        previousBalance: currentBalance.value,
        newBalance,
        change: newBalance - currentBalance.value,
      });

      currentBalance.value = newBalance;
      emit('balance-updated', newBalance);

      if (props.handlers?.onBalanceUpdate) {
        props.handlers.onBalanceUpdate(newBalance);
      }
    },

    // Professional algorithm actions
    requestKellyCalculation: (): void => {
      if (!props.currentRoundBet?.betAmount) {
        return;
      }

      console.log('[current-hand][kelly] Requesting Kelly calculation');
      emit('kelly-calculation-requested', props.currentRoundBet.betAmount, 0.01); // TODO: Calculate actual edge

      if (props.handlers?.onKellyCalculation) {
        props.handlers.onKellyCalculation({ betAmount: props.currentRoundBet.betAmount });
      }
    },

    requestMonteCarloAssessment: (): void => {
      console.log('[current-hand][monte-carlo] Requesting Monte Carlo assessment');
      emit('monte-carlo-assessment-requested', { handState: state.value });

      if (props.handlers?.onMonteCarloAssessment) {
        props.handlers.onMonteCarloAssessment({ handState: state.value });
      }
    },

    updateBurnAnalysis: (data: any): void => {
      console.log('[current-hand][burn-analysis] Updating burn analysis data', data);
      burnAnalysisData.value = data;
      emit('burn-analysis-updated', data);

      if (props.handlers?.onBurnAnalysisUpdate) {
        props.handlers.onBurnAnalysisUpdate(data);
      }
    },

    // Validation actions
    validateHand: (): HandValidationResult => {
      const result = CURRENT_HAND_UTILS.validateHandCompletion(
        playerCards.value,
        bankerCards.value,
        props.sessionActive || false,
        props.currentRoundBet?.hasBet || false
      );

      validationErrors.value = result.errors;
      validationWarnings.value = result.warnings;

      if (result.isValid) {
        emit('validation-success', result);
      } else {
        emit('validation-error', result);
      }

      return result;
    },

    validateCompletion: (): boolean => {
      return canCompleteRound.value;
    },

    // UI state actions
    togglePayoutReference: (): void => {
      showPayoutReference.value = !showPayoutReference.value;
    },

    toggleHandSummary: (): void => {
      showHandSummary.value = !showHandSummary.value;
    },

    setLoadingState: (loading: boolean, operation?: string): void => {
      isLoading.value = loading;

      if (loading && operation) {
        emit('loading-started', operation);
      } else if (!loading && operation) {
        emit('loading-completed', operation);
      }
    },
  })
);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const utils = computed(
  (): CurrentHandUtils => ({
    // Hand calculations (using CURRENT_HAND_UTILS)
    calculateHandValue: CURRENT_HAND_UTILS.calculateHandValue,
    determineWinner: CURRENT_HAND_UTILS.determineWinner,
    hasNatural: CURRENT_HAND_UTILS.hasNatural,

    // PayoutSettings integration utilities
    formatPayoutReference: CURRENT_HAND_UTILS.formatPayoutReference,

    calculatePotentialPayout: (
      betType: BetType,
      betAmount: number,
      payoutValues: PayoutValues
    ): number => {
      // Calculate potential payout based on bet type and current payout values
      switch (betType) {
        case 'player':
          return betAmount * (payoutValues.player_payout + 1);
        case 'banker':
          const bankerWinnings = betAmount * payoutValues.banker_payout;
          const commission = bankerWinnings * payoutValues.banker_commission;
          return betAmount + bankerWinnings - commission;
        case 'tie':
          return betAmount * (payoutValues.tie_payout + 1);
        case 'playerPair':
          return betAmount * (payoutValues.player_pair_payout + 1);
        case 'bankerPair':
          return betAmount * (payoutValues.banker_pair_payout + 1);
        default:
          return 0;
      }
    },

    formatCommission: (rate: number): string => {
      return `${(rate * 100).toFixed(1)}%`;
    },

    // BettingInterface integration utilities
    calculateBetResult: (
      betType: BetType,
      betAmount: number,
      handResult: HandResult,
      payoutValues: PayoutValues
    ): BetResult => {
      return BettingService.calculatePayout(betType, betAmount, handResult, {
        player: payoutValues.player_payout,
        banker: payoutValues.banker_payout,
        bankerCommission: payoutValues.banker_commission,
        tie: payoutValues.tie_payout,
        playerPair: payoutValues.player_pair_payout,
        bankerPair: payoutValues.banker_pair_payout,
      });
    },

    calculateBalanceChange: (betResult: BetResult): number => {
      return betResult.netResult;
    },

    // Hand status utilities
    formatHandStatus: CURRENT_HAND_UTILS.formatHandStatus,
    getWinnerClass: CURRENT_HAND_UTILS.getWinnerClass,

    getHandStatusColor: (status: string): string => {
      switch (status) {
        case 'natural':
          return CURRENT_HAND_SETTINGS.COLORS.NATURAL_TEXT;
        case 'ready':
          return 'text-green-600';
        case 'complete':
          return 'text-blue-600';
        default:
          return 'text-gray-500';
      }
    },

    // Professional algorithm utilities
    formatKellyRecommendation: (recommendation: any): string => {
      if (!recommendation) {
        return 'No recommendation available';
      }
      return `${CURRENT_HAND_SETTINGS.LABELS.KELLY_RECOMMENDATION} $${recommendation.optimalBetSize?.toFixed(2) || '0.00'}`;
    },

    formatMonteCarloAssessment: (assessment: any): string => {
      if (!assessment) {
        return 'No assessment available';
      }
      return `${CURRENT_HAND_SETTINGS.LABELS.RISK_ASSESSMENT} ${assessment.riskOfRuin ? `${(assessment.riskOfRuin * 100).toFixed(1)}%` : 'Unknown'}`;
    },

    formatBurnAnalysisData: (data: any): string => {
      if (!data) {
        return 'No burn analysis available';
      }
      return `${CURRENT_HAND_SETTINGS.LABELS.BURN_ADJUSTMENT} ${data.burnAdjustedEdge ? `${(data.burnAdjustedEdge * 100).toFixed(2)}%` : 'Unknown'}`;
    },

    // Currency and percentage formatting (from PayoutSettings integration)
    formatCurrency: (amount: number): string => {
      return `$${amount.toFixed(2)}`;
    },

    formatPercentage: (decimal: number): string => {
      return `${(decimal * 100).toFixed(1)}%`;
    },

    // Validation utilities
    validateMinimumCards: (playerCards: Card[], bankerCards: Card[]): boolean => {
      const totalCards = playerCards.length + bankerCards.length;
      return totalCards >= CURRENT_HAND_SETTINGS.DEFAULTS.MIN_CARDS_FOR_COMPLETE_HAND;
    },

    validateSessionActive: (sessionActive: boolean): boolean => {
      return sessionActive;
    },

    validateBetRequirement: (hasBet: boolean, requiresBet: boolean): boolean => {
      return !requiresBet || hasBet;
    },
  })
);

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = {
  STYLING: CURRENT_HAND_SETTINGS.STYLING,
  COLORS: CURRENT_HAND_SETTINGS.COLORS,
  LABELS: CURRENT_HAND_SETTINGS.LABELS,
  ICONS: CURRENT_HAND_SETTINGS.ICONS,
  DEFAULTS: CURRENT_HAND_SETTINGS.DEFAULTS,
};

// =============================================================================
// INTEGRATION HANDLERS
// =============================================================================

const integrationHandlers = computed(() => props.handlers || {});

// =============================================================================
// WATCHERS FOR REAL-TIME INTEGRATION
// =============================================================================

// Watch for PayoutSettings changes
watch(
  () => props.currentPayoutValues,
  newPayoutValues => {
    if (newPayoutValues) {
      actions.value.updatePayoutValues(newPayoutValues);
    }
  },
  { deep: true, immediate: true }
);

// Watch for balance changes
watch(
  () => props.currentBalance,
  newBalance => {
    if (newBalance !== currentBalance.value) {
      currentBalance.value = newBalance;
    }
  },
  { immediate: true }
);

// Watch for professional algorithm updates
watch(
  () => props.kellyRecommendation,
  newRecommendation => {
    kellyRecommendation.value = newRecommendation;
  },
  { deep: true, immediate: true }
);

watch(
  () => props.monteCarloAssessment,
  newAssessment => {
    monteCarloAssessment.value = newAssessment;
  },
  { deep: true, immediate: true }
);

watch(
  () => props.burnAnalysisData,
  newData => {
    burnAnalysisData.value = newData;
  },
  { deep: true, immediate: true }
);

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => {
  console.log('[current-hand][lifecycle] CurrentHand primitive mounted', {
    playerCards: playerCards.value.length,
    bankerCards: bankerCards.value.length,
    sessionActive: props.sessionActive,
    autoCompleteEnabled: autoCompleteEnabled.value,
  });

  // Initialize validation
  actions.value.validateHand();

  // Start hand if cards provided
  if (playerCards.value.length > 0 || bankerCards.value.length > 0) {
    emit('hand-started', [...playerCards.value, ...bankerCards.value]);
  }
});
</script>
