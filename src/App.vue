<script setup lang="ts">
import { onMounted } from 'vue';
import { useBaccaratStore } from './stores/baccaratStore';

import { testSupabaseConnection } from './utils/testSupabase';
import BaccaratScoreboard from './components/scoreboard/BaccaratScoreboard.vue';
import TestHandsButton from './components/testing/TestHandsButton.vue';
import CardCompositionChart from './components/charts/CardCompositionChart.vue';
import PlayingCard from './components/cards/PlayingCard.vue';

const store = useBaccaratStore();

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
  store.shoe.currentHand = { player: [], banker: [] };
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
            <!-- Game Status -->
            <div class="flex items-center space-x-4 text-sm">
              <span>Remaining: {{ store.totalCardsRemaining }} cards</span>
              <span>Penetration: {{ (store.currentPenetration * 100).toFixed(1) }}%</span>
            </div>

            <!-- Settings Controls -->
            <div class="flex items-center space-x-4 text-sm">
              <!-- Number of Decks -->
              <div class="flex items-center space-x-2">
                <label class="text-white">Decks:</label>
                <select
                  v-model="store.settings.numberOfDecks"
                  class="text-gray-900 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option :value="6">6</option>
                  <option :value="8">8</option>
                </select>
              </div>

              <!-- Cut Card Position -->
              <div class="flex items-center space-x-2">
                <label class="text-white">Cut:</label>
                <input
                  v-model.number="store.settings.cutCardPosition"
                  type="number"
                  min="10"
                  max="50"
                  class="text-gray-900 rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              <!-- Toggle Settings -->
              <div class="flex items-center space-x-3">
                <label class="flex items-center space-x-1 cursor-pointer">
                  <input
                    v-model="store.settings.trackBurnedCards"
                    type="checkbox"
                    class="rounded text-baccarat-green focus:ring-white"
                  />
                  <span class="text-xs">Burned</span>
                </label>

                <label class="flex items-center space-x-1 cursor-pointer">
                  <input
                    v-model="store.settings.autoCalculateEdges"
                    type="checkbox"
                    class="rounded text-baccarat-green focus:ring-white"
                  />
                  <span class="text-xs">Auto</span>
                </label>

                <label class="flex items-center space-x-1 cursor-pointer">
                  <input
                    v-model="store.settings.showPatternAnalysis"
                    type="checkbox"
                    class="rounded text-baccarat-green focus:ring-white"
                  />
                  <span class="text-xs">Patterns</span>
                </label>

                <label class="flex items-center space-x-1 cursor-pointer">
                  <input
                    v-model="store.settings.isEdgeSortingEnabled"
                    type="checkbox"
                    class="rounded text-baccarat-green focus:ring-white"
                  />
                  <span class="text-xs">Edge Sort</span>
                </label>
              </div>
            </div>

            <!-- Test Buttons -->
            <TestHandsButton />

            <!-- Action Buttons -->
            <div class="flex items-center space-x-2">
              <button
                @click="clearCurrentHand()"
                class="btn-secondary text-sm"
                :disabled="
                  store.shoe.currentHand.player.length === 0 &&
                  store.shoe.currentHand.banker.length === 0
                "
              >
                Clear Hand
              </button>
              <button @click="store.initializeShoe()" class="btn-secondary text-sm">
                New Shoe
              </button>
            </div>
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

        <!-- Card Composition Chart -->
        <CardCompositionChart />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Current Hand -->
          <div class="lg:col-span-2">
            <div class="card">
              <h2 class="text-xl font-semibold mb-4">Current Hand</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-medium text-gray-700">Player</h3>
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
                    <h3 class="font-medium text-gray-700">Banker</h3>
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
            </div>
          </div>

          <!-- Edge Calculations -->
          <div>
            <div class="card">
              <h2 class="text-xl font-semibold mb-4">Current Edges</h2>
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
                  <span :class="getEdgeClass(store.edgeCalculations.playerPairEdge)">
                    {{ (store.edgeCalculations.playerPairEdge * 100).toFixed(3) }}%
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Banker Pair:</span>
                  <span :class="getEdgeClass(store.edgeCalculations.bankerPairEdge)">
                    {{ (store.edgeCalculations.bankerPairEdge * 100).toFixed(3) }}%
                  </span>
                </div>
                <div class="pt-2 border-t">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">Confidence:</span>
                    <span class="font-semibold">
                      {{ (store.edgeCalculations.confidence * 100).toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Best Bet Recommendation -->
        <div class="card bg-blue-50 border-blue-200">
          <h2 class="text-xl font-semibold mb-2 text-blue-800">Bet Recommendation</h2>
          <p class="text-blue-700">
            Best bet: <strong>{{ store.bestBetRecommendation.name }}</strong> ({{
              (store.bestBetRecommendation.edge * 100).toFixed(3)
            }}% edge)
          </p>
        </div>

        <!-- Scoreboard -->
        <BaccaratScoreboard />

        <!-- Pattern Analysis (moved from Analysis tab) -->
        <div v-if="store.settings.showPatternAnalysis" class="card">
          <h2 class="text-xl font-semibold mb-4">Pattern Analysis</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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
