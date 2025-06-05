<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Scoreboard</h3>
      <div class="flex gap-2 flex-wrap">
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
          @click="activeView = 'bigeyeboy'"
          :class="[
            'px-3 py-1 text-sm rounded',
            activeView === 'bigeyeboy'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          Big Eye Boy
        </button>
        <button
          @click="activeView = 'smallroad'"
          :class="[
            'px-3 py-1 text-sm rounded',
            activeView === 'smallroad'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          Small Road
        </button>
        <button
          @click="activeView = 'cockroachpig'"
          :class="[
            'px-3 py-1 text-sm rounded',
            activeView === 'cockroachpig'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          Cockroach Pig
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
      <div class="pattern-description mb-3 p-2 bg-blue-50 rounded text-sm">
        <strong>Big Road:</strong> Main tracking grid showing Player (P), Banker (B), and Tie (T)
        results. Results form columns - same outcomes go down, different outcomes start new columns.
        Pairs shown as dots.
      </div>
      <div class="big-road-grid">
        <div v-for="(row, rowIndex) in bigRoadGrid" :key="rowIndex" class="big-road-row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="[
              'big-road-cell',
              cell.result ? `result-${cell.result}` : 'empty',
              cell.playerPair || cell.bankerPair ? 'has-pair' : '',
              cell.betInfo ? 'has-bet' : '',
            ]"
            :title="getCellTooltip(cell)"
          >
            <span v-if="cell.result" class="result-text">
              {{ getResultSymbol(cell.result) }}
            </span>

            <!-- Betting Information -->
            <div v-if="cell.betInfo" class="bet-info">
              <div class="bet-amount">${{ cell.betInfo.betAmount }}</div>
              <!-- Loss Cross -->
              <div v-if="!cell.betInfo.won" class="loss-cross">
                <svg width="16" height="16" viewBox="0 0 16 16" class="text-red-600">
                  <path
                    d="M12 4L4 12M4 4l8 8"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>

            <div v-if="cell.playerPair || cell.bankerPair" class="pair-indicators">
              <span v-if="cell.playerPair" class="pair-dot player-pair">•</span>
              <span v-if="cell.bankerPair" class="pair-dot banker-pair">•</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bead Plate View -->
    <div v-if="activeView === 'beadplate'" class="scoreboard-container">
      <div class="pattern-description mb-3 p-2 bg-blue-50 rounded text-sm">
        <strong>Bead Plate:</strong> Chronological display of all results in order from left to
        right, top to bottom. Circular dots show Player (Blue), Banker (Red), Tie (Green). P/B
        letters indicate pairs.
      </div>
      <div class="bead-plate-grid">
        <div v-for="(row, rowIndex) in beadPlateGrid" :key="rowIndex" class="bead-plate-row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="[
              'bead-plate-cell',
              cell.result ? `bead-${cell.result}` : 'empty',
              cell.betInfo ? 'has-bet' : '',
            ]"
            :title="getCellTooltip(cell)"
          >
            <div v-if="cell.result" class="bead-content">
              <div :class="['bead-circle', `bead-${cell.result}`]">
                {{ getResultSymbol(cell.result) }}
              </div>

              <!-- Betting Information for Bead Plate -->
              <div v-if="cell.betInfo" class="bead-bet-info">
                <div class="bead-bet-amount">${{ cell.betInfo.betAmount }}</div>
                <!-- Loss Cross -->
                <div v-if="!cell.betInfo.won" class="bead-loss-cross">
                  <svg width="12" height="12" viewBox="0 0 12 12" class="text-red-600">
                    <path
                      d="M9 3L3 9M3 3l6 6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div v-if="cell.playerPair || cell.bankerPair" class="bead-pairs">
                <span v-if="cell.playerPair" class="bead-pair-dot">P</span>
                <span v-if="cell.bankerPair" class="bead-pair-dot">B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Big Eye Boy View -->
    <div v-if="activeView === 'bigeyeboy'" class="scoreboard-container">
      <div class="pattern-description mb-3 p-2 bg-green-50 rounded text-sm">
        <strong>Big Eye Boy:</strong> Tracks pattern regularity by comparing current column with
        previous column. Red = irregular pattern, Blue = regular pattern. Starts from hand 2.
      </div>
      <div class="pattern-grid">
        <div v-for="(row, rowIndex) in bigEyeBoyGrid" :key="rowIndex" class="pattern-row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="['pattern-cell', cell.result ? `pattern-${cell.result}` : 'empty']"
            :title="getPatternTooltip(cell, 'Big Eye Boy')"
          >
            <div v-if="cell.result" :class="['pattern-dot', `dot-${cell.result}`]"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Small Road View -->
    <div v-if="activeView === 'smallroad'" class="scoreboard-container">
      <div class="pattern-description mb-3 p-2 bg-purple-50 rounded text-sm">
        <strong>Small Road:</strong> Compares current column with column 2 positions back. Red =
        different pattern, Blue = same pattern. Starts from hand 3.
      </div>
      <div class="pattern-grid">
        <div v-for="(row, rowIndex) in smallRoadGrid" :key="rowIndex" class="pattern-row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="['pattern-cell', cell.result ? `pattern-${cell.result}` : 'empty']"
            :title="getPatternTooltip(cell, 'Small Road')"
          >
            <div v-if="cell.result" :class="['pattern-dot', `dot-${cell.result}`]"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cockroach Pig View -->
    <div v-if="activeView === 'cockroachpig'" class="scoreboard-container">
      <div class="pattern-description mb-3 p-2 bg-orange-50 rounded text-sm">
        <strong>Cockroach Pig:</strong> Compares current column with column 3 positions back. Red =
        different pattern, Blue = same pattern. Starts from hand 4.
      </div>
      <div class="pattern-grid">
        <div v-for="(row, rowIndex) in cockroachPigGrid" :key="rowIndex" class="pattern-row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="['pattern-cell', cell.result ? `pattern-${cell.result}` : 'empty']"
            :title="getPatternTooltip(cell, 'Cockroach Pig')"
          >
            <div v-if="cell.result" :class="['pattern-dot', `dot-${cell.result}`]"></div>
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
import { ref, computed, watch, type Ref } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import type { HandResult, Card } from '@/types/cards';

