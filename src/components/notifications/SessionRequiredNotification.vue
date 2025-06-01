<template>
  <NotificationBanner
    :type="notificationType"
    :title="config.title"
    :message="contextualMessage"
    :is-visible="isVisible"
    :is-dismissible="config.isDismissible"
    :has-action="config.hasAction"
    :action-label="config.actionLabel"
    :auto-hide="config.autoHide"
    :auto-hide-delay="config.autoHideDelay"
    :aria-live="config.ariaLive"
    class="session-required-notification"
    @dismiss="handleDismiss"
    @action="handleAction"
    @show="handleShow"
    @hide="handleHide"
  >
    <template
      #default="{
        type,
        title,
        message,
        typeClasses,
        iconClasses,
        iconPath,
        iconViewBox,
        hasAction,
        actionLabel,
        isDismissible,
        onAction,
        onDismiss,
      }"
    >
      <div :class="typeClasses.banner">
        <div class="flex items-center space-x-2">
          <!-- Dynamic Icon based on notification type -->
          <svg :class="iconClasses" fill="none" stroke="currentColor" :viewBox="iconViewBox">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
          </svg>

          <!-- Content with Dynamic Type-Aware Behavior -->
          <div class="flex-1">
            <div :class="typeClasses.title" class="text-sm font-medium">
              <!-- Dynamic Title Prefix Based on Type -->
              <span v-if="type === 'warning'" class="mr-1">⚠️</span>
              <span v-else-if="type === 'info'" class="mr-1">ℹ️</span>
              <span v-else-if="type === 'session'" class="mr-1">🎯</span>
              <span v-else class="mr-1">📢</span>
              {{ title }}
            </div>
            <div :class="typeClasses.message" class="text-xs">
              {{ message }}

              <!-- Dynamic Additional Context Based on Type -->
              <span v-if="type === 'warning'" class="block mt-1 text-orange-600 font-medium">
                🚨 Action Required
              </span>
              <span v-else-if="type === 'info'" class="block mt-1 text-blue-600">
                💡 Information
              </span>
              <span v-else-if="type === 'session'" class="block mt-1 text-purple-600">
                🎮 Session Management
              </span>
            </div>
          </div>

          <!-- Action Button with Type-Aware Styling -->
          <button
            v-if="hasAction && actionLabel"
            @click="onAction"
            :class="[
              typeClasses.action,
              {
                'bg-orange-500 hover:bg-orange-600 text-white': type === 'warning',
                'bg-blue-500 hover:bg-blue-600 text-white': type === 'info',
                'bg-purple-500 hover:bg-purple-600 text-white': type === 'session',
                'bg-gray-500 hover:bg-gray-600 text-white': ![
                  'warning',
                  'info',
                  'session',
                ].includes(type),
              },
            ]"
            class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
            :title="`${type.toUpperCase()} action: ${actionLabel}`"
          >
            <!-- Dynamic Action Button Icons -->
            <span v-if="type === 'warning'" class="mr-1">⚡</span>
            <span v-else-if="type === 'info'" class="mr-1">💫</span>
            <span v-else-if="type === 'session'" class="mr-1">🚀</span>
            {{ actionLabel }}
          </button>

          <!-- Dismiss Button with Type-Aware Tooltip -->
          <button
            v-if="isDismissible"
            @click="onDismiss"
            :class="typeClasses.dismiss"
            class="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            :aria-label="`Dismiss ${type} notification: ${title}`"
            :title="`Dismiss this ${type} notification`"
          >
            ✕
          </button>
        </div>

        <!-- Dynamic Type-Based Progress Indicator for Session Type -->
        <div
          v-if="type === 'session'"
          class="mt-2 w-full bg-gray-200 rounded-full h-1"
          title="Session activation progress"
        >
          <div
            class="bg-purple-500 h-1 rounded-full transition-all duration-300"
            :style="{ width: isVisible ? '25%' : '100%' }"
          ></div>
        </div>

        <!-- Dynamic Type-Based Urgency Indicator for Warning Type -->
        <div v-if="type === 'warning'" class="mt-1 flex items-center text-xs text-orange-600">
          <span class="animate-pulse mr-1">🔥</span>
          <span>Immediate attention required</span>
        </div>
      </div>
    </template>
  </NotificationBanner>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import {
  NotificationBanner,
  type NotificationType,
} from '@/design-system/primitives/NotificationBanner';
import {
  getNotificationConfig,
  getNotificationType,
  getLogCategory,
} from '@/config/notificationSettings';

