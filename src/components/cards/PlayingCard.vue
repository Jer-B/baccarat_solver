<template>
  <div
    class="playing-card-container"
    :class="[
      `card-${size}`,
      { 'card-clickable': clickable, 'card-horizontal': horizontal },
      cardStateClass,
    ]"
    @click="handleClick"
  >
    <svg class="playing-card-svg" viewBox="0 0 169 244" xmlns="http://www.w3.org/2000/svg">
      <!-- Card Background -->
      <rect
        x="2"
        y="2"
        width="165"
        height="240"
        rx="12"
        ry="12"
        :fill="isCardBack ? '#1e40af' : '#ffffff'"
        stroke="#374151"
        stroke-width="2"
      />

      <!-- Card Back Pattern (when face down) -->
      <g v-if="isCardBack">
        <pattern id="cardBackPattern" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill="#1e40af" />
          <circle cx="10" cy="10" r="3" fill="#3b82f6" />
        </pattern>
        <rect x="12" y="12" width="145" height="220" rx="8" fill="url(#cardBackPattern)" />
        <text x="84.5" y="130" text-anchor="middle" fill="white" font-size="16" font-weight="bold">
          BACCARAT
        </text>
      </g>

      <!-- Card Face (when face up) -->
      <g v-else>
        <!-- Top Left Corner -->
        <g class="corner top-left">
          <text
            x="15"
            y="25"
            :fill="cardColor"
            :font-size="cardRank === '10' ? '16' : '20'"
            font-weight="bold"
            font-family="Arial, sans-serif"
          >
            {{ displayRank }}
          </text>
          <text x="15" y="45" :fill="cardColor" font-size="18" font-family="Arial, sans-serif">
            {{ suitSymbol }}
          </text>
        </g>

        <!-- Bottom Right Corner (rotated) -->
        <g class="corner bottom-right" transform="rotate(180 84.5 122)">
          <text
            x="15"
            y="25"
            :fill="cardColor"
            :font-size="cardRank === '10' ? '16' : '20'"
            font-weight="bold"
            font-family="Arial, sans-serif"
          >
            {{ displayRank }}
          </text>
          <text x="15" y="45" :fill="cardColor" font-size="18" font-family="Arial, sans-serif">
            {{ suitSymbol }}
          </text>
        </g>

        <!-- Card Center Design -->
        <g class="card-center">
          <!-- Ace Design -->
          <g v-if="cardRank === 'A'">
            <text
              x="84.5"
              y="135"
              text-anchor="middle"
              :fill="cardColor"
              font-size="60"
              font-family="Arial, sans-serif"
            >
              {{ suitSymbol }}
            </text>
          </g>

          <!-- Number Cards 2-10 -->
          <g v-else-if="['2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(cardRank)">
            <g v-if="cardRank === '2'">
              <text x="84.5" y="80" text-anchor="middle" :fill="cardColor" font-size="24">
                {{ suitSymbol }}
              </text>
              <text
                x="84.5"
                y="190"
                text-anchor="middle"
                :fill="cardColor"
                font-size="24"
                transform="rotate(180 84.5 190)"
              >
                {{ suitSymbol }}
              </text>
            </g>

            <g v-else-if="cardRank === '3'">
              <text x="84.5" y="70" text-anchor="middle" :fill="cardColor" font-size="20">
                {{ suitSymbol }}
              </text>
              <text x="84.5" y="135" text-anchor="middle" :fill="cardColor" font-size="20">
                {{ suitSymbol }}
              </text>
              <text
                x="84.5"
                y="200"
                text-anchor="middle"
                :fill="cardColor"
                font-size="20"
                transform="rotate(180 84.5 200)"
              >
                {{ suitSymbol }}
              </text>
            </g>

            <g v-else-if="cardRank === '4'">
              <text x="60" y="80" text-anchor="middle" :fill="cardColor" font-size="20">
                {{ suitSymbol }}
              </text>
              <text x="109" y="80" text-anchor="middle" :fill="cardColor" font-size="20">
                {{ suitSymbol }}
              </text>
              <text
                x="60"
                y="190"
                text-anchor="middle"
                :fill="cardColor"
                font-size="20"
                transform="rotate(180 60 190)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="109"
                y="190"
                text-anchor="middle"
                :fill="cardColor"
                font-size="20"
                transform="rotate(180 109 190)"
              >
                {{ suitSymbol }}
              </text>
            </g>

            <g v-else-if="cardRank === '5'">
              <text x="60" y="75" text-anchor="middle" :fill="cardColor" font-size="18">
                {{ suitSymbol }}
              </text>
              <text x="109" y="75" text-anchor="middle" :fill="cardColor" font-size="18">
                {{ suitSymbol }}
              </text>
              <text x="84.5" y="135" text-anchor="middle" :fill="cardColor" font-size="18">
                {{ suitSymbol }}
              </text>
              <text
                x="60"
                y="195"
                text-anchor="middle"
                :fill="cardColor"
                font-size="18"
                transform="rotate(180 60 195)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="109"
                y="195"
                text-anchor="middle"
                :fill="cardColor"
                font-size="18"
                transform="rotate(180 109 195)"
              >
                {{ suitSymbol }}
              </text>
            </g>

            <g v-else-if="cardRank === '6'">
              <text x="60" y="70" text-anchor="middle" :fill="cardColor" font-size="18">
                {{ suitSymbol }}
              </text>
              <text x="109" y="70" text-anchor="middle" :fill="cardColor" font-size="18">
                {{ suitSymbol }}
              </text>
              <text x="60" y="135" text-anchor="middle" :fill="cardColor" font-size="18">
                {{ suitSymbol }}
              </text>
              <text x="109" y="135" text-anchor="middle" :fill="cardColor" font-size="18">
                {{ suitSymbol }}
              </text>
              <text
                x="60"
                y="200"
                text-anchor="middle"
                :fill="cardColor"
                font-size="18"
                transform="rotate(180 60 200)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="109"
                y="200"
                text-anchor="middle"
                :fill="cardColor"
                font-size="18"
                transform="rotate(180 109 200)"
              >
                {{ suitSymbol }}
              </text>
            </g>

            <g v-else-if="cardRank === '7'">
              <text x="60" y="65" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text x="109" y="65" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text x="84.5" y="100" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text x="60" y="135" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text x="109" y="135" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text
                x="60"
                y="205"
                text-anchor="middle"
                :fill="cardColor"
                font-size="16"
                transform="rotate(180 60 205)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="109"
                y="205"
                text-anchor="middle"
                :fill="cardColor"
                font-size="16"
                transform="rotate(180 109 205)"
              >
                {{ suitSymbol }}
              </text>
            </g>

            <g v-else-if="cardRank === '8'">
              <text x="60" y="60" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text x="109" y="60" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text x="84.5" y="95" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text x="60" y="130" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text x="109" y="130" text-anchor="middle" :fill="cardColor" font-size="16">
                {{ suitSymbol }}
              </text>
              <text
                x="84.5"
                y="175"
                text-anchor="middle"
                :fill="cardColor"
                font-size="16"
                transform="rotate(180 84.5 175)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="60"
                y="210"
                text-anchor="middle"
                :fill="cardColor"
                font-size="16"
                transform="rotate(180 60 210)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="109"
                y="210"
                text-anchor="middle"
                :fill="cardColor"
                font-size="16"
                transform="rotate(180 109 210)"
              >
                {{ suitSymbol }}
              </text>
            </g>

            <g v-else-if="cardRank === '9'">
              <text x="60" y="60" text-anchor="middle" :fill="cardColor" font-size="14">
                {{ suitSymbol }}
              </text>
              <text x="109" y="60" text-anchor="middle" :fill="cardColor" font-size="14">
                {{ suitSymbol }}
              </text>
              <text x="60" y="90" text-anchor="middle" :fill="cardColor" font-size="14">
                {{ suitSymbol }}
              </text>
              <text x="109" y="90" text-anchor="middle" :fill="cardColor" font-size="14">
                {{ suitSymbol }}
              </text>
              <text x="84.5" y="135" text-anchor="middle" :fill="cardColor" font-size="14">
                {{ suitSymbol }}
              </text>
              <text
                x="60"
                y="180"
                text-anchor="middle"
                :fill="cardColor"
                font-size="14"
                transform="rotate(180 60 180)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="109"
                y="180"
                text-anchor="middle"
                :fill="cardColor"
                font-size="14"
                transform="rotate(180 109 180)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="60"
                y="210"
                text-anchor="middle"
                :fill="cardColor"
                font-size="14"
                transform="rotate(180 60 210)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="109"
                y="210"
                text-anchor="middle"
                :fill="cardColor"
                font-size="14"
                transform="rotate(180 109 210)"
              >
                {{ suitSymbol }}
              </text>
            </g>

            <g v-else-if="cardRank === '10'">
              <text x="60" y="55" text-anchor="middle" :fill="cardColor" font-size="12">
                {{ suitSymbol }}
              </text>
              <text x="109" y="55" text-anchor="middle" :fill="cardColor" font-size="12">
                {{ suitSymbol }}
              </text>
              <text x="84.5" y="80" text-anchor="middle" :fill="cardColor" font-size="12">
                {{ suitSymbol }}
              </text>
              <text x="60" y="105" text-anchor="middle" :fill="cardColor" font-size="12">
                {{ suitSymbol }}
              </text>
              <text x="109" y="105" text-anchor="middle" :fill="cardColor" font-size="12">
                {{ suitSymbol }}
              </text>
              <text
                x="60"
                y="165"
                text-anchor="middle"
                :fill="cardColor"
                font-size="12"
                transform="rotate(180 60 165)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="109"
                y="165"
                text-anchor="middle"
                :fill="cardColor"
                font-size="12"
                transform="rotate(180 109 165)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="84.5"
                y="190"
                text-anchor="middle"
                :fill="cardColor"
                font-size="12"
                transform="rotate(180 84.5 190)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="60"
                y="215"
                text-anchor="middle"
                :fill="cardColor"
                font-size="12"
                transform="rotate(180 60 215)"
              >
                {{ suitSymbol }}
              </text>
              <text
                x="109"
                y="215"
                text-anchor="middle"
                :fill="cardColor"
                font-size="12"
                transform="rotate(180 109 215)"
              >
                {{ suitSymbol }}
              </text>
            </g>
          </g>

          <!-- Face Cards -->
          <g v-else-if="['J', 'Q', 'K'].includes(cardRank)">
            <rect x="40" y="80" width="89" height="110" rx="8" :fill="cardColor" opacity="0.1" />
            <text
              x="84.5"
              y="145"
              text-anchor="middle"
              :fill="cardColor"
              font-size="36"
              font-weight="bold"
              font-family="serif"
            >
              {{ cardRank }}
            </text>
            <text x="84.5" y="170" text-anchor="middle" :fill="cardColor" font-size="20">
              {{ suitSymbol }}
            </text>
          </g>
        </g>
      </g>
    </svg>

    <!-- Card Count Badge (for composition chart) -->
    <div
      v-if="showCount && count !== undefined"
      class="card-count-badge"
      :class="getCountBadgeClass()"
    >
      {{ count }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Card, Rank, Suit } from '@/types/cards';

