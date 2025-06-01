import { computed, readonly } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useNotifications } from '@/composables/useNotifications';
import {
  getNotificationConfig,
  getNotificationType,
  getLogCategory,
  type NotificationConfig,
} from '@/config/notificationSettings';

/**
 * Session Notifications Composable
 *
 * Manages session-related notifications with reactive state management,
 * structured logging, and proper event handling following setup() patterns.
 */
export function useSessionNotifications() {
  // Store and composables
  const store = useBaccaratStore();
  const { success, warning, info } = useNotifications();

  // Session state computeds
  const isSessionActive = computed(() => store.ui.sessionActive);
  const sessionStartTime = computed(() => store.ui.sessionStartTime);
  const currentBalance = computed(() => store.ui.currentBalance);
  const canPerformActions = computed(() => store.canPerformActions);

  // Session required notification visibility
  const showSessionRequired = computed(() => !isSessionActive.value);

  // Dynamic notification type determination based on context
  const getContextualNotificationType = (context: string = 'general') => {
    if (!isSessionActive.value) {
      // Use getNotificationType to get base type, then contextualize
      const baseType = getNotificationType('SESSION_REQUIRED');

      switch (context) {
        case 'betting':
        case 'clearing':
          return 'warning'; // More urgent for critical actions
        case 'dealing':
          return 'info'; // Informational for dealing actions
        case 'demo':
          return baseType || 'session'; // Use configured type for demo
        default:
          return baseType || 'session';
      }
    }
    return getNotificationType('SESSION_ACTIVE') || 'success';
  };

  // Configuration getters with enhanced context awareness
  const getSessionRequiredConfig = (context?: string): NotificationConfig => {
    const config = getNotificationConfig('SESSION_REQUIRED');
    if (!config) {
      console.error('[session-notifications][config] SESSION_REQUIRED config not found');
      throw new Error('SESSION_REQUIRED notification config is missing');
    }

    // Enhance config with contextual information
    if (context) {
      return {
        ...config,
        message: getContextualMessage(context),
      };
    }

    return config;
  };

  const getSessionStartedConfig = (): NotificationConfig => {
    const config = getNotificationConfig('SESSION_STARTED');
    if (!config) {
      console.error('[session-notifications][config] SESSION_STARTED config not found');
      throw new Error('SESSION_STARTED notification config is missing');
    }
    return config;
  };

  const getSessionEndedConfig = (): NotificationConfig => {
    const config = getNotificationConfig('SESSION_ENDED');
    if (!config) {
      console.error('[session-notifications][config] SESSION_ENDED config not found');
      throw new Error('SESSION_ENDED notification config is missing');
    }
    return config;
  };

  // Contextual message generation using the intended getNotificationType function
  const getContextualMessage = (context: string): string => {
    const notificationType = getNotificationType('SESSION_REQUIRED');
    const logCategory = getLogCategory('SESSION_REQUIRED');

    console.log(`${logCategory} Generating contextual message`, {
      context,
      notificationType,
      sessionActive: isSessionActive.value,
    });

    switch (context) {
      case 'betting':
        return 'Start a session to place bets and track your gaming statistics.';
      case 'dealing':
        return 'Start a session to deal cards and perform hand analysis.';
      case 'clearing':
        return 'Start a session to clear hands and complete rounds.';
      case 'demo':
        return 'Demo hands are disabled until you start a session for accurate tracking.';
      default:
        const baseConfig = getNotificationConfig('SESSION_REQUIRED');
        return baseConfig?.message || 'Start a session to enable all features.';
    }
  };

  // Session validation with enhanced context
  const validateSessionActions = (
    context?: string
  ): {
    canBet: boolean;
    canDealCards: boolean;
    canClearHand: boolean;
    reason: string;
    notificationType: string;
  } => {
    const notificationType = getContextualNotificationType(context);

    if (!isSessionActive.value) {
      return {
        canBet: false,
        canDealCards: false,
        canClearHand: false,
        reason: getContextualMessage(context || 'general'),
        notificationType,
      };
    }

    return {
      canBet: canPerformActions.value,
      canDealCards: canPerformActions.value,
      canClearHand: canPerformActions.value,
      reason: 'Session is active - all actions enabled',
      notificationType,
    };
  };

  // Enhanced event handlers with context awareness
  const handleSessionRequiredDismiss = (configKey: string, context?: string) => {
    const logCategory = getLogCategory(configKey);
    const notificationType = getContextualNotificationType(context);

    console.log(`${logCategory} Session required notification dismissed`, {
      configKey,
      context,
      notificationType,
      sessionActive: isSessionActive.value,
      timestamp: new Date().toISOString(),
      userAction: 'dismiss_session_required',
    });

    // Context-aware response to dismissal
    switch (context) {
      case 'betting':
        warning('⚠️ Betting disabled - Start a session to place bets', { timeout: 4000 });
        break;
      case 'dealing':
        info('ℹ️ Card dealing disabled - Start a session for hand analysis', { timeout: 3000 });
        break;
      case 'clearing':
        warning('⚠️ Hand clearing disabled - Start a session to complete rounds', {
          timeout: 4000,
        });
        break;
      case 'demo':
        info('🎮 Demo mode disabled - Start a session for full features', { timeout: 3000 });
        break;
      default:
        warning('Please start a session to enable all features', { timeout: 3000 });
    }
  };

  const handleSessionRequiredAction = (
    configKey: string,
    actionLabel: string,
    context?: string
  ) => {
    const logCategory = getLogCategory(configKey);
    const notificationType = getContextualNotificationType(context);

    console.log(`${logCategory} Session required action triggered`, {
      configKey,
      actionLabel,
      context,
      notificationType,
      sessionActive: isSessionActive.value,
      timestamp: new Date().toISOString(),
      userAction: 'session_required_action',
    });

    // Context-aware action handling
    switch (actionLabel.toLowerCase()) {
      case 'start session':
        info(`🎯 ${actionLabel} requested - Navigate to session controls`, { timeout: 2000 });
        break;
      case 'enable betting':
        info(`💰 ${actionLabel} requested - Start a session first`, { timeout: 2000 });
        break;
      case 'enable dealing':
        info(`🃏 ${actionLabel} requested - Start a session first`, { timeout: 2000 });
        break;
      default:
        info(`🎮 Action requested: ${actionLabel}`, { timeout: 2000 });
    }
  };

  // Session lifecycle notifications with enhanced context
  const notifySessionStarted = (sessionId?: string, startingBalance?: number, context?: string) => {
    const config = getSessionStartedConfig();
    const logCategory = getLogCategory('SESSION_STARTED');
    const notificationType = getNotificationType('SESSION_STARTED') || 'success';

    console.log(`${logCategory} Session started notification triggered`, {
      sessionId,
      startingBalance,
      context,
      notificationType,
      sessionStartTime: sessionStartTime.value,
      timestamp: new Date().toISOString(),
    });

    success(
      `🎯 ${config.title}: ${config.message}${startingBalance ? ` Starting balance: $${startingBalance.toFixed(2)}` : ''}`,
      { timeout: config.autoHideDelay }
    );
  };

  const notifySessionEnded = (
    duration: string,
    handsPlayed?: number,
    endingBalance?: number,
    context?: string
  ) => {
    const config = getSessionEndedConfig();
    const logCategory = getLogCategory('SESSION_ENDED');
    const notificationType = getNotificationType('SESSION_ENDED') || 'info';

    console.log(`${logCategory} Session ended notification triggered`, {
      duration,
      handsPlayed: handsPlayed || 0,
      endingBalance,
      context,
      notificationType,
      timestamp: new Date().toISOString(),
    });

    const message = `${config.message} Duration: ${duration}${handsPlayed ? `, Hands: ${handsPlayed}` : ''}${endingBalance ? `, Final balance: $${endingBalance.toFixed(2)}` : ''}`;

    info(`📊 ${config.title}: ${message}`, { timeout: config.autoHideDelay });
  };

  // Action prevention notifications with enhanced context
  const notifyActionPrevented = (action: string, reason: string, context?: string) => {
    const logCategory = getLogCategory('SESSION_REQUIRED');
    const notificationType = getContextualNotificationType(context);

    console.log(`${logCategory} Action prevented due to inactive session`, {
      action,
      reason,
      context,
      notificationType,
      sessionActive: isSessionActive.value,
      timestamp: new Date().toISOString(),
      userAction: 'action_prevented',
    });

    // Use appropriate notification type based on context
    switch (notificationType) {
      case 'warning':
        warning(`⚠️ Cannot ${action}: ${reason}`, { timeout: 4000 });
        break;
      case 'info':
        info(`ℹ️ Cannot ${action}: ${reason}`, { timeout: 3000 });
        break;
      default:
        warning(`Cannot ${action}: ${reason}`, { timeout: 4000 });
    }
  };

  // Return readonly state and methods
  return readonly({
    // State
    isSessionActive,
    sessionStartTime,
    currentBalance,
    canPerformActions,
    showSessionRequired,

    // Dynamic type and context methods
    getContextualNotificationType,
    getContextualMessage,

    // Enhanced configuration methods
    getSessionRequiredConfig,
    getSessionStartedConfig,
    getSessionEndedConfig,

    // Enhanced validation
    validateSessionActions,

    // Enhanced event handlers
    handleSessionRequiredDismiss,
    handleSessionRequiredAction,

    // Enhanced lifecycle notifications
    notifySessionStarted,
    notifySessionEnded,
    notifyActionPrevented,
  });
}
