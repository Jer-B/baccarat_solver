/**
 * 🎯 Theme Store - Excellence-Level Pinia Store
 *
 * Advanced theme management with comprehensive error handling, validation,
 * persistence, and reactive state management using the new type system.
 */

import { defineStore } from 'pinia';
import { ref, computed, watch, nextTick } from 'vue';
import type { ThemeMode } from '@/types';
import { THEME_CONSTANTS, THEME_DISPLAY_INFO } from '@/types';
import {
  validateThemeMode,
  validateThemeEnvironment,
  safeThemeOperation,
  retryThemeOperation,
  ThemeErrorHandler,
  createThemeError,
} from '@/utils';
import { ThemeErrorType, ThemeErrorSeverity } from '@/types';
import { persistenceConfig } from '@/config/persistence';

/**
 * 🎯 Theme Store - Luxury/Elite Theme Switcher
 *
 * Theme Options:
 * - Modern Luxury: High-tech midnight navy with cyan
 * - Platinum Elite: Ultimate sophistication
 *
 * Modern Luxury Theme Features:
 * - Premium Tech Feel - Like a high-end fintech or crypto app
 * - Sophisticated Colors - Navy conveys trust and professionalism
 * - Electric Accents - Cyan adds modern, cutting-edge vibe
 * - Glow Effects - Subtle sci-fi touches for premium feel
 *
 * Platinum Elite Theme Features:
 * - Ultra-Premium Feel - Like a private banking app or luxury tech platform
 * - Sophisticated Colors - Black conveys ultimate exclusivity and power
 * - Platinum Accents - Subtle, refined luxury without flashiness
 * - Elegant Shadows - Sophisticated, understated visual depth
 */

// ==================== STORE IMPLEMENTATION ====================

