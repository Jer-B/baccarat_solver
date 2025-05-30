<template>
  <div class="card bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-amber-800">🕵️ Advanced Dealer Tell Analysis</h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-amber-600">
          Reliability: {{ (currentReliability * 100).toFixed(1) }}%
        </span>
        <button
          @click="toggleMLMode"
          :class="[
            'px-3 py-1 rounded-md text-sm transition-colors',
            mlMode
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-600 text-white hover:bg-gray-700',
          ]"
        >
          {{ mlMode ? '🤖 ML Active' : '🤖 ML Off' }}
        </button>
      </div>
    </div>

    <!-- Dealer Tell Input Section -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">📝 Record Dealer Tell</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Tell Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tell Type</label>
          <select v-model="newTell.type" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Select Type</option>
            <option value="hesitation">⏱️ Hesitation</option>
            <option value="positioning">📍 Card Positioning</option>
            <option value="timing">⏰ Timing Pattern</option>
            <option value="facial_expression">😐 Facial Expression</option>
            <option value="hand_movement">✋ Hand Movement</option>
            <option value="card_handling">🃏 Card Handling</option>
          </select>
        </div>

        <!-- Estimated Card -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Card</label>
          <div class="flex space-x-1">
            <select
              v-model="newTell.estimatedRank"
              class="flex-1 px-2 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Rank</option>
              <option v-for="rank in ranks" :key="rank" :value="rank">{{ rank }}</option>
            </select>
            <select
              v-model="newTell.estimatedSuit"
              class="flex-1 px-2 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Suit</option>
              <option value="hearts">♥️</option>
              <option value="diamonds">♦️</option>
              <option value="clubs">♣️</option>
              <option value="spades">♠️</option>
            </select>
          </div>
        </div>

        <!-- Confidence & Reliability -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confidence</label>
          <input
            v-model.number="newTell.confidence"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="w-full"
          />
          <div class="text-xs text-gray-600 text-center">
            {{ (newTell.confidence * 100).toFixed(0) }}%
          </div>
        </div>

        <!-- Observer Reliability -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Observer Skill</label>
          <select
            v-model="newTell.reliability"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="low">🟡 Novice</option>
            <option value="medium">🟠 Experienced</option>
            <option value="high">🔴 Expert</option>
          </select>
        </div>
      </div>

      <!-- Notes -->
      <div class="mt-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Observer Notes</label>
        <textarea
          v-model="newTell.observerNotes"
          placeholder="Describe what you observed (e.g., 'Dealer paused 2 seconds before burning, looked at card corner')"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows="2"
        ></textarea>
      </div>

      <!-- Add Tell Button -->
      <div class="mt-3 flex space-x-2">
        <button
          @click="addDealerTell"
          :disabled="!canAddTell"
          class="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-gray-400"
        >
          Add Tell
        </button>
        <button
          @click="clearAllTells"
          v-if="dealerTells.length > 0"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Clear All
        </button>
      </div>
    </div>

    <!-- Team Play Section -->
    <div v-if="teamMode" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="font-medium text-blue-800 mb-3">👥 Team Play Coordination</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-blue-700 mb-1">Observer ID</label>
          <input
            v-model="teamObserver.id"
            placeholder="Observer name/ID"
            class="w-full px-3 py-2 border border-blue-300 rounded-md"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-blue-700 mb-1">Position</label>
          <select
            v-model="teamObserver.position"
            class="w-full px-3 py-2 border border-blue-300 rounded-md"
          >
            <option value="first_base">🎯 First Base</option>
            <option value="third_base">🎯 Third Base</option>
            <option value="behind_dealer">👀 Behind Dealer</option>
            <option value="side_angle">📐 Side Angle</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-blue-700 mb-1">Communication</label>
          <select
            v-model="teamObserver.communication"
            class="w-full px-3 py-2 border border-blue-300 rounded-md"
          >
            <option value="verbal">🗣️ Verbal</option>
            <option value="signal">👋 Hand Signals</option>
            <option value="digital">📱 Digital</option>
          </select>
        </div>
      </div>
      <div class="mt-2 text-xs text-blue-600">
        Team effectiveness: {{ (teamEffectiveness * 100).toFixed(1) }}% ({{
          activeObservers
        }}
        observers, {{ uniquePositions }} positions)
      </div>
    </div>

    <!-- Current Tells Display -->
    <div v-if="dealerTells.length > 0" class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">🔍 Recorded Tells ({{ dealerTells.length }})</h3>
      <div class="space-y-2 max-h-60 overflow-y-auto">
        <div
          v-for="(tell, index) in dealerTells"
          :key="index"
          class="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="font-medium"
                >{{ getTellIcon(tell.type) }} {{ getTellName(tell.type) }}</span
              >
              <span v-if="tell.estimatedRank" class="text-sm bg-gray-100 px-2 py-1 rounded">
                {{ tell.estimatedRank }}{{ getSuitSymbol(tell.estimatedSuit) }}
              </span>
              <span
                :class="getReliabilityClass(tell.reliability)"
                class="text-xs px-2 py-1 rounded"
              >
                {{ tell.reliability.toUpperCase() }}
              </span>
            </div>
            <div v-if="tell.observerNotes" class="text-xs text-gray-600 mt-1">
              "{{ tell.observerNotes }}"
            </div>
          </div>
          <div class="text-center px-3">
            <div class="text-sm font-bold text-amber-600">
              {{ (tell.confidence * 100).toFixed(0) }}%
            </div>
            <div class="text-xs text-gray-500">Confidence</div>
          </div>
          <button @click="removeTell(index)" class="text-red-600 hover:text-red-800 ml-2">✕</button>
        </div>
      </div>
    </div>

    <!-- ML Predictions (when ML mode is active) -->
    <div
      v-if="mlMode && mlPrediction"
      class="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg"
    >
      <h3 class="font-medium text-purple-800 mb-3">🤖 ML Burn Predictions</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="text-sm font-semibold text-purple-700 mb-2">Most Likely Ranks</h4>
          <div class="space-y-1">
            <div
              v-for="(pred, index) in mlPrediction.predictedRanks.slice(0, 5)"
              :key="index"
              class="flex justify-between text-sm"
            >
              <span>{{ pred.rank }}</span>
              <span class="font-medium">{{ (pred.probability * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-purple-700 mb-2">Model Info</h4>
          <div class="text-xs text-purple-600 space-y-1">
            <div>Confidence: {{ (mlPrediction.modelConfidence * 100).toFixed(1) }}%</div>
            <div>Training Data: {{ mlPrediction.trainingDataSize }} points</div>
            <div>Last Update: {{ formatTime(mlPrediction.lastModelUpdate) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analysis Results -->
    <div v-if="analysisResults" class="bg-white p-4 rounded-lg border">
      <h4 class="font-medium text-gray-800 mb-3">📊 Tell Analysis Results</h4>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div class="text-center">
          <div class="text-2xl font-bold text-amber-600">{{ analysisResults.totalTells }}</div>
          <div class="text-xs text-gray-600">Total Tells</div>
        </div>
        <div class="text-center">
          <div
            class="text-2xl font-bold"
            :class="analysisResults.edgeImpact >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ analysisResults.edgeImpact >= 0 ? '+' : ''
            }}{{ (analysisResults.edgeImpact * 100).toFixed(3) }}%
          </div>
          <div class="text-xs text-gray-600">Edge Impact</div>
        </div>
        <div class="text-center">
          <div
            class="text-2xl font-bold"
            :class="analysisResults.kellyAdjustment >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ (analysisResults.kellyAdjustment * 100).toFixed(1) }}%
          </div>
          <div class="text-xs text-gray-600">Kelly Adjustment</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {{ (analysisResults.reliability * 100).toFixed(1) }}%
          </div>
          <div class="text-xs text-gray-600">Overall Reliability</div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="mt-4 flex justify-between items-center">
      <div class="flex space-x-2">
        <button
          @click="toggleTeamMode"
          :class="[
            'px-3 py-1 rounded-md text-sm transition-colors',
            teamMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-600 text-white hover:bg-gray-700',
          ]"
        >
          {{ teamMode ? '👥 Team Mode' : '👤 Solo Mode' }}
        </button>
        <button
          @click="runAnalysis"
          :disabled="dealerTells.length === 0"
          class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm"
        >
          🔄 Analyze Tells
        </button>
      </div>

      <div class="text-xs text-gray-500">Professional dealer tell recognition system</div>
    </div>

    <!-- Professional Tips -->
    <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-800">💡 Professional Tell Recognition Tips</h4>
        <InfoToggleButton
          type="section"
          section="dealerTellAnalysis"
          subsection="professionalTips"
          variant="default"
          size="xs"
        />
      </div>
      <div
        v-if="visibilityStore.isVisible('dealerTellAnalysis', 'professionalTips')"
        class="text-xs text-gray-600 space-y-1"
      >
        <div>
          <strong>Timing Tells:</strong> Watch for hesitation patterns - dealers often pause longer
          on high-value cards
        </div>
        <div>
          <strong>Positioning Tells:</strong> Notice how dealers position cards before burning -
          angle and placement can indicate value
        </div>
        <div>
          <strong>Hand Movement:</strong> Subtle changes in grip or finger position may reveal card
          awareness
        </div>
        <div>
          <strong>Facial Expressions:</strong> Micro-expressions can indicate dealer reaction to
          card values
        </div>
        <div>
          <strong>Team Coordination:</strong> Multiple observers from different angles increase
          accuracy significantly
        </div>
        <div>
          <strong>ML Enhancement:</strong> Machine learning adapts to specific dealer patterns over
          time
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { useProfessionalBurnEstimation } from '../../composables/useProfessionalBurnEstimation';
import type { Rank, Suit } from '../../types/cards';
import InfoToggleButton from '@/components/common/button/InfoToggleButton.vue';

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();
const burnEstimation = useProfessionalBurnEstimation();

// Component state
const teamMode = ref(false);
const mlMode = ref(false);
const dealerTells = ref<any[]>([]);
const analysisResults = ref<any>(null);
const mlPrediction = ref<any>(null);

// New tell input
const newTell = ref({
  type: '',
  confidence: 0.5,
  estimatedRank: '',
  estimatedSuit: '',
  reliability: 'medium',
  observerNotes: '',
});

// Team observer data
const teamObserver = ref({
  id: '',
  position: 'first_base',
  communication: 'verbal',
});

const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Computed properties
const canAddTell = computed(() => {
  return newTell.value.type && newTell.value.confidence > 0;
});

const currentReliability = computed(() => {
  if (dealerTells.value.length === 0) {
    return 0;
  }
  return burnEstimation.dealerTellAnalysis.calculateDealerReliability(dealerTells.value);
});

const activeObservers = computed(() => {
  return new Set(dealerTells.value.map(t => t.observerId || 'default')).size;
});

const uniquePositions = computed(() => {
  return new Set(dealerTells.value.map(t => t.position || 'unknown')).size;
});

const teamEffectiveness = computed(() => {
  if (!teamMode.value || dealerTells.value.length < 2) {
    return 0;
  }

  const teamData = [
    {
      observerId: teamObserver.value.id || 'default',
      position: teamObserver.value.position,
      burnObservations: dealerTells.value,
      confidence: currentReliability.value,
      timestamp: Date.now(),
      communicationMethod: teamObserver.value.communication,
    },
  ];

  return burnEstimation.teamPlayCoordination.calculateTeamEffectiveness(teamData);
});

// Methods
const addDealerTell = () => {
  if (!canAddTell.value) {
    return;
  }

  const tell = {
    type: newTell.value.type,
    confidence: newTell.value.confidence,
    timestamp: Date.now(),
    estimatedRank: newTell.value.estimatedRank || undefined,
    estimatedSuit: newTell.value.estimatedSuit || undefined,
    observerNotes: newTell.value.observerNotes || undefined,
    reliability: newTell.value.reliability,
    observerId: teamMode.value ? teamObserver.value.id : 'default',
    position: teamMode.value ? teamObserver.value.position : 'unknown',
  };

  dealerTells.value.push(tell);

  // Reset form
  newTell.value = {
    type: '',
    confidence: 0.5,
    estimatedRank: '',
    estimatedSuit: '',
    reliability: 'medium',
    observerNotes: '',
  };

  // Auto-run analysis if we have enough tells
  if (dealerTells.value.length >= 2) {
    runAnalysis();
  }
};

const removeTell = (index: number) => {
  dealerTells.value.splice(index, 1);
  if (dealerTells.value.length > 0) {
    runAnalysis();
  } else {
    analysisResults.value = null;
  }
};

const clearAllTells = () => {
  dealerTells.value = [];
  analysisResults.value = null;
  mlPrediction.value = null;
};

const runAnalysis = () => {
  if (dealerTells.value.length === 0) {
    return;
  }

  // Run dealer tell analysis
  const tellEstimates = burnEstimation.dealerTellAnalysis.analyzeDealerTells(dealerTells.value);
  const reliability = burnEstimation.dealerTellAnalysis.calculateDealerReliability(
    dealerTells.value
  );

  // Calculate impacts
  const edgeImpact = tellEstimates.reduce((sum, est) => {
    const cardValue = store.getCardValue(est.rank);
    return sum + (cardValue === 0 ? 0.001 : -0.001) * est.probability;
  }, 0);

  const kellyAdjustment = edgeImpact * 10; // Scale for Kelly

  analysisResults.value = {
    totalTells: dealerTells.value.length,
    edgeImpact,
    kellyAdjustment,
    reliability,
    estimates: tellEstimates,
  };

  // Run ML prediction if enabled
  if (mlMode.value && store.history.hands.length > 5) {
    mlPrediction.value = burnEstimation.mlIntegration.predictBurnCards(
      store.history.hands,
      dealerTells.value,
      store.shoe.remainingCards
    );
  }

  // Apply to store if significant impact
  if (Math.abs(edgeImpact) > 0.001) {
    store.applyBurnAnalysisToEdges({
      weightedEdgeImpact: edgeImpact,
      uncertaintyLevel: 1 - reliability,
      kellyMultiplier: 1 + kellyAdjustment,
      monteCarloAdjustment: 1 + edgeImpact * 5,
    });
  }
};

const toggleTeamMode = () => {
  teamMode.value = !teamMode.value;
};

const toggleMLMode = () => {
  mlMode.value = !mlMode.value;
  if (mlMode.value && dealerTells.value.length > 0) {
    runAnalysis();
  } else {
    mlPrediction.value = null;
  }
};

// Utility methods
const getTellIcon = (type: string): string => {
  const icons = {
    hesitation: '⏱️',
    positioning: '📍',
    timing: '⏰',
    facial_expression: '😐',
    hand_movement: '✋',
    card_handling: '🃏',
  };
  return icons[type as keyof typeof icons] || '👁️';
};

const getTellName = (type: string): string => {
  const names = {
    hesitation: 'Hesitation',
    positioning: 'Positioning',
    timing: 'Timing',
    facial_expression: 'Facial Expression',
    hand_movement: 'Hand Movement',
    card_handling: 'Card Handling',
  };
  return names[type as keyof typeof names] || type;
};

const getSuitSymbol = (suit?: string): string => {
  if (!suit) {
    return '';
  }
  const symbols = {
    hearts: '♥️',
    diamonds: '♦️',
    clubs: '♣️',
    spades: '♠️',
  };
  return symbols[suit as keyof typeof symbols] || '';
};

const getReliabilityClass = (reliability: string): string => {
  const classes = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
  };
  return classes[reliability as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

onMounted(() => {
  // Initialize with any existing dealer behavior data
  if (store.history.hands.length > 0) {
    // Could load previous tells from localStorage
    const savedTells = localStorage.getItem('dealerTells');
    if (savedTells) {
      try {
        dealerTells.value = JSON.parse(savedTells);
        if (dealerTells.value.length > 0) {
          runAnalysis();
        }
      } catch (e) {
        console.warn('Could not load saved dealer tells');
      }
    }
  }
});

// Save tells to localStorage when they change
const saveTells = () => {
  localStorage.setItem('dealerTells', JSON.stringify(dealerTells.value));
};

// Watch for changes and save
import { watch } from 'vue';
watch(dealerTells, saveTells, { deep: true });
</script>
