/**
 * Supabase Connection Health Monitor
 *
 * Independent composable for monitoring database connection health
 * across the application. Can be used by any component that needs
 * to display connection status or handle connection issues.
 *
 * Uses Vue 3 automatic setup/cleanup patterns - no explicit lifecycle hooks needed.
 */

import { ref, computed, onScopeDispose } from 'vue';
import { supabase } from '@/lib/supabase';

interface ConnectionHealthState {
  isHealthy: boolean;
  lastChecked: Date | null;
  lastError: string | null;
  isChecking: boolean;
}

export function useSupabaseConnectionHealth() {
  // ==================== STATE ====================

  const state = ref<ConnectionHealthState>({
    isHealthy: true, // Assume healthy until proven otherwise
    lastChecked: null,
    lastError: null,
    isChecking: false,
  });

  // Auto-check interval (5 minutes)
  const CHECK_INTERVAL_MS = 5 * 60 * 1000;
  let intervalId: NodeJS.Timeout | null = null;

  // ==================== COMPUTED ====================

  const connectionStatus = computed(() => {
    if (state.value.isChecking) return 'checking';
    if (state.value.isHealthy) return 'healthy';
    return 'unhealthy';
  });

  const statusText = computed(() => {
    switch (connectionStatus.value) {
      case 'checking':
        return 'Database connected';
      case 'healthy':
        return 'Database connected';
      case 'unhealthy':
        return 'Database connection issues';
      default:
        return 'Unknown status';
    }
  });

  const shouldShowWarning = computed(() => connectionStatus.value === 'unhealthy');

  // ==================== METHODS ====================

  /**
   * Performs a simple database health check using a lightweight query
   */
  const checkConnection = async (): Promise<boolean> => {
    try {
      console.log('[connection-health][operation] Checking database connection');

      state.value.isChecking = true;
      state.value.lastError = null;

      // Simple health check using Supabase auth status
      const { data, error } = await supabase.auth.getSession();

      // Even if no session, if query doesn't error, connection is healthy
      const isHealthy = !error;

      state.value.isHealthy = isHealthy;
      state.value.lastChecked = new Date();

      if (isHealthy) {
        console.log('[connection-health][success] Database connection healthy');
      } else {
        console.warn('[connection-health][warning] Database connection unhealthy');
        state.value.lastError = error?.message || 'Connection check failed';
      }

      return isHealthy;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';

      console.error('[connection-health][error] Connection check failed:', errorMessage);

      state.value.isHealthy = false;
      state.value.lastError = errorMessage;

      return false;
    } finally {
      state.value.isChecking = false;
    }
  };

  /**
   * Starts automatic connection monitoring
   */
  const startMonitoring = (): void => {
    if (intervalId) return; // Already monitoring

    console.log('[connection-health][initialization] Starting automatic monitoring');

    // Initial check
    checkConnection();

    // Set up interval
    intervalId = setInterval(checkConnection, CHECK_INTERVAL_MS);
  };

  /**
   * Stops automatic connection monitoring
   */
  const stopMonitoring = (): void => {
    if (intervalId) {
      console.log('[connection-health][cleanup] Stopping automatic monitoring');
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  /**
   * Clears any connection errors
   */
  const clearError = (): void => {
    state.value.lastError = null;
  };

  /**
   * Forces a connection retry
   */
  const retryConnection = async (): Promise<boolean> => {
    console.log('[connection-health][user-action] Manual connection retry');
    return await checkConnection();
  };

  // ==================== AUTOMATIC SETUP/CLEANUP ====================

  // Auto-start monitoring when composable is first used
  startMonitoring();

  // Automatic cleanup when component scope is disposed
  onScopeDispose(() => {
    stopMonitoring();
  });

  // ==================== PUBLIC API ====================

  return {
    // Readonly state
    isHealthy: computed(() => state.value.isHealthy),
    lastChecked: computed(() => state.value.lastChecked),
    lastError: computed(() => state.value.lastError),
    isChecking: computed(() => state.value.isChecking),

    // Computed status
    connectionStatus,
    statusText,
    shouldShowWarning,

    // Methods
    checkConnection,
    retryConnection,
    clearError,

    // Monitoring control
    startMonitoring,
    stopMonitoring,
  };
}
