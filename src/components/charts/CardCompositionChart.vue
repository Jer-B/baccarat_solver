<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Shoe Composition</h2>

    <!-- Shoe Controls -->
    <div class="bg-gray-50 p-4 rounded-lg mb-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <!-- Game Status -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-gray-700">Game Status</h3>
          <div class="text-sm text-gray-600">
            <div>Remaining: {{ store.totalCardsRemaining }} cards</div>
            <div
              class="flex items-center space-x-1"
              title="Penetration shows how much of the shoe has been dealt. Higher penetration = more accurate card counting and edge calculations."
            >
              <span>Penetration: {{ (store.currentPenetration * 100).toFixed(1) }}%</span>
              <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <!-- Cut Card Warning -->
            <div
              v-if="store.shouldShuffleWarning"
              class="flex items-center space-x-1 mt-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-yellow-800"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="text-xs font-medium">CUT CARD REACHED - SHUFFLE REQUIRED</span>
            </div>
          </div>
        </div>

        <!-- Deck Settings -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-gray-700">Deck Settings</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-600">Decks:</label>
              <select
                v-model="store.settings.numberOfDecks"
                class="text-gray-900 rounded px-3 py-1 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-16"
              >
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
                <option :value="5">5</option>
                <option :value="6">6</option>
                <option :value="7">7</option>
                <option :value="8">8</option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <label
                class="text-sm text-gray-600"
                title="Cut card position: Number of cards from bottom of shoe when shuffle is required. Lower = more penetration (better for counting), Higher = less penetration (more secure for casino)"
              >
                Cut:
              </label>
              <input
                v-model.number="store.settings.cutCardPosition"
                type="number"
                min="10"
                max="104"
                class="text-gray-900 rounded px-2 py-1 text-sm w-16 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Cards remaining when shuffle warning appears"
              />
              <span class="text-xs text-gray-500">cards</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-gray-700">Actions</h3>
          <div class="space-y-2">
            <button
              @click="store.initializeShoe()"
              class="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              title="Initialize a new shoe with fresh cards. Can be done at any time."
            >
              New Shoe
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cut Card Information -->
    <div class="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-blue-800">🃏 Cut Card System</h4>
        <InfoToggleButton
          type="section"
          section="shoeComposition"
          subsection="cutCardInfo"
          variant="primary"
          size="xs"
        />
      </div>
      <div
        v-if="visibilityStore.isVisible('shoeComposition', 'cutCardInfo')"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700"
      >
        <div>
          <div class="font-medium mb-1">How It Works:</div>
          <div>• Cut card placed {{ store.settings.cutCardPosition }} cards from bottom</div>
          <div>• When reached → finish current hand, then shuffle</div>
          <div>• Prevents deep penetration for security</div>
        </div>
        <div>
          <div class="font-medium mb-1">Settings Guide:</div>
          <div>• <strong>Lower (10-30):</strong> More penetration, better for counting</div>
          <div>• <strong>Higher (50-104):</strong> Less penetration, more secure</div>
          <div>• <strong>Casino typical:</strong> 52-78 cards (1-1.5 decks)</div>
        </div>
      </div>
    </div>

    <!-- Debug info -->
    <div class="text-xs text-gray-500 mb-2">
      Total cards: {{ cardCounts.reduce((sum, count) => sum + count, 0) }} | Chart data:
      {{ cardCounts.join(', ') }} | Store total: {{ store.totalCardsRemaining }} | Shoe size:
      {{ store.shoe.remainingCards.size }}
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
            <div class="card-item">
              <!-- Overlapped Cards Display -->
              <div class="overlapped-cards-container">
                <PlayingCard
                  v-for="(rank, index) in zeroValueRanks"
                  :key="rank"
                  :rank="rank"
                  suit="spades"
                  size="small"
                  clickable
                  :disabled="
                    getTotalZeroValueCount() === 0 ||
                    !store.canAddMoreCards ||
                    !currentRoundBet.hasBet
                  "
                  :style="{
                    position: 'absolute',
                    left: `${index * 8}px`,
                    zIndex: zeroValueRanks.length - index,
                  }"
                  @click="addZeroValueCardToHand"
                />
                <!-- Count Badge for overlapped cards -->
                <div class="overlapped-count-badge">
                  {{ getTotalZeroValueCount() }}
                </div>
              </div>
              <!-- Single Combined Count -->
              <input
                type="number"
                :value="getTotalZeroValueCount()"
                @input="updateZeroValueCount($event)"
                min="0"
                :max="store.settings.numberOfDecks * 16"
                class="card-input-small mt-5"
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
                :disabled="
                  getCardCount('A') === 0 || !store.canAddMoreCards || !currentRoundBet.hasBet
                "
                @click="addCardToHand"
              />
              <input
                type="number"
                :value="getCardCount('A')"
                @input="updateCardCount('A', $event)"
                min="0"
                :max="store.settings.numberOfDecks * 4"
                class="card-input-small mt-5"
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
                :disabled="
                  getCardCount(rank) === 0 || !store.canAddMoreCards || !currentRoundBet.hasBet
                "
                @click="addCardToHand"
              />
              <input
                type="number"
                :value="getCardCount(rank)"
                @input="updateCardCount(rank, $event)"
                min="0"
                :max="store.settings.numberOfDecks * 4"
                class="card-input-small mt-5"
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
import { computed, inject } from 'vue';
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
import { useVisibilityStore } from '@/stores/visibilityStore';
import type { Card, Rank, Suit, CardValue } from '@/types/cards';
import PlayingCard from '@/components/cards/PlayingCard.vue';
import InfoToggleButton from '@/components/common/button/InfoToggleButton.vue';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();

