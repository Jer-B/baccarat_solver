import { supabase } from '../lib/supabase';

// Dynamic import for notifications to avoid circular dependencies
let notificationsModule: typeof import('../composables/useNotifications') | null = null;
const getNotifications = async (): Promise<
  ReturnType<typeof import('../composables/useNotifications').useNotifications>
> => {
  if (!notificationsModule) {
    notificationsModule = await import('../composables/useNotifications');
  }
  return notificationsModule.useNotifications();
};

export interface UserSession {
  id: string;
  session_name: string;
  status: 'active' | 'completed' | 'interrupted';
  session_lifecycle_flag: number; // 1=active, 2=completed, 3=interrupted
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  total_hands: number;
  cards_remaining: number | null;
  start_balance: number | null;
  end_balance: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionData {
  session_name?: string;
  started_at: string;
  start_balance?: number;
}

export interface ImportSessionData {
  session_name: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  total_hands: number;
  cards_remaining?: number | null;
  start_balance?: number | null;
  end_balance?: number | null;
  status: 'active' | 'completed' | 'interrupted';
  session_lifecycle_flag?: number; // Optional for imports
}

export interface UpdateSessionData {
  session_name?: string;
  ended_at?: string;
  duration_seconds?: number;
  total_hands?: number;
  cards_remaining?: number;
  end_balance?: number;
  status?: 'active' | 'completed' | 'interrupted';
  session_lifecycle_flag?: number; // 1=active, 2=completed, 3=interrupted
}

/**
 * Service for managing user gaming sessions in Supabase
 * Records session start/end times, duration, and basic analytics
 */
export class SessionService {
  /**
   * Create a new gaming session record
   */
  async createSession(data: CreateSessionData): Promise<UserSession> {
    console.log('[session-tracking][persistence] Creating new session', { data });

    const sessionData = {
      session_name: data.session_name || `Session ${new Date().toLocaleString()}`,
      started_at: data.started_at,
      status: 'active' as const,
      session_lifecycle_flag: 1, // 1 = active session
      total_hands: 0,
      ended_at: null,
      duration_seconds: null,
      start_balance: data.start_balance || null,
    };

    const { data: session, error } = await supabase
      .from('user_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('[session-tracking][error] Failed to create session', { error, sessionData });

      // Show toast notification for the error
      try {
        const { error: errorNotification } = await getNotifications();
        errorNotification('Failed to save session to database');
      } catch (notifError) {
        console.warn('[session-tracking][error] Failed to show error notification', { notifError });
      }

      throw new Error(`Failed to create session: ${error.message}`);
    }

    console.log('[session-tracking][persistence] Session created successfully', {
      sessionId: session.id,
    });
    return session;
  }

  /**
   * Import a session with complete data (for import functionality)
   */
  async importSession(data: ImportSessionData): Promise<UserSession> {
    console.log('[session-tracking][import] Importing session with full data', { data });

    const sessionData = {
      session_name: data.session_name,
      started_at: data.started_at,
      ended_at: data.ended_at || null,
      duration_seconds: data.duration_seconds || null,
      total_hands: data.total_hands || 0,
      cards_remaining: data.cards_remaining || null,
      status: data.status || ('completed' as const),
      session_lifecycle_flag:
        data.session_lifecycle_flag ||
        (data.status === 'completed' ? 2 : data.status === 'interrupted' ? 3 : 1),
      start_balance: data.start_balance || null,
      end_balance: data.end_balance || null,
    };

    const { data: session, error } = await supabase
      .from('user_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('[session-tracking][error] Failed to import session', { error, sessionData });

      // Show toast notification for the error
      try {
        const { error: errorNotification } = await getNotifications();
        errorNotification('Failed to import session to database');
      } catch (notifError) {
        console.warn('[session-tracking][error] Failed to show error notification', { notifError });
      }

      throw new Error(`Failed to import session: ${error.message}`);
    }

    console.log('[session-tracking][import] Session imported successfully', {
      sessionId: session.id,
      totalHands: session.total_hands,
      status: session.status,
    });
    return session;
  }

  /**
   * Update an existing session (typically to end it)
   */
  async updateSession(sessionId: string, data: UpdateSessionData): Promise<UserSession> {
    console.log('[session-tracking][persistence] Updating session', { sessionId, data });

    const { data: session, error } = await supabase
      .from('user_sessions')
      .update(data)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('[session-tracking][error] Failed to update session', {
        error,
        sessionId,
        data,
      });

      // Show toast notification for the error
      try {
        const { error: errorNotification } = await getNotifications();
        errorNotification('Failed to update session in database');
      } catch (notifError) {
        console.warn('[session-tracking][error] Failed to show error notification', { notifError });
      }

      throw new Error(`Failed to update session: ${error.message}`);
    }

    console.log('[session-tracking][persistence] Session updated successfully', { sessionId });
    return session;
  }