// Props
interface Props {
  configKey?: string;
  context?: 'betting' | 'dealing' | 'clearing' | 'demo' | 'general';
}

const props = withDefaults(defineProps<Props>(), {
  configKey: 'SESSION_REQUIRED',
  context: 'general',
});

// Emits
interface Emits {
  dismiss: [configKey: string];
  action: [configKey: string, actionLabel: string];
}

const emit = defineEmits<Emits>();

// Store
const store = useBaccaratStore();

// Computed properties
const config = computed(() => {
  const cfg = getNotificationConfig(props.configKey);
  if (!cfg) {
    console.warn('[notification][config] Unknown notification config key', {
      configKey: props.configKey,
    });
    return getNotificationConfig('SESSION_REQUIRED')!;
  }
  return cfg;
});

const notificationType = computed((): NotificationType => {
  // Use getNotificationType to dynamically determine notification type based on session state
  const dynamicType = getNotificationType(props.configKey);

  // Add context-aware type determination
  if (!store.ui.sessionActive) {
    switch (props.context) {
      case 'betting':
        return 'warning'; // More urgent for betting actions
      case 'dealing':
        return 'info'; // Informational for dealing
      case 'clearing':
        return 'warning'; // Warning for clearing actions
      case 'demo':
        return 'session'; // Default session type for demo
      default:
        return dynamicType || 'session';
    }
  }

  return dynamicType || 'session';
});

const contextualMessage = computed(() => {
  const baseMessage = config.value.message;

  // Add context-specific messaging based on the action being attempted
  switch (props.context) {
    case 'betting':
      return 'Start a session to place bets and track your gaming statistics.';
    case 'dealing':
      return 'Start a session to deal cards and perform hand analysis.';
    case 'clearing':
      return 'Start a session to clear hands and complete rounds.';
    case 'demo':
      return 'Demo hands are disabled until you start a session for accurate tracking.';
    default:
      return baseMessage;
  }
});

const isVisible = computed(() => {
  // Session required notification is visible when session is NOT active
  return !store.ui.sessionActive;
});

// Event handlers with Enhanced Type-Aware Behavior
const handleDismiss = (type: NotificationType, title: string) => {
  const logCategory = getLogCategory(props.configKey);

  // Enhanced logging with type-specific analytics
  console.log(`${logCategory} ${type.toUpperCase()} notification dismissed`, {
    configKey: props.configKey,
    context: props.context,
    notificationType: type,
    computedType: notificationType.value,
    title,
    timestamp: new Date().toISOString(),
    userAction: 'dismiss_notification',
    sessionState: {
      active: store.ui.sessionActive,
      balance: store.ui.currentBalance,
    },
    typeMetrics: {
      urgencyLevel: type === 'warning' ? 'high' : type === 'info' ? 'low' : 'medium',
      dismissAfterSeconds: performance.now() / 1000, // Approximate time shown
    },
  });

  // Type-specific user feedback on dismiss
  switch (type) {
    case 'warning':
      console.log(
        '[notification][warning] High-priority warning dismissed - tracking user behavior'
      );
      break;
    case 'info':
      console.log('[notification][info] Informational message dismissed - user acknowledged');
      break;
    case 'session':
      console.log(
        '[notification][session] Session notification dismissed - tracking session behavior'
      );
      break;
    default:
      console.log(`[notification][${type}] Generic notification dismissed`);
  }

  emit('dismiss', props.configKey);
};

