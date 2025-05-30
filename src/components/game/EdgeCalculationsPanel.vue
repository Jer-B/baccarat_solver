<template>
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
            <span :class="getEdgeClass(store.edgeCalculations.edgeSortingAdvantage || 0)">
              {{ ((store.edgeCalculations.edgeSortingAdvantage || 0) * 100).toFixed(3) }}%
            </span>
            <span
              v-if="(store.edgeCalculations.edgeSortingAdvantage || 0) > 0.01"
              class="text-xs bg-yellow-100 text-yellow-800 px-1 rounded"
            >
              HIGH ADVANTAGE!
            </span>
            <span
              v-else-if="(store.edgeCalculations.edgeSortingAdvantage || 0) > 0"
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
</template>

<script setup lang="ts">
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useGameLogic } from '@/composables/useGameLogic';

const store = useBaccaratStore();
const { getEdgeClass } = useGameLogic();
</script>
