import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';

export type ConnectionStatus = 'unknown' | 'checking' | 'connected' | 'disconnected';

export const useConnectionStore = defineStore('connection', () => {
  // State
  const isConnected = ref<boolean | null>(null); // null = checking, true = connected, false = disconnected
  const connectionError = ref<string | null>(null);
  const isChecking = ref(false);
  const lastChecked = ref<Date | null>(null);
  const isDismissed = ref(false);
  const showConnectedBriefly = ref(false);

  // Getters
  const connectionStatus = computed((): ConnectionStatus => {
    if (isChecking.value) {
      return 'checking';
    }
    if (isConnected.value === null) {
      return 'unknown';
    }
    if (isConnected.value) {
      return 'connected';
    }
    return 'disconnected';
  });

  const connectionMessage = computed(() => {
    switch (connectionStatus.value) {
      case 'checking':
        return 'Checking database connection...';
      case 'connected':
        return 'Database connected';
      case 'disconnected':
        return connectionError.value || 'Database connection failed';
      default:
        return 'Database status unknown';
    }
  });

  const shouldShowBanner = computed(() => {
    if (isDismissed.value) {
      return false;
    }

    const status = connectionStatus.value;
    // Show banner for disconnected, checking, or briefly for connected
    return (
      status === 'disconnected' ||
      status === 'checking' ||
      (status === 'connected' && showConnectedBriefly.value)
    );
  });

  // Actions
  const checkConnection = async (): Promise<boolean> => {
    console.log('[connection-store][action] Starting connection check');

    isChecking.value = true;
    connectionError.value = null;

    try {
      // Try to perform a simple query to test connection
      const { error } = await supabase.from('user_sessions').select('id').limit(1);

      if (error) {
        console.log('[connection-store][error] Database query failed', { error: error.message });

        // Check if it's an API key issue
        if (error.message.includes('Invalid API key') || error.message.includes('API key')) {
          connectionError.value = 'Invalid API key configuration';
        } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
          connectionError.value = 'Database tables not set up';
        } else {
          connectionError.value = error.message;
        }
        isConnected.value = false;
        lastChecked.value = new Date();
        return false;
      }

      console.log('[connection-store][success] Database connection successful');
      isConnected.value = true;
      lastChecked.value = new Date();

      // Show connected banner briefly
      showConnectedBriefly.value = true;
      setTimeout(() => {
        showConnectedBriefly.value = false;
      }, 3500);

      return true;
    } catch (error) {
      console.error('[connection-store][error] Connection check failed', { error });

      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          connectionError.value = 'Network connection failed';
        } else {
          connectionError.value = error.message;
        }
      } else {
        connectionError.value = 'Unknown connection error';
      }

      isConnected.value = false;
      lastChecked.value = new Date();
      return false;
    } finally {
      isChecking.value = false;
    }
  };

  const dismissBanner = () => {
    console.log('[connection-store][action] Banner dismissed');
    isDismissed.value = true;
  };

  const resetDismissed = () => {
    console.log('[connection-store][action] Banner dismiss state reset');
    isDismissed.value = false;
  };

  const retryConnection = async () => {
    console.log('[connection-store][action] Retrying connection');
    resetDismissed();
    return await checkConnection();
  };

  // Initialize connection check (explicit call, not automatic)
  const initialize = async () => {
    console.log('[connection-store][action] Initializing connection store');
    await checkConnection();
  };

  return {
    // State
    isConnected,
    connectionError,
    isChecking,
    lastChecked,
    isDismissed,
    showConnectedBriefly,

    // Getters
    connectionStatus,
    connectionMessage,
    shouldShowBanner,

    // Actions
    checkConnection,
    dismissBanner,
    resetDismissed,
    retryConnection,
    initialize,
  };
});
