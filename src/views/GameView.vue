<template>
  <div class="space-y-6">
    <!-- Session Required Notification (Professional Headless Architecture) -->
    <SessionRequiredNotification
      config-key="SESSION_REQUIRED"
      context="general"
      @dismiss="handleSessionNotifyDismiss"
      @action="handleSessionNotifyAction"
    />

    <!-- Session Control -->
    <SessionControl @payout-change="handlePayoutChange" />

    <!-- Game Sequence Indicator - Fixed Position Left Side -->
    <div class="fixed left-1 top-[90%] transform -translate-y-1/2 z-50">
      <GameSequenceIndicator ref="gameSequenceRef" :showDebug="false" />
    </div>

    <!-- Card Composition Chart -->
    <CardCompositionChart ref="cardCompositionChartRef" />

    <!-- Pair Analysis Detail -->
    <div
      v-if="store.settings.showAdvancedAnalysis"
      class="card bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-purple-800">Pair Analysis by Rank</h2>
        <div class="text-sm text-gray-600">
          Overall Pair Edge:
          <span :class="getEdgeClass(store.edgeCalculations.playerPairEdge)" class="font-semibold">
            {{ (store.edgeCalculations.playerPairEdge * 100).toFixed(3) }}%
          </span>
        </div>
      </div>

      <!-- Horizontal Layout for Rank Analysis -->
      <div class="flex flex-wrap justify-center gap-2 mb-4">
        <div
          v-for="analysis in store.pairAnalysis"
          :key="analysis.rank"
          class="flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all hover:shadow-md min-w-fit"
          :class="{
            'bg-green-50 border-green-300 shadow-green-100': analysis.isRich,
            'bg-red-50 border-red-300 shadow-red-100': analysis.isDepleted,
            'bg-gray-50 border-gray-200': !analysis.isRich && !analysis.isDepleted,
            'ring-2 ring-yellow-400': analysis.pairProbability > 0.08,
          }"
          :title="`${analysis.rank}: ${analysis.cardsRemaining} cards remaining, ${(analysis.pairProbability * 100).toFixed(2)}% pair probability`"
        >
          <!-- Rank -->
          <div
            class="font-bold text-lg"
            :class="{
              'text-green-700': analysis.isRich,
              'text-red-700': analysis.isDepleted,
              'text-gray-700': !analysis.isRich && !analysis.isDepleted,
            }"
          >
            {{ analysis.rank }}
          </div>

          <!-- Cards remaining -->
          <div class="text-xs text-gray-600">{{ analysis.cardsRemaining }}</div>

          <!-- Probability percentage -->
          <div
            class="text-xs font-bold px-2 py-1 rounded"
            :class="{
              'text-green-800 bg-green-200': analysis.pairProbability > 0.08,
              'text-yellow-800 bg-yellow-200':
                analysis.pairProbability > 0.06 && analysis.pairProbability <= 0.08,
              'text-red-800 bg-red-200': analysis.pairProbability <= 0.06,
            }"
          >
            {{ (analysis.pairProbability * 100).toFixed(1) }}%
          </div>

          <!-- Visual indicator for very high probability -->
          <div v-if="analysis.pairProbability > 0.08" class="text-xs text-yellow-600 font-bold">
            ⭐
          </div>
        </div>
      </div>

      <!-- Enhanced Legend -->
      <div class="p-3 bg-white rounded-lg border">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-medium text-gray-700">Legend & Information:</div>
          <InfoSectionToggleButton section="pairAnalysis" subsection="legendInfo" />
        </div>
        <div
          v-if="visibilityStore.isVisible('pairAnalysis', 'legendInfo')"
          class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600"
        >
          <div class="space-y-1">
            <div>
              <span
                class="inline-block w-3 h-3 bg-green-50 border-2 border-green-300 rounded mr-2"
              ></span
              >🟢 Rich (&gt;70% cards remaining)
            </div>
            <div>
              <span
                class="inline-block w-3 h-3 bg-red-50 border-2 border-red-300 rounded mr-2"
              ></span
              >🔴 Depleted (&lt;30% cards remaining)
            </div>
            <div>
              <span
                class="inline-block w-3 h-3 bg-gray-50 border-2 border-gray-200 rounded mr-2"
              ></span
              >⚪ Normal distribution
            </div>
          </div>
          <div class="space-y-1">
            <div>
              <span class="inline-block w-3 h-3 bg-green-200 rounded mr-2"></span>Green: &gt;8% pair
              probability (FAVORABLE!)
            </div>
            <div>
              <span class="inline-block w-3 h-3 bg-yellow-200 rounded mr-2"></span>Yellow: 6-8% pair
              probability
            </div>
            <div>
              <span class="inline-block w-3 h-3 bg-red-200 rounded mr-2"></span>Red: &lt;6% pair
              probability
            </div>
          </div>
        </div>
        <div
          v-if="visibilityStore.isVisible('pairAnalysis', 'legendInfo')"
          class="mt-2 text-xs text-gray-500 italic"
        >
          Probability = chance of getting a pair in the next 2 cards dealt. Pair bets typically pay
          11:1.
        </div>
      </div>
    </div>

    <!-- Game Interface Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- NEW CDD/HEADLESS BETTING INTERFACE - MOVED FROM SESSION CONTROL TO HERE -->
      <div class="lg:col-span-3">
        <BettingInterfaceSection
          :current-balance="store.ui.currentBalance"
          :current-payout-values="currentPayoutValues"
          :current-round-bet="{
            hasBet: currentRoundBet.hasBet,
            betType: currentRoundBet.betType,
            betAmount: currentRoundBet.betAmount,
            placedAt: null,
          }"
          :session-active="store.ui.sessionActive"
          :can-perform-actions="store.canPerformActions"
          :selected-preset-name="configurationStatus.name"
          :use-manual-config="configurationStatus.type === 'manual'"
          @bet-amount-changed="handleBettingInterfaceBetAmountChanged"
          @bet-type-selected="handleBettingInterfaceBetTypeSelected"
          @bet-placed="handleBettingInterfaceBetPlaced"
          @bet-cleared="handleBettingInterfaceBetCleared"
          @validation-error="handleBettingInterfaceValidationError"
          @validation-success="handleBettingInterfaceValidationSuccess"
          @payout-settings-requested="handleBettingInterfacePayoutSettingsRequested"
        />
      </div>
    </div>

    <!-- Game Table -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Current Hand Display -->
      <div class="lg:col-span-1">
        <CurrentHandSection
          :current-payout-values="currentPayoutValues"
          :current-balance="store.ui.currentBalance"
          :current-round-bet="{
            hasBet: currentRoundBet.hasBet,
            betType: currentRoundBet.betType,
            betAmount: currentRoundBet.betAmount,
            placedAt: null,
          }"
          :session-active="store.ui.sessionActive"
          :can-perform-actions="store.canPerformActions"
          :auto-complete-enabled="false"
          @round-completed="handleRoundCompleted"
          @hand-completed="handleHandCompleted"
          @hand-cleared="handleHandCleared"
          @balance-updated="handleBalanceUpdated"
          @bet-settled="handleBetSettled"
          @payout-values-changed="handlePayoutValuesChanged"
          @winner-determined="handleWinnerDetermined"
          @natural-detected="handleNaturalDetected"
          @validation-error="handleValidationError"
        />
      </div>

      <!-- Edge Calculations Panel -->
      <div class="lg:col-span-1">
        <EdgeCalculationsPanel />
      </div>

      <!-- Baccarat Scoreboard -->
      <div class="lg:col-span-2">
        <ScoreboardSection
          :game-history="store.history.hands"
          :max-rows="6"
          :max-cols="20"
          :show-tooltips="true"
          :enable-pattern-analysis="true"
          @view-changed="
            (view: string) => console.log('[game-view][scoreboard] View changed', { view })
          "
          @cell-hovered="
            (cell: any) => console.log('[game-view][scoreboard] Cell hovered', { cell })
          "
        />
      </div>
    </div>

    <!-- Game Statistics -->
    <GameStatistics />

    <!-- Advanced Analytics -->
    <AdvancedAnalytics />

    <!-- Professional Analysis Components -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Professional Burn Analysis -->
      <div class="lg:col-span-1">
        <ProfessionalBurnAnalysis />
      </div>

      <!-- Professional Recommendations -->
      <div class="lg:col-span-1">
        <ProfessionalRecommendations />
      </div>

      <!-- Dealer Tell Analysis -->
      <div class="lg:col-span-1">
        <DealerTellAnalysis />
      </div>
    </div>

    <!-- Burn Card Estimator -->
    <BurnCardEstimator />

    <!-- Professional Burn Card Analysis -->
    <ProfessionalBurnCardAnalysis />

    <!-- Keyboard Controls Guide -->
    <div class="card bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-indigo-800">⌨️ Keyboard Controls</h2>
        <InfoSectionToggleButton section="keyboardControls" subsection="shortcuts" />
      </div>

      <div v-if="visibilityStore.isVisible('keyboardControls', 'shortcuts')" class="space-y-4">
        <!-- Card Selection Keys -->
        <div class="p-3 bg-white rounded-lg border">
          <h3 class="text-sm font-semibold text-gray-800 mb-2">
            🃏 Card Selection (when bet is placed)
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
            <div><kbd class="kbd">1</kbd> = Ace</div>
            <div><kbd class="kbd">2-9</kbd> = Number cards</div>
            <div><kbd class="kbd">0</kbd> = 10</div>
            <div><kbd class="kbd">Q</kbd> = Jack</div>
            <div><kbd class="kbd">W</kbd> = Queen</div>
            <div><kbd class="kbd">E</kbd> = King</div>
          </div>
        </div>

        <!-- Betting Keys -->
        <div class="p-3 bg-white rounded-lg border">
          <h3 class="text-sm font-semibold text-gray-800 mb-2">
            💰 Betting Controls (when no bet placed)
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
            <div><kbd class="kbd">P</kbd> = Player bet</div>
            <div><kbd class="kbd">B</kbd> = Banker bet</div>
            <div><kbd class="kbd">T</kbd> = Tie bet</div>
            <div><kbd class="kbd">A</kbd> = Place bet</div>
          </div>
        </div>

        <!-- Round Control -->
        <div class="p-3 bg-white rounded-lg border">
          <h3 class="text-sm font-semibold text-gray-800 mb-2">🎮 Round Control</h3>
          <div class="text-xs text-gray-600">
            <div><kbd class="kbd">R</kbd> = Complete round / Clear hand</div>
          </div>
        </div>

        <!-- Status Indicators -->
        <div class="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-1">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  gameSequenceRef?.gameSequence?.canDrawCards.value
                    ? 'bg-green-500'
                    : 'bg-gray-400',
                ]"
              ></div>
              <span>Card Selection</span>
            </div>
            <div class="flex items-center space-x-1">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  gameSequenceRef?.gameSequence?.canBet.value ? 'bg-green-500' : 'bg-gray-400',
                ]"
              ></div>
              <span>Betting</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, nextTick, computed } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { useGameLogic } from '@/composables/useGameLogic';
