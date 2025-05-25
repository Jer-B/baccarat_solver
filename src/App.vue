<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useBaccaratStore } from './stores/baccaratStore';

import { testSupabaseConnection } from './utils/testSupabase';
import BaccaratScoreboard from './components/scoreboard/BaccaratScoreboard.vue';
import TestHandsButton from './components/testing/TestHandsButton.vue';
import CardCompositionChart from './components/charts/CardCompositionChart.vue';
import PlayingCard from './components/cards/PlayingCard.vue';
import PayoutSettings from './components/settings/PayoutSettings.vue';
import AdvancedAnalytics from './components/analytics/AdvancedAnalytics.vue';
import SessionControl from './components/session/SessionControl.vue';

const store = useBaccaratStore();

// Betting Interface State
interface BettingPreset {
  balance: number;
  betAmount: number;
  selectedBet: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair';
}

const bettingInterface = reactive({
  balance: 1000,
  betAmount: 10,
  selectedBet: null as 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null,
  currentPreset: null as BettingPreset | null,
});

const tabs = [{ id: 'game', name: 'Game' }];

const getEdgeClass = (edge: number): string => {
  if (edge > 0) return 'edge-positive';
  if (edge < 0) return 'edge-negative';
  return 'edge-neutral';
};

// Hand summary methods
const getCurrentWinner = (): string => {
  const playerValue = store.currentHandValues.player;
  const bankerValue = store.currentHandValues.banker;

  if (playerValue > bankerValue) return 'Player';
  if (bankerValue > playerValue) return 'Banker';
  return 'Tie';
};

const getCurrentWinnerClass = (): string => {
  const winner = getCurrentWinner();
  if (winner === 'Player') return 'text-blue-600';
  if (winner === 'Banker') return 'text-red-600';
  return 'text-green-600';
};

const getHandStatus = (): string => {
  const playerCards = store.shoe.currentHand.player.length;
  const bankerCards = store.shoe.currentHand.banker.length;
  const playerValue = store.currentHandValues.player;
  const bankerValue = store.currentHandValues.banker;

  // Check for naturals
  if ((playerValue >= 8 || bankerValue >= 8) && playerCards === 2 && bankerCards === 2) {
    return 'Natural';
  }

  // Check if hand is complete (both have 2 or 3 cards)
  if (playerCards >= 2 && bankerCards >= 2) {
    if (playerCards === 2 && bankerCards === 2) {
      // Check if more cards needed based on baccarat rules
      if (playerValue <= 5 || bankerValue <= 5) {
        return 'In Progress';
      }
      return 'Complete';
    }
    return 'Complete';
  }

  return 'In Progress';
};

const clearCurrentHand = (): void => {
  // Only allow clearing if session is active and there's actually a hand to clear
  if (!store.canPerformActions || !store.hasHandToClear) {
    return;
  }

  // If there was a bet placed and cards were dealt, settle the bet first
  if (
    currentRoundBet.hasBet &&
    (store.shoe.currentHand.player.length > 0 || store.shoe.currentHand.banker.length > 0)
  ) {
    // Create a mock hand result for settlement (in real app, this would come from actual hand completion)
    const mockResult: {
      winner: 'player' | 'banker' | 'tie';
      playerPair: boolean;
      bankerPair: boolean;
    } = {
      winner: 'player', // This should be determined by actual hand logic
      playerPair: false,
      bankerPair: false,
    };
    settleCurrentBet(mockResult);
  }

  // Clear the hand and start new round
  store.shoe.currentHand = { player: [], banker: [] };
  startNewRound();
};

// Betting Interface Methods
// Betting state for current round
const currentRoundBet = reactive({
  hasBet: false,
  betType: null as 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null,
  betAmount: 0,
});

const isBettingAllowed = (): boolean => {
  // Betting is only allowed when session is active and no cards are on the table (new round)
  return (
    store.canPerformActions &&
    store.shoe.currentHand.player.length === 0 &&
    store.shoe.currentHand.banker.length === 0
  );
};

