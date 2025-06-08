/**
 * 🎯 Theme System - Vue 3 Composable
 *
 * Excellence-level Vue 3 composable for theme management with comprehensive
 * error handling, validation, and reactive state management.
 *
 */

import { ref, computed, watch, onMounted, onUnmounted, readonly, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { ThemeMode, ThemeToggleProps, ThemeError, ComponentErrorContext } from '@/types';
import { ThemeErrorType, ThemeErrorSeverity } from '@/types';
import {
  validateThemeMode,
  validateThemeToggleProps,
  createThemeError,
  ThemeErrorHandler,
  handleThemeOperationResult,
} from '@/utils';
import { useThemeStore } from '@/stores/themeStore';

// ==================== COMPOSABLE INTERFACES ====================

/**
 * Options for theme composable configuration
 */
export interface UseThemeOptions {
  /** Component name for error tracking and debugging */
  component?: string;

  /** Whether to automatically initialize theme on mount */
  autoInitialize?: boolean;

  /** Whether to watch for theme changes and react */
  watchChanges?: boolean;

  /** Custom error handler for theme operations */
  errorHandler?: (error: ThemeError) => void;

  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Return type for useTheme composable
 */
export interface UseThemeReturn {
  // State
  readonly currentTheme: Readonly<Ref<ThemeMode>>;
  readonly isInitialized: Readonly<Ref<boolean>>;
  readonly isLoading: Readonly<Ref<boolean>>;
  readonly error: Readonly<Ref<ThemeError | null>>;

  // Computed
  readonly themeClasses: Readonly<Ref<string>>;
  readonly hasError: Readonly<Ref<boolean>>;
  readonly canToggle: Readonly<Ref<boolean>>;

  // Actions
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  initializeTheme: () => Promise<void>;
  clearErrors: () => void;
  retryInitialization: () => Promise<void>;

  // Utilities
  validateProps: (props: unknown) => Promise<ThemeToggleProps | null>;
  getThemeInfo: () => { theme: ThemeMode; initialized: boolean; error: ThemeError | null };
}

// ==================== MAIN COMPOSABLE ====================

/**
 * Vue 3 composable for theme management with excellence-level features
 */
export const useTheme = (options: UseThemeOptions = {}): UseThemeReturn => {
  const {
    component = 'useTheme',
    autoInitialize = true,
    watchChanges = true,
    errorHandler,
    debug = false,
  } = options;

  // ==================== STORE INTEGRATION ====================

  const themeStore = useThemeStore();
  const { currentTheme: storeTheme, isInitialized: storeInitialized } = storeToRefs(themeStore);

  // ==================== LOCAL STATE ====================

  const isLoading = ref(false);
  const error = ref<ThemeError | null>(null);
  const componentContext = ref<ComponentErrorContext>({
    componentName: component,
    instanceId: `${component}-${Date.now()}`,
  });

  // ==================== COMPUTED PROPERTIES ====================

  const themeClasses = computed(() => {
    if (!storeInitialized.value || error.value) {
      return 'theme-loading';
    }
    return `theme-${storeTheme.value}`;
  });

  const hasError = computed(() => error.value !== null);

  const canToggle = computed(() => storeInitialized.value && !isLoading.value && !hasError.value);

  // ==================== ERROR HANDLING ====================

  const handleError = async (err: ThemeError | Error): Promise<void> => {
    const themeError =
      err instanceof Error
        ? createThemeError(
            ThemeErrorType.COMPONENT_ERROR,
            `Theme composable error: ${err.message}`,
            {
              severity: ThemeErrorSeverity.MEDIUM,
              component,
              context: { originalError: err },
              cause: err,
            }
          )
        : err;

    error.value = themeError;

    // Use custom error handler if provided
    if (errorHandler) {
      errorHandler(themeError);
    } else {
      // Use global error handler
      const handler = ThemeErrorHandler.getInstance();
      await handler.handleError(themeError, componentContext.value);
    }

    if (debug) {
      console.error(`[use-theme][${component}] Error handled`, {
        error: themeError.message,
        type: themeError.type,
        severity: themeError.severity,
      });
    }
  };

  const clearErrors = (): void => {
    error.value = null;

    if (debug) {
      console.log(`[use-theme][${component}] Errors cleared`);
    }
  };

  // ==================== THEME ACTIONS ====================

  const setTheme = async (theme: ThemeMode): Promise<void> => {
    try {
      isLoading.value = true;
      clearErrors();

      // Validate theme mode
      const validationResult = validateThemeMode(theme, { component });

      if (!validationResult.success) {
        await handleError(validationResult.error);
        return;
      }

      // Use store action
      await themeStore.setTheme(validationResult.data);

      if (debug) {
        console.log(`[use-theme][${component}] Theme set successfully`, {
          theme: validationResult.data,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      await handleError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      isLoading.value = false;
    }
  };

  const toggleTheme = async (): Promise<void> => {
    try {
      isLoading.value = true;
      clearErrors();

      await themeStore.toggleTheme();

      if (debug) {
        console.log(`[use-theme][${component}] Theme toggled successfully`, {
          newTheme: storeTheme.value,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      await handleError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      isLoading.value = false;
    }
  };

  const initializeTheme = async (): Promise<void> => {
    try {
      isLoading.value = true;
      clearErrors();

      await themeStore.initializeTheme();

      if (debug) {
        console.log(`[use-theme][${component}] Theme initialized successfully`, {
          theme: storeTheme.value,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      await handleError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      isLoading.value = false;
    }
  };

  const retryInitialization = async (): Promise<void> => {
    if (debug) {
      console.log(`[use-theme][${component}] Retrying theme initialization`);
    }

    await initializeTheme();
  };

  // ==================== UTILITY FUNCTIONS ====================

  const validateProps = async (props: unknown): Promise<ThemeToggleProps | null> => {
    const result = validateThemeToggleProps(props, { component });
    return await handleThemeOperationResult(result, {
      component,
      operation: 'validate-props',
    });
  };

  const getThemeInfo = () => ({
    theme: storeTheme.value,
    initialized: storeInitialized.value,
    error: error.value,
  });

  // ==================== LIFECYCLE HOOKS ====================

  onMounted(async () => {
    if (debug) {
      console.log(`[use-theme][${component}] Component mounted`, {
        autoInitialize,
        watchChanges,
      });
    }

    if (autoInitialize && !storeInitialized.value) {
      await initializeTheme();
    }
  });

  onUnmounted(() => {
    if (debug) {
      console.log(`[use-theme][${component}] Component unmounted`);
    }

    clearErrors();
  });

  // ==================== WATCHERS ====================

  if (watchChanges) {
    watch(
      storeTheme,
      (newTheme, oldTheme) => {
        if (debug && newTheme !== oldTheme) {
          console.log(`[use-theme][${component}] Theme changed`, {
            from: oldTheme,
            to: newTheme,
            timestamp: new Date().toISOString(),
          });
        }
      },
      { immediate: false }
    );

    watch(
      error,
      newError => {
        if (newError && debug) {
          console.warn(`[use-theme][${component}] Error state changed`, {
            error: newError.message,
            type: newError.type,
            severity: newError.severity,
          });
        }
      },
      { immediate: false }
    );
  }

  // ==================== RETURN INTERFACE ====================

  return {
    // State (readonly)
    currentTheme: readonly(storeTheme),
    isInitialized: readonly(storeInitialized),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed (readonly)
    themeClasses: readonly(themeClasses),
    hasError: readonly(hasError),
    canToggle: readonly(canToggle),

    // Actions
    setTheme,
    toggleTheme,
    initializeTheme,
    clearErrors,
    retryInitialization,

    // Utilities
    validateProps,
    getThemeInfo,
  };
};

// ==================== SPECIALIZED COMPOSABLES ====================

/**
 * Lightweight theme state composable for read-only access
 */
export const useThemeState = (component = 'useThemeState') => {
  const themeStore = useThemeStore();
  const { currentTheme, isInitialized } = storeToRefs(themeStore);

  const themeClasses = computed(() =>
    isInitialized.value ? `theme-${currentTheme.value}` : 'theme-loading'
  );

  return {
    currentTheme: readonly(currentTheme),
    isInitialized: readonly(isInitialized),
    themeClasses: readonly(themeClasses),
  };
};

/**
 * Theme control composable for write operations only
 */
export const useThemeControl = (component = 'useThemeControl') => {
  const themeStore = useThemeStore();

  return {
    setTheme: themeStore.setTheme,
    toggleTheme: themeStore.toggleTheme,
    initializeTheme: themeStore.initializeTheme,
  };
};
