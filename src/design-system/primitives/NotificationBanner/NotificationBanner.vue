<!-- Headless Notification Banner Primitive -->
<template>
  <component
    :is="as"
    v-if="shouldShow"
    :class="computedClass"
    :role="role"
    :aria-live="ariaLive"
    :aria-label="ariaLabel"
  >
    <slot
      :type="type"
      :message="message"
      :title="title"
      :isVisible="isVisible"
      :isDismissible="isDismissible"
      :hasAction="hasAction"
      :actionLabel="actionLabel"
      :onDismiss="handleDismiss"
      :onAction="handleAction"
      :typeClasses="typeClasses"
      :iconClasses="iconClasses"
      :textClasses="textClasses"
      :iconPath="iconPath"
      :iconViewBox="iconViewBox"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useNotifications } from '@/composables/useNotifications';

// Types
export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'session';

interface Props {
  as?: string;
  class?: string;
  role?: string;
  ariaLive?: 'polite' | 'assertive' | 'off';
  ariaLabel?: string;
  type: NotificationType;
  title: string;
  message?: string;
  isVisible?: boolean;
  isDismissible?: boolean;
  hasAction?: boolean;
  actionLabel?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

interface Emits {
  dismiss: [type: NotificationType, title: string];
  action: [type: NotificationType, title: string, actionLabel: string];
  show: [type: NotificationType, title: string];
  hide: [type: NotificationType, title: string];
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  class: '',
  role: 'alert',
  ariaLive: 'polite',
  ariaLabel: '',
  message: '',
  isVisible: true,
  isDismissible: false,
  hasAction: false,
  actionLabel: '',
  autoHide: false,
  autoHideDelay: 5000,
});

// Emits
const emit = defineEmits<Emits>();

// Composables
const { info } = useNotifications();

// Computed properties
const computedClass = computed(() => props.class);

const shouldShow = computed(() => props.isVisible);

// Type-based styling classes using design tokens
const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return {
        banner: 'notification-banner notification-banner--success',
        text: 'notification-text notification-text--success',
        title: 'notification-title notification-title--success',
        message: 'notification-message notification-message--success',
        action: 'notification-action notification-action--success',
        dismiss: 'notification-dismiss notification-dismiss--success',
      };
    case 'warning':
      return {
        banner: 'notification-banner notification-banner--warning',
        text: 'notification-text notification-text--warning',
        title: 'notification-title notification-title--warning',
        message: 'notification-message notification-message--warning',
        action: 'notification-action notification-action--warning',
        dismiss: 'notification-dismiss notification-dismiss--warning',
      };
    case 'error':
      return {
        banner: 'notification-banner notification-banner--error',
        text: 'notification-text notification-text--error',
        title: 'notification-title notification-title--error',
        message: 'notification-message notification-message--error',
        action: 'notification-action notification-action--error',
        dismiss: 'notification-dismiss notification-dismiss--error',
      };
    case 'info':
      return {
        banner: 'notification-banner notification-banner--info',
        text: 'notification-text notification-text--info',
        title: 'notification-title notification-title--info',
        message: 'notification-message notification-message--info',
        action: 'notification-action notification-action--info',
        dismiss: 'notification-dismiss notification-dismiss--info',
      };
    case 'session':
      return {
        banner: 'notification-banner notification-banner--session',
        text: 'notification-text notification-text--session',
        title: 'notification-title notification-title--session',
        message: 'notification-message notification-message--session',
        action: 'notification-action notification-action--session',
        dismiss: 'notification-dismiss notification-dismiss--session',
      };
    default:
      return {
        banner: 'notification-banner notification-banner--info',
        text: 'notification-text notification-text--info',
        title: 'notification-title notification-title--info',
        message: 'notification-message notification-message--info',
        action: 'notification-action notification-action--info',
        dismiss: 'notification-dismiss notification-dismiss--info',
      };
  }
});

const iconClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'notification-icon notification-icon--success';
    case 'warning':
      return 'notification-icon notification-icon--warning';
    case 'error':
      return 'notification-icon notification-icon--error';
    case 'info':
      return 'notification-icon notification-icon--info';
    case 'session':
      return 'notification-icon notification-icon--session';
    default:
      return 'notification-icon notification-icon--info';
  }
});

const textClasses = computed(() => typeClasses.value.text);

// Icon configuration for different types
const iconPath = computed(() => {
  switch (props.type) {
    case 'success':
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    case 'warning':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
    case 'error':
      return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
    case 'info':
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    case 'session':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
    default:
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }
});

const iconViewBox = computed(() => '0 0 24 24');

// Event handlers
const handleDismiss = () => {
  console.log('[notification-banner][action] Banner dismissed', {
    type: props.type,
    title: props.title,
    timestamp: new Date().toISOString(),
  });

  emit('dismiss', props.type, props.title);

  info(`Notification dismissed: ${props.title}`, { timeout: 2000 });
};

const handleAction = () => {
  console.log('[notification-banner][action] Action button clicked', {
    type: props.type,
    title: props.title,
    actionLabel: props.actionLabel,
    timestamp: new Date().toISOString(),
  });

  emit('action', props.type, props.title, props.actionLabel);
};

// Auto-hide functionality
let autoHideTimer: NodeJS.Timeout | null = null;