import { useKeyboardControls } from '@/composables/useKeyboardControls';
import { useNotifications } from '@/composables/useNotifications';
import { GAME_SETTINGS } from '@/config/gameSettings';
import type { Rank } from '@/types/cards';

import SessionControl from '@/components/session/SessionControl.vue';
import CardCompositionChart from '@/components/charts/CardCompositionChart.vue';
import InfoSectionToggleButton from '@/components/common/button/InfoSectionToggleButton.vue';
import ScoreboardSection from '@/components/scoreboard/ScoreboardSection.vue';
import ProfessionalBurnAnalysis from '@/components/analytics/ProfessionalBurnAnalysis.vue';
import ProfessionalRecommendations from '@/components/analytics/ProfessionalRecommendations.vue';
import DealerTellAnalysis from '@/components/analytics/DealerTellAnalysis.vue';
import BurnCardEstimator from '@/components/cards/BurnCardEstimator.vue';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics.vue';
import EdgeCalculationsPanel from '@/components/game/EdgeCalculationsPanel.vue';
import GameStatistics from '@/components/game/GameStatistics.vue';
import ProfessionalBurnCardAnalysis from '@/components/game/ProfessionalBurnCardAnalysis.vue';
import GameSequenceIndicator from '@/components/game/GameSequenceIndicator.vue';
import SessionRequiredNotification from '@/components/notifications/SessionRequiredNotification.vue';
import { useSessionNotifications } from '@/composables/useSessionNotifications';

