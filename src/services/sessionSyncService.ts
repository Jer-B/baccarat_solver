/**
 * 🔄 Session Sync Service - CDD Excellence
 *
 * Connection-aware synchronization service.
 * Handles queue-based sync, conflict resolution, and auto-switching.
 * Maintains data integrity across online/offline transitions.
 *
 * @fileoverview Session data synchronization service
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { ref, watch } from 'vue';
import { hybridSessionRecordingService } from './hybridSessionRecordingService';
import { useOfflineSessionStore } from '../stores/offlineSessionStore';
import { useSupabaseConnectionHealth } from '../composables/useSupabaseConnectionHealth';
import { SYNC_CONFIG, CONFLICT_CONFIG } from '../config/offlineResilienceConfig';
import type {
  SessionRecordId,
  CreateSessionRecordData,
  EndSessionRecordData,
} from '../types/core/sessionRecordingTypes';
import { createSessionRecordId } from '../types/core/sessionRecordingTypes';

// ==================== SYNC TYPES ====================

// Internal mutable type for conflict resolution
interface MutableCreateSessionRecordData {
  session_name: string;
  started_at: string;
  start_balance?: number | null;
  cards_remaining?: number | null;
}

interface SyncOperation {
  id: string;
  localId: string;
  remoteId?: SessionRecordId; // Track remote session record ID after successful sync
  operation: 'create' | 'update';
  data: CreateSessionRecordData | EndSessionRecordData;
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
  syncedRecordIds?: SessionRecordId[]; // Track successfully synced record IDs
}

interface SyncConflict {
  localId: string;
  remoteId?: SessionRecordId; // Remote session record ID if it exists
  operation: 'create' | 'update';
  localData: any;
  remoteData: any;
  conflictType: 'duplicate_name' | 'version_mismatch' | 'data_corruption';
  resolution: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
}

// ==================== SESSION SYNC SERVICE ====================

class SessionSyncService {
  private _connectionHealth: ReturnType<typeof useSupabaseConnectionHealth> | null = null;
  private _offlineStore: ReturnType<typeof useOfflineSessionStore> | null = null;

  private isProcessing = ref(false);
  private lastSyncAttempt = ref<Date | null>(null);
  private syncErrors = ref<string[]>([]);
  private conflicts = ref<SyncConflict[]>([]);
  private syncedRecords = ref<SessionRecordId[]>([]); // Track successfully synced records

  // Sync configuration from centralized config
  private readonly maxRetries = SYNC_CONFIG.MAX_RETRIES;
  private readonly syncDelay = SYNC_CONFIG.SYNC_DELAY;
  private readonly batchSize = SYNC_CONFIG.BATCH_SIZE;

  // Conflict resolution configuration from centralized config
  private readonly duplicateTimeThreshold = CONFLICT_CONFIG.DUPLICATE_TIME_THRESHOLD;
  private readonly maxAutoAttempts = CONFLICT_CONFIG.MAX_AUTO_ATTEMPTS;
  private autoAttemptCount = 0;

  /**
   * Lazy initialization to avoid Pinia/composable initialization issues
   */
  private getConnectionHealth(): ReturnType<typeof useSupabaseConnectionHealth> {
    if (!this._connectionHealth) {
      this._connectionHealth = useSupabaseConnectionHealth();
      console.log('[sync-service][initialization] Connection health initialized lazily');
    }
    return this._connectionHealth;
  }

  private getOfflineStore(): ReturnType<typeof useOfflineSessionStore> {
    if (!this._offlineStore) {
      this._offlineStore = useOfflineSessionStore();
      console.log('[sync-service][initialization] Offline store initialized lazily');
    }
    return this._offlineStore;
  }

  constructor() {
    console.log('[sync-service][initialization] Service initialized');
    // Setup connection monitoring after first access
    setTimeout(() => this.setupConnectionMonitoring(), 0);
  }

  // ==================== CONNECTION MONITORING ====================

  /**
   * Sets up automatic sync when connection is restored
   */
  private setupConnectionMonitoring(): void {
    const connectionHealth = this.getConnectionHealth();

    // Watch for connection health changes
    watch(
      () => connectionHealth.isHealthy.value,
      (isHealthy, wasHealthy) => {
        console.log('[sync-service][monitoring] Connection status changed', {
          from: wasHealthy ? 'healthy' : 'unhealthy',
          to: isHealthy ? 'healthy' : 'unhealthy',
        });

        // Trigger sync when connection is restored
        if (!wasHealthy && isHealthy) {
          console.log('[sync-service][monitoring] Connection restored, triggering sync');
          setTimeout(() => this.triggerAutoSync(), this.syncDelay);
        }

        // Update offline mode
        const offlineStore = this.getOfflineStore();
        offlineStore.setOfflineMode(!isHealthy);
      },
      { immediate: false }
    );
  }

  /**
   * Triggers automatic sync (debounced)
   */
  private async triggerAutoSync(): Promise<void> {
    if (this.isProcessing.value) {
      console.log('[sync-service][auto] Sync already in progress, skipping');
      return;
    }

    const offlineStore = this.getOfflineStore();
    const pendingCount = offlineStore.pendingSyncCount;
    if (pendingCount === 0) {
      console.log('[sync-service][auto] No pending sync operations');
      return;
    }

    console.log('[sync-service][auto] Auto-sync triggered', {
      pendingOperations: pendingCount,
      isOnline: this.getConnectionHealth().isHealthy.value,
    });

    await this.processSyncQueue();
  }

  // ==================== SYNC QUEUE PROCESSING ====================

  /**
   * Processes the sync queue
   */
  async processSyncQueue(): Promise<SyncResult> {
    if (this.isProcessing.value) {
      console.warn('[sync-service][queue] Sync already in progress');
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: ['Sync already in progress'],
        syncedRecordIds: [],
      };
    }

    this.isProcessing.value = true;
    this.lastSyncAttempt.value = new Date();
    this.syncErrors.value = [];

    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const syncedRecordIds: SessionRecordId[] = [];

    try {
      // Check connection health
      const connectionHealth = this.getConnectionHealth();
      if (!connectionHealth.isHealthy.value) {
        throw new Error('Cannot sync while offline');
      }

      const offlineStore = this.getOfflineStore();
      console.log('[sync-service][queue] Starting sync queue processing', {
        pendingOperations: offlineStore.pendingSyncCount,
        timestamp: this.lastSyncAttempt.value,
      });

      // Get sync queue items
      const queueItems = offlineStore.syncQueue;

      if (queueItems.length === 0) {
        console.log('[sync-service][queue] No items to sync');
        return {
          success: true,
          syncedCount: 0,
          failedCount: 0,
          errors: [],
          syncedRecordIds: [],
        };
      }

      // Process queue in batches
      const batches = [];
      for (let i = 0; i < queueItems.length; i += this.batchSize) {
        batches.push(queueItems.slice(i, i + this.batchSize));
      }

      for (const batch of batches) {
        console.log('[sync-service][batch] Processing batch', {
          batchSize: batch.length,
          totalBatches: batches.length,
        });

        // Check for conflicts before processing batch
        const conflicts = await this.detectConflicts(batch);
        if (conflicts.length > 0) {
          console.warn('[sync-service][batch] Conflicts detected, resolving', {
            conflictCount: conflicts.length,
          });

          // Resolve conflicts before continuing
          await this.resolveConflicts(conflicts);
        }

        // Process each item in the batch
        for (const queueItem of batch) {
          try {
            // Convert queue item to SyncOperation format
            const syncOperation = this.mapToSyncOperation(queueItem);
            const result = await this.syncSingleItem(syncOperation);

            if (result.success && result.recordId) {
              syncedCount++;
              syncedRecordIds.push(result.recordId);
              // Pass properly typed SessionRecordId to store
              offlineStore.markSessionSynced(queueItem.sessionData.localId, result.recordId);
            } else {
              failedCount++;

              // Implement retry logic using maxRetries config
              if (syncOperation.retryCount < this.maxRetries) {
                console.warn('[sync-service][retry] Retrying failed sync operation', {
                  localId: queueItem.sessionData.localId,
                  retryCount: syncOperation.retryCount,
                  maxRetries: this.maxRetries,
                });

                // Increment retry count and re-queue
                offlineStore.incrementRetryCount(queueItem.sessionData.localId);
              } else {
                console.error('[sync-service][retry] Max retries exceeded, marking as failed', {
                  localId: queueItem.sessionData.localId,
                  retryCount: syncOperation.retryCount,
                  maxRetries: this.maxRetries,
                });

                offlineStore.markSyncFailed(
                  queueItem.sessionData.localId,
                  result.error || 'Sync operation failed after max retries'
                );
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
            failedCount++;
            errors.push(`${queueItem.sessionData.localId}: ${errorMessage}`);

            offlineStore.markSyncFailed(queueItem.sessionData.localId, errorMessage);
          }
        }
      }

      // Update tracked synced records
      this.syncedRecords.value.push(...syncedRecordIds);

      // Record sync attempt for offline store
      offlineStore.recordSyncAttempt();

      console.log('[sync-service][queue] Sync queue processing completed successfully', {
        syncedCount,
        failedCount,
        totalProcessed: syncedCount + failedCount,
        errors: errors.length,
        syncedRecordIds: syncedRecordIds.length,
      });

      // Reset auto-attempt counter on successful completion
      this.autoAttemptCount = 0;

      return {
        success: true,
        syncedCount,
        failedCount,
        errors,
        syncedRecordIds,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      console.error('[sync-service][queue] Sync queue processing failed', {
        error: errorMessage,
        pendingCount: this.getOfflineStore().pendingSyncCount,
      });

      errors.push(errorMessage);
      this.syncErrors.value.push(errorMessage);

      return {
        success: false,
        syncedCount,
        failedCount,
        errors,
        syncedRecordIds,
      };
    } finally {
      this.isProcessing.value = false;
      this.getOfflineStore().recordSyncAttempt();
    }
  }

  /**
   * Syncs a single queue item
   */
  private async syncSingleItem(
    queueItem: SyncOperation
  ): Promise<{ success: boolean; recordId?: SessionRecordId; error?: string }> {
    const { data, operation, localId, retryCount } = queueItem;

    console.log('[sync-service][item] Syncing single item', {
      localId,
      operation,
      retryCount,
    });

    try {
      if (operation === 'create') {
        const sessionData = data as CreateSessionRecordData;

        // Create mutable session data object for conflict resolution
        const createData: MutableCreateSessionRecordData = {
          session_name: sessionData.session_name,
          started_at: sessionData.started_at,
          start_balance: sessionData.start_balance,
          cards_remaining: sessionData.cards_remaining,
        };

        // Check for naming conflicts
        const existingNames = await hybridSessionRecordingService.getExistingSessionNames();
        if (existingNames.includes(sessionData.session_name)) {
          console.warn('[sync-service][item] Naming conflict detected', {
            sessionName: sessionData.session_name,
          });

          // Auto-resolve by appending timestamp - now possible with mutable type
          createData.session_name = `${sessionData.session_name}_synced_${Date.now()}`;
        }

        // Convert to readonly type for API call
        const finalCreateData: CreateSessionRecordData = {
          session_name: createData.session_name,
          started_at: createData.started_at,
          start_balance: createData.start_balance,
          cards_remaining: createData.cards_remaining,
        };

        const result = await hybridSessionRecordingService.recordSessionStart(finalCreateData);

        if (result.success && result.recordId) {
          // Use createSessionRecordId to ensure proper type safety
          const typedRecordId = this.createTypedSessionRecordId(result.recordId);

          console.log('[sync-service][item] Session created successfully', {
            localId,
            remoteId: typedRecordId,
          });
          return { success: true, recordId: typedRecordId };
        } else {
          console.error('[sync-service][item] Create failed', {
            localId,
            error: result.error,
          });
          return { success: false, error: result.error || 'Create operation failed' };
        }
      } else if (operation === 'update') {
        const endData = data as EndSessionRecordData;

        // For updates, we need the remote ID from the sync operation
        if (!queueItem.remoteId) {
          console.error('[sync-service][item] Update operation missing remote ID', {
            localId,
          });
          return { success: false, error: 'Update operation requires remote session ID' };
        }

        const result = await hybridSessionRecordingService.recordSessionEnd(
          queueItem.remoteId,
          endData
        );

        if (result.success && result.recordId) {
          const typedRecordId = this.createTypedSessionRecordId(result.recordId);

          console.log('[sync-service][item] Session updated successfully', {
            localId,
            remoteId: typedRecordId,
          });
          return { success: true, recordId: typedRecordId };
        } else {
          console.error('[sync-service][item] Update failed', {
            localId,
            error: result.error,
          });
          return { success: false, error: result.error || 'Update operation failed' };
        }
      } else {
        console.error('[sync-service][item] Unknown operation', {
          operation,
          localId,
        });
        return { success: false, error: `Unknown operation: ${operation}` };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown item sync error';
      console.error('[sync-service][item] Item sync failed', {
        localId,
        operation,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Converts offline queue items to SyncOperation format
   */
  private mapToSyncOperation(queueItem: any): SyncOperation {
    const { sessionData, operation, timestamp, retryCount } = queueItem;

    // Create appropriate data based on operation type
    let data: CreateSessionRecordData | EndSessionRecordData;

    if (operation === 'create') {
      data = {
        session_name: sessionData.session_name,
        started_at: sessionData.started_at,
        start_balance: sessionData.start_balance,
        cards_remaining: sessionData.cards_remaining,
      };
    } else {
      // For update operations, create EndSessionRecordData
      data = {
        ended_at: sessionData.ended_at || new Date().toISOString(),
        duration_seconds: sessionData.duration_seconds || 0,
        status: sessionData.status || 'completed',
        end_balance: sessionData.end_balance,
        total_hands: sessionData.total_hands || 0,
      };
    }

    return {
      id: `sync-${sessionData.localId}-${Date.now()}`,
      localId: sessionData.localId,
      operation,
      data,
      timestamp,
      retryCount: retryCount || 0,
    };
  }

  /**
   * Safely creates a SessionRecordId from a string ID
   * Ensures type safety and validates the ID format
   */
  private createTypedSessionRecordId(id: string | SessionRecordId): SessionRecordId {
    // If already typed, return as-is
    if (typeof id === 'object' && '__brand' in id) {
      return id as SessionRecordId;
    }

    // Create typed ID using factory function
    return createSessionRecordId(id as string);
  }

  // ==================== CONFLICT RESOLUTION ====================

  /**
   * Detects conflicts in a batch of sync operations
   */
  private async detectConflicts(batch: any[]): Promise<SyncConflict[]> {
    const conflicts: SyncConflict[] = [];

    try {
      // Get existing session names to check for conflicts
      const existingNames = await hybridSessionRecordingService.getExistingSessionNames();

      for (const queueItem of batch) {
        const { sessionData, operation, timestamp } = queueItem;

        if (operation === 'create') {
          // Check for duplicate session names
          if (existingNames.includes(sessionData.session_name)) {
            // Enhanced duplicate detection using time threshold
            const creationTime = new Date(timestamp).getTime();
            const currentTime = Date.now();
            const timeDiff = currentTime - creationTime;

            console.log('[sync-service][conflict-detection] Potential duplicate detected', {
              sessionName: sessionData.session_name,
              timeDifference: timeDiff,
              threshold: this.duplicateTimeThreshold,
              localId: sessionData.localId,
            });

            // Only consider it a conflict if within the time threshold
            if (timeDiff <= this.duplicateTimeThreshold) {
              conflicts.push({
                localId: sessionData.localId,
                operation: 'create',
                localData: sessionData,
                remoteData: { session_name: sessionData.session_name },
                conflictType: 'duplicate_name',
                resolution: 'local_wins', // Will auto-rename
              });
            } else {
              console.log(
                '[sync-service][conflict-detection] Duplicate outside time threshold, allowing',
                {
                  sessionName: sessionData.session_name,
                  timeDifference: timeDiff,
                  threshold: this.duplicateTimeThreshold,
                }
              );
            }
          }
        }
      }

      console.log('[sync-service][conflict-detection] Conflict detection completed', {
        batchSize: batch.length,
        conflictsFound: conflicts.length,
        duplicateTimeThreshold: this.duplicateTimeThreshold,
      });

      return conflicts;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown conflict detection error';
      console.error('[sync-service][conflict-detection] Failed to detect conflicts', {
        error: errorMessage,
        batchSize: batch.length,
      });
      return [];
    }
  }

  /**
   * Detects and resolves sync conflicts
   */
  private async resolveConflicts(conflicts: SyncConflict[]): Promise<void> {
    console.log('[sync-service][conflict-resolution] Resolving conflicts', {
      conflictCount: conflicts.length,
      currentAttempts: this.autoAttemptCount,
      maxAutoAttempts: this.maxAutoAttempts,
    });

    // Check if we've exceeded max auto-resolution attempts
    if (this.autoAttemptCount >= this.maxAutoAttempts) {
      console.warn('[sync-service][conflict-resolution] Max auto-resolution attempts exceeded', {
        currentAttempts: this.autoAttemptCount,
        maxAttempts: this.maxAutoAttempts,
      });
      return;
    }

    for (const conflict of conflicts) {
      try {
        if (conflict.conflictType === 'duplicate_name' && conflict.operation === 'create') {
          // Auto-resolve naming conflicts by appending timestamp
          const originalName = conflict.localData.session_name;
          const newName = `${originalName}_synced_${Date.now()}`;

          console.log('[sync-service][conflict-resolution] Resolving naming conflict', {
            localId: conflict.localId,
            originalName,
            newName,
            attemptNumber: this.autoAttemptCount + 1,
            maxAttempts: this.maxAutoAttempts,
          });

          // Update the local data with resolved name
          conflict.localData.session_name = newName;
          conflict.resolution = 'local_wins';

          // Increment auto-attempt counter
          this.autoAttemptCount++;
        }

        // Store resolved conflict for tracking
        this.conflicts.value.push(conflict);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown conflict resolution error';
        console.error('[sync-service][conflict-resolution] Failed to resolve conflict', {
          localId: conflict.localId,
          conflictType: conflict.conflictType,
          error: errorMessage,
        });
      }
    }
  }

  // ==================== PUBLIC API ====================

  /**
   * Manually triggers sync
   */
  async manualSync(): Promise<SyncResult> {
    console.log('[sync-service][manual] Manual sync triggered');
    return await this.processSyncQueue();
  }

  /**
   * Gets sync status
   */
  getSyncStatus() {
    return {
      isProcessing: this.isProcessing.value,
      lastSyncAttempt: this.lastSyncAttempt.value,
      pendingCount: this.getOfflineStore().pendingSyncCount,
      hasErrors: this.syncErrors.value.length > 0,
      errorCount: this.syncErrors.value.length,
      conflictCount: this.conflicts.value.length,
      syncedRecordCount: this.syncedRecords.value.length,
    };
  }

  /**
   * Gets successfully synced record IDs
   */
  getSyncedRecords(): SessionRecordId[] {
    return [...this.syncedRecords.value];
  }

  /**
   * Clears sync errors
   */
  clearSyncErrors(): void {
    this.syncErrors.value = [];
    this.getOfflineStore().clearSyncErrors();
    console.log('[sync-service][cleanup] Sync errors cleared');
  }

  /**
   * Clears synced records tracking
   */
  clearSyncedRecords(): void {
    this.syncedRecords.value = [];
    console.log('[sync-service][cleanup] Synced records tracking cleared');
  }

  /**
   * Gets sync errors
   */
  getSyncErrors(): string[] {
    return [...this.syncErrors.value];
  }

  /**
   * Gets conflicts
   */
  getConflicts(): SyncConflict[] {
    return [...this.conflicts.value];
  }

  /**
   * Resets auto-resolution attempt counter
   */
  resetAutoAttemptCounter(): void {
    this.autoAttemptCount = 0;
    console.log('[sync-service][cleanup] Auto-attempt counter reset');
  }
}

// ==================== SINGLETON EXPORT ====================

export const sessionSyncService = new SessionSyncService();
