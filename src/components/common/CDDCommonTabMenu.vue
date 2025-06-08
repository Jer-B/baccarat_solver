<!-- Common Tab Menu -->
<template>
  <nav class="cdd-tab-menu" :class="tabMenuThemeClass" data-cy="tab-menu">
    <div class="cdd-tab-menu__container">
      <div class="cdd-tab-menu__content">
        <!-- Centered Navigation Tabs -->
        <div class="cdd-tab-menu__tabs">
          <router-link
            to="/cdd/game"
            data-cy="tab-game"
            class="cdd-tab-link"
            :class="[
              isActiveTab('/cdd/game') ? 'cdd-tab-link--active' : 'cdd-tab-link--inactive',
              themeStore.isLuxuryTheme ? 'cdd-tab-link--luxury' : 'cdd-tab-link--elite',
            ]"
          >
            <span class="cdd-tab-link__text">Game</span>
          </router-link>

          <router-link
            to="/cdd/history"
            data-cy="tab-history"
            class="cdd-tab-link"
            :class="[
              isActiveTab('/cdd/history') ? 'cdd-tab-link--active' : 'cdd-tab-link--inactive',
              themeStore.isLuxuryTheme ? 'cdd-tab-link--luxury' : 'cdd-tab-link--elite',
            ]"
          >
            <span class="cdd-tab-link__text">History</span>
          </router-link>

          <router-link
            to="/cdd/settings"
            data-cy="tab-settings"
            class="cdd-tab-link"
            :class="[
              isActiveTab('/cdd/settings') ? 'cdd-tab-link--active' : 'cdd-tab-link--inactive',
              themeStore.isLuxuryTheme ? 'cdd-tab-link--luxury' : 'cdd-tab-link--elite',
            ]"
          >
            <span class="cdd-tab-link__text">Settings</span>
          </router-link>
        </div>

        <!-- Action Button - Switch to Original -->
        <div class="cdd-tab-menu__actions">
          <!-- Switch to Original Button -->
          <button
            @click="switchToOriginal"
            class="cdd-switch-btn"
            :class="themeStore.isLuxuryTheme ? 'cdd-switch-btn--luxury' : 'cdd-switch-btn--elite'"
            title="Switch to Original Implementation"
            data-cy="switch-to-original"
          >
            <span class="cdd-switch-btn__icon">⬅️</span>
            <span class="cdd-switch-btn__text">Original</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useThemeStore } from '@/stores/themeStore';

const router = useRouter();
const route = useRoute();
const themeStore = useThemeStore();

// Dynamic theme class
const tabMenuThemeClass = computed(() => {
  return themeStore.isLuxuryTheme ? 'cdd-tab-menu--luxury' : 'cdd-tab-menu--elite';
});

// Navigation logic
const isActiveTab = (path: string): boolean => {
  return route.path === path;
};

const switchToOriginal = (): void => {
  // Switch to corresponding original page
  if (route.path === '/cdd/history') {
    router.push('/history');
  } else {
    router.push('/game');
  }
};
</script>

<style scoped>
/* Theme-Aware Tab Menu - Uses CSS Custom Properties with Fallbacks */

.cdd-tab-menu {
  @apply bg-white shadow-sm;
  transition: all 0.3s ease-in-out;
}

.cdd-tab-menu__container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.cdd-tab-menu__content {
  @apply flex items-center justify-center relative h-12;
}

.cdd-tab-menu__tabs {
  @apply flex space-x-8;
}

.cdd-tab-menu__actions {
  @apply absolute right-0 flex items-center space-x-3;
}

/* Base Tab Link Styles */
.cdd-tab-link {
  @apply flex items-center justify-center px-6 py-3 text-sm font-medium;
  @apply rounded-t-lg border-b-2 border-transparent;
  @apply transition-all duration-300 ease-in-out;
  text-decoration: none !important;
  outline: none;
}

.cdd-tab-link__text {
  @apply select-none;
}

/* Remove visited link styling */
.cdd-tab-link:visited {
  color: inherit;
}

