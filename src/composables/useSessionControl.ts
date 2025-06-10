/**
 * 🎮 useSessionControl Composable - Store Wrapper Version
 *
 * Vue composable that wraps the session control store for easy use in components.
 * Provides reactive session management with navigation persistence.
 */

import { computed } from 'vue';
import { useSessionControlStore } from '@/stores/sessionControlStore';

export const useSessionControl = () => {
  const store = useSessionControlStore();

  // ==================== COMPUTED WRAPPERS ====================

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

  // ==================== ACTION WRAPPERS ====================

  const handlePrimaryAction = async () => {
    try {
      switch (store.status) {
        case 'idle':
        case 'completed':
          await store.startSession();
          break;
        case 'active':
          await store.endSession();
          break;
      }
    } catch (error) {
      console.error('[use-session-control] Action failed:', error);
      // Error is handled by the store
    }
  };

  // ==================== RETURN API ====================

  return {
    // Store state (reactive)
    ...store,

    // Computed UI helpers
    statusBadgeClasses,
    statusIndicatorClasses,

    // Action helpers
    handlePrimaryAction,
  };
};
