<!--
🔗 Supabase Connection Status Component

Independent component for displaying database connection health.
Automatically monitors connection using Vue 3 setup/cleanup patterns.
Can be used anywhere in the app that needs to show connection status.
-->

<template>
  <div
    class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <!-- Connection Status Icon -->
        <div class="flex-shrink-0">
          <div
            v-if="connectionHealth.isChecking.value"
            class="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <div v-else class="w-4 h-4 bg-yellow-500 rounded-full"></div>
        </div>

        <!-- Status Message -->
        <div>
          <div class="flex items-center space-x-2">
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Database Connection Status: {{ connectionHealth.connectionStatus.value }}
            </p>
            <!-- Current Mode Display -->
            <span
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              :class="currentModeClasses"
            >
              {{ currentModeText }}
            </span>
          </div>
          <p class="text-xs text-yellow-600 dark:text-yellow-400">
            {{ connectionHealth.lastError.value || connectionHealth.statusText.value }}
          </p>
        </div>
      </div>

      <!-- Retry Button -->
      <button
        @click="handleRetry"
        :disabled="connectionHealth.isChecking.value"
        class="flex-shrink-0 px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 underline disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ connectionHealth.isChecking.value ? 'Checking...' : 'Check Connection' }}
      </button>
    </div>

    <!-- Last Checked Info -->
    <div
      v-if="connectionHealth.lastChecked.value"
      class="mt-2 text-xs text-yellow-600 dark:text-yellow-400"
    >
      Last checked: {{ formatLastChecked(connectionHealth.lastChecked.value) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSupabaseConnectionHealth } from '@/composables/useSupabaseConnectionHealth';
import { hybridSessionRecordingService } from '@/services/hybridSessionRecordingService';

// ==================== COMPOSABLES ====================

// Composable automatically handles setup and cleanup
const connectionHealth = useSupabaseConnectionHealth();

// ==================== COMPUTED PROPERTIES ====================

/**
 * Gets current mode from hybrid service
 */
const currentMode = computed(() => {
  return hybridSessionRecordingService.getCurrentMode();
});

/**
 * Display text for current mode
 */
const currentModeText = computed(() => {
  const mode = currentMode.value;
  if (mode === 'offline') {
    return '- Local';
  }
  return mode.charAt(0).toUpperCase() + mode.slice(1);
});

/**
 * CSS classes for current mode badge
 */
const currentModeClasses = computed(() => {
  const mode = currentMode.value;
  if (mode === 'offline') {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  }
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
});

// ==================== EVENT HANDLERS ====================

const handleRetry = async () => {
  console.log('[connection-status][user-action] Manual retry requested');
  await connectionHealth.retryConnection();
};

// ==================== UTILITIES ====================

const formatLastChecked = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleTimeString();
  }
};
</script>
