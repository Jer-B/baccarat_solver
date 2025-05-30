<template>
  <div class="space-y-6">
    <div class="card">
      <h2 class="text-xl font-semibold mb-4">Game History</h2>

      <div v-if="store.handHistory.length === 0" class="text-center py-8 text-gray-500">
        <p>No hands played yet.</p>
        <p class="text-sm mt-2">
          <router-link to="/game" class="text-blue-600 hover:text-blue-800 underline">
            Start playing
          </router-link>
          to see your game history here.
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="(hand, index) in store.handHistory"
          :key="index"
          class="border rounded-lg p-4 bg-gray-50"
        >
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium">Hand {{ hand.handNumber }}</h3>
            <span class="text-sm text-gray-500">
              {{ new Date(hand.timestamp).toLocaleTimeString() }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Player:</strong> {{ hand.playerTotal }}
              <span v-if="hand.playerPair" class="text-green-600 ml-2">PAIR</span>
            </div>
            <div>
              <strong>Banker:</strong> {{ hand.bankerTotal }}
              <span v-if="hand.bankerPair" class="text-green-600 ml-2">PAIR</span>
            </div>
          </div>

          <div class="mt-2">
            <span
              class="inline-block px-2 py-1 rounded text-sm font-medium"
              :class="{
                'bg-blue-100 text-blue-800': hand.winner === 'player',
                'bg-red-100 text-red-800': hand.winner === 'banker',
                'bg-green-100 text-green-800': hand.winner === 'tie',
              }"
            >
              {{ hand.winner.toUpperCase() }} WINS
            </span>
            <span v-if="hand.natural" class="ml-2 text-yellow-600 font-medium"> NATURAL </span>
          </div>

          <div v-if="hand.betInfo" class="mt-2 pt-2 border-t border-gray-200">
            <div class="text-sm">
              <strong>Bet:</strong> {{ hand.betInfo.betType.toUpperCase() }} - ${{
                hand.betInfo.betAmount
              }}
              <span
                :class="{
                  'text-green-600': hand.betInfo.won,
                  'text-red-600': !hand.betInfo.won,
                }"
                class="ml-2 font-medium"
              >
                {{ hand.betInfo.won ? 'WON' : 'LOST' }}
              </span>
              <span v-if="hand.betInfo.won" class="ml-2">
                (Payout: ${{ hand.betInfo.payout }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaccaratStore } from '@/stores/baccaratStore';

const store = useBaccaratStore();
</script>

<style scoped>
.history-view {
  @apply max-w-7xl mx-auto;
}

/* Custom styles for baccarat theme */
.bg-baccarat-green {
  background-color: #059669;
}

.bg-baccarat-green:hover {
  background-color: #047857;
}
</style>
