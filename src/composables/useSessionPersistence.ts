import { useBaccaratStore } from '@/stores/baccaratStore';

/**
 * Composable for handling session persistence across page refreshes
 * and warning users about losing session data
 */
export function useSessionPersistence() {
  const gameStore = useBaccaratStore();

  const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (gameStore.ui.sessionActive) {
      // Standard message for browser confirmation dialog
      const message =
        'You have an active gaming session. Refreshing will end your session. Are you sure?';
      event.preventDefault();
      event.returnValue = message;

      // Attempt to end session gracefully if user proceeds
      // Note: This is not guaranteed to work due to browser security restrictions
      setTimeout(() => {
        if (gameStore.ui.sessionActive) {
          console.log(
            '[session-persistence][warning] User proceeding with refresh, ending session'
          );
          gameStore.endSession();
        }
      }, 0);

      return message;
    }
  };

  const handlePageLoad = async () => {
    // Handle any interrupted sessions from page refresh
    await gameStore.handlePageRefresh();

    console.log('[session-persistence][load] Page loaded, session state checked');
  };

  const setupSessionPersistence = () => {
    window.addEventListener('beforeunload', beforeUnloadHandler);
    console.log('[session-persistence][setup] Session persistence handlers installed');
  };

  const cleanupSessionPersistence = () => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    console.log('[session-persistence][cleanup] Session persistence handlers removed');
  };

  return {
    handlePageLoad,
    setupSessionPersistence,
    cleanupSessionPersistence,
    beforeUnloadHandler,
  };
}
