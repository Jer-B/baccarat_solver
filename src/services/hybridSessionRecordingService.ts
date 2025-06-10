/**
 * 🔄 Hybrid Session Recording Service - CDD Excellence
 *
 * Intelligent routing between online and offline session recording.
 * Provides seamless switching based on connection health.
 * Maintains API compatibility with existing code.
 *
 * @fileoverview Hybrid online/offline session recording
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { sessionRecordingService } from './sessionRecordingService';
import { offlineSessionRecordingService } from './offlineSessionRecordingService';
import { useSupabaseConnectionHealth } from '../composables/useSupabaseConnectionHealth';
import { useOfflineSessionStore } from '../stores/offlineSessionStore';
import type {
  CreateSessionRecordData,
  EndSessionRecordData,
  SessionRecordingResult,
  SessionRecordId,
  UserSessionRecord,
} from '../types/core/sessionRecordingTypes';

// ==================== HYBRID ROUTING STRATEGY ====================

class HybridSessionRecordingService {
  private _connectionHealth: ReturnType<typeof useSupabaseConnectionHealth> | null = null;
  private _offlineStore: ReturnType<typeof useOfflineSessionStore> | null = null;
  private _initialized = false;

  constructor() {
    // Don't initialize stores in constructor to avoid Pinia timing issues
    console.log('[hybrid-recording][initialization] Hybrid service created (lazy init)', {
      onlineAvailable: true,
      offlineAvailable: true,
    });
  }

  // ==================== LAZY INITIALIZATION ====================

  /**
   * Gets connection health instance with lazy initialization
   */
  private get connectionHealth(): ReturnType<typeof useSupabaseConnectionHealth> {
    if (!this._connectionHealth) {
      this._connectionHealth = useSupabaseConnectionHealth();
      console.log('[hybrid-recording][lazy-init] Connection health initialized');
    }
    return this._connectionHealth;
  }

  /**
   * Gets offline store instance with lazy initialization
   */
  private get offlineStore(): ReturnType<typeof useOfflineSessionStore> {
    if (!this._offlineStore) {
      this._offlineStore = useOfflineSessionStore();
      console.log('[hybrid-recording][lazy-init] Offline store initialized');
    }
    return this._offlineStore;
  }

  /**
   * Ensures all services are initialized
   */
  private ensureInitialized(): void {
    if (!this._initialized) {
      // Trigger lazy initialization by accessing getters
      this.connectionHealth;
      this.offlineStore;

      // Setup connection monitoring after initialization
      this.setupConnectionMonitoring();

      this._initialized = true;
      console.log('[hybrid-recording][initialization] Full initialization complete');
    }
  }

  // ==================== CONNECTION MONITORING ====================

  /**
   * Sets up connection monitoring for automatic mode switching
   */
  private setupConnectionMonitoring(): void {
    // Watch connection status changes
    const connectionStatus = this.connectionHealth.connectionStatus;

    // Initial mode setup
    const isOnline = connectionStatus.value === 'healthy';
    this.offlineStore.setOfflineMode(!isOnline);

    console.log('[hybrid-recording][monitoring] Connection monitoring setup', {
      initialMode: isOnline ? 'online' : 'offline',
      connectionStatus: connectionStatus.value,
    });

    // Note: In a real implementation, we'd watch the connectionStatus reactive ref
    // For now, we'll check on each operation
  }

  /**
   * Determines which service to use based on connection health
   */
  private shouldUseOnlineService(): boolean {
    this.ensureInitialized();

    const isHealthy = this.connectionHealth.isHealthy.value;
    const connectionStatus = this.connectionHealth.connectionStatus.value;

    console.log('[hybrid-recording][routing] Service routing decision', {
      isHealthy,
      connectionStatus,
      selectedService: isHealthy ? 'online' : 'offline',
    });

    // Update offline mode based on connection
    this.offlineStore.setOfflineMode(!isHealthy);

    return isHealthy;
  }

  // ==================== SESSION START RECORDING ====================

  /**
   * Records session start using appropriate service
   */
  async recordSessionStart(
    data: CreateSessionRecordData
  ): Promise<SessionRecordingResult<UserSessionRecord>> {
    this.ensureInitialized();
    const useOnline = this.shouldUseOnlineService();

    try {
      console.log('[hybrid-recording][start] Recording session start', {
        sessionName: data.session_name,
        selectedService: useOnline ? 'online' : 'offline',
        timestamp: data.started_at,
      });

      let result: SessionRecordingResult<UserSessionRecord>;

      if (useOnline) {
        // Try online service first
        result = await sessionRecordingService.recordSessionStart(data);

        // If online fails, fallback to offline
        if (!result.success) {
          console.warn('[hybrid-recording][start] Online service failed, falling back to offline', {
            error: result.error,
          });

          result = await offlineSessionRecordingService.recordSessionStart(data);

          if (result.success) {
            console.log('[hybrid-recording][start] Fallback to offline successful');
          }
        } else {
          console.log('[hybrid-recording][start] Online service successful');
        }
      } else {
        // Use offline service directly
        result = await offlineSessionRecordingService.recordSessionStart(data);

        if (result.success) {
          console.log('[hybrid-recording][start] Offline service successful');
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown hybrid error';
      console.error('[hybrid-recording][start] Hybrid service error', {
        error: errorMessage,
        useOnline,
      });

      return {
        success: false,
        error: `Hybrid session start failed: ${errorMessage}`,
      };
    }
  }

  // ==================== SESSION END RECORDING ====================

  /**
   * Records session end using appropriate service
   */
  async recordSessionEnd(
    recordId: SessionRecordId,
    data: EndSessionRecordData
  ): Promise<SessionRecordingResult<UserSessionRecord>> {
    const useOnline = this.shouldUseOnlineService();

    try {
      console.log('[hybrid-recording][end] Recording session end', {
        recordId,
        selectedService: useOnline ? 'online' : 'offline',
        duration: data.duration_seconds,
        status: data.status,
      });

      let result: SessionRecordingResult<UserSessionRecord>;

      // Determine if this is an offline session ID
      const isOfflineSession = typeof recordId === 'string' && recordId.startsWith('offline-');

      if (isOfflineSession) {
        // Always use offline service for offline sessions
        console.log('[hybrid-recording][end] Detected offline session, using offline service');
        result = await offlineSessionRecordingService.recordSessionEnd(recordId, data);
      } else if (useOnline) {
        // Try online service for online sessions
        result = await sessionRecordingService.recordSessionEnd(recordId, data);

        // If online fails, we don't fallback for end operations as the session
        // was created online and must be completed online
        if (!result.success) {
          console.error('[hybrid-recording][end] Online session end failed', {
            error: result.error,
            recordId,
          });
        } else {
          console.log('[hybrid-recording][end] Online session end successful');
        }
      } else {
        // Connection is down, but this might be an online session
        // Store the end operation for later sync
        console.warn('[hybrid-recording][end] Connection down, cannot end online session', {
          recordId,
        });

        result = {
          success: false,
          error: 'Cannot end online session while offline. Connection required.',
        };
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown hybrid error';
      console.error('[hybrid-recording][end] Hybrid service error', {
        error: errorMessage,
        recordId,
        useOnline,
      });

      return {
        success: false,
        error: `Hybrid session end failed: ${errorMessage}`,
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Gets existing session names from appropriate service
   */
  async getExistingSessionNames(): Promise<string[]> {
    this.ensureInitialized();
    const useOnline = this.shouldUseOnlineService();

    try {
      console.log('[hybrid-recording][utility] Getting session names', {
        selectedService: useOnline ? 'online' : 'offline',
      });

      let sessionNames: string[];

      if (useOnline) {
        // Try online first, fallback to offline
        try {
          sessionNames = await sessionRecordingService.getExistingSessionNames();
          console.log('[hybrid-recording][utility] Online session names retrieved', {
            count: sessionNames.length,
          });
        } catch (error) {
          console.warn('[hybrid-recording][utility] Online failed, using offline', error);
          sessionNames = await offlineSessionRecordingService.getExistingSessionNames();
        }
      } else {
        // Use offline directly
        sessionNames = await offlineSessionRecordingService.getExistingSessionNames();
        console.log('[hybrid-recording][utility] Offline session names retrieved', {
          count: sessionNames.length,
        });
      }

      return sessionNames;
    } catch (error) {
      console.error('[hybrid-recording][utility] Failed to get session names', error);
      return [];
    }
  }

  /**
   * Checks connection using connection health composable
   */
  async checkConnection(): Promise<boolean> {
    this.ensureInitialized();
    const isHealthy = await this.connectionHealth.checkConnection();

    console.log('[hybrid-recording][connection] Connection check result', {
      isHealthy,
      timestamp: new Date().toISOString(),
    });

    return isHealthy;
  }

  // ==================== HYBRID-SPECIFIC METHODS ====================

  /**
   * Gets current mode (online/offline)
   */
  getCurrentMode(): 'online' | 'offline' {
    this.ensureInitialized();
    return this.shouldUseOnlineService() ? 'online' : 'offline';
  }

  /**
   * Gets connection status details
   */
  getConnectionStatus() {
    this.ensureInitialized();
    return {
      isHealthy: this.connectionHealth.isHealthy.value,
      connectionStatus: this.connectionHealth.connectionStatus.value,
      lastChecked: this.connectionHealth.lastChecked.value,
      lastError: this.connectionHealth.lastError.value,
      currentMode: this.getCurrentMode(),
    };
  }

  /**
   * Gets offline statistics
   */
  getOfflineStats() {
    this.ensureInitialized();
    return offlineSessionRecordingService.getOfflineStats();
  }

  /**
   * Forces a connection retry
   */
  async retryConnection(): Promise<boolean> {
    this.ensureInitialized();
    console.log('[hybrid-recording][retry] Manual connection retry');
    return await this.connectionHealth.retryConnection();
  }

  /**
   * Gets pending sync operations
   */
  getPendingSyncCount(): number {
    this.ensureInitialized();
    return offlineSessionRecordingService.getPendingSyncCount();
  }

  /**
   * Clears all offline data - DESTRUCTIVE OPERATION
   * WARNING: This cannot be undone!
   */
  clearAllOfflineData(): void {
    this.ensureInitialized();
    console.warn('[hybrid-recording][cleanup] Clearing ALL offline data - DESTRUCTIVE OPERATION');
    offlineSessionRecordingService.clearAllOfflineData();
    console.warn('[hybrid-recording][cleanup] ALL offline data has been cleared');
  }

  /**
   * Manual sync trigger - delegates to session sync service
   */
  async triggerSync(): Promise<void> {
    this.ensureInitialized();
    console.log('[hybrid-recording][sync] Manual sync trigger requested');

    try {
      // Import and use the existing session sync service
      const { sessionSyncService } = await import('./sessionSyncService');
      const result = await sessionSyncService.manualSync();

      console.log('[hybrid-recording][sync] Manual sync completed', {
        success: result.success,
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        errors: result.errors.length,
      });

      if (!result.success) {
        console.warn('[hybrid-recording][sync] Sync completed with errors', {
          errors: result.errors,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      console.error('[hybrid-recording][sync] Manual sync failed', {
        error: errorMessage,
      });
      throw error;
    }
  }
}

// ==================== SINGLETON EXPORT ====================

export const hybridSessionRecordingService = new HybridSessionRecordingService();
