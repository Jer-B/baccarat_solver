<template>
  <!-- =============================================================================
  CURRENT HAND SECTION - PERFECT CDD IMPLEMENTATION 
  ============================================================================== -->
  <!-- ✨ PHASE 8: Perfect CDD with headless composable + styled wrapper -->
  <!-- Preserves EXACT current UI styling while using headless useCurrentHand composable -->
  <!-- Integrates with PayoutSettings and BettingInterface for real-time functionality -->

  <div :class="config.CLASSES.CONTAINER">
    <!-- Header Section with Auto-complete and Controls -->
    <div :class="config.CLASSES.HEADER">
      <h2 :class="config.CLASSES.TITLE">{{ config.LABELS.COMPONENT_TITLE }}</h2>

      <!-- Auto-complete Button (preserves EXACT original styling) -->
      <button
        @click="autoCompleteHand"
        :disabled="handState.isAutoCompleting || !handState.hasActiveCards"
        :class="config.CLASSES.AUTO_COMPLETE_BUTTON"
        :title="config.LABELS.AUTO_COMPLETE_TOOLTIP"
      >
        <span v-if="handState.isAutoCompleting" class="animate-spin">⟳</span>
        <span v-else>🎲</span>
        {{ config.LABELS.AUTO_COMPLETE_BUTTON }}
      </button>
    </div>

    <!-- Current Hand Display -->
    <div :class="config.CLASSES.HAND_CONTAINER">
      <!-- Player Hand -->
      <div :class="config.CLASSES.PLAYER_SECTION">
        <div :class="config.CLASSES.HAND_HEADER">
          <h3 :class="[config.CLASSES.HAND_TITLE, handState.playerHasBet ? 'text-blue-400' : '']">
            {{ config.LABELS.PLAYER_TITLE }}
          </h3>
          <div :class="config.CLASSES.HAND_VALUE">
            {{ displayState.playerValue }}
          </div>
        </div>

        <!-- Player Cards -->
        <div :class="config.CLASSES.CARDS_CONTAINER">
          <div
            v-for="(card, index) in handState.playerCards"
            :key="`player-${index}`"
            :class="[
              config.CLASSES.CARD_SLOT,
              handState.naturalWins.player ? 'ring-2 ring-yellow-400' : '',
            ]"
            @click="() => removeCard('player', index)"
            :title="config.LABELS.CARD_REMOVE_TOOLTIP"
          >
            {{ `${card.rank}${card.suit}` }}
          </div>

          <!-- Empty slots -->
          <div
            v-for="slot in 3 - handState.playerCards.length"
            :key="`player-empty-${slot}`"
            :class="config.CLASSES.EMPTY_CARD_SLOT"
            @click="() => addCard('player')"
            :title="config.LABELS.CARD_ADD_TOOLTIP"
          >
            +
          </div>
        </div>
      </div>

      <!-- Banker Hand -->
      <div :class="config.CLASSES.BANKER_SECTION">
        <div :class="config.CLASSES.HAND_HEADER">
          <h3 :class="[config.CLASSES.HAND_TITLE, handState.bankerHasBet ? 'text-red-400' : '']">
            {{ config.LABELS.BANKER_TITLE }}
          </h3>
          <div :class="config.CLASSES.HAND_VALUE">
            {{ displayState.bankerValue }}
          </div>
        </div>

        <!-- Banker Cards -->
        <div :class="config.CLASSES.CARDS_CONTAINER">
          <div
            v-for="(card, index) in handState.bankerCards"
            :key="`banker-${index}`"
            :class="[
              config.CLASSES.CARD_SLOT,
              handState.naturalWins.banker ? 'ring-2 ring-yellow-400' : '',
            ]"
            @click="() => removeCard('banker', index)"
            :title="config.LABELS.CARD_REMOVE_TOOLTIP"
          >
            {{ `${card.rank}${card.suit}` }}
          </div>

          <!-- Empty slots -->
          <div
            v-for="slot in 3 - handState.bankerCards.length"
            :key="`banker-empty-${slot}`"
            :class="config.CLASSES.EMPTY_CARD_SLOT"
            @click="() => addCard('banker')"
            :title="config.LABELS.CARD_ADD_TOOLTIP"
          >
            +
          </div>
        </div>
      </div>
    </div>

    <!-- Hand Status and Results -->
    <div v-if="handState.hasActiveCards" :class="config.CLASSES.STATUS_CONTAINER">
      <!-- Winner Display -->
      <div v-if="handState.currentWinner !== null" :class="config.CLASSES.WINNER_DISPLAY">
        <div
          :class="[
            config.CLASSES.WINNER_TEXT,
            handState.currentWinner === 'player'
              ? 'text-blue-400'
              : handState.currentWinner === 'banker'
                ? 'text-red-400'
                : 'text-purple-400',
          ]"
        >
          Winner:
          {{
            handState.currentWinner === 'player'
              ? '閑 Player'
              : handState.currentWinner === 'banker'
                ? '庄 Banker'
                : 'Tie'
          }}
          <span
            v-if="handState.naturalWins.player || handState.naturalWins.banker"
            :class="config.CLASSES.NATURAL_INDICATOR"
          >
            (Natural!)
          </span>
        </div>
      </div>

      <!-- Pair Detection -->
      <div
        v-if="handState.pairs.player || handState.pairs.banker"
        :class="config.CLASSES.PAIRS_DISPLAY"
      >
        <span v-if="handState.pairs.player" :class="config.CLASSES.PAIR_INDICATOR">
          Player Pair
        </span>
        <span v-if="handState.pairs.banker" :class="config.CLASSES.PAIR_INDICATOR">
          Banker Pair
        </span>
      </div>
    </div>

    <!-- Professional Algorithm Analysis Panel -->
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

    <!-- Action Buttons (preserves EXACT original styling) -->
    <div :class="config.CLASSES.ACTIONS_CONTAINER">
      <!-- Complete Round Button -->
      <button
        v-if="handState.canCompleteRound"
        @click="completeRound"
        :disabled="handState.isProcessing"
        :class="config.CLASSES.COMPLETE_BUTTON"
        :title="config.LABELS.COMPLETE_TOOLTIP"
      >
        <span v-if="handState.isProcessing" class="animate-spin mr-2">⟳</span>
        {{ config.LABELS.COMPLETE_BUTTON }}
      </button>

      <!-- Clear Hand Button -->
      <button
        @click="clearHand"
        :disabled="handState.isProcessing"
        :class="config.CLASSES.CLEAR_BUTTON"
        :title="config.LABELS.CLEAR_TOOLTIP"
      >
        {{ config.LABELS.CLEAR_BUTTON }}
      </button>
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

