<template>
  <div class="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-green-800">🎯 Professional Recommendations</h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-green-600">Confidence:</span>
        <span class="font-bold text-green-800">{{ (overallConfidence * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- Main Recommendation -->
    <div class="mb-6 p-4 rounded-lg border-2" :class="getRecommendationClass()">
      <div class="flex items-center space-x-3 mb-3">
        <span class="text-2xl">{{ getRecommendationIcon() }}</span>
        <div>
          <h3 class="text-lg font-bold" :class="getRecommendationTextClass()">
            {{ recommendation.action.toUpperCase() }} APPROACH
          </h3>
          <div class="text-sm opacity-90">Based on integrated professional analysis</div>
        </div>
      </div>
      <div class="text-sm" :class="getRecommendationTextClass()">
        <strong>Reasoning:</strong> {{ recommendation.reasoning }}
      </div>
    </div>

    <!-- Detailed Analysis Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Kelly Analysis -->
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 class="font-semibold text-blue-800 mb-2">💰 Kelly Criterion</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Optimal Bet:</span>
            <span class="font-bold text-blue-600">${{ kellyOptimal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Kelly %:</span>
            <span class="font-bold">{{ (kellyPercentage * 100).toFixed(2) }}%</span>
          </div>
          <div class="flex justify-between">
            <span>Burn Adjustment:</span>
            <span :class="burnAdjustment >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ burnAdjustment >= 0 ? '+' : '' }}{{ (burnAdjustment * 100).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Risk Assessment -->
      <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 class="font-semibold text-orange-800 mb-2">⚠️ Risk Assessment</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Risk Level:</span>
            <span class="font-bold" :class="getRiskLevelClass()">{{ getRiskLevel() }}</span>
          </div>
          <div class="flex justify-between">
            <span>Uncertainty:</span>
            <span class="font-bold text-orange-600">{{ (uncertainty * 100).toFixed(1) }}%</span>
          </div>
          <div class="flex justify-between">
            <span>Volatility:</span>
            <span class="font-bold">{{ getVolatilityLevel() }}</span>
          </div>
        </div>
      </div>

      <!-- Edge Analysis -->
      <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 class="font-semibold text-purple-800 mb-2">📊 Edge Analysis</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Best Edge:</span>
            <span class="font-bold" :class="bestEdge >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ bestEdge >= 0 ? '+' : '' }}{{ (bestEdge * 100).toFixed(3) }}%
            </span>
          </div>
          <div class="flex justify-between">
            <span>Burn Impact:</span>
            <span :class="burnImpact >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ burnImpact >= 0 ? '+' : '' }}{{ (burnImpact * 100).toFixed(3) }}%
            </span>
          </div>
          <div class="flex justify-between">
            <span>Confidence:</span>
            <span class="font-bold text-purple-600">{{ (edgeConfidence * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Specific Recommendations -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">📋 Specific Recommendations</h3>
      <div class="space-y-3">
        <div
          v-for="rec in specificRecommendations"
          :key="rec.type"
          class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          <span class="text-lg">{{ rec.icon }}</span>
          <div class="flex-1">
            <div class="font-medium text-gray-800">{{ rec.title }}</div>
            <div class="text-sm text-gray-600">{{ rec.description }}</div>
            <div v-if="rec.value" class="text-xs text-gray-500 mt-1">
              <strong>Suggested:</strong> {{ rec.value }}
            </div>
          </div>
          <div class="text-xs px-2 py-1 rounded" :class="getPriorityClass(rec.priority)">
            {{ rec.priority }}
          </div>
        </div>
      </div>
    </div>

    <!-- Professional Notes -->
    <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-800">📚 Professional Notes</h4>
        <InfoToggleButton
          type="section"
          section="professionalRecommendations"
          subsection="professionalNotes"
          variant="default"
          size="xs"
        />
      </div>
      <div
        v-if="visibilityStore.isVisible('professionalRecommendations', 'professionalNotes')"
        class="text-xs text-gray-600 space-y-1"
      >
        <div>
          <strong>Integration:</strong> Recommendations combine Kelly Criterion, Monte Carlo risk
          analysis, and professional burn card estimation
        </div>
        <div>
          <strong>Adaptation:</strong> System learns from dealer patterns and adjusts
          recommendations in real-time
        </div>
        <div>
          <strong>Risk Management:</strong> Conservative approach when uncertainty is high,
          aggressive when edge is clear
        </div>
        <div>
          <strong>Professional Use:</strong> Based on methodologies from Jacobson, Griffin, and Wong
          research
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { BurnAnalysisIntegration } from '../../services/burnAnalysisIntegration';
import InfoToggleButton from '@/components/common/button/InfoToggleButton.vue';

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();

// Generate professional recommendation using integrated analysis
const recommendation = computed(() => {
  return BurnAnalysisIntegration.generateRecommendation(store.burnAnalysisMetadata);
});

// Calculate overall confidence from all systems
const overallConfidence = computed(() => {
  return BurnAnalysisIntegration.calculateOverallConfidence(store.burnAnalysisMetadata);
});

// Kelly Criterion calculations
const kellyOptimal = computed(() => {
  const baseKelly = Math.max(store.bestBetRecommendation.edge * 0.1, 0);
  return (
    BurnAnalysisIntegration.applyToKelly(baseKelly, store.burnAnalysisMetadata) *
    store.settings.kelly.bankrollAmount
  );
});

const kellyPercentage = computed(() => {
  const baseKelly = Math.max(store.bestBetRecommendation.edge * 0.1, 0);
  return BurnAnalysisIntegration.applyToKelly(baseKelly, store.burnAnalysisMetadata);
});

const burnAdjustment = computed(() => {
  if (!store.burnAnalysisMetadata) {
    return 0;
  }
  return store.burnAnalysisMetadata.kellyMultiplier - 1;
});

// Risk assessment
const uncertainty = computed(() => {
  return store.burnAnalysisMetadata?.uncertaintyLevel || 0.1;
});

const getRiskLevel = () => {
  const risk = uncertainty.value;
  if (risk > 0.7) {
    return 'HIGH';
  }
  if (risk > 0.4) {
    return 'MEDIUM';
  }
  return 'LOW';
};

const getRiskLevelClass = () => {
  const level = getRiskLevel();
  if (level === 'HIGH') {
    return 'text-red-600';
  }
  if (level === 'MEDIUM') {
    return 'text-orange-600';
  }
  return 'text-green-600';
};

const getVolatilityLevel = () => {
  const volatility = store.burnAnalysisMetadata?.monteCarloAdjustment || 1.0;
  if (volatility > 1.2) {
    return 'High';
  }
  if (volatility < 0.8) {
    return 'Low';
  }
  return 'Normal';
};

// Edge analysis
const bestEdge = computed(() => {
  return Math.max(
    store.edgeCalculations.playerEdge,
    store.edgeCalculations.bankerEdge,
    store.edgeCalculations.tieEdge
  );
});

const burnImpact = computed(() => {
  return store.burnAnalysisMetadata?.weightedEdgeImpact || 0;
});

const edgeConfidence = computed(() => {
  return store.edgeCalculations.confidence;
});

// Specific recommendations based on current state
const specificRecommendations = computed(() => {
  const recs = [];

  // Bet sizing recommendation
  if (kellyOptimal.value > 0) {
    recs.push({
      type: 'bet_sizing',
      icon: '💰',
      title: 'Optimal Bet Sizing',
      description: 'Use Kelly Criterion for mathematically optimal bet size',
      value: `$${kellyOptimal.value.toFixed(2)} (${(kellyPercentage.value * 100).toFixed(1)}% of bankroll)`,
      priority: 'HIGH',
    });
  }

  // Risk management
  if (uncertainty.value > 0.5) {
    recs.push({
      type: 'risk_management',
      icon: '🛡️',
      title: 'Risk Management',
      description: 'High uncertainty detected - consider reducing bet sizes',
      value: `Reduce bets by ${(uncertainty.value * 30).toFixed(0)}%`,
      priority: 'HIGH',
    });
  }

  // Burn card strategy
  if (store.shoe.burnedCards.filter(c => c.isUnknownBurn).length > 0) {
    recs.push({
      type: 'burn_strategy',
      icon: '🔥',
      title: 'Burn Card Intelligence',
      description: 'Professional algorithms are analyzing unknown burns',
      value: `${store.shoe.burnedCards.filter(c => c.isUnknownBurn).length} unknown burns tracked`,
      priority: 'MEDIUM',
    });
  }

  // Edge opportunity
  if (bestEdge.value > 0.01) {
    recs.push({
      type: 'edge_opportunity',
      icon: '📈',
      title: 'Edge Opportunity',
      description: 'Favorable edge detected - consider increasing exposure',
      value: `+${(bestEdge.value * 100).toFixed(3)}% edge available`,
      priority: 'HIGH',
    });
  }

  // Pattern recognition
  if (store.history.hands.length > 10) {
    recs.push({
      type: 'pattern_analysis',
      icon: '🔍',
      title: 'Pattern Analysis',
      description: 'Sufficient data for pattern-based decisions',
      value: `${store.history.hands.length} hands analyzed`,
      priority: 'LOW',
    });
  }

  return recs;
});

// UI helper functions
const getRecommendationClass = () => {
  switch (recommendation.value.action) {
    case 'aggressive':
      return 'bg-green-100 border-green-500';
    case 'conservative':
      return 'bg-red-100 border-red-500';
    default:
      return 'bg-blue-100 border-blue-500';
  }
};

const getRecommendationTextClass = () => {
  switch (recommendation.value.action) {
    case 'aggressive':
      return 'text-green-800';
    case 'conservative':
      return 'text-red-800';
    default:
      return 'text-blue-800';
  }
};

const getRecommendationIcon = () => {
  switch (recommendation.value.action) {
    case 'aggressive':
      return '🚀';
    case 'conservative':
      return '🛡️';
    default:
      return '⚖️';
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-200 text-red-800';
    case 'MEDIUM':
      return 'bg-orange-200 text-orange-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow-sm border;
}
</style>