interface ScoreboardCell {
  result: 'player' | 'banker' | 'tie' | null;
  playerPair: boolean;
  bankerPair: boolean;
  handNumber: number;
  playerCards?: Card[];
  bankerCards?: Card[];
  betInfo?: {
    betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair';
    betAmount: number;
    won: boolean;
    payout: number;
    netResult: number;
  };
}

const store = useBaccaratStore();
const activeView = ref<'bigroad' | 'beadplate' | 'bigeyeboy' | 'smallroad' | 'cockroachpig'>(
  'bigroad'
);

// Grid dimensions
const GRID_ROWS = 6;
const GRID_COLS = 20;
const BEAD_ROWS = 6;
const BEAD_COLS = 22;
const PATTERN_ROWS = 6;
const PATTERN_COLS = 20;

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
          playerCards: undefined,
          bankerCards: undefined,
          betInfo: undefined,
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
          playerCards: undefined,
          bankerCards: undefined,
          betInfo: undefined,
        }))
    )
);

// Pattern analysis grids
interface PatternCell {
  result: 'red' | 'blue' | null;
  handNumber: number;
}

const bigEyeBoyGrid = ref<PatternCell[][]>(
  Array(PATTERN_ROWS)
    .fill(null)
    .map(() =>
      Array(PATTERN_COLS)
        .fill(null)
        .map(() => ({
          result: null,
          handNumber: 0,
        }))
    )
);

const smallRoadGrid = ref<PatternCell[][]>(
  Array(PATTERN_ROWS)
    .fill(null)
    .map(() =>
      Array(PATTERN_COLS)
        .fill(null)
        .map(() => ({
          result: null,
          handNumber: 0,
        }))
    )
);

const cockroachPigGrid = ref<PatternCell[][]>(
  Array(PATTERN_ROWS)
    .fill(null)
    .map(() =>
      Array(PATTERN_COLS)
        .fill(null)
        .map(() => ({
          result: null,
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
    updatePatternAnalysis(newHands);
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
          playerCards: undefined,
          bankerCards: undefined,
          betInfo: undefined,
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
        playerCards: hand.player,
        bankerCards: hand.banker,
        betInfo: hand.betInfo,
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
          playerCards: undefined,
          bankerCards: undefined,
          betInfo: undefined,
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
        playerCards: hand.player,
        bankerCards: hand.banker,
        betInfo: hand.betInfo,
      };
    }
  });
}

