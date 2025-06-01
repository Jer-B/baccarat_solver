<template>
  <!-- =============================================================================
  BETTING INTERFACE SECTION - STYLED WRAPPER
  ============================================================================== -->
  <!-- Styled wrapper that preserves exact current UI from GameView.vue -->
  <!-- Integrates with headless primitive for real-time PayoutSettings display -->

  <BettingInterface
    :current-balance="currentBalance"
    :current-payout-values="currentPayoutValues"
    :session-active="sessionActive"
    :can-perform-actions="canPerformActions"
    :current-round-bet="currentRoundBet"
    :enable-validation="enableValidation"
    :enable-risk-warnings="enableRiskWarnings"
    :handlers="integrationHandlers"
    @bet-amount-changed="handleBetAmountChanged"
    @bet-type-selected="handleBetTypeSelected"
    @bet-placed="handleBetPlaced"
    @bet-cleared="handleBetCleared"
    @validation-error="handleValidationError"
    @validation-success="handleValidationSuccess"
    @payout-settings-requested="handlePayoutSettingsRequested"
    @payout-update-needed="handlePayoutUpdateNeeded"
  >
    <template #default="{ state, actions, utils, config, handlers }">
      <!-- Main Container - Preserving exact current UI -->
      <div :class="config.settings.STYLING.MAIN_CONTAINER">
        <h2 :class="config.settings.STYLING.MAIN_TITLE">
          {{ config.settings.LABELS.MAIN_TITLE }}
        </h2>

        <!-- Betting Controls Grid - Exact GameView.vue layout -->
        <div :class="config.settings.STYLING.BETTING_CONTROLS_GRID">
          <!-- Balance Display (Read-only) - EXACT preservation -->
          <div :class="config.settings.STYLING.FORM_FIELD_CONTAINER">
            <label :class="config.settings.STYLING.FORM_FIELD_LABEL">
              {{ config.settings.LABELS.BALANCE_LABEL }}
            </label>
            <div :class="config.settings.STYLING.BALANCE_DISPLAY">
              {{ utils.formatCurrency(currentBalance) }}
            </div>
            <div :class="config.settings.STYLING.FORM_FIELD_NOTE">
              {{ config.settings.LABELS.BALANCE_SOURCE_NOTE }}
            </div>
          </div>

          <!-- Bet Amount Input - EXACT preservation -->
          <div :class="config.settings.STYLING.FORM_FIELD_CONTAINER">
            <label :class="config.settings.STYLING.FORM_FIELD_LABEL">
              {{ config.settings.LABELS.BET_AMOUNT_LABEL }}
            </label>
            <input
              :class="config.settings.STYLING.FORM_FIELD_INPUT"
              type="number"
              :min="config.validation.BET_AMOUNT.MIN_VALUE"
              :step="config.validation.BET_AMOUNT.STEP"
              :value="state.betAmount"
              @input="
                actions.updateBetAmount(parseFloat(($event.target as HTMLInputElement).value))
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
              :disabled="!state.validation.isValid || state.ui.isPlacingBet"
              :class="[
                config.settings.STYLING.PLACE_BET_BUTTON,
                state.validation.isValid && !state.ui.isPlacingBet
                  ? config.settings.COLORS.PLACE_BET_ENABLED
                  : config.settings.COLORS.PLACE_BET_DISABLED,
              ]"
            >
              {{ state.ui.isPlacingBet ? 'Placing...' : config.settings.LABELS.PLACE_BET_BUTTON }}
            </button>
          </div>
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
            <div>Player: {{ state.payoutCalculations.player.payout }}</div>
            <div>
              Banker: {{ state.payoutCalculations.banker.payout }} ({{
                state.payoutCalculations.banker.commission
              }}
              commission)
            </div>
            <div>Tie: {{ state.payoutCalculations.tie.payout }}</div>
            <div>Player Pair: {{ state.payoutCalculations.playerPair.payout }}</div>
            <div>Banker Pair: {{ state.payoutCalculations.bankerPair.payout }}</div>
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

        <!-- Validation Errors Display -->
        <div v-if="state.validation.errors.length > 0" class="mt-4">
          <div
            v-for="error in state.validation.errors"
            :key="error"
            class="text-red-600 text-sm mb-1"
          >
            {{ config.settings.ICONS.ERROR_EMOJI }} {{ error }}
          </div>
        </div>

        <!-- Validation Warnings Display -->
        <div v-if="state.validation.warnings.length > 0" class="mt-2">
          <div
            v-for="warning in state.validation.warnings"
            :key="warning"
            class="text-orange-600 text-sm mb-1"
          >
            {{ config.settings.ICONS.WARNING_EMOJI }} {{ warning }}
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

import { computed } from 'vue';
import { BettingInterface } from '@/design-system/primitives/BettingInterface';
import InfoSectionToggleButton from '@/components/common/button/InfoSectionToggleButton.vue';
import { useVisibilityStore } from '@/stores/visibilityStore';
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
  'payout-update-needed': [payoutValues: PayoutValues];

  // Professional algorithm events
  'kelly-calculation-requested': [betAmount: number, betType: BetType];
  'risk-assessment-requested': [betAmount: number, balance: number];
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
  // PayoutSettings event handlers - CRITICAL CONNECTION
  onPayoutChange: (payoutValues: PayoutValues) => {
    console.log('[betting-interface-section][integration] Payout change received', {
      newPayouts: payoutValues,
      source: 'PayoutSettings',
    });
    emit('payout-update-needed', payoutValues);
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

const handlePayoutUpdateNeeded = (payoutValues: PayoutValues): void => {
  console.log('[betting-interface-section][integration] Payout update needed', {
    newPayouts: payoutValues,
    recalculatingDisplays: true,
  });
  emit('payout-update-needed', payoutValues);
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
