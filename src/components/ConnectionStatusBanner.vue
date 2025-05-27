<template>
  <div
    v-if="shouldShowBanner"
    class="w-full px-4 py-2 text-sm font-medium transition-all duration-300"
    :class="bannerClasses"
  >
    <div class="container mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="statusIndicatorClass"
          ></div>
          <span>{{ connectionStatus.getConnectionMessage() }}</span>
        </div>
        
        <!-- Additional info for disconnected state -->
        <div v-if="connectionStatus.getConnectionStatus() === 'disconnected'" class="text-xs opacity-75">
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

        <!-- Export/Import buttons -->
        <button
          @click="exportSessions"
          class="px-2 py-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
          title="Export session data to JSON file"
        >
          📥 Export
        </button>

        <button
          @click="triggerImport"
          class="px-2 py-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
          title="Import session data from JSON file"
        >
          📤 Import
        </button>

        <!-- Hidden file input for import -->
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleFileImport"
          class="hidden"
        />

        <!-- Dismiss button -->
        <button
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
import { computed, ref } from 'vue';
import { useSupabaseConnection } from '../composables/useSupabaseConnection';
import { useSessionExport } from '../composables/useSessionExport';
import { useNotifications } from '../composables/useNotifications';

const connectionStatus = useSupabaseConnection();
const sessionExport = useSessionExport();
const { success, error: errorNotification, info } = useNotifications();

const isDismissed = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const shouldShowBanner = computed(() => {
  if (isDismissed.value) return false;
  
  const status = connectionStatus.getConnectionStatus();
  // Show banner for disconnected, checking, or if explicitly requested
  return status === 'disconnected' || status === 'checking';
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

const exportSessions = async () => {
  try {
    info('Exporting session data...');
    await sessionExport.exportToJSON();
    success('Session data exported successfully');
  } catch (error) {
    console.error('[export] Failed to export sessions', { error });
    errorNotification('Failed to export session data');
  }
};

const triggerImport = () => {
  fileInput.value?.click();
};

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  try {
    info('Importing session data...');
    await sessionExport.importFromJSON(file);
    success('Session data imported successfully');
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error) {
    console.error('[import] Failed to import sessions', { error });
    errorNotification('Failed to import session data');
  }
};

const dismissBanner = () => {
  isDismissed.value = true;
};
</script> 