  /**
   * Get all user sessions ordered by creation date
   */
  async getAllSessions(): Promise<UserSession[]> {
    console.log('[session-tracking][persistence] Fetching all sessions');

    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[session-tracking][error] Failed to fetch sessions', { error });

      // Show toast notification for the error
      try {
        const { error: errorNotification } = await getNotifications();
        errorNotification('Failed to load session history');
      } catch (notifError) {
        console.warn('[session-tracking][error] Failed to show error notification', { notifError });
      }

      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    console.log('[session-tracking][persistence] Sessions fetched successfully', {
      count: sessions.length,
    });
    return sessions;
  }

  /**
   * Get a specific session by ID
   */
  async getSession(sessionId: string): Promise<UserSession | null> {
    console.log('[session-tracking][persistence] Fetching session', { sessionId });

    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        console.log('[session-tracking][persistence] Session not found', { sessionId });
        return null;
      }
      console.error('[session-tracking][error] Failed to fetch session', { error, sessionId });

      // Show toast notification for the error
      try {
        const { error: errorNotification } = await getNotifications();
        errorNotification('Failed to load session details');
      } catch (notifError) {
        console.warn('[session-tracking][error] Failed to show error notification', { notifError });
      }

      throw new Error(`Failed to fetch session: ${error.message}`);
    }

    console.log('[session-tracking][persistence] Session fetched successfully', { sessionId });
    return session;
  }

  /**
   * Delete a session by ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    console.log('[session-tracking][persistence] Deleting session', { sessionId });

    const { error } = await supabase.from('user_sessions').delete().eq('id', sessionId);

    if (error) {
      console.error('[session-tracking][error] Failed to delete session', { error, sessionId });

      // Show toast notification for the error
      try {
        const { error: errorNotification } = await getNotifications();
        errorNotification('Failed to delete session from database');
      } catch (notifError) {
        console.warn('[session-tracking][error] Failed to show error notification', { notifError });
      }

      throw new Error(`Failed to delete session: ${error.message}`);
    }

    console.log('[session-tracking][persistence] Session deleted successfully', { sessionId });
  }

  /**
   * Calculate global analytics across all sessions
   */
  async getGlobalAnalytics(): Promise<{
    totalSessions: number;
    totalHands: number;
    averageDurationSeconds: number;
    completedSessions: number;
    activeSessions: number;
  }> {
    console.log('[session-tracking][calculation] Calculating global analytics');

    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('duration_seconds, total_hands, status');

    if (error) {
      console.error('[session-tracking][error] Failed to fetch sessions for analytics', { error });

      // Show toast notification for the error
      try {
        const { error: errorNotification } = await getNotifications();
        errorNotification('Failed to load analytics data');
      } catch (notifError) {
        console.warn('[session-tracking][error] Failed to show error notification', { notifError });
      }

      throw new Error(`Failed to calculate analytics: ${error.message}`);
    }

    const completedSessions = sessions.filter(
      session => session.status === 'completed' && session.duration_seconds
    );
    const totalSessions = sessions.length;
    const totalHands = sessions.reduce((sum, session) => sum + (session.total_hands || 0), 0);
    const totalDuration = completedSessions.reduce(
      (sum, session) => sum + (session.duration_seconds || 0),
      0
    );
    const averageDuration =
      completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;

    const analytics = {
      totalSessions,
      totalHands,
      averageDurationSeconds: averageDuration,
      completedSessions: completedSessions.length,
      activeSessions: sessions.filter(session => session.status === 'active').length,
    };

    console.log('[session-tracking][calculation] Global analytics calculated', analytics);
    return analytics;
  }

  /**
   * Handle ghost sessions - mark any active sessions (flag=1) as interrupted (flag=3)
   * This should be called on app initialization to clean up sessions interrupted by page refresh
   */
  async handleGhostSessions(): Promise<number> {
    console.log('[session-tracking][cleanup] Checking for ghost sessions');

    // Find all sessions with lifecycle_flag = 1 (active) that should be marked as interrupted
    const { data: ghostSessions, error: selectError } = await supabase
      .from('user_sessions')
      .select('id, session_name, started_at')
      .eq('session_lifecycle_flag', 1)
      .eq('status', 'active');

    if (selectError) {
      console.error('[session-tracking][error] Failed to fetch ghost sessions', {
        error: selectError,
      });
      return 0;
    }

    if (!ghostSessions || ghostSessions.length === 0) {
      console.log('[session-tracking][cleanup] No ghost sessions found');
      return 0;
    }

    console.log('[session-tracking][cleanup] Found ghost sessions to clean up', {
      count: ghostSessions.length,
      sessions: ghostSessions.map(s => ({ id: s.id, name: s.session_name })),
    });

    // Update all ghost sessions to interrupted status
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        status: 'interrupted',
        session_lifecycle_flag: 3, // 3 = interrupted
        ended_at: new Date().toISOString(),
      })
      .eq('session_lifecycle_flag', 1)
      .eq('status', 'active');

    if (updateError) {
      console.error('[session-tracking][error] Failed to update ghost sessions', {
        error: updateError,
      });
      throw new Error(`Failed to clean up ghost sessions: ${updateError.message}`);
    }

    console.log('[session-tracking][cleanup] Successfully marked ghost sessions as interrupted', {
      count: ghostSessions.length,
    });

    return ghostSessions.length;
  }
}

// Export singleton instance
export const sessionService = new SessionService();