interface Props {
  card?: Card;
  rank?: Rank;
  suit?: Suit;
  size?: 'small' | 'medium' | 'large';
  clickable?: boolean;
  isCardBack?: boolean;
  showCount?: boolean;
  count?: number;
  disabled?: boolean;
  horizontal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  clickable: false,
  isCardBack: false,
  showCount: false,
  disabled: false,
  horizontal: false,
});

const emit = defineEmits<{
  click: [card: { rank: Rank; suit: Suit }];
}>();

// Get rank and suit from either card prop or individual props
const cardRank = computed(() => props.card?.rank || props.rank);
const cardSuit = computed(() => props.card?.suit || props.suit);

const displayRank = computed(() => {
  if (!cardRank.value) return '';
  return cardRank.value;
});

const suitSymbol = computed(() => {
  if (!cardSuit.value) return '';
  const symbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[cardSuit.value];
});

const cardColor = computed(() => {
  if (!cardSuit.value) return '#000000';
  return cardSuit.value === 'hearts' || cardSuit.value === 'diamonds' ? '#dc2626' : '#000000';
});

const cardStateClass = computed(() => {
  if (props.disabled) return 'card-disabled';
  if (props.count !== undefined) {
    if (props.count === 0) return 'card-empty';
    if (props.count <= 2) return 'card-low';
    if (props.count <= 4) return 'card-medium';
  }
  return 'card-normal';
});

