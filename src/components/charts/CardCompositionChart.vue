<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Shoe Composition</h2>
    <!-- Debug info -->
    <div class="text-xs text-gray-500 mb-2">
      Total cards: {{ cardCounts.reduce((sum, count) => sum + count, 0) }} | Chart data:
      {{ cardCounts.join(', ') }}
    </div>

    <!-- Chart Overview -->
    <div class="chart-container mb-6">
      <div v-if="cardCounts.some(count => count > 0)" class="chart-wrapper">
        <Bar :data="chartData" :options="chartOptions" :height="200" />
      </div>
      <div v-else class="chart-placeholder">
        <p class="text-gray-500 text-center py-8">
          No cards in shoe. Click "New Shoe" to initialize.
        </p>
      </div>
    </div>

    <!-- Cards Aligned Under Graph Columns -->
    <div class="cards-grid-container">
      <!-- Grid matching chart columns: 0-Value, Ace, 2, 3, 4, 5, 6, 7, 8, 9 -->
      <div class="chart-aligned-grid">
        <!-- 0-Value Cards Column -->
        <div class="chart-column">
          <div class="column-header">
            <h3 class="column-title">0-Value</h3>
            <div class="column-underline"></div>
          </div>
          <div class="cards-in-column">
            <div v-for="rank in zeroValueRanks" :key="rank" class="card-item">
              <PlayingCard
                :rank="rank"
                suit="spades"
                size="small"
                clickable
                show-count
                :count="getCardCount(rank)"
                :disabled="getCardCount(rank) === 0"
                @click="addCardToHand"
              />
              <input
                type="number"
                :value="getCardCount(rank)"
                @input="updateCardCount(rank, $event)"
                min="0"
                :max="store.settings.numberOfDecks * 4"
                class="card-input-small"
              />
            </div>
          </div>
        </div>

        <!-- Ace Column -->
        <div class="chart-column">
          <div class="column-header">
            <h3 class="column-title">Ace</h3>
            <div class="column-underline"></div>
          </div>
          <div class="cards-in-column">
            <div class="card-item">
              <PlayingCard
                rank="A"
                suit="spades"
                size="small"
                clickable
                show-count
                :count="getCardCount('A')"
                :disabled="getCardCount('A') === 0"
                @click="addCardToHand"
              />
              <input
                type="number"
                :value="getCardCount('A')"
                @input="updateCardCount('A', $event)"
                min="0"
                :max="store.settings.numberOfDecks * 4"
                class="card-input-small"
              />
            </div>
          </div>
        </div>

        <!-- Number Cards Columns (2-9) -->
        <div v-for="rank in numberRanks" :key="rank" class="chart-column">
          <div class="column-header">
            <h3 class="column-title">{{ rank }}</h3>
            <div class="column-underline"></div>
          </div>
          <div class="cards-in-column">
            <div class="card-item">
              <PlayingCard
                :rank="rank"
                suit="spades"
                size="small"
                clickable
                show-count
                :count="getCardCount(rank)"
                :disabled="getCardCount(rank) === 0"
                @click="addCardToHand"
              />
              <input
                type="number"
                :value="getCardCount(rank)"
                @input="updateCardCount(rank, $event)"
                min="0"
                :max="store.settings.numberOfDecks * 4"
                class="card-input-small"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Category Labels with Underlines -->
      <div class="category-labels">
        <div class="category-section values">
          <span class="category-label">Values</span>
          <div class="category-underline values-underline"></div>
        </div>
        <div class="category-section faces">
          <span class="category-label">Faces</span>
          <div class="category-underline faces-underline"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useBaccaratStore } from '@/stores/baccaratStore';
import type { Card, Rank, Suit, CardValue } from '@/types/cards';
import PlayingCard from '@/components/cards/PlayingCard.vue';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const store = useBaccaratStore();

// Card rank arrays
const zeroValueRanks = ['10', 'J', 'Q', 'K'];
const numberRanks = ['2', '3', '4', '5', '6', '7', '8', '9'];
const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

// Get card counts organized by baccarat value categories
const cardCounts = computed(() => {
  const counts = [];
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  // Helper function to count cards by rank across all suits
  const countByRank = (rank: string): number => {
    return suits.reduce((sum, suit) => {
      return sum + (store.shoe.remainingCards.get(`${rank}-${suit}`) || 0);
    }, 0);
  };

  // 0-value cards (10, J, Q, K - all worth 0 in baccarat)
  const zeroValueCards = ['10', 'J', 'Q', 'K'].reduce((sum, rank) => {
    return sum + countByRank(rank);
  }, 0);
  counts.push(zeroValueCards);

  // Ace (value 1)
  counts.push(countByRank('A'));

  // Number cards 2-9 (face value in baccarat)
  for (let i = 2; i <= 9; i++) {
    counts.push(countByRank(i.toString()));
  }

  return counts;
});

