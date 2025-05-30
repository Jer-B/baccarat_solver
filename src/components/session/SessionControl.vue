<template>
  <div class="card bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h2 class="text-xl font-semibold text-indigo-800">Session Control</h2>

        <!-- Session Status Indicator -->
        <div class="flex items-center space-x-2">
          <div
            class="w-3 h-3 rounded-full"
            :class="store.ui.sessionActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
          ></div>
          <span
            class="text-sm font-medium"
            :class="store.ui.sessionActive ? 'text-green-700' : 'text-red-700'"
          >
            {{ store.ui.sessionActive ? 'Session Active' : 'Session Inactive' }}
          </span>
        </div>

        <!-- Session Duration (if active) -->
        <div
          v-if="store.ui.sessionActive && store.ui.sessionStartTime"
          class="text-sm text-gray-600"
        >
          Duration: {{ sessionDuration }}
        </div>
      </div>

      <!-- Session Control Buttons -->
      <div class="flex items-center space-x-3">
        <button
          v-if="!store.ui.sessionActive"
          @click="startSession"
          class="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
            ></path>
          </svg>
          <span>Start Session</span>
        </button>

        <button
          v-if="store.ui.sessionActive"
          @click="endSession"
          class="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 10h6v4H9z"
            ></path>
          </svg>
          <span>End Session</span>
        </button>

        <!-- Session Info -->
        <div v-if="!store.ui.sessionActive" class="text-sm text-gray-600 max-w-xs">
          <div class="font-medium text-indigo-700">Ready to Start</div>
          <div class="text-xs">Start a session to begin betting and playing</div>
        </div>
      </div>
    </div>

    <!-- Burn Card Settings (Always Visible) -->
    <div class="mt-4 p-4 bg-white bg-opacity-60 border border-orange-100 rounded-lg">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-orange-800">🔥 Burn Card Settings</h3>
        <div class="text-xs text-orange-600">Professional burn card tracking</div>
      </div>

      <!-- Auto Burn Settings -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-3">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="autoBurnEnabled"
              type="checkbox"
              class="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
            <span class="text-sm font-medium text-gray-700">Auto Burn at Session Start</span>
          </label>

          <div class="flex items-center space-x-2">
            <input
              v-model.number="autoBurnCount"
              type="number"
              min="0"
              max="10"
              :disabled="!autoBurnEnabled"
              class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
              placeholder="3"
            />
            <span class="text-xs text-gray-600">cards</span>
          </div>
        </div>

        <div class="text-xs text-gray-500 max-w-xs">
          {{
            autoBurnEnabled && autoBurnCount > 0
              ? `Will burn ${autoBurnCount} cards when session starts`
              : autoBurnEnabled && autoBurnCount === 0
                ? 'No cards will be burned automatically'
                : 'Manual burn only'
          }}
        </div>
      </div>

      <!-- Manual Burn Controls -->
      <div class="flex items-center justify-between pt-2 border-t border-orange-100">
        <div class="flex items-center space-x-3">
          <label class="text-sm text-gray-700">Manual Burn:</label>
          <input
            v-model.number="manualBurnCount"
            type="number"
            min="1"
            max="10"
            class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md"
            placeholder="3"
          />
          <button
            @click="performManualBurn()"
            :disabled="!store.canPerformActions || !manualBurnCount || manualBurnCount <= 0"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              store.canPerformActions && manualBurnCount > 0
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed',
            ]"
            :title="'Burn cards manually at any time'"
          >
            🔥 Burn Now
          </button>
        </div>

        <div class="text-xs text-gray-500">{{ store.totalCardsRemaining }} cards remaining</div>
      </div>

      <!-- Burn Info Toggle Section -->
      <div class="mt-3 pt-2 border-t border-orange-100">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-semibold text-orange-800">💡 Burn Card Information</h4>
          <InfoToggleButton
            type="section"
            section="sessionControl"
            subsection="burnInfo"
            variant="warning"
            size="xs"
          />
        </div>
        <div
          v-if="visibilityStore.isVisible('sessionControl', 'burnInfo')"
          class="text-xs text-gray-600 bg-gray-50 p-2 rounded"
        >
          <div>• Auto burn simulates casino burn procedures at session start</div>
          <div>• Manual burn can be used anytime during play</div>
          <div>• Set to 0 for no automatic burning</div>
          <div>• Burned cards are tracked professionally without revealing content</div>
        </div>
      </div>
    </div>

    <!-- Session Warning (when inactive) -->
    <div
      v-if="!store.ui.sessionActive"
      class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
    >
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          ></path>
        </svg>
        <div>
          <div class="text-sm font-medium text-yellow-800">Session Required</div>
          <div class="text-xs text-yellow-700">
            Betting, demo hands, and hand clearing are disabled until you start a session.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { useNotifications } from '../../composables/useNotifications';