// Pattern Analysis Functions
function updatePatternAnalysis(hands: HandResult[]) {
  updateBigEyeBoy(hands);
  updateSmallRoad(hands);
  updateCockroachPig(hands);
}

// Big Eye Boy - Compares current column with previous column
function updateBigEyeBoy(hands: HandResult[]) {
  clearPatternGrid(bigEyeBoyGrid);

  if (hands.length < 2) {
    return;
  }

  const bigRoadColumns = getBigRoadColumns(hands);
  let patternCol = 0;
  let patternRow = 0;

  for (let i = 1; i < bigRoadColumns.length; i++) {
    const currentColumn = bigRoadColumns[i];
    const previousColumn = bigRoadColumns[i - 1];

    // Compare patterns
    const isRegular = compareColumns(currentColumn, previousColumn, 1);
    const result = isRegular ? 'blue' : 'red';

    if (patternRow < PATTERN_ROWS && patternCol < PATTERN_COLS) {
      bigEyeBoyGrid.value[patternRow][patternCol] = {
        result,
        handNumber: i + 1,
      };
    }

    // Move to next position
    patternRow++;
    if (patternRow >= PATTERN_ROWS) {
      patternCol++;
      patternRow = 0;
    }
  }
}

// Small Road - Compares current column with column 2 positions back
function updateSmallRoad(hands: HandResult[]) {
  clearPatternGrid(smallRoadGrid);

  if (hands.length < 3) {
    return;
  }

  const bigRoadColumns = getBigRoadColumns(hands);
  let patternCol = 0;
  let patternRow = 0;

  for (let i = 2; i < bigRoadColumns.length; i++) {
    const currentColumn = bigRoadColumns[i];
    const compareColumn = bigRoadColumns[i - 2];

    // Compare patterns
    const isSame = compareColumns(currentColumn, compareColumn, 2);
    const result = isSame ? 'blue' : 'red';

    if (patternRow < PATTERN_ROWS && patternCol < PATTERN_COLS) {
      smallRoadGrid.value[patternRow][patternCol] = {
        result,
        handNumber: i + 1,
      };
    }

    // Move to next position
    patternRow++;
    if (patternRow >= PATTERN_ROWS) {
      patternCol++;
      patternRow = 0;
    }
  }
}

// Cockroach Pig - Compares current column with column 3 positions back
function updateCockroachPig(hands: HandResult[]) {
  clearPatternGrid(cockroachPigGrid);

  if (hands.length < 4) {
    return;
  }

  const bigRoadColumns = getBigRoadColumns(hands);
  let patternCol = 0;
  let patternRow = 0;

  for (let i = 3; i < bigRoadColumns.length; i++) {
    const currentColumn = bigRoadColumns[i];
    const compareColumn = bigRoadColumns[i - 3];

    // Compare patterns
    const isSame = compareColumns(currentColumn, compareColumn, 3);
    const result = isSame ? 'blue' : 'red';

    if (patternRow < PATTERN_ROWS && patternCol < PATTERN_COLS) {
      cockroachPigGrid.value[patternRow][patternCol] = {
        result,
        handNumber: i + 1,
      };
    }

    // Move to next position
    patternRow++;
    if (patternRow >= PATTERN_ROWS) {
      patternCol++;
      patternRow = 0;
    }
  }
}

// Helper function to get Big Road columns structure
function getBigRoadColumns(hands: HandResult[]): string[][] {
  const columns: string[][] = [];
  let currentColumn: string[] = [];
  let lastResult: string | null = null;

  hands.forEach(hand => {
    const result = hand.winner;

    // Skip ties for column structure
    if (result === 'tie') {
      return;
    }

    if (result === lastResult) {
      // Same result - add to current column
      currentColumn.push(result);
    } else {
      // Different result - start new column
      if (currentColumn.length > 0) {
        columns.push([...currentColumn]);
      }
      currentColumn = [result];
      lastResult = result;
    }
  });

  // Add the last column
  if (currentColumn.length > 0) {
    columns.push([...currentColumn]);
  }

  return columns;
}

// Helper function to compare two columns for pattern analysis
function compareColumns(current: string[], compare: string[], offset: number): boolean {
  // For Big Eye Boy (offset 1): Check if pattern is regular
  if (offset === 1) {
    // Regular if both columns have same length or both are different lengths
    return current.length === compare.length;
  }

  // For Small Road and Cockroach Pig: Check if patterns are the same
  if (current.length !== compare.length) {
    return false;
  }

  // Compare each position
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== compare[i]) {
      return false;
    }
  }

  return true;
}

