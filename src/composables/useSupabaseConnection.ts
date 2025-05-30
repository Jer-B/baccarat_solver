import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabase';

export function useSupabaseConnection() {
  const isConnected = ref<boolean | null>(null); // null = checking, true = connected, false = disconnected
  const connectionError = ref<string | null>(null);
  const isChecking = ref(false);

  const checkConnection = async (): Promise<boolean> => {
    isChecking.value = true;
    connectionError.value = null;

    try {
      // Try to perform a simple query to test connection
      const { error } = await supabase.from('user_sessions').select('id').limit(1);

      if (error) {
        // Check if it's an API key issue
        if (error.message.includes('Invalid API key') || error.message.includes('API key')) {
          connectionError.value = 'Invalid API key configuration';
        } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
          connectionError.value = 'Database tables not set up';
        } else {
          connectionError.value = error.message;
        }
        isConnected.value = false;
        return false;
      }

      isConnected.value = true;
      return true;
    } catch (error) {
      console.error('[supabase][connection] Connection check failed', { error });

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
      return false;
    } finally {
      isChecking.value = false;
    }
  };

  const getConnectionStatus = () => {
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
  };

  const getConnectionMessage = () => {
    const status = getConnectionStatus();

    switch (status) {
      case 'checking':
        return 'Checking database connection...';
      case 'connected':
        return 'Database connected';
      case 'disconnected':
        return connectionError.value || 'Database connection failed';
      default:
        return 'Database status unknown';
    }
  };

  // Check connection on mount
  onMounted(() => {
    checkConnection();
  });

  return {
    isConnected,
    connectionError,
    isChecking,
    checkConnection,
    getConnectionStatus,
    getConnectionMessage,
  };
}
