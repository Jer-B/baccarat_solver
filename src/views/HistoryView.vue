<template>
  <div class="history-view">
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-800">Game History</h1>
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-600">
            Total Hands: <span class="font-semibold">{{ store.handHistory.length }}</span>
          </div>
          <button
            v-if="store.handHistory.length > 0"
            @click="clearHistory"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            :title="'Clear all game history'"
          >
            🗑️ Clear History
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div v-if="store.handHistory.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm text-blue-600 font-medium">Player Wins</div>
          <div class="text-2xl font-bold text-blue-800">{{ playerWins }}</div>
          <div class="text-xs text-blue-500">{{ playerWinPercentage }}%</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-sm text-red-600 font-medium">Banker Wins</div>
          <div class="text-2xl font-bold text-red-800">{{ bankerWins }}</div>
          <div class="text-xs text-red-500">{{ bankerWinPercentage }}%</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-sm text-green-600 font-medium">Ties</div>
          <div class="text-2xl font-bold text-green-800">{{ tieWins }}</div>
          <div class="text-xs text-green-500">{{ tieWinPercentage }}%</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-sm text-purple-600 font-medium">Pairs</div>
          <div class="text-2xl font-bold text-purple-800">{{ totalPairs }}</div>
          <div class="text-xs text-purple-500">{{ pairPercentage }}%</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="store.handHistory.length === 0" class="text-center py-12">
      <div class="bg-white rounded-lg shadow-md p-8">
        <div class="text-6xl mb-4">📊</div>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">No Game History Yet</h2>
        <p class="text-gray-500 mb-6">
          Start playing hands in the Game tab to see your history here.
        </p>
        <button
          @click="$emit('switch-to-game')"
          class="px-6 py-3 bg-baccarat-green text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Game
        </button>
      </div>
    </div>

    <!-- History Content (for future implementation) -->
    <div v-else class="space-y-6">
      <!-- Placeholder for future history features -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Recent Hands</h2>
        <div class="text-center py-8 text-gray-500">
          <div class="text-4xl mb-2">🚧</div>
          <p>Detailed history view coming soon...</p>
          <p class="text-sm mt-2">
            This will include hand-by-hand analysis, betting history, and pattern recognition.
          </p>
        </div>
      </div>

      <!-- Placeholder for charts -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Performance Charts</h2>
        <div class="text-center py-8 text-gray-500">
          <div class="text-4xl mb-2">📈</div>
          <p>Interactive charts and analytics coming soon...</p>
          <p class="text-sm mt-2">
            Win/loss trends, betting performance, and edge analysis over time.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';

console.log('[history-view][initialization] HistoryView component mounted');

// Emit events for parent component
defineEmits<{
  'switch-to-game': [];
}>();

// Store access
const store = useBaccaratStore();

// Computed statistics
const playerWins = computed(() => {
  console.log('[history-view][calculation] Calculating player wins');
  return store.handHistory.filter(hand => hand.winner === 'player').length;
});

const bankerWins = computed(() => {
  console.log('[history-view][calculation] Calculating banker wins');
  return store.handHistory.filter(hand => hand.winner === 'banker').length;
});

const tieWins = computed(() => {
  console.log('[history-view][calculation] Calculating tie wins');
  return store.handHistory.filter(hand => hand.winner === 'tie').length;
});

const totalPairs = computed(() => {
  console.log('[history-view][calculation] Calculating total pairs');
  return store.handHistory.filter(hand => hand.playerPair || hand.bankerPair).length;
});

const PERCENTAGE_MULTIPLIER = 100;

const playerWinPercentage = computed(() => {
  if (store.handHistory.length === 0) {
    return 0;
  }
  return Math.round((playerWins.value / store.handHistory.length) * PERCENTAGE_MULTIPLIER);
});

const bankerWinPercentage = computed(() => {
  if (store.handHistory.length === 0) {
    return 0;
  }
  return Math.round((bankerWins.value / store.handHistory.length) * PERCENTAGE_MULTIPLIER);
});

const tieWinPercentage = computed(() => {
  if (store.handHistory.length === 0) {
    return 0;
  }
  return Math.round((tieWins.value / store.handHistory.length) * PERCENTAGE_MULTIPLIER);
});

const pairPercentage = computed(() => {
  if (store.handHistory.length === 0) {
    return 0;
  }
  return Math.round((totalPairs.value / store.handHistory.length) * PERCENTAGE_MULTIPLIER);
});

// Methods
const clearHistory = (): void => {
  console.log('[history-view][user-action] Clearing game history');

  // eslint-disable-next-line no-alert
  if (confirm('Are you sure you want to clear all game history? This action cannot be undone.')) {
    store.clearHistory();
    console.log('[history-view][state] Game history cleared successfully');
  }
};
</script>

<style scoped>
.history-view {
  @apply max-w-7xl mx-auto;
}

/* Custom styles for baccarat theme */
.bg-baccarat-green {
  background-color: #059669;
}

.bg-baccarat-green:hover {
  background-color: #047857;
}
</style>
