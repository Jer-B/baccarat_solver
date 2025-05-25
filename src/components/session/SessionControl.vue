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
import { useBaccaratStore } from '../../stores/baccaratStore';

const store = useBaccaratStore();
const sessionDuration = ref('00:00:00');
let durationInterval: number | null = null;

const startSession = () => {
  store.startSession();
  startDurationTimer();
};

const endSession = () => {
  if (
    confirm(
      'Are you sure you want to end the session? This will clear your current hand and reset betting statistics.'
    )
  ) {
    store.endSession();
    stopDurationTimer();
  }
};

const formatSessionDuration = (): string => {
  if (!store.ui.sessionStartTime) return '00:00:00';

  const now = Date.now();
  const elapsed = now - store.ui.sessionStartTime;

  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const startDurationTimer = () => {
  if (durationInterval) clearInterval(durationInterval);

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
