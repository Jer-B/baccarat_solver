<template>
  <div class="card">
    <!-- Updated header with inline status info -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Shoe Composition</h2>

      <!-- Inline status indicators -->
      <div class="flex items-center gap-4">
        <!-- Remaining Cards -->
        <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
          <span class="text-sm font-semibold text-blue-800"
            >Remaining: 🃏{{ store.totalCardsRemaining }} cards</span
          >
        </div>

        <!-- Penetration -->
        <div
          class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1 cursor-help"
          title="Penetration shows how much of the shoe has been dealt. Higher penetration = more accurate card counting."
        >
          <span class="text-sm font-semibold text-green-800"
            >Penetration: 📊{{ (store.currentPenetration * 100).toFixed(1) }}%</span
          >
        </div>
      </div>
    </div>

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
            <div class="card-item">
              <!-- Overlapped Cards Display -->
              <div class="overlapped-cards-container">
                <PlayingCard
                  v-for="(rank, index) in zeroValueRanks"
                  :key="rank"
                  :rank="rank as Rank"
                  suit="spades"
                  size="small"
                  clickable
                  :disabled="isCardDisabled(rank)"
                  :style="{
                    position: 'absolute',
                    left: `${index * 8}px`,
                    zIndex: zeroValueRanks.length - index,
                  }"
                  @click="addZeroValueCardToHand"
                  class="cursor-pointer hover:scale-105 transition-transform"
                />
              </div>
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
                :disabled="isCardDisabled('A')"
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
                :rank="rank as Rank"
                suit="spades"
                size="small"
                clickable
                show-count
                :count="getCardCount(rank)"
                :disabled="isCardDisabled(rank)"
                @click="addCardToHand"
                class="cursor-pointer hover:scale-105 transition-transform"
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
import { useGameSequence } from '@/composables/useGameSequence';
import { useNotifications } from '@/composables/useNotifications';
import type { Card, Rank, Suit, CardValue } from '@/types/cards';
import PlayingCard from '@/components/cards/PlayingCard.vue';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();
const gameSequence = useGameSequence();
const { warning, error } = useNotifications();

// Inject the current round bet to check if bet is placed
const currentRoundBet = inject('currentRoundBet') as {
  hasBet: boolean;
  betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null;
  betAmount: number;
};

// Enhanced card selection validation using game sequence state
const hasActiveBet = computed(() => {
  // Must have a bet placed AND be in the correct game state
  const hasBet = currentRoundBet && currentRoundBet.hasBet === true;
  const canDrawCards = gameSequence.canDrawCards.value;

  console.log('[card-composition][state-check] Card selection validation', {
    hasBet,
    gameStep: gameSequence.state.currentStep,
    canDrawCards,
    hasActiveBet: hasBet && canDrawCards,
    currentRoundBet: currentRoundBet
      ? {
          hasBet: currentRoundBet.hasBet,
          betType: currentRoundBet.betType,
          betAmount: currentRoundBet.betAmount,
        }
      : 'null',
    gameSequenceState: {
      currentStep: gameSequence.state.currentStep,
      canBet: gameSequence.canBet.value,
      canDrawCards: gameSequence.canDrawCards.value,
      canCompleteRound: gameSequence.canCompleteRound.value,
    },
  });

  return hasBet && canDrawCards;
});