const chartData = computed(() => {
  const data = cardCounts.value;
  const hasData = data.some(count => count > 0);

  return {
    labels: ['0-Value', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9'],
    datasets: [
      {
        label: 'Remaining Cards',
        data: hasData ? data : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: data.map(count =>
          count <= 2 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.6)'
        ),
        borderColor: data.map(count =>
          count <= 2 ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: {
          dataset: { label?: string };
          parsed: { y: number };
          dataIndex: number;
        }) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          const index = context.dataIndex;
          // 0-value cards have 4 ranks (10,J,Q,K), others have 1 rank
          const maxCards =
            index === 0 ? store.settings.numberOfDecks * 16 : store.settings.numberOfDecks * 4;
          const percentage = ((value / maxCards) * 100).toFixed(1);
          return `${label}: ${value} cards (${percentage}%)`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: store.settings.numberOfDecks * 16, // Max for 0-value cards (4 ranks)
      ticks: {
        stepSize: 8,
      },
      title: {
        display: false,
      },
    },
    x: {
      title: {
        display: false,
      },
    },
  },
  animation: {
    duration: 300,
  },
}));

// Get individual card count by rank
function getCardCount(rank: string): number {
  return suits.reduce((sum, suit) => {
    return sum + (store.shoe.remainingCards.get(`${rank}-${suit}`) || 0);
  }, 0);
}

// Update card count manually
function updateCardCount(rank: string, event: Event) {
  const target = event.target as HTMLInputElement;
  const newCount = parseInt(target.value) || 0;
  const currentTotal = getCardCount(rank);
  const difference = newCount - currentTotal;

  if (difference !== 0) {
    // Distribute the change across all suits equally
    const changePerSuit = Math.floor(difference / 4);
    const remainder = difference % 4;

    suits.forEach((suit, index) => {
      const currentSuitCount = store.shoe.remainingCards.get(`${rank}-${suit}`) || 0;
      const suitChange = changePerSuit + (index < remainder ? 1 : 0);
      const newSuitCount = Math.max(0, currentSuitCount + suitChange);
      store.shoe.remainingCards.set(`${rank}-${suit}`, newSuitCount);
    });
  }
}

// Add card to current hand
function addCardToHand(cardData: { rank: string; suit: string }) {
  const rank = cardData.rank;
  // Find the first available suit for this rank
  const availableSuit = suits.find(suit => {
    const count = store.shoe.remainingCards.get(`${rank}-${suit}`) || 0;
    return count > 0;
  });

  if (!availableSuit) {
    alert(`No ${rank} cards remaining in the shoe!`);
    return;
  }

  // Create the card
  const card: Card = {
    rank: rank as Rank,
    suit: availableSuit,
    value: getCardValue(rank),
  };

  // Determine which hand to add to (alternate between player and banker)
  const playerCards = store.shoe.currentHand.player.length;
  const bankerCards = store.shoe.currentHand.banker.length;

  if (playerCards <= bankerCards) {
    store.shoe.currentHand.player.push(card);
  } else {
    store.shoe.currentHand.banker.push(card);
  }

  // Decrease the count in the shoe
  const currentCount = store.shoe.remainingCards.get(`${rank}-${availableSuit}`) || 0;
  store.shoe.remainingCards.set(`${rank}-${availableSuit}`, Math.max(0, currentCount - 1));

  // Update cards dealt counter
  store.shoe.cardsDealt++;
}

// Get card value for baccarat
function getCardValue(rank: string): CardValue {
  if (['10', 'J', 'Q', 'K'].includes(rank)) return 0;
  if (rank === 'A') return 1;
  return parseInt(rank) as CardValue;
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 200px;
  width: 100%;
  margin-bottom: 0;
}

.cards-grid-container {
  @apply mt-2;
}

.chart-aligned-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0;
  width: 100%;
  margin-bottom: 1.5rem;
  padding: 0 20px; /* Match chart padding */
}

.chart-column {
  @apply flex flex-col items-center justify-start;
  min-height: 120px;
}

.column-header {
  @apply mb-2 text-center w-full;
}

.column-title {
  @apply text-xs font-semibold text-gray-700 mb-1;
}

.column-underline {
  @apply w-full h-0.5 bg-gray-300 rounded;
}

.cards-in-column {
  @apply flex flex-col items-center space-y-1;
  width: 100%;
}

.card-item {
  @apply flex flex-col items-center space-y-1;
  width: 100%;
}

.card-input-small {
  width: 90%;
  max-width: 40px;
  @apply px-1 py-0.5 text-center border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500;
}

/* Category Labels */
.category-labels {
  @apply relative mt-4;
  padding: 0 20px; /* Match chart and grid padding */
}

.category-section {
  @apply absolute;
}

.category-section.values {
  left: 20px;
  width: calc(20% - 20px); /* Covers 0-Value and Ace columns, accounting for padding */
}

.category-section.faces {
  left: calc(20% + 20px);
  width: calc(80% - 40px); /* Covers number cards 2-9 columns, accounting for padding */
}

.category-label {
  @apply block text-center text-lg font-bold text-gray-800 mb-2;
}

.category-underline {
  @apply h-1 rounded;
}

.values-underline {
  @apply bg-blue-500;
}

.faces-underline {
  @apply bg-green-500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-aligned-grid {
    grid-template-columns: repeat(5, 1fr);
    padding: 0 10px;
  }

  .column-title {
    @apply text-xs;
  }

  .card-input-small {
    max-width: 30px;
    @apply text-xs;
  }

  .category-labels {
    padding: 0 10px;
  }

  .category-section.values {
    left: 10px;
    width: calc(40% - 10px);
  }

  .category-section.faces {
    left: calc(40% + 10px);
    width: calc(60% - 20px);
  }
}
</style>