// ✨ NEW: Import CurrentHandSection (CDD Architecture)
import { CurrentHandSection } from '@/components/session/sections';
import BettingInterfaceSection from '@/components/session/sections/BettingInterfaceSection.vue';

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();
const { createHandResult } = useGameLogic();

// ✨ UPDATED: Use SessionControl payout values directly (remove independent usePayoutSettings)
// These will be populated by handlePayoutChange from SessionControl
const currentPayoutValues = ref({
  player_payout: 1.0,
  banker_payout: 1.0,
  banker_commission: 0.05,
  tie_payout: 8.0,
  player_pair_payout: 11.0,
  banker_pair_payout: 11.0,
});

const selectedPresetName = ref<string | null>(null);
const useManualConfig = ref<boolean>(false);

// Configuration status computed from SessionControl state
const configurationStatus = computed(() => {
  if (useManualConfig.value) {
    return {
      type: 'manual' as const,
      name: 'Manual Configuration',
      isDefault: false,
      isSystem: false,
    };
  } else if (selectedPresetName.value) {
    return {
      type: 'preset' as const,
      name: selectedPresetName.value,
      isDefault: false, // We'll update this if needed
      isSystem: false,
    };
  } else {
    return {
      type: 'manual' as const,
      name: 'No Selection',
      isDefault: false,
      isSystem: false,
    };
  }
});

