<template>
  <!-- =============================================================================
  CURRENT HAND SECTION - CDD STYLED WRAPPER
  ============================================================================== -->
  <!-- Preserves exact current UI styling while using headless CurrentHand primitive -->
  <!-- Integrates with PayoutSettings and BettingInterface for real-time functionality -->

  <CurrentHand
    :current-payout-values="currentPayoutValues"
    :current-balance="currentBalance"
    :current-round-bet="currentRoundBet"
    :session-active="sessionActive"
    :can-perform-actions="canPerformActions"
    :auto-complete-enabled="autoCompleteEnabled"
    :auto-complete-card-count="6"
    :auto-complete-delay="1000"
    :show-payout-reference="true"
    :show-hand-summary="true"
    :show-natural-highlight="true"
    :enable-validation="true"
    :require-bet-for-completion="true"
    :handlers="integrationHandlers"
    @hand-completed="handleHandCompleted"
    @hand-cleared="handleHandCleared"
    @balance-updated="handleBalanceUpdated"
    @bet-settled="handleBetSettled"
    @payout-values-changed="handlePayoutValuesChanged"
    @winner-determined="handleWinnerDetermined"
    @natural-detected="handleNaturalDetected"
    @validation-error="handleValidationError"
  >
    <template #default="{ state, actions, utils, config }">
      <!-- EXACT CURRENT UI PRESERVATION -->
      <div :class="config.STYLING.MAIN_CONTAINER">
        <!-- Header Section with Auto-complete and Complete Round Button -->
        <div :class="config.STYLING.HEADER_CONTAINER">
          <h2 :class="config.STYLING.MAIN_TITLE">{{ config.LABELS.MAIN_TITLE }}</h2>
          <div :class="config.STYLING.CONTROLS_CONTAINER">
            <!-- Auto-complete Checkbox -->
            <label :class="config.STYLING.AUTO_COMPLETE_LABEL">
              <input
                type="checkbox"
                :checked="state.autoComplete.enabled"
                @change="actions.enableAutoComplete"
                :class="config.STYLING.AUTO_COMPLETE_CHECKBOX"
              />
              <span :class="config.STYLING.AUTO_COMPLETE_TEXT">
                {{ config.LABELS.AUTO_COMPLETE_LABEL }}
              </span>
            </label>

            <!-- Complete Round / Clear Hand Button -->
            <button
              @click="handleCompleteOrClear(state, actions)"
              :class="[
                config.STYLING.COMPLETE_BUTTON_BASE,
                state.round.canCompleteRound || state.round.canClearHand
                  ? config.COLORS.COMPLETE_ENABLED
                  : config.COLORS.COMPLETE_DISABLED,
              ]"
              :disabled="!state.round.canCompleteRound && !state.round.canClearHand"
            >
              {{ getCompleteButtonText(state) }}
            </button>
          </div>
        </div>

        <!-- Player/Banker Grid -->
        <div :class="config.STYLING.HAND_GRID">
          <!-- Player Side -->
          <div
            :class="[
              config.STYLING.SIDE_CONTAINER_BASE,
              state.round.hasBet && state.round.betType === 'player'
                ? config.COLORS.PLAYER_BET_ACTIVE
                : config.COLORS.PLAYER_DEFAULT_BORDER,
            ]"
          >
            <div :class="config.STYLING.SIDE_HEADER">
              <div :class="config.STYLING.SIDE_TITLE_CONTAINER">
                <h3 :class="config.STYLING.SIDE_TITLE">{{ config.LABELS.PLAYER_TITLE }}</h3>
                <!-- Player Kanji SVG -->
                <svg :class="config.STYLING.KANJI_SVG" class="text-blue-600">
                  <text :class="config.STYLING.KANJI_TEXT">
                    {{ config.LABELS.PLAYER_KANJI }}
                  </text>
                </svg>
                <!-- Bet Amount Display -->
                <div
                  v-if="state.round.hasBet && state.round.betType === 'player'"
                  :class="[config.STYLING.BET_AMOUNT_BADGE_BASE, config.COLORS.PLAYER_BET_BADGE]"
                >
                  {{ utils.formatCurrency(state.round.betAmount) }}
                </div>
              </div>
              <div :class="config.STYLING.SIDE_VALUE_CONTAINER">
                <div
                  :class="[
                    config.STYLING.HAND_VALUE_BASE,
                    state.playerCards.length > 0
                      ? config.COLORS.PLAYER_VALUE_ACTIVE
                      : config.COLORS.PLAYER_VALUE_INACTIVE,
                    state.playerValue >= 8 && state.playerCards.length > 0
                      ? config.COLORS.PLAYER_NATURAL_HIGHLIGHT
                      : '',
                  ]"
                >
                  {{ state.playerCards.length > 0 ? state.playerValue : '-' }}
                </div>
                <div
                  v-if="state.playerValue >= 8 && state.playerCards.length > 0"
                  :class="config.STYLING.NATURAL_INDICATOR"
                >
                  {{ config.LABELS.NATURAL_INDICATOR }}
                </div>
              </div>
            </div>
            <div :class="config.STYLING.SIDE_CARDS_CONTAINER">
              <PlayingCard
                v-for="(card, index) in state.playerCards"
                :key="index"
                :card="card"
                size="medium"
                :horizontal="index === 2"
              />
              <PlayingCard v-if="state.playerCards.length === 0" is-card-back size="medium" />
            </div>
          </div>

          <!-- Banker Side -->
          <div
            :class="[
              config.STYLING.SIDE_CONTAINER_BASE,
              state.round.hasBet && state.round.betType === 'banker'
                ? config.COLORS.BANKER_BET_ACTIVE
                : config.COLORS.BANKER_DEFAULT_BORDER,
            ]"
          >
            <div :class="config.STYLING.SIDE_HEADER">
              <div :class="config.STYLING.SIDE_TITLE_CONTAINER">
                <h3 :class="config.STYLING.SIDE_TITLE">{{ config.LABELS.BANKER_TITLE }}</h3>
                <!-- Banker Kanji SVG -->
                <svg :class="config.STYLING.KANJI_SVG" class="text-red-600">
                  <text :class="config.STYLING.KANJI_TEXT">
                    {{ config.LABELS.BANKER_KANJI }}
                  </text>
                </svg>
                <!-- Bet Amount Display -->
                <div
                  v-if="state.round.hasBet && state.round.betType === 'banker'"
                  :class="[config.STYLING.BET_AMOUNT_BADGE_BASE, config.COLORS.BANKER_BET_BADGE]"
                >
                  {{ utils.formatCurrency(state.round.betAmount) }}
                </div>
              </div>
              <div :class="config.STYLING.SIDE_VALUE_CONTAINER">
                <div
                  :class="[
                    config.STYLING.HAND_VALUE_BASE,
                    state.bankerCards.length > 0
                      ? config.COLORS.BANKER_VALUE_ACTIVE
                      : config.COLORS.BANKER_VALUE_INACTIVE,
                    state.bankerValue >= 8 && state.bankerCards.length > 0
                      ? config.COLORS.BANKER_NATURAL_HIGHLIGHT
                      : '',
                  ]"
                >
                  {{ state.bankerCards.length > 0 ? state.bankerValue : '-' }}
                </div>
                <div
                  v-if="state.bankerValue >= 8 && state.bankerCards.length > 0"
                  :class="config.STYLING.NATURAL_INDICATOR"
                >
                  {{ config.LABELS.NATURAL_INDICATOR }}
                </div>
              </div>
            </div>
            <div :class="config.STYLING.SIDE_CARDS_CONTAINER">
              <PlayingCard
                v-for="(card, index) in state.bankerCards"
                :key="index"
                :card="card"
                size="medium"
                :horizontal="index === 2"
              />
              <PlayingCard v-if="state.bankerCards.length === 0" is-card-back size="medium" />
            </div>
          </div>
        </div>

        <!-- Other Bet Types Display -->
        <div
          v-if="shouldShowOtherBetTypes(state)"
          :class="[
            config.STYLING.OTHER_BETS_CONTAINER,
            getOtherBetTypeClasses(state.round.betType),
          ]"
        >
          <div :class="config.STYLING.OTHER_BETS_CONTENT">
            <span :class="config.STYLING.OTHER_BET_LABEL">
              {{ getOtherBetTypeLabel(state.round.betType) }}:
            </span>
            <div
              :class="[
                config.STYLING.OTHER_BET_AMOUNT,
                getOtherBetTypeBadgeClasses(state.round.betType),
              ]"
            >
              {{ utils.formatCurrency(state.round.betAmount) }}
            </div>
          </div>
        </div>

        <!-- Hand Summary -->
        <div v-if="shouldShowHandSummary(state)" :class="config.STYLING.SUMMARY_CONTAINER">
          <div :class="config.STYLING.SUMMARY_GRID">
            <div :class="config.STYLING.SUMMARY_ITEM">
              <div :class="config.STYLING.SUMMARY_LABEL">
                {{ config.LABELS.CURRENT_WINNER_LABEL }}
              </div>
              <div
                :class="[
                  config.STYLING.SUMMARY_VALUE,
                  utils.getWinnerClass(state.summary.currentWinner),
                ]"
              >
                {{ state.summary.currentWinner }}
              </div>
            </div>
            <div :class="config.STYLING.SUMMARY_ITEM">
              <div :class="config.STYLING.SUMMARY_LABEL">{{ config.LABELS.CARDS_DEALT_LABEL }}</div>
              <div :class="config.STYLING.SUMMARY_VALUE">
                {{ state.summary.cardsDealt }}
              </div>
            </div>
            <div :class="config.STYLING.SUMMARY_ITEM">
              <div :class="config.STYLING.SUMMARY_LABEL">{{ config.LABELS.HAND_STATUS_LABEL }}</div>
              <div :class="config.STYLING.SUMMARY_VALUE">
                {{
                  utils.formatHandStatus(
                    state.playerCards,
                    state.bankerCards,
                    state.playerValue,
                    state.bankerValue
                  )
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- Live Payout Reference (from PayoutSettings) -->
        <div v-if="state.payout.showReference" :class="config.STYLING.PAYOUT_REFERENCE_CONTAINER">
          <h4 :class="config.STYLING.PAYOUT_REFERENCE_TITLE">
            {{ config.ICONS.MONEY_EMOJI }} {{ config.LABELS.PAYOUT_REFERENCE_TITLE }}
          </h4>
          <div :class="config.STYLING.PAYOUT_REFERENCE_GRID">
            <div :class="config.STYLING.PAYOUT_REFERENCE_COLUMN">
              <div :class="config.STYLING.PAYOUT_REFERENCE_ROW">
                <span :class="config.COLORS.PLAYER_PAYOUT_TEXT">{{
                  config.LABELS.PLAYER_PAYOUT_LABEL
                }}</span>
                <span>{{ state.payout.reference.player }}</span>
              </div>
              <div :class="config.STYLING.PAYOUT_REFERENCE_ROW">
                <span :class="config.COLORS.BANKER_PAYOUT_TEXT">{{
                  config.LABELS.BANKER_PAYOUT_LABEL
                }}</span>
                <span
                  >{{ state.payout.reference.banker }} (-{{
                    state.payout.reference.bankerCommission
                  }})</span
                >
              </div>
            </div>
            <div :class="config.STYLING.PAYOUT_REFERENCE_COLUMN">
              <div :class="config.STYLING.PAYOUT_REFERENCE_ROW">
                <span :class="config.COLORS.TIE_PAYOUT_TEXT">{{
                  config.LABELS.TIE_PAYOUT_LABEL
                }}</span>
                <span>{{ state.payout.reference.tie }}</span>
              </div>
              <div :class="config.STYLING.PAYOUT_REFERENCE_ROW">
                <span :class="config.COLORS.PAIR_PAYOUT_TEXT">{{
                  config.LABELS.PAIRS_PAYOUT_LABEL
                }}</span>
                <span>{{ state.payout.reference.playerPair }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Algorithm Recommendations -->
        <div
          v-if="professionalRecommendation && (kellyRecommendation || monteCarloAnalysis)"
          class="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 space-y-3"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-purple-800 flex items-center gap-2">
              🧮 Professional Analysis
              <span
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  algorithmStatus.color === 'green'
                    ? 'bg-green-100 text-green-700'
                    : algorithmStatus.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-700'
                      : algorithmStatus.color === 'blue'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700',
                ]"
              >
                {{ algorithmStatus.status.replace('_', ' ').toUpperCase() }}
              </span>
            </h3>
            <button
              @click="handleCalculateAlgorithms"
              :disabled="algorithms.isCalculating.value"
              class="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              {{ algorithms.isCalculating.value ? 'Calculating...' : 'Recalculate' }}
            </button>
          </div>

          <!-- Algorithm Recommendation Summary -->
          <div
            v-if="professionalRecommendation && professionalRecommendation.recommendedBetType"
            class="bg-white rounded-lg p-3 border border-purple-100"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Recommendation:</span>
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded',
                  professionalRecommendation.confidence > 0.8
                    ? 'bg-green-100 text-green-800'
                    : professionalRecommendation.confidence > 0.6
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800',
                ]"
              >
                {{ (professionalRecommendation.confidence * 100).toFixed(0) }}% Confidence
              </span>
            </div>
            <div class="text-lg font-bold text-purple-800 mb-1">
              {{ professionalRecommendation.recommendedBetType.toUpperCase() }}: ${{
                professionalRecommendation.recommendedBetSize.toFixed(2)
              }}
            </div>
            <div class="text-sm text-gray-600">{{ professionalRecommendation.rationale }}</div>
            <div
              v-if="professionalRecommendation.warnings.length > 0"
              class="mt-2 text-xs text-orange-600"
            >
              ⚠️ {{ professionalRecommendation.warnings[0] }}
            </div>
          </div>

          <!-- No Recommendation State -->
          <div
            v-else-if="professionalRecommendation"
            class="bg-white rounded-lg p-3 border border-gray-200 text-center"
          >
            <div class="text-sm text-gray-600 mb-1">No favorable opportunities detected</div>
            <div class="text-xs text-gray-500">{{ algorithms.getProfessionalAdvice() }}</div>
          </div>

          <!-- Algorithm Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- Kelly Criterion -->
            <div v-if="kellyRecommendation" class="bg-white rounded border border-gray-200 p-3">
              <div class="text-xs font-semibold text-gray-700 mb-2">📊 Kelly Criterion</div>
              <div class="space-y-1">
                <div class="text-sm">
                  {{
                    kellyRecommendation.recommendedBetType
                      ? kellyRecommendation.recommendedBetType.toUpperCase()
                      : 'No bet'
                  }}
                </div>
                <div class="text-xs text-gray-600">
                  ${{ kellyRecommendation.optimalBetSize.toFixed(2) }} ({{
                    (kellyRecommendation.kellyPercentage * 100).toFixed(1)
                  }}%)
                </div>
                <div class="text-xs">Risk: {{ kellyRecommendation.riskLevel }}</div>
              </div>
            </div>

            <!-- Monte Carlo -->
            <div
              v-if="monteCarloAnalysis && monteCarloAnalysis.bestScenario"
              class="bg-white rounded border border-gray-200 p-3"
            >
              <div class="text-xs font-semibold text-gray-700 mb-2">🎲 Monte Carlo</div>
              <div class="space-y-1">
                <div class="text-sm">
                  {{ monteCarloAnalysis.bestScenario.betType.toUpperCase() }}
                </div>
                <div class="text-xs text-gray-600">
                  {{
                    (monteCarloAnalysis.bestScenario.result.probabilityOfProfit * 100).toFixed(1)
                  }}% Win Rate
                </div>
                <div class="text-xs">Risk: {{ monteCarloAnalysis.bestScenario.riskLevel }}</div>
              </div>
            </div>

            <!-- Burn Analysis -->
            <div v-if="burnAnalysisMetadata" class="bg-white rounded border border-gray-200 p-3">
              <div class="text-xs font-semibold text-gray-700 mb-2">🔥 Burn Analysis</div>
              <div class="space-y-1">
                <div class="text-sm">
                  {{ burnAnalysisMetadata.weightedEdgeImpact > 0 ? 'Favorable' : 'Unfavorable' }}
                </div>
                <div class="text-xs text-gray-600">
                  {{ (Math.abs(burnAnalysisMetadata.weightedEdgeImpact) * 100).toFixed(2) }}% Impact
                </div>
                <div class="text-xs">
                  Edge Multiplier: {{ burnAnalysisMetadata.kellyMultiplier.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </CurrentHand>
</template>

<script setup lang="ts">
// =============================================================================
// IMPORTS
// =============================================================================

// Vue composition API
import { computed, ref, watch } from 'vue';

// External libraries
import { useToast } from 'vue-toastification';

// Stores
import { useBaccaratStore } from '@/stores/baccaratStore';

// Composables
import { useBalanceManagement } from '@/composables/useBalanceManagement';
import { useProfessionalAlgorithms } from '@/composables/useProfessionalAlgorithms';

// Component imports
import CurrentHand from '@/design-system/primitives/CurrentHand/CurrentHand.vue';

// Configuration
import { CURRENT_HAND_SETTINGS } from '@/config/currentHandSettings';

// Type imports
import type { CurrentHandSlotProps } from '@/design-system/primitives/CurrentHand';
import type { HandResult } from '@/types/cards';
import type { PayoutValues } from '@/config/payoutSettings';
import type { BetType } from '@/config/bettingInterfaceSettings';
import type { BetResult } from '@/services/bettingService';

// =============================================================================
// PROPS AND EMITS
// =============================================================================

interface CurrentHandSectionProps {
  // PayoutSettings integration
  currentPayoutValues: PayoutValues;

  // BettingInterface integration
  currentBalance: number;
  currentRoundBet: {
    hasBet: boolean;
    betType: BetType | null;
    betAmount: number;
    placedAt: Date | null;
  };

  // Session Control integration
  sessionActive?: boolean;
  canPerformActions?: boolean;

  // Display configuration
  autoCompleteEnabled?: boolean;
}

const props = withDefaults(defineProps<CurrentHandSectionProps>(), {
  sessionActive: false,
  canPerformActions: true,
  autoCompleteEnabled: false,
});

interface CurrentHandSectionEmits {
  // Hand lifecycle events
  'hand-completed': [handResult: HandResult, betResult?: BetResult];
  'hand-cleared': [];

  // Integration events
  'balance-updated': [newBalance: number];
  'bet-settled': [betResult: BetResult];
  'payout-values-changed': [payoutValues: PayoutValues];

  // Game events
  'winner-determined': [
    winner: 'player' | 'banker' | 'tie',
    playerValue: number,
    bankerValue: number,
  ];
  'natural-detected': [side: 'player' | 'banker', value: number];

  // Error events
  'validation-error': [errors: string[]];
}

const emit = defineEmits<CurrentHandSectionEmits>();

// =============================================================================
// STORE AND DEPENDENCIES
// =============================================================================

const store = useBaccaratStore();
const toast = useToast();

// ✨ NEW: Balance management integration (Phase 5)
const balanceManager = useBalanceManagement();

// ✨ NEW: Professional algorithms integration (Phase 6)
const algorithms = useProfessionalAlgorithms();

// =============================================================================
// PROFESSIONAL ALGORITHMS STATE
// =============================================================================

// Professional algorithms computed properties - access the correct structure
const professionalRecommendation = computed(() => algorithms.currentRecommendation.value);
const kellyRecommendation = computed(() => algorithms.kellyCriterion.currentRecommendation);
const monteCarloAnalysis = computed(() => algorithms.monteCarlo.currentAnalysis);
const algorithmStatus = computed(() => algorithms.algorithmStatus.value);
const burnAnalysisMetadata = computed(() => store.burnAnalysisMetadata);

// Algorithm calculation handler
const handleCalculateAlgorithms = async () => {
  if (!props.currentPayoutValues || props.currentBalance <= 0) {
    console.warn(
      '[current-hand-section][algorithms] Cannot calculate - missing payout values or zero balance'
    );
    return;
  }

  console.log('[current-hand-section][algorithms] Triggering professional algorithm calculation');

  try {
    await algorithms.calculateUnifiedRecommendation(
      props.currentPayoutValues,
      props.currentBalance
    );
  } catch (error) {
    console.error('[current-hand-section][algorithms] Algorithm calculation failed', error);
    toast.error('Failed to calculate professional recommendations');
  }
};

// Auto-calculate algorithms when payout values or balance change
watch(
  () => [props.currentPayoutValues, props.currentBalance],
  async ([payoutValues, balance]) => {
    if (
      payoutValues &&
      typeof balance === 'number' &&
      balance > 0 &&
      algorithms.needsRecalculation()
    ) {
      console.log(
        '[current-hand-section][algorithms] Auto-calculating algorithms due to data changes'
      );
      await handleCalculateAlgorithms();
    }
  },
  { deep: true }
);

// =============================================================================
// INTEGRATION HANDLERS
// =============================================================================

const integrationHandlers = computed(() => ({
  // PayoutSettings integration
  onPayoutChange: (payoutValues: PayoutValues) => {
    console.log('[current-hand-section][payout-integration] Payout values changed', payoutValues);
    emit('payout-values-changed', payoutValues);
  },

  // ✨ UPDATED: BettingInterface integration with balance management
  onBalanceUpdate: (newBalance: number) => {
    console.log('[current-hand-section][betting-integration] Balance updated', newBalance);

    // Use balance manager for centralized balance tracking
    balanceManager.updateBalance(newBalance, 'round_completion');
    emit('balance-updated', newBalance);
  },

  onBetSettlement: (betResult: BetResult) => {
    console.log('[current-hand-section][betting-integration] Bet settled', {
      betResult,
    });

    // ✨ NEW: Use balance manager for bet settlement
    // We'll create a mock HandResult since the primitive will provide the actual one
    const mockHandResult: HandResult = {
      player: [],
      banker: [],
      winner: betResult.won ? 'player' : 'banker',
      playerPair: false,
      bankerPair: false,
      playerTotal: 0,
      bankerTotal: 0,
      natural: false,
      timestamp: Date.now(),
      handNumber: 1,
    };

    balanceManager.handleBetSettlement(betResult, mockHandResult);
    emit('bet-settled', betResult);

    // Show enhanced toast notification with balance context
    const profitLoss = balanceManager.sessionProfitLoss.value;
    const balanceStatusText =
      profitLoss >= 0
        ? `(+$${profitLoss.toFixed(2)} session)`
        : `(-$${Math.abs(profitLoss).toFixed(2)} session)`;

    if (betResult.won) {
      toast.success(`🎉 Won $${betResult.payout.toFixed(2)}! ${balanceStatusText}`, {
        timeout: 4000,
      });
    } else {
      toast.warning(`💸 Lost $${Math.abs(betResult.netResult).toFixed(2)} ${balanceStatusText}`, {
        timeout: 3000,
      });
    }
  },

  // Session Control integration
  onRoundCompletion: (handResult: HandResult) => {
    console.log('[current-hand-section][session-integration] Round completed', handResult);

    // ✨ NEW: Update balance statistics in balance manager
    if (balanceManager.balanceStatistics.value.totalRounds > 0) {
      console.log('[current-hand-section][session-stats] Balance statistics updated', {
        totalRounds: balanceManager.balanceStatistics.value.totalRounds,
        winRate: balanceManager.balanceStatistics.value.winRate.toFixed(1),
        sessionProfitLoss: balanceManager.sessionProfitLoss.value,
      });
    }

    // Additional session-level handling if needed
  },
}));

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleHandCompleted = (event: any) => {
  console.log('[current-hand-section][event] Hand completed', event);
  emit('hand-completed', event.handResult, event.betResult);

  // Store integration - update hand history
  if (event.handResult) {
    // TODO: Add to hand history via store
  }
};

const handleHandCleared = () => {
  console.log('[current-hand-section][event] Hand cleared');
  emit('hand-cleared');

  // Store integration will be handled by parent component
  // store.clearCurrentHand() - handled by parent
};

const handleBalanceUpdated = (newBalance: number) => {
  console.log('[current-hand-section][event] Balance updated', newBalance);
  emit('balance-updated', newBalance);
};

const handleBetSettled = (betResult: BetResult) => {
  console.log('[current-hand-section][event] Bet settled', betResult);
  emit('bet-settled', betResult);
};

const handlePayoutValuesChanged = (payoutValues: PayoutValues) => {
  console.log('[current-hand-section][event] Payout values changed', payoutValues);
  emit('payout-values-changed', payoutValues);
};

const handleWinnerDetermined = (
  winner: 'player' | 'banker' | 'tie',
  playerValue: number,
  bankerValue: number
) => {
  console.log('[current-hand-section][event] Winner determined', {
    winner,
    playerValue,
    bankerValue,
  });
  emit('winner-determined', winner, playerValue, bankerValue);
};

const handleNaturalDetected = (side: 'player' | 'banker', value: number) => {
  console.log('[current-hand-section][event] Natural detected', { side, value });
  emit('natural-detected', side, value);

  // Show natural notification
  toast.info(`✨ Natural ${value} for ${side}!`, {
    timeout: 3000,
  });
};

const handleValidationError = (result: any) => {
  console.warn('[current-hand-section][event] Validation error', result);
  emit('validation-error', result.errors);

  // Show validation errors
  result.errors.forEach((error: string) => {
    toast.error(error, { timeout: 5000 });
  });
};

// =============================================================================
// UI HELPER FUNCTIONS
// =============================================================================

const handleCompleteOrClear = (
  state: CurrentHandSlotProps['state'],
  actions: CurrentHandSlotProps['actions']
) => {
  if (state.round.canCompleteRound) {
    actions.completeRound();
  } else if (state.round.canClearHand) {
    actions.clearHand();
  }
};

const getCompleteButtonText = (state: CurrentHandSlotProps['state']): string => {
  if (state.round.hasBet) {
    return CURRENT_HAND_SETTINGS.LABELS.COMPLETE_ROUND_WITH_BET;
  }
  return CURRENT_HAND_SETTINGS.LABELS.CLEAR_HAND_NO_BET;
};

const shouldShowOtherBetTypes = (state: CurrentHandSlotProps['state']): boolean => {
  return (
    state.round.hasBet &&
    state.round.betType !== null &&
    ['tie', 'playerPair', 'bankerPair'].includes(state.round.betType)
  );
};

const getOtherBetTypeClasses = (betType: BetType | null): string => {
  switch (betType) {
    case 'tie':
      return CURRENT_HAND_SETTINGS.COLORS.TIE_BET_ACTIVE;
    case 'playerPair':
      return CURRENT_HAND_SETTINGS.COLORS.PLAYER_PAIR_BET_ACTIVE;
    case 'bankerPair':
      return CURRENT_HAND_SETTINGS.COLORS.BANKER_PAIR_BET_ACTIVE;
    default:
      return '';
  }
};

const getOtherBetTypeLabel = (betType: BetType | null): string => {
  switch (betType) {
    case 'tie':
      return CURRENT_HAND_SETTINGS.LABELS.TIE_BET_LABEL;
    case 'playerPair':
      return CURRENT_HAND_SETTINGS.LABELS.PLAYER_PAIR_BET_LABEL;
    case 'bankerPair':
      return CURRENT_HAND_SETTINGS.LABELS.BANKER_PAIR_BET_LABEL;
    default:
      return '';
  }
};

const getOtherBetTypeBadgeClasses = (betType: BetType | null): string => {
  switch (betType) {
    case 'tie':
      return CURRENT_HAND_SETTINGS.COLORS.TIE_BET_BADGE;
    case 'playerPair':
      return CURRENT_HAND_SETTINGS.COLORS.PLAYER_PAIR_BET_BADGE;
    case 'bankerPair':
      return CURRENT_HAND_SETTINGS.COLORS.BANKER_PAIR_BET_BADGE;
    default:
      return '';
  }
};

const shouldShowHandSummary = (state: CurrentHandSlotProps['state']): boolean => {
  return state.playerCards.length > 0 && state.bankerCards.length > 0;
};

// =============================================================================
// WATCHERS FOR STORE INTEGRATION
// =============================================================================

// Watch for store card changes and sync with primitive
watch(
  () => [store.shoe.currentHand.player, store.shoe.currentHand.banker],
  ([playerCards, bankerCards]) => {
    console.log('[current-hand-section][store-sync] Cards updated from store', {
      playerCards: playerCards.length,
      bankerCards: bankerCards.length,
    });
    // Cards are managed by the headless primitive through props/events
  },
  { deep: true }
);

// =============================================================================
// STRUCTURED LOGGING SETUP
// =============================================================================

console.log('[current-hand-section][lifecycle] CurrentHandSection mounted', {
  sessionActive: props.sessionActive,
  canPerformActions: props.canPerformActions,
  hasBet: props.currentRoundBet.hasBet,
  betType: props.currentRoundBet.betType,
  currentBalance: props.currentBalance,
});
</script>
