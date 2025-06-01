// =============================================================================
// USE CURRENT HAND COMPOSABLE - TRULY HEADLESS CDD IMPLEMENTATION
// =============================================================================
// Professional headless composable for Current Hand functionality
// Follows the same CDD patterns as other composables in the project
// Integrates with PayoutSettings and BettingInterface for real-time functionality

import { ref, computed, watch, nextTick, readonly } from 'vue';
import { useToast } from 'vue-toastification';

// Store and services
import { useBaccaratStore } from '@/stores/baccaratStore';
import { BettingService } from '@/services/bettingService';

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

// =============================================================================
// INTERFACES
// =============================================================================

export interface UseCurrentHandProps {
  // Required props
  currentPayoutValues: PayoutValues;
  currentBalance: number;
  currentRoundBet: {
    hasBet: boolean;
    betType: BetType | null;
    betAmount: number;
    placedAt: Date | null;
  };

  // Session props
  sessionActive?: boolean;
  canPerformActions?: boolean;

  // Configuration props
  autoCompleteEnabled?: boolean;
  autoCompleteCardCount?: number;
  autoCompleteDelay?: number;
  requireBetForCompletion?: boolean;
  showPayoutReference?: boolean;
  showHandSummary?: boolean;
  showNaturalHighlight?: boolean;
  enableValidation?: boolean;

  // Professional algorithm props
  kellyRecommendation?: any;
  monteCarloAssessment?: any;
  burnAnalysisData?: any;

  // Integration handlers
  handlers?: {
    onPayoutChange?: (payoutValues: PayoutValues) => void;
    onBalanceUpdate?: (newBalance: number) => void;
    onBetSettlement?: (betResult: BetResult) => void;
    onRoundCompletion?: (handResult: HandResult) => void;
    onKellyCalculation?: (data: any) => void;
    onMonteCarloAssessment?: (data: any) => void;
    onBurnAnalysisUpdate?: (data: any) => void;
  };
}

export interface UseCurrentHandEmits {
  // Hand lifecycle events
  'hand-completed': [event: HandCompletionEvent];
  'hand-cleared': [];
  'hand-started': [cards: Card[]];
  'hand-updated': [playerCards: Card[], bankerCards: Card[]];

  // Card events
  'card-added': [card: Card, side: 'player' | 'banker'];
  'cards-dealt': [playerCards: Card[], bankerCards: Card[]];

  // Auto-complete events
  'auto-complete-enabled': [config: { enabled: boolean; cardCount: number; triggerDelay: number }];
  'auto-complete-disabled': [];
  'auto-complete-triggered': [totalCards: number];

  // Winner determination events
  'winner-determined': [
    winner: 'player' | 'banker' | 'tie',
    playerValue: number,
    bankerValue: number,
  ];
  'natural-detected': [side: 'player' | 'banker', value: number];
  'tie-detected': [value: number];

  // Betting integration events
  'bet-settled': [betResult: BetResult];
  'balance-updated': [newBalance: number];
  'payout-calculated': [payout: number, betType: BetType];

  // PayoutSettings integration events
  'payout-values-changed': [payoutValues: PayoutValues];
  'payout-reference-updated': [reference: PayoutReference];

  // Professional algorithm events
  'kelly-calculation-requested': [betAmount: number, edge: number];
  'monte-carlo-assessment-requested': [data: { handState: any }];
  'burn-analysis-updated': [data: any];

  // Validation events
  'validation-error': [result: HandValidationResult];
  'validation-success': [result: HandValidationResult];

  // UI state events
  'loading-started': [operation: string];
  'loading-completed': [operation: string];
}

// =============================================================================
// MAIN COMPOSABLE
// =============================================================================

