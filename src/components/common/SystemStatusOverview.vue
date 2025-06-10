<!--
🖥️ System Status Overview - CDD Excellence

Comprehensive system status dashboard showing online/offline capabilities,
sync status, export options, and connection health.
Professional interface for monitoring offline resilience.
-->

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
  >
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <div class="flex items-center space-x-2">
          <div :class="statusIndicatorClass" class="w-3 h-3 rounded-full"></div>
          <span>System Status</span>
        </div>
      </h3>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {{ statusDescription }}
      </p>
    </div>

    <!-- Content -->
    <div class="p-6 space-y-6">
      <!-- Connection Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Online/Offline Mode -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Current Mode</p>
              <p class="text-xl font-bold" :class="modeTextClass">
                {{ connectionStatus.currentMode }}
              </p>
            </div>
            <div
              :class="modeIconClass"
              class="w-8 h-8 rounded-full flex items-center justify-center"
            >
              <svg
                v-if="connectionStatus.currentMode === 'online'"
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 1.414L15.828 9l1.243 1.243a1 1 0 11-1.414 1.414L14.414 10.414l-1.243 1.243a1 1 0 11-1.414-1.414L12.999 9l-1.242-1.243a1 1 0 111.414-1.414L14.414 7.586l1.243-1.243z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clip-rule="evenodd"
                />
                <path
                  d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                />
              </svg>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ modeDescription }}
          </p>
        </div>

        <!-- Connection Health -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Connection</p>
              <p class="text-xl font-bold" :class="connectionHealthClass">
                {{ connectionStatus.connectionStatus }}
              </p>
            </div>
            <button
              @click="retryConnection"
              :disabled="connectionStatus.isHealthy"
              class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              Retry
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ formatLastChecked(connectionStatus.lastChecked) }}
          </p>
        </div>

        <!-- Offline Sessions -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Offline Sessions</p>
              <p class="text-xl font-bold text-purple-600 dark:text-purple-400">
                {{ offlineStats.totalSessions }}
              </p>
            </div>
            <div
              class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-purple-600 dark:text-purple-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
                />
              </svg>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Stored locally</p>
        </div>

        <!-- Pending Sync -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Sync</p>
              <p class="text-xl font-bold" :class="pendingSyncClass">
                {{ offlineStats.pendingSync }}
              </p>
            </div>
            <button
              @click="triggerSync"
              :disabled="offlineStats.pendingSync === 0 || !connectionStatus.isHealthy"
              class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
            >
              Sync
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Items to sync</p>
        </div>
      </div>

      <!-- Export Actions -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Data Export Options
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- JSON Export -->
          <button
            @click="exportJSON"
            :disabled="offlineStats.totalSessions === 0"
            class="flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm font-medium text-blue-700 dark:text-blue-300"> Export JSON </span>
          </button>

          <!-- CSV Export -->
          <button
            @click="exportCSV"
            :disabled="offlineStats.totalSessions === 0"
            class="flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              class="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm font-medium text-green-700 dark:text-green-300"> Export CSV </span>
          </button>

          <!-- Clear Data -->
          <button
            @click="clearOfflineData"
            :disabled="offlineStats.totalSessions === 0"
            class="flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              class="w-5 h-5 text-red-600 dark:text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm font-medium text-red-700 dark:text-red-300"> Clear Data </span>
          </button>
        </div>
      </div>

      <!-- Status Messages -->
      <div
        v-if="connectionStatus.lastError || offlineStats.syncErrors > 0"
        class="border-t border-gray-200 dark:border-gray-700 pt-6"
      >
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Status Messages</h4>
        <div class="space-y-2">
          <div
            v-if="connectionStatus.lastError"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-700 dark:text-red-300">
              Connection Error: {{ connectionStatus.lastError }}
            </p>
          </div>
          <div
            v-if="offlineStats.syncErrors > 0"
            class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <p class="text-sm text-yellow-700 dark:text-yellow-300">
              {{ offlineStats.syncErrors }} sync error(s) - check logs for details
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onScopeDispose } from 'vue';
import { useSessionRecording } from '@/composables/useSessionRecording';
import { sessionExportService } from '@/services/sessionExportService';
import { CONNECTION_CONFIG } from '@/config/offlineResilienceConfig';

// ==================== COMPOSABLES ====================

const sessionRecording = useSessionRecording();

// ==================== STATE ====================