const placeBet = (): void => {
  if (!bettingInterface.selectedBet || !bettingInterface.betAmount) {
    alert('Please select a bet type and enter a bet amount');
    return;
  }

  if (!isBettingAllowed()) {
    alert('Betting is closed! Cards are already on the table. Wait for the next round.');
    return;
  }

  if (currentRoundBet.hasBet) {
    alert('You have already placed a bet for this round. Wait for the hand to complete.');
    return;
  }

  if (bettingInterface.betAmount > bettingInterface.balance) {
    alert('Insufficient balance for this bet amount.');
    return;
  }

  // Place the bet for this round
  currentRoundBet.hasBet = true;
  currentRoundBet.betType = bettingInterface.selectedBet;
  currentRoundBet.betAmount = bettingInterface.betAmount;

  // Deduct bet amount from balance immediately
  bettingInterface.balance -= bettingInterface.betAmount;

  alert(
    `Bet placed: $${bettingInterface.betAmount} on ${bettingInterface.selectedBet}. Waiting for hand to complete...`
  );

  // Clear selection for next round
  bettingInterface.selectedBet = null;
};

const settleCurrentBet = (handResult: {
  winner: 'player' | 'banker' | 'tie';
  playerPair: boolean;
  bankerPair: boolean;
}): void => {
  if (!currentRoundBet.hasBet || !currentRoundBet.betType) return;

  let payout = 0;
  let won = false;
  const payouts = store.settings.payouts;

  switch (currentRoundBet.betType) {
    case 'player':
      won = handResult.winner === 'player';
      payout = won ? currentRoundBet.betAmount * (payouts.player + 1) : 0; // Return original bet + winnings
      break;
    case 'banker':
      won = handResult.winner === 'banker';
      if (won) {
        const winnings = currentRoundBet.betAmount * payouts.banker;
        const commission = winnings * payouts.bankerCommission;
        payout = currentRoundBet.betAmount + winnings - commission; // Original bet + winnings - commission
      } else {
        payout = 0;
      }
      break;
    case 'tie':
      won = handResult.winner === 'tie';
      payout = won ? currentRoundBet.betAmount * (payouts.tie + 1) : 0; // Return original bet + winnings
      break;
    case 'playerPair':
      won = handResult.playerPair;
      payout = won ? currentRoundBet.betAmount * (payouts.playerPair + 1) : 0; // Return original bet + winnings
      break;
    case 'bankerPair':
      won = handResult.bankerPair;
      payout = won ? currentRoundBet.betAmount * (payouts.bankerPair + 1) : 0; // Return original bet + winnings
      break;
  }

  // Add payout to balance
  bettingInterface.balance += payout;

  // Record the bet in statistics
  store.recordBet(currentRoundBet.betType, currentRoundBet.betAmount, handResult);

  // Show result
  const result = won ? 'WON' : 'LOST';
  const netResult = payout - currentRoundBet.betAmount;
  const resultText = netResult >= 0 ? `+$${netResult.toFixed(2)}` : `$${netResult.toFixed(2)}`;
  alert(`${result}! ${resultText} - New Balance: $${bettingInterface.balance.toFixed(2)}`);

  // Reset bet for next round
  currentRoundBet.hasBet = false;
  currentRoundBet.betType = null;
  currentRoundBet.betAmount = 0;
};

const startNewRound = (): void => {
  // This should be called when starting a new round (clearing current hand)
  currentRoundBet.hasBet = false;
  currentRoundBet.betType = null;
  currentRoundBet.betAmount = 0;
};

const canClearHand = (): boolean => {
  // Can only clear hand if session is active and there's something to clear (hand or bet)
  return store.canPerformActions && (store.hasHandToClear || currentRoundBet.hasBet);
};

