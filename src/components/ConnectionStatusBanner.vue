<template>
  <div
    v-if="shouldShowBanner"
    class="w-full px-4 py-2 text-sm font-medium transition-all duration-300"
    :class="bannerClasses"
  >
    <div class="container mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full" :class="statusIndicatorClass"></div>
          <span>{{ connectionStatus.getConnectionMessage() }}</span>
        </div>

        <!-- Additional info for disconnected state -->
        <div
          v-if="connectionStatus.getConnectionStatus() === 'disconnected'"
          class="text-xs opacity-75"
        >
          • Sessions will work locally
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <!-- Retry button for failed connections -->
        <button
          v-if="connectionStatus.getConnectionStatus() === 'disconnected'"
          @click="retryConnection"
          :disabled="connectionStatus.isChecking.value"
          class="px-2 py-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors disabled:opacity-50"
        >
          {{ connectionStatus.isChecking.value ? 'Checking...' : 'Retry' }}
        </button>

        <!-- Dismiss button - only for persistent states (disconnected), not temporary states (checking) -->
        <button
          v-if="connectionStatus.getConnectionStatus() === 'disconnected'"
          @click="dismissBanner"
          class="px-2 py-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useSupabaseConnection } from '../composables/useSupabaseConnection';
import { useNotifications } from '../composables/useNotifications';

const connectionStatus = useSupabaseConnection();
const { success } = useNotifications();

const isDismissed = ref(false);
const showConnectedBriefly = ref(false);

// Watch for successful connection to show brief success state
watch(
  () => connectionStatus.getConnectionStatus(),
  (newStatus, oldStatus) => {
    if (oldStatus === 'checking' && newStatus === 'connected') {
      showConnectedBriefly.value = true;
      // Auto-hide the connected banner after 3.5 seconds
      setTimeout(() => {
        showConnectedBriefly.value = false;
      }, 3500);
    }
  }
);

const shouldShowBanner = computed(() => {
  if (isDismissed.value) {
    return false;
  }

  const status = connectionStatus.getConnectionStatus();
  // Show banner for disconnected, checking, or briefly for connected
  return (
    status === 'disconnected' ||
    status === 'checking' ||
    (status === 'connected' && showConnectedBriefly.value)
  );
});

const bannerClasses = computed(() => {
  const status = connectionStatus.getConnectionStatus();

  switch (status) {
    case 'checking':
      return 'bg-blue-500 text-white';
    case 'connected':
      return 'bg-green-500 text-white';
    case 'disconnected':
      return 'bg-orange-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
});

const statusIndicatorClass = computed(() => {
  const status = connectionStatus.getConnectionStatus();

  switch (status) {
    case 'checking':
      return 'bg-blue-200 animate-pulse';
    case 'connected':
      return 'bg-green-200';
    case 'disconnected':
      return 'bg-red-200';
    default:
      return 'bg-gray-200';
  }
});

const retryConnection = async () => {
  await connectionStatus.checkConnection();

  if (connectionStatus.isConnected.value) {
    success('Database connection restored');
    isDismissed.value = true;
  }
};

const dismissBanner = () => {
  isDismissed.value = true;
};
</script>
