<!-- =============================================================================
HEADLESS SCOREBOARD PRIMITIVE - CDD/HEADLESS SYSTEM
=============================================================================
Pure logic component with slot-based API for maximum reusability
Following professional patterns established in other headless primitives

🎯 GOAL: Extract ALL logic while preserving EXACT SAME functionality & UI
============================================================================= -->

<template>
  <div>
    <!-- Header Slot -->
    <slot
      name="header"
      :title="config.labels.MAIN_TITLE"
      :view-buttons="viewButtonsData"
      :on-view-change="handleViewChange"
    />

    <!-- Statistics Slot -->
    <slot name="statistics" :stats="statistics" :config="config" />

    <!-- Pattern Description Slot -->
    <slot
      name="pattern-description"
      :current-view="state.activeView"
      :description="currentPatternDescription"
      :config="config"
    />

    <!-- Main Scoreboard Grid Slot -->
    <slot
      name="grid"
      :current-view="state.activeView"
      :grid-data="currentGridData"
      :grid-config="currentGridConfig"
      :config="config"
      :on-cell-hover="handleCellHover"
      :tooltip-data="state.tooltipData"
    />

    <!-- Streak Information Slot -->
    <slot name="streak" :streak="currentStreak" :hand-number="state.handNumber" :config="config" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, readonly } from 'vue';
import {
  SCOREBOARD_SETTINGS,
  SCOREBOARD_DEFAULTS,
  PATTERN_ANALYSIS_CONFIG,
  VIEW_TYPES,
  VIEW_CONFIGURATIONS,
  SCOREBOARD_UTILS,
} from '@/config/scoreboardSettings';
import type {
  ScoreboardCell,
  PatternCell,
  ScoreboardStats,
  CurrentStreak,
  ScoreboardView,
} from '@/config/scoreboardSettings';

// =============================================================================
// COMPONENT INTERFACE
// =============================================================================

export interface ScoreboardProps {
  gameHistory?: any[];
  maxRows?: number;
  maxCols?: number;
  showTooltips?: boolean;
  enablePatternAnalysis?: boolean;
}

export interface ScoreboardEmits {
  (e: 'view-changed', view: ScoreboardView): void;
  (e: 'cell-hovered', data: any): void;
}

export interface ScoreboardState {
  activeView: ScoreboardView;
  bigRoadData: ScoreboardCell[][];
  beadPlateData: ScoreboardCell[];
  bigEyeBoyData: PatternCell[][];
  smallRoadData: PatternCell[][];
  cockroachPigData: PatternCell[][];
  handNumber: number;
  tooltipData: any;
}

// =============================================================================
// PROPS & EMITS
// =============================================================================

const props = withDefaults(defineProps<ScoreboardProps>(), {
  gameHistory: () => [],
  maxRows: () => SCOREBOARD_DEFAULTS.GRID_DIMENSIONS.BIG_ROAD.ROWS,
  maxCols: () => SCOREBOARD_DEFAULTS.GRID_DIMENSIONS.BIG_ROAD.COLS,
  showTooltips: true,
  enablePatternAnalysis: true,
});

const emit = defineEmits<ScoreboardEmits>();

// =============================================================================
// REACTIVE STATE (EXACT CURRENT LOGIC)
// =============================================================================

const state = ref<ScoreboardState>({
  activeView: 'bigroad',
  bigRoadData: [],
  beadPlateData: [],
  bigEyeBoyData: [],
  smallRoadData: [],
  cockroachPigData: [],
  handNumber: 0,
  tooltipData: null,
});

// =============================================================================
// CONFIGURATION ACCESS
// =============================================================================

const config = computed(() => ({
  labels: SCOREBOARD_SETTINGS.LABELS,
  colors: SCOREBOARD_SETTINGS.COLORS,
  layouts: SCOREBOARD_SETTINGS.LAYOUTS,
  defaults: SCOREBOARD_DEFAULTS,
  patterns: PATTERN_ANALYSIS_CONFIG,
  utils: SCOREBOARD_UTILS,
}));

