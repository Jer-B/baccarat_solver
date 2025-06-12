<!--
🎨 Theme-Aware DB Status Component - Over Excellence Level

Modular component that adapts to themes via CSS custom properties.
- Desktop: Floating widget (bottom-left, fixed position)
- Mobile/Tablet: Header badge (top-left corner)
- Automatic theme adaptation via CSS variables
- No theme-specific JavaScript logic
- Elite theme: Enhanced visibility colors
-->

<template>
  <div
    class="db-status"
    :class="{
      'db-status--healthy': connectionHealth.isHealthy.value,
      'db-status--checking': connectionHealth.isChecking.value,
      'db-status--error': !connectionHealth.isHealthy.value && !connectionHealth.isChecking.value,
    }"
    :aria-label="`Database status: ${connectionHealth.connectionStatus.value}`"
  >
    <!-- Status Indicator Dot -->
    <div class="db-status__indicator">
      <div class="db-status__dot"></div>
      <div v-if="connectionHealth.isChecking.value" class="db-status__pulse"></div>
    </div>

    <!-- Status Text -->
    <div class="db-status__text">
      <span class="db-status__status">{{ connectionHealth.connectionStatus.value }}</span>
      <span class="db-status__mode">{{ currentModeText }}</span>
    </div>

    <!-- Retry Button (only when disconnected) -->
    <button
      v-if="!connectionHealth.isHealthy.value && !connectionHealth.isChecking.value"
      @click="handleRetry"
      class="db-status__retry"
      :aria-label="'Retry database connection'"
    >
      ↻
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSupabaseConnectionHealth } from '@/composables/useSupabaseConnectionHealth';
import { hybridSessionRecordingService } from '@/services/hybridSessionRecordingService';

// ==================== COMPOSABLES ====================

const connectionHealth = useSupabaseConnectionHealth();

// ==================== COMPUTED PROPERTIES ====================

/**
 * Gets current mode from hybrid service
 */
const currentModeText = computed(() => {
  const mode = hybridSessionRecordingService.getCurrentMode();
  return mode === 'offline' ? 'Local' : 'Online';
});

// ==================== EVENT HANDLERS ====================

const handleRetry = async () => {
  console.log('[db-status][user-action] Manual retry requested');
  await connectionHealth.retryConnection();
};

// ==================== LIFECYCLE ====================

onMounted(() => {
  console.log('[db-status][mounted] ThemeAwareDbStatus component mounted successfully');
});
</script>

<style scoped>
/* ==================== CSS CUSTOM PROPERTIES (THEME TOKENS) ==================== */