/* Modern Luxury Theme Styles - Uses CSS Custom Properties with Fallbacks */
.cdd-tab-menu--luxury {
  border-bottom: 1px solid var(--theme-tab-menu-border, rgba(0, 212, 170, 0.12));
  background: var(--theme-tab-menu-bg, linear-gradient(to bottom, #ffffff, #fefffe));
}

.cdd-tab-link--luxury.cdd-tab-link--inactive {
  @apply text-gray-600 hover:text-gray-800;
  background: var(
    --theme-tab-inactive-bg,
    linear-gradient(to bottom, transparent, rgba(0, 212, 170, 0.02))
  );
}

.cdd-tab-link--luxury.cdd-tab-link--inactive:hover {
  background: var(
    --theme-tab-inactive-hover-bg,
    linear-gradient(to bottom, rgba(0, 212, 170, 0.06), rgba(0, 212, 170, 0.12))
  );
  color: var(--theme-tab-inactive-hover-color, #16213e);
  box-shadow: var(--theme-tab-inactive-hover-shadow, 0 0 10px rgba(0, 212, 170, 0.1));
}

.cdd-tab-link--luxury.cdd-tab-link--active {
  color: var(--theme-tab-active-color, #00d4aa);
  background: var(
    --theme-tab-active-bg,
    linear-gradient(to bottom, rgba(0, 212, 170, 0.08), rgba(0, 212, 170, 0.15))
  );
  border-bottom-color: var(--theme-tab-active-border, #00d4aa);
  font-weight: 600;
  text-shadow: var(--theme-tab-active-text-shadow, 0 1px 2px rgba(0, 212, 170, 0.3));
  box-shadow: var(--theme-tab-active-shadow, 0 0 15px rgba(0, 212, 170, 0.15));
}

.cdd-tab-link--luxury:focus-visible {
  outline: 2px solid var(--theme-tab-active-color, #00d4aa);
  outline-offset: 2px;
}

/* Platinum Elite Theme Styles - Uses CSS Custom Properties with Fallbacks */
.cdd-tab-menu--elite {
  border-bottom: 1px solid var(--theme-tab-menu-border, rgba(229, 228, 226, 0.15));
  background: var(--theme-tab-menu-bg, linear-gradient(to bottom, #ffffff, #fafafa));
}

.cdd-tab-link--elite.cdd-tab-link--inactive {
  @apply text-gray-600 hover:text-gray-800;
  background: var(
    --theme-tab-inactive-bg,
    linear-gradient(to bottom, transparent, rgba(229, 228, 226, 0.02))
  );
}

.cdd-tab-link--elite.cdd-tab-link--inactive:hover {
  background: var(
    --theme-tab-inactive-hover-bg,
    linear-gradient(to bottom, rgba(229, 228, 226, 0.08), rgba(229, 228, 226, 0.15))
  );
  color: var(--theme-tab-inactive-hover-color, #2c2c2c);
  box-shadow: var(--theme-tab-inactive-hover-shadow, 0 0 15px rgba(229, 228, 226, 0.1));
}

.cdd-tab-link--elite.cdd-tab-link--active {
  color: var(--theme-tab-active-color);
  background: var(--theme-tab-active-bg);
  border-bottom-color: var(--theme-tab-active-border);
  font-weight: 600;
  text-shadow: var(--theme-tab-active-text-shadow);
  filter: var(--theme-tab-active-text-glow);
  box-shadow: var(--theme-tab-active-shadow);

  /* Fallbacks */
  color: #000000;
  background: #ffffff;
  border-bottom-color: #000000;
  filter: drop-shadow(0 0 8px rgba(229, 228, 226, 0.6));
}

.cdd-tab-link--elite:focus-visible {
  outline: 2px solid var(--theme-tab-active-color, #e5e4e2);
  outline-offset: 2px;
}

/* Switch Button Styles - Uses CSS Custom Properties with Fallbacks */
.cdd-switch-btn {
  @apply inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg;
  @apply transition-all duration-300 ease-in-out;
  border: 1px solid transparent;
}

.cdd-switch-btn__icon {
  @apply text-base;
}

.cdd-switch-btn__text {
  @apply font-medium;
}

/* Modern Luxury Switch Button - Uses CSS Custom Properties with Fallbacks */
.cdd-switch-btn--luxury {
  background: var(--theme-switch-bg, linear-gradient(135deg, #1a1a2e, #16213e));
  color: var(--theme-switch-color, #00d4aa);
  border-color: var(--theme-switch-border, rgba(0, 212, 170, 0.25));
  text-shadow: var(--theme-switch-text-shadow, 0 1px 2px rgba(0, 0, 0, 0.4));
  box-shadow: var(--theme-switch-shadow, 0 0 10px rgba(0, 212, 170, 0.1));
}

.cdd-switch-btn--luxury:hover {
  background: var(--theme-switch-hover-bg, linear-gradient(135deg, #1e1e35, #1a253f));
  color: var(--theme-switch-hover-color, #00fff7);
  border-color: var(--theme-switch-hover-border, rgba(0, 255, 247, 0.4));
  transform: translateY(-1px);
  box-shadow: var(
    --theme-switch-hover-shadow,
    0 4px 12px rgba(0, 212, 170, 0.2),
    0 0 20px rgba(0, 255, 247, 0.15)
  );
}

/* Platinum Elite Switch Button - Uses CSS Custom Properties with Fallbacks */
.cdd-switch-btn--elite {
  background: var(--theme-switch-bg, linear-gradient(135deg, #2c2c2c, #1a1a1a));
  color: var(--theme-switch-color, #e5e4e2);
  border-color: var(--theme-switch-border, rgba(229, 228, 226, 0.2));
  text-shadow: var(--theme-switch-text-shadow, 0 1px 2px rgba(0, 0, 0, 0.6));
  box-shadow: var(--theme-switch-shadow, 0 0 15px rgba(229, 228, 226, 0.05));
}

.cdd-switch-btn--elite:hover {
  background: var(--theme-switch-hover-bg, linear-gradient(135deg, #333333, #1f1f1f));
  color: var(--theme-switch-hover-color, #f8f8ff);
  border-color: var(--theme-switch-hover-border, rgba(248, 248, 255, 0.3));
  transform: translateY(-1px);
  box-shadow: var(
    --theme-switch-hover-shadow,
    0 4px 20px rgba(229, 228, 226, 0.15),
    0 0 30px rgba(248, 248, 255, 0.1)
  );
}

.cdd-switch-btn:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 640px) {
  .cdd-switch-btn__text {
    @apply hidden;
  }

  .cdd-switch-btn {
    @apply px-3;
  }

  .cdd-tab-menu__actions {
    @apply space-x-2;
  }
}
</style>
