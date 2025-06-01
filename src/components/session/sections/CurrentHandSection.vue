<template>
  <!-- =============================================================================
  CURRENT HAND SECTION - PERFECT CDD IMPLEMENTATION WITH COMPLETE UI RESTORATION
  ============================================================================== -->
  <!-- ✨ PHASE 8 COMPLETION: Perfect CDD + All original UI elements restored -->
  <!-- Preserves EXACT original UI styling while using headless useCurrentHand composable -->
  <!-- Integrates seamlessly with PayoutSettings and BettingInterface for real-time functionality -->

  <div class="card">
    <!-- Header Section with Auto-complete and Controls -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">{{ config.LABELS.COMPONENT_TITLE }}</h2>

      <div class="flex items-center space-x-3">
        <!-- Auto-complete Checkbox (RESTORED from original) -->
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            :checked="autoCompleteState.enabled"
            @change="handleAutoCompleteToggle"
            :disabled="!props.canPerformActions"
            class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span class="text-gray-700"> Auto-complete at 6 cards </span>
        </label>

        <!-- Complete Round / Clear Hand Button (EXACT original styling) -->
        <button
          @click="handleCompleteOrClear"
          :class="[
            'px-3 py-1 rounded-md text-sm transition-colors',
            canPerformMainAction()
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed',
          ]"
          :disabled="!canPerformMainAction()"
        >
          {{ getMainActionLabel() }}
        </button>
      </div>
    </div>

    <!-- Current Hand Display Grid (EXACT original layout) -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Player Side (EXACT original styling with bet highlighting) -->
      <div
        :class="[
          'p-3 rounded-lg border-2 transition-all duration-300',
          handState.playerHasBet
            ? 'bg-blue-50 border-blue-400 shadow-lg ring-2 ring-blue-300'
            : 'border-gray-200',
        ]"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <h3 class="font-medium text-gray-700">Player</h3>
            <!-- Player Kanji SVG (EXACT original) -->
            <svg width="24" height="24" viewBox="0 0 24 24" class="text-blue-600">
              <text
                x="12"
                y="18"
                text-anchor="middle"
                font-family="serif"
                font-size="16"
                fill="currentColor"
              >
                閑
              </text>
            </svg>
            <!-- Bet Amount Display (EXACT original) -->
            <div
              v-if="handState.playerHasBet"
              class="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold"
            >
              ${{ props.currentRoundBet.betAmount }}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div
              class="text-lg font-bold"
              :class="[
                handState.playerCards.length > 0 ? 'text-blue-600' : 'text-gray-400',
                handState.naturalWins.player ? 'bg-yellow-100 px-2 py-1 rounded' : '',
              ]"
            >
              {{ handState.playerCards.length > 0 ? displayState.playerValue : '-' }}
            </div>
            <div
              v-if="handState.naturalWins.player"
              class="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded"
            >
              Natural
            </div>
          </div>
        </div>

        <!-- Player Cards with PlayingCard Components (RESTORED) -->
        <div class="flex space-x-2">
          <PlayingCard
            v-for="(card, index) in handState.playerCards"
            :key="`player-${index}`"
            :card="card"
            size="medium"
            :horizontal="index === 2"
            :clickable="true"
            @click="() => removeCard('player', index)"
          />
          <PlayingCard
            v-if="handState.playerCards.length === 0"
            is-card-back
            size="medium"
            :clickable="true"
            @click="() => addCard('player')"
          />
          <!-- Add card slots for missing cards -->
          <div
            v-for="slot in Math.max(0, 3 - handState.playerCards.length)"
            :key="`player-empty-${slot}`"
            class="w-16 h-23 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all"
            @click="() => addCard('player')"
            :title="config.LABELS.CARD_ADD_TOOLTIP"
          >
            +
          </div>
        </div>
      </div>

      <!-- Banker Side (EXACT original styling with bet highlighting) -->
      <div
        :class="[
          'p-3 rounded-lg border-2 transition-all duration-300',
          handState.bankerHasBet
            ? 'bg-red-50 border-red-400 shadow-lg ring-2 ring-red-300'
            : 'border-gray-200',
        ]"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <h3 class="font-medium text-gray-700">Banker</h3>
            <!-- Banker Kanji SVG (EXACT original) -->
            <svg width="24" height="24" viewBox="0 0 24 24" class="text-red-600">
              <text
                x="12"
                y="18"
                text-anchor="middle"
                font-family="serif"
                font-size="16"
                fill="currentColor"
              >
                庄
              </text>
            </svg>
            <!-- Bet Amount Display (EXACT original) -->
            <div
              v-if="handState.bankerHasBet"
              class="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold"
            >
              ${{ props.currentRoundBet.betAmount }}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div
              class="text-lg font-bold"
              :class="[
                handState.bankerCards.length > 0 ? 'text-red-600' : 'text-gray-400',
                handState.naturalWins.banker ? 'bg-yellow-100 px-2 py-1 rounded' : '',
              ]"
            >
              {{ handState.bankerCards.length > 0 ? displayState.bankerValue : '-' }}
            </div>
            <div
              v-if="handState.naturalWins.banker"
              class="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded"
            >
              Natural
            </div>
          </div>
        </div>

        <!-- Banker Cards with PlayingCard Components (RESTORED) -->
        <div class="flex space-x-2">
          <PlayingCard
            v-for="(card, index) in handState.bankerCards"
            :key="`banker-${index}`"
            :card="card"
            size="medium"
            :horizontal="index === 2"
            :clickable="true"
            @click="() => removeCard('banker', index)"
          />
          <PlayingCard
            v-if="handState.bankerCards.length === 0"
            is-card-back
            size="medium"
            :clickable="true"
            @click="() => addCard('banker')"
          />
          <!-- Add card slots for missing cards -->
          <div
            v-for="slot in Math.max(0, 3 - handState.bankerCards.length)"
            :key="`banker-empty-${slot}`"
            class="w-16 h-23 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all"
            @click="() => addCard('banker')"
            :title="config.LABELS.CARD_ADD_TOOLTIP"
          >
            +
          </div>
        </div>
      </div>
    </div>

    <!-- Other Bet Types Display (RESTORED from original) -->
    <div
      v-if="showOtherBetTypes"
      class="mt-4 p-3 rounded-lg border-2 transition-all duration-300"
      :class="getOtherBetTypeClasses()"
    >
      <div class="flex items-center justify-center space-x-2">
        <span class="font-medium text-gray-700">{{ getOtherBetTypeLabel() }}:</span>
        <div
          class="text-white px-3 py-1 rounded-full text-sm font-bold"
          :class="getOtherBetTypeBadgeClasses()"
        >
          ${{ props.currentRoundBet.betAmount }}
        </div>
      </div>
    </div>

    <!-- Hand Summary (RESTORED from original - only shows when BOTH sides have cards) -->
    <div
      v-if="handState.playerCards.length > 0 && handState.bankerCards.length > 0"
      class="mt-4 pt-4 border-t border-gray-200"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="text-center">
          <div class="font-medium text-gray-700">Current Winner</div>
          <div class="text-lg font-bold" :class="getCurrentWinnerClass()">
            {{ getCurrentWinner() }}
          </div>
        </div>
        <div class="text-center">
          <div class="font-medium text-gray-700">Cards Dealt</div>
          <div class="text-lg font-bold text-gray-600">
            {{ handState.playerCards.length + handState.bankerCards.length }}
          </div>
        </div>
        <div class="text-center">
          <div class="font-medium text-gray-700">Hand Status</div>
          <div class="text-lg font-bold text-gray-600">
            {{ getHandStatus() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Payout Reference (RESTORED from original) -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <h4 class="text-sm font-semibold text-gray-800 mb-2">💰 Quick Payout Reference</h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="space-y-1">
          <div class="flex justify-between">
            <span class="text-blue-600 font-medium">Player:</span>
            <span>{{ props.currentPayoutValues.player_payout }}:1</span>
          </div>
          <div class="flex justify-between">
            <span class="text-red-600 font-medium">Banker:</span>
            <span
              >{{ props.currentPayoutValues.banker_payout }}:1 (-{{
                (props.currentPayoutValues.banker_commission * 100).toFixed(1)
              }}%)</span
            >
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between">
            <span class="text-green-600 font-medium">Tie:</span>
            <span>{{ props.currentPayoutValues.tie_payout }}:1</span>
          </div>
          <div class="flex justify-between">
            <span class="text-purple-600 font-medium">Pairs:</span>
            <span>{{ props.currentPayoutValues.player_pair_payout }}:1</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Professional Algorithm Analysis Panel (Enhanced) -->
    <div v-if="handState.hasActiveCards" :class="config.CLASSES.ALGORITHM_PANEL">
      <div :class="config.CLASSES.ALGORITHM_HEADER">
        <h3 :class="config.CLASSES.ALGORITHM_TITLE">
          {{ config.LABELS.ALGORITHM_TITLE }}
        </h3>
        <button
          @click="triggerAlgorithmAnalysis"
          :disabled="algorithmState.isCalculating"
          :class="config.CLASSES.ALGORITHM_TRIGGER_BUTTON"
        >
          <span v-if="algorithmState.isCalculating" class="animate-spin">⟳</span>
          <span v-else>🧠</span>
          {{ algorithmState.isCalculating ? 'Analyzing...' : 'Analyze' }}
        </button>
      </div>

      <!-- Algorithm Results Display -->
      <div
        v-if="
          algorithmState.currentRecommendation ||
          algorithmState.kellyCriterion.currentRecommendation ||
          algorithmState.monteCarlo.currentAnalysis
        "
        :class="config.CLASSES.ALGORITHM_RESULTS"
      >
        <!-- Professional Unified Recommendation -->
        <div
          v-if="algorithmState.currentRecommendation"
          :class="config.CLASSES.UNIFIED_RECOMMENDATION"
        >
          <h4 :class="config.CLASSES.ALGORITHM_SUBTITLE">Professional Consensus</h4>
          <div :class="config.CLASSES.RECOMMENDATION_CONTENT">
            <div :class="config.CLASSES.RECOMMENDATION_BET">
              <span class="font-medium">Recommended:</span>
              <span
                v-if="algorithmState.currentRecommendation.recommendedBetType"
                :class="config.CLASSES.BET_TYPE_DISPLAY"
              >
                {{ algorithmState.currentRecommendation.recommendedBetType.toUpperCase() }}
                (${{ algorithmState.currentRecommendation.recommendedBetSize.toFixed(2) }})
              </span>
              <span v-else class="text-gray-400">No favorable bet</span>
            </div>
            <div :class="config.CLASSES.CONFIDENCE_DISPLAY">
              Confidence: {{ (algorithmState.currentRecommendation.confidence * 100).toFixed(1) }}%
            </div>
            <div :class="config.CLASSES.RATIONALE_DISPLAY">
              {{ algorithmState.currentRecommendation.rationale }}
            </div>
            <div
              v-if="algorithmState.currentRecommendation.warnings.length > 0"
              :class="config.CLASSES.WARNINGS_DISPLAY"
            >
              ⚠️ {{ algorithmState.currentRecommendation.warnings[0] }}
            </div>
          </div>
        </div>

        <!-- Kelly Criterion Results -->
        <div
          v-if="algorithmState.kellyCriterion.currentRecommendation"
          :class="config.CLASSES.KELLY_PANEL"
        >
          <h4 :class="config.CLASSES.ALGORITHM_SUBTITLE">Kelly Criterion</h4>
          <div :class="config.CLASSES.KELLY_CONTENT">
            <div :class="config.CLASSES.KELLY_BET_SIZE">
              Optimal: ${{
                algorithmState.kellyCriterion.currentRecommendation.optimalBetSize.toFixed(2)
              }}
              ({{
                (algorithmState.kellyCriterion.currentRecommendation.kellyPercentage * 100).toFixed(
                  1
                )
              }}%)
            </div>
            <div :class="config.CLASSES.KELLY_RISK">
              Risk Level: {{ algorithmState.kellyCriterion.currentRecommendation.riskLevel }}
            </div>
          </div>
        </div>

        <!-- Monte Carlo Results -->
        <div
          v-if="algorithmState.monteCarlo.currentAnalysis"
          :class="config.CLASSES.MONTE_CARLO_PANEL"
        >
          <h4 :class="config.CLASSES.ALGORITHM_SUBTITLE">Monte Carlo Analysis</h4>
          <div :class="config.CLASSES.MONTE_CARLO_CONTENT">
            <div
              v-if="algorithmState.monteCarlo.currentAnalysis.bestScenario"
              :class="config.CLASSES.MONTE_CARLO_BEST"
            >
              Best:
              {{ algorithmState.monteCarlo.currentAnalysis.bestScenario.betType.toUpperCase() }} ({{
                (
                  algorithmState.monteCarlo.currentAnalysis.bestScenario.result
                    .probabilityOfProfit * 100
                ).toFixed(1)
              }}% win rate)
            </div>
            <div :class="config.CLASSES.MONTE_CARLO_RISK">
              {{ algorithmState.monteCarlo.currentAnalysis.riskAssessment }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// CURRENT HAND SECTION - PERFECT CDD IMPLEMENTATION
// =============================================================================
// ✨ PHASE 8: Perfect headless composable integration with styled wrapper
// Preserves EXACT UI styling while using clean headless architecture
// Integrates seamlessly with PayoutSettings and BettingInterface

import { computed, ref, watch, nextTick, type ComputedRef } from 'vue';
import { useCurrentHand } from '@/composables/useCurrentHand';
import { CURRENT_HAND_SETTINGS } from '@/config/currentHandSettings';
import type { PayoutValues } from '@/config/payoutSettings';
import type { BetType } from '@/config/bettingInterfaceSettings';
import type { Card, Suit, Rank, CardValue } from '@/types/cards';

// PlayingCard component import (RESTORED)
import PlayingCard from '@/components/cards/PlayingCard.vue';

// Professional algorithms integration
import { useKellyCriterion } from '@/composables/useKellyCriterion';
import { useMonteCarloSimulation } from '@/composables/useMonteCarloSimulation';
import { useProfessionalAlgorithms } from '@/composables/useProfessionalAlgorithms';

// =============================================================================
// PROPS & EMITS
// =============================================================================

export interface CurrentHandSectionProps {
  // Required props
  currentPayoutValues: PayoutValues;
  currentBalance: number;
  currentRoundBet: {
    hasBet: boolean;
    betType: BetType | null;
    betAmount: number;
    placedAt: Date | null;
  };

  // Optional configuration
  readonly?: boolean;
  sessionActive?: boolean;
  canPerformActions?: boolean;
  autoCompleteEnabled?: boolean;
}

const props = withDefaults(defineProps<CurrentHandSectionProps>(), {
  readonly: false,
  sessionActive: true,
  canPerformActions: true,
  autoCompleteEnabled: false,
});

const emit = defineEmits<{
  'hand-completed': [winner: string, playerValue: number, bankerValue: number];
  'hand-cleared': [];
  'card-added': [position: 'player' | 'banker', card: Card];
  'card-removed': [position: 'player' | 'banker', index: number];
  'auto-complete-triggered': [];
  'algorithm-analysis-triggered': [];
  'round-completed': [result: any];
  'balance-updated': [newBalance: number];
  'bet-settled': [betResult: any];
  'payout-values-changed': [payoutValues: PayoutValues];
  'winner-determined': [winner: string, playerValue: number, bankerValue: number];
  'natural-detected': [side: string, value: number];
  'validation-error': [errors: string[]];
}>();

// =============================================================================
// AUTO-COMPLETE STATE MANAGEMENT (RESTORED from original)
// =============================================================================

const autoCompleteState = ref({
  enabled: false,
  cardCount: 6,
  timer: null as number | null,
});

// =============================================================================
// HEADLESS COMPOSABLE INTEGRATION
// =============================================================================

// Configuration
const config = CURRENT_HAND_SETTINGS;

// Professional algorithms composables
const kellyCriterion = useKellyCriterion();
const monteCarlo = useMonteCarloSimulation();
const algorithms = useProfessionalAlgorithms();

// Create props object for headless composable
const headlessProps = computed(() => ({
  currentPayoutValues: props.currentPayoutValues,
  currentBalance: props.currentBalance,
  currentRoundBet: props.currentRoundBet,
  sessionActive: props.sessionActive,
  canPerformActions: props.canPerformActions,
  autoCompleteEnabled: props.autoCompleteEnabled,
  requireBetForCompletion: true,
  showPayoutReference: false,
  showHandSummary: false,
  showNaturalHighlight: true,
  enableValidation: true,
}));

// Create emit handler for headless composable
const headlessEmit = (event: string, ...args: any[]) => {
  // Map headless events to component events
  switch (event) {
    case 'hand-completed':
      const [completionEvent] = args;
      emit(
        'hand-completed',
        completionEvent.handResult.winner,
        completionEvent.handResult.playerValue,
        completionEvent.handResult.bankerValue
      );
      break;
    case 'hand-cleared':
      emit('hand-cleared');
      break;
    case 'balance-updated':
      emit('balance-updated', args[0]);
      break;
    case 'bet-settled':
      emit('bet-settled', args[0]);
      break;
    case 'payout-values-changed':
      emit('payout-values-changed', args[0]);
      break;
    case 'winner-determined':
      emit('winner-determined', args[0], args[1], args[2]);
      break;
    case 'natural-detected':
      emit('natural-detected', args[0], args[1]);
      break;
    case 'validation-error':
      emit('validation-error', args[0]);
      break;
    default:
      console.log(`[current-hand-section] Unmapped headless event: ${event}`, args);
  }
};

// Use the headless composable
const {
  state,
  actions,
  utils,
  playerCards,
  bankerCards,
  playerValue,
  bankerValue,
  winner,
  hasNatural,
  handStatus,
  canCompleteRound,
  canClearHand,
  isLoading,
} = useCurrentHand(headlessProps.value, headlessEmit);

// =============================================================================
// COMPUTED DISPLAY STATE
// =============================================================================

const handState = computed(() => ({
  playerCards: playerCards.value,
  bankerCards: bankerCards.value,
  playerTotal: playerValue.value,
  bankerTotal: bankerValue.value,
  currentWinner: winner.value,
  hasActiveCards: playerCards.value.length > 0 || bankerCards.value.length > 0,
  isProcessing: isLoading.value,
  canCompleteRound: canCompleteRound.value,
  playerHasBet: props.currentRoundBet.hasBet && props.currentRoundBet.betType === 'player',
  bankerHasBet: props.currentRoundBet.hasBet && props.currentRoundBet.betType === 'banker',
  naturalWins: {
    player: hasNatural.value && playerValue.value >= 8 && winner.value === 'player',
    banker: hasNatural.value && bankerValue.value >= 8 && winner.value === 'banker',
  },
  pairs: {
    player: detectPairInHand(playerCards.value),
    banker: detectPairInHand(bankerCards.value),
  },
  isAutoCompleting: false,
}));

const displayState = computed(() => ({
  playerValue: playerValue.value > 0 ? playerValue.value : '-',
  bankerValue: bankerValue.value > 0 ? bankerValue.value : '-',
}));

const algorithmState = computed(() => ({
  isCalculating: algorithms.isCalculating.value,
  currentRecommendation: algorithms.currentRecommendation.value,
  kellyCriterion: {
    currentRecommendation: kellyCriterion.currentRecommendation.value,
  },
  monteCarlo: {
    currentAnalysis: monteCarlo.currentAnalysis.value,
  },
}));

// =============================================================================
// UI STATE COMPUTEDS (RESTORED from original)
// =============================================================================

const showOtherBetTypes = computed(() => {
  return (
    props.currentRoundBet.hasBet &&
    props.currentRoundBet.betType &&
    ['tie', 'playerPair', 'bankerPair'].includes(props.currentRoundBet.betType)
  );
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Helper function to detect pairs in hand
const detectPairInHand = (cards: readonly Card[]): boolean => {
  if (cards.length < 2) {
    return false;
  }
  return cards[0]?.rank === cards[1]?.rank;
};

// Helper function to generate a random card with proper typing
const generateRandomCard = (): Card => {
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];

  let value: CardValue;
  if (rank === 'A') {
    value = 1;
  } else if (['J', 'Q', 'K'].includes(rank)) {
    value = 0;
  } else {
    const numValue = parseInt(rank);
    value = (numValue >= 10 ? 0 : numValue) as CardValue;
  }

  return {
    rank,
    suit,
    value,
  };
};

// =============================================================================
// UI METHODS (RESTORED from original implementation)
// =============================================================================

const handleAutoCompleteToggle = (): void => {
  console.log('[current-hand-section] Auto-complete toggled', {
    enabled: autoCompleteState.value.enabled,
    cardCount: autoCompleteState.value.cardCount,
  });

  if (autoCompleteState.value.enabled) {
    // Check if we should auto-complete immediately
    const totalCards = handState.value.playerCards.length + handState.value.bankerCards.length;
    if (totalCards >= autoCompleteState.value.cardCount) {
      setTimeout(() => {
        autoCompleteHand();
      }, 1000);
    }
  }
};

const handleCompleteOrClear = (): void => {
  if (props.currentRoundBet.hasBet) {
    completeRound();
  } else {
    clearHand();
  }
};

const getMainActionLabel = (): string => {
  return props.currentRoundBet.hasBet ? 'Complete Round' : 'Clear Hand';
};

const canPerformMainAction = (): boolean => {
  if (!props.canPerformActions) {
    return false;
  }
  if (handState.value.isProcessing) {
    return false;
  }

  const totalCards = handState.value.playerCards.length + handState.value.bankerCards.length;

  if (props.currentRoundBet.hasBet) {
    // Can complete round if we have cards and a bet
    return totalCards >= 4;
  }
  // Can clear hand if we have any cards
  return totalCards > 0;
};

const getCurrentWinner = (): string => {
  if (!handState.value.currentWinner) {
    return 'TBD';
  }

  switch (handState.value.currentWinner) {
    case 'player':
      return 'Player';
    case 'banker':
      return 'Banker';
    case 'tie':
      return 'Tie';
    default:
      return 'TBD';
  }
};

const getCurrentWinnerClass = (): string => {
  if (!handState.value.currentWinner) {
    return 'text-gray-500';
  }

  switch (handState.value.currentWinner) {
    case 'player':
      return 'text-blue-600';
    case 'banker':
      return 'text-red-600';
    case 'tie':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
};

const getHandStatus = (): string => {
  const totalCards = handState.value.playerCards.length + handState.value.bankerCards.length;

  if (totalCards === 0) {
    return 'Ready';
  }
  if (handState.value.naturalWins.player || handState.value.naturalWins.banker) {
    return 'Natural';
  }
  if (totalCards >= 4) {
    return 'Complete';
  }
  return 'In Progress';
};

const getOtherBetTypeLabel = (): string => {
  switch (props.currentRoundBet.betType) {
    case 'tie':
      return 'Tie Bet';
    case 'playerPair':
      return 'Player Pair Bet';
    case 'bankerPair':
      return 'Banker Pair Bet';
    default:
      return 'Other Bet';
  }
};

const getOtherBetTypeClasses = (): string => {
  switch (props.currentRoundBet.betType) {
    case 'tie':
      return 'bg-green-50 border-green-400 shadow-lg ring-2 ring-green-300';
    case 'playerPair':
      return 'bg-purple-50 border-purple-400 shadow-lg ring-2 ring-purple-300';
    case 'bankerPair':
      return 'bg-orange-50 border-orange-400 shadow-lg ring-2 ring-orange-300';
    default:
      return 'border-gray-200';
  }
};

const getOtherBetTypeBadgeClasses = (): string => {
  switch (props.currentRoundBet.betType) {
    case 'tie':
      return 'bg-green-600';
    case 'playerPair':
      return 'bg-purple-600';
    case 'bankerPair':
      return 'bg-orange-600';
    default:
      return 'bg-gray-600';
  }
};

// =============================================================================
// ACTION METHODS
// =============================================================================

const addCard = (position: 'player' | 'banker') => {
  if (actions.addCard) {
    const card = generateRandomCard();
    actions.addCard(card, position);
    emit('card-added', position, card);

    // Check for auto-complete
    if (autoCompleteState.value.enabled) {
      const totalCards =
        handState.value.playerCards.length + handState.value.bankerCards.length + 1;
      if (totalCards >= autoCompleteState.value.cardCount) {
        setTimeout(() => {
          autoCompleteHand();
        }, 1000);
      }
    }

    return card;
  }
  console.warn('[current-hand-section] addCard method not available');
  return null;
};

const removeCard = (position: 'player' | 'banker', index: number) => {
  // Since there's no removeCard action, we'll simulate it by re-dealing the cards
  if (position === 'player' && playerCards.value.length > index) {
    const newCards = [...playerCards.value];
    newCards.splice(index, 1);
    actions.dealCards(newCards as Card[], [...bankerCards.value] as Card[]);
    emit('card-removed', position, index);
  } else if (position === 'banker' && bankerCards.value.length > index) {
    const newCards = [...bankerCards.value];
    newCards.splice(index, 1);
    actions.dealCards([...playerCards.value] as Card[], newCards as Card[]);
    emit('card-removed', position, index);
  }
};

const clearHand = () => {
  if (actions.clearHand) {
    actions.clearHand();
    emit('hand-cleared');
  }
};

const completeRound = () => {
  if (actions.completeRound) {
    actions.completeRound();
    return { winner: winner.value, playerValue: playerValue.value, bankerValue: bankerValue.value };
  }
  return null;
};

const autoCompleteHand = () => {
  console.log('[current-hand-section] Auto-completing hand');

  const currentPlayerCards = handState.value.playerCards.length;
  const currentBankerCards = handState.value.bankerCards.length;
  const totalCards = currentPlayerCards + currentBankerCards;

  // Complete to minimum 4 cards if less than that
  const targetCards = Math.max(4, totalCards);

  while (handState.value.playerCards.length + handState.value.bankerCards.length < targetCards) {
    // Alternate adding cards to player and banker
    const shouldAddToPlayer =
      handState.value.playerCards.length <= handState.value.bankerCards.length;
    if (shouldAddToPlayer && handState.value.playerCards.length < 3) {
      addCard('player');
    } else if (handState.value.bankerCards.length < 3) {
      addCard('banker');
    } else {
      break; // Both sides have 3 cards
    }
  }

  if (actions.triggerAutoComplete) {
    actions.triggerAutoComplete();
  }

  emit('auto-complete-triggered');
};

const triggerAlgorithmAnalysis = () => {
  console.log('[current-hand-section] Algorithm analysis triggered');

  // Trigger Kelly Criterion calculation
  if (kellyCriterion.calculateOptimalKellyRecommendation && props.currentBalance > 0) {
    kellyCriterion.calculateOptimalKellyRecommendation(
      props.currentPayoutValues,
      props.currentBalance
    );
  }

  // Trigger Monte Carlo simulation
  if (monteCarlo.runComprehensiveAnalysis && props.currentBalance > 0) {
    monteCarlo.runComprehensiveAnalysis(props.currentPayoutValues, props.currentBalance);
  }

  // Trigger unified professional algorithm analysis
  if (algorithms.calculateUnifiedRecommendation && props.currentBalance > 0) {
    algorithms.calculateUnifiedRecommendation(props.currentPayoutValues, props.currentBalance);
  }

  // Legacy action triggers for compatibility
  if (actions.requestKellyCalculation) {
    actions.requestKellyCalculation();
  }
  if (actions.requestMonteCarloAssessment) {
    actions.requestMonteCarloAssessment();
  }

  emit('algorithm-analysis-triggered');
};

// =============================================================================
// AUTO-COMPLETE WATCHER (RESTORED from original)
// =============================================================================

// Watch for card count and auto-complete if enabled
watch(
  () => handState.value.playerCards.length + handState.value.bankerCards.length,
  totalCards => {
    if (totalCards >= autoCompleteState.value.cardCount && autoCompleteState.value.enabled) {
      // Auto-complete the round after a short delay
      if (autoCompleteState.value.timer) {
        clearTimeout(autoCompleteState.value.timer);
      }

      autoCompleteState.value.timer = setTimeout(() => {
        autoCompleteHand();
      }, 1000) as unknown as number;
    }
  }
);
</script>

<style scoped>
/* =============================================================================
CURRENT HAND SECTION STYLES - PRESERVES EXACT ORIGINAL STYLING
============================================================================== */
/* No custom styles needed - all styling handled through Tailwind classes in config */
/* This ensures exact preservation of original UI appearance */
</style>
