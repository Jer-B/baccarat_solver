<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">🎓 Professional Burn Card Analysis</h2>
      <div class="text-sm text-gray-600">
        <span class="font-medium">Strategic Value:</span>
        <span
          :class="store.totalCardsRemaining < 52 ? 'text-orange-600 font-bold' : 'text-gray-500'"
        >
          {{ store.totalCardsRemaining < 52 ? 'HIGH (End of Shoe)' : 'Standard' }}
        </span>
      </div>
    </div>

    <!-- Professional Burn Status -->
    <div class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <h3 class="font-medium text-orange-800 mb-3">🔥 Unknown Burned Cards</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">
            {{ store.shoe.burnedCards.filter(card => card.isUnknownBurn).length }}
          </div>
          <div class="text-sm text-orange-700">Cards Burned</div>
          <div class="text-xs text-orange-600">(Unknown composition)</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {{
              store.burnAnalysisMetadata?.uncertaintyLevel
                ? (store.burnAnalysisMetadata.uncertaintyLevel * 100).toFixed(1)
                : '0.0'
            }}%
          </div>
          <div class="text-sm text-blue-700">Uncertainty Level</div>
          <div class="text-xs text-blue-600">(Lower is better)</div>
        </div>
        <div class="text-center">
          <div
            class="text-2xl font-bold"
            :class="
              (store.burnAnalysisMetadata?.kellyMultiplier ?? 1) >= 1
                ? 'text-green-600'
                : 'text-red-600'
            "
          >
            {{
              store.burnAnalysisMetadata?.kellyMultiplier
                ? (store.burnAnalysisMetadata.kellyMultiplier * 100).toFixed(1)
                : '100.0'
            }}%
          </div>
          <div class="text-sm text-gray-700">Kelly Multiplier</div>
          <div class="text-xs text-gray-600">(Bet size adjustment)</div>
        </div>
      </div>
    </div>

    <!-- Professional Algorithms Status -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">🧠 Algorithm Analysis</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="font-medium text-blue-800">Jacobson Method</div>
          <div class="text-sm text-blue-600">Statistical burn patterns</div>
          <div class="text-xs text-blue-500 mt-1">
            {{
              store.shoe.burnedCards.filter(card => card.isUnknownBurn).length > 0
                ? 'Active'
                : 'Standby'
            }}
          </div>
        </div>
        <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="font-medium text-green-800">Griffin Method</div>
          <div class="text-sm text-green-600">High/low card bias</div>
          <div class="text-xs text-green-500 mt-1">
            {{ store.history.hands.length > 2 ? 'Active' : 'Learning' }}
          </div>
        </div>
        <div class="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div class="font-medium text-orange-800">Wong Method</div>
          <div class="text-sm text-orange-600">Adaptive patterns</div>
          <div class="text-xs text-orange-500 mt-1">
            {{ store.history.hands.length > 5 ? 'Active' : 'Calibrating' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Edge Impact Analysis -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">📊 Edge Impact Analysis</h3>
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600">Weighted Edge Impact:</div>
            <div
              class="text-lg font-bold"
              :class="
                (store.burnAnalysisMetadata?.weightedEdgeImpact ?? 0) >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{
                store.burnAnalysisMetadata?.weightedEdgeImpact
                  ? (store.burnAnalysisMetadata.weightedEdgeImpact >= 0 ? '+' : '') +
                    (store.burnAnalysisMetadata.weightedEdgeImpact * 100).toFixed(3) +
                    '%'
                  : 'N/A'
              }}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Monte Carlo Adjustment:</div>
            <div
              class="text-lg font-bold"
              :class="
                (store.burnAnalysisMetadata?.monteCarloAdjustment ?? 1) >= 1
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{
                store.burnAnalysisMetadata?.monteCarloAdjustment
                  ? (store.burnAnalysisMetadata.monteCarloAdjustment * 100).toFixed(1) + '%'
                  : 'N/A'
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Known Burned Cards (if any) -->
    <div v-if="store.shoe.burnedCards.filter(card => !card.isUnknownBurn).length > 0" class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">👁️ Known Burned Cards</h3>
      <div class="text-sm text-gray-600 mb-3">
        Cards that were observed or suspected during play:
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="card in store.shoe.burnedCards.filter(card => !card.isUnknownBurn)"
          :key="`${card.rank}-${card.suit}-${card.timestamp}`"
          class="px-3 py-2 bg-blue-100 border border-blue-300 rounded-lg"
        >
          <span class="font-medium">{{ card.rank }}{{ card.suit.charAt(0).toUpperCase() }}</span>
          <span v-if="card.confidence" class="text-xs text-blue-600 ml-1">
            ({{ card.confidence }}% sure)
          </span>
        </div>
      </div>
    </div>

    <!-- Professional Notes -->
    <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-yellow-800">💡 Professional Notes</h4>
        <InfoToggleButton
          type="section"
          section="burnAnalysis"
          subsection="professionalNotes"
          variant="warning"
          size="xs"
        />
      </div>
      <div
        v-if="visibilityStore.isVisible('burnAnalysis', 'professionalNotes')"
        class="text-xs text-yellow-700 space-y-1"
      >
        <div>
          <strong>Unknown Burns:</strong> Cards removed from play without revealing their identity
          (realistic casino simulation)
        </div>
        <div>
          <strong>Algorithm Integration:</strong> Multiple professional methods estimate burn impact
          on edge calculations
        </div>
        <div>
          <strong>Kelly Integration:</strong> Burn uncertainty automatically adjusts optimal bet
          sizing
        </div>
        <div>
          <strong>Monte Carlo Integration:</strong> Risk projections account for burn card
          uncertainty
        </div>
      </div>
    </div>

    <!-- Legacy Analysis (for reference) -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h3 class="font-medium text-gray-700 mb-3">📈 Statistical Reference</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="text-center p-3 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-800">
            {{ store.burnedCardAnalysis.totalBurned }}
          </div>
          <div class="text-sm text-gray-600">Total Burned</div>
        </div>
        <div class="text-center p-3 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">
            {{ (store.burnedCardAnalysis.confidenceLevel * 100).toFixed(1) }}%
          </div>
          <div class="text-sm text-gray-600">Legacy Confidence</div>
        </div>
        <div class="text-center p-3 bg-purple-50 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">
            {{ store.burnedCardAnalysis.estimatedImpact.toFixed(3) }}
          </div>
          <div class="text-sm text-gray-600">Legacy Impact</div>
        </div>
      </div>
    </div>

    <!-- Burned Cards by Rank -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">Cards Burned by Rank</h3>
      <div class="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-13 gap-2">
        <div
          v-for="rank in ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']"
          :key="rank"
          class="text-center p-2 bg-gray-50 rounded border"
        >
          <div
            class="font-bold text-lg"
            :class="
              getBurnedCardColor(store.burnedCardAnalysis.burnedByRank.get(rank as Rank) || 0)
            "
          >
            {{ store.burnedCardAnalysis.burnedByRank.get(rank as Rank) || 0 }}
          </div>
          <div class="text-xs text-gray-600">{{ rank }}</div>
        </div>
      </div>
    </div>

    <!-- Burned Cards by Baccarat Value -->
    <div>
      <h3 class="font-medium text-gray-700 mb-3">Cards Burned by Baccarat Value</h3>
      <div class="grid grid-cols-5 md:grid-cols-10 gap-2">
        <div
          v-for="value in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
          :key="value"
          class="text-center p-2 bg-gray-50 rounded border"
        >
          <div class="font-bold text-lg" :class="getBurnedCardColor(getBurnedCardsByValue(value))">
            {{ getBurnedCardsByValue(value) }}
          </div>
          <div class="text-xs text-gray-600">{{ value }}</div>
        </div>
      </div>
      <div class="mt-2 text-xs text-gray-500">
        Value 0: 10, J, Q, K | Value 1: A | Values 2-9: Face value
      </div>

      <!-- Strategic Information -->
      <div
        v-if="store.totalCardsRemaining < 104"
        class="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg"
      >
        <h4 class="text-sm font-semibold text-orange-800 mb-2">🎯 End-of-Shoe Strategy Notes</h4>
        <div class="text-xs text-orange-700 space-y-1">
          <div>
            <strong>Burn Card Intelligence:</strong> Near shoe end, knowing burned cards becomes
            crucial for accurate edge calculations.
          </div>
          <div>
            <strong>Professional Advantage:</strong> Advanced players track burn patterns to gain
            significant edges in final hands.
          </div>
          <div>
            <strong>Kelly & Monte Carlo:</strong> Burn card knowledge improves betting size
            calculations and risk assessment.
          </div>
          <div class="pt-2 border-t border-orange-200">
            <strong>Cards Remaining:</strong> {{ store.totalCardsRemaining }} / 416
            <span v-if="store.totalCardsRemaining < 52" class="text-orange-600 font-bold"
              >(CRITICAL ZONE!)</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useVisibilityStore } from '@/stores/visibilityStore';
import InfoToggleButton from '@/components/common/button/InfoToggleButton.vue';
import type { Rank } from '@/types/cards';

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();

// Helper methods for burned cards analysis
const getBurnedCardColor = (count: number): string => {
  if (count === 0) {
    return 'text-gray-400';
  }
  if (count <= 2) {
    return 'text-green-600';
  }
  if (count <= 4) {
    return 'text-yellow-600';
  }
  return 'text-red-600';
};

const getBurnedCardsByValue = (value: number): number => {
  let count = 0;

  if (value === 0) {
    // Count 10, J, Q, K
    count += store.burnedCardAnalysis.burnedByRank.get('10') || 0;
    count += store.burnedCardAnalysis.burnedByRank.get('J') || 0;
    count += store.burnedCardAnalysis.burnedByRank.get('Q') || 0;
    count += store.burnedCardAnalysis.burnedByRank.get('K') || 0;
  } else if (value === 1) {
    // Count Aces
    count += store.burnedCardAnalysis.burnedByRank.get('A') || 0;
  } else {
    // Count number cards 2-9
    count += store.burnedCardAnalysis.burnedByRank.get(value.toString() as Rank) || 0;
  }

  return count;
};
</script>
