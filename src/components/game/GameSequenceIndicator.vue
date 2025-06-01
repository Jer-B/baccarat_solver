<template>
  <div class="game-sequence-indicator">
    <!-- Sequence Step Display -->
    <div
      class="flex items-center space-x-3 px-3 py-2 rounded-lg border"
      :class="stepDisplay.bgColor"
    >
      <!-- Status Dot -->
      <div class="w-3 h-3 rounded-full transition-all duration-300" :class="statusDotClass"></div>

      <!-- Step Text -->
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium" :class="stepTextClass">
          {{ stepDisplay.text }}
        </span>

        <!-- Card Count for Drawing Phase -->
        <span
          v-if="gameSequence.state.currentStep === 'drawing_cards'"
          class="text-xs text-gray-600"
        >
          ({{ totalCards }}/6 cards)
        </span>
      </div>

      <!-- Auto-complete Indicator -->
      <div
        v-if="
          gameSequence.state.autoCompleteEnabled &&
          gameSequence.state.currentStep === 'drawing_cards'
        "
        class="text-xs text-purple-600 font-medium"
      >
        AUTO
      </div>
    </div>

    <!-- Debug Info (only in development) -->
    <div v-if="showDebug" class="mt-2 text-xs text-gray-500">
      Debug: {{ gameSequence.state.currentStep }}
      <span v-if="gameSequence.state.previousStep">
        (from {{ gameSequence.state.previousStep }})
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameSequence } from '@/composables/useGameSequence';
import { useBaccaratStore } from '@/stores/baccaratStore';

// Props
interface Props {
  showDebug?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDebug: false,
});

// Composables
const gameSequence = useGameSequence();
const store = useBaccaratStore();

// Computed properties
const stepDisplay = computed(() => gameSequence.stepDisplay.value);

const totalCards = computed(
  () => store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length
);

const statusDotClass = computed(() => {
  const baseClasses = 'transition-all duration-300';

  switch (gameSequence.state.currentStep) {
    case 'session_inactive':
      return `${baseClasses} bg-gray-400`;
    case 'ready_to_bet':
      return `${baseClasses} bg-blue-500 animate-pulse`;
    case 'bet_placed':
      return `${baseClasses} bg-green-500`;
    case 'drawing_cards':
      return `${baseClasses} bg-yellow-500 animate-pulse`;
    case 'round_complete':
      return `${baseClasses} bg-orange-500`;
    case 'round_result':
      return `${baseClasses} bg-purple-500`;
    default:
      return `${baseClasses} bg-gray-400`;
  }
});

const stepTextClass = computed(() => {
  switch (gameSequence.state.currentStep) {
    case 'session_inactive':
      return 'text-gray-600';
    case 'ready_to_bet':
      return 'text-blue-700';
    case 'bet_placed':
      return 'text-green-700';
    case 'drawing_cards':
      return 'text-yellow-700';
    case 'round_complete':
      return 'text-orange-700';
    case 'round_result':
      return 'text-purple-700';
    default:
      return 'text-gray-600';
  }
});

// Expose the game sequence for parent access
defineExpose({
  gameSequence,
});
</script>

<style scoped>
.game-sequence-indicator {
  /* Component-specific styles */
}

/* Custom animations */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