import InfoToggleButton from '@/components/common/button/InfoToggleButton.vue';

const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();
const { info, success, warning } = useNotifications();

const sessionDuration = ref('00:00:00');
let durationInterval: NodeJS.Timeout | null = null;

// Burn card settings
const autoBurnEnabled = ref(true);
const autoBurnCount = ref(3);
const manualBurnCount = ref(3);

const startSession = () => {
  console.log('[session-control][initialization] Starting session with burn settings', {
    autoBurnEnabled: autoBurnEnabled.value,
    autoBurnCount: autoBurnCount.value,
  });

  store.startSession();
  startDurationTimer();

  // Auto burn if enabled and count > 0
  if (autoBurnEnabled.value && autoBurnCount.value > 0) {
    performAutoBurn();
  } else if (autoBurnEnabled.value && autoBurnCount.value === 0) {
    info('🔥 Session started with no auto burn (count set to 0)');
  } else {
    info('🎯 Session started • Manual burn only');
  }
};

const endSession = () => {
  console.log('[session-control][cleanup] Ending session');
  store.endSession();
  stopDurationTimer();
};

const performAutoBurn = () => {
  if (!autoBurnEnabled.value || autoBurnCount.value <= 0) {
    return;
  }

  if (autoBurnCount.value > store.totalCardsRemaining) {
    warning(
      `Cannot auto burn ${autoBurnCount.value} cards • Only ${store.totalCardsRemaining} remaining`
    );
    return;
  }

  console.log('[session-control][auto-burn] Performing automatic burn at session start', {
    burnCount: autoBurnCount.value,
    cardsRemaining: store.totalCardsRemaining,
  });

  store.burnUnknownCards(autoBurnCount.value);
  success(
    `🔥 Auto burned ${autoBurnCount.value} cards at session start • ${store.totalCardsRemaining} remaining`
  );
};

const performManualBurn = () => {
  if (!store.canPerformActions || !manualBurnCount.value || manualBurnCount.value <= 0) {
    return;
  }

  if (manualBurnCount.value > store.totalCardsRemaining) {
    warning(
      `Cannot burn ${manualBurnCount.value} cards • Only ${store.totalCardsRemaining} remaining`
    );
    return;
  }

  console.log('[session-control][manual-burn] Performing manual burn', {
    burnCount: manualBurnCount.value,
    cardsRemaining: store.totalCardsRemaining,
  });

  store.burnUnknownCards(manualBurnCount.value);
  info(
    `🔥 Burned ${manualBurnCount.value} cards manually • ${store.totalCardsRemaining} remaining`
  );

  // Reset manual burn count for next use
  manualBurnCount.value = 3;
};

const formatSessionDuration = (): string => {
  if (!store.ui.sessionStartTime) {
    return '00:00:00';
  }

  const now = Date.now();
  const elapsed = now - store.ui.sessionStartTime;

  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const startDurationTimer = () => {
  if (durationInterval) {
    clearInterval(durationInterval);
  }

  // Update immediately
  sessionDuration.value = formatSessionDuration();

  durationInterval = setInterval(() => {
    sessionDuration.value = formatSessionDuration();
  }, 1000);
};

const stopDurationTimer = () => {
  if (durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
  }
  sessionDuration.value = '00:00:00';
};

onMounted(() => {
  if (store.ui.sessionActive && store.ui.sessionStartTime) {
    startDurationTimer();
  }
});

onUnmounted(() => {
  stopDurationTimer();
});
</script>
