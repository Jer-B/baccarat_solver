<template>
  <div class="card bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-yellow-800">Payout Settings</h2>
      <div class="flex items-center space-x-2">
        <!-- Global Info Panel Toggle -->
        <div class="flex items-center space-x-2 mr-4">
          <label class="text-sm text-yellow-800">Info Panels:</label>
          <button
            @click="store.toggleGlobalVisibility()"
            :class="[
              'px-2 py-1 rounded text-xs font-medium transition-colors',
              store.ui.globalToggleMode
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
            ]"
            :title="store.ui.globalToggleMode ? 'Hide all info panels' : 'Show all info panels'"
          >
            {{ store.ui.globalToggleMode ? '👁️ Show' : '👁️‍🗨️ Hide' }}
          </button>
        </div>

        <button
          @click="resetToDefaults"
          class="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          @click="applyPreset('macau')"
          class="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          Macau Style
        </button>
        <button
          @click="applyPreset('vegas')"
          class="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
        >
          Vegas Style
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <!-- Player Payout -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"> Player Payout </label>
        <div class="flex items-center space-x-1">
          <input
            v-model.number="localPayouts.player"
            type="number"
            min="0"
            step="0.1"
            class="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            @input="updatePayouts"
          />
          <span class="text-sm text-gray-600">:1</span>
        </div>
      </div>

      <!-- Banker Payout -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"> Banker Payout </label>
        <div class="flex items-center space-x-1">
          <input
            v-model.number="localPayouts.banker"
            type="number"
            min="0"
            step="0.1"
            class="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            @input="updatePayouts"
          />
          <span class="text-sm text-gray-600">:1</span>
        </div>
      </div>

      <!-- Banker Commission -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"> Banker Commission </label>
        <div class="flex items-center space-x-1">
          <input
            v-model.number="localCommission"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            @input="updateCommission"
          />
          <span class="text-sm text-gray-600">%</span>
        </div>
      </div>

      <!-- Tie Payout -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"> Tie Payout </label>
        <div class="flex items-center space-x-1">
          <input
            v-model.number="localPayouts.tie"
            type="number"
            min="0"
            step="0.1"
            class="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            @input="updatePayouts"
          />
          <span class="text-sm text-gray-600">:1</span>
        </div>
      </div>

      <!-- Player Pair Payout -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"> Player Pair </label>
        <div class="flex items-center space-x-1">
          <input
            v-model.number="localPayouts.playerPair"
            type="number"
            min="0"
            step="0.1"
            class="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            @input="updatePayouts"
          />
          <span class="text-sm text-gray-600">:1</span>
        </div>
      </div>

      <!-- Banker Pair Payout -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"> Banker Pair </label>
        <div class="flex items-center space-x-1">
          <input
            v-model.number="localPayouts.bankerPair"
            type="number"
            min="0"
            step="0.1"
            class="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            @input="updatePayouts"
          />
          <span class="text-sm text-gray-600">:1</span>
        </div>
      </div>
    </div>

    <!-- Payout Examples -->
    <div class="mt-4 p-3 bg-white rounded-lg border">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-800">💰 Payout Examples (for $10 bet)</h4>
        <button
          @click="store.toggleSectionVisibility('payoutSettings', 'payoutExamples')"
          :disabled="!store.isToggleEnabled()"
          class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="
            store.ui.globalToggleMode
              ? store.isVisible('payoutSettings', 'payoutExamples')
                ? 'Hide examples'
                : 'Show examples'
              : 'Enable info panels to toggle individual sections'
          "
        >
          {{ store.getToggleButtonText('payoutSettings', 'payoutExamples') }}
        </button>
      </div>
      <div
        v-if="store.isVisible('payoutSettings', 'payoutExamples')"
        class="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs"
      >
        <div class="space-y-1">
          <div class="font-medium text-blue-600">Player Win:</div>
          <div>${{ (10 * (localPayouts.player + 1)).toFixed(2) }} total return</div>
          <div class="text-gray-600">${{ (10 * localPayouts.player).toFixed(2) }} profit</div>
        </div>
        <div class="space-y-1">
          <div class="font-medium text-red-600">Banker Win:</div>
          <div>${{ calculateBankerPayout(10).toFixed(2) }} total return</div>
          <div class="text-gray-600">${{ (calculateBankerPayout(10) - 10).toFixed(2) }} profit</div>
        </div>
        <div class="space-y-1">
          <div class="font-medium text-green-600">Tie Win:</div>
          <div>${{ (10 * (localPayouts.tie + 1)).toFixed(2) }} total return</div>
          <div class="text-gray-600">${{ (10 * localPayouts.tie).toFixed(2) }} profit</div>
        </div>
        <div class="space-y-1">
          <div class="font-medium text-purple-600">Player Pair:</div>
          <div>${{ (10 * (localPayouts.playerPair + 1)).toFixed(2) }} total return</div>
          <div class="text-gray-600">${{ (10 * localPayouts.playerPair).toFixed(2) }} profit</div>
        </div>
        <div class="space-y-1">
          <div class="font-medium text-orange-600">Banker Pair:</div>
          <div>${{ (10 * (localPayouts.bankerPair + 1)).toFixed(2) }} total return</div>
          <div class="text-gray-600">${{ (10 * localPayouts.bankerPair).toFixed(2) }} profit</div>
        </div>
      </div>
    </div>

    <!-- Preset Information -->
    <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-blue-800">📋 Preset Information</h4>
        <button
          @click="store.toggleSectionVisibility('payoutSettings', 'presetInfo')"
          :disabled="!store.isToggleEnabled()"
          class="text-xs px-2 py-1 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="
            store.ui.globalToggleMode
              ? store.isVisible('payoutSettings', 'presetInfo')
                ? 'Hide preset info'
                : 'Show preset info'
              : 'Enable info panels to toggle individual sections'
          "
        >
          {{ store.getToggleButtonText('payoutSettings', 'presetInfo') }}
        </button>
      </div>
      <div
        v-if="store.isVisible('payoutSettings', 'presetInfo')"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700"
      >
        <div>
          <div class="font-medium mb-1">Standard/Vegas Style:</div>
          <div>• Player: 1:1, Banker: 1:1 (-5%), Tie: 8:1</div>
          <div>• Pairs: 11:1 each</div>
        </div>
        <div>
          <div class="font-medium mb-1">Macau Style:</div>
          <div>• Player: 1:1, Banker: 1:1 (-2.5%), Tie: 8:1</div>
          <div>• Pairs: 11:1 each (lower commission)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useBaccaratStore } from '../../stores/baccaratStore';