const getCountBadgeClass = () => {
  if (props.count === undefined) return '';
  if (props.count === 0) return 'badge-empty';
  if (props.count <= 2) return 'badge-low';
  if (props.count <= 4) return 'badge-medium';
  return 'badge-normal';
};

const handleClick = () => {
  if (props.clickable && !props.disabled && cardRank.value && cardSuit.value) {
    emit('click', { rank: cardRank.value, suit: cardSuit.value });
  }
};
</script>

<style scoped>
.playing-card-container {
  position: relative;
  display: inline-block;
  transition: all 0.2s ease;
}

.card-small {
  width: 48px;
  height: 69px;
}

.card-medium {
  width: 64px;
  height: 92px;
}

.card-large {
  width: 96px;
  height: 138px;
}

.playing-card-svg {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-clickable:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-horizontal {
  transform: rotate(90deg);
  transform-origin: center;
}

.card-empty .playing-card-svg {
  opacity: 0.3;
  filter: grayscale(100%);
}

.card-low .playing-card-svg {
  border: 2px solid #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.card-medium .playing-card-svg {
  border: 2px solid #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
}

.card-normal .playing-card-svg {
  border: 2px solid #10b981;
}

.card-count-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.badge-empty {
  background-color: #6b7280;
}

.badge-low {
  background-color: #ef4444;
}

.badge-medium {
  background-color: #f59e0b;
}

.badge-normal {
  background-color: #10b981;
}
</style>
