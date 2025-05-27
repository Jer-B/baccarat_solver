<template>
  <div class="card bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-purple-800">🎓 Professional Burn Card Analysis</h2>
      <div class="flex items-center space-x-2">
        <button
          @click="runAnalysis()"
          :disabled="!store.canPerformActions"
          class="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 text-sm"
        >
          🔄 Analyze
        </button>
        <span class="text-sm text-purple-600">
          Confidence: {{ (currentConfidence * 100).toFixed(1) }}%
        </span>
      </div>
    </div>

    <!-- Professional Algorithms Section -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">🧠 Professional Algorithms</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Jacobson Method -->
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-blue-800 font-medium">Jacobson Method</span>
            <span class="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Statistical</span>
          </div>
          <div class="text-xs text-blue-700 space-y-1">
            <div><strong>Approach:</strong> Multiple burn count scenarios</div>
            <div><strong>Basis:</strong> Casino frequency data</div>
            <div><strong>Strength:</strong> Empirical validation</div>
          </div>
        </div>

        <!-- Griffin Method -->
        <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-green-800 font-medium">Griffin Method</span>
            <span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Bias Analysis</span>
          </div>
          <div class="text-xs text-green-700 space-y-1">
            <div><strong>Approach:</strong> High vs low card bias</div>
            <div><strong>Basis:</strong> Dealer behavior patterns</div>
            <div><strong>Strength:</strong> Psychological factors</div>
          </div>
        </div>

        <!-- Wong Method -->
        <div class="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-orange-800 font-medium">Wong Method</span>
            <span class="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">Adaptive</span>
          </div>
          <div class="text-xs text-orange-700 space-y-1">
            <div><strong>Approach:</strong> Pattern recognition</div>
            <div><strong>Basis:</strong> Historical hand analysis</div>
            <div><strong>Strength:</strong> Self-adjusting</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Analysis Results -->
    <div v-if="currentAnalysis" class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">📊 Current Analysis Results</h3>

      <!-- Summary Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div class="text-center p-3 bg-white rounded-lg border">
          <div class="text-2xl font-bold text-purple-600">
            {{ currentAnalysis.scenarios.length }}
          </div>
          <div class="text-xs text-gray-600">Active Scenarios</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg border">
          <div class="text-2xl font-bold" :class="edgeImpactClass">
            {{ (currentAnalysis.weightedEdgeImpact * 100).toFixed(3) }}%
          </div>
          <div class="text-xs text-gray-600">Weighted Edge Impact</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg border">
          <div class="text-2xl font-bold" :class="kellyMultiplierClass">
            {{ (currentAnalysis.kellyMultiplier * 100).toFixed(1) }}%
          </div>
          <div class="text-xs text-gray-600">Kelly Multiplier</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg border">
          <div class="text-2xl font-bold" :class="actionClass">
            {{ currentAnalysis.recommendedAction.toUpperCase() }}
          </div>
          <div class="text-xs text-gray-600">Recommended Action</div>
        </div>
      </div>

      <!-- Professional Recommendation -->
      <div
        v-if="professionalRec"
        class="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg mb-4"
      >
        <h4 class="font-semibold text-yellow-800 mb-2">🎯 Professional Recommendation</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-yellow-700">Kelly Percentage:</span>
              <span class="font-bold text-yellow-800"
                >{{ (professionalRec.kellyPercentage * 100).toFixed(2) }}%</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-yellow-700">Edge Adjustment:</span>
              <span
                class="font-bold"
                :class="professionalRec.edgeAdjustment >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ professionalRec.edgeAdjustment >= 0 ? '+' : ''
                }}{{ (professionalRec.edgeAdjustment * 100).toFixed(3) }}%
              </span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-yellow-700">Confidence:</span>
              <span class="font-bold text-yellow-800"
                >{{ (professionalRec.confidence * 100).toFixed(1) }}%</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-yellow-700">Action:</span>
              <span class="font-bold" :class="actionClass">{{
                professionalRec.action.toUpperCase()
              }}</span>
            </div>
          </div>
        </div>
        <div class="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
          <strong>Reasoning:</strong> {{ professionalRec.reasoning }}
        </div>
      </div>

      <!-- Scenario Breakdown -->
      <div class="space-y-3">
        <h4 class="font-medium text-gray-700">🔍 Scenario Breakdown</h4>
        <div class="space-y-2">
          <div
            v-for="scenario in currentAnalysis.scenarios.slice(0, 6)"
            :key="scenario.id"
            class="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex-1">
              <div class="font-medium text-gray-800">{{ scenario.name }}</div>
              <div class="text-xs text-gray-600">
                {{ scenario.estimates.length }} card estimates
              </div>
            </div>
            <div class="text-center px-3">
              <div class="text-sm font-bold text-blue-600">
                {{ (scenario.totalProbability * 100).toFixed(1) }}%
              </div>
              <div class="text-xs text-gray-500">Probability</div>
            </div>
            <div class="text-center px-3">
              <div
                class="text-sm font-bold"
                :class="scenario.edgeImpact >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ scenario.edgeImpact >= 0 ? '+' : ''
                }}{{ (scenario.edgeImpact * 100).toFixed(3) }}%
              </div>
              <div class="text-xs text-gray-500">Edge Impact</div>
            </div>
            <div class="text-center px-3">
              <div
                class="text-sm font-bold"
                :class="scenario.kellyAdjustment >= 1 ? 'text-green-600' : 'text-red-600'"
              >
                {{ (scenario.kellyAdjustment * 100).toFixed(1) }}%
              </div>
              <div class="text-xs text-gray-500">Kelly Adj.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Analysis State -->
    <div v-else class="text-center py-8">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="text-gray-600 mb-2">No Professional Analysis Available</div>
      <div class="text-sm text-gray-500">
        Click "Analyze" to run professional burn card algorithms
      </div>
    </div>

    <!-- Professional Notes -->
    <div class="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-800">📚 Professional Notes</h4>
        <button
          @click="store.toggleSectionVisibility('professionalBurnAnalysis', 'professionalNotes')"
          :disabled="!store.isToggleEnabled()"
          class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="
            store.ui.globalToggleMode
              ? store.isVisible('professionalBurnAnalysis', 'professionalNotes')
                ? 'Hide professional notes'
                : 'Show professional notes'
              : 'Enable info panels to toggle individual sections'
          "
        >
          {{ store.getToggleButtonText('professionalBurnAnalysis', 'professionalNotes') }}
        </button>
      </div>
      <div
        v-if="store.isVisible('professionalBurnAnalysis', 'professionalNotes')"
        class="text-xs text-gray-600 space-y-1"
      >
        <div>
          <strong>Jacobson Method:</strong> Based on "Advanced Advantage Play" - uses statistical
          analysis of casino burn procedures
        </div>
        <div>
          <strong>Griffin Method:</strong> Adapted from "The Theory of Blackjack" - focuses on
          dealer bias patterns
        </div>
        <div>
          <strong>Wong Method:</strong> From Stanford Wong's work - adaptive pattern recognition
          system
        </div>
        <div>
          <strong>Bayesian Updates:</strong> Modern approach that updates probabilities as new
          evidence emerges
        </div>
        <div class="pt-2 border-t border-gray-300">
          <strong>Integration:</strong> All methods are weighted and combined for optimal Kelly
          Criterion and Monte Carlo adjustments
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useBaccaratStore } from '../../stores/baccaratStore';
import { useProfessionalBurnEstimation } from '../../composables/useProfessionalBurnEstimation';

