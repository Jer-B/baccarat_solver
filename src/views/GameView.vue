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
    <SessionControl />

    <!-- Game Sequence Indicator -->
    <GameSequenceIndicator ref="gameSequenceRef" :showDebug="false" />

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
      <!-- Betting Interface -->
      <div class="lg:col-span-3">
        <div class="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <h2 class="text-xl font-semibold mb-4 text-green-800">Betting Interface & Statistics</h2>

          <!-- Betting Controls -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
            <!-- Balance Display (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
              <div
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-medium"
              >
                ${{ store.ui.currentBalance.toFixed(2) }}
              </div>
              <div class="text-xs text-gray-500 mt-1">Set in Session Control</div>
            </div>

            <!-- Bet Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bet Amount</label>
              <input
                v-model.number="bettingInterface.betAmount"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="10.00"
              />
            </div>

            <!-- Bet Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bet On</label>
              <div class="grid grid-cols-3 gap-1">
                <button
                  @click="bettingInterface.selectedBet = 'player'"
                  :class="[
                    'px-2 py-2 rounded-md font-medium transition-colors text-xs',
                    bettingInterface.selectedBet === 'player'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                  ]"
                >
                  Player
                </button>
                <button
                  @click="bettingInterface.selectedBet = 'banker'"
                  :class="[
                    'px-2 py-2 rounded-md font-medium transition-colors text-xs',
                    bettingInterface.selectedBet === 'banker'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                  ]"
                >
                  Banker
                </button>
                <button
                  @click="bettingInterface.selectedBet = 'tie'"
                  :class="[
                    'px-2 py-2 rounded-md font-medium transition-colors text-xs',
                    bettingInterface.selectedBet === 'tie'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                  ]"
                >
                  Tie
                </button>
              </div>
            </div>

            <!-- Pair Bets -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pair Bets</label>
              <div class="grid grid-cols-2 gap-1">
                <button
                  @click="bettingInterface.selectedBet = 'playerPair'"
                  :class="[
                    'px-2 py-2 rounded-md font-medium transition-colors text-xs',
                    bettingInterface.selectedBet === 'playerPair'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                  ]"
                >
                  P Pair
                </button>
                <button
                  @click="bettingInterface.selectedBet = 'bankerPair'"
                  :class="[
                    'px-2 py-2 rounded-md font-medium transition-colors text-xs',
                    bettingInterface.selectedBet === 'bankerPair'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                  ]"
                >
                  B Pair
                </button>
              </div>
            </div>

            <!-- Place Bet Button -->
            <div>
              <button
                @click="placeBet"
                :disabled="
                  !isBettingAllowed() ||
                  !bettingInterface.selectedBet ||
                  !bettingInterface.betAmount
                "
                class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Place Bet
              </button>
            </div>
          </div>

          <!-- Payout Information -->
          <div class="p-3 bg-white rounded-lg border mb-4">
            <div class="flex items-center justify-between mb-2">
              <div class="text-sm font-medium text-gray-700">Payout Information:</div>
              <InfoSectionToggleButton section="bettingInterface" subsection="payoutInfo" />
            </div>
            <div
              v-if="visibilityStore.isVisible('bettingInterface', 'payoutInfo')"
              class="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600"
            >
              <div>Player: {{ currentPayoutValues.player_payout }}:1</div>
              <div>
                Banker: {{ currentPayoutValues.banker_payout }}:1 ({{
                  (currentPayoutValues.banker_commission * 100).toFixed(1)
                }}% commission)
              </div>
              <div>Tie: {{ currentPayoutValues.tie_payout }}:1</div>
              <div>Player Pair: {{ currentPayoutValues.player_pair_payout }}:1</div>
              <div>Banker Pair: {{ currentPayoutValues.banker_pair_payout }}:1</div>
            </div>
          </div>

          <!-- Current Round Status -->
          <div
            v-if="currentRoundBet.hasBet"
            class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div class="text-sm font-medium text-yellow-800">
              Current Bet: ${{ currentRoundBet.betAmount }} on
              {{ currentRoundBet.betType?.toUpperCase() }}
            </div>
            <div class="text-xs text-yellow-600 mt-1">Waiting for hand to complete...</div>
          </div>
        </div>
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
        <BaccaratScoreboard />
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
import { useBettingInterface } from '@/composables/useBettingInterface';
import { useKeyboardControls } from '@/composables/useKeyboardControls';
import { useNotifications } from '@/composables/useNotifications';
import { GAME_SETTINGS } from '@/config/gameSettings';
import type { Rank } from '@/types/cards';

import SessionControl from '@/components/session/SessionControl.vue';
import CardCompositionChart from '@/components/charts/CardCompositionChart.vue';
import InfoSectionToggleButton from '@/components/common/button/InfoSectionToggleButton.vue';
import BaccaratScoreboard from '@/components/scoreboard/BaccaratScoreboard.vue';
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
import { usePayoutSettings } from '@/composables/usePayoutSettings';

// ✨ NEW: Import CurrentHandSection (CDD Architecture)
import { CurrentHandSection } from '@/components/session/sections';

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();
const { createHandResult } = useGameLogic();

// ✨ NEW: Live PayoutSettings integration (replaces hardcoded store.settings.payouts)
const { currentPayoutValues, payoutReference } = usePayoutSettings();

// ✨ UPDATED: Pass live payout values to betting interface for real-time calculations
const { settleCurrentBet, startNewRound } = useBettingInterface(
  computed(() => currentPayoutValues.value)
);

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
      const betResult = settleCurrentBet(handResult);

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
    }

    // Add the hand result to update pattern analysis and history
    store.addHandResult(handResult);
  }

  // Start new round - this clears the betting state
  startNewRound();

  // Force game sequence to update to ready_to_bet state after betting state is cleared
  // Use nextTick to ensure reactive state has updated first
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
// BALANCE INTEGRATION EVENT HANDLERS (Phase 5)
// =============================================================================

const handleHandCompleted = (handResult: any, betResult?: any): void => {
  console.log('[game-view][balance-integration] Hand completed', { handResult, betResult });

  if (betResult) {
    // Balance has already been updated by the CurrentHandSection/BettingInterface
    console.log('[game-view][balance-integration] Balance updated via bet settlement', {
      previousBalance: store.ui.currentBalance - betResult.netResult,
      newBalance: store.ui.currentBalance,
      netResult: betResult.netResult,
    });
  }

  // Continue with existing hand completion logic
  handleClearHand();
};

const handleHandCleared = (): void => {
  console.log('[game-view][balance-integration] Hand cleared');
  // Reset any UI state if needed
  startNewRound();
};

const handleBalanceUpdated = (newBalance: number): void => {
  console.log('[game-view][balance-integration] Balance updated', {
    previousBalance: store.ui.currentBalance,
    newBalance,
    change: newBalance - store.ui.currentBalance,
  });

  // Update store balance
  store.ui.currentBalance = newBalance;

  success(`💰 Balance updated: $${newBalance.toFixed(2)}`);
};

const handleBetSettled = (betResult: any): void => {
  console.log('[game-view][balance-integration] Bet settled', { betResult });

  // Balance update is handled via handleBalanceUpdated
  // This is just for additional bet settlement logic if needed
  const message = betResult.won
    ? `🎉 Won $${betResult.payout.toFixed(2)}!`
    : `💸 Lost $${Math.abs(betResult.netResult).toFixed(2)}`;

  success(message);
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
