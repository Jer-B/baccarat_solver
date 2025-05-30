<template>
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
                store.bettingStats.edgeSortingAccuracy >= 0.6 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ (store.bettingStats.edgeSortingAccuracy * 100).toFixed(1) }}%
            </span>
          </div>
          <div class="flex justify-between">
            <span>Pair Bet Accuracy:</span>
            <span
              class="font-medium"
              :class="store.bettingStats.pairBetAccuracy >= 0.5 ? 'text-green-600' : 'text-red-600'"
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
                store.bettingStats.currentStreakType === 'win' ? 'text-green-600' : 'text-red-600'
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
            <span class="font-medium text-red-600">{{ store.bettingStats.longestLossStreak }}</span>
          </div>
        </div>
      </div>

      <!-- Financial Metrics -->
      <div class="space-y-2">
        <h4 class="font-medium text-gray-700">Financial Metrics</h4>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span>Average Bet Size:</span>
            <span class="font-medium">${{ store.bettingStats.averageBetSize.toFixed(2) }}</span>
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
</template>

<script setup lang="ts">
import { useBaccaratStore } from '@/stores/baccaratStore';

const store = useBaccaratStore();
</script>