const store = useBaccaratStore();

// Local reactive copies for immediate UI updates
const localPayouts = reactive({
  player: 1,
  banker: 1,
  tie: 8,
  playerPair: 11,
  bankerPair: 11,
});

const localCommission = ref(5); // Percentage

// Initialize with current store values
onMounted(() => {
  localPayouts.player = store.settings.payouts.player;
  localPayouts.banker = store.settings.payouts.banker;
  localPayouts.tie = store.settings.payouts.tie;
  localPayouts.playerPair = store.settings.payouts.playerPair;
  localPayouts.bankerPair = store.settings.payouts.bankerPair;
  localCommission.value = store.settings.payouts.bankerCommission * 100;
});

const updatePayouts = () => {
  store.settings.payouts.player = localPayouts.player;
  store.settings.payouts.banker = localPayouts.banker;
  store.settings.payouts.tie = localPayouts.tie;
  store.settings.payouts.playerPair = localPayouts.playerPair;
  store.settings.payouts.bankerPair = localPayouts.bankerPair;

  // Recalculate edges and statistics with new payouts
  store.recalculateEdges();
  store.recalculateBettingStats();
};

const updateCommission = () => {
  store.settings.payouts.bankerCommission = localCommission.value / 100;

  // Recalculate edges and statistics with new commission
  store.recalculateEdges();
  store.recalculateBettingStats();
};

const calculateBankerPayout = (betAmount: number): number => {
  const winnings = betAmount * localPayouts.banker;
  const commission = winnings * (localCommission.value / 100);
  return betAmount + winnings - commission;
};

const resetToDefaults = () => {
  localPayouts.player = 1;
  localPayouts.banker = 1;
  localPayouts.tie = 8;
  localPayouts.playerPair = 11;
  localPayouts.bankerPair = 11;
  localCommission.value = 5;
  updatePayouts();
  updateCommission();
  alert('Payout settings reset to defaults. All calculations updated.');
};

const applyPreset = (preset: 'macau' | 'vegas') => {
  if (preset === 'macau') {
    localPayouts.player = 1;
    localPayouts.banker = 1;
    localPayouts.tie = 8;
    localPayouts.playerPair = 11;
    localPayouts.bankerPair = 11;
    localCommission.value = 2.5; // Lower commission in Macau
  } else if (preset === 'vegas') {
    localPayouts.player = 1;
    localPayouts.banker = 1;
    localPayouts.tie = 8;
    localPayouts.playerPair = 11;
    localPayouts.bankerPair = 11;
    localCommission.value = 5; // Standard 5% commission
  }
  updatePayouts();
  updateCommission();
  alert(
    `${preset === 'macau' ? 'Macau' : 'Vegas'} style payouts applied. All calculations updated.`
  );
};
</script>
