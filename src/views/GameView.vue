<template>
  <div class="space-y-6">
    <!-- Session Control -->
    <SessionControl />

    <!-- Card Composition Chart -->
    <CardCompositionChart />

    <!-- Payout Settings -->
    <PayoutSettings />

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
          <InfoToggleButton
            type="section"
            section="pairAnalysis"
            subsection="legendInfo"
            variant="primary"
            size="xs"
          />
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
            <!-- Balance Setting -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
              <input
                v-model.number="bettingInterface.balance"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1000.00"
              />
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
              <InfoToggleButton
                type="section"
                section="bettingInterface"
                subsection="payoutInfo"
                variant="success"
                size="xs"
              />
            </div>
            <div
              v-if="visibilityStore.isVisible('bettingInterface', 'payoutInfo')"
              class="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600"
            >
              <div>Player: {{ store.settings.payouts.player }}:1</div>
              <div>
                Banker: {{ store.settings.payouts.banker }}:1 ({{
                  store.settings.payouts.bankerCommission * 100
                }}% commission)
              </div>
              <div>Tie: {{ store.settings.payouts.tie }}:1</div>
              <div>Player Pair: {{ store.settings.payouts.playerPair }}:1</div>
              <div>Banker Pair: {{ store.settings.payouts.bankerPair }}:1</div>
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
        <CurrentHandDisplay @clear-hand="handleClearHand" />
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
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { useGameLogic } from '@/composables/useGameLogic';
import { useBettingInterface } from '@/composables/useBettingInterface';

import SessionControl from '@/components/session/SessionControl.vue';
import CardCompositionChart from '@/components/charts/CardCompositionChart.vue';
import PayoutSettings from '@/components/settings/PayoutSettings.vue';
import InfoToggleButton from '@/components/common/button/InfoToggleButton.vue';
import BaccaratScoreboard from '@/components/scoreboard/BaccaratScoreboard.vue';
import ProfessionalBurnAnalysis from '@/components/analytics/ProfessionalBurnAnalysis.vue';
import ProfessionalRecommendations from '@/components/analytics/ProfessionalRecommendations.vue';
import DealerTellAnalysis from '@/components/analytics/DealerTellAnalysis.vue';
import BurnCardEstimator from '@/components/cards/BurnCardEstimator.vue';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics.vue';
import CurrentHandDisplay from '@/components/game/CurrentHandDisplay.vue';
import EdgeCalculationsPanel from '@/components/game/EdgeCalculationsPanel.vue';
import GameStatistics from '@/components/game/GameStatistics.vue';
import ProfessionalBurnCardAnalysis from '@/components/game/ProfessionalBurnCardAnalysis.vue';

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();
const { createHandResult } = useGameLogic();
const { settleCurrentBet, startNewRound } = useBettingInterface();

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
    }

    // Add the hand result to update pattern analysis and history
    store.addHandResult(handResult);
  }

  // Start new round
  startNewRound();
};
</script>
