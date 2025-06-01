<!-- Headless Connection Banner Primitive -->
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
      :status="status"
      :message="message"
      :isChecking="isChecking"
      :canRetry="canRetry"
      :canDismiss="canDismiss"
      :onRetry="handleRetry"
      :onDismiss="handleDismiss"
      :statusClasses="statusClasses"
      :indicatorClasses="indicatorClasses"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useConnectionStore, type ConnectionStatus } from '@/stores/connectionStore';
import { useNotifications } from '@/composables/useNotifications';

// Types
interface Props {
  as?: string;
  class?: string;
  role?: string;
  ariaLive?: 'polite' | 'assertive' | 'off';
  ariaLabel?: string;
}

interface Emits {
  retry: [status: ConnectionStatus];
  dismiss: [status: ConnectionStatus];
  statusChange: [status: ConnectionStatus, previousStatus: ConnectionStatus];
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  class: '',
  role: 'alert',
  ariaLive: 'polite',
  ariaLabel: 'Connection status banner',
});

// Emits
const emit = defineEmits<Emits>();

// Store and composables
const connectionStore = useConnectionStore();
const { success } = useNotifications();

// Computed properties
const computedClass = computed(() => props.class);

const shouldShow = computed(() => connectionStore.shouldShowBanner);

const status = computed(() => connectionStore.connectionStatus);

const message = computed(() => connectionStore.connectionMessage);

const isChecking = computed(() => connectionStore.isChecking);

const canRetry = computed(() => status.value === 'disconnected');

const canDismiss = computed(() => status.value === 'disconnected');

// Status-based styling classes using design tokens
const statusClasses = computed(() => {
  switch (status.value) {
    case 'checking':
      return {
        banner: 'connection-banner connection-banner--checking',
        text: 'connection-text connection-text--checking',
        button: 'connection-button connection-button--checking',
      };
    case 'connected':
      return {
        banner: 'connection-banner connection-banner--connected',
        text: 'connection-text connection-text--connected',
        button: 'connection-button connection-button--connected',
      };
    case 'disconnected':
      return {
        banner: 'connection-banner connection-banner--disconnected',
        text: 'connection-text connection-text--disconnected',
        button: 'connection-button connection-button--disconnected',
      };
    default:
      return {
        banner: 'connection-banner connection-banner--unknown',
        text: 'connection-text connection-text--unknown',
        button: 'connection-button connection-button--unknown',
      };
  }
});

const indicatorClasses = computed(() => {
  switch (status.value) {
    case 'checking':
      return 'connection-indicator connection-indicator--checking';
    case 'connected':
      return 'connection-indicator connection-indicator--connected';
    case 'disconnected':
      return 'connection-indicator connection-indicator--disconnected';
    default:
      return 'connection-indicator connection-indicator--unknown';
  }
});

// Event handlers
const handleRetry = async () => {
  console.log('[connection-banner][action] Retry button clicked', {
    currentStatus: status.value,
    timestamp: new Date().toISOString(),
  });

  emit('retry', status.value);

  const result = await connectionStore.retryConnection();

  if (result) {
    success('Database connection restored');
    console.log('[connection-banner][success] Connection restored successfully');
  } else {
    // Don't show error toast - just log for debugging
    console.log('[connection-banner][error] Connection restoration failed');
  }
};

const handleDismiss = () => {
  console.log('[connection-banner][action] Dismiss button clicked', {
    currentStatus: status.value,
    timestamp: new Date().toISOString(),
  });

  emit('dismiss', status.value);
  connectionStore.dismissBanner();
};

// Watch for status changes to emit events
watch(
  status,
  (currentStatus, oldStatus) => {
    if (currentStatus !== oldStatus) {
      console.log('[connection-banner][status-change] Connection status changed', {
        from: oldStatus,
        to: currentStatus,
        timestamp: new Date().toISOString(),
      });
      emit('statusChange', currentStatus, oldStatus);
    }
  },
  { immediate: false }
);
</script>

<style scoped>
/* Connection Banner Component Classes using Design Tokens */
:deep(.connection-banner) {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease-in-out;
}

:deep(.connection-banner--checking) {
  background-color: var(--color-primary-500);
  color: white;
}

:deep(.connection-banner--connected) {
  background-color: var(--color-semantic-success-500);
  color: white;
}

:deep(.connection-banner--disconnected) {
  background-color: var(--color-semantic-warning-500);
  color: white;
}

:deep(.connection-banner--unknown) {
  background-color: var(--color-neutral-500);
  color: white;
}

:deep(.connection-text) {
  color: inherit;
}

:deep(.connection-button) {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: 0.75rem;
  border-radius: var(--spacing-1);
  transition: all 0.2s ease-in-out;
  background-color: rgba(255, 255, 255, 0.2);
  color: inherit;
  border: none;
  cursor: pointer;
}

:deep(.connection-button:hover:not(:disabled)) {
  background-color: rgba(255, 255, 255, 0.3);
}

:deep(.connection-button:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.connection-indicator) {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease-in-out;
}

:deep(.connection-indicator--checking) {
  background-color: rgba(255, 255, 255, 0.8);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

:deep(.connection-indicator--connected) {
  background-color: rgba(255, 255, 255, 0.9);
}

:deep(.connection-indicator--disconnected) {
  background-color: rgba(239, 68, 68, 0.9);
}

:deep(.connection-indicator--unknown) {
  background-color: rgba(255, 255, 255, 0.6);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
