<!-- 🎯 Common Game Header -->
<template>
  <header class="cdd-header" :class="headerThemeClass" data-cy="cdd-header">
    <div class="cdd-header__container">
      <div class="cdd-header__content">
        <!-- DB Health Indicator Dot - Top Left (Mobile/Tablet only) -->
        <div
          class="cdd-header__health-dot"
          :class="{
            'cdd-header__health-dot--healthy': connectionHealth.isHealthy.value,
            'cdd-header__health-dot--checking': connectionHealth.isChecking.value,
            'cdd-header__health-dot--error':
              !connectionHealth.isHealthy.value && !connectionHealth.isChecking.value,
          }"
          :aria-label="`Database status: ${connectionHealth.connectionStatus.value}`"
        >
          <div class="cdd-header__health-indicator">
            <div class="cdd-header__health-circle"></div>
            <div v-if="connectionHealth.isChecking.value" class="cdd-header__health-pulse"></div>
          </div>
        </div>

        <!-- Title -->
        <h1 class="cdd-header__title">🎯 Baccarat Pro</h1>

        <!-- Theme Toggle - Top Right -->
        <div class="cdd-header__actions">
          <CDDThemeToggle />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/themeStore';
import { useSupabaseConnectionHealth } from '@/composables/useSupabaseConnectionHealth';
import CDDThemeToggle from './CDDThemeToggle.vue';

const themeStore = useThemeStore();
const connectionHealth = useSupabaseConnectionHealth();

// Dynamic theme class based on current theme
const headerThemeClass = computed(() => {
  return themeStore.isLuxuryTheme ? 'cdd-header--luxury' : 'cdd-header--elite';
});
</script>

<style scoped>
/* Theme-Aware Header - Uses CSS Custom Properties with Fallbacks */

.cdd-header {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  transition: all 0.3s ease-in-out;
  max-width: 90rem; /* 1440px converted to rem (90 × 16px) */
  min-width: 20rem; /* 320px converted to rem (20 × 16px) */
}

.cdd-header__container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  max-width: 90rem; /* 1440px */
  min-width: 20rem; /* 320px */
}

.cdd-header__content {
  @apply flex items-center justify-between h-16 relative;
  min-width: 17.5rem; /* 280px - Ensure content fits with padding */
}

.cdd-header__title {
  @apply text-2xl font-bold text-white tracking-tight;
  @apply absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2;
  margin: 0;
  line-height: 1.2;
  transition: all 0.3s ease-in-out;
  white-space: nowrap; /* Prevent title wrapping */
  min-width: fit-content; /* Ensure title doesn't compress */
}

.cdd-header__actions {
  @apply ml-auto;
  z-index: 10;
  flex-shrink: 0; /* Prevent theme toggle from shrinking */
}

/* Ensure body has proper min-width to prevent horizontal breaking */
:global(body) {
  min-width: 20rem; /* 320px */
}