const lastUpdate = ref<Date>(new Date());

// Auto-refresh interval for status updates using centralized config
let refreshIntervalId: NodeJS.Timeout | null = null;

// ==================== COMPUTED ====================

const connectionStatus = computed(() => sessionRecording.getConnectionStatus());
const offlineStats = computed(() => sessionRecording.getOfflineStats());

const statusIndicatorClass = computed(() => {
  if (connectionStatus.value.isHealthy) {
    return 'bg-green-500';
  }
  return 'bg-yellow-500';
});

const statusDescription = computed(() => {
  if (connectionStatus.value.isHealthy) {
    return 'System is online and fully operational';
  }
  return 'System is in offline mode - data saved locally';
});

const modeTextClass = computed(() => {
  return connectionStatus.value.currentMode === 'online'
    ? 'text-green-600 dark:text-green-400'
    : 'text-yellow-600 dark:text-yellow-400';
});

const modeIconClass = computed(() => {
  return connectionStatus.value.currentMode === 'online'
    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400';
});

const modeDescription = computed(() => {
  return connectionStatus.value.currentMode === 'online'
    ? 'Data syncs automatically'
    : 'Data stored locally';
});

const connectionHealthClass = computed(() => {
  switch (connectionStatus.value.connectionStatus) {
    case 'healthy':
      return 'text-green-600 dark:text-green-400';
    case 'checking':
      return 'text-blue-600 dark:text-blue-400';
    case 'unhealthy':
    default:
      return 'text-red-600 dark:text-red-400';
  }
});

const pendingSyncClass = computed(() => {
  const count = offlineStats.value.pendingSync;
  if (count === 0) {
    return 'text-green-600 dark:text-green-400';
  } else if (count <= 5) {
    return 'text-yellow-600 dark:text-yellow-400';
  } else {
    return 'text-red-600 dark:text-red-400';
  }
});

// ==================== METHODS ====================

const formatLastChecked = (date: Date | null): string => {
  if (!date) return 'Never checked';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else {
    return date.toLocaleTimeString();
  }
};

const refreshStatus = (): void => {
  lastUpdate.value = new Date();
};

const startStatusRefresh = (): void => {
  if (refreshIntervalId) return; // Already running

  console.log('[system-status][initialization] Starting status refresh timer');
  refreshIntervalId = setInterval(refreshStatus, CONNECTION_CONFIG.UI_REFRESH_INTERVAL);
};

const stopStatusRefresh = (): void => {
  if (refreshIntervalId) {
    console.log('[system-status][cleanup] Stopping status refresh timer');
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
};

const retryConnection = async (): Promise<void> => {
  console.log('[system-status][user-action] Manual connection retry');
  await sessionRecording.retryConnection();
  refreshStatus();
};

const triggerSync = async (): Promise<void> => {
  console.log('[system-status][user-action] Manual sync trigger');
  await sessionRecording.triggerSync();
  refreshStatus();
};

const exportJSON = async (): Promise<void> => {
  console.log('[system-status][export] JSON export initiated');
  try {
    await sessionExportService.downloadOfflineJSON();
    console.log('[system-status][export] JSON export completed');
  } catch (error) {
    console.error('[system-status][export] JSON export failed', error);
  }
};

const exportCSV = async (): Promise<void> => {
  console.log('[system-status][export] CSV export initiated');
  try {
    await sessionExportService.downloadOfflineCSV();
    console.log('[system-status][export] CSV export completed');
  } catch (error) {
    console.error('[system-status][export] CSV export failed', error);
  }
};

const clearOfflineData = (): void => {
  if (confirm('Are you sure you want to clear all offline session data? This cannot be undone.')) {
    console.log('[system-status][cleanup] Clearing offline data');
    try {
      sessionRecording.clearAllOfflineData();
      refreshStatus();
      console.log('[system-status][cleanup] All offline data cleared successfully');
    } catch (error) {
      console.error('[system-status][cleanup] Failed to clear offline data', error);
    }
  }
};

// ==================== AUTOMATIC SETUP/CLEANUP ====================

// Auto-start status refresh when component is initialized
console.log('[system-status][initialization] Component initialized with automatic setup');
startStatusRefresh();

// Automatic cleanup when component scope is disposed
onScopeDispose(() => {
  console.log('[system-status][cleanup] Component scope disposed, cleaning up');
  stopStatusRefresh();
});
</script>