const { warning, error, success } = useNotifications();
const sessionNotifications = useSessionNotifications();

// Inject shared data from App.vue
const bettingInterface = inject('bettingInterface') as {
  balance: number;
  betAmount: number;
  selectedBet: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null;
};
const currentRoundBet = inject('currentRoundBet') as {
  hasBet: boolean;
  betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null;
  betAmount: number;
};
const placeBet = inject('placeBet') as () => void;
const isBettingAllowed = inject('isBettingAllowed') as () => boolean;

// Reference to CardCompositionChart for keyboard control
const cardCompositionChartRef = ref<InstanceType<typeof CardCompositionChart>>();

// Reference to GameSequenceIndicator for game sequence management
const gameSequenceRef = ref<InstanceType<typeof GameSequenceIndicator>>();

// Keyboard Controls Configuration
useKeyboardControls({
  // Enhanced card selection validation - requires BOTH game state AND active bet
  canSelectCards: (): boolean => {
    const canDrawCards = gameSequenceRef.value?.gameSequence?.canDrawCards.value || false;
    const hasBet = currentRoundBet && currentRoundBet.hasBet === true;

    console.log('[game-view][keyboard] Card selection validation', {
      canDrawCards,
      hasBet,
      gameStep: gameSequenceRef.value?.gameSequence?.state.currentStep,
      canSelect: canDrawCards && hasBet,
    });

    // Must have BOTH the correct game state AND an active bet
    return canDrawCards && hasBet;
  },

  // Can bet when ready to bet according to game sequence
  canBet: (): boolean => {
    return gameSequenceRef.value?.gameSequence?.canBet.value || false;
  },

  // Enhanced card selection handler with comprehensive validation and toast notifications
  onCardSelect: (rank: Rank): void => {
    const currentStep = gameSequenceRef.value?.gameSequence?.state.currentStep || 'unknown';
    const canDrawCards = gameSequenceRef.value?.gameSequence?.canDrawCards.value || false;
    const hasBet = currentRoundBet && currentRoundBet.hasBet === true;

    console.log('[game-view][keyboard] Card selection attempted', {
      rank,
      currentStep,
      canDrawCards,
      hasBet,
      sessionActive: store.ui.sessionActive,
    });

    // Check session state first
    if (!store.ui.sessionActive) {
      warning('🚫 Please start a session first before selecting cards');
      return;
    }

    // Check if user needs to place a bet first
    if (!hasBet) {
      if (currentStep === 'ready_to_bet') {
        warning(
          '💰 Please place a bet first! Use P (Player), B (Banker), or T (Tie) keys, then press A to validate'
        );
        return;
      }

      if (currentStep === 'session_inactive') {
        warning('🚫 Please start a session and place a bet before selecting cards');
        return;
      }

      warning('💰 No active bet found. Please place a bet before selecting cards');
      return;
    }

    // Check game sequence state
    if (!canDrawCards) {
      if (currentStep === 'ready_to_bet') {
        warning('🎯 Bet is ready - please validate it first with the A key');
        return;
      }

      if (currentStep === 'round_complete' || currentStep === 'round_result') {
        warning('🏁 Round finished. Clear the hand (R key) to start a new round');
        return;
      }

      if (currentStep === 'session_inactive') {
        warning('🚫 Please start a session first');
        return;
      }

      warning('🚫 Cannot select cards in current game state');
      return;
    }

    // All validation passed - delegate to CardCompositionChart for actual card selection
    if (cardCompositionChartRef.value?.selectCardByRank) {
      cardCompositionChartRef.value.selectCardByRank(rank);
    }
  },

  // Betting handlers with proper validation and toast notifications
  onPlayerBet: (): void => {
    console.log('[game-view][keyboard] Player bet key pressed');
    bettingInterface.selectedBet = 'player';
    success('🎯 Player bet selected! Press A to validate');
  },

  onBankerBet: (): void => {
    console.log('[game-view][keyboard] Banker bet key pressed');
    bettingInterface.selectedBet = 'banker';
    success('🎯 Banker bet selected! Press A to validate');
  },

  onTieBet: (): void => {
    console.log('[game-view][keyboard] Tie bet key pressed');
    bettingInterface.selectedBet = 'tie';
    success('🎯 Tie bet selected! Press A to validate');
  },

  // Enhanced bet validation with specific toast messages
  onValidateBet: (): void => {
    console.log('[game-view][keyboard] Bet validation attempted', {
      sessionActive: store.ui.sessionActive,
      selectedBet: bettingInterface.selectedBet,
      betAmount: bettingInterface.betAmount,
      balance: store.ui.currentBalance,
    });

    // Check session state first
    if (!store.ui.sessionActive) {
      warning('🚫 Please start a session first before placing bets');
      return;
    }

    // Check if a bet type has been selected
    if (!bettingInterface.selectedBet) {
      warning('🎯 Please select a bet first! Use P (Player), B (Banker), or T (Tie) keys');
      return;
    }

    // Check if bet amount is valid
    if (bettingInterface.betAmount <= 0) {
      warning('💰 Please set a valid bet amount greater than $0');
      return;
    }

    // Check if user has sufficient balance
    if (bettingInterface.betAmount > store.ui.currentBalance) {
      warning(
        `💳 Insufficient balance! You have $${store.ui.currentBalance.toFixed(2)} but bet is $${bettingInterface.betAmount.toFixed(2)}`
      );
      return;
    }

    // All validation passed - place the bet
    try {
      placeBet();
      success(
        `✅ Bet placed: $${bettingInterface.betAmount.toFixed(2)} on ${bettingInterface.selectedBet?.toUpperCase()}`
      );
    } catch (err) {
      console.error('[game-view][keyboard] Bet placement failed', err);
      error('❌ Failed to place bet. Please try again');
    }
  },

  // Clear hand handler with comprehensive validation
  onCompleteRound: (): void => {
    console.log('[game-view][keyboard] Round completion attempted (R key)', {
      sessionActive: store.ui.sessionActive,
      hasBet: currentRoundBet.hasBet,
      playerCards: store.shoe.currentHand.player.length,
      bankerCards: store.shoe.currentHand.banker.length,
      totalCards: store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length,
    });

    // Validation 1: Session must be started
    if (!store.ui.sessionActive) {
      warning('🚫 Cannot clear hand - please start a session first');
      return;
    }

    // Validation 2: Must have at least minimum cards for a complete hand
    const totalCards = store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length;
    if (totalCards < GAME_SETTINGS.hand.MIN_CARDS_FOR_COMPLETE_HAND) {
      warning(
        `🃏 Cannot clear hand - need at least ${GAME_SETTINGS.hand.MIN_CARDS_FOR_COMPLETE_HAND} cards dealt (current: ${totalCards})`
      );
      return;
    }

    // Validation 3: Must have a bet placed
    if (!currentRoundBet.hasBet) {
      warning('💰 Cannot clear hand - no bet was placed for this round');
      return;
    }

    // All validations passed - proceed with clearing hand
    success('✅ Clearing hand and completing round');
    handleClearHand();
  },
});