import { computed, type ComputedRef } from 'vue';
import { useCurrentHand } from '@/composables/useCurrentHand';
import { CURRENT_HAND_SETTINGS } from '@/config/currentHandSettings';
import type { PayoutValues } from '@/config/payoutSettings';
import type { BetType } from '@/config/bettingInterfaceSettings';
import type { Card, Suit, Rank, CardValue } from '@/types/cards';

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
}

const props = withDefaults(defineProps<CurrentHandSectionProps>(), {
  readonly: false,
  sessionActive: true,
  canPerformActions: true,
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
}>();

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
  autoCompleteEnabled: false,
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
// HELPER FUNCTIONS
// =============================================================================

// Helper function to detect pairs in hand
const detectPairInHand = (cards: readonly Card[]): boolean => {
  if (cards.length < 2) return false;
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
// ACTION METHODS
// =============================================================================

const addCard = (position: 'player' | 'banker') => {
  if (actions.addCard) {
    const card = generateRandomCard();
    actions.addCard(card, position);
    emit('card-added', position, card);
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
  if (actions.triggerAutoComplete) {
    actions.triggerAutoComplete();
    emit('auto-complete-triggered');
  }
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
</script>

<style scoped>
/* =============================================================================
CURRENT HAND SECTION STYLES - PRESERVES EXACT ORIGINAL STYLING
============================================================================== */
/* No custom styles needed - all styling handled through Tailwind classes in config */
/* This ensures exact preservation of original UI appearance */
</style>
