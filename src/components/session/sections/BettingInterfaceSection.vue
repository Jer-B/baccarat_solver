<template>
  <!-- =============================================================================
  BETTING INTERFACE SECTION - STYLED WRAPPER
  ============================================================================== -->
  <!-- Styled wrapper that preserves exact current UI from GameView.vue -->
  <!-- Integrates with headless primitive for real-time PayoutSettings display -->

  <BettingInterface
    :current-balance="currentBalance"
    :current-payout-values="currentPayoutValues"
    :selected-preset-name="selectedPresetName"
    :use-manual-config="useManualConfig"
    :session-active="sessionActive"
    :can-perform-actions="canPerformActions"
    :current-round-bet="currentRoundBet"
    :enable-validation="enableValidation"
    :enable-risk-warnings="enableRiskWarnings"
    :kelly-recommendation="kellyRecommendation"
    :monte-carlo-results="monteCarloResults"
    :burn-analysis-data="burnAnalysisData"
    :handlers="integrationHandlers"
    @bet-amount-changed="handleBetAmountChanged"
    @bet-type-selected="handleBetTypeSelected"
    @bet-placed="handleBetPlaced"
    @bet-cleared="handleBetCleared"
    @validation-error="handleValidationError"
    @validation-success="handleValidationSuccess"
    @payout-settings-requested="handlePayoutSettingsRequested"
  >
    <template #default="{ state, actions, utils, config, handlers }">
      <!-- Main Container - Preserving exact current UI -->
      <div :class="config.settings.STYLING.MAIN_CONTAINER">
        <h2 :class="config.settings.STYLING.MAIN_TITLE">
          {{ config.settings.LABELS.MAIN_TITLE }}
        </h2>

        <!-- Betting Controls Grid - Exact GameView.vue layout -->
        <div :class="config.settings.STYLING.BETTING_CONTROLS_GRID">
          <!-- Current Balance (Display Only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ config.settings.LABELS.BALANCE_LABEL }}
            </label>
            <div
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-medium"
            >
              {{ formatCurrencyWithCommas(currentBalance) }}
            </div>
          </div>

          <!-- Bet Amount Input - EXACT preservation -->
          <div :class="config.settings.STYLING.FORM_FIELD_CONTAINER">
            <div class="flex items-center justify-between mb-1">
              <label :class="config.settings.STYLING.FORM_FIELD_LABEL">
                {{ config.settings.LABELS.BET_AMOUNT_LABEL }}
              </label>
              <button
                @click="() => actions.updateBetAmount(currentBalance)"
                :disabled="!sessionActive || !canPerformActions || state.currentBet.hasBet"
                class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                title="Set bet amount to current balance"
              >
                Max
              </button>
            </div>
            <input
              :class="config.settings.STYLING.FORM_FIELD_INPUT"
              type="text"
              :value="formatInitialValue(state.betAmount)"
              @input="
                event =>
                  handleNumberInput(event, actions.updateBetAmount, {
                    minValue: config.validation.BET_AMOUNT.MIN_VALUE,
                    maxValue: config.validation.BET_AMOUNT.MAX_VALUE,
                  })
              "
              @blur="
                event =>
                  handleNumberBlur(event, actions.updateBetAmount, {
                    minValue: config.validation.BET_AMOUNT.MIN_VALUE,
                    defaultValue: config.validation.BET_AMOUNT.MIN_VALUE,
                  })
              "
              placeholder="10.00"
            />
          </div>

          <!-- Main Bet Selection - EXACT GameView.vue button colors and layout -->
          <div :class="config.settings.STYLING.FORM_FIELD_CONTAINER">
            <label :class="config.settings.STYLING.FORM_FIELD_LABEL">
              {{ config.settings.LABELS.BET_SELECTION_LABEL }}
            </label>
            <div :class="config.settings.STYLING.BET_BUTTON_GRID">
              <!-- Player Button - EXACT colors -->
              <button
                @click="actions.selectBetType('player')"
                :class="[
                  config.settings.STYLING.BET_BUTTON_BASE,
                  state.selectedBet === 'player'
                    ? config.settings.COLORS.PLAYER_SELECTED
                    : config.settings.COLORS.PLAYER_UNSELECTED,
                ]"
              >
                {{ config.settings.LABELS.PLAYER_BET_LABEL }}
              </button>

              <!-- Banker Button - EXACT colors -->
              <button
                @click="actions.selectBetType('banker')"
                :class="[
                  config.settings.STYLING.BET_BUTTON_BASE,
                  state.selectedBet === 'banker'
                    ? config.settings.COLORS.BANKER_SELECTED
                    : config.settings.COLORS.BANKER_UNSELECTED,
                ]"
              >
                {{ config.settings.LABELS.BANKER_BET_LABEL }}
              </button>

              <!-- Tie Button - EXACT colors -->
              <button
                @click="actions.selectBetType('tie')"
                :class="[
                  config.settings.STYLING.BET_BUTTON_BASE,
                  state.selectedBet === 'tie'
                    ? config.settings.COLORS.TIE_SELECTED
                    : config.settings.COLORS.TIE_UNSELECTED,
                ]"
              >
                {{ config.settings.LABELS.TIE_BET_LABEL }}
              </button>
            </div>
          </div>

          <!-- Pair Bets - EXACT GameView.vue layout and colors -->
          <div :class="config.settings.STYLING.FORM_FIELD_CONTAINER">
            <label :class="config.settings.STYLING.FORM_FIELD_LABEL">
              {{ config.settings.LABELS.PAIR_BETS_LABEL }}
            </label>
            <div :class="config.settings.STYLING.PAIR_BUTTON_GRID">
              <!-- Player Pair Button - EXACT colors -->
              <button
                @click="actions.selectBetType('playerPair')"
                :class="[
                  config.settings.STYLING.BET_BUTTON_BASE,
                  state.selectedBet === 'playerPair'
                    ? config.settings.COLORS.PLAYER_PAIR_SELECTED
                    : config.settings.COLORS.PLAYER_PAIR_UNSELECTED,
                ]"
              >
                {{ config.settings.LABELS.PLAYER_PAIR_LABEL }}
              </button>

              <!-- Banker Pair Button - EXACT colors -->
              <button
                @click="actions.selectBetType('bankerPair')"
                :class="[
                  config.settings.STYLING.BET_BUTTON_BASE,
                  state.selectedBet === 'bankerPair'
                    ? config.settings.COLORS.BANKER_PAIR_SELECTED
                    : config.settings.COLORS.BANKER_PAIR_UNSELECTED,
                ]"
              >
                {{ config.settings.LABELS.BANKER_PAIR_LABEL }}
              </button>
            </div>
          </div>

          <!-- Place Bet Button - EXACT styling -->
          <div :class="config.settings.STYLING.FORM_FIELD_CONTAINER">
            <button
              @click="actions.placeBet"
              :disabled="
                !state.validation.isValid || state.ui.isPlacingBet || state.currentBet.hasBet
              "
              :class="[
                config.settings.STYLING.PLACE_BET_BUTTON,
                state.validation.isValid && !state.ui.isPlacingBet && !state.currentBet.hasBet
                  ? config.settings.COLORS.PLACE_BET_ENABLED
                  : config.settings.COLORS.PLACE_BET_DISABLED,
              ]"
            >
              {{
                state.currentBet.hasBet
                  ? 'Bet Placed - Awaiting Hand'
                  : state.ui.isPlacingBet
                    ? 'Placing...'
                    : config.settings.LABELS.PLACE_BET_BUTTON
              }}
            </button>
          </div>
        </div>

        <!-- Validation Error Display - Red text under entire betting section -->
        <div
          v-if="state.validation.errors.length > 0"
          class="mt-2 text-sm text-red-600 text-center"
        >
          {{ state.validation.errors[0] }}
        </div>

        <!-- Payout Information Panel - LIVE VALUES FROM PAYOUTSETTINGS! -->
        <div :class="config.settings.STYLING.PAYOUT_INFO_PANEL">
          <div :class="config.settings.STYLING.PAYOUT_INFO_HEADER">
            <div :class="config.settings.STYLING.PAYOUT_INFO_TITLE">
              {{ config.settings.LABELS.PAYOUT_INFO_TITLE }}:
            </div>
            <InfoSectionToggleButton section="bettingInterface" subsection="payoutInfo" />
          </div>

          <!-- CRITICAL: Real-time payout display using live PayoutSettings values -->
          <div
            v-if="visibilityStore.isVisible('bettingInterface', 'payoutInfo')"
            :class="config.settings.STYLING.PAYOUT_INFO_GRID"
          >
            <!-- Selected Mode Display -->
            <div
              class="col-span-full mb-2 text-xs font-medium text-gray-600 border-b border-gray-200 pb-1"
            >
              Selected: {{ state.payoutCalculations.selectedModeDisplay.name }}
            </div>

            <div>
              <div>Player: {{ state.payoutCalculations.player.payout }}</div>
              <div class="text-xs text-gray-500">
                Possible Gain:
                {{ calculatePossibleGain('player', state.betAmount, currentPayoutValues) }}
              </div>
            </div>
            <div>
              <div>
                Banker: {{ state.payoutCalculations.banker.payout }} ({{
                  state.payoutCalculations.banker.commission
                }}
                commission)
              </div>
              <div class="text-xs text-gray-500">
                Possible Gain:
                {{ calculatePossibleGain('banker', state.betAmount, currentPayoutValues) }}
              </div>
            </div>
            <div>
              <div>Tie: {{ state.payoutCalculations.tie.payout }}</div>
              <div class="text-xs text-gray-500">
                Possible Gain:
                {{ calculatePossibleGain('tie', state.betAmount, currentPayoutValues) }}
              </div>
            </div>
            <div>
              <div>Player Pair: {{ state.payoutCalculations.playerPair.payout }}</div>
              <div class="text-xs text-gray-500">
                Possible Gain:
                {{ calculatePossibleGain('playerPair', state.betAmount, currentPayoutValues) }}
              </div>
            </div>
            <div>
              <div>Banker Pair: {{ state.payoutCalculations.bankerPair.payout }}</div>
              <div class="text-xs text-gray-500">
                Possible Gain:
                {{ calculatePossibleGain('bankerPair', state.betAmount, currentPayoutValues) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Current Round Status - EXACT preservation -->
        <div v-if="state.currentBet.hasBet" :class="config.settings.STYLING.CURRENT_BET_PANEL">
          <div :class="config.settings.STYLING.CURRENT_BET_TITLE">
            {{ config.settings.LABELS.CURRENT_BET_TITLE }}:
            {{ utils.formatCurrency(state.currentBet.betAmount) }} on
            {{ state.currentBet.betType?.toUpperCase() }}
          </div>
          <div :class="config.settings.STYLING.CURRENT_BET_SUBTITLE">
            {{ config.settings.LABELS.WAITING_MESSAGE }}
          </div>
        </div>
      </div>
    </template>
  </BettingInterface>
</template>

<script setup lang="ts">
// =============================================================================
// IMPORTS
// =============================================================================

import { computed, nextTick } from 'vue';
import { BettingInterface } from '@/design-system/primitives/BettingInterface';
import InfoSectionToggleButton from '@/components/common/button/InfoSectionToggleButton.vue';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { PAYOUT_UTILS } from '@/config/payoutSettings';
import { handleNumberInput, handleNumberBlur, formatInitialValue } from '@/utils/numberFormatting';
import type { PayoutValues } from '@/config/payoutSettings';
import type {
  BetType,
  CurrentBetState,
  BettingValidationResult,
  BetPlacementEvent,
} from '@/config/bettingInterfaceSettings';

// =============================================================================
// PROPS DEFINITIONS
// =============================================================================

export interface BettingInterfaceSectionProps {
  // Core dependencies from Session Control
  currentBalance: number;
  currentPayoutValues: PayoutValues;

  // Session state
  sessionActive?: boolean;
  canPerformActions?: boolean;

  // Current round bet state
  currentRoundBet?: CurrentBetState;

  // Configuration
  enableValidation?: boolean;
  enableRiskWarnings?: boolean;

  // Payout mode tracking
  selectedPresetName?: string | null;
  useManualConfig?: boolean;

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
}

const props = withDefaults(defineProps<BettingInterfaceSectionProps>(), {
  sessionActive: false,
  canPerformActions: true,
  enableValidation: true,
  enableRiskWarnings: true,
  selectedPresetName: null,
  useManualConfig: false,
});

// =============================================================================
// EMITS DEFINITIONS
// =============================================================================

export interface BettingInterfaceSectionEmits {
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
}

const emit = defineEmits<BettingInterfaceSectionEmits>();

// =============================================================================
// STORE DEPENDENCIES
// =============================================================================

const visibilityStore = useVisibilityStore();

// =============================================================================
// INTEGRATION HANDLERS
// =============================================================================

const integrationHandlers = computed(() => ({
  // PayoutSettings event handlers - REMOVED TO FIX CIRCULAR DEPENDENCY
  onPayoutChange: (payoutValues: PayoutValues) => {
    console.log('[betting-interface-section][integration] Payout change received', {
      newPayouts: payoutValues,
      source: 'PayoutSettings',
    });
    // Removed emit('payout-update-needed') - this was causing circular loops
    // Betting interface receives payout values via props (unidirectional flow)
  },

  onPayoutPresetSelected: (presetId: string) => {
    console.log('[betting-interface-section][integration] Payout preset selected', {
      presetId,
      source: 'PayoutSettings',
    });
  },

  // Session Control event handlers
  onBalanceUpdate: (newBalance: number) => {
    console.log('[betting-interface-section][integration] Balance update requested', {
      newBalance,
      source: 'SessionControl',
    });
  },

  onSessionStateChange: (active: boolean) => {
    console.log('[betting-interface-section][integration] Session state change', {
      active,
      source: 'SessionControl',
    });
  },

  // Professional algorithm handlers
  onKellyCalculation: (recommendation: any) => {
    console.log('[betting-interface-section][integration] Kelly calculation received', {
      recommendation,
      source: 'ProfessionalAlgorithms',
    });
  },

  onRiskAssessment: (assessment: any) => {
    console.log('[betting-interface-section][integration] Risk assessment received', {
      assessment,
      source: 'ProfessionalAlgorithms',
    });
  },
}));

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleBetAmountChanged = (amount: number): void => {
  console.log('[betting-interface-section][event] Bet amount changed', {
    amount,
    balance: props.currentBalance,
    ratio: amount / props.currentBalance,
  });
  emit('bet-amount-changed', amount);
};

const handleBetTypeSelected = (betType: BetType): void => {
  console.log('[betting-interface-section][event] Bet type selected', {
    betType,
    sessionActive: props.sessionActive,
  });
  emit('bet-type-selected', betType);
};

const handleBetPlaced = (event: BetPlacementEvent): void => {
  console.log('[betting-interface-section][event] Bet placed', {
    betType: event.betType,
    amount: event.betAmount,
    balance: event.balance,
    timestamp: event.timestamp,
    payoutSettings: 'live-integration-active',
  });
  emit('bet-placed', event);
};

const handleBetCleared = (): void => {
  console.log('[betting-interface-section][event] Bet cleared');
  emit('bet-cleared');
};

const handleValidationError = (result: BettingValidationResult): void => {
  console.log('[betting-interface-section][validation] Validation error', {
    errors: result.errors,
    warnings: result.warnings,
    isValid: result.isValid,
  });
  emit('validation-error', result);
};

const handleValidationSuccess = (result: BettingValidationResult): void => {
  console.log('[betting-interface-section][validation] Validation success', {
    isValid: result.isValid,
    warningsCount: result.warnings.length,
  });
  emit('validation-success', result);
};

const handlePayoutSettingsRequested = (): void => {
  console.log('[betting-interface-section][integration] Payout settings requested');
  emit('payout-settings-requested');
};

// =============================================================================
// COMPUTED PROPERTIES AND UTILITY FUNCTIONS
// =============================================================================

const getSelectedModeDisplay = (): string => {
  if (props.useManualConfig) {
    return 'Manual Configuration';
  }
  if (props.selectedPresetName) {
    return props.selectedPresetName;
  }
  return 'No preset selected';
};

const formatCurrencyWithCommas = (value: number): string => {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const calculatePossibleGain = (
  betType: BetType,
  betAmount: number,
  payoutValues: PayoutValues
): string => {
  if (betAmount <= 0) {
    return '$0.00';
  }

  let payoutRatio = 0;
  let commission = 0;

  switch (betType) {
    case 'player':
      payoutRatio = payoutValues.player_payout;
      commission = 0;
      break;
    case 'banker':
      payoutRatio = payoutValues.banker_payout;
      commission = payoutValues.banker_commission;
      break;
    case 'tie':
      payoutRatio = payoutValues.tie_payout;
      commission = 0;
      break;
    case 'playerPair':
      payoutRatio = payoutValues.player_pair_payout;
      commission = 0;
      break;
    case 'bankerPair':
      payoutRatio = payoutValues.banker_pair_payout;
      commission = 0;
      break;
    default:
      return '$0.00';
  }

  // Calculate the profit/gain (winnings only, not including the original bet)
  const gain = PAYOUT_UTILS.calculateProfit(betAmount, payoutRatio, commission);

  return `$${gain.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// =============================================================================
// LIFECYCLE LOGGING
// =============================================================================

console.log('[betting-interface-section][lifecycle] Styled wrapper initialized', {
  currentBalance: props.currentBalance,
  payoutIntegrationActive: Boolean(props.currentPayoutValues),
  sessionActive: props.sessionActive,
  canPerformActions: props.canPerformActions,
  validationEnabled: props.enableValidation,
  riskWarningsEnabled: props.enableRiskWarnings,
});
</script>
<style scoped>
/* Ensure number input arrows are visible */
input[type='number'] {
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: inner-spin-button;
  opacity: 1;
  cursor: pointer;
}

/* Firefox number input arrows */
input[type='number'] {
  -moz-appearance: number-input;
}
</style>