const getEdgeClass = (edge: number): string => {
  if (edge > 0) {
    return 'edge-positive';
  }
  if (edge < 0) {
    return 'edge-negative';
  }
  return 'edge-neutral';
};

const handleClearHand = (): void => {
  // Only allow clearing if session is active and there's actually a hand to clear
  if (!store.canPerformActions || !store.hasHandToClear) {
    return;
  }

  // Notify game sequence that round is being completed
  gameSequenceRef.value?.gameSequence?.onRoundCompleted();

  // If there are cards on the table, we need to complete the hand properly
  if (store.shoe.currentHand.player.length > 0 || store.shoe.currentHand.banker.length > 0) {
    // Create hand result using the game service
    const handResult = createHandResult();

    // If there was a bet placed, settle it and add betting info
    if (currentRoundBet.hasBet) {
      // Calculate bet settlement directly
      const betResult = calculateBetResult(handResult, currentRoundBet);

      // Add betting information to hand result
      handResult.betInfo = {
        betType: currentRoundBet.betType!,
        betAmount: currentRoundBet.betAmount,
        won: betResult.won,
        payout: betResult.payout,
        netResult: betResult.netResult,
      };

      // Show round result via game sequence
      const resultText = `${handResult.winner} ${betResult.won ? '(Won)' : '(Lost)'} - Net: ${betResult.netResult >= 0 ? '+' : ''}$${betResult.netResult.toFixed(2)}`;
      gameSequenceRef.value?.gameSequence?.showRoundResult(resultText);

      // Balance is already updated by useBettingInterface.settleCurrentBet()
      // Do not update balance here to prevent double deduction
    }

    // Add the hand result to update pattern analysis and history
    store.addHandResult(handResult);
  }

  // Reset betting state for new round
  resetBettingState();
};

