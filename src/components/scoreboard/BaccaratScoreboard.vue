<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Scoreboard</h3>
      <div class="flex gap-2">
        <button
          @click="activeView = 'bigroad'"
          :class="[
            'px-3 py-1 text-sm rounded',
            activeView === 'bigroad'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          Big Road
        </button>
        <button
          @click="activeView = 'beadplate'"
          :class="[
            'px-3 py-1 text-sm rounded',
            activeView === 'beadplate'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          Bead Plate
        </button>
        <button
          @click="clearScoreboard"
          class="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Game Statistics -->
    <div class="grid grid-cols-4 gap-4 mb-4 text-center">
      <div class="bg-blue-50 p-2 rounded">
        <div class="text-2xl font-bold text-blue-600">{{ stats.player }}</div>
        <div class="text-xs text-gray-600">Player</div>
      </div>
      <div class="bg-red-50 p-2 rounded">
        <div class="text-2xl font-bold text-red-600">{{ stats.banker }}</div>
        <div class="text-xs text-gray-600">Banker</div>
      </div>
      <div class="bg-green-50 p-2 rounded">
        <div class="text-2xl font-bold text-green-600">{{ stats.tie }}</div>
        <div class="text-xs text-gray-600">Tie</div>
      </div>
      <div class="bg-gray-50 p-2 rounded">
        <div class="text-2xl font-bold text-gray-600">{{ stats.total }}</div>
        <div class="text-xs text-gray-600">Total</div>
      </div>
    </div>

    <!-- Big Road View -->
    <div v-if="activeView === 'bigroad'" class="scoreboard-container">
      <div class="big-road-grid">
        <div v-for="(row, rowIndex) in bigRoadGrid" :key="rowIndex" class="big-road-row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="[
              'big-road-cell',
              cell.result ? `result-${cell.result}` : 'empty',
              cell.pair ? 'has-pair' : '',
            ]"
            :title="getCellTooltip(cell)"
          >
            <span v-if="cell.result" class="result-text">
              {{ getResultSymbol(cell.result) }}
            </span>
            <div v-if="cell.pair" class="pair-indicators">
              <span v-if="cell.playerPair" class="pair-dot player-pair">•</span>
              <span v-if="cell.bankerPair" class="pair-dot banker-pair">•</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bead Plate View -->
    <div v-if="activeView === 'beadplate'" class="scoreboard-container">
      <div class="bead-plate-grid">
        <div v-for="(row, rowIndex) in beadPlateGrid" :key="rowIndex" class="bead-plate-row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="['bead-plate-cell', cell.result ? `bead-${cell.result}` : 'empty']"
            :title="getCellTooltip(cell)"
          >
            <div v-if="cell.result" class="bead-content">
              <div :class="['bead-circle', `bead-${cell.result}`]">
                {{ getResultSymbol(cell.result) }}
              </div>
              <div v-if="cell.pair" class="bead-pairs">
                <span v-if="cell.playerPair" class="bead-pair-dot">P</span>
                <span v-if="cell.bankerPair" class="bead-pair-dot">B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Streak Info -->
    <div class="mt-4 p-3 bg-gray-50 rounded">
      <div class="flex justify-between items-center text-sm">
        <div>
          <span class="font-medium">Current Streak:</span>
          <span
            :class="[
              'ml-2 px-2 py-1 rounded text-white',
              currentStreak.type === 'player'
                ? 'bg-blue-500'
                : currentStreak.type === 'banker'
                  ? 'bg-red-500'
                  : 'bg-green-500',
            ]"
          >
            {{ getResultSymbol(currentStreak.type) }} × {{ currentStreak.count }}
          </span>
        </div>
        <div>
          <span class="font-medium">Hand #{{ handNumber }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import type { HandResult } from '@/types/cards';

interface ScoreboardCell {
  result: 'player' | 'banker' | 'tie' | null;
  playerPair: boolean;
  bankerPair: boolean;
  handNumber: number;
}

const store = useBaccaratStore();
const activeView = ref<'bigroad' | 'beadplate'>('bigroad');

// Grid dimensions
const GRID_ROWS = 6;
const GRID_COLS = 20;
const BEAD_ROWS = 6;
const BEAD_COLS = 22;

// Initialize grids
const bigRoadGrid = ref<ScoreboardCell[][]>(
  Array(GRID_ROWS)
    .fill(null)
    .map(() =>
      Array(GRID_COLS)
        .fill(null)
        .map(() => ({
          result: null,
          playerPair: false,
          bankerPair: false,
          handNumber: 0,
        }))
    )
);

const beadPlateGrid = ref<ScoreboardCell[][]>(
  Array(BEAD_ROWS)
    .fill(null)
    .map(() =>
      Array(BEAD_COLS)
        .fill(null)
        .map(() => ({
          result: null,
          playerPair: false,
          bankerPair: false,
          handNumber: 0,
        }))
    )
);

// Game statistics
const stats = computed(() => {
  const hands = store.handHistory;
  return {
    player: hands.filter(h => h.winner === 'player').length,
    banker: hands.filter(h => h.winner === 'banker').length,
    tie: hands.filter(h => h.winner === 'tie').length,
    total: hands.length,
  };
});

// Current hand number
const handNumber = computed(() => store.handHistory.length + 1);

// Current streak calculation
const currentStreak = computed(() => {
  const hands = store.handHistory;
  if (hands.length === 0) {
    return { type: 'player', count: 0 };
  }

  const lastResult = hands[hands.length - 1].winner;
  let count = 1;

  for (let i = hands.length - 2; i >= 0; i--) {
    if (hands[i].winner === lastResult) {
      count++;
    } else {
      break;
    }
  }

  return { type: lastResult, count };
});

