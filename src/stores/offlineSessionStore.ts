/**
 * 🗄️ Offline Session Store - CDD Excellence
 *
 * Dedicated Pinia store for offline session data management.
 * Handles local persistence, session queuing, and offline-first operations.
 *
 * @fileoverview Offline session data store with persistence
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import {
  STORAGE_CONFIG,
  CLEANUP_CONFIG,
  ID_GENERATION_CONFIG,
} from '../config/offlineResilienceConfig';
import type {
  UserSessionRecord,
  CreateSessionRecordData,
  EndSessionRecordData,
  SessionRecordId,
} from '../types/core/sessionRecordingTypes';

// ==================== OFFLINE SESSION TYPES ====================

interface OfflineSessionData extends Omit<UserSessionRecord, 'id'> {
  localId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: string;
  offlineCreated: boolean;
}

interface OfflineSessionQueue {
  sessionData: OfflineSessionData;
  operation: 'create' | 'update';
  timestamp: string;
  retryCount: number;
}

interface OfflineStoreState {
  isOfflineMode: boolean;
  activeSessions: OfflineSessionData[];
  syncQueue: OfflineSessionQueue[];
  currentSessionId: string | null;
  lastSyncAttempt: string | null;
  syncErrors: string[];
}

// ==================== STORE DEFINITION ====================

export const useOfflineSessionStore = defineStore('offlineSession', () => {
  // ==================== PERSISTENT STATE ====================

  // Persist offline sessions across browser sessions
  const persistentSessions = useLocalStorage<OfflineSessionData[]>(
    STORAGE_CONFIG.KEYS.OFFLINE_SESSIONS,
    []
  );
  const persistentQueue = useLocalStorage<OfflineSessionQueue[]>(
    STORAGE_CONFIG.KEYS.SYNC_QUEUE,
    []
  );
  const persistentCurrentSession = useLocalStorage<string | null>(
    STORAGE_CONFIG.KEYS.CURRENT_SESSION,
    null
  );

  // ==================== REACTIVE STATE ====================

  const isOfflineMode = ref(true); // Start offline until proven online
  const syncErrors = ref<string[]>([]);
  const lastSyncAttempt = ref<string | null>(null);
  const isProcessingQueue = ref(false);

  // ==================== COMPUTED ====================

  const activeSessions = computed(() => persistentSessions.value);
  const syncQueue = computed(() => persistentQueue.value);
  const currentSessionId = computed(() => persistentCurrentSession.value);

  const currentSession = computed(() => {
    if (!currentSessionId.value) return null;
    return activeSessions.value.find(s => s.localId === currentSessionId.value) || null;
  });

  const pendingSyncCount = computed(
    () => syncQueue.value.filter(item => item.sessionData.syncStatus === 'pending').length
  );

  const hasSyncErrors = computed(() => syncErrors.value.length > 0);

  const offlineStats = computed(() => ({
    totalSessions: activeSessions.value.length,
    pendingSync: pendingSyncCount.value,
    syncErrors: syncErrors.value.length,
    lastSync: lastSyncAttempt.value,
  }));

  // ==================== ID GENERATION UTILITIES ====================

  /**
   * Generates a unique offline session ID using centralized config
   */
  const generateOfflineId = (): string => {
    const timestamp = Date.now();
    const randomString = Math.random()
      .toString(ID_GENERATION_CONFIG.RANDOM.BASE)
      .substr(ID_GENERATION_CONFIG.RANDOM.SLICE_START, ID_GENERATION_CONFIG.RANDOM.SLICE_LENGTH);

    return `offline-${timestamp}-${randomString}`;
  };

  // ==================== SESSION OPERATIONS ====================

  /**
   * Creates a new offline session
   */
  const createOfflineSession = (data: CreateSessionRecordData): OfflineSessionData => {
    const localId = generateOfflineId();
    const timestamp = new Date().toISOString();

    const offlineSession: OfflineSessionData = {
      localId,
      session_name: data.session_name,
      started_at: data.started_at,
      ended_at: null,
      duration_seconds: null,
      start_balance: data.start_balance || null,
      end_balance: null,
      cards_remaining: data.cards_remaining || null,
      total_hands: 0,
      status: 'active',
      session_lifecycle_flag: 1,
      created_at: timestamp,
      updated_at: timestamp,
      syncStatus: 'pending',
      lastModified: timestamp,
      offlineCreated: true,
    };

    // Add to active sessions
    persistentSessions.value.push(offlineSession);

    // Check session count thresholds from CLEANUP_CONFIG
    const sessionCount = persistentSessions.value.length;
    if (sessionCount >= CLEANUP_CONFIG.THRESHOLDS.SESSION_WARNING_LIMIT) {
      console.warn('[offline-store][threshold] Session count approaching limit', {
        currentCount: sessionCount,
        warningLimit: CLEANUP_CONFIG.THRESHOLDS.SESSION_WARNING_LIMIT,
        forceLimit: CLEANUP_CONFIG.THRESHOLDS.SESSION_FORCE_LIMIT,
      });

      // Force cleanup if at limit
      if (sessionCount >= CLEANUP_CONFIG.THRESHOLDS.SESSION_FORCE_LIMIT) {
        console.error(
          '[offline-store][threshold] Session force limit reached, triggering cleanup',
          {
            currentCount: sessionCount,
            forceLimit: CLEANUP_CONFIG.THRESHOLDS.SESSION_FORCE_LIMIT,
          }
        );

        // Trigger immediate cleanup of old synced sessions
        cleanupSyncedSessions(CLEANUP_CONFIG.RETENTION.SYNCED_SESSIONS_DAYS);
      }
    }

    // Set as current session
    persistentCurrentSession.value = localId;

    // Add to sync queue
    addToSyncQueue(offlineSession, 'create');

    console.log('[offline-store][create] Offline session created', {
      localId,
      sessionName: data.session_name,
      pendingSync: true,
    });

    return offlineSession;
  };

  /**
   * Updates an existing offline session
   */
  const updateOfflineSession = (
    localId: string,
    updateData: Partial<EndSessionRecordData>
  ): OfflineSessionData | null => {
    const sessionIndex = persistentSessions.value.findIndex(s => s.localId === localId);

    if (sessionIndex === -1) {
      console.error('[offline-store][update] Session not found', { localId });
      return null;
    }

    const session = persistentSessions.value[sessionIndex];
    const timestamp = new Date().toISOString();

    // Update session data
    const updatedSession: OfflineSessionData = {
      ...session,
      ...updateData,
      lastModified: timestamp,
      updated_at: timestamp,
      syncStatus: 'pending',
    };

    // Update in array
    persistentSessions.value[sessionIndex] = updatedSession;

    // Add to sync queue
    addToSyncQueue(updatedSession, 'update');

    console.log('[offline-store][update] Offline session updated', {
      localId,
      operation: 'update',
      pendingSync: true,
    });

    return updatedSession;
  };

  /**
   * Ends the current offline session
   */
  const endCurrentOfflineSession = (endData: EndSessionRecordData): OfflineSessionData | null => {
    if (!currentSessionId.value) {
      console.warn('[offline-store][end] No current session to end');
      return null;
    }

    const updatedSession = updateOfflineSession(currentSessionId.value, endData);

    if (updatedSession) {
      // Clear current session
      persistentCurrentSession.value = null;

      console.log('[offline-store][end] Current session ended', {
        localId: currentSessionId.value,
        duration: endData.duration_seconds,
        status: endData.status,
      });
    }

    return updatedSession;
  };

  // ==================== SYNC QUEUE MANAGEMENT ====================

  /**
   * Adds session to sync queue
   */
  const addToSyncQueue = (
    sessionData: OfflineSessionData,
    operation: 'create' | 'update'
  ): void => {
    const queueItem: OfflineSessionQueue = {
      sessionData,
      operation,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    persistentQueue.value.push(queueItem);

    // Check queue size limit from CLEANUP_CONFIG
    if (persistentQueue.value.length > CLEANUP_CONFIG.RETENTION.MAX_QUEUE_SIZE) {
      console.warn('[offline-store][queue] Queue size limit exceeded, removing oldest items', {
        currentSize: persistentQueue.value.length,
        maxSize: CLEANUP_CONFIG.RETENTION.MAX_QUEUE_SIZE,
      });

      // Remove oldest items to stay within limit
      const excessItems = persistentQueue.value.length - CLEANUP_CONFIG.RETENTION.MAX_QUEUE_SIZE;
      persistentQueue.value.splice(0, excessItems);
    }

    console.log('[offline-store][queue] Added to sync queue', {
      localId: sessionData.localId,
      operation,
      queueSize: persistentQueue.value.length,
    });
  };

  /**
   * Removes item from sync queue
   */
  const removeFromSyncQueue = (localId: string): void => {
    const initialLength = persistentQueue.value.length;
    persistentQueue.value = persistentQueue.value.filter(
      item => item.sessionData.localId !== localId
    );

    console.log('[offline-store][queue] Removed from sync queue', {
      localId,
      removedItems: initialLength - persistentQueue.value.length,
      queueSize: persistentQueue.value.length,
    });
  };

  /**
   * Marks session as synced
   */
  const markSessionSynced = (localId: string, remoteId?: SessionRecordId): void => {
    const sessionIndex = persistentSessions.value.findIndex(s => s.localId === localId);

    if (sessionIndex !== -1) {
      persistentSessions.value[sessionIndex].syncStatus = 'synced';

      console.log('[offline-store][sync] Session marked as synced', {
        localId,
        remoteId,
      });
    }

    removeFromSyncQueue(localId);
  };

  /**
   * Increments retry count for a specific session in sync queue
   */
  const incrementRetryCount = (localId: string): void => {
    const queueIndex = persistentQueue.value.findIndex(
      item => item.sessionData.localId === localId
    );

    if (queueIndex !== -1) {
      persistentQueue.value[queueIndex].retryCount++;

      console.log('[offline-store][retry] Incremented retry count', {
        localId,
        newRetryCount: persistentQueue.value[queueIndex].retryCount,
      });
    } else {
      console.warn('[offline-store][retry] Session not found in sync queue', {
        localId,
      });
    }
  };

  /**
   * Marks session sync as failed
   */
  const markSyncFailed = (localId: string, error: string): void => {
    const sessionIndex = persistentSessions.value.findIndex(s => s.localId === localId);

    if (sessionIndex !== -1) {
      persistentSessions.value[sessionIndex].syncStatus = 'failed';
    }

    // Increment retry count in queue
    const queueIndex = persistentQueue.value.findIndex(
      item => item.sessionData.localId === localId
    );

    if (queueIndex !== -1) {
      persistentQueue.value[queueIndex].retryCount++;
    }

    // Add to error log with size limit from CLEANUP_CONFIG
    syncErrors.value.push(`${localId}: ${error}`);

    // Limit error log size using CLEANUP_CONFIG
    if (syncErrors.value.length > CLEANUP_CONFIG.RETENTION.MAX_ERROR_ENTRIES) {
      syncErrors.value = syncErrors.value.slice(-CLEANUP_CONFIG.RETENTION.MAX_ERROR_ENTRIES);
    }

    console.error('[offline-store][sync] Session sync failed', {
      localId,
      error,
      retryCount: queueIndex !== -1 ? persistentQueue.value[queueIndex].retryCount : 0,
    });
  };

  // ==================== MODE MANAGEMENT ====================

  /**
   * Sets offline mode state
   */
  const setOfflineMode = (offline: boolean): void => {
    const wasOffline = isOfflineMode.value;
    isOfflineMode.value = offline;

    console.log('[offline-store][mode] Mode changed', {
      from: wasOffline ? 'offline' : 'online',
      to: offline ? 'offline' : 'online',
      pendingSync: pendingSyncCount.value,
    });
  };

  /**
   * Records sync attempt
   */
  const recordSyncAttempt = (): void => {
    lastSyncAttempt.value = new Date().toISOString();
  };

  // ==================== CLEANUP OPERATIONS ====================

  /**
   * Clears sync errors
   */
  const clearSyncErrors = (): void => {
    syncErrors.value = [];
    console.log('[offline-store][cleanup] Sync errors cleared');
  };

  /**
   * Removes synced sessions older than specified days
   */
  const cleanupSyncedSessions = (
    olderThanDays: number = STORAGE_CONFIG.CLEANUP_AFTER_DAYS
  ): void => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    const initialCount = persistentSessions.value.length;

    persistentSessions.value = persistentSessions.value.filter(session => {
      return session.syncStatus !== 'synced' || session.lastModified > cutoffTimestamp;
    });

    const removedCount = initialCount - persistentSessions.value.length;

    console.log('[offline-store][cleanup] Cleaned up synced sessions', {
      removedCount,
      remainingCount: persistentSessions.value.length,
      cutoffDate: cutoffTimestamp,
    });
  };

  /**
   * Clears ALL offline data - sessions, sync queue, errors
   * WARNING: This is destructive and cannot be undone!
   */
  const clearAllOfflineData = (): void => {
    const sessionCount = persistentSessions.value.length;
    const queueCount = persistentQueue.value.length;
    const errorCount = syncErrors.value.length;

    // Clear all data arrays/objects
    persistentSessions.value.splice(0); // Clear array in-place for reactivity
    persistentQueue.value.splice(0); // Clear array in-place for reactivity
    syncErrors.value.splice(0); // Clear array in-place for reactivity
    persistentCurrentSession.value = null;
    lastSyncAttempt.value = null;

    console.warn('[offline-store][cleanup] ALL offline data cleared', {
      clearedSessions: sessionCount,
      clearedQueue: queueCount,
      clearedErrors: errorCount,
      timestamp: new Date().toISOString(),
    });
  };

  // ==================== WATCHERS ====================

  // Auto-cleanup on mode change to online
  watch(isOfflineMode, (newOffline, oldOffline) => {
    if (oldOffline && !newOffline) {
      // Switched from offline to online - trigger cleanup
      setTimeout(() => cleanupSyncedSessions(), STORAGE_CONFIG.CLEANUP_TIMEOUT);
    }
  });

  // ==================== PUBLIC API ====================

  return {
    // State (readonly)
    isOfflineMode: computed(() => isOfflineMode.value),
    activeSessions,
    syncQueue,
    currentSessionId,
    currentSession,
    pendingSyncCount,
    hasSyncErrors,
    offlineStats,
    lastSyncAttempt: computed(() => lastSyncAttempt.value),
    syncErrors: computed(() => [...syncErrors.value]),
    isProcessingQueue: computed(() => isProcessingQueue.value),

    // Session operations
    createOfflineSession,
    updateOfflineSession,
    endCurrentOfflineSession,

    // Sync management
    markSessionSynced,
    markSyncFailed,
    recordSyncAttempt,
    addToSyncQueue,
    removeFromSyncQueue,
    incrementRetryCount,

    // Mode management
    setOfflineMode,

    // Cleanup
    clearSyncErrors,
    cleanupSyncedSessions,
    clearAllOfflineData,
  };
});