const handleSessionNotifyDismiss = (configKey: string): void => {
  console.log('[game-view][session-notification] Session notification dismissed', {
    configKey,
    sessionActive: store.ui.sessionActive,
    timestamp: new Date().toISOString(),
  });

  // Use the composable's enhanced dismiss handler with context
  sessionNotifications.handleSessionRequiredDismiss(configKey, 'general');
};

const handleSessionNotifyAction = (configKey: string, actionLabel: string): void => {
  console.log('[game-view][session-notification] Session notification action triggered', {
    configKey,
    actionLabel,
    sessionActive: store.ui.sessionActive,
    timestamp: new Date().toISOString(),
  });

  // Use the composable's enhanced action handler with context
  sessionNotifications.handleSessionRequiredAction(configKey, actionLabel, 'general');
};

// =============================================================================
// BET SETTLEMENT FUNCTIONS (Replacing useBettingInterface functions)
// =============================================================================

const calculateBetResult = (handResult: any, currentBet: any) => {
  const betType = currentBet.betType;
  const betAmount = currentBet.betAmount;
  const winner = handResult.winner;

  let won = false;
  let payout = 0;

  // Determine if bet won based on winner and bet type
  switch (betType) {
    case 'player':
      won = winner === 'player';
      payout = won ? betAmount * 1.0 : 0; // 1:1 payout
      break;
    case 'banker':
      won = winner === 'banker';
      if (won) {
        const commission = betAmount * 0.05; // 5% commission
        payout = betAmount * 1.0 - commission; // 1:1 minus commission
      }
      break;
    case 'tie':
      won = winner === 'tie';
      payout = won ? betAmount * 8.0 : 0; // 8:1 payout
      break;
    case 'playerPair':
      won = handResult.playerPair || false;
      payout = won ? betAmount * 11.0 : 0; // 11:1 payout
      break;
    case 'bankerPair':
      won = handResult.bankerPair || false;
      payout = won ? betAmount * 11.0 : 0; // 11:1 payout
      break;
  }

  const netResult = won ? payout : -betAmount;

  return {
    won,
    payout,
    netResult,
  };
};