const store = useBaccaratStore();
const burnEstimation = useProfessionalBurnEstimation();

const currentAnalysis = computed(() => burnEstimation.currentAnalysis.value);
const professionalRec = computed(() => burnEstimation.professionalRecommendation.value);

const currentConfidence = computed(() => {
  if (!currentAnalysis.value) {
    return 0;
  }
  const interval = currentAnalysis.value.confidenceInterval;
  if (!interval || interval.length < 2) {
    return 0;
  }
  return 1 - (interval[1] - interval[0]);
});

const edgeImpactClass = computed(() => {
  if (!currentAnalysis.value) {
    return 'text-gray-600';
  }
  const impact = currentAnalysis.value.weightedEdgeImpact;
  if (impact > 0.003) {
    return 'text-green-600';
  }
  if (impact < -0.003) {
    return 'text-red-600';
  }
  return 'text-gray-600';
});

const kellyMultiplierClass = computed(() => {
  if (!currentAnalysis.value) {
    return 'text-gray-600';
  }
  const multiplier = currentAnalysis.value.kellyMultiplier;
  if (multiplier > 1.1) {
    return 'text-green-600';
  }
  if (multiplier < 0.9) {
    return 'text-red-600';
  }
  return 'text-gray-600';
});

const actionClass = computed(() => {
  if (!currentAnalysis.value) {
    return 'text-gray-600';
  }
  const action = currentAnalysis.value.recommendedAction;
  if (action === 'aggressive') {
    return 'text-green-600';
  }
  if (action === 'conservative') {
    return 'text-red-600';
  }
  return 'text-blue-600';
});

const runAnalysis = () => {
  if (!store.canPerformActions) {
    return;
  }

  // Run the professional burn analysis
  const analysis = burnEstimation.analyzeBurnScenarios(
    store.shoe.remainingCards,
    store.history.hands,
    store.shoe.burnedCards,
    store.currentPenetration
  );

  // Update the current analysis
  burnEstimation.currentAnalysis.value = analysis;

  // Apply to store edges if needed
  store.runProfessionalBurnAnalysis();
};

// Auto-run analysis when component mounts if we have enough data
onMounted(() => {
  if (store.history.hands.length >= 3 && store.currentPenetration > 0.1) {
    runAnalysis();
  }
});
</script>