// =============================================================================
// STATISTICS COMPUTATION (EXACT CURRENT LOGIC)
// =============================================================================

const statistics = computed(() => {
  return {
    player: props.gameHistory.filter(h => h.winner === 'player').length,
    banker: props.gameHistory.filter(h => h.winner === 'banker').length,
    tie: props.gameHistory.filter(h => h.winner === 'tie').length,
    total: props.gameHistory.length,
  };
});

// =============================================================================
// CURRENT STREAK COMPUTATION (EXACT CURRENT LOGIC)
// =============================================================================

const currentStreak = computed(() => {
  if (props.gameHistory.length === 0) {
    return { type: 'player', count: 0 };
  }

  const lastResult = props.gameHistory[props.gameHistory.length - 1].winner;
  let count = 1;

  for (let i = props.gameHistory.length - 2; i >= 0; i--) {
    if (props.gameHistory[i].winner === lastResult) {
      count++;
    } else {
      break;
    }
  }

  return { type: lastResult, count };
});

// =============================================================================
// VIEW BUTTON DATA (EXACT CURRENT LOGIC)
// =============================================================================

const viewButtonsData = computed(() => [
  {
    key: VIEW_TYPES.BIG_ROAD,
    label: config.value.labels.BIG_ROAD_LABEL,
    isActive: state.value.activeView === VIEW_TYPES.BIG_ROAD,
    colorClass: SCOREBOARD_UTILS.getButtonColorClass(
      VIEW_TYPES.BIG_ROAD,
      state.value.activeView === VIEW_TYPES.BIG_ROAD
    ),
  },
  {
    key: VIEW_TYPES.BEAD_PLATE,
    label: config.value.labels.BEAD_PLATE_LABEL,
    isActive: state.value.activeView === VIEW_TYPES.BEAD_PLATE,
    colorClass: SCOREBOARD_UTILS.getButtonColorClass(
      VIEW_TYPES.BEAD_PLATE,
      state.value.activeView === VIEW_TYPES.BEAD_PLATE
    ),
  },
  {
    key: VIEW_TYPES.BIG_EYE_BOY,
    label: config.value.labels.BIG_EYE_BOY_LABEL,
    isActive: state.value.activeView === VIEW_TYPES.BIG_EYE_BOY,
    colorClass: SCOREBOARD_UTILS.getButtonColorClass(
      VIEW_TYPES.BIG_EYE_BOY,
      state.value.activeView === VIEW_TYPES.BIG_EYE_BOY
    ),
  },
  {
    key: VIEW_TYPES.SMALL_ROAD,
    label: config.value.labels.SMALL_ROAD_LABEL,
    isActive: state.value.activeView === VIEW_TYPES.SMALL_ROAD,
    colorClass: SCOREBOARD_UTILS.getButtonColorClass(
      VIEW_TYPES.SMALL_ROAD,
      state.value.activeView === VIEW_TYPES.SMALL_ROAD
    ),
  },
  {
    key: VIEW_TYPES.COCKROACH_PIG,
    label: config.value.labels.COCKROACH_PIG_LABEL,
    isActive: state.value.activeView === VIEW_TYPES.COCKROACH_PIG,
    colorClass: SCOREBOARD_UTILS.getButtonColorClass(
      VIEW_TYPES.COCKROACH_PIG,
      state.value.activeView === VIEW_TYPES.COCKROACH_PIG
    ),
  },
]);

// =============================================================================
// CURRENT GRID DATA (EXACT CURRENT LOGIC)
// =============================================================================