const resetBettingState = () => {
  // Reset betting state for new round
  currentRoundBet.hasBet = false;
  currentRoundBet.betType = null;
  currentRoundBet.betAmount = 0;

  // Force game sequence to update to ready_to_bet state after betting state is cleared
  nextTick(() => {
    console.log('[game-view][clear-hand] Forcing game sequence to ready_to_bet state', {
      currentRoundBetState: {
        hasBet: currentRoundBet.hasBet,
        betType: currentRoundBet.betType,
        betAmount: currentRoundBet.betAmount,
      },
    });

    if (gameSequenceRef.value?.gameSequence?.updateStep) {
      gameSequenceRef.value.gameSequence.updateStep('ready_to_bet');
    }
  });
};

// =============================================================================
// BALANCE INTEGRATION EVENT HANDLERS (Phase 5)
// =============================================================================

const handleRoundCompleted = (handResult: any): void => {
  console.log('[game-view][round-completion] Round completed', {
    handResult,
    previousBetState: {
      hasBet: currentRoundBet.hasBet,
      betType: currentRoundBet.betType,
      betAmount: currentRoundBet.betAmount,
    },
  });

  // CRITICAL: Reset betting state to prevent "already placed bet" error
  currentRoundBet.hasBet = false;
  currentRoundBet.betType = null;
  currentRoundBet.betAmount = 0;

  console.log('[game-view][round-completion] Betting state reset after round completion', {
    newBetState: {
      hasBet: currentRoundBet.hasBet,
      betType: currentRoundBet.betType,
      betAmount: currentRoundBet.betAmount,
    },
  });

  // Process any bet results in the hand result
  if (handResult.betInfo) {
    handleBetSettled(handResult.betInfo);
  }

  // Continue with existing hand completion logic
  handleHandCompleted(handResult);
};

const handleHandCompleted = (handResult: any, betResult?: any): void => {
  console.log('[game-view][balance-integration] Hand completed', { handResult, betResult });

  // Continue with existing hand completion logic
  handleClearHand();
};

const handleHandCleared = (): void => {
  console.log('[game-view][balance-integration] Hand cleared');
  // Reset any UI state if needed
  resetBettingState();
};

const handleBalanceUpdated = (newBalance: number): void => {
  console.log('[game-view][balance-integration] Balance updated', {
    previousBalance: store.ui.currentBalance,
    newBalance,
    change: newBalance - store.ui.currentBalance,
  });

  // Calculate change before updating store
  const change = newBalance - store.ui.currentBalance;

  // CRITICAL: Update store balance immediately
  store.ui.currentBalance = newBalance;

  // Show balance update notification
  if (Math.abs(change) > 0.01) {
    const changeText = change > 0 ? `+$${change.toFixed(2)}` : `-$${Math.abs(change).toFixed(2)}`;
    success(`💰 Balance updated: ${changeText} (Total: $${newBalance.toFixed(2)})`);
  }
};

const handleBetSettled = (betResult: any): void => {
  console.log('[game-view][balance-integration] Bet settled', { betResult });

  // Balance is already updated by useBettingInterface.settleCurrentBet()
  // Do not update balance here to prevent double deduction

  // Don't show toast here - it's handled by balance management composable
};

