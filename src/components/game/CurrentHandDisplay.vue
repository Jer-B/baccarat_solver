<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Current Hand</h2>
      <div class="flex items-center space-x-3">
        <!-- Auto-complete Checkbox -->
        <label class="flex items-center space-x-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            v-model="gameSequence.state.autoCompleteEnabled"
            @change="handleAutoCompleteToggle"
            class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span class="text-gray-700">Auto-complete at 6 cards</span>
        </label>

        <!-- Complete Round Button -->
        <button
          @click="clearCurrentHand()"
          :class="[
            'px-3 py-1 rounded-md text-sm transition-colors',
            canClearHand()
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed',
          ]"
          :disabled="!canClearHand()"
        >
          {{ currentRoundBet.hasBet ? 'Complete Round' : 'Clear Hand' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <!-- Player Side -->
      <div
        :class="[
          'p-3 rounded-lg border-2 transition-all duration-300',
          currentRoundBet.hasBet && currentRoundBet.betType === 'player'
            ? 'bg-blue-50 border-blue-400 shadow-lg ring-2 ring-blue-300'
            : 'border-gray-200',
        ]"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <h3 class="font-medium text-gray-700">Player</h3>
            <!-- Player Kanji SVG -->
            <svg width="24" height="24" viewBox="0 0 24 24" class="text-blue-600">
              <text
                x="12"
                y="18"
                text-anchor="middle"
                font-family="serif"
                font-size="16"
                fill="currentColor"
              >
                閑
              </text>
            </svg>
            <!-- Bet Amount Display -->
            <div
              v-if="currentRoundBet.hasBet && currentRoundBet.betType === 'player'"
              class="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold"
            >
              ${{ currentRoundBet.betAmount }}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div
              class="text-lg font-bold"
              :class="[
                store.shoe.currentHand.player.length > 0 ? 'text-blue-600' : 'text-gray-400',
                store.currentHandValues.player >= 8 && store.shoe.currentHand.player.length > 0
                  ? 'bg-yellow-100 px-2 py-1 rounded'
                  : '',
              ]"
            >
              {{ store.shoe.currentHand.player.length > 0 ? store.currentHandValues.player : '-' }}
            </div>
            <div
              v-if="store.currentHandValues.player >= 8 && store.shoe.currentHand.player.length > 0"
              class="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded"
            >
              Natural
            </div>
          </div>
        </div>
        <div class="flex space-x-2">
          <PlayingCard
            v-for="(card, index) in store.shoe.currentHand.player"
            :key="index"
            :card="card"
            size="medium"
            :horizontal="index === 2"
          />
          <PlayingCard
            v-if="store.shoe.currentHand.player.length === 0"
            is-card-back
            size="medium"
          />
        </div>
      </div>

      <!-- Banker Side -->
      <div
        :class="[
          'p-3 rounded-lg border-2 transition-all duration-300',
          currentRoundBet.hasBet && currentRoundBet.betType === 'banker'
            ? 'bg-red-50 border-red-400 shadow-lg ring-2 ring-red-300'
            : 'border-gray-200',
        ]"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <h3 class="font-medium text-gray-700">Banker</h3>
            <!-- Banker Kanji SVG -->
            <svg width="24" height="24" viewBox="0 0 24 24" class="text-red-600">
              <text
                x="12"
                y="18"
                text-anchor="middle"
                font-family="serif"
                font-size="16"
                fill="currentColor"
              >
                庄
              </text>
            </svg>
            <!-- Bet Amount Display -->
            <div
              v-if="currentRoundBet.hasBet && currentRoundBet.betType === 'banker'"
              class="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold"
            >
              ${{ currentRoundBet.betAmount }}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div
              class="text-lg font-bold"
              :class="[
                store.shoe.currentHand.banker.length > 0 ? 'text-red-600' : 'text-gray-400',
                store.currentHandValues.banker >= 8 && store.shoe.currentHand.banker.length > 0
                  ? 'bg-yellow-100 px-2 py-1 rounded'
                  : '',
              ]"
            >
              {{ store.shoe.currentHand.banker.length > 0 ? store.currentHandValues.banker : '-' }}
            </div>
            <div
              v-if="store.currentHandValues.banker >= 8 && store.shoe.currentHand.banker.length > 0"
              class="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded"
            >
              Natural
            </div>
          </div>
        </div>
        <div class="flex space-x-2">
          <PlayingCard
            v-for="(card, index) in store.shoe.currentHand.banker"
            :key="index"
            :card="card"
            size="medium"
            :horizontal="index === 2"
          />
          <PlayingCard
            v-if="store.shoe.currentHand.banker.length === 0"
            is-card-back
            size="medium"
          />
        </div>
      </div>
    </div>

    <!-- Other Bet Types Display -->
    <div
      v-if="
        currentRoundBet.hasBet &&
        currentRoundBet.betType &&
        ['tie', 'playerPair', 'bankerPair'].includes(currentRoundBet.betType)
      "
      class="mt-4 p-3 rounded-lg border-2 transition-all duration-300"
      :class="{
        'bg-green-50 border-green-400 shadow-lg ring-2 ring-green-300':
          currentRoundBet.betType === 'tie',
        'bg-purple-50 border-purple-400 shadow-lg ring-2 ring-purple-300':
          currentRoundBet.betType === 'playerPair',
        'bg-orange-50 border-orange-400 shadow-lg ring-2 ring-orange-300':
          currentRoundBet.betType === 'bankerPair',
      }"
    >
      <div class="flex items-center justify-center space-x-2">
        <span class="font-medium text-gray-700">
          {{
            currentRoundBet.betType === 'tie'
              ? 'Tie Bet'
              : currentRoundBet.betType === 'playerPair'
                ? 'Player Pair Bet'
                : 'Banker Pair Bet'
          }}:
        </span>
        <div
          class="text-white px-3 py-1 rounded-full text-sm font-bold"
          :class="{
            'bg-green-600': currentRoundBet.betType === 'tie',
            'bg-purple-600': currentRoundBet.betType === 'playerPair',
            'bg-orange-600': currentRoundBet.betType === 'bankerPair',
          }"
        >
          ${{ currentRoundBet.betAmount }}
        </div>
      </div>
    </div>

    <!-- Hand Summary -->
    <div
      v-if="store.shoe.currentHand.player.length > 0 && store.shoe.currentHand.banker.length > 0"
      class="mt-4 pt-4 border-t border-gray-200"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="text-center">
          <div class="font-medium text-gray-700">Current Winner</div>
          <div class="text-lg font-bold" :class="getCurrentWinnerClass()">
            {{ getCurrentWinner() }}
          </div>
        </div>
        <div class="text-center">
          <div class="font-medium text-gray-700">Cards Dealt</div>
          <div class="text-lg font-bold text-gray-600">
            {{ store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length }}
          </div>
        </div>
        <div class="text-center">
          <div class="font-medium text-gray-700">Hand Status</div>
          <div class="text-lg font-bold text-gray-600">
            {{ getHandStatus() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Payout Reference -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <h4 class="text-sm font-semibold text-gray-800 mb-2">💰 Quick Payout Reference</h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="space-y-1">
          <div class="flex justify-between">
            <span class="text-blue-600 font-medium">Player:</span>
            <span>{{ store.settings.payouts.player }}:1</span>
          </div>
          <div class="flex justify-between">
            <span class="text-red-600 font-medium">Banker:</span>
            <span
              >{{ store.settings.payouts.banker }}:1 (-{{
                (store.settings.payouts.bankerCommission * 100).toFixed(1)
              }}%)</span
            >
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between">
            <span class="text-green-600 font-medium">Tie:</span>
            <span>{{ store.settings.payouts.tie }}:1</span>
          </div>
          <div class="flex justify-between">
            <span class="text-purple-600 font-medium">Pairs:</span>
            <span>{{ store.settings.payouts.playerPair }}:1</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, watch } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useGameLogic } from '@/composables/useGameLogic';
import { useGameSequence } from '@/composables/useGameSequence';
import PlayingCard from '@/components/cards/PlayingCard.vue';

const store = useBaccaratStore();
const { getCurrentWinner, getCurrentWinnerClass, getHandStatus, canClearHand } = useGameLogic();
const gameSequence = useGameSequence();

// Inject shared data from App.vue
const currentRoundBet = inject('currentRoundBet') as {
  hasBet: boolean;
  betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null;
  betAmount: number;
};

// Emit events to parent
const emit = defineEmits<{
  clearHand: [];
}>();

// Auto-complete handler
const handleAutoCompleteToggle = () => {
  gameSequence.setAutoComplete(gameSequence.state.autoCompleteEnabled);
};

// Watch for 6 cards and auto-complete if enabled
watch(
  () => store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length,
  totalCards => {
    if (totalCards === 6 && gameSequence.state.autoCompleteEnabled) {
      // Auto-complete the round
      setTimeout(() => {
        clearCurrentHand();
      }, 1000); // Give a short delay to see the 6th card
    }
  }
);

const clearCurrentHand = (): void => {
  emit('clearHand');
};
</script>
