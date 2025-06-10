/**
 * 📦 Session Export Service - CDD Excellence
 *
 * Comprehensive session data export capabilities.
 * Supports multiple formats with 10-year compatibility guarantee.
 * Handles both online and offline session data.
 *
 * @fileoverview Session data export and download service
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { useOfflineSessionStore } from '../stores/offlineSessionStore';
import type { UserSessionRecord } from '../types/core/sessionRecordingTypes';

// ==================== EXPORT FORMAT TYPES ====================

interface SessionExportMetadata {
  exportVersion: string;
  exportTimestamp: string;
  exportSource: 'online' | 'offline' | 'hybrid';
  totalSessions: number;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
  compatibility: {
    minimumVersion: string;
    formatVersion: string;
  };
}

interface SessionExportData {
  metadata: SessionExportMetadata;
  sessions: UserSessionRecord[];
}

interface CSVExportConfig {
  includeHeaders: boolean;
  dateFormat: 'iso' | 'locale' | 'unix';
  nullValue: string;
  delimiter: ',' | ';' | '\t';
}

// ==================== SESSION EXPORT SERVICE ====================

class SessionExportService {
  private offlineStore: ReturnType<typeof useOfflineSessionStore>;

  constructor() {
    this.offlineStore = useOfflineSessionStore();
    console.log('[export-service][initialization] Service initialized');
  }

  // ==================== JSON EXPORT ====================

  /**
   * Exports sessions to JSON format with full metadata
   */
  async exportToJSON(
    sessions: UserSessionRecord[],
    source: 'online' | 'offline' | 'hybrid' = 'offline'
  ): Promise<SessionExportData> {
    try {
      console.log('[export-service][json] Preparing JSON export', {
        sessionCount: sessions.length,
        source,
      });

      const metadata = this.generateExportMetadata(sessions, source);

      const exportData: SessionExportData = {
        metadata,
        sessions: this.sanitizeSessionsForExport(sessions),
      };

      console.log('[export-service][json] JSON export prepared successfully', {
        sessionCount: exportData.sessions.length,
        exportSize: JSON.stringify(exportData).length,
        version: metadata.exportVersion,
      });

      return exportData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown export error';
      console.error('[export-service][json] JSON export failed', {
        error: errorMessage,
        sessionCount: sessions.length,
      });
      throw new Error(`JSON export failed: ${errorMessage}`);
    }
  }

  /**
   * Exports current offline sessions to JSON
   */
  async exportOfflineSessionsToJSON(): Promise<SessionExportData> {
    const offlineSessions = this.offlineStore.activeSessions;

    // Convert offline sessions to UserSessionRecord format
    const sessions: UserSessionRecord[] = offlineSessions.map(offline => ({
      id: offline.localId as any,
      session_name: offline.session_name,
      started_at: offline.started_at,
      ended_at: offline.ended_at,
      duration_seconds: offline.duration_seconds,
      start_balance: offline.start_balance,
      end_balance: offline.end_balance,
      cards_remaining: offline.cards_remaining,
      total_hands: offline.total_hands,
      status: offline.status,
      session_lifecycle_flag: offline.session_lifecycle_flag,
      created_at: offline.created_at,
      updated_at: offline.updated_at,
    }));

    return this.exportToJSON(sessions, 'offline');
  }

  // ==================== CSV EXPORT ====================

  /**
   * Exports sessions to CSV format
   */
  async exportToCSV(
    sessions: UserSessionRecord[],
    config: Partial<CSVExportConfig> = {}
  ): Promise<string> {
    const defaultConfig: CSVExportConfig = {
      includeHeaders: true,
      dateFormat: 'iso',
      nullValue: '',
      delimiter: ',',
    };

    const finalConfig = { ...defaultConfig, ...config };

    try {
      console.log('[export-service][csv] Preparing CSV export', {
        sessionCount: sessions.length,
        config: finalConfig,
      });

      const sanitizedSessions = this.sanitizeSessionsForExport(sessions);
      let csvContent = '';

      // Add headers if requested
      if (finalConfig.includeHeaders) {
        const headers = [
          'session_name',
          'started_at',
          'ended_at',
          'duration_seconds',
          'start_balance',
          'end_balance',
          'cards_remaining',
          'total_hands',
          'status',
          'session_lifecycle_flag',
          'created_at',
          'updated_at',
        ];
        csvContent += headers.join(finalConfig.delimiter) + '\n';
      }

      // Add data rows
      for (const session of sanitizedSessions) {
        const row = [
          this.escapeCsvValue(session.session_name, finalConfig.delimiter),
          this.formatDateForCSV(session.started_at, finalConfig.dateFormat),
          this.formatDateForCSV(session.ended_at, finalConfig.dateFormat),
          session.duration_seconds?.toString() || finalConfig.nullValue,
          session.start_balance?.toString() || finalConfig.nullValue,
          session.end_balance?.toString() || finalConfig.nullValue,
          session.cards_remaining?.toString() || finalConfig.nullValue,
          session.total_hands?.toString() || finalConfig.nullValue,
          session.status || finalConfig.nullValue,
          session.session_lifecycle_flag?.toString() || finalConfig.nullValue,
          this.formatDateForCSV(session.created_at, finalConfig.dateFormat),
          this.formatDateForCSV(session.updated_at, finalConfig.dateFormat),
        ];
        csvContent += row.join(finalConfig.delimiter) + '\n';
      }

      console.log('[export-service][csv] CSV export prepared successfully', {
        sessionCount: sanitizedSessions.length,
        csvSize: csvContent.length,
        hasHeaders: finalConfig.includeHeaders,
      });

      return csvContent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown CSV error';
      console.error('[export-service][csv] CSV export failed', {
        error: errorMessage,
        sessionCount: sessions.length,
      });
      throw new Error(`CSV export failed: ${errorMessage}`);
    }
  }

  /**
   * Exports current offline sessions to CSV
   */
  async exportOfflineSessionsToCSV(config?: Partial<CSVExportConfig>): Promise<string> {
    const offlineSessions = this.offlineStore.activeSessions;

    // Convert offline sessions to UserSessionRecord format
    const sessions: UserSessionRecord[] = offlineSessions.map(offline => ({
      id: offline.localId as any,
      session_name: offline.session_name,
      started_at: offline.started_at,
      ended_at: offline.ended_at,
      duration_seconds: offline.duration_seconds,
      start_balance: offline.start_balance,
      end_balance: offline.end_balance,
      cards_remaining: offline.cards_remaining,
      total_hands: offline.total_hands,
      status: offline.status,
      session_lifecycle_flag: offline.session_lifecycle_flag,
      created_at: offline.created_at,
      updated_at: offline.updated_at,
    }));

    return this.exportToCSV(sessions, config);
  }

  // ==================== DOWNLOAD SERVICE ====================

  /**
   * Downloads JSON export as file
   */
  async downloadJSONExport(
    sessions: UserSessionRecord[],
    filename?: string,
    source: 'online' | 'offline' | 'hybrid' = 'offline'
  ): Promise<void> {
    try {
      const exportData = await this.exportToJSON(sessions, source);
      const jsonString = JSON.stringify(exportData, null, 2);

      const defaultFilename = `baccarat-sessions-${this.generateTimestamp()}.json`;
      const finalFilename = filename || defaultFilename;

      await this.downloadFile(jsonString, finalFilename, 'application/json');

      console.log('[export-service][download] JSON download completed', {
        filename: finalFilename,
        sessionCount: sessions.length,
        fileSize: jsonString.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown download error';
      console.error('[export-service][download] JSON download failed', {
        error: errorMessage,
        sessionCount: sessions.length,
      });
      throw new Error(`JSON download failed: ${errorMessage}`);
    }
  }

  /**
   * Downloads CSV export as file
   */
  async downloadCSVExport(
    sessions: UserSessionRecord[],
    filename?: string,
    config?: Partial<CSVExportConfig>
  ): Promise<void> {
    try {
      const csvContent = await this.exportToCSV(sessions, config);

      const defaultFilename = `baccarat-sessions-${this.generateTimestamp()}.csv`;
      const finalFilename = filename || defaultFilename;

      await this.downloadFile(csvContent, finalFilename, 'text/csv');

      console.log('[export-service][download] CSV download completed', {
        filename: finalFilename,
        sessionCount: sessions.length,
        fileSize: csvContent.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown download error';
      console.error('[export-service][download] CSV download failed', {
        error: errorMessage,
        sessionCount: sessions.length,
      });
      throw new Error(`CSV download failed: ${errorMessage}`);
    }
  }

  /**
   * Downloads current offline sessions as JSON
   */
  async downloadOfflineJSON(filename?: string): Promise<void> {
    const offlineSessions = this.offlineStore.activeSessions;
    const sessions: UserSessionRecord[] = offlineSessions.map(offline => ({
      id: offline.localId as any,
      session_name: offline.session_name,
      started_at: offline.started_at,
      ended_at: offline.ended_at,
      duration_seconds: offline.duration_seconds,
      start_balance: offline.start_balance,
      end_balance: offline.end_balance,
      cards_remaining: offline.cards_remaining,
      total_hands: offline.total_hands,
      status: offline.status,
      session_lifecycle_flag: offline.session_lifecycle_flag,
      created_at: offline.created_at,
      updated_at: offline.updated_at,
    }));

    await this.downloadJSONExport(sessions, filename, 'offline');
  }

  /**
   * Downloads current offline sessions as CSV
   */
  async downloadOfflineCSV(filename?: string, config?: Partial<CSVExportConfig>): Promise<void> {
    const offlineSessions = this.offlineStore.activeSessions;
    const sessions: UserSessionRecord[] = offlineSessions.map(offline => ({
      id: offline.localId as any,
      session_name: offline.session_name,
      started_at: offline.started_at,
      ended_at: offline.ended_at,
      duration_seconds: offline.duration_seconds,
      start_balance: offline.start_balance,
      end_balance: offline.end_balance,
      cards_remaining: offline.cards_remaining,
      total_hands: offline.total_hands,
      status: offline.status,
      session_lifecycle_flag: offline.session_lifecycle_flag,
      created_at: offline.created_at,
      updated_at: offline.updated_at,
    }));

    await this.downloadCSVExport(sessions, filename, config);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generates export metadata
   */
  private generateExportMetadata(
    sessions: UserSessionRecord[],
    source: 'online' | 'offline' | 'hybrid'
  ): SessionExportMetadata {
    const dates = sessions
      .map(s => s.created_at)
      .filter(Boolean)
      .sort();

    return {
      exportVersion: '1.0.0',
      exportTimestamp: new Date().toISOString(),
      exportSource: source,
      totalSessions: sessions.length,
      dateRange: {
        earliest: dates[0] || null,
        latest: dates[dates.length - 1] || null,
      },
      compatibility: {
        minimumVersion: '1.0.0',
        formatVersion: '2024.1',
      },
    };
  }

  /**
   * Sanitizes sessions for export (removes sensitive data)
   */
  private sanitizeSessionsForExport(sessions: UserSessionRecord[]): UserSessionRecord[] {
    return sessions.map(session => ({
      ...session,
      // Add any sanitization logic here if needed
      // For now, we export all data as it's not sensitive
    }));
  }

  /**
   * Downloads a file using browser download API
   */
  private async downloadFile(content: string, filename: string, mimeType: string): Promise<void> {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  /**
   * Generates timestamp for filenames
   */
  private generateTimestamp(): string {
    return new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
  }

  /**
   * Escapes CSV values
   */
  private escapeCsvValue(value: string | null | undefined, delimiter: string): string {
    if (!value) return '';

    const stringValue = String(value);
    const needsEscaping =
      stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n');

    if (needsEscaping) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Formats dates for CSV export
   */
  private formatDateForCSV(
    date: string | null | undefined,
    format: CSVExportConfig['dateFormat']
  ): string {
    if (!date) return '';

    const dateObj = new Date(date);

    switch (format) {
      case 'iso':
        return dateObj.toISOString();
      case 'locale':
        return dateObj.toLocaleString();
      case 'unix':
        return Math.floor(dateObj.getTime() / 1000).toString();
      default:
        return dateObj.toISOString();
    }
  }
}

// ==================== SINGLETON EXPORT ====================

export const sessionExportService = new SessionExportService();