const currentGridData = computed(() => {
  switch (state.value.activeView) {
    case 'bigroad':
      return state.value.bigRoadData;
    case 'beadplate':
      // Convert flat array to 2D grid for display (6 rows x 22 cols)
      const rows = 6;
      const cols = 22;
      const grid: ScoreboardCell[][] = Array(rows)
        .fill(null)
        .map(() =>
          Array(cols)
            .fill(null)
            .map(() => ({
              result: null,
              playerPair: false,
              bankerPair: false,
              handNumber: 0,
            }))
        );

      state.value.beadPlateData.forEach((cell, index) => {
        const row = Math.floor(index / cols) % rows;
        const col = index % cols;
        if (row < rows && col < cols) {
          grid[row][col] = cell;
        }
      });

      return grid;
    case 'bigeyeboy':
      return state.value.bigEyeBoyData;
    case 'smallroad':
      return state.value.smallRoadData;
    case 'cockroachpig':
      return state.value.cockroachPigData;
    default:
      return [];
  }
});

const currentGridConfig = computed(() => {
  const view = state.value.activeView;
  return {
    view,
    dimensions: {
      rows: props.maxRows,
      cols: props.maxCols,
    },
    description:
      SCOREBOARD_SETTINGS.LABELS.PATTERN_DESCRIPTIONS[
        view.toUpperCase() as keyof typeof SCOREBOARD_SETTINGS.LABELS.PATTERN_DESCRIPTIONS
      ] || '',
  };
});

const currentPatternDescription = computed(() => {
  return (
    config.value.labels.PATTERN_DESCRIPTIONS[
      state.value.activeView.toUpperCase() as keyof typeof SCOREBOARD_SETTINGS.LABELS.PATTERN_DESCRIPTIONS
    ] || ''
  );
});

// =============================================================================
// BIG ROAD ALGORITHM (EXACT CURRENT LOGIC)
// =============================================================================

