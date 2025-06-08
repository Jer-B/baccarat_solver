/**
 * Pinia Persistence Configuration
 *
 * Simple TRUE/FALSE configuration for store persistence settings.
 */

export const persistenceConfig = {
  /**
   * Theme Store Persistence
   * When TRUE: User's theme selection (Luxury/Elite) persists between browser sessions
   * When FALSE: Theme resets to default on page refresh
   */
  theme: true,
} as const;

export type PersistenceConfig = typeof persistenceConfig;
