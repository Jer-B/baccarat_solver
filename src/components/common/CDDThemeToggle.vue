<!-- Theme Toggle - Luxury/Elite Slider with Sophisticated Edge Animation -->
<template>
  <div class="theme-toggle">
    <div
      class="theme-toggle__track"
      :class="
        themeStore.isLuxuryTheme ? 'theme-toggle__track--luxury' : 'theme-toggle__track--elite'
      "
      @click="themeStore.toggleTheme()"
      data-cy="theme-toggle"
    >
      <!-- Background Labels -->
      <div class="theme-toggle__labels">
        <span class="theme-toggle__label theme-toggle__label--left">
          <span class="theme-toggle__icon">🌙</span>
          <span class="theme-toggle__text">Luxury</span>
        </span>
        <span class="theme-toggle__label theme-toggle__label--right">
          <span class="theme-toggle__icon">💎</span>
          <span class="theme-toggle__text">Elite</span>
        </span>
      </div>

      <!-- Sliding Indicator with Sophisticated Asymmetric Borders -->
      <div
        class="theme-toggle__slider"
        :class="
          themeStore.isLuxuryTheme ? 'theme-toggle__slider--luxury' : 'theme-toggle__slider--elite'
        "
      >
        <span class="theme-toggle__slider-icon">
          {{ themeStore.isLuxuryTheme ? '🌙' : '💎' }}
        </span>
        <span class="theme-toggle__slider-text">
          {{ themeStore.isLuxuryTheme ? 'Luxury' : 'Elite' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore';
import { transitionSets } from '@/cdd-design-system/tokens/animations';

const themeStore = useThemeStore();
</script>

<style scoped>
/* Theme-Aware Toggle - CSS Custom Properties with Consistent Fallbacks */

.theme-toggle {
  display: flex;
  align-items: center;
}

.theme-toggle__track {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
  border: 1px solid;
  /* Default desktop size - Increased width for better text spacing */
  width: 10rem; /* 160px - increased from 140px */
  height: 2rem; /* 32px */
}

.theme-toggle__track:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
}

.theme-toggle__labels {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem; /* Increased from 0.5rem for better text spacing */
  z-index: 1;
}

.theme-toggle__label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem; /* 11px */
  font-weight: 500;
  transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
  opacity: 0.6;
}

.theme-toggle__icon {
  font-size: 0.75rem;
}