const buildBigRoadData = (gameHistory: any[]): ScoreboardCell[][] => {
  const grid: ScoreboardCell[][] = Array(props.maxRows)
    .fill(null)
    .map(() =>
      Array(props.maxCols)
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

  gameHistory.forEach((hand, index) => {
    if (!hand.winner) return;

    const cell: ScoreboardCell = {
      result: hand.winner as 'player' | 'banker' | 'tie',
      playerPair: hand.playerPair || false,
      bankerPair: hand.bankerPair || false,
      handNumber: index + 1,
      playerCards: hand.playerCards || hand.player,
      bankerCards: hand.bankerCards || hand.banker,
      betInfo: hand.betInfo,
    };

    if (hand.winner === 'tie') {
      if (currentCol < props.maxCols && currentRow < props.maxRows) {
        grid[currentRow][currentCol] = cell;
      }
      return;
    }

    if (hand.winner === lastResult && currentRow < props.maxRows - 1) {
      currentRow++;
    } else if (hand.winner !== lastResult) {
      if (lastResult !== null && currentCol < props.maxCols - 1) {
        currentCol++;
      }
      currentRow = 0;
    } else if (currentRow >= props.maxRows - 1 && currentCol < props.maxCols - 1) {
      currentCol++;
      currentRow = 0;
    }

    if (currentCol < props.maxCols && currentRow < props.maxRows) {
      grid[currentRow][currentCol] = cell;
    }

    lastResult = hand.winner;
  });

  return grid;
};

// =============================================================================
// BEAD PLATE ALGORITHM (EXACT CURRENT LOGIC)
// =============================================================================

const buildBeadPlateData = (gameHistory: any[]): ScoreboardCell[] => {
  const beadPlateData: ScoreboardCell[] = [];

  gameHistory.forEach((hand, index) => {
    beadPlateData.push({
      result: hand.winner,
      playerPair: hand.playerPair || false,
      bankerPair: hand.bankerPair || false,
      handNumber: index + 1,
      playerCards: hand.playerCards || hand.player,
      bankerCards: hand.bankerCards || hand.banker,
      betInfo: hand.betInfo,
    });
  });

  return beadPlateData;
};

// =============================================================================
// PATTERN ANALYSIS ALGORITHMS (EXACT CURRENT LOGIC)
// =============================================================================

const analyzePattern = (
  bigRoadData: ScoreboardCell[][],
  patternType: 'BIG_EYE_BOY' | 'SMALL_ROAD' | 'COCKROACH_PIG'
): PatternCell[][] => {
  const patternConfig = PATTERN_ANALYSIS_CONFIG.ALGORITHMS[patternType];
  console.log(`[scoreboard][pattern-${patternType}] === STARTING ANALYSIS ===`, {
    patternConfig,
    bigRoadDataSize: `${bigRoadData.length}x${bigRoadData[0]?.length || 0}`,
    totalCells: bigRoadData.flat().length,
    nonEmptyCells: bigRoadData.flat().filter(cell => cell.result).length,
  });

  const grid: PatternCell[][] = Array(props.maxRows)
    .fill(null)
    .map(() =>
      Array(props.maxCols)
        .fill(null)
        .map(() => ({
          result: null,
          handNumber: 0,
        }))
    );

  // STEP 1: Extract Big Road columns (exclude ties) with correct hand tracking
  const bigRoadColumns: { result: string; handNumber: number }[][] = [];

  // CORRECTED: Big Road data is organized as [row][col], but we need to extract column sequences
  // We need to identify where each column starts and ends based on result changes
  const allCells: { result: string; handNumber: number; row: number; col: number }[] = [];

  // First, collect all non-tie cells with their positions
  for (let row = 0; row < bigRoadData.length; row++) {
    for (let col = 0; col < bigRoadData[row].length; col++) {
      const cell = bigRoadData[row][col];
      if (cell.result && cell.result !== 'tie' && cell.handNumber > 0) {
        allCells.push({
          result: cell.result,
          handNumber: cell.handNumber,
          row,
          col,
        });
      }
    }
  }

  console.log(`[scoreboard][pattern-${patternType}] Step 1: Collected all cells`, {
    allCellsCount: allCells.length,
    firstFewCells: allCells
      .slice(0, 10)
      .map(c => `H${c.handNumber}:${c.result[0]}@(${c.row},${c.col})`),
    lastFewCells: allCells
      .slice(-5)
      .map(c => `H${c.handNumber}:${c.result[0]}@(${c.row},${c.col})`),
  });

  // Sort by hand number to get chronological order
  allCells.sort((a, b) => a.handNumber - b.handNumber);

  console.log(`[scoreboard][pattern-${patternType}] Step 2: Sorted by hand number`, {
    chronologicalOrder: allCells.map(c => `H${c.handNumber}:${c.result[0]}`).join(' -> '),
  });

  // Now build columns based on result changes (Big Road logic)
  let currentColumn: { result: string; handNumber: number }[] = [];
  let lastResult: string | null = null;

  allCells.forEach((cell, index) => {
    if (cell.result !== lastResult) {
      // Start new column
      if (currentColumn.length > 0) {
        bigRoadColumns.push([...currentColumn]);
        console.log(
          `[scoreboard][pattern-${patternType}] Column ${bigRoadColumns.length - 1} completed:`,
          currentColumn.map(c => `H${c.handNumber}:${c.result[0]}`).join(',')
        );
      }
      currentColumn = [{ result: cell.result, handNumber: cell.handNumber }];
    } else {
      // Continue current column
      currentColumn.push({ result: cell.result, handNumber: cell.handNumber });
    }
    lastResult = cell.result;
  });

  // Add final column
  if (currentColumn.length > 0) {
    bigRoadColumns.push(currentColumn);
    console.log(
      `[scoreboard][pattern-${patternType}] Final column ${bigRoadColumns.length - 1} completed:`,
      currentColumn.map(c => `H${c.handNumber}:${c.result[0]}`).join(',')
    );
  }

  console.log(`[scoreboard][pattern-${patternType}] Extracted Big Road columns`, {
    columnsCount: bigRoadColumns.length,
    comparisonOffset: patternConfig.COMPARISON_OFFSET,
    startingFromColumn: patternConfig.COMPARISON_OFFSET,
    availableForAnalysis: Math.max(0, bigRoadColumns.length - patternConfig.COMPARISON_OFFSET),
    firstFewColumns: bigRoadColumns
      .slice(0, 5)
      .map(col => col.map(cell => `${cell.result[0]}${cell.handNumber}`)),
  });

  // Check if we have enough columns for analysis
  if (bigRoadColumns.length <= patternConfig.COMPARISON_OFFSET) {
    console.log(
      `[scoreboard][pattern-${patternType}] Insufficient columns for analysis, returning empty grid`
    );
    return grid;
  }

  // STEP 2: Generate pattern results using correct algorithm
  let patternGridCol = 0;
  let patternGridRow = 0;
  let cellsGenerated = 0;

  // Start from the first column that can be compared
  for (
    let colIndex = patternConfig.COMPARISON_OFFSET;
    colIndex < bigRoadColumns.length;
    colIndex++
  ) {
    const currentCol = bigRoadColumns[colIndex];
    const compareCol = bigRoadColumns[colIndex - patternConfig.COMPARISON_OFFSET];

    console.log(`[scoreboard][pattern-${patternType}] Processing Big Road column ${colIndex}`, {
      currentColLength: currentCol.length,
      compareColLength: compareCol.length,
      currentPatternPosition: { patternGridCol, patternGridRow },
      currentCol: currentCol.map(c => `H${c.handNumber}:${c.result[0]}`),
      compareCol: compareCol.map(c => `H${c.handNumber}:${c.result[0]}`),
    });

    // FIXED: Generate pattern results for this Big Road column
    // Each Big Road column generates pattern cells based on its depth
    const maxDepth = Math.max(currentCol.length, 1); // At least 1 cell per column

    for (let depth = 0; depth < maxDepth; depth++) {
      let patternResult: 'red' | 'blue';

      if (patternType === 'BIG_EYE_BOY') {
        // Big Eye Boy: Compare if there's a "next" card at this depth
        const currentHasNext = depth + 1 < currentCol.length;
        const compareHasNext = depth + 1 < compareCol.length;
        patternResult = currentHasNext === compareHasNext ? 'blue' : 'red';
      } else {
        // Small Road & Cockroach Pig: Compare if both columns have a card at this depth
        const currentHasCardAtDepth = depth < currentCol.length;
        const compareHasCardAtDepth = depth < compareCol.length;
        patternResult = currentHasCardAtDepth === compareHasCardAtDepth ? 'blue' : 'red';
      }

      console.log(
        `[scoreboard][pattern-${patternType}] Generated pattern result for depth ${depth}`,
        {
          patternResult,
          handNumber: currentCol[depth]?.handNumber || 0,
          algorithm: patternType === 'BIG_EYE_BOY' ? 'next-card' : 'depth-comparison',
          comparison:
            patternType === 'BIG_EYE_BOY'
              ? {
                  currentHasNext: depth + 1 < currentCol.length,
                  compareHasNext: depth + 1 < compareCol.length,
                }
              : {
                  currentHasCardAtDepth: depth < currentCol.length,
                  compareHasCardAtDepth: depth < compareCol.length,
                  currentColLength: currentCol.length,
                  compareColLength: compareCol.length,
                },
        }
      );

      // Place pattern cell in grid
      if (patternGridCol < props.maxCols && patternGridRow < props.maxRows) {
        grid[patternGridRow][patternGridCol] = {
          result: patternResult,
          handNumber:
            currentCol[Math.min(depth, currentCol.length - 1)]?.handNumber ||
            currentCol[0]?.handNumber ||
            colIndex + 1, // Use the correct hand number from this column
        };
        cellsGenerated++;

        console.log(
          `[scoreboard][pattern-${patternType}] Placed cell at (${patternGridRow}, ${patternGridCol})`,
          {
            result: patternResult,
            handNumber:
              currentCol[Math.min(depth, currentCol.length - 1)]?.handNumber ||
              currentCol[0]?.handNumber ||
              colIndex + 1,
            cellsGenerated,
            currentColHandNumbers: currentCol.map(c => c.handNumber),
            selectedDepth: depth,
            actualHandNumber: currentCol[Math.min(depth, currentCol.length - 1)]?.handNumber,
          }
        );

        // Move to next row in the same column
        patternGridRow++;

        // If column is full, move to next column
        if (patternGridRow >= props.maxRows) {
          patternGridCol++;
          patternGridRow = 0;

          console.log(`[scoreboard][pattern-${patternType}] Column full, moved to next column`, {
            newPosition: { patternGridCol, patternGridRow },
          });

          // If grid is full, stop
          if (patternGridCol >= props.maxCols) {
            console.log(`[scoreboard][pattern-${patternType}] Grid is full, stopping`);
            break;
          }
        }
      }
    }

    // Stop if pattern grid is full
    if (patternGridCol >= props.maxCols) {
      console.log(`[scoreboard][pattern-${patternType}] Pattern grid full, stopping analysis`);
      break;
    }
  }

  console.log(`[scoreboard][pattern-${patternType}] Analysis complete`, {
    cellsGenerated,
    bigRoadColumnsAnalyzed: Math.max(0, bigRoadColumns.length - patternConfig.COMPARISON_OFFSET),
    totalBigRoadColumns: bigRoadColumns.length,
    finalPosition: { patternGridCol, patternGridRow },
    gridSummary: {
      totalCells: grid.flat().length,
      filledCells: grid.flat().filter(cell => cell.result).length,
      redCells: grid.flat().filter(cell => cell.result === 'red').length,
      blueCells: grid.flat().filter(cell => cell.result === 'blue').length,
    },
    sampleResults: grid
      .slice(0, 3)
      .map(row =>
        row.slice(0, 5).map(cell => (cell.result ? `${cell.result[0]}${cell.handNumber}` : 'empty'))
      ),
  });

  return grid;
};

// =============================================================================
// DATA PROCESSING (EXACT CURRENT LOGIC)
// =============================================================================

const processGameHistory = () => {
  console.log('[scoreboard][processing] Processing game history', {
    historyLength: props.gameHistory.length,
    activeView: state.value.activeView,
    enablePatternAnalysis: props.enablePatternAnalysis,
  });

  // Build all scoreboard data
  state.value.bigRoadData = buildBigRoadData(props.gameHistory);
  state.value.beadPlateData = buildBeadPlateData(props.gameHistory);

  console.log('[scoreboard][debug] Big Road data built', {
    bigRoadData: state.value.bigRoadData,
    nonEmptyCells: state.value.bigRoadData.flat().filter(cell => cell.result).length,
  });

  if (props.enablePatternAnalysis) {
    console.log('[scoreboard][debug] Starting pattern analysis...');

    state.value.bigEyeBoyData = analyzePattern(state.value.bigRoadData, 'BIG_EYE_BOY');
    console.log('[scoreboard][debug] Big Eye Boy analysis complete', {
      bigEyeBoyData: state.value.bigEyeBoyData,
      nonEmptyPatternCells: state.value.bigEyeBoyData.flat().filter(cell => cell.result).length,
      sampleCells: state.value.bigEyeBoyData
        .flat()
        .filter(cell => cell.result)
        .slice(0, 3),
    });

    state.value.smallRoadData = analyzePattern(state.value.bigRoadData, 'SMALL_ROAD');
    console.log('[scoreboard][debug] Small Road analysis complete', {
      smallRoadData: state.value.smallRoadData,
      nonEmptyPatternCells: state.value.smallRoadData.flat().filter(cell => cell.result).length,
      sampleCells: state.value.smallRoadData
        .flat()
        .filter(cell => cell.result)
        .slice(0, 3),
    });

    state.value.cockroachPigData = analyzePattern(state.value.bigRoadData, 'COCKROACH_PIG');
    console.log('[scoreboard][debug] Cockroach Pig analysis complete', {
      cockroachPigData: state.value.cockroachPigData,
      nonEmptyPatternCells: state.value.cockroachPigData.flat().filter(cell => cell.result).length,
      sampleCells: state.value.cockroachPigData
        .flat()
        .filter(cell => cell.result)
        .slice(0, 3),
    });
  } else {
    console.log('[scoreboard][debug] Pattern analysis DISABLED');
  }

  state.value.handNumber = props.gameHistory.length;

  console.log('[scoreboard][processing] Processing complete', {
    bigRoadCells: state.value.bigRoadData.flat().filter(cell => cell.result).length,
    beadPlateCells: state.value.beadPlateData.length,
    patternAnalysis: {
      bigEyeBoyCells: state.value.bigEyeBoyData.flat().filter(cell => cell.result).length,
      smallRoadCells: state.value.smallRoadData.flat().filter(cell => cell.result).length,
      cockroachPigCells: state.value.cockroachPigData.flat().filter(cell => cell.result).length,
    },
    statistics: statistics.value,
    currentStreak: currentStreak.value,
  });
};

// =============================================================================
// EVENT HANDLERS (EXACT CURRENT LOGIC)
// =============================================================================

const handleViewChange = (view: ScoreboardView) => {
  console.log('[scoreboard][view-change] Changing view', {
    from: state.value.activeView,
    to: view,
  });

  state.value.activeView = view;
  emit('view-changed', view);
};

const handleCellHover = (cellData: any) => {
  state.value.tooltipData = cellData;
  emit('cell-hovered', cellData);
};

// =============================================================================
// WATCHERS (EXACT CURRENT LOGIC)
// =============================================================================

watch(
  () => props.gameHistory,
  () => {
    processGameHistory();
  },
  { deep: true, immediate: true }
);

// DEBUG: Watch current grid data changes
watch(
  () => currentGridData.value,
  newGridData => {
    console.log('[scoreboard][grid-data-watch] Grid data changed', {
      activeView: state.value.activeView,
      isArray: Array.isArray(newGridData),
      length: Array.isArray(newGridData) ? newGridData.length : 'not array',
      totalCells: Array.isArray(newGridData) ? newGridData.flat().length : 'not array',
      filledCells: Array.isArray(newGridData)
        ? newGridData.flat().filter(cell => cell?.result).length
        : 'not array',
      sampleCells: Array.isArray(newGridData)
        ? newGridData
            .flat()
            .filter(cell => cell?.result)
            .slice(0, 3)
        : 'not array',
    });
  },
  { deep: true }
);

// DEBUG: Watch active view changes
watch(
  () => state.value.activeView,
  (newView, oldView) => {
    console.log('[scoreboard][view-watch] Active view changed', {
      from: oldView,
      to: newView,
      timestamp: new Date().toISOString(),
    });
  }
);

// =============================================================================
// LIFECYCLE (EXACT CURRENT LOGIC)
// =============================================================================

onMounted(() => {
  console.log('[scoreboard][lifecycle] Scoreboard primitive mounted', {
    initialView: state.value.activeView,
    maxRows: props.maxRows,
    maxCols: props.maxCols,
    enablePatternAnalysis: props.enablePatternAnalysis,
  });

  processGameHistory();
});

// =============================================================================
// EXPOSE PUBLIC API
// =============================================================================

defineExpose({
  // State access
  state: readonly(state),
  statistics,
  currentStreak,

  // Actions
  changeView: handleViewChange,

  // Data access
  getCurrentGridData: () => currentGridData.value,
  getViewConfig: () => currentGridConfig.value,

  // Utilities
  processHistory: processGameHistory,
});
</script>

<style scoped>
/* No styles - this is a headless component */
</style>
