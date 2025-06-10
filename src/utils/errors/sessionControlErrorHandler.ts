/**
 * 🎮 Session Control Error Handler - Simple Version
 *
 * Basic error handling for session management functionality.
 */

// ==================== SIMPLE ERROR TYPES ====================

export class SessionControlError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'SESSION_ERROR',
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SessionControlError';
  }
}

// ==================== ERROR HANDLING FUNCTIONS ====================

export const handleSessionError = (error: unknown): SessionControlError => {
  if (error instanceof SessionControlError) {
    return error;
  }

  if (error instanceof Error) {
    return new SessionControlError(error.message, 'UNKNOWN_ERROR');
  }

  return new SessionControlError('An unknown error occurred', 'UNKNOWN_ERROR');
};

export const createSessionError = (
  message: string,
  code: string = 'SESSION_ERROR',
  context?: Record<string, unknown>
): SessionControlError => {
  return new SessionControlError(message, code, context);
};