const startAutoHide = () => {
  if (props.autoHide && props.autoHideDelay > 0) {
    autoHideTimer = setTimeout(() => {
      handleDismiss();
    }, props.autoHideDelay);
  }
};

const clearAutoHide = () => {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
};

// Watch for visibility changes to emit events and handle auto-hide
watch(
  () => props.isVisible,
  (newVisible, oldVisible) => {
    if (newVisible && !oldVisible) {
      console.log('[notification-banner][show] Banner shown', {
        type: props.type,
        title: props.title,
        timestamp: new Date().toISOString(),
      });
      emit('show', props.type, props.title);
      startAutoHide();
    } else if (!newVisible && oldVisible) {
      console.log('[notification-banner][hide] Banner hidden', {
        type: props.type,
        title: props.title,
        timestamp: new Date().toISOString(),
      });
      emit('hide', props.type, props.title);
      clearAutoHide();
    }
  },
  { immediate: true }
);

// Cleanup
import { onUnmounted } from 'vue';
onUnmounted(() => {
  clearAutoHide();
});
</script>

<style scoped>
/* Notification Banner Component Classes using Design Tokens */
:deep(.notification-banner) {
  width: 100%;
  padding: var(--spacing-3);
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease-in-out;
}

/* Success variant */
:deep(.notification-banner--success) {
  background-color: var(--color-semantic-success-50, #f0f9ff);
  border: 1px solid var(--color-semantic-success-200, #e0f2fe);
}

:deep(.notification-text--success) {
  color: var(--color-semantic-success-800, #075985);
}

:deep(.notification-title--success) {
  color: var(--color-semantic-success-800, #075985);
  font-weight: 500;
}

:deep(.notification-message--success) {
  color: var(--color-semantic-success-700, #0369a1);
}

:deep(.notification-icon--success) {
  color: var(--color-semantic-success-600, #0284c7);
}

/* Warning variant - PRESERVES CURRENT UI STYLING */
:deep(.notification-banner--warning) {
  background-color: var(--color-semantic-warning-50, #fffbeb);
  border: 1px solid var(--color-semantic-warning-200, #fde68a);
}

:deep(.notification-text--warning) {
  color: var(--color-semantic-warning-800, #92400e);
}

:deep(.notification-title--warning) {
  color: var(--color-semantic-warning-800, #92400e);
  font-weight: 500;
}

:deep(.notification-message--warning) {
  color: var(--color-semantic-warning-700, #b45309);
}

:deep(.notification-icon--warning) {
  color: var(--color-semantic-warning-600, #d97706);
}

/* Error variant */
:deep(.notification-banner--error) {
  background-color: var(--color-semantic-danger-50, #fef2f2);
  border: 1px solid var(--color-semantic-danger-200, #fecaca);
}

:deep(.notification-text--error) {
  color: var(--color-semantic-danger-800, #991b1b);
}

:deep(.notification-title--error) {
  color: var(--color-semantic-danger-800, #991b1b);
  font-weight: 500;
}

:deep(.notification-message--error) {
  color: var(--color-semantic-danger-700, #b91c1c);
}

:deep(.notification-icon--error) {
  color: var(--color-semantic-danger-600, #dc2626);
}

/* Info variant */
:deep(.notification-banner--info) {
  background-color: var(--color-primary-50, #eff6ff);
  border: 1px solid var(--color-primary-200, #bfdbfe);
}

:deep(.notification-text--info) {
  color: var(--color-primary-800, #1e40af);
}

:deep(.notification-title--info) {
  color: var(--color-primary-800, #1e40af);
  font-weight: 500;
}

:deep(.notification-message--info) {
  color: var(--color-primary-700, #1d4ed8);
}

:deep(.notification-icon--info) {
  color: var(--color-primary-600, #2563eb);
}

/* Session variant - EXACTLY MATCHES CURRENT STYLING */
:deep(.notification-banner--session) {
  background-color: #fffbeb; /* bg-yellow-50 */
  border: 1px solid #fde68a; /* border-yellow-200 */
}

:deep(.notification-text--session) {
  color: #92400e; /* text-yellow-800 */
}

:deep(.notification-title--session) {
  color: #92400e; /* text-yellow-800 */
  font-weight: 500; /* font-medium */
}

:deep(.notification-message--session) {
  color: #b45309; /* text-yellow-700 */
}

:deep(.notification-icon--session) {
  color: #d97706; /* text-yellow-600 */
}

/* Common icon styling */
:deep(.notification-icon) {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  flex-shrink: 0;
}

/* Action and dismiss buttons */
:deep(.notification-action),
:deep(.notification-dismiss) {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: 0.75rem;
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease-in-out;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

:deep(.notification-action--warning),
:deep(.notification-dismiss--warning) {
  background-color: var(--color-semantic-warning-600, #d97706);
  color: white;
}

:deep(.notification-action--warning:hover),
:deep(.notification-dismiss--warning:hover) {
  background-color: var(--color-semantic-warning-700, #b45309);
}

:deep(.notification-action--session),
:deep(.notification-dismiss--session) {
  background-color: #d97706; /* bg-yellow-600 */
  color: white;
}

:deep(.notification-action--session:hover),
:deep(.notification-dismiss--session:hover) {
  background-color: #b45309; /* bg-yellow-700 */
}
</style>
