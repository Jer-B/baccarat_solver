<template>
  <ConnectionBanner
    class="connection-status-banner"
    @retry="handleRetry"
    @dismiss="handleDismiss"
    @status-change="handleStatusChange"
  >
    <template
      #default="{
        status,
        message,
        isChecking,
        canRetry,
        canDismiss,
        onRetry,
        onDismiss,
        statusClasses,
        indicatorClasses,
      }"
    >
      <div :class="statusClasses.banner">
        <div class="connection-container">
          <!-- Status Information -->
          <div class="connection-info">
            <div class="connection-status">
              <div :class="indicatorClasses"></div>
              <span :class="statusClasses.text">{{ message }}</span>
            </div>

            <!-- Additional info for disconnected state -->
            <div v-if="status === 'disconnected'" class="connection-notice">
              • Sessions will work locally
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="connection-actions">
            <!-- Retry button for failed connections -->
            <button
              v-if="canRetry"
              @click="onRetry"
              :disabled="isChecking"
              :class="statusClasses.button"
              :aria-label="isChecking ? 'Checking connection...' : 'Retry database connection'"
            >
              {{ isChecking ? 'Checking...' : 'Retry' }}
            </button>

            <!-- Dismiss button - only for persistent states (disconnected) -->
            <button
              v-if="canDismiss"
              @click="onDismiss"
              :class="statusClasses.button"
              aria-label="Dismiss connection banner"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </template>
  </ConnectionBanner>
</template>

<script setup lang="ts">
import {
  ConnectionBanner,
  type ConnectionStatus,
} from '@/design-system/primitives/ConnectionBanner';

// Event handlers for additional functionality
const handleRetry = (status: ConnectionStatus) => {
  console.log('[connection-status-banner][event] Retry initiated', {
    status,
    timestamp: new Date().toISOString(),
    userAction: 'retry_connection',
  });
};

const handleDismiss = (status: ConnectionStatus) => {
  console.log('[connection-status-banner][event] Banner dismissed', {
    status,
    timestamp: new Date().toISOString(),
    userAction: 'dismiss_banner',
  });
};

const handleStatusChange = (newStatus: ConnectionStatus, previousStatus: ConnectionStatus) => {
  console.log('[connection-status-banner][event] Status changed', {
    from: previousStatus,
    to: newStatus,
    timestamp: new Date().toISOString(),
    duration: previousStatus ? 'status_transition' : 'initial_status',
  });

  // Additional business logic based on status changes
  if (newStatus === 'connected' && previousStatus === 'disconnected') {
    console.log('[connection-status-banner][analytics] Connection restored after failure');
  } else if (newStatus === 'disconnected' && previousStatus === 'connected') {
    console.log('[connection-status-banner][analytics] Connection lost');
  }
};
</script>

<style scoped>
/* Connection Status Banner Styling using Design Tokens */
.connection-status-banner {
  width: 100%;
  position: relative;
  z-index: 50;
}

.connection-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-4);
}

.connection-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.connection-notice {
  font-size: 0.75rem;
  opacity: 0.75;
  color: inherit;
}

.connection-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .connection-container {
    flex-direction: column;
    gap: var(--spacing-2);
    padding: var(--spacing-2) var(--spacing-4);
  }

  .connection-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }

  .connection-actions {
    align-self: stretch;
    justify-content: center;
  }
}

/* Focus management for accessibility */
.connection-actions button:focus-visible {
  outline: 2px solid var(--color-neutral-100);
  outline-offset: 2px;
}
</style>