// Inject the current round bet to check if bet is placed
const currentRoundBet = inject('currentRoundBet') as { value: string } | undefined;

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

// Get total count for all zero-value cards
function getTotalZeroValueCount(): number {
  return zeroValueRanks.reduce((sum, rank) => {
    return sum + getCardCount(rank);
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

// Update zero-value cards count (distribute across all 4 ranks)
function updateZeroValueCount(event: Event) {
  const target = event.target as HTMLInputElement;
  const newTotalCount = parseInt(target.value) || 0;
  const currentTotal = getTotalZeroValueCount();
  const difference = newTotalCount - currentTotal;

  if (difference !== 0) {
    // Distribute the change across all zero-value ranks equally
    const changePerRank = Math.floor(difference / 4);
    const remainder = difference % 4;

    zeroValueRanks.forEach((rank, rankIndex) => {
      const rankChange = changePerRank + (rankIndex < remainder ? 1 : 0);
      const changePerSuit = Math.floor(rankChange / 4);
      const suitRemainder = rankChange % 4;

      suits.forEach((suit, suitIndex) => {
        const currentSuitCount = store.shoe.remainingCards.get(`${rank}-${suit}`) || 0;
        const suitChange = changePerSuit + (suitIndex < suitRemainder ? 1 : 0);
        const newSuitCount = Math.max(0, currentSuitCount + suitChange);
        store.shoe.remainingCards.set(`${rank}-${suit}`, newSuitCount);
      });
    });
  }
}

// Add card to current hand
function addCardToHand(cardData: { rank: string; suit: string }) {
  // Check if there's a bet placed (prevent exploit)
  if (!currentRoundBet.hasBet) {
    alert('Please place a bet before dealing cards!');
    return;
  }

  // Check if we can add more cards (max 6 total in baccarat)
  if (!store.canAddMoreCards) {
    alert('Maximum 6 cards allowed in a baccarat hand (3 per side)!');
    return;
  }

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

// Add zero-value card to current hand (picks first available)
function addZeroValueCardToHand() {
  // Check if there's a bet placed (prevent exploit)
  if (!currentRoundBet.hasBet) {
    alert('Please place a bet before dealing cards!');
    return;
  }

  // Check if we can add more cards (max 6 total in baccarat)
  if (!store.canAddMoreCards) {
    alert('Maximum 6 cards allowed in a baccarat hand (3 per side)!');
    return;
  }

  // Find the first available zero-value card
  for (const rank of zeroValueRanks) {
    const availableSuit = suits.find(suit => {
      const count = store.shoe.remainingCards.get(`${rank}-${suit}`) || 0;
      return count > 0;
    });

    if (availableSuit) {
      addCardToHand({ rank, suit: availableSuit });
      return;
    }
  }

  alert('No zero-value cards remaining in the shoe!');
}

// Get card value for baccarat
function getCardValue(rank: string): CardValue {
  if (['10', 'J', 'Q', 'K'].includes(rank)) {
    return 0;
  }
  if (rank === 'A') {
    return 1;
  }
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
  padding: 0 20px; /* Reduced padding for better distribution */
}

.chart-column {
  @apply flex flex-col items-center justify-start;
  min-height: 120px;
}

/* Specific positioning adjustments for better alignment */
.chart-column:nth-child(1) {
  /* 0-Value cards - move left */
  transform: translateX(-10px);
}

.chart-column:nth-child(2) {
  /* Ace - keep centered */
  transform: translateX(0);
}

.chart-column:nth-child(n + 3) {
  /* Cards 2-9 - move right */
  transform: translateX(10px);
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
  @apply flex flex-col items-center space-y-2;
  width: 100%;
}

.card-item {
  @apply flex flex-col items-center space-y-1;
  width: 100%;
}

.overlapped-cards-container {
  position: relative;
  width: 72px; /* Base card width + 3 * 8px offset */
  height: 48px; /* Small card height */
  margin-bottom: 20px; /* Extra space for input field */
}

.overlapped-count-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 100;
}

.card-input-small {
  width: 90%;
  max-width: 50px;
  @apply px-1 py-1 text-center border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500;
}

/* Category Labels */
.category-labels {
  @apply relative;
  margin-top: -20px; /* Move labels up closer to cards */
  padding: 0 20px; /* Match chart and grid padding */
  height: 60px; /* Fixed height to contain labels */
}

.category-section {
  @apply absolute top-0;
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
    padding: 0 20px;
  }

  .column-title {
    @apply text-xs;
  }

  .card-input-small {
    max-width: 40px;
    @apply text-xs;
  }

  .category-labels {
    padding: 0 20px;
    height: 50px; /* Smaller height on mobile */
  }

  .category-section.values {
    left: 20px;
    width: calc(40% - 20px);
  }

  .category-section.faces {
    left: calc(40% + 20px);
    width: calc(60% - 40px);
  }
}
</style>