// Watch for new hands and update scoreboards
watch(
  () => store.handHistory,
  (newHands: HandResult[]) => {
    updateBigRoad(newHands);
    updateBeadPlate(newHands);
  },
  { deep: true }
);

// Big Road Logic - Columns for streaks, rows for alternating
function updateBigRoad(hands: HandResult[]) {
  // Clear grid
  bigRoadGrid.value = Array(GRID_ROWS)
    .fill(null)
    .map(() =>
      Array(GRID_COLS)
        .fill(null)
        .map(() => ({
          result: null,
          playerPair: false,
          bankerPair: false,
          handNumber: 0,
        }))
    );

  let currentCol = 0;
  let currentRow = 0;
  let lastResult: string | null = null;

  hands.forEach((hand, index) => {
    const result = hand.winner;

    // Skip ties for Big Road (they get marked differently)
    if (result === 'tie') {
      // Mark tie on the last non-tie result
      if (currentCol > 0 || currentRow > 0) {
        const targetCol = Math.max(0, currentCol - (currentRow === 0 ? 1 : 0));
        const targetRow = currentRow === 0 ? 0 : currentRow - 1;
        if (bigRoadGrid.value[targetRow] && bigRoadGrid.value[targetRow][targetCol]) {
          // Add tie indicator (will be shown differently)
        }
      }
      return;
    }

    // Place the result
    if (currentRow < GRID_ROWS && currentCol < GRID_COLS) {
      bigRoadGrid.value[currentRow][currentCol] = {
        result: result as 'player' | 'banker',
        playerPair: hand.playerPair,
        bankerPair: hand.bankerPair,
        handNumber: index + 1,
      };
    }

    // Determine next position
    if (result === lastResult) {
      // Same result - go down in same column
      currentRow++;
      if (currentRow >= GRID_ROWS) {
        // Column full, move to next column
        currentCol++;
        currentRow = 0;
      }
    } else {
      // Different result - new column
      currentCol++;
      currentRow = 0;
      lastResult = result;
    }
  });
}

// Bead Plate Logic - Simple left-to-right, top-to-bottom
function updateBeadPlate(hands: HandResult[]) {
  // Clear grid
  beadPlateGrid.value = Array(BEAD_ROWS)
    .fill(null)
    .map(() =>
      Array(BEAD_COLS)
        .fill(null)
        .map(() => ({
          result: null,
          playerPair: false,
          bankerPair: false,
          handNumber: 0,
        }))
    );

  hands.forEach((hand, index) => {
    const row = Math.floor(index / BEAD_COLS) % BEAD_ROWS;
    const col = index % BEAD_COLS;

    if (row < BEAD_ROWS && col < BEAD_COLS) {
      beadPlateGrid.value[row][col] = {
        result: hand.winner,
        playerPair: hand.playerPair,
        bankerPair: hand.bankerPair,
        handNumber: index + 1,
      };
    }
  });
}

// Helper functions
function getResultSymbol(result: string): string {
  switch (result) {
    case 'player':
      return 'P';
    case 'banker':
      return 'B';
    case 'tie':
      return 'T';
    default:
      return '';
  }
}

function getCellTooltip(cell: ScoreboardCell): string {
  if (!cell.result) return '';

  let tooltip = `Hand #${cell.handNumber}: ${cell.result.toUpperCase()}`;
  if (cell.playerPair) tooltip += ' + Player Pair';
  if (cell.bankerPair) tooltip += ' + Banker Pair';

  return tooltip;
}

function clearScoreboard() {
  store.clearHistory();
}

// Initialize on mount
updateBigRoad(store.handHistory);
updateBeadPlate(store.handHistory);
</script>

<style scoped>
.scoreboard-container {
  @apply border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-x-auto;
}

/* Big Road Styles */
.big-road-grid {
  @apply grid gap-1;
  grid-template-rows: repeat(6, 1fr);
}

.big-road-row {
  @apply flex gap-1;
}

.big-road-cell {
  @apply w-8 h-8 border border-gray-300 flex items-center justify-center text-xs font-bold relative;
  min-width: 32px;
}

.big-road-cell.empty {
  @apply bg-white;
}

.big-road-cell.result-player {
  @apply bg-blue-100 text-blue-800 border-blue-300;
}

.big-road-cell.result-banker {
  @apply bg-red-100 text-red-800 border-red-300;
}

.big-road-cell.result-tie {
  @apply bg-green-100 text-green-800 border-green-300;
}

.pair-indicators {
  @apply absolute top-0 right-0 flex flex-col;
}

.pair-dot {
  @apply text-xs leading-none;
}

.pair-dot.player-pair {
  @apply text-blue-600;
}

.pair-dot.banker-pair {
  @apply text-red-600;
}

/* Bead Plate Styles */
.bead-plate-grid {
  @apply grid gap-1;
  grid-template-rows: repeat(6, 1fr);
}

.bead-plate-row {
  @apply flex gap-1;
}

.bead-plate-cell {
  @apply w-6 h-6 flex items-center justify-center relative;
  min-width: 24px;
}

.bead-content {
  @apply relative w-full h-full flex items-center justify-center;
}

.bead-circle {
  @apply w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white;
}

.bead-circle.bead-player {
  @apply bg-blue-500;
}

.bead-circle.bead-banker {
  @apply bg-red-500;
}

.bead-circle.bead-tie {
  @apply bg-green-500;
}

.bead-pairs {
  @apply absolute -top-1 -right-1 flex flex-col text-xs;
}

.bead-pair-dot {
  @apply text-white bg-black rounded-full w-3 h-3 flex items-center justify-center text-xs leading-none;
  font-size: 8px;
}
</style>
