/**
 * 🎯 Session Naming Service - CDD Excellence
 *
 * Business logic for sequential session naming with database lookup.
 * Handles session number calculation, validation, and error recovery.
 *
 * @fileoverview Session naming business logic service
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { SESSION_NAMING } from '../config/sessionConfig';

// ==================== TYPES ====================

export interface SessionNameQueryFn {
  (): Promise<string[]>;
}

export interface SessionNamingResult {
  sessionName: string;
  sessionNumber: number;
  source: 'sequential' | 'fallback';
  existingCount: number;
}

// ==================== SESSION NAMING SERVICE ====================

class SessionNamingService {
  // ==================== NUMBER CALCULATION ====================

  /**
   * Get next available session number by checking existing sessions
   */
  async getNextSessionNumber(queryFn: SessionNameQueryFn): Promise<number> {
    try {
      console.log('[session-naming][service] Querying existing session names');

      const existingNames = await queryFn();

      // Validate query result
      if (!Array.isArray(existingNames)) {
        console.warn(
          '[session-naming][service] Invalid query result, not an array. Defaulting to 1'
        );
        return 1;
      }

      // Filter valid string names
      const validNames = existingNames.filter(name => typeof name === 'string' && name.length > 0);

      console.log('[session-naming][service] Found valid session names', {
        total: existingNames.length,
        valid: validNames.length,
        names: validNames.slice(0, 5), // Log first 5 for debugging
      });

      if (validNames.length === 0) {
        console.log('[session-naming][service] No existing sessions found, starting with 1');
        return 1; // First session
      }

      // Extract numbers from existing session names
      const existingNumbers = validNames
        .map(name => {
          const match = name.match(SESSION_NAMING.NUMBER_PATTERN);
          if (match) {
            const number = parseInt(match[1], 10);
            if (isNaN(number) || number <= 0 || number > 999999) {
              console.warn('[session-naming][service] Invalid session number extracted', {
                name,
                number,
              });
              return 0;
            }
            return number;
          }
          return 0;
        })
        .filter(num => num > 0)
        .sort((a, b) => b - a); // Sort descending

      console.log('[session-naming][service] Extracted session numbers', {
        numbers: existingNumbers.slice(0, 10), // Log first 10
        highest: existingNumbers[0] || 0,
      });

      // Return highest number + 1, or 1 if no valid numbers found
      const nextNumber = existingNumbers.length > 0 ? existingNumbers[0] + 1 : 1;

      console.log('[session-naming][service] Next session number calculated', { nextNumber });

      return nextNumber;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[session-naming][service] Error getting next session number', {
        error: errorMessage,
        fallbackNumber: 1,
      });
      return 1; // Fallback to session 1
    }
  }

  // ==================== SESSION NAME GENERATION ====================

  /**
   * Generate sequential session name with date and time: Session {number} {MMDD}-{HH:MM}
   * Example: "Session 7 0609-13:09"
   */
  async generateSequentialSessionName(queryFn: SessionNameQueryFn): Promise<SessionNamingResult> {
    try {
      const existingNames = await queryFn();
      const nextNumber = await this.getNextSessionNumber(queryFn);

      // Generate date and time components
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      // Format: "Session {number} {MMDD}-{HH:MM}"
      const sessionName = `${SESSION_NAMING.PREFIX} ${nextNumber} ${month}${day}-${hours}:${minutes}`;

      console.log('[session-naming][service] Sequential session name with date/time generated', {
        sessionName,
        sessionNumber: nextNumber,
        existingCount: Array.isArray(existingNames) ? existingNames.length : 0,
        dateTime: `${month}${day}-${hours}:${minutes}`,
      });

      return {
        sessionName,
        sessionNumber: nextNumber,
        source: 'sequential',
        existingCount: Array.isArray(existingNames) ? existingNames.length : 0,
      };
    } catch (error) {
      console.error('[session-naming][service] Sequential naming failed', error);
      throw error;
    }
  }

  /**
   * Generate session name - always uses sequential format with date/time
   * No fallback format as requested by user
   */
  async generateSessionName(queryFn?: SessionNameQueryFn): Promise<string> {
    if (!queryFn) {
      throw new Error(
        'Session name generation requires a query function - no fallback format allowed'
      );
    }

    // Always use sequential format with date/time
    const result = await this.generateSequentialSessionName(queryFn);
    return result.sessionName;
  }

  // ==================== VALIDATION UTILITIES ====================

  /**
   * Extract session number from session name
   */
  extractSessionNumber(sessionName: string): number | null {
    try {
      const match = sessionName.match(SESSION_NAMING.NUMBER_PATTERN);
      if (match) {
        const number = parseInt(match[1], 10);
        return isNaN(number) || number <= 0 ? null : number;
      }
      return null;
    } catch (error) {
      console.warn('[session-naming][service] Error extracting session number', {
        sessionName,
        error,
      });
      return null;
    }
  }

  /**
   * Validate session name format
   */
  isValidSessionName(sessionName: string): boolean {
    if (!sessionName || typeof sessionName !== 'string') {
      return false;
    }

    const trimmed = sessionName.trim();
    if (
      trimmed.length < SESSION_NAMING.VALIDATION.MIN_LENGTH ||
      trimmed.length > SESSION_NAMING.VALIDATION.MAX_LENGTH
    ) {
      return false;
    }

    // Check format pattern - only new format: "Session {number} {MMDD}-{HH:MM}"
    const sequentialPattern = /^Session\s+\d+\s+\d{4}-\d{2}:\d{2}$/;

    return sequentialPattern.test(trimmed);
  }

  // ==================== ANALYSIS UTILITIES ====================

  /**
   * Analyze existing session names and provide insights
   */
  async analyzeExistingSessions(queryFn: SessionNameQueryFn) {
    try {
      const existingNames = await queryFn();

      const analysis = {
        total: existingNames.length,
        valid: 0,
        sequential: 0,
        fallback: 0,
        numbers: [] as number[],
        gaps: [] as number[],
        highest: 0,
        nextAvailable: 1,
      };

      const validNames = existingNames.filter(name => typeof name === 'string' && name.length > 0);
      analysis.valid = validNames.length;

      validNames.forEach(name => {
        // Check for new format: "Session {number} {MMDD}-{HH:MM}"
        if (/^Session\s+\d+\s+\d{4}-\d{2}:\d{2}$/.test(name)) {
          analysis.sequential++;
          const number = this.extractSessionNumber(name);
          if (number) {
            analysis.numbers.push(number);
          }
        }
        // Note: Only new format is supported
      });

      // Sort numbers and find gaps
      analysis.numbers.sort((a, b) => a - b);
      analysis.highest = analysis.numbers.length > 0 ? Math.max(...analysis.numbers) : 0;
      analysis.nextAvailable = analysis.highest + 1;

      // Find gaps in sequence
      for (let i = 1; i < analysis.highest; i++) {
        if (!analysis.numbers.includes(i)) {
          analysis.gaps.push(i);
        }
      }

      console.log('[session-naming][service] Session analysis completed', analysis);

      return analysis;
    } catch (error) {
      console.error('[session-naming][service] Analysis failed', error);
      throw error;
    }
  }
}

// ==================== SINGLETON EXPORT ====================

export const sessionNamingService = new SessionNamingService();
export type { SessionNamingService };