const handlePayoutValuesChanged = (payoutValues: any): void => {
  console.log('[game-view][balance-integration] Payout values changed', { payoutValues });
  // Payout values are managed by usePayoutSettings composable
  // This handler is available for additional logic if needed
};

const handleWinnerDetermined = (winner: string, playerValue: number, bankerValue: number): void => {
  console.log('[game-view][balance-integration] Winner determined', {
    winner,
    playerValue,
    bankerValue,
  });
  success(`🏆 ${winner.toUpperCase()} wins! (${playerValue} vs ${bankerValue})`);
};

const handleNaturalDetected = (side: string, value: number): void => {
  console.log('[game-view][balance-integration] Natural detected', { side, value });
  success(`✨ Natural ${value} for ${side.toUpperCase()}!`);
};

const handleValidationError = (errors: string[]): void => {
  console.error('[game-view][balance-integration] Validation errors', { errors });
  errors.forEach(errorMessage => {
    error(`❌ ${errorMessage}`);
  });
};

// ✨ NEW: Listen for payout changes from SessionControl and update the state
const handlePayoutChange = (event: any) => {
  console.log('[game-view][payout] Payout change received from SessionControl', {
    source: event.source,
    values: event.values,
    presetId: event.presetId,
    presetName: event.presetName,
  });

  // Update the payout values
  currentPayoutValues.value = event.values;

  // Update preset information
  if (event.presetName) {
    selectedPresetName.value = event.presetName;
    useManualConfig.value = false;
  } else if (event.source === 'manual') {
    // Manual configuration mode
    useManualConfig.value = true;
    selectedPresetName.value = null;
  } else {
    // Reset or other sources
    selectedPresetName.value = null;
    useManualConfig.value = false;
  }
};

const handleBettingInterfaceBetAmountChanged = (newBetAmount: number) => {
  console.log('[game-view][betting-interface] Bet amount changed', { newBetAmount });
  bettingInterface.betAmount = newBetAmount;
};

const handleBettingInterfaceBetTypeSelected = (
  newBetType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null
) => {
  console.log('[game-view][betting-interface] Bet type selected', { newBetType });
  bettingInterface.selectedBet = newBetType;
};

const handleBettingInterfaceBetPlaced = () => {
  console.log('[game-view][betting-interface] Bet placed');
  placeBet();
};

const handleBettingInterfaceBetCleared = () => {
  console.log('[game-view][betting-interface] Bet cleared');
  handleClearHand();
};

const handleBettingInterfaceValidationError = (result: any) => {
  console.log('[game-view][betting-interface] Validation failed (expected behavior)', {
    validationResult: result,
    reason: result.errors?.[0] || 'Unknown validation error',
    note: 'This is normal validation flow - not an error',
  });

  // Show proper toast notifications for validation errors
  if (result.errors && result.errors.length > 0) {
    result.errors.forEach((errorMessage: string) => {
      error(`❌ ${errorMessage}`);
    });
  }

  // Show warnings if any
  if (result.warnings && result.warnings.length > 0) {
    result.warnings.forEach((warningMessage: string) => {
      warning(`⚠️ ${warningMessage}`);
    });
  }
};

const handleBettingInterfaceValidationSuccess = (result: any) => {
  console.log('[game-view][betting-interface] Validation success', { result });
  // REMOVED: success('✅ Bet validation successful'); - User requested this toast be removed
};

const handleBettingInterfacePayoutSettingsRequested = () => {
  console.log('[game-view][betting-interface] Payout settings requested');
  // Implement the logic to open the payout settings dialog
};
</script>

<style scoped>
.kbd {
  @apply inline-flex items-center justify-center px-2 py-1 text-xs font-mono font-semibold 
         text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm;
  min-width: 1.5rem;
  line-height: 1;
}

.edge-positive {
  @apply text-green-700 font-semibold;
}

.edge-negative {
  @apply text-red-700 font-semibold;
}

.edge-neutral {
  @apply text-gray-700 font-semibold;
}
</style>
