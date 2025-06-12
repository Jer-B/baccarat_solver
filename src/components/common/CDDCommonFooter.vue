<!-- 🎯 Common Footer -->
<template>
  <footer class="cdd-footer" :class="footerThemeClass" data-cy="cdd-footer">
    <div class="cdd-footer__container">
      <div class="cdd-footer__content">
        <!-- GitHub Link with Logo -->
        <div class="cdd-footer__github">
          <a
            href="https://github.com/jer-b"
            target="_blank"
            rel="noopener noreferrer"
            class="cdd-footer__link"
            aria-label="Visit GitHub Profile"
          >
            <svg
              class="cdd-footer__github-icon"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="cdd-footer__github-text">github.com/jer-b</span>
          </a>
        </div>

        <!-- Copyright Year -->
        <div class="cdd-footer__copyright">
          <span>© {{ currentYear }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();

// Dynamic theme class based on current theme
const footerThemeClass = computed(() => {
  return themeStore.isLuxuryTheme ? 'cdd-footer--luxury' : 'cdd-footer--elite';
});

// Current year
const currentYear = new Date().getFullYear();
</script>

<style scoped>
/* Theme-Aware Footer - Uses CSS Custom Properties with Fallbacks */

.cdd-footer {
  /* Full width like header - no max-width constraint */
  width: 100%;
  transition: all 0.3s ease-in-out;
  /* Move border to footer element for proper visibility */
  border-top: 3px solid rgba(255, 255, 255, 0.1);
  /* Eliminate gap between content and footer */
  margin-top: -1px;
}

.cdd-footer__container {
  /* Remove width constraints that cause sharp cutoff */
  width: 100%;
}

.cdd-footer__content {
  @apply flex items-center justify-center py-6;
  /* Full width content to match header */
  width: 100%;
  max-width: 7xl; /* Same as header content constraint */
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
  min-width: 17.5rem; /* 280px - Ensure content fits with padding */
  max-height: 4rem; /* 80px max height - significantly increased */
  gap: 1rem; /* More space between GitHub link and copyright */
}

.cdd-footer__github {
  @apply flex items-center;
}

.cdd-footer__link {
  @apply flex items-center space-x-2 text-sm font-medium transition-colors;
  text-decoration: none;
}

.cdd-footer__github-icon {
  @apply w-4 h-4;
  transition: all 0.3s ease-in-out;
}

.cdd-footer__github-text {
  @apply text-xs sm:text-sm;
  /* Always visible - no hiding on mobile */
}

.cdd-footer__copyright {
  @apply text-sm font-medium;
  transition: all 0.3s ease-in-out;
}

/* Modern Luxury Theme - High-tech midnight navy with cyan */
.cdd-footer--luxury {
  /* Use same header background gradient with CSS custom properties */
  background: var(--theme-header-bg, linear-gradient(135deg, #1a1a2e, #16213e, #0f0f23));
  /* Clean, prominent border for clear separation */
  border-top: 2px solid rgba(0, 212, 170, 0.9);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 20px rgba(0, 212, 170, 0.05),
    inset 0 8px 16px rgba(0, 0, 0, 0.15);
  color: rgba(255, 255, 255, 0.8);
}

.cdd-footer--luxury .cdd-footer__link {
  color: var(--theme-text-primary, #00d4aa);
}

.cdd-footer--luxury .cdd-footer__link:hover {
  color: var(--theme-primary-hover, #00fff7);
}

.cdd-footer--luxury .cdd-footer__github-icon:hover {
  filter: var(--theme-text-glow, drop-shadow(0 0 2px rgba(0, 212, 170, 0.3)));
  transform: scale(1.05);
}

.cdd-footer--luxury .cdd-footer__copyright {
  color: rgba(255, 255, 255, 0.6);
}

/* Platinum Elite Theme */
.cdd-footer--elite {
  /* Use same header background gradient with CSS custom properties */
  background: var(--theme-header-bg, linear-gradient(135deg, #2c2c2c, #1a1a1a, #0d0d0d));
  /* Clean, prominent border for clear separation */
  border-top: 2px solid rgba(229, 228, 226, 0.9);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 30px rgba(229, 228, 226, 0.04),
    inset 0 8px 16px rgba(0, 0, 0, 0.15);
  color: rgba(229, 228, 226, 0.7);
}

.cdd-footer--elite .cdd-footer__link {
  color: var(--theme-text-primary, #e5e4e2);
}

.cdd-footer--elite .cdd-footer__link:hover {
  color: var(--theme-primary-hover, #f5f4f2);
}

.cdd-footer--elite .cdd-footer__github-icon:hover {
  filter: var(--theme-text-glow, drop-shadow(0 0 2px rgba(229, 228, 226, 0.25)));
  transform: scale(1.05);
}

.cdd-footer--elite .cdd-footer__copyright {
  color: rgba(229, 228, 226, 0.5);
}

/* Mobile Portrait: 320px - 479px (20em - 29.9375em) */
@media (max-width: 29.9375em) {
  .cdd-footer__content {
    @apply py-4;
    /* Keep horizontal layout - no flex-col */
    gap: 0.5rem; /* Reduce gap on mobile for better fit */
  }

  .cdd-footer__github {
    @apply justify-center;
  }

  .cdd-footer__copyright {
    @apply text-center;
  }

  .cdd-footer,
  .cdd-footer__container {
    padding-left: 0.5rem; /* 8px */
    padding-right: 0.5rem; /* 8px */
    min-width: 20rem; /* 320px - Hard stop */
  }
}

/* Mobile Landscape: 480px - 767px (30em - 47.9375em) */
@media (min-width: 30em) and (max-width: 47.9375em) {
  .cdd-footer,
  .cdd-footer__container {
    padding-left: 0.75rem; /* 12px */
    padding-right: 0.75rem; /* 12px */
  }
}

/* Ensure body has proper min-width to prevent horizontal breaking */
:global(body) {
  min-width: 20rem; /* 320px */
}
</style>