onMounted(async () => {
  store.initializeShoe();

  // Test Supabase connection
  await testSupabaseConnection();
});
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-baccarat-green text-white shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Advanced Baccarat Assistant</h1>
          <div class="flex items-center space-x-6">
            <!-- Global Toggle Control -->
            <div class="flex items-center space-x-2">
              <label class="text-sm text-white">Info Panels:</label>
              <button
                @click="store.toggleGlobalVisibility()"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  store.ui.globalToggleMode
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700',
                ]"
                :title="store.ui.globalToggleMode ? 'Hide all info panels' : 'Show all info panels'"
              >
                {{ store.ui.globalToggleMode ? '👁️ Visible' : '👁️‍🗨️ Hidden' }}
              </button>
            </div>

            <!-- Test Buttons -->
            <TestHandsButton :disabled="!store.canPerformActions" />
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4">
        <div class="flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="store.ui.selectedTab = tab.id"
            :class="[
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              store.ui.selectedTab === tab.id
                ? 'border-baccarat-green text-baccarat-green'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Game Tab -->
      <div v-if="store.ui.selectedTab === 'game'" class="space-y-6">
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
              <span
                :class="getEdgeClass(store.edgeCalculations.playerPairEdge)"
                class="font-semibold"
              >
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
              <button
                @click="
                  store.ui.visibility.pairAnalysis.legendInfo =
                    !store.ui.visibility.pairAnalysis.legendInfo
                "
                class="text-xs px-2 py-1 bg-purple-200 hover:bg-purple-300 text-purple-800 rounded transition-colors"
                :title="
                  store.ui.visibility.pairAnalysis.legendInfo
                    ? 'Hide legend details'
                    : 'Show legend details'
                "
              >
                {{ store.ui.visibility.pairAnalysis.legendInfo ? '👁️ Hide' : '👁️‍🗨️ Show' }}
              </button>
            </div>
            <div
              v-if="store.isVisible('pairAnalysis', 'legendInfo')"
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
                  <span class="inline-block w-3 h-3 bg-green-200 rounded mr-2"></span>Green: &gt;8%
                  pair probability (FAVORABLE!)
                </div>
                <div>
                  <span class="inline-block w-3 h-3 bg-yellow-200 rounded mr-2"></span>Yellow: 6-8%
                  pair probability
                </div>
                <div>
                  <span class="inline-block w-3 h-3 bg-red-200 rounded mr-2"></span>Red: &lt;6% pair
                  probability
                </div>
              </div>
            </div>
            <div
              v-if="store.isVisible('pairAnalysis', 'legendInfo')"
              class="mt-2 text-xs text-gray-500 italic"
            >
              Probability = chance of getting a pair in the next 2 cards dealt. Pair bets typically
              pay 11:1.
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Betting Interface -->
          <div class="lg:col-span-3">
            <div class="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <h2 class="text-xl font-semibold mb-4 text-green-800">
                Betting Interface & Statistics
              </h2>

              <!-- Betting Controls -->
              <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
                <!-- Balance Setting -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Current Balance</label
                  >
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
                    <button
                      @click="bettingInterface.selectedBet = 'playerPair'"
                      :class="[
                        'px-2 py-2 rounded-md font-medium transition-colors text-xs',
                        bettingInterface.selectedBet === 'playerPair'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                      ]"
                      :title="'Player Pair: Bet that Player\'s first 2 cards will be the same rank (e.g., two 8s). Pays 11:1'"
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
                      :title="'Banker Pair: Bet that Banker\'s first 2 cards will be the same rank (e.g., two Kings). Pays 11:1'"
                    >
                      B Pair
                    </button>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-2">
                  <button
                    @click="placeBet()"
                    :disabled="
                      !bettingInterface.selectedBet ||
                      !bettingInterface.betAmount ||
                      !isBettingAllowed() ||
                      currentRoundBet.hasBet
                    "
                    :class="[
                      'w-full px-4 py-2 rounded-md font-medium transition-colors text-sm',
                      isBettingAllowed() && !currentRoundBet.hasBet
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed',
                    ]"
                  >
                    {{
                      currentRoundBet.hasBet
                        ? 'Bet Placed'
                        : !isBettingAllowed()
                          ? 'Betting Closed'
                          : 'Place Bet'
                    }}
                  </button>
                  <button
                    @click="
                      startNewRound();
                      store.resetBettingStats();
                    "
                    :class="[
                      'w-full px-4 py-2 rounded-md font-medium transition-colors text-sm',
                      store.canPerformActions
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed',
                    ]"
                    :disabled="!store.canPerformActions"
                  >
                    New Round & Reset
                  </button>
                </div>

                <!-- Betting Status & Quick Stats -->
                <div class="text-center space-y-2">
                  <!-- Current Round Bet Status -->
                  <div
                    v-if="currentRoundBet.hasBet"
                    class="p-2 bg-yellow-100 border border-yellow-300 rounded-md"
                  >
                    <div class="text-sm font-semibold text-yellow-800">Current Bet</div>
                    <div class="text-xs text-yellow-700">
                      ${{ currentRoundBet.betAmount }} on {{ currentRoundBet.betType }}
                    </div>
                  </div>

                  <!-- Betting Status Indicator -->
                  <div
                    class="p-2 rounded-md"
                    :class="
                      isBettingAllowed()
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-red-100 border border-red-300'
                    "
                  >
                    <div
                      class="text-sm font-semibold"
                      :class="isBettingAllowed() ? 'text-green-800' : 'text-red-800'"
                    >
                      {{ isBettingAllowed() ? '🟢 Betting Open' : '🔴 Betting Closed' }}
                    </div>
                    <div
                      class="text-xs"
                      :class="isBettingAllowed() ? 'text-green-700' : 'text-red-700'"
                    >
                      {{ isBettingAllowed() ? 'Place your bets!' : 'Cards in play' }}
                    </div>
                  </div>

                  <!-- Quick Stats -->
                  <div>
                    <div
                      class="text-lg font-bold"
                      :class="
                        store.bettingStats.totalWinLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      "
                    >
                      {{ store.bettingStats.totalWinLoss >= 0 ? '+' : '' }}${{
                        store.bettingStats.totalWinLoss.toFixed(2)
                      }}
                    </div>
                    <div class="text-xs text-gray-600">Total P&L</div>
                    <div class="text-sm font-medium">
                      {{ (store.bettingStats.winRate * 100).toFixed(1) }}% Win Rate
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payout Information -->
              <div class="mt-4 p-3 bg-gray-50 rounded-lg border">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-semibold text-gray-800">💰 Payout Information</h4>
                  <button
                    @click="
                      store.ui.visibility.bettingInterface.payoutInfo =
                        !store.ui.visibility.bettingInterface.payoutInfo
                    "
                    class="text-xs px-2 py-1 bg-green-200 hover:bg-green-300 text-green-800 rounded transition-colors"
                    :title="
                      store.ui.visibility.bettingInterface.payoutInfo
                        ? 'Hide payout details'
                        : 'Show payout details'
                    "
                  >
                    {{ store.ui.visibility.bettingInterface.payoutInfo ? '👁️ Hide' : '👁️‍🗨️ Show' }}
                  </button>
                </div>
                <div
                  v-if="store.isVisible('bettingInterface', 'payoutInfo')"
                  class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs"
                >
                  <div class="space-y-1">
                    <div class="flex justify-between">
                      <span class="text-blue-600 font-medium">Player:</span>
                      <span>{{ store.settings.payouts.player }}:1</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-red-600 font-medium">Banker:</span>
                      <span
                        >{{ store.settings.payouts.banker }}:1 minus
                        {{ (store.settings.payouts.bankerCommission * 100).toFixed(1) }}%
                        commission</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span class="text-green-600 font-medium">Tie:</span>
                      <span>{{ store.settings.payouts.tie }}:1</span>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div class="flex justify-between">
                      <span class="text-purple-600 font-medium">Player Pair:</span>
                      <span>{{ store.settings.payouts.playerPair }}:1</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-orange-600 font-medium">Banker Pair:</span>
                      <span>{{ store.settings.payouts.bankerPair }}:1</span>
                    </div>
                  </div>
                </div>
                <div
                  v-if="store.isVisible('bettingInterface', 'payoutInfo')"
                  class="mt-2 pt-2 border-t border-gray-200"
                >
                  <div class="text-xs text-gray-600">
                    <strong>Pair Bets:</strong> Win when the first 2 cards of the chosen side have
                    the same rank (e.g., two 8s, two Kings).
                  </div>
                  <div class="text-xs text-gray-600 mt-1">
                    <strong>Commission:</strong> Banker bet commission is
                    {{ (store.settings.payouts.bankerCommission * 100).toFixed(1) }}% on winnings.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Current Hand -->
          <div class="lg:col-span-2">
            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold">Current Hand</h2>
                <button
                  @click="clearCurrentHand()"
                  :class="[
                    'px-3 py-1 rounded-md text-sm transition-colors',
                    canClearHand()
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed',
                  ]"
                  :disabled="!canClearHand()"
                >
                  {{ currentRoundBet.hasBet ? 'Complete Round' : 'Clear Hand' }}
                </button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <h3 class="font-medium text-gray-700">Player</h3>
                      <!-- Player Kanji SVG -->
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
                    </div>
                    <div class="flex items-center space-x-2">
                      <div
                        class="text-lg font-bold"
                        :class="[
                          store.shoe.currentHand.player.length > 0
                            ? 'text-blue-600'
                            : 'text-gray-400',
                          store.currentHandValues.player >= 8 &&
                          store.shoe.currentHand.player.length > 0
                            ? 'bg-yellow-100 px-2 py-1 rounded'
                            : '',
                        ]"
                      >
                        {{
                          store.shoe.currentHand.player.length > 0
                            ? store.currentHandValues.player
                            : '-'
                        }}
                      </div>
                      <div
                        v-if="
                          store.currentHandValues.player >= 8 &&
                          store.shoe.currentHand.player.length > 0
                        "
                        class="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded"
                      >
                        Natural
                      </div>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <PlayingCard
                      v-for="(card, index) in store.shoe.currentHand.player"
                      :key="index"
                      :card="card"
                      size="medium"
                      :horizontal="index === 2"
                    />
                    <PlayingCard
                      v-if="store.shoe.currentHand.player.length === 0"
                      is-card-back
                      size="medium"
                    />
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <h3 class="font-medium text-gray-700">Banker</h3>
                      <!-- Banker Kanji SVG -->
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
                    </div>
                    <div class="flex items-center space-x-2">
                      <div
                        class="text-lg font-bold"
                        :class="[
                          store.shoe.currentHand.banker.length > 0
                            ? 'text-red-600'
                            : 'text-gray-400',
                          store.currentHandValues.banker >= 8 &&
                          store.shoe.currentHand.banker.length > 0
                            ? 'bg-yellow-100 px-2 py-1 rounded'
                            : '',
                        ]"
                      >
                        {{
                          store.shoe.currentHand.banker.length > 0
                            ? store.currentHandValues.banker
                            : '-'
                        }}
                      </div>
                      <div
                        v-if="
                          store.currentHandValues.banker >= 8 &&
                          store.shoe.currentHand.banker.length > 0
                        "
                        class="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded"
                      >
                        Natural
                      </div>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <PlayingCard
                      v-for="(card, index) in store.shoe.currentHand.banker"
                      :key="index"
                      :card="card"
                      size="medium"
                      :horizontal="index === 2"
                    />
                    <PlayingCard
                      v-if="store.shoe.currentHand.banker.length === 0"
                      is-card-back
                      size="medium"
                    />
                  </div>
                </div>
              </div>

              <!-- Hand Summary -->
              <div
                v-if="
                  store.shoe.currentHand.player.length > 0 &&
                  store.shoe.currentHand.banker.length > 0
                "
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
                      {{
                        store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length
                      }}
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

              <!-- Quick Payout Reference -->
              <div class="mt-4 pt-4 border-t border-gray-200">
                <h4 class="text-sm font-semibold text-gray-800 mb-2">💰 Quick Payout Reference</h4>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="space-y-1">
                    <div class="flex justify-between">
                      <span class="text-blue-600 font-medium">Player:</span>
                      <span>{{ store.settings.payouts.player }}:1</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-red-600 font-medium">Banker:</span>
                      <span
                        >{{ store.settings.payouts.banker }}:1 (-{{
                          (store.settings.payouts.bankerCommission * 100).toFixed(1)
                        }}%)</span
                      >
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div class="flex justify-between">
                      <span class="text-green-600 font-medium">Tie:</span>
                      <span>{{ store.settings.payouts.tie }}:1</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-purple-600 font-medium">Pairs:</span>
                      <span>{{ store.settings.payouts.playerPair }}:1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Edge Calculations -->
          <div>
            <div class="card">
              <h2 class="text-xl font-semibold mb-4">Current Edges</h2>

              <!-- Bet Recommendation at top -->
              <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 class="text-sm font-semibold text-blue-800 mb-2">Recommended Bet</h3>
                <div class="space-y-2">
                  <!-- Basic Edge Recommendation -->
                  <div class="text-blue-700">
                    <strong>{{ store.bestBetRecommendation.name }}</strong>
                    <span class="text-sm"
                      >({{ (store.bestBetRecommendation.edge * 100).toFixed(3) }}% edge)</span
                    >
                  </div>

                  <!-- Kelly Criterion Recommendation -->
                  <div class="text-xs text-gray-600">
                    <span class="font-medium">Kelly:</span>
                    <span v-if="store.kellyBestBet" class="text-purple-700">
                      {{ store.kellyBestBet.name }} ({{
                        (store.kellyBestBet.kellyPercentage * 100).toFixed(2)
                      }}% of bankroll)
                    </span>
                    <span v-else class="text-gray-500">-</span>
                  </div>

                  <!-- Monte Carlo Recommendation -->
                  <div class="text-xs text-gray-600">
                    <span class="font-medium">Monte Carlo:</span>
                    <span v-if="store.monteCarloBestBet" class="text-green-700">
                      {{ store.monteCarloBestBet.name }} ({{
                        (store.monteCarloBestBet.riskAdjustedScore * 100).toFixed(3)
                      }}% risk-adj.)
                    </span>
                    <span v-else class="text-gray-500">-</span>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Player:</span>
                  <span :class="getEdgeClass(store.edgeCalculations.playerEdge)">
                    {{ (store.edgeCalculations.playerEdge * 100).toFixed(3) }}%
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Banker:</span>
                  <span :class="getEdgeClass(store.edgeCalculations.bankerEdge)">
                    {{ (store.edgeCalculations.bankerEdge * 100).toFixed(3) }}%
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Tie:</span>
                  <span :class="getEdgeClass(store.edgeCalculations.tieEdge)">
                    {{ (store.edgeCalculations.tieEdge * 100).toFixed(3) }}%
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Player Pair:</span>
                  <div class="flex items-center space-x-2">
                    <span :class="getEdgeClass(store.edgeCalculations.playerPairEdge)">
                      {{ (store.edgeCalculations.playerPairEdge * 100).toFixed(3) }}%
                    </span>
                    <span
                      v-if="store.edgeCalculations.playerPairEdge > 0"
                      class="text-xs bg-green-100 text-green-800 px-1 rounded"
                    >
                      FAVORABLE!
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Banker Pair:</span>
                  <div class="flex items-center space-x-2">
                    <span :class="getEdgeClass(store.edgeCalculations.bankerPairEdge)">
                      {{ (store.edgeCalculations.bankerPairEdge * 100).toFixed(3) }}%
                    </span>
                    <span
                      v-if="store.edgeCalculations.bankerPairEdge > 0"
                      class="text-xs bg-green-100 text-green-800 px-1 rounded"
                    >
                      FAVORABLE!
                    </span>
                  </div>
                </div>
                <div class="pt-2 border-t space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">Confidence:</span>
                    <span class="font-semibold">
                      {{ (store.edgeCalculations.confidence * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">Edge Sorting:</span>
                    <div class="flex items-center space-x-2">
                      <span :class="getEdgeClass(store.edgeCalculations.edgeSortingAdvantage)">
                        {{ (store.edgeCalculations.edgeSortingAdvantage * 100).toFixed(3) }}%
                      </span>
                      <span
                        v-if="store.edgeCalculations.edgeSortingAdvantage > 0.01"
                        class="text-xs bg-yellow-100 text-yellow-800 px-1 rounded"
                      >
                        HIGH ADVANTAGE!
                      </span>
                      <span
                        v-else-if="store.edgeCalculations.edgeSortingAdvantage > 0"
                        class="text-xs bg-green-100 text-green-800 px-1 rounded"
                      >
                        ADVANTAGE
                      </span>
                      <span class="text-xs bg-blue-100 text-blue-800 px-1 rounded"> ACTIVE </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Analytics -->
        <AdvancedAnalytics />

        <!-- Game Statistics -->
        <div class="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h2 class="text-xl font-semibold mb-4 text-blue-800">Game Statistics</h2>

          <!-- Primary Stats Row -->
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ store.bettingStats.totalHands }}
              </div>
              <div class="text-xs text-gray-600">Total Hands</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ store.bettingStats.correctBets }}
              </div>
              <div class="text-xs text-gray-600">Correct Bets</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">
                {{ store.bettingStats.incorrectBets }}
              </div>
              <div class="text-xs text-gray-600">Incorrect Bets</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">
                ${{ store.bettingStats.totalAmountWagered.toFixed(0) }}
              </div>
              <div class="text-xs text-gray-600">Total Wagered</div>
            </div>
            <div class="text-center">
              <div
                class="text-2xl font-bold"
                :class="store.bettingStats.totalWinLoss >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ store.bettingStats.totalWinLoss >= 0 ? '+' : '' }}${{
                  store.bettingStats.totalWinLoss.toFixed(0)
                }}
              </div>
              <div class="text-xs text-gray-600">Total Win/Loss</div>
            </div>
            <div class="text-center">
              <div
                class="text-2xl font-bold"
                :class="store.bettingStats.winRate >= 0.5 ? 'text-green-600' : 'text-red-600'"
              >
                {{ (store.bettingStats.winRate * 100).toFixed(1) }}%
              </div>
              <div class="text-xs text-gray-600">Win Rate</div>
            </div>
            <div class="text-center">
              <div
                class="text-2xl font-bold"
                :class="store.bettingStats.roi >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ (store.bettingStats.roi * 100).toFixed(1) }}%
              </div>
              <div class="text-xs text-gray-600">ROI</div>
            </div>
          </div>

          <!-- Advanced Analytics -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <!-- Accuracy Metrics -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-700">Accuracy Metrics</h4>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span>Edge Sorting Accuracy:</span>
                  <span
                    class="font-medium"
                    :class="
                      store.bettingStats.edgeSortingAccuracy >= 0.6
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                  >
                    {{ (store.bettingStats.edgeSortingAccuracy * 100).toFixed(1) }}%
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>Pair Bet Accuracy:</span>
                  <span
                    class="font-medium"
                    :class="
                      store.bettingStats.pairBetAccuracy >= 0.5 ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ (store.bettingStats.pairBetAccuracy * 100).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- Streak Analysis -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-700">Streak Analysis</h4>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span>Current Streak:</span>
                  <span
                    class="font-medium"
                    :class="
                      store.bettingStats.currentStreakType === 'win'
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                  >
                    {{ store.bettingStats.currentStreak }}
                    {{ store.bettingStats.currentStreakType }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>Longest Win Streak:</span>
                  <span class="font-medium text-green-600">{{
                    store.bettingStats.longestWinStreak
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Longest Loss Streak:</span>
                  <span class="font-medium text-red-600">{{
                    store.bettingStats.longestLossStreak
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Financial Metrics -->
            <div class="space-y-2">
              <h4 class="font-medium text-gray-700">Financial Metrics</h4>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span>Average Bet Size:</span>
                  <span class="font-medium"
                    >${{ store.bettingStats.averageBetSize.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span>Biggest Win:</span>
                  <span class="font-medium text-green-600"
                    >${{ store.bettingStats.biggestWin.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span>Biggest Loss:</span>
                  <span class="font-medium text-red-600"
                    >${{ store.bettingStats.biggestLoss.toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Hand Distribution -->
          <div class="pt-4 border-t">
            <h4 class="font-medium text-gray-700 mb-2">Hand Distribution</h4>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">
                  {{ store.bettingStats.profitableHands }}
                </div>
                <div class="text-xs text-gray-600">Profitable Hands</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-600">
                  {{ store.bettingStats.breakEvenHands }}
                </div>
                <div class="text-xs text-gray-600">Break Even</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-red-600">
                  {{ store.bettingStats.losingHands }}
                </div>
                <div class="text-xs text-gray-600">Losing Hands</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Scoreboard -->
        <BaccaratScoreboard />

        <!-- Pattern Analysis (moved from Analysis tab) -->
        <div v-if="store.settings.showPatternAnalysis" class="card">
          <h2 class="text-xl font-semibold mb-4">Pattern Analysis</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ store.patternAnalysis.streakAnalysis.currentPlayerStreak }}
              </div>
              <div class="text-sm text-gray-600">Current Player Streak</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">
                {{ store.patternAnalysis.streakAnalysis.currentBankerStreak }}
              </div>
              <div class="text-sm text-gray-600">Current Banker Streak</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ store.patternAnalysis.streakAnalysis.currentTieStreak }}
              </div>
              <div class="text-sm text-gray-600">Current Tie Streak</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-500">
                {{ store.patternAnalysis.streakAnalysis.longestPlayerStreak }}
              </div>
              <div class="text-sm text-gray-600">Longest Player Streak</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-500">
                {{ store.patternAnalysis.streakAnalysis.longestBankerStreak }}
              </div>
              <div class="text-sm text-gray-600">Longest Banker Streak</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-500">
                {{ store.patternAnalysis.streakAnalysis.longestTieStreak }}
              </div>
              <div class="text-sm text-gray-600">Longest Tie Streak</div>
            </div>
          </div>
        </div>

        <!-- Burned Cards Analysis -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Burned Cards Analysis</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-medium text-gray-700 mb-2">
                Total Burned: {{ store.burnedCardAnalysis.totalBurned }}
              </h3>
              <div class="text-sm text-gray-600">
                Confidence Level: {{ (store.burnedCardAnalysis.confidenceLevel * 100).toFixed(1) }}%
              </div>
            </div>
            <div>
              <h3 class="font-medium text-gray-700 mb-2">Impact</h3>
              <div class="text-sm text-gray-600">
                Estimated Impact: {{ store.burnedCardAnalysis.estimatedImpact.toFixed(3) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