// Function to check card selection validity and show appropriate toast
const validateCardSelection = (): boolean => {
  const currentStep = gameSequence.state.currentStep;
  const hasBet = currentRoundBet && currentRoundBet.hasBet === true;
  const canDrawCards = gameSequence.canDrawCards.value;

  console.log('[card-composition][validation] Card selection validation', {
    currentStep,
    hasBet,
    canDrawCards,
    currentRoundBet: currentRoundBet
      ? {
          hasBet: currentRoundBet.hasBet,
          betType: currentRoundBet.betType,
          betAmount: currentRoundBet.betAmount,
        }
      : 'null',
    gameSequenceCanDrawCards: gameSequence.canDrawCards.value,
    isValid: hasBet && canDrawCards,
  });

  // Check session state first
  if (currentStep === 'session_inactive') {
    warning('🚫 Please start a session first before selecting cards');
    return false;
  }

  // Check if user needs to place a bet first - BUT ONLY if they don't already have one
  if (!hasBet) {
    if (currentStep === 'ready_to_bet') {
      warning('💰 Please place a bet first before selecting cards! Use P, B, or T keys to bet');
      return false;
    }
    warning('💰 Please place a bet first before selecting cards');
    return false;
  }

  // Check if in wrong game state
  if (currentStep === 'round_complete' || currentStep === 'round_result') {
    warning('🏁 Round is complete. Clear the hand first to start a new round');
    return false;
  }

  // Check if can draw cards according to game sequence
  if (!canDrawCards) {
    warning('🚫 Cannot select cards in current game state');
    return false;
  }

  // All checks passed
  return true;
};

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
  // Validate card selection with proper toast notifications
  if (!validateCardSelection()) {
    return;
  }

  const rank = cardData.rank;
  // Find the first available suit for this rank
  const availableSuit = suits.find(suit => {
    const count = store.shoe.remainingCards.get(`${rank}-${suit}`) || 0;
    return count > 0;
  });

  if (!availableSuit) {
    warning('🃏 No cards of this rank available in the shoe');
    return;
  }

  // Create the card with proper typing
  const card = {
    rank: rank as Rank,
    suit: availableSuit as Suit,
    value: store.getCardValue(rank as Rank),
  };

  // Remove card from shoe
  const cardKey = `${rank}-${availableSuit}`;
  const currentCount = store.shoe.remainingCards.get(cardKey) || 0;
  if (currentCount > 0) {
    store.shoe.remainingCards.set(cardKey, currentCount - 1);
  }

  // Add to player side first, then banker
  if (store.shoe.currentHand.player.length <= store.shoe.currentHand.banker.length) {
    store.shoe.currentHand.player.push(card);
  } else {
    store.shoe.currentHand.banker.push(card);
  }

  // Trigger game sequence card drawn event
  gameSequence.onCardDrawn();

  console.log('[card-selection][hand-update] Card added to current hand', {
    card,
    totalCards: store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length,
    playerCards: store.shoe.currentHand.player.length,
    bankerCards: store.shoe.currentHand.banker.length,
  });
}

// Add a zero-value card to the hand (randomly select from available 10, J, Q, K)
function addZeroValueCardToHand() {
  // Validate card selection with proper toast notifications
  if (!validateCardSelection()) {
    return;
  }

  // Find available zero-value cards
  const availableZeroValueCards = [];
  for (const rank of zeroValueRanks) {
    for (const suit of suits) {
      const count = store.shoe.remainingCards.get(`${rank}-${suit}`) || 0;
      if (count > 0) {
        availableZeroValueCards.push({ rank, suit });
      }
    }
  }

  if (availableZeroValueCards.length === 0) {
    warning('🃏 No zero-value cards available in the shoe');
    return;
  }

  // Randomly select one available zero-value card
  const randomIndex = Math.floor(Math.random() * availableZeroValueCards.length);
  const selectedCard = availableZeroValueCards[randomIndex];

  // Create the card
  const card: Card = {
    rank: selectedCard.rank as Rank,
    suit: selectedCard.suit,
    value: store.getCardValue(selectedCard.rank as Rank),
  };

  console.log('[card-composition][user-action] Zero-value card selected from composition', {
    card: `${card.rank}-${card.suit}`,
    remainingCardsTotal: store.totalCardsRemaining,
  });

  // Update the count by removing one card of this specific suit and rank
  const currentCount =
    store.shoe.remainingCards.get(`${selectedCard.rank}-${selectedCard.suit}`) || 0;
  store.shoe.remainingCards.set(`${selectedCard.rank}-${selectedCard.suit}`, currentCount - 1);

  // Determine which hand to add to (alternate between player and banker)
  const playerCards = store.shoe.currentHand.player.length;
  const bankerCards = store.shoe.currentHand.banker.length;

  if (playerCards <= bankerCards) {
    store.shoe.currentHand.player.push(card);
  } else {
    store.shoe.currentHand.banker.push(card);
  }

  // Update cards dealt counter
  store.shoe.cardsDealt++;

  // Trigger game sequence card drawn event
  gameSequence.onCardDrawn();
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

// Helper function for keyboard controls to select cards by rank
function selectCardByRank(rank: Rank) {
  console.log('[card-composition][keyboard] Keyboard card selection attempt', {
    rank,
    currentStep: gameSequence.state.currentStep,
  });

  // Validate card selection with proper toast notifications
  if (!validateCardSelection()) {
    return;
  }

  // For zero-value cards (10, J, Q, K), use the special handler
  if (zeroValueRanks.includes(rank)) {
    addZeroValueCardToHand();
    return;
  }

  // For other cards, use the regular handler
  addCardToHand({ rank, suit: 'spades' }); // suit will be auto-selected from available
}

// Enhanced disabled check for cards - only disable for card availability, not game state
const isCardDisabled = computed(() => (rank: string) => {
  // Card not available in shoe
  const cardCount = getCardCount(rank);
  if (cardCount === 0) {
    return true;
  }

  // Can't add more cards to hand (max 6 total)
  if (!store.canAddMoreCards) {
    return true;
  }

  // Don't disable for game state - let click handlers show toast notifications
  return false;
});

// Expose the method to parent components
defineExpose({
  selectCardByRank,
});
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