.db-status {
  /* Use Design System CSS Custom Properties */
  --status-healthy-color: var(--theme-health-healthy-color, #00d4aa);
  --status-glow-healthy: var(
    --theme-health-healthy-glow,
    drop-shadow(0 0 4px rgba(0, 212, 170, 0.4))
  );
  --status-background: var(--theme-health-bg, linear-gradient(135deg, #1a1a2e, #16213e));
  --status-border-radius: 12px;
  --status-transition: 300ms ease-out;
  --status-shadow: var(--theme-health-shadow, 0 4px 6px rgba(0, 0, 0, 0.1));
  --status-text-shadow: var(--theme-health-text-shadow, 0 2px 4px rgba(0, 0, 0, 0.4));

  /* Error and checking states use design system colors */
  --status-error-color: var(--theme-health-error-color, #ff6b6b);
  --status-checking-color: var(--theme-health-checking-color, #ffa500);
}

/* Remove theme-specific overrides - design system handles this automatically */

/* ==================== BASE COMPONENT STYLES ==================== */

.db-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--status-background);
  border-radius: var(--status-border-radius);
  box-shadow: var(--status-shadow);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all var(--status-transition);
  z-index: 1000;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--status-healthy-color);
  text-shadow: var(--status-text-shadow);
}

/* ==================== RESPONSIVE POSITIONING - MATCHING REFERENCED COMPONENTS ==================== */

.db-status {
  /* Default position for all screens */
  position: fixed !important;
  z-index: 9999 !important;
}

/* Mobile Portrait: 320px - 479px (20em - 29.9375em) - HIDDEN */
.db-status {
  display: none !important; /* Hide on mobile */
}

/* Mobile Landscape: 480px - 767px (30em - 47.9375em) - HIDDEN */
@media (min-width: 30em) and (max-width: 47.9375em) {
  .db-status {
    display: none !important; /* Hide on mobile landscape */
  }
}

/* Tablet Portrait: 768px - 991px (48em - 61.9375em) - HEADER BADGE TOP-LEFT */
@media (min-width: 48em) and (max-width: 61.9375em) {
  .db-status {
    font-size: 0.6875rem !important;
    padding: 0.5rem 0.75rem !important;
    top: 1rem !important;
    left: 1rem !important; /* Keep in top-left corner */
  }
}

/* Tablet Landscape: 992px - 1199px (62em - 74.9375em) - HEADER BADGE TOP-LEFT */
@media (min-width: 62em) and (max-width: 74.9375em) {
  .db-status {
    display: flex !important; /* Show on desktop */
    top: auto !important;
    right: auto !important;
    bottom: 2rem !important;
    left: 2rem !important;
    min-width: 120px !important;
    font-size: 0.75rem !important;
    padding: 0.5rem 0.75rem !important;
  }
}

/* Small Desktop: 1200px - 1439px (75em - 89.9375em) - FLOATING WIDGET BOTTOM-LEFT */
@media (min-width: 75em) and (max-width: 89.9375em) {
  .db-status {
    display: flex !important; /* Show on desktop */
    top: auto !important;
    right: auto !important;
    bottom: 2rem !important;
    left: 2rem !important;
    min-width: 120px !important;
    font-size: 0.75rem !important;
    padding: 0.5rem 0.75rem !important;
  }

  .db-status__text {
    display: flex !important;
    flex-direction: row !important; /* Same line instead of column */
    gap: 0.25rem !important; /* Space between status and mode */
  }
}

/* Large Desktop: 1440px+ (90em+) - FLOATING WIDGET BOTTOM-LEFT */
@media (min-width: 90em) {
  .db-status {
    display: flex !important; /* Show on desktop */
    top: auto !important;
    right: auto !important;
    bottom: 2rem !important;
    left: 2rem !important;
    min-width: 120px !important;
    font-size: 0.75rem !important;
    padding: 0.5rem 0.75rem !important;
  }

  .db-status__text {
    display: flex !important;
    flex-direction: row !important; /* Same line instead of column */
    gap: 0.25rem !important; /* Space between status and mode */
  }
}

/* ==================== STATUS INDICATOR ==================== */

.db-status__indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
}

.db-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-healthy-color);
  filter: var(--status-glow-healthy);
  transition: all var(--status-transition);
}

.db-status__pulse {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--status-checking-color);
  opacity: 0.6;
  animation: pulse 2s infinite;
}

/* ==================== STATUS TEXT ==================== */

.db-status__text {
  display: flex;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.2;
}

.db-status__status {
  color: var(--status-healthy-color);
  font-weight: 500;
}

.db-status__mode {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

/* ==================== RETRY BUTTON ==================== */

.db-status__retry {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--status-error-color);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--status-transition);
  font-size: 12px;
}

.db-status__retry:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* ==================== STATE VARIATIONS ==================== */

.db-status--healthy .db-status__dot {
  background: var(--status-healthy-color);
  filter: var(--status-glow-healthy);
}

.db-status--checking .db-status__dot {
  background: var(--status-checking-color);
  filter: var(--theme-health-checking-glow, drop-shadow(0 0 4px rgba(255, 165, 0, 0.4)));
}

.db-status--error .db-status__dot {
  background: var(--status-error-color);
  filter: var(--theme-health-error-glow, drop-shadow(0 0 4px rgba(255, 107, 107, 0.4)));
}

.db-status--error .db-status__status {
  color: var(--status-error-color);
}

/* ==================== ANIMATIONS ==================== */

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.2);
  }
}

/* ==================== ACCESSIBILITY ==================== */

@media (prefers-reduced-motion: reduce) {
  .db-status,
  .db-status__dot,
  .db-status__retry {
    transition: none;
  }

  .db-status__pulse {
    animation: none;
  }
}

/* ==================== HOVER EFFECTS ==================== */

.db-status:hover {
  transform: translateY(-1px);
  box-shadow:
    var(--status-shadow),
    0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