// Helper function to clear pattern grids
function clearPatternGrid(grid: Ref<PatternCell[][]>) {
  grid.value = Array(PATTERN_ROWS)
    .fill(null)
    .map(() =>
      Array(PATTERN_COLS)
        .fill(null)
        .map(() => ({
          result: null,
          handNumber: 0,
        }))
    );
}

// Helper function for pattern tooltips
function getPatternTooltip(cell: PatternCell, patternName: string): string {
  if (!cell.result) {
    return '';
  }

  const color = cell.result === 'red' ? 'Red' : 'Blue';
  return `${patternName} - Hand #${cell.handNumber}: ${color}`;
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
  if (!cell.result) {
    return '';
  }

  let tooltip = `Hand #${cell.handNumber}: ${cell.result.toUpperCase()}`;

  // Add card information
  if (cell.playerCards && cell.bankerCards) {
    const playerCardsStr = cell.playerCards
      .map(card => `${card.rank}${card.suit.charAt(0).toUpperCase()}`)
      .join(', ');
    const bankerCardsStr = cell.bankerCards
      .map(card => `${card.rank}${card.suit.charAt(0).toUpperCase()}`)
      .join(', ');

    const playerTotal = cell.playerCards.reduce((sum, card) => sum + card.value, 0) % 10;
    const bankerTotal = cell.bankerCards.reduce((sum, card) => sum + card.value, 0) % 10;

    tooltip += `\nPlayer: ${playerCardsStr} (Total: ${playerTotal})`;
    tooltip += `\nBanker: ${bankerCardsStr} (Total: ${bankerTotal})`;
  }

  // Add pair information
  if (cell.playerPair) {
    tooltip += '\n+ Player Pair';
  }
  if (cell.bankerPair) {
    tooltip += '\n+ Banker Pair';
  }

  // Add betting information
  if (cell.betInfo) {
    tooltip += `\n\nBet: $${cell.betInfo.betAmount} on ${cell.betInfo.betType.toUpperCase()}`;
    tooltip += `\nResult: ${cell.betInfo.won ? 'WON' : 'LOST'}`;
    tooltip += `\nPayout: $${cell.betInfo.payout.toFixed(2)}`;
    tooltip += `\nNet: ${cell.betInfo.netResult >= 0 ? '+' : ''}$${cell.betInfo.netResult.toFixed(2)}`;
  }

  return tooltip;
}

function clearScoreboard() {
  store.clearHistory();
}

// Initialize on mount
updateBigRoad(store.handHistory);
updateBeadPlate(store.handHistory);
updatePatternAnalysis(store.handHistory);
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

/* Betting Information Styles */
.bet-info {
  @apply absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none;
}

.bet-amount {
  @apply text-xs font-bold text-white bg-black bg-opacity-70 px-1 rounded;
  font-size: 8px;
}

.loss-cross {
  @apply absolute top-0 right-0 bg-white rounded-full p-0.5;
  width: 16px;
  height: 16px;
}

.big-road-cell.has-bet {
  @apply relative;
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

/* Bead Plate Betting Information */
.bead-bet-info {
  @apply absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none;
}

.bead-bet-amount {
  @apply text-xs font-bold text-white bg-black bg-opacity-80 px-1 rounded;
  font-size: 7px;
}

.bead-loss-cross {
  @apply absolute top-0 right-0 bg-white rounded-full p-0.5;
  width: 12px;
  height: 12px;
}

.bead-plate-cell.has-bet {
  @apply relative;
}

/* Pattern Grid Styles */
.pattern-grid {
  @apply grid gap-1;
  grid-template-rows: repeat(6, 1fr);
}

.pattern-row {
  @apply flex gap-1;
}

.pattern-cell {
  @apply w-6 h-6 border border-gray-300 flex items-center justify-center relative;
  min-width: 24px;
}

.pattern-cell.empty {
  @apply bg-white;
}

.pattern-dot {
  @apply w-4 h-4 rounded-full;
}

.dot-red {
  @apply bg-red-500;
}

.dot-blue {
  @apply bg-blue-500;
}

.pattern-description {
  @apply text-sm text-gray-700;
}
</style>
