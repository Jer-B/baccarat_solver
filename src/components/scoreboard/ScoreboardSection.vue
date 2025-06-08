<!-- =============================================================================
SCOREBOARD STYLED WRAPPER - CDD/HEADLESS SYSTEM
=============================================================================
Styled wrapper that combines headless primitive with exact same UI
Following professional patterns established in other styled wrappers

🎯 GOAL: Preserve EXACT SAME UI while using headless architecture
============================================================================= -->

<template>
  <div
    :class="
      config.colors.MAIN_BACKGROUND +
      ' ' +
      config.colors.MAIN_BORDER +
      ' ' +
      config.colors.MAIN_PADDING
    "
  >
    <Scoreboard
      :game-history="gameHistory"
      :max-rows="maxRows"
      :max-cols="maxCols"
      :show-tooltips="showTooltips"
      :enable-pattern-analysis="enablePatternAnalysis"
      @view-changed="handleViewChanged"
      @cell-hovered="handleCellHovered"
    >
      <!-- Header Slot - EXACT SAME UI -->
      <template #header="{ title, viewButtons, onViewChange }">
        <div :class="config.layouts.HEADER_LAYOUT">
          <h2 :class="config.layouts.TITLE_STYLE">{{ title }}</h2>
          <div :class="config.layouts.BUTTON_CONTAINER">
            <!-- View Buttons - EXACT SAME COLORS & LOGIC -->
            <button
              v-for="button in viewButtons"
              :key="button.key"
              :class="config.colors.BUTTON_BASE + ' ' + button.colorClass"
              @click="onViewChange(button.key)"
            >
              {{ button.label }}
            </button>
          </div>
        </div>
      </template>

      <!-- Statistics Slot - EXACT SAME UI -->
      <template #statistics="{ stats, config: slotConfig }">
        <div :class="slotConfig.layouts.STATISTICS_GRID">
          <!-- Player Stats - EXACT SAME COLORS -->
          <div :class="slotConfig.layouts.STATISTICS_CARD + ' ' + slotConfig.colors.PLAYER_STAT_BG">
            <div :class="slotConfig.colors.STAT_VALUE + ' ' + slotConfig.colors.PLAYER_STAT_TEXT">
              {{ stats.player }}
            </div>
            <div :class="slotConfig.colors.STAT_LABEL">
              {{ slotConfig.labels.PLAYER_STAT_LABEL }}
            </div>
          </div>

          <!-- Banker Stats - EXACT SAME COLORS -->
          <div :class="slotConfig.layouts.STATISTICS_CARD + ' ' + slotConfig.colors.BANKER_STAT_BG">
            <div :class="slotConfig.colors.STAT_VALUE + ' ' + slotConfig.colors.BANKER_STAT_TEXT">
              {{ stats.banker }}
            </div>
            <div :class="slotConfig.colors.STAT_LABEL">
              {{ slotConfig.labels.BANKER_STAT_LABEL }}
            </div>
          </div>

          <!-- Tie Stats - EXACT SAME COLORS -->
          <div :class="slotConfig.layouts.STATISTICS_CARD + ' ' + slotConfig.colors.TIE_STAT_BG">
            <div :class="slotConfig.colors.STAT_VALUE + ' ' + slotConfig.colors.TIE_STAT_TEXT">
              {{ stats.tie }}
            </div>
            <div :class="slotConfig.colors.STAT_LABEL">{{ slotConfig.labels.TIE_STAT_LABEL }}</div>
          </div>

          <!-- Total Stats - EXACT SAME COLORS -->
          <div :class="slotConfig.layouts.STATISTICS_CARD + ' ' + slotConfig.colors.TOTAL_STAT_BG">
            <div :class="slotConfig.colors.STAT_VALUE + ' ' + slotConfig.colors.TOTAL_STAT_TEXT">
              {{ stats.total }}
            </div>
            <div :class="slotConfig.colors.STAT_LABEL">
              {{ slotConfig.labels.TOTAL_STAT_LABEL }}
            </div>
          </div>
        </div>
      </template>

      <!-- Pattern Description Slot - EXACT SAME UI WITH PROPER COLORS -->
      <template #pattern-description="{ currentView, description, config: slotConfig }">
        <div v-if="description" class="pattern-description mb-3 p-2 rounded text-sm">
          <div :class="getPatternDescriptionBackgroundClass(currentView)">
            <strong>{{ getPatternTitle(currentView) }}:</strong> {{ description }}
          </div>
        </div>
      </template>

      <!-- Main Grid Slot - EXACT SAME UI -->
      <template
        #grid="{ currentView, gridData, gridConfig, config: slotConfig, onCellHover, tooltipData }"
      >
        <div :class="slotConfig.colors.SCOREBOARD_CONTAINER">
          <!-- Big Road View - EXACT SAME LAYOUT -->
          <div
            v-if="currentView === 'bigroad'"
            class="big-road-grid grid gap-1"
            style="grid-template-rows: repeat(6, 1fr)"
          >
            <div
              v-for="(row, rowIndex) in gridData as ScoreboardCell[][]"
              :key="rowIndex"
              class="big-road-row flex gap-1"
            >
              <div
                v-for="(cell, colIndex) in row"
                :key="colIndex"
                :class="getBigRoadCellClass(cell, slotConfig)"
                style="min-width: 32px"
                @mouseenter="onCellHover(cell)"
                @mouseleave="onCellHover(null)"
                @click="handleCellClicked(cell)"
                :title="getBigRoadTooltip(cell)"
              >
                <!-- Main Content Container with Simplified Layout -->
                <div class="w-full h-full flex items-center justify-center relative">
                  <!-- Result Symbol - Center -->
                  <div class="result-symbol-container">
                    <span v-if="cell.result" class="result-symbol font-bold text-lg">
                      {{ slotConfig.utils.getResultSymbol(cell.result) }}
                    </span>
                  </div>

                  <!-- Win/Loss Indicator - Bottom Right, Bigger in White Circle -->
                  <div
                    v-if="cell.betInfo"
                    class="win-loss-indicator absolute -bottom-2 -right-2 z-20"
                  >
                    <div
                      v-if="cell.betInfo.won"
                      class="win-indicator bg-white rounded-full border-2 border-green-500 shadow-lg flex items-center justify-center"
                      style="width: 20px; height: 20px"
                      title="Won!"
                    >
                      <span class="text-green-500 font-bold" style="font-size: 12px">✓</span>
                    </div>
                    <div
                      v-else
                      class="loss-indicator bg-white rounded-full border-2 border-red-500 shadow-lg flex items-center justify-center"
                      style="width: 20px; height: 20px"
                      title="Lost"
                    >
                      <span class="text-red-500 font-bold" style="font-size: 12px">✕</span>
                    </div>
                  </div>
                </div>

                <!-- Pair Indicators - Top Right Corner -->
                <div
                  v-if="cell.playerPair || cell.bankerPair"
                  class="pair-indicators absolute top-0 right-0 flex flex-col"
                >
                  <div
                    v-if="cell.playerPair"
                    class="pair-dot player-pair text-blue-600 text-xs leading-none"
                  >
                    •
                  </div>
                  <div
                    v-if="cell.bankerPair"
                    class="pair-dot banker-pair text-red-600 text-xs leading-none"
                  >
                    •
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bead Plate View - EXACT SAME LAYOUT -->
          <div
            v-else-if="currentView === 'beadplate'"
            class="bead-plate-grid grid gap-1"
            style="grid-template-rows: repeat(6, 1fr)"
          >
            <div
              v-for="(row, rowIndex) in gridData as ScoreboardCell[][]"
              :key="rowIndex"
              class="bead-plate-row flex gap-1"
            >
              <div
                v-for="(cell, colIndex) in row"
                :key="colIndex"
                :class="getBeadPlateCellClass(cell, slotConfig)"
                style="min-width: 24px"
                @mouseenter="onCellHover(cell)"
                @mouseleave="onCellHover(null)"
                @click="handleCellClicked(cell)"
                :title="getBeadPlateTooltip(cell, slotConfig)"
                class="cursor-pointer"
              >
                <div
                  v-if="cell.result"
                  class="bead-content relative w-full h-full flex items-center justify-center"
                >
                  <!-- Main Content Container with Simplified Layout -->
                  <div class="w-full h-full flex items-center justify-center relative">
                    <!-- Bead Circle - Center -->
                    <div :class="getBeadCircleClass(cell, slotConfig)">
                      {{ slotConfig.utils.getResultSymbol(cell.result) }}
                    </div>

                    <!-- Win/Loss Indicator - Bottom Right, Bigger in White Circle -->
                    <div
                      v-if="cell.betInfo"
                      class="win-loss-indicator absolute -bottom-2 -right-2 z-20"
                    >
                      <div
                        v-if="cell.betInfo.won"
                        class="win-indicator bg-white rounded-full border-2 border-green-500 shadow-lg flex items-center justify-center"
                        style="width: 16px; height: 16px"
                        title="Won!"
                      >
                        <span class="text-green-500 font-bold" style="font-size: 10px">✓</span>
                      </div>
                      <div
                        v-else
                        class="loss-indicator bg-white rounded-full border-2 border-red-500 shadow-lg flex items-center justify-center"
                        style="width: 16px; height: 16px"
                        title="Lost"
                      >
                        <span class="text-red-500 font-bold" style="font-size: 10px">✕</span>
                      </div>
                    </div>
                  </div>

                  <!-- Pair Indicators for Bead Plate -->
                  <div
                    v-if="cell.playerPair || cell.bankerPair"
                    class="bead-pairs absolute -top-1 -right-1 flex flex-col text-xs"
                  >
                    <div
                      v-if="cell.playerPair"
                      class="bead-pair-dot text-white bg-black rounded-full w-3 h-3 flex items-center justify-center text-xs leading-none"
                      style="font-size: 8px"
                    >
                      P
                    </div>
                    <div
                      v-if="cell.bankerPair"
                      class="bead-pair-dot text-white bg-black rounded-full w-3 h-3 flex items-center justify-center text-xs leading-none"
                      style="font-size: 8px"
                    >
                      B
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pattern Analysis Views - EXACT SAME LAYOUT -->
          <div v-else class="pattern-grid grid gap-1" style="grid-template-rows: repeat(6, 1fr)">
            <div
              v-for="(row, rowIndex) in gridData as any[][]"
              :key="rowIndex"
              class="pattern-row flex gap-1"
            >
              <div
                v-for="(cell, colIndex) in row"
                :key="colIndex"
                :class="getPatternCellClass(cell, slotConfig)"
                style="min-width: 32px"
                @mouseenter="onCellHover(cell)"
                @mouseleave="onCellHover(null)"
                @click="handlePatternCellClicked(cell, currentView)"
                :title="getPatternTooltip(cell, currentView, slotConfig)"
                class="cursor-pointer"
              >
                <!-- Pattern Dot - EXACT SAME STYLING -->
                <div v-if="(cell as any)?.result" :class="getPatternDotClass(cell, slotConfig)" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Streak Slot - EXACT SAME UI -->
      <template #streak="{ streak, handNumber, config: slotConfig }">
        <!-- Hand Details Panel - Between Stats and Streak -->
        <div
          v-if="selectedCellDetails"
          class="hand-details-panel mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg"
        >
          <h3 class="text-lg font-semibold mb-3 text-blue-800">
            Hand #{{ selectedCellDetails.handNumber }} Details
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Result Information -->
            <div class="result-info">
              <h4 class="font-semibold text-gray-700 mb-2">Result</h4>
              <div class="flex items-center space-x-3">
                <div
                  class="result-symbol-large text-2xl font-bold px-3 py-1 rounded"
                  :class="getResultDisplayClass(selectedCellDetails.result || '')"
                >
                  {{
                    selectedCellDetails.result
                      ? slotConfig.utils.getResultSymbol(selectedCellDetails.result)
                      : ''
                  }}
                </div>
                <div class="result-text">
                  <div class="font-semibold">
                    {{ selectedCellDetails.result?.toUpperCase() || 'N/A' }}
                  </div>
                  <div
                    v-if="selectedCellDetails.playerPair || selectedCellDetails.bankerPair"
                    class="text-sm text-gray-600"
                  >
                    <span v-if="selectedCellDetails.playerPair">Player Pair</span>
                    <span v-if="selectedCellDetails.playerPair && selectedCellDetails.bankerPair">
                      +
                    </span>
                    <span v-if="selectedCellDetails.bankerPair">Banker Pair</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Information -->
            <div
              v-if="selectedCellDetails.playerCards && selectedCellDetails.bankerCards"
              class="card-info"
            >
              <h4 class="font-semibold text-gray-700 mb-2">Cards Dealt</h4>
              <div class="space-y-2">
                <div class="player-cards">
                  <span class="text-blue-600 font-medium">Player:</span>
                  <span class="ml-2">{{ formatCards(selectedCellDetails.playerCards) }}</span>
                  <span class="ml-2 text-sm text-gray-600"
                    >(Total: {{ calculateCardTotal(selectedCellDetails.playerCards) }})</span
                  >
                </div>
                <div class="banker-cards">
                  <span class="text-red-600 font-medium">Banker:</span>
                  <span class="ml-2">{{ formatCards(selectedCellDetails.bankerCards) }}</span>
                  <span class="ml-2 text-sm text-gray-600"
                    >(Total: {{ calculateCardTotal(selectedCellDetails.bankerCards) }})</span
                  >
                </div>
              </div>
            </div>

            <!-- Betting Information -->
            <div v-if="selectedCellDetails.betInfo" class="bet-info col-span-1 md:col-span-2">
              <h4 class="font-semibold text-gray-700 mb-2">Betting Details</h4>
              <div
                class="bg-white p-3 rounded border grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"
              >
                <div>
                  <span class="text-gray-600">Bet Type:</span>
                  <div class="font-semibold">
                    {{ selectedCellDetails.betInfo.betType.toUpperCase() }}
                  </div>
                </div>
                <div>
                  <span class="text-gray-600">Amount:</span>
                  <div class="font-semibold">
                    ${{ selectedCellDetails.betInfo.betAmount.toFixed(2) }}
                  </div>
                </div>
                <div>
                  <span class="text-gray-600">Result:</span>
                  <div
                    class="font-semibold"
                    :class="selectedCellDetails.betInfo.won ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ selectedCellDetails.betInfo.won ? 'WON' : 'LOST' }}
                  </div>
                </div>
                <div>
                  <span class="text-gray-600">Net:</span>
                  <div
                    class="font-semibold"
                    :class="
                      selectedCellDetails.betInfo.netResult >= 0 ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ selectedCellDetails.betInfo.netResult >= 0 ? '+' : '' }}${{
                      selectedCellDetails.betInfo.netResult.toFixed(2)
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <button
            @click="selectedCellDetails = null"
            class="mt-3 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Close Details
          </button>
        </div>

        <div :class="slotConfig.colors.STREAK_CONTAINER + ' mt-6'">
          <div :class="slotConfig.colors.STREAK_LAYOUT">
            <span :class="slotConfig.colors.STREAK_FONT_WEIGHT">
              {{ slotConfig.labels.CURRENT_STREAK_LABEL }}
            </span>
            <div>
              <span>{{ slotConfig.labels.HAND_NUMBER_LABEL }}{{ handNumber }}</span>
              <span
                v-if="streak.count > 0"
                :class="
                  slotConfig.colors.STREAK_BADGE +
                  ' ' +
                  slotConfig.utils.getStreakColorClass(streak.type)
                "
              >
                {{ streak.type.charAt(0).toUpperCase() + streak.type.slice(1) }}
                {{ slotConfig.labels.STREAK_MULTIPLIER }}{{ streak.count }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </Scoreboard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Scoreboard } from '@/design-system/primitives/Scoreboard';
import {
  SCOREBOARD_SETTINGS,
  SCOREBOARD_UTILS,
  SCOREBOARD_DEFAULTS,
} from '@/config/scoreboardSettings';
import type { ScoreboardView, ScoreboardCell } from '@/config/scoreboardSettings';

// =============================================================================
// COMPONENT INTERFACE
// =============================================================================

export interface ScoreboardSectionProps {
  gameHistory?: any[];
  maxRows?: number;
  maxCols?: number;
  showTooltips?: boolean;
  enablePatternAnalysis?: boolean;
}

export interface ScoreboardSectionEmits {
  (e: 'view-changed', view: ScoreboardView): void;
  (e: 'cell-hovered', data: any): void;
}

// =============================================================================
// PROPS & EMITS
// =============================================================================

const props = withDefaults(defineProps<ScoreboardSectionProps>(), {
  gameHistory: () => [],
  maxRows: 6,
  maxCols: 20,
  showTooltips: true,
  enablePatternAnalysis: true,
});

const emit = defineEmits<ScoreboardSectionEmits>();

// =============================================================================
// REACTIVE STATE
// =============================================================================

const selectedCellDetails = ref<ScoreboardCell | null>(null);

// =============================================================================
// CONFIGURATION ACCESS
// =============================================================================

const config = computed(() => ({
  labels: SCOREBOARD_SETTINGS.LABELS,
  colors: SCOREBOARD_SETTINGS.COLORS,
  layouts: SCOREBOARD_SETTINGS.LAYOUTS,
  defaults: SCOREBOARD_DEFAULTS,
  gridTemplates: SCOREBOARD_SETTINGS.GRID_TEMPLATES,
  utils: SCOREBOARD_UTILS,
}));

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleViewChanged = (view: ScoreboardView) => {
  console.log('[scoreboard-section][view-change] View changed', {
    view,
    timestamp: new Date().toISOString(),
  });

  // Debug pattern analysis data when switching to pattern views
  if (['bigeyeboy', 'smallroad', 'cockroachpig'].includes(view)) {
    console.log(`[scoreboard-section][pattern-debug] Pattern view ${view} selected`, {
      gameHistoryLength: props.gameHistory.length,
      enablePatternAnalysis: props.enablePatternAnalysis,
    });
  }

  emit('view-changed', view);
};

const handleCellHovered = (data: any) => {
  emit('cell-hovered', data);
};

const handleCellClicked = (cell: ScoreboardCell) => {
  if (cell.result) {
    console.log('[scoreboard-section][cell-click-debug] Cell clicked', {
      handNumber: cell.handNumber,
      result: cell.result,
      hasBetInfo: Boolean(cell.betInfo),
      betInfo: cell.betInfo,
      playerCards: cell.playerCards,
      bankerCards: cell.bankerCards,
      playerPair: cell.playerPair,
      bankerPair: cell.bankerPair,
      fullCell: cell,
    });

    // If clicking the same cell, close the panel
    if (selectedCellDetails.value && selectedCellDetails.value.handNumber === cell.handNumber) {
      selectedCellDetails.value = null;
      console.log('[scoreboard-section][cell-click] Panel closed');
    } else {
      // Open panel with new cell details
      selectedCellDetails.value = cell;
      console.log('[scoreboard-section][cell-click] Panel opened', {
        selectedCell: selectedCellDetails.value,
      });
    }
  }
};

const handlePatternCellClicked = (cell: any, currentView: string) => {
  if (cell.result && cell.handNumber > 0) {
    // For pattern cells, we need to find the original hand data from gameHistory
    const originalHand = props.gameHistory.find(
      (hand: any, index: number) => index + 1 === cell.handNumber
    );

    if (originalHand) {
      const scoreboardCell: ScoreboardCell = {
        result: originalHand.winner,
        playerPair: originalHand.playerPair || false,
        bankerPair: originalHand.bankerPair || false,
        handNumber: cell.handNumber,
        playerCards: originalHand.playerCards || originalHand.player,
        bankerCards: originalHand.bankerCards || originalHand.banker,
        betInfo: originalHand.betInfo,
      };

      // If clicking the same cell, close the panel
      if (selectedCellDetails.value && selectedCellDetails.value.handNumber === cell.handNumber) {
        selectedCellDetails.value = null;
        console.log('[scoreboard-section][pattern-cell-click] Panel closed');
      } else {
        // Open panel with converted cell details
        selectedCellDetails.value = scoreboardCell;
        console.log('[scoreboard-section][pattern-cell-click] Pattern cell clicked', {
          originalCell: cell,
          convertedCell: scoreboardCell,
          currentView,
        });
      }
    }
  }
};

// =============================================================================
// UI HELPER FUNCTIONS (EXACT SAME LOGIC)
// =============================================================================

const getBigRoadCellClass = (cell: ScoreboardCell, slotConfig: any): string => {
  const baseClass =
    'w-8 h-8 border border-gray-300 flex items-center justify-center text-xs font-bold relative cursor-pointer';
  const resultClass = cell.result ? `result-${cell.result}` : 'empty';
  const bgClass =
    cell.result === 'player'
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : cell.result === 'banker'
        ? 'bg-red-100 text-red-800 border-red-300'
        : cell.result === 'tie'
          ? 'bg-green-100 text-green-800 border-green-300'
          : 'bg-white';
  return `${baseClass} ${bgClass}`;
};

const getBeadPlateCellClass = (cell: ScoreboardCell, slotConfig: any): string => {
  return 'w-6 h-6 flex items-center justify-center relative';
};

const getBeadCircleClass = (cell: ScoreboardCell, slotConfig: any): string => {
  const baseClass = slotConfig.colors.BEAD_CIRCLE_BASE;
  const colorClass = slotConfig.utils.getResultColorClass(cell.result || '', 'BEAD');
  return `${baseClass} ${colorClass} ${slotConfig.defaults.BEAD_CIRCLE.SIZE}`;
};

const getPatternCellClass = (cell: any, slotConfig: any): string => {
  return 'w-8 h-8 border border-gray-300 flex items-center justify-center relative bg-white';
};

const getPatternDotClass = (cell: any, slotConfig: any): string => {
  const baseClass = slotConfig.colors.PATTERN_DOT_BASE;
  const colorClass = slotConfig.utils.getResultColorClass(cell.result || '', 'PATTERN');
  const sizeClass = slotConfig.defaults.PATTERN_DOT.SIZE;

  return `${baseClass} ${colorClass} ${sizeClass}`;
};

const getPatternDescriptionBackgroundClass = (currentView: string): string => {
  switch (currentView) {
    case 'bigroad':
    case 'beadplate':
      return 'bg-blue-50 p-2 rounded';
    case 'bigeyeboy':
      return 'bg-green-50 p-2 rounded';
    case 'smallroad':
      return 'bg-purple-50 p-2 rounded';
    case 'cockroachpig':
      return 'bg-orange-50 p-2 rounded';
    default:
      return 'bg-gray-50 p-2 rounded';
  }
};

const getPatternTitle = (currentView: string): string => {
  switch (currentView) {
    case 'bigroad':
      return 'Big Road';
    case 'beadplate':
      return 'Bead Plate';
    case 'bigeyeboy':
      return 'Big Eye Boy';
    case 'smallroad':
      return 'Small Road';
    case 'cockroachpig':
      return 'Cockroach Pig';
    default:
      return 'Unknown View';
  }
};

// Enhanced tooltip functions with card details and betting info
const getBigRoadTooltip = (cell: ScoreboardCell): string => {
  if (!cell || !cell.result) {
    return '';
  }

  let tooltip = `Hand #${cell.handNumber}: ${cell.result.toUpperCase()}`;

  // Add card information
  if (cell.playerCards && cell.bankerCards) {
    const playerTotal = calculateCardTotal(cell.playerCards);
    const bankerTotal = calculateCardTotal(cell.bankerCards);

    tooltip += `\n\nPlayer: ${formatCards(cell.playerCards)} (Total: ${playerTotal})`;
    tooltip += `\nBanker: ${formatCards(cell.bankerCards)} (Total: ${bankerTotal})`;
  }

  // Add pair information
  if (cell.playerPair) {
    tooltip += '\n+ Player Pair';
  }
  if (cell.bankerPair) {
    tooltip += '\n+ Banker Pair';
  }

  // ✨ CRITICAL FIX: Properly handle undefined/null betInfo
  if (cell.betInfo && cell.betInfo.betType) {
    tooltip += `\n\nBet: $${cell.betInfo.betAmount} on ${cell.betInfo.betType.toUpperCase()}`;
    tooltip += `\nResult: ${cell.betInfo.won ? 'WON' : 'LOST'}`;
    tooltip += `\nPayout: $${cell.betInfo.payout.toFixed(2)}`;
    tooltip += `\nNet: ${cell.betInfo.netResult >= 0 ? '+' : ''}$${cell.betInfo.netResult.toFixed(2)}`;
  }

  return tooltip;
};

const getBeadPlateTooltip = (cell: ScoreboardCell, slotConfig: any): string => {
  return getBigRoadTooltip(cell);
};

const getPatternTooltip = (cell: any, currentView: string, slotConfig: any): string => {
  if (!cell.result) {
    return '';
  }
  return `${currentView}: ${cell.result} - Hand #${cell.handNumber}`;
};

const getResultDisplayClass = (result: string | null): string => {
  if (!result) {
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

  switch (result) {
    case 'player':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'banker':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'tie':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Helper functions for card display
const calculateCardTotal = (cards: any[]): number => {
  if (!cards || cards.length === 0) {
    return 0;
  }

  let total = 0;
  cards.forEach(card => {
    if (typeof card === 'object' && card.rank) {
      const rank = card.rank;
      if (rank === 'A') {
        total += 1;
      } else if (['J', 'Q', 'K'].includes(rank)) {
        total += 0;
      } else {
        total += parseInt(rank) || 0;
      }
    }
  });

  return total % 10;
};

const formatCards = (cards: any[]): string => {
  if (!cards || cards.length === 0) {
    return '';
  }

  return cards
    .map(card => {
      if (typeof card === 'object' && card.rank && card.suit) {
        return `${card.rank}${card.suit}`;
      }
      return String(card);
    })
    .join(', ');
};

console.log('[scoreboard-section][lifecycle] Scoreboard section initialized', {
  gameHistoryLength: props.gameHistory.length,
  maxRows: props.maxRows,
  maxCols: props.maxCols,
  enablePatternAnalysis: props.enablePatternAnalysis,
  gameHistoryDetails: props.gameHistory.map((hand, index) => ({
    index,
    handNumber: hand.handNumber || index + 1,
    winner: hand.winner,
    hasBetInfo: Boolean(hand.betInfo),
    betInfo: hand.betInfo,
    hasCards: Boolean(hand.playerCards || hand.player) && Boolean(hand.bankerCards || hand.banker),
  })),
  configCheck: {
    hasDefaults: Boolean(config.value.defaults),
    hasPatternDotSize: Boolean(config.value.defaults?.PATTERN_DOT?.SIZE),
    patternDotSize: config.value.defaults?.PATTERN_DOT?.SIZE,
    hasPatternColors: {
      red: Boolean(config.value.colors.PATTERN_RED),
      blue: Boolean(config.value.colors.PATTERN_BLUE),
      base: Boolean(config.value.colors.PATTERN_DOT_BASE),
    },
    patternColors: {
      red: config.value.colors.PATTERN_RED,
      blue: config.value.colors.PATTERN_BLUE,
      base: config.value.colors.PATTERN_DOT_BASE,
    },
  },
});
</script>

<style scoped>
/* All styling handled through Tailwind classes from configuration */
</style>