const handleAction = (type: NotificationType, title: string, actionLabel: string) => {
  const logCategory = getLogCategory(props.configKey);

  // Enhanced logging with type-specific action analytics
  console.log(`${logCategory} ${type.toUpperCase()} notification action triggered`, {
    configKey: props.configKey,
    context: props.context,
    notificationType: type,
    computedType: notificationType.value,
    title,
    actionLabel,
    timestamp: new Date().toISOString(),
    userAction: 'notification_action',
    sessionState: {
      active: store.ui.sessionActive,
      balance: store.ui.currentBalance,
    },
    actionMetrics: {
      actionUrgency: type === 'warning' ? 'critical' : type === 'session' ? 'important' : 'normal',
      expectedOutcome: getExpectedActionOutcome(type, actionLabel),
      contextRelevance: props.context,
    },
  });

  // Type-specific action tracking and user guidance
  switch (type) {
    case 'warning':
      console.log(
        '[notification][warning] Critical action triggered - high priority user engagement'
      );
      break;
    case 'info':
      console.log('[notification][info] Informational action triggered - user seeking guidance');
      break;
    case 'session':
      console.log('[notification][session] Session action triggered - workflow progression');
      break;
    default:
      console.log(`[notification][${type}] Generic action triggered: ${actionLabel}`);
  }

  emit('action', props.configKey, actionLabel);
};

const handleShow = (type: NotificationType, title: string) => {
  const logCategory = getLogCategory(props.configKey);

  // Enhanced show logging with type analytics
  console.log(`${logCategory} ${type.toUpperCase()} notification shown`, {
    configKey: props.configKey,
    context: props.context,
    notificationType: type,
    computedType: notificationType.value,
    title,
    sessionActive: store.ui.sessionActive,
    timestamp: new Date().toISOString(),
    visibilityMetrics: {
      triggerReason: !store.ui.sessionActive ? 'session_inactive' : 'unknown',
      contextualRelevance: props.context,
      typeAppropriate: type === notificationType.value,
    },
  });

  // Type-specific visibility analytics
  switch (type) {
    case 'warning':
      console.log(
        '[notification][warning] High-priority warning displayed - tracking attention metrics'
      );
      break;
    case 'info':
      console.log('[notification][info] Information displayed - user education opportunity');
      break;
    case 'session':
      console.log('[notification][session] Session notification displayed - workflow guidance');
      break;
  }
};

const handleHide = (type: NotificationType, title: string) => {
  const logCategory = getLogCategory(props.configKey);

  // Enhanced hide logging with completion analytics
  console.log(`${logCategory} ${type.toUpperCase()} notification hidden`, {
    configKey: props.configKey,
    context: props.context,
    notificationType: type,
    computedType: notificationType.value,
    title,
    sessionActive: store.ui.sessionActive,
    timestamp: new Date().toISOString(),
    completionMetrics: {
      hideReason: store.ui.sessionActive ? 'condition_resolved' : 'manual_dismiss',
      effectiveTime: performance.now() / 1000, // Time notification was effective
      userEngagement: 'notification_lifecycle_complete',
    },
  });

  // Type-specific completion tracking
  switch (type) {
    case 'warning':
      console.log(
        '[notification][warning] Warning resolved or dismissed - tracking resolution effectiveness'
      );
      break;
    case 'session':
      console.log(
        '[notification][session] Session notification hidden - tracking workflow completion'
      );
      break;
  }
};

// Helper function for action outcome prediction
const getExpectedActionOutcome = (type: NotificationType, actionLabel: string): string => {
  switch (type) {
    case 'warning':
      return actionLabel.toLowerCase().includes('start')
        ? 'resolve_critical_state'
        : 'mitigate_warning';
    case 'session':
      return actionLabel.toLowerCase().includes('start') ? 'activate_session' : 'session_action';
    case 'info':
      return 'user_education_complete';
    default:
      return 'generic_action_complete';
  }
};
</script>

<style scoped>
/* Session Required Notification Styling - PRESERVES CURRENT UI */
.session-required-notification {
  width: 100%;
}

/* Additional responsive styling if needed */
@media (max-width: 768px) {
  .session-required-notification {
    margin: 0 var(--spacing-2);
  }
}
</style>
