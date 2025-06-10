<!--
🎮 CDD Session Control - Store-Connected Version

Session management component with persistent state across navigation.
-->

<template>
  <div
    class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden"
  >
    <!-- Title Bar -->
    <header
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-700"
      @click="store.toggleExpansion"
      role="button"
      tabindex="0"
    >
      <!-- Title Section -->
      <div class="flex items-center space-x-3">
        <!-- Expansion Icon -->
        <div class="w-6 h-6 text-neutral-500 dark:text-neutral-400">
          <svg
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-90': store.isExpanded }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        <!-- Title Text -->
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Session Control
        </h3>

        <!-- Status Badge -->
        <div
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="statusBadgeClasses"
        >
          <span>{{ store.statusText }}</span>
        </div>
      </div>

      <!-- Collapsed Content -->
      <div v-if="!store.isExpanded" class="flex items-center space-x-4">
        <!-- Duration Display -->
        <div class="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
          <div class="w-2 h-2 rounded-full" :class="statusIndicatorClasses"></div>
          <span class="text-sm font-mono font-semibold">{{ store.formattedDuration }}</span>
        </div>

        <!-- Action Button -->
        <button
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
          :disabled="isLoading"
          @click.stop="handlePrimaryAction"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>{{ store.actionButtonText }}</span>
        </button>
      </div>
    </header>

    <!-- Expanded Content - Simplified -->
    <div v-if="store.isExpanded" class="p-6 space-y-6 bg-neutral-50 dark:bg-neutral-900">
      <!-- Duration Display (Inline Format) -->
      <div
        class="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <span class="text-sm text-neutral-600 dark:text-neutral-400">Duration</span>
          <div class="w-2 h-2 rounded-full" :class="statusIndicatorClasses"></div>
        </div>
        <span class="text-lg font-mono font-semibold text-neutral-900 dark:text-neutral-100">
          {{ store.formattedDuration }}
        </span>
      </div>

      <!-- Primary Action Button -->
      <button
        class="w-full flex items-center justify-center px-4 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
        :disabled="isLoading"
        @click="handlePrimaryAction"
      >
        <span v-if="isLoading">Loading...</span>
        <span v-else>{{ store.actionButtonText }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSessionControlStore } from '@/stores/sessionControlStore';
import { useSessionRecording } from '@/composables/useSessionRecording';

// ==================== STORE CONNECTION ====================

const store = useSessionControlStore();
const recording = useSessionRecording();

// ==================== SETUP PATTERN ====================

console.log('[session-control] Component setup - session persists across navigation');

// ==================== COMPUTED PROPERTIES ====================

const statusBadgeClasses = computed(() => {
  switch (store.status) {
    case 'idle':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
});

const statusIndicatorClasses = computed(() => {
  switch (store.status) {
    case 'idle':
      return 'bg-gray-400';
    case 'active':
      return 'bg-green-400 animate-pulse';
    case 'completed':
      return 'bg-blue-400';
    default:
      return 'bg-gray-400';
  }
});

// ==================== TEMPLATE HELPERS ====================

const isLoading = computed(() => store.isLoading || recording.isRecording.value);

// ==================== EVENT HANDLERS ====================

const handlePrimaryAction = async () => {
  try {
    switch (store.status) {
      case 'idle':
      case 'completed': // Both can start new session
        console.log('[session-control] Starting session with database recording');
        await recording.startSessionWithRecording();
        break;
      case 'active':
        console.log('[session-control] Ending session with database recording');
        await recording.endSessionWithRecording();
        break;
    }
  } catch (err) {
    console.error('[session-control] Action failed:', err);
    // Error is already handled by the store and recording service
  }
};

const clearErrors = () => {
  store.clearError();
  recording.clearError();
};

// ==================== CLEANUP PATTERN ====================

// NO cleanup needed - session state persists across navigation
// The store and recording service handle their own lifecycle
</script>