.theme-toggle__text {
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* Sophisticated Slider with Asymmetric Borders - Perfect Container Fit */
.theme-toggle__slider {
  position: absolute;
  top: 1px; /* Perfect fit - matches border width */
  left: 1px; /* Perfect fit - matches border width */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  /* Use centralized animation tokens */
  transition: v-bind('transitionSets.toggleSlide');
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  /* Default desktop size - Perfect container fit */
  width: calc(50% - 1px); /* 50% minus border compensation */
  height: calc(100% - 2px); /* Full height minus top/bottom borders */
  z-index: 2;

  /* Asymmetric Border Radius - Luxury Position: Left Rounded, Right Vertical */
  border-radius: calc(1.5rem - 4px) 0.125rem 0.125rem calc(1.5rem - 4px);
}

.theme-toggle__slider--elite {
  /* Move to right side with correct positioning for smaller width */
  transform: translateX(calc(100% + 1px)); /* Adjusted for 45% width */

  /* Reduced width for Elite - narrower than Luxury */
  width: calc(49.2% - 1px); /* 45% instead of 50% for more text breathing room */

  /* Elite Position: Left Vertical, Right Rounded */
  border-radius: 0.125rem calc(1.5rem - 4px) calc(1.5rem - 4px) 0.125rem;
}

.theme-toggle__slider-icon {
  font-size: 0.75rem;
  filter: brightness(1.1);
}

.theme-toggle__slider-text {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.025em;
}

/* Modern Luxury Theme Styles - Consistent CSS Custom Properties */
.theme-toggle__track--luxury {
  background: var(--theme-track-bg);
  border-color: var(--theme-track-border);
  box-shadow: var(--theme-track-shadow);

  /* Fallback styles (only apply when CSS custom properties aren't available) */
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-color: rgba(0, 212, 170, 0.25);
}

.theme-toggle__track--luxury .theme-toggle__label {
  color: var(--theme-text-secondary);

  /* Fallback */
  color: rgba(0, 212, 170, 0.7);
}

.theme-toggle__track--luxury .theme-toggle__label--left {
  opacity: 1;
  color: var(--theme-text-primary);

  /* Fallback */
  color: #00d4aa;
}

.theme-toggle__slider--luxury {
  background: var(--theme-slider-bg);
  color: var(--theme-slider-text-color);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  box-shadow: var(--theme-slider-shadow);

  /* Fallbacks */
  background: linear-gradient(135deg, #00d4aa, #00b894);
  color: #1a1a2e;
}

.theme-toggle__track--luxury:hover {
  border-color: var(--theme-track-border-hover);
  box-shadow: var(--theme-track-shadow-hover);

  /* Fallback */
  border-color: rgba(0, 255, 247, 0.4);
}

/* Platinum Elite Theme Styles - Consistent CSS Custom Properties */
.theme-toggle__track--elite {
  background: var(--theme-track-bg);
  border-color: var(--theme-track-border);
  box-shadow: var(--theme-track-shadow);

  /* Fallback styles */
  background: linear-gradient(135deg, #2c2c2c, #1a1a1a);
  border-color: rgba(229, 228, 226, 0.2);
}

.theme-toggle__track--elite .theme-toggle__label {
  color: var(--theme-text-secondary);

  /* Fallback */
  color: rgba(229, 228, 226, 0.6);
}

.theme-toggle__track--elite .theme-toggle__label--right {
  opacity: 1;
  color: var(--theme-text-primary);

  /* Fallback */
  color: #e5e4e2;
}

.theme-toggle__slider--elite {
  background: var(--theme-slider-bg);
  color: var(--theme-slider-text-color);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  box-shadow: var(--theme-slider-shadow);

  /* Fallbacks */
  background: linear-gradient(135deg, #e5e4e2, #d3d3d3);
  color: #2c2c2c;
}

.theme-toggle__track--elite:hover {
  border-color: var(--theme-track-border-hover);
  box-shadow: var(--theme-track-shadow-hover);

  /* Fallback */
  border-color: rgba(248, 248, 255, 0.3);
}

/* Sophisticated Press Animation - Prevents Text Bleed */
.theme-toggle__track:active .theme-toggle__slider {
  /* Prevent shrinking that exposes background text */
  transform: translateX(1px) scale(0.98);

  /* Add subtle glow instead of size change */
  filter: brightness(1.1);
}

.theme-toggle__track:active .theme-toggle__slider--elite {
  transform: translateX(calc(49.2% + 1px)) scale(0.98);
  filter: brightness(1.1);
}

/* 🎯 DESIGN SYSTEM BREAKPOINTS - Responsive Container Fit */

/* Mobile Portrait: 320px - 479px (20em - 29.9375em) */
@media (max-width: 29.9375em) {
  .theme-toggle__track {
    width: 3rem; /* 48px - increased from 44px */
    height: 1.375rem;
    min-width: 3rem;
  }

  .theme-toggle__slider {
    border-radius: calc(0.6875rem - 3px) 0.0625rem 0.0625rem calc(0.6875rem - 3px);
  }

  .theme-toggle__slider--elite {
    border-radius: 0.0625rem calc(0.6875rem - 3px) calc(0.6875rem - 3px) 0.0625rem;
  }

  .theme-toggle__track:active .theme-toggle__slider--elite {
    transform: translateX(calc(49.2% + 1px)) scale(0.98);
  }

  .theme-toggle__text,
  .theme-toggle__slider-text {
    display: none;
  }

  .theme-toggle__labels {
    padding: 0 0.1875rem;
  }

  .theme-toggle__icon,
  .theme-toggle__slider-icon {
    font-size: 0.5625rem;
  }
}

/* Mobile Landscape: 480px - 767px (30em - 47.9375em) */
@media (min-width: 30em) and (max-width: 47.9375em) {
  .theme-toggle__track {
    width: 4.25rem; /* 68px - increased from 60px */
    height: 1.75rem;
  }

  .theme-toggle__slider {
    border-radius: calc(0.875rem - 3px) 0.0625rem 0.0625rem calc(0.875rem - 3px);
  }

  .theme-toggle__slider--elite {
    border-radius: 0.0625rem calc(0.875rem - 3px) calc(0.875rem - 3px) 0.0625rem;
  }

  .theme-toggle__track:active .theme-toggle__slider--elite {
    transform: translateX(calc(49.2% + 1px)) scale(0.98);
  }

  .theme-toggle__text,
  .theme-toggle__slider-text {
    display: none;
  }

  .theme-toggle__labels {
    padding: 0 0.375rem;
  }

  .theme-toggle__icon,
  .theme-toggle__slider-icon {
    font-size: 0.6875rem;
  }
}

/* Tablet Portrait: 768px - 991px (48em - 61.9375em) */
@media (min-width: 48em) and (max-width: 61.9375em) {
  .theme-toggle__track {
    width: 7.5rem; /* 120px - increased from 110px */
    height: 1.875rem;
  }

  .theme-toggle__slider {
    border-radius: calc(0.9375rem - 3px) 0.125rem 0.125rem calc(0.9375rem - 3px);
  }

  .theme-toggle__slider--elite {
    border-radius: 0.125rem calc(0.9375rem - 3px) calc(0.9375rem - 3px) 0.125rem;
  }

  .theme-toggle__track:active .theme-toggle__slider--elite {
    transform: translateX(calc(49.2% + 1px)) scale(0.98);
  }

  .theme-toggle__text,
  .theme-toggle__slider-text {
    font-size: 0.5625rem;
  }

  .theme-toggle__icon,
  .theme-toggle__slider-icon {
    font-size: 0.6875rem;
  }

  .theme-toggle__labels {
    padding: 0 0.4375rem;
  }
}

/* Tablet Landscape: 992px - 1199px (62em - 74.9375em) */
@media (min-width: 62em) and (max-width: 74.9375em) {
  .theme-toggle__track {
    width: 9rem; /* 144px - increased from 130px */
    height: 2rem;
  }

  .theme-toggle__slider {
    border-radius: calc(1rem - 3px) 0.125rem 0.125rem calc(1rem - 3px);
  }

  .theme-toggle__slider--elite {
    border-radius: 0.125rem calc(1rem - 3px) calc(1rem - 3px) 0.125rem;
  }

  .theme-toggle__track:active .theme-toggle__slider--elite {
    transform: translateX(calc(49.2% + 1px)) scale(0.98);
  }

  .theme-toggle__text,
  .theme-toggle__slider-text {
    font-size: 0.625rem;
  }

  .theme-toggle__icon,
  .theme-toggle__slider-icon {
    font-size: 0.75rem;
  }
}

/* Small Desktop: 1200px - 1439px (75em - 89.9375em) */
@media (min-width: 75em) and (max-width: 89.9375em) {
  .theme-toggle__track {
    width: 10rem; /* 160px - increased from 140px */
    height: 2rem;
  }

  .theme-toggle__slider {
    border-radius: calc(1rem - 3px) 0.125rem 0.125rem calc(1rem - 3px);
  }

  .theme-toggle__slider--elite {
    border-radius: 0.125rem calc(1rem - 3px) calc(1rem - 3px) 0.125rem;
  }

  .theme-toggle__track:active .theme-toggle__slider--elite {
    transform: translateX(calc(49.2% + 1px)) scale(0.98);
  }
}

/* Large Desktop: 1440px+ (90em+) */
@media (min-width: 90em) {
  .theme-toggle__track {
    width: 10.5rem; /* 168px - increased from 150px */
    height: 2.125rem;
  }

  .theme-toggle__slider {
    border-radius: calc(1.0625rem - 4px) 0.125rem 0.125rem calc(1.0625rem - 4px);
  }

  .theme-toggle__slider--elite {
    border-radius: 0.125rem calc(1.0625rem - 4px) calc(1.0625rem - 4px) 0.125rem;
  }

  .theme-toggle__track:active .theme-toggle__slider--elite {
    transform: translateX(calc(49.2% + 1px)) scale(0.98);
  }

  .theme-toggle__text,
  .theme-toggle__slider-text {
    font-size: 0.6875rem;
  }

  .theme-toggle__icon,
  .theme-toggle__slider-icon {
    font-size: 0.8125rem;
  }
}

/* Prevent toggle breaking on extremely small screens - 319px */
@media (max-width: 19.9375em) {
  .theme-toggle,
  .theme-toggle__track {
    min-width: 3rem; /* Increased minimum width */
  }

  .theme-toggle__track {
    width: 3rem;
    height: 1.375rem;
  }

  .theme-toggle__slider {
    border-radius: calc(0.6875rem - 3px) 0.0625rem 0.0625rem calc(0.6875rem - 3px);
  }

  .theme-toggle__slider--elite {
    border-radius: 0.0625rem calc(0.6875rem - 3px) calc(0.6875rem - 3px) 0.0625rem;
  }

  .theme-toggle__icon,
  .theme-toggle__slider-icon {
    font-size: 0.5rem;
  }
}

/* High DPI / Retina Displays - Crisp rendering */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .theme-toggle__track,
  .theme-toggle__slider {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
</style>
