<template>
  <div class="card bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-orange-800">🔥 Professional Burn Card Estimation</h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-orange-600">Confidence:</span>
        <span class="font-bold text-orange-800"
          >{{ (estimationConfidence * 100).toFixed(1) }}%</span
        >
      </div>
    </div>

    <!-- Casino Burn Scenarios -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">🎰 Common Casino Burn Scenarios</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          @click="applyBurnScenario('conservative')"
          class="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div class="font-medium text-blue-800">Conservative Estimate</div>
          <div class="text-xs text-blue-600">3-5 cards, balanced distribution</div>
        </button>
        <button
          @click="applyBurnScenario('aggressive')"
          class="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <div class="font-medium text-red-800">Aggressive Estimate</div>
          <div class="text-xs text-red-600">6-8 cards, high-value bias</div>
        </button>
        <button
          @click="applyBurnScenario('random')"
          class="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="font-medium text-gray-800">Random Distribution</div>
          <div class="text-xs text-gray-600">Statistical average</div>
        </button>
      </div>
    </div>

    <!-- Manual Burn Card Input -->
    <div class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">🎯 Suspected Burn Cards (Based on Observation)</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card Input Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Add Suspected Burned Card</label
          >
          <div class="flex space-x-2">
            <select
              v-model="selectedRank"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Rank</option>
              <option v-for="rank in ranks" :key="rank" :value="rank">{{ rank }}</option>
            </select>
            <select
              v-model="selectedSuit"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Suit</option>
              <option value="hearts">♥️ Hearts</option>
              <option value="diamonds">♦️ Diamonds</option>
              <option value="clubs">♣️ Clubs</option>
              <option value="spades">♠️ Spades</option>
            </select>
            <button
              @click="addSuspectedBurnCard()"
              :disabled="!selectedRank || !selectedSuit"
              class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400"
            >
              Add
            </button>
          </div>
          <div class="mt-2 text-xs text-gray-600">
            💡 Based on dealer behavior, timing, or partial glimpses
          </div>
        </div>

        <!-- Burn Count Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estimated Total Burned</label>
          <div class="flex space-x-2">
            <input
              v-model.number="estimatedBurnCount"
              type="number"
              min="0"
              max="20"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Total cards burned"
            />
            <button
              @click="generateRandomBurns()"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Fill Random
            </button>
          </div>
          <div class="mt-2 text-xs text-gray-600">
            🎲 System will estimate remaining burned cards randomly
          </div>
        </div>
      </div>
    </div>

    <!-- Current Suspected Burns -->
    <div v-if="suspectedBurns.length > 0" class="mb-6">
      <h3 class="font-medium text-gray-700 mb-3">🔍 Current Burn Estimates</h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(burn, index) in suspectedBurns"
          :key="index"
          class="flex items-center space-x-2 px-3 py-2 bg-orange-100 border border-orange-300 rounded-lg"
        >
          <span class="font-medium">{{ burn.rank }}{{ getSuitSymbol(burn.suit) }}</span>
          <span class="text-xs text-orange-600">({{ burn.confidence }}% sure)</span>
          <button @click="removeSuspectedBurn(index)" class="text-red-600 hover:text-red-800">
            ✕
          </button>
        </div>
      </div>
      <div class="mt-2 flex space-x-4">
        <button
          @click="applyEstimatedBurns()"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Apply to Analysis
        </button>
        <button
          @click="clearEstimatedBurns()"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear All
        </button>
      </div>
    </div>

    <!-- Professional Analysis -->
    <div class="bg-white p-4 rounded-lg border">
      <h4 class="font-medium text-gray-800 mb-3">📊 Professional Burn Analysis</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div class="font-medium text-gray-700">Edge Impact</div>
          <div :class="edgeImpact >= 0 ? 'text-green-600' : 'text-red-600'" class="font-bold">
            {{ edgeImpact >= 0 ? '+' : '' }}{{ (edgeImpact * 100).toFixed(3) }}%
          </div>
        </div>
        <div>
          <div class="font-medium text-gray-700">Pair Probability Change</div>
          <div :class="pairImpact >= 0 ? 'text-green-600' : 'text-red-600'" class="font-bold">
            {{ pairImpact >= 0 ? '+' : '' }}{{ (pairImpact * 100).toFixed(2) }}%
          </div>
        </div>
        <div>
          <div class="font-medium text-gray-700">Kelly Adjustment</div>
          <div :class="kellyAdjustment >= 0 ? 'text-green-600' : 'text-red-600'" class="font-bold">
            {{ kellyAdjustment >= 0 ? '+' : '' }}{{ (kellyAdjustment * 100).toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Professional Tips -->
    <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-yellow-800">
          💡 Professional Burn Card Intelligence
        </h4>
        <InfoToggleButton
          type="section"
          section="burnCardEstimator"
          subsection="burnIntelligence"
          variant="warning"
          size="xs"
        />
      </div>
      <div
        v-if="visibilityStore.isVisible('burnCardEstimator', 'burnIntelligence')"
        class="text-xs text-yellow-700 space-y-1"
      >
        <div>
          <strong>Dealer Tells:</strong> Watch for hesitation, card positioning, or timing patterns
          during burns
        </div>
        <div>
          <strong>Partial Glimpses:</strong> Sometimes corner or edge of burn cards are briefly
          visible
        </div>
        <div>
          <strong>Statistical Estimation:</strong> Use known shoe composition to estimate likely
          burned cards
        </div>
        <div>
          <strong>Team Play:</strong> Multiple observers can increase burn card intelligence
          accuracy
        </div>
        <div>
          <strong>End-of-Shoe Value:</strong> Burn estimates become exponentially more valuable near
          shoe end
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useVisibilityStore } from '@/stores/visibilityStore';
import type { Card, Rank, Suit } from '@/types/cards';
import InfoToggleButton from '@/components/common/button/InfoToggleButton.vue';

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();

// Component state
const selectedRank = ref<Rank | ''>('');
const selectedSuit = ref<Suit | ''>('');
const estimatedBurnCount = ref(5);

interface SuspectedBurn {
  rank: Rank;
  suit: Suit;
  confidence: number; // 0-100
  method: 'observed' | 'estimated' | 'statistical';
}

const suspectedBurns = ref<SuspectedBurn[]>([]);

const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Computed properties
const estimationConfidence = computed(() => {
  if (suspectedBurns.value.length === 0) {
    return 0;
  }
  const avgConfidence =
    suspectedBurns.value.reduce((sum, burn) => sum + burn.confidence, 0) /
    suspectedBurns.value.length;
  return avgConfidence / 100;
});

const edgeImpact = computed(() => {
  // Calculate how suspected burns affect edge calculations
  let impact = 0;
  suspectedBurns.value.forEach(burn => {
    const cardValue = store.getCardValue(burn.rank);
    // High cards (0 value) slightly favor banker, low cards favor player
    if (cardValue === 0) {
      impact += 0.001; // Slight banker advantage
    } else if (cardValue <= 3) {
      impact -= 0.001; // Slight player advantage
    }
  });
  return impact;
});

const pairImpact = computed(() => {
  // Calculate how suspected burns affect pair probabilities
  const rankCounts = new Map<Rank, number>();
  suspectedBurns.value.forEach(burn => {
    rankCounts.set(burn.rank, (rankCounts.get(burn.rank) || 0) + 1);
  });

  let impact = 0;
  rankCounts.forEach((count, rank) => {
    // Each burned card of a rank reduces pair probability for that rank
    let rankSpecificImpact = count * 0.005; // Base impact

    // Rank-specific impact calculations
    if (rank === 'A') {
      rankSpecificImpact = count * 0.007; // Aces have higher pair impact
    } else if (['10', 'J', 'Q', 'K'].includes(rank)) {
      rankSpecificImpact = count * 0.006; // Face cards have moderate impact
    } else if (['2', '3', '4', '5'].includes(rank)) {
      rankSpecificImpact = count * 0.004; // Low cards have lower impact
    }

    impact -= rankSpecificImpact;
  });

  return impact;
});

const kellyAdjustment = computed(() => {
  // Suggest Kelly percentage adjustment based on burn estimates
  return edgeImpact.value * 10; // Scale edge impact for Kelly
});

// Methods
const getSuitSymbol = (suit: Suit): string => {
  const symbols = {
    hearts: '♥️',
    diamonds: '♦️',
    clubs: '♣️',
    spades: '♠️',
  };
  return symbols[suit];
};

const addSuspectedBurnCard = (): void => {
  if (!selectedRank.value || !selectedSuit.value) {
    return;
  }

  // Check if this card is already suspected
  const exists = suspectedBurns.value.find(
    burn => burn.rank === selectedRank.value && burn.suit === selectedSuit.value
  );

  if (exists) {
    alert('This card is already in your burn estimates!');
    return;
  }

  suspectedBurns.value.push({
    rank: selectedRank.value as Rank,
    suit: selectedSuit.value as Suit,
    confidence: 75, // Default confidence for manually added cards
    method: 'observed',
  });

  selectedRank.value = '';
  selectedSuit.value = '';
};

const removeSuspectedBurn = (index: number): void => {
  suspectedBurns.value.splice(index, 1);
};

const clearEstimatedBurns = (): void => {
  suspectedBurns.value = [];
};

const applyBurnScenario = (scenario: 'conservative' | 'aggressive' | 'random'): void => {
  clearEstimatedBurns();

  const scenarios = {
    conservative: {
      count: 4,
      highCardBias: 0.3, // 30% chance of high cards
      confidence: 60,
    },
    aggressive: {
      count: 7,
      highCardBias: 0.6, // 60% chance of high cards
      confidence: 45,
    },
    random: {
      count: 5,
      highCardBias: 0.5, // 50% chance (random)
      confidence: 50,
    },
  };

  const config = scenarios[scenario];
  estimatedBurnCount.value = config.count;

  // Generate estimated burns based on scenario
  for (let i = 0; i < config.count; i++) {
    const isHighCard = Math.random() < config.highCardBias;
    const rank = isHighCard
      ? (['10', 'J', 'Q', 'K'][Math.floor(Math.random() * 4)] as Rank)
      : (['A', '2', '3', '4', '5', '6', '7', '8', '9'][Math.floor(Math.random() * 9)] as Rank);

    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const suit = suits[Math.floor(Math.random() * 4)];

    // Check if this combination already exists
    const exists = suspectedBurns.value.find(burn => burn.rank === rank && burn.suit === suit);
    if (!exists) {
      suspectedBurns.value.push({
        rank,
        suit,
        confidence: config.confidence + Math.random() * 20 - 10, // ±10% variance
        method: 'statistical',
      });
    }
  }
};

const generateRandomBurns = (): void => {
  const remaining = estimatedBurnCount.value - suspectedBurns.value.length;
  if (remaining <= 0) {
    return;
  }

  for (let i = 0; i < remaining; i++) {
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const suit = suits[Math.floor(Math.random() * 4)];

    // Check if this combination already exists
    const exists = suspectedBurns.value.find(burn => burn.rank === rank && burn.suit === suit);
    if (!exists) {
      suspectedBurns.value.push({
        rank,
        suit,
        confidence: 30 + Math.random() * 40, // 30-70% confidence for random
        method: 'estimated',
      });
    }
  }
};

const applyEstimatedBurns = (): void => {
  // Apply the suspected burns to the store's analysis
  suspectedBurns.value.forEach(burn => {
    const card: Card = {
      rank: burn.rank,
      suit: burn.suit,
      value: store.getCardValue(burn.rank),
      isBurned: true,
      timestamp: Date.now(),
      handNumber: store.history.currentHandNumber,
    };

    // Apply with confidence weighting using the new store method
    store.applySuspectedBurn(card, burn.confidence);
  });

  alert(
    `Applied ${suspectedBurns.value.length} suspected burn cards to analysis with ${(estimationConfidence.value * 100).toFixed(1)}% confidence.`
  );
};
</script>