const storeDefinition = () => {
  // ==================== REACTIVE STATE ====================

  const currentTheme = ref<ThemeMode>(THEME_CONSTANTS.DEFAULT_THEME);
  const isInitialized = ref(false);
  const initializationError = ref<string | null>(null);
  const isLoading = ref(false);

  // ==================== ERROR HANDLER INTEGRATION ====================

  const errorHandler = ThemeErrorHandler.getInstance();

  // ==================== PRIVATE UTILITIES ====================

  /**
   * Apply theme to document element with validation
   */
  const applyThemeToDocument = async (theme: ThemeMode): Promise<void> => {
    const result = await safeThemeOperation(
      async () => {
        const envResult = validateThemeEnvironment({ component: 'themeStore' });
        if (!envResult.success) {
          throw new Error(`DOM environment validation failed: ${envResult.error.message}`);
        }

        if (envResult.data.dom.documentElement) {
          envResult.data.dom.documentElement.setAttribute(THEME_CONSTANTS.DATA_ATTRIBUTE, theme);
        }

        console.log('[theme-store][apply] Theme applied to document', {
          theme,
          timestamp: new Date().toISOString(),
        });
      },
      'applyThemeToDocument',
      { component: 'themeStore', operation: 'apply-theme' }
    );

    if (!result.success) {
      await errorHandler.handleError(result.error);
    }
  };

  /**
   * Validate and set theme with comprehensive error handling
   */
  const validateAndSetTheme = async (theme: ThemeMode): Promise<void> => {
    const validationResult = validateThemeMode(theme, {
      component: 'themeStore',
      operation: 'validate-and-set',
    });

    if (!validationResult.success) {
      await errorHandler.handleError(validationResult.error);
      return;
    }

    currentTheme.value = validationResult.data;
    await applyThemeToDocument(validationResult.data);
  };

  // ==================== COMPUTED GETTERS ====================

  const isLuxuryTheme = computed(() => currentTheme.value === 'luxury');
  const isEliteTheme = computed(() => currentTheme.value === 'elite');

  const themeDisplayName = computed(() => THEME_DISPLAY_INFO[currentTheme.value].name);
  const themeDescription = computed(() => THEME_DISPLAY_INFO[currentTheme.value].description);
  const themeIcon = computed(() => THEME_DISPLAY_INFO[currentTheme.value].icon);

  // ==================== THEME ACTIONS ====================

  const toggleTheme = async (): Promise<void> => {
    if (isLoading.value) {
      return;
    }

    try {
      isLoading.value = true;
      const newTheme = currentTheme.value === 'luxury' ? 'elite' : 'luxury';

      console.log('[theme-store][toggle] Toggling theme', {
        from: currentTheme.value,
        to: newTheme,
      });

      await validateAndSetTheme(newTheme);
    } catch (error) {
      const themeError = createThemeError(
        ThemeErrorType.INITIALIZATION_FAILED,
        `Theme toggle failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          severity: ThemeErrorSeverity.MEDIUM,
          component: 'themeStore',
          operation: 'toggle-theme',
          cause: error instanceof Error ? error : undefined,
        }
      );
      await errorHandler.handleError(themeError);
    } finally {
      isLoading.value = false;
    }
  };

  const setTheme = async (theme: ThemeMode): Promise<void> => {
    if (isLoading.value) {
      return;
    }

    try {
      isLoading.value = true;

      console.log('[theme-store][set] Setting theme', {
        theme,
        previous: currentTheme.value,
      });

      await validateAndSetTheme(theme);
    } catch (error) {
      const themeError = createThemeError(
        ThemeErrorType.INITIALIZATION_FAILED,
        `Set theme failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          severity: ThemeErrorSeverity.MEDIUM,
          component: 'themeStore',
          operation: 'set-theme',
          theme,
          cause: error instanceof Error ? error : undefined,
        }
      );
      await errorHandler.handleError(themeError);
    } finally {
      isLoading.value = false;
    }
  };

  const setLuxuryTheme = async (): Promise<void> => {
    await setTheme('luxury');
  };

  const setEliteTheme = async (): Promise<void> => {
    await setTheme('elite');
  };

  const initializeTheme = async (): Promise<void> => {
    if (isInitialized.value) {
      return;
    }

    try {
      isLoading.value = true;
      initializationError.value = null;

      console.log('[theme-store][init] Starting theme initialization', {
        defaultTheme: THEME_CONSTANTS.DEFAULT_THEME,
        currentTheme: currentTheme.value,
      });

      // Use retry logic for initialization
      const result = await retryThemeOperation(
        async () => {
          const envResult = validateThemeEnvironment({ component: 'themeStore' });
          if (!envResult.success) {
            return envResult as any;
          }

          await applyThemeToDocument(currentTheme.value);
          return { success: true, data: undefined };
        },
        THEME_CONSTANTS.PERSISTENCE_RETRY_COUNT,
        THEME_CONSTANTS.ERROR_RECOVERY_DELAY,
        { component: 'themeStore', operation: 'initialize' }
      );

      if (result.success) {
        isInitialized.value = true;
        console.log('[theme-store][init] Theme initialization completed successfully', {
          theme: currentTheme.value,
          timestamp: new Date().toISOString(),
        });
      } else {
        initializationError.value = result.error.message;
        await errorHandler.handleError(result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      initializationError.value = errorMessage;

      const themeError = createThemeError(
        ThemeErrorType.INITIALIZATION_FAILED,
        `Theme initialization failed: ${errorMessage}`,
        {
          severity: ThemeErrorSeverity.HIGH,
          component: 'themeStore',
          operation: 'initialize',
          cause: error instanceof Error ? error : undefined,
        }
      );
      await errorHandler.handleError(themeError);
    } finally {
      isLoading.value = false;
    }
  };

  // ==================== VALIDATION UTILITIES ====================

  const validateCurrentTheme = (): boolean => {
    const result = validateThemeMode(currentTheme.value, {
      component: 'themeStore',
      operation: 'validate-current',
    });
    return result.success;
  };

  const getThemeSystemHealth = () => {
    return {
      isInitialized: isInitialized.value,
      currentTheme: currentTheme.value,
      hasError: initializationError.value !== null,
      errorMessage: initializationError.value,
      isValidTheme: validateCurrentTheme(),
      hasCriticalErrors: initializationError.value !== null && !isInitialized.value,
    };
  };

  // ==================== WATCHERS ====================

  // Watch for theme changes and apply to document
  watch(
    currentTheme,
    async (newTheme, oldTheme) => {
      if (isInitialized.value && newTheme !== oldTheme) {
        console.log('[theme-store][watch] Theme changed', {
          from: oldTheme,
          to: newTheme,
          timestamp: new Date().toISOString(),
        });

        // Ensure DOM updates are applied
        await nextTick();
        await applyThemeToDocument(newTheme);
      }
    },
    { immediate: false }
  );

  // ==================== RETURN STORE INTERFACE ====================

  return {
    // ==================== STATE ====================
    currentTheme,
    isInitialized,
    initializationError,

    // ==================== COMPUTED GETTERS ====================
    isLuxuryTheme,
    isEliteTheme,
    themeDisplayName,
    themeDescription,
    themeIcon,

    // ==================== THEME ACTIONS ====================
    toggleTheme,
    setTheme,
    setLuxuryTheme,
    setEliteTheme,
    initializeTheme,

    // ==================== VALIDATION UTILITIES ====================
    validateCurrentTheme,
    getThemeSystemHealth,
  };
};

// ==================== STORE DEFINITION WITH PERSISTENCE ====================

export const useThemeStore = defineStore(
  'theme',
  storeDefinition,
  persistenceConfig.theme
    ? {
        persist: {
          key: THEME_CONSTANTS.STORAGE_KEY,
          storage: localStorage,
          pick: ['currentTheme'],
          afterHydrate: async context => {
            console.log('[theme-store][persistence] Hydration completed', {
              restoredTheme: context.store.currentTheme,
              timestamp: new Date().toISOString(),
            });

            // Apply the restored theme immediately and initialize
            await context.store.initializeTheme();
          },
        },
      }
    : undefined
);