export function useCurrentHand(
  props: UseCurrentHandProps,
  emit: (event: keyof UseCurrentHandEmits, ...args: any[]) => void
) {
  // =============================================================================
  // DEPENDENCIES
  // =============================================================================

  const store = useBaccaratStore();
  const toast = useToast();

  // =============================================================================
  // REACTIVE STATE
  // =============================================================================

  // Hand composition
  const playerCards = ref<Card[]>([]);
  const bankerCards = ref<Card[]>([]);

  // Auto-complete management
  const autoCompleteEnabled = ref(props.autoCompleteEnabled || false);
  const autoCompleteTimer = ref<number | null>(null);
  const autoCompleteTriggered = ref(false);

  // UI state
  const isLoading = ref(false);
  const isProcessingCompletion = ref(false);
  const isSettlingBets = ref(false);
  const showPayoutReference = ref(props.showPayoutReference ?? true);
  const showHandSummary = ref(props.showHandSummary ?? true);

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

  // Hand value calculations
  const playerValue = computed(() => CURRENT_HAND_UTILS.calculateHandValue(playerCards.value));
  const bankerValue = computed(() => CURRENT_HAND_UTILS.calculateHandValue(bankerCards.value));

  // Natural detection using configuration constant
  const hasNatural = computed(
    () =>
      playerValue.value >= CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.NATURAL_THRESHOLD ||
      bankerValue.value >= CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.NATURAL_THRESHOLD
  );

  // Winner determination
  const winner = computed((): 'player' | 'banker' | 'tie' | null => {
    const totalCards = playerCards.value.length + bankerCards.value.length;
    if (totalCards < CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.MIN_CARDS_FOR_VALIDATION) {
      return null;
    }
    return CURRENT_HAND_UTILS.determineWinner(playerValue.value, bankerValue.value);
  });

  // Hand status
  const handStatus = computed((): 'incomplete' | 'ready' | 'natural' | 'complete' => {
    const totalCards = playerCards.value.length + bankerCards.value.length;

    if (totalCards === 0) {
      return 'incomplete';
    }
    if (hasNatural.value) {
      return 'natural';
    }
    if (totalCards >= CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.MIN_CARDS_FOR_VALIDATION) {
      return 'ready';
    }
    return 'incomplete';
  });

  // Round state computations
  const canCompleteRound = computed((): boolean => {
    if (!props.sessionActive) return false;
    if (isProcessingCompletion.value) return false;

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
    if (!autoCompleteEnabled.value) return false;
    if (autoCompleteTriggered.value) return false;

    const totalCards = playerCards.value.length + bankerCards.value.length;
    const cardCount =
      props.autoCompleteCardCount ||
      CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.DEFAULT_AUTO_COMPLETE_CARD_COUNT;
    return totalCards >= cardCount;
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

  // Main state object for slot props
  const state = computed(() => ({
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
      cardCount:
        props.autoCompleteCardCount ||
        CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.DEFAULT_AUTO_COMPLETE_CARD_COUNT,
      delay: props.autoCompleteDelay || CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.AUTO_COMPLETE_DELAY_MS,
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
      showNaturalHighlight: props.showNaturalHighlight ?? true,
    },

    // Summary
    summary: handSummary.value,
  }));

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const actions = {
    // Card management
    addCard: (card: Card, side: 'player' | 'banker'): void => {
      console.log('[use-current-hand][action] Adding card', {
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
      actions.validateHand();

      // Check for auto-complete
      nextTick(() => {
        if (canAutoComplete.value && !autoCompleteTriggered.value) {
          actions.triggerAutoComplete();
        }
      });
    },

    dealCards: (newPlayerCards: Card[], newBankerCards: Card[]): void => {
      console.log('[use-current-hand][action] Dealing cards', {
        playerCards: newPlayerCards.length,
        bankerCards: newBankerCards.length,
        totalCards: newPlayerCards.length + newBankerCards.length,
      });

      playerCards.value = [...newPlayerCards];
      bankerCards.value = [...newBankerCards];

      emit('cards-dealt', newPlayerCards, newBankerCards);
      emit('hand-updated', newPlayerCards, newBankerCards);
      actions.validateHand();
    },

    clearHand: (): void => {
      console.log('[use-current-hand][action] Clearing hand', {
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
      console.log('[use-current-hand][auto-complete] Enabling auto-complete');
      autoCompleteEnabled.value = true;

      emit('auto-complete-enabled', {
        enabled: true,
        cardCount:
          props.autoCompleteCardCount ||
          CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.DEFAULT_AUTO_COMPLETE_CARD_COUNT,
        triggerDelay:
          props.autoCompleteDelay || CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.AUTO_COMPLETE_DELAY_MS,
      });
    },

    disableAutoComplete: (): void => {
      console.log('[use-current-hand][auto-complete] Disabling auto-complete');
      autoCompleteEnabled.value = false;

      if (autoCompleteTimer.value) {
        clearTimeout(autoCompleteTimer.value);
        autoCompleteTimer.value = null;
      }

      emit('auto-complete-disabled');
    },

    triggerAutoComplete: (): void => {
      if (!canAutoComplete.value) return;

      console.log('[use-current-hand][auto-complete] Triggering auto-complete', {
        currentCards: playerCards.value.length + bankerCards.value.length,
        delay: props.autoCompleteDelay,
      });

      autoCompleteTriggered.value = true;
      const delay =
        props.autoCompleteDelay || CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.AUTO_COMPLETE_DELAY_MS;

      autoCompleteTimer.value = window.setTimeout(() => {
        if (canCompleteRound.value) {
          actions.completeRound();
        }
        emit('auto-complete-triggered', playerCards.value.length + bankerCards.value.length);
      }, delay);
    },

    // Hand completion with betting integration
    completeRound: async (): Promise<void> => {
      if (!canCompleteRound.value) {
        console.warn('[use-current-hand][completion] Cannot complete round - validation failed');
        return;
      }

      console.log('[use-current-hand][completion] Starting round completion', {
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
        // ✨ Phase 8: Implement proper pair detection and session integration
        const handResult: HandResult = {
          player: playerCards.value,
          banker: bankerCards.value,
          winner: winner.value || 'tie',
          playerPair: detectPairInHand(playerCards.value),
          bankerPair: detectPairInHand(bankerCards.value),
          playerTotal: playerValue.value,
          bankerTotal: bankerValue.value,
          natural: hasNatural.value,
          timestamp: Date.now(),
          handNumber: getSessionHandNumber(),
        };

        // Settle bet if exists using FRESH PAYOUT VALUES
        let betResult: BetResult | undefined;
        if (props.currentRoundBet?.hasBet && props.currentRoundBet?.betType) {
          betResult = await actions.settleBet(handResult);
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
          const naturalSide =
            playerValue.value >= CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.NATURAL_THRESHOLD
              ? 'player'
              : 'banker';
          const naturalValue = Math.max(playerValue.value, bankerValue.value);
          emit('natural-detected', naturalSide, naturalValue);
        }

        if (winner.value === 'tie') {
          emit('tie-detected', playerValue.value);
        }

        // ✨ Phase 8: Add to hand history via store
        if (handResult) {
          store.handHistory.push(handResult);
          console.log('[use-current-hand][history] Hand added to history', {
            handNumber: handResult.handNumber,
            winner: handResult.winner,
            totalHands: store.handHistory.length,
          });
        }

        // Notify integration handlers
        if (props.handlers?.onRoundCompletion) {
          props.handlers.onRoundCompletion(handResult);
        }

        console.log('[use-current-hand][completion] Round completed successfully', {
          winner: winner.value,
          betResult: betResult ? { won: betResult.won, payout: betResult.payout } : null,
          newBalance: currentBalance.value,
        });
      } catch (error) {
        console.error('[use-current-hand][completion] Error completing round:', error);
        validationErrors.value.push(`Failed to complete round: ${(error as Error).message}`);
        emit('validation-error', actions.validateHand());
      } finally {
        isProcessingCompletion.value = false;
        emit('loading-completed', 'completion');
      }
    },

    // BettingInterface integration with FRESH PAYOUT VALUES
    settleBet: async (handResult: HandResult): Promise<BetResult | undefined> => {
      if (!props.currentRoundBet?.hasBet || !props.currentRoundBet?.betType) {
        return undefined;
      }

      console.log('[use-current-hand][betting-integration] Settling bet', {
        betType: props.currentRoundBet.betType,
        betAmount: props.currentRoundBet.betAmount,
        handResult: {
          winner: handResult.winner,
          playerTotal: handResult.playerTotal,
          bankerTotal: handResult.bankerTotal,
        },
        currentPayoutValues: currentPayoutValues.value,
      });

      isSettlingBets.value = true;

      try {
        // ✨ CRITICAL: Calculate bet result using FRESH PayoutSettings values
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

        // ✨ CRITICAL: Update balance using BettingInterface integration
        const newBalance = currentBalance.value + betResult.payout;
        balanceChange.value = betResult.netResult;
        lastBetResult.value = betResult;

        actions.updateBalance(newBalance);

        emit('bet-settled', betResult);
        emit('payout-calculated', betResult.payout, props.currentRoundBet.betType);

        if (props.handlers?.onBetSettlement) {
          props.handlers.onBetSettlement(betResult);
        }

        console.log('[use-current-hand][betting-integration] Bet settled', {
          won: betResult.won,
          payout: betResult.payout,
          netResult: betResult.netResult,
          newBalance,
          payoutValuesUsed: currentPayoutValues.value,
        });

        return betResult;
      } catch (error) {
        console.error('[use-current-hand][betting-integration] Error settling bet:', error);
        throw error;
      } finally {
        isSettlingBets.value = false;
      }
    },

    updateBalance: (newBalance: number): void => {
      console.log('[use-current-hand][betting-integration] Updating balance', {
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

    // PayoutSettings integration
    updatePayoutValues: (payoutValues: PayoutValues): void => {
      console.log('[use-current-hand][payout-integration] Updating payout values', {
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

    // Professional algorithm actions
    requestKellyCalculation: (): void => {
      if (!props.currentRoundBet?.betAmount) return;

      console.log('[use-current-hand][kelly] Requesting Kelly calculation');
      emit(
        'kelly-calculation-requested',
        props.currentRoundBet.betAmount,
        CURRENT_HAND_SETTINGS.MAGIC_NUMBERS.DEFAULT_EDGE_PERCENTAGE
      );

      if (props.handlers?.onKellyCalculation) {
        props.handlers.onKellyCalculation({ betAmount: props.currentRoundBet.betAmount });
      }
    },

    requestMonteCarloAssessment: (): void => {
      console.log('[use-current-hand][monte-carlo] Requesting Monte Carlo assessment');
      emit('monte-carlo-assessment-requested', { handState: state.value });

      if (props.handlers?.onMonteCarloAssessment) {
        props.handlers.onMonteCarloAssessment({ handState: state.value });
      }
    },

    updateBurnAnalysis: (data: any): void => {
      console.log('[use-current-hand][burn-analysis] Updating burn analysis data', data);
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
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const utils = {
    // Hand calculations
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

    // Currency and percentage formatting
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
  };

  // =============================================================================
  // WATCHERS FOR REAL-TIME INTEGRATION
  // =============================================================================

  // Watch for PayoutSettings changes - CRITICAL INTEGRATION
  watch(
    () => props.currentPayoutValues,
    newPayoutValues => {
      if (newPayoutValues) {
        actions.updatePayoutValues(newPayoutValues);
      }
    },
    { deep: true, immediate: true }
  );

  // Watch for balance changes - CRITICAL INTEGRATION
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
  // HELPER FUNCTIONS (Phase 8 implementations)
  // =============================================================================

  function detectPairInHand(cards: Array<{ rank: string; suit: string }>): boolean {
    if (cards.length < 2) return false;
    // Check if first two cards have same rank
    return cards[0].rank === cards[1].rank;
  }

  function getSessionHandNumber(): number {
    // Get from store or default to 1
    return store.handHistory.length + 1;
  }

  // =============================================================================
  // RETURN HEADLESS API
  // =============================================================================

  return {
    // State
    state,

    // Actions
    actions,

    // Utils
    utils,

    // Configuration
    config: CURRENT_HAND_SETTINGS,

    // Individual reactive values for advanced usage
    playerCards: readonly(playerCards),
    bankerCards: readonly(bankerCards),
    playerValue,
    bankerValue,
    winner,
    hasNatural,
    handStatus,
    canCompleteRound,
    canClearHand,
    canAutoComplete,
    isLoading: readonly(isLoading),
    isProcessingCompletion: readonly(isProcessingCompletion),
    isSettlingBets: readonly(isSettlingBets),
    validationErrors: readonly(validationErrors),
    validationWarnings: readonly(validationWarnings),
    currentPayoutValues: readonly(currentPayoutValues),
    payoutReference: readonly(payoutReference),
    currentBalance: readonly(currentBalance),
    lastBetResult: readonly(lastBetResult),
    balanceChange: readonly(balanceChange),
  };
}