/* Modern Luxury Theme - High-tech midnight navy with cyan - Uses CSS Custom Properties with Fallbacks */
.cdd-header--luxury {
  /* Use CSS custom properties with fallbacks */
  background: var(--theme-header-bg, linear-gradient(135deg, #1a1a2e, #16213e, #0f0f23));
  box-shadow: var(
    --theme-header-shadow,
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 20px rgba(0, 212, 170, 0.05)
  );
  border-bottom: 1px solid var(--theme-header-border, rgba(0, 212, 170, 0.15));
}

.cdd-header--luxury .cdd-header__title {
  text-shadow: var(
    --theme-text-shadow,
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 1px 2px rgba(0, 212, 170, 0.2)
  );
  filter: var(--theme-text-glow, drop-shadow(0 0 2px rgba(0, 212, 170, 0.3)));
}

/* Platinum Elite Theme - Uses CSS Custom Properties with Fallbacks */
.cdd-header--elite {
  /* Use CSS custom properties with fallbacks */
  background: var(--theme-header-bg, linear-gradient(135deg, #2c2c2c, #1a1a1a, #0d0d0d));
  box-shadow: var(
    --theme-header-shadow,
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 30px rgba(229, 228, 226, 0.04)
  );
  border-bottom: 1px solid var(--theme-header-border, rgba(229, 228, 226, 0.12));
}

.cdd-header--elite .cdd-header__title {
  text-shadow: var(
    --theme-text-shadow,
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 1px 2px rgba(229, 228, 226, 0.15)
  );
  filter: var(--theme-text-glow, drop-shadow(0 0 2px rgba(229, 228, 226, 0.25)));
}

/* Mobile Portrait: 320px - 479px (20em - 29.9375em) */
@media (max-width: 29.9375em) {
  .cdd-header__title {
    font-size: 1rem; /* 16px - From responsiveTypography.headerTitle.mobilePortrait */
    letter-spacing: 0.01em;
  }

  .cdd-header__content {
    height: 3.25rem; /* 52px */
    min-height: 3rem; /* 48px - Absolute minimum height */
  }

  .cdd-header,
  .cdd-header__container {
    padding-left: 0.5rem; /* 8px */
    padding-right: 0.5rem; /* 8px */
    min-width: 20rem; /* 320px - Hard stop */
  }
}

/* Mobile Landscape: 480px - 767px (30em - 47.9375em) */
@media (min-width: 30em) and (max-width: 47.9375em) {
  .cdd-header__title {
    font-size: 1.125rem; /* 18px - From responsiveTypography.headerTitle.mobileLandscape */
    letter-spacing: 0.015em;
  }

  .cdd-header__content {
    height: 3.5rem; /* 56px */
  }

  .cdd-header,
  .cdd-header__container {
    padding-left: 0.75rem; /* 12px */
    padding-right: 0.75rem; /* 12px */
  }
}

/* Tablet Portrait: 768px - 991px (48em - 61.9375em) */
@media (min-width: 48em) and (max-width: 61.9375em) {
  .cdd-header__title {
    font-size: 1.25rem; /* 20px - From responsiveTypography.headerTitle.tabletPortrait */
    letter-spacing: 0.01em;
  }

  .cdd-header__content {
    height: 3.75rem; /* 60px */
  }
}

/* Tablet Landscape: 992px - 1199px (62em - 74.9375em) */
@media (min-width: 62em) and (max-width: 74.9375em) {
  .cdd-header__title {
    font-size: 1.5rem; /* 24px - From responsiveTypography.headerTitle.tabletLandscape */
    letter-spacing: 0.005em;
  }

  .cdd-header__content {
    height: 4rem; /* 64px */
  }
}

/* Small Desktop: 1200px - 1439px (75em - 89.9375em) */
@media (min-width: 75em) and (max-width: 89.9375em) {
  .cdd-header__title {
    font-size: 1.75rem; /* 28px - From responsiveTypography.headerTitle.smallDesktop */
    letter-spacing: 0;
  }

  .cdd-header__content {
    height: 4.25rem; /* 68px */
  }
}

/* Large Desktop: 1440px - 1919px (90em - 119.9375em) */
@media (min-width: 90em) and (max-width: 119.9375em) {
  .cdd-header__title {
    font-size: 2rem; /* 32px - From responsiveTypography.headerTitle.largeDesktop */
    letter-spacing: -0.005em;
  }

  .cdd-header__content {
    height: 4.5rem; /* 72px */
  }

  .cdd-header,
  .cdd-header__container {
    max-width: 90rem; /* 1440px - Prevent over-stretching */
    margin-left: auto;
    margin-right: auto;
  }
}

/* Ultra-Wide Desktop: 1920px+ (120em+) */
@media (min-width: 120em) {
  .cdd-header__title {
    font-size: 2.25rem; /* 36px - From responsiveTypography.headerTitle.ultraWideDesktop - Capped */
    letter-spacing: -0.005em;
  }

  .cdd-header__content {
    height: 4.75rem; /* 76px */
  }

  .cdd-header,
  .cdd-header__container {
    max-width: 90rem; /* 1440px - Prevent over-stretching */
    margin-left: auto;
    margin-right: auto;
  }
}

/* High DPI / Retina Displays - Crisp rendering */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .cdd-header__title {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Prevent layout breaking on extremely small screens - 319px */
@media (max-width: 19.9375em) {
  .cdd-header,
  .cdd-header__container,
  .cdd-header__content {
    min-width: 20rem; /* 320px - Force minimum width, allow horizontal scroll */
  }

  .cdd-header__title {
    font-size: 0.875rem; /* 14px - Absolute minimum readable size */
    letter-spacing: 0;
  }
}

/* ==================== HEALTH INDICATOR DOT STYLES ==================== */

.cdd-header__health-dot {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.cdd-header__health-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
}

.cdd-header__health-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 300ms ease-out;
}

.cdd-header__health-pulse {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  opacity: 0.6;
  animation: headerHealthPulse 2s infinite;
}

/* Health States - Luxury Theme */
.cdd-header--luxury .cdd-header__health-dot--healthy .cdd-header__health-circle {
  background: var(--theme-health-healthy-color, #00d4aa);
  filter: var(--theme-health-healthy-glow, drop-shadow(0 0 4px rgba(0, 212, 170, 0.6)));
}

.cdd-header--luxury .cdd-header__health-dot--checking .cdd-header__health-circle {
  background: var(--theme-health-checking-color, #ffa500);
  filter: var(--theme-health-checking-glow, drop-shadow(0 0 4px rgba(255, 165, 0, 0.6)));
}

.cdd-header--luxury .cdd-header__health-dot--checking .cdd-header__health-pulse {
  background: var(--theme-health-checking-color, #ffa500);
}

.cdd-header--luxury .cdd-header__health-dot--error .cdd-header__health-circle {
  background: var(--theme-health-error-color, #ff6b6b);
  filter: var(--theme-health-error-glow, drop-shadow(0 0 4px rgba(255, 107, 107, 0.6)));
}

/* Health States - Elite Theme (Enhanced Visibility) */
.cdd-header--elite .cdd-header__health-dot--healthy .cdd-header__health-circle {
  background: var(--theme-health-healthy-color, #4ade80);
  filter: var(--theme-health-healthy-glow, drop-shadow(0 0 6px rgba(74, 222, 128, 0.8)));
}

.cdd-header--elite .cdd-header__health-dot--checking .cdd-header__health-circle {
  background: var(--theme-health-checking-color, #fbbf24);
  filter: var(--theme-health-checking-glow, drop-shadow(0 0 4px rgba(251, 191, 36, 0.6)));
}

.cdd-header--elite .cdd-header__health-dot--checking .cdd-header__health-pulse {
  background: var(--theme-health-checking-color, #fbbf24);
}

.cdd-header--elite .cdd-header__health-dot--error .cdd-header__health-circle {
  background: var(--theme-health-error-color, #f87171);
  filter: var(--theme-health-error-glow, drop-shadow(0 0 4px rgba(248, 113, 113, 0.6)));
}

/* Hide health dot on desktop (9900px+) - Desktop uses floating widget instead */
@media (min-width: 62em) {
  .cdd-header__health-dot {
    display: none !important;
  }
}

/* Pulse animation for checking state */
@keyframes headerHealthPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.3);
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .cdd-header__health-circle {
    transition: none;
  }

  .cdd-header__health-pulse {
    animation: none;
  }
}
</style>
