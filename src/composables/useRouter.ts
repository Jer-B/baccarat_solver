/**
 * 🧭 Advanced Vue Router Composable - Excellence Level
 *
 * Professional router integration with comprehensive navigation management,
 * error handling, route validation, and state tracking.
 */

import { ref, computed, readonly } from 'vue';
import { useRouter as useVueRouter, useRoute } from 'vue-router';

// Types
import type {
  RoutePath,
  RouteName,
  NavigationMode,
  NavigationOptions,
  RouteBreadcrumb,
  NavigationState,
} from '@/types/core/routeTypes';

import { ROUTE_PATHS, ROUTE_NAMES, ROUTE_METADATA } from '@/types/core/routeTypes';

// Validation and utilities
import {
  validateRoutePath,
  validateNavigationMode,
  getRouteMetadata,
  // routeRequiresAuth, // COMMENTED OUT - Authentication not needed
} from '@/utils/validation/routeValidation';

// Error handling
import { handleRouteError, RouteErrorTypes } from '@/utils/errors/routeErrorHandler';

// ==================== INTERFACES ====================

/**
 * Router composable return interface
 */
interface RouterComposableReturn {
  // Navigation state
  readonly navigationState: NavigationState;
  readonly currentPath: RoutePath;
  readonly currentName: RouteName;
  readonly currentMode: NavigationMode;
  readonly breadcrumbs: RouteBreadcrumb[];
  readonly isNavigating: boolean;
  readonly navigationError: string | null;

  // Navigation methods
  readonly navigateTo: (
    pathOrName: RoutePath | RouteName,
    options?: NavigationOptions
  ) => Promise<void>;
  readonly goBack: () => Promise<void>;
  readonly goForward: () => Promise<void>;
  readonly refresh: () => Promise<void>;

  // Mode management
  readonly switchNavigationMode: (mode: NavigationMode) => Promise<void>;
  readonly getAvailableRoutes: (mode?: NavigationMode) => RoutePath[];

  // Utility methods
  readonly isCurrentRoute: (pathOrName: RoutePath | RouteName) => boolean;
  readonly getRouteTitle: (pathOrName: RoutePath | RouteName) => string;
  readonly canNavigateTo: (pathOrName: RoutePath | RouteName) => boolean;

  // Error handling
  readonly clearNavigationError: () => void;
  readonly getLastError: () => string | null;

  // Cleanup
  readonly cleanup: () => void;
}

// ==================== MAIN COMPOSABLE ====================

/**
 * Advanced Vue Router composable with excellence-level features
 *
 * Provides comprehensive navigation management, error handling, and state tracking
 */
export const useRouter = (): RouterComposableReturn => {
  const vueRouter = useVueRouter();
  const currentRoute = useRoute();

  // ==================== REACTIVE STATE ====================

  const isNavigating = ref(false);
  const navigationError = ref<string | null>(null);
  const navigationHistory = ref<RoutePath[]>([]);

  // Constants for magic numbers
  const RETRY_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 5000;
  const TRANSITION_TIMEOUT_MS = 3000;

  // ==================== SETUP ====================

  // Initialize navigation history with current path
  const setup = (): void => {
    console.log('[router][lifecycle] Router composable initialized');
    const initialPath = validateRoutePath(currentRoute.path);
    if (initialPath.success && !navigationHistory.value.includes(initialPath.data)) {
      navigationHistory.value.push(initialPath.data);
    }
  };

  // Call setup immediately
  setup();

  // ==================== CLEANUP ====================

  const cleanup = (): void => {
    console.log('[router][lifecycle] Router composable cleanup');
    // Clear any pending navigation states
    isNavigating.value = false;
    navigationError.value = null;
    // Clear navigation history
    navigationHistory.value = [];
  };

  // ==================== COMPUTED PROPERTIES ====================

  /**
   * Current route path as branded type
   */
  const currentPath = computed((): RoutePath => {
    const pathValidation = validateRoutePath(currentRoute.path);
    return pathValidation.success ? pathValidation.data : ROUTE_PATHS.ROOT;
  });

  /**
   * Current route name as branded type
   */
  const currentName = computed((): RouteName => {
    const nameStr = currentRoute.name?.toString() || 'ROOT';
    const routeName = ROUTE_NAMES[nameStr as keyof typeof ROUTE_NAMES];
    return routeName || ROUTE_NAMES.ROOT;
  });

  /**
   * Current navigation mode based on route metadata
   */
  const currentMode = computed((): NavigationMode => {
    const metadata = getRouteMetadata(currentPath.value);
    return metadata?.navigationMode || 'original';
  });

  /**
   * Navigation state object
   */
  const navigationState = computed(
    (): NavigationState => ({
      currentPath: currentPath.value,
      currentName: currentName.value,
      currentMode: currentMode.value,
      previousPath: navigationHistory.value[navigationHistory.value.length - 2] || null,
      navigationHistory: readonly(navigationHistory.value),
      isNavigating: isNavigating.value,
      navigationError: navigationError.value,
    })
  );

  /**
   * Dynamic breadcrumb generation
   */
  const breadcrumbs = computed((): RouteBreadcrumb[] => {
    const crumbs: RouteBreadcrumb[] = [];
    const pathParts = currentPath.value.split('/').filter(Boolean);

    // Always start with root
    crumbs.push({
      path: ROUTE_PATHS.ROOT,
      name: ROUTE_METADATA[ROUTE_PATHS.ROOT].meta.title,
      isActive: currentPath.value === ROUTE_PATHS.ROOT,
      isClickable: true,
    });

    // Build breadcrumbs from path
    let currentPathBuild = '';
    for (const pathPart of pathParts) {
      currentPathBuild += `/${pathPart}`;
      const pathValidation = validateRoutePath(currentPathBuild);

      if (pathValidation.success) {
        const metadata = getRouteMetadata(pathValidation.data);
        if (metadata) {
          crumbs.push({
            path: pathValidation.data,
            name: metadata.meta.title,
            isActive: currentPathBuild === currentPath.value,
            isClickable: true,
          });
        }
      }
    }

    return crumbs;
  });

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Create a navigation error with context
   */
  const createNavigationError = (message: string, targetPath: RoutePath): Error => {
    return new Error(`Navigation Error: ${message} (target: ${targetPath})`);
  };

  /**
   * Set navigation error state
   */
  const setNavigationError = (error: Error): void => {
    navigationError.value = error.message;
  };

  /**
   * Clear navigation error state
   */
  const clearNavigationError = (): void => {
    navigationError.value = null;
  };

  // ==================== NAVIGATION METHODS ====================

  /**
   * Navigate to a specific route with validation and error handling
   */
  const navigateTo = async (
    pathOrName: RoutePath | RouteName,
    options: NavigationOptions = {}
  ): Promise<void> => {
    if (isNavigating.value) {
      throw createNavigationError('Navigation already in progress', ROUTE_PATHS.ORIGINAL_GAME);
    }

    isNavigating.value = true;
    clearNavigationError();

    try {
      console.log(`[router][navigation] Starting navigation to: ${pathOrName}`);

      // Determine target path
      let targetPath: RoutePath;

      if (Object.values(ROUTE_PATHS).includes(pathOrName as RoutePath)) {
        targetPath = pathOrName as RoutePath;
      } else if (Object.values(ROUTE_NAMES).includes(pathOrName as RouteName)) {
        // Find path by name
        const pathEntry = Object.entries(ROUTE_METADATA).find(
          ([, metadata]) => metadata.meta.title === pathOrName
        );
        if (pathEntry) {
          targetPath = pathEntry[0] as RoutePath;
        } else {
          throw new Error(`Route name not found: ${pathOrName}`);
        }
      } else {
        throw new Error(`Invalid route identifier: ${pathOrName}`);
      }

      // Validate target path
      const pathValidation = validateRoutePath(targetPath);
      if (!pathValidation.success) {
        throw new Error(pathValidation.error.message);
      }

      // Add current path to history before navigating
      if (currentPath.value !== targetPath) {
        navigationHistory.value.push(currentPath.value);
        // Keep history size manageable
        if (navigationHistory.value.length > 50) {
          navigationHistory.value = navigationHistory.value.slice(-25);
        }
      }

      // Perform navigation with options
      const navigationParams = options.replace
        ? { name: targetPath, replace: true }
        : { name: targetPath };

      if (options.query) {
        Object.assign(navigationParams, { query: options.query });
      }

      if (options.params) {
        Object.assign(navigationParams, { params: options.params });
      }

      // Timeout handling
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(createNavigationError('Navigation timeout', targetPath));
        }, TRANSITION_TIMEOUT_MS);
      });

      // Race between navigation and timeout
      await Promise.race([vueRouter.push(navigationParams), timeoutPromise]);

      console.log(`[router][navigation] Successfully navigated to: ${targetPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Navigation failed';
      navigationError.value = errorMessage;

      // Use error handler for recovery
      await handleRouteError(RouteErrorTypes.NAVIGATION_FAILED, errorMessage, {
        fromPath: currentPath.value,
        navigationMode: currentMode.value,
        additionalData: { options },
      });

      console.error('[router][navigation] Navigation failed:', errorMessage);
    } finally {
      isNavigating.value = false;
    }
  };

  /**
   * Navigate back in history
   */
  const goBack = async (): Promise<void> => {
    if (isNavigating.value) {
      return;
    }

    isNavigating.value = true;
    try {
      vueRouter.back();
      console.log('[router][navigation] Navigated back');
    } catch (error) {
      const errorMessage = 'Failed to navigate back';
      navigationError.value = errorMessage;
      console.error('[router][navigation]', errorMessage, error);
    } finally {
      isNavigating.value = false;
    }
  };

  /**
   * Navigate forward in history
   */
  const goForward = async (): Promise<void> => {
    if (isNavigating.value) {
      return;
    }

    isNavigating.value = true;
    try {
      vueRouter.forward();
      console.log('[router][navigation] Navigated forward');
    } catch (error) {
      const errorMessage = 'Failed to navigate forward';
      navigationError.value = errorMessage;
      console.error('[router][navigation]', errorMessage, error);
    } finally {
      isNavigating.value = false;
    }
  };

  /**
   * Refresh current route
   */
  const refresh = async (): Promise<void> => {
    if (isNavigating.value) {
      return;
    }

    isNavigating.value = true;
    try {
      await vueRouter.go(0);
      console.log('[router][navigation] Route refreshed');
    } catch (error) {
      const errorMessage = 'Failed to refresh route';
      navigationError.value = errorMessage;
      console.error('[router][navigation]', errorMessage, error);
    } finally {
      isNavigating.value = false;
    }
  };

  // ==================== MODE MANAGEMENT ====================

  /**
   * Switch navigation mode and update routes
   */
  const switchNavigationMode = async (mode: NavigationMode): Promise<void> => {
    const modeValidation = validateNavigationMode(mode);
    if (!modeValidation.success) {
      navigationError.value = modeValidation.error.message;
      return;
    }

    try {
      console.log(`[router][mode] Switching to navigation mode: ${mode}`);

      // Get appropriate route for the new mode
      const availableRoutes = getAvailableRoutes(mode);
      if (availableRoutes.length > 0) {
        // Navigate to the first available route in the new mode
        await navigateTo(availableRoutes[0]);
      }

      console.log(`[router][mode] Successfully switched to mode: ${mode}`);
    } catch (error) {
      const errorMessage = `Failed to switch to navigation mode: ${mode}`;
      navigationError.value = errorMessage;
      console.error('[router][mode]', errorMessage, error);
    }
  };

  /**
   * Get available routes for a navigation mode
   */
  const getAvailableRoutes = (mode?: NavigationMode): RoutePath[] => {
    const targetMode = mode || currentMode.value;
    return Object.entries(ROUTE_METADATA)
      .filter(([, metadata]) => metadata.navigationMode === targetMode)
      .map(([routePath]) => routePath as RoutePath);
  };

  // ==================== UTILITY METHODS ====================

  /**
   * Check if a route is currently active
   */
  const isCurrentRoute = (pathOrName: RoutePath | RouteName): boolean => {
    if (Object.values(ROUTE_PATHS).includes(pathOrName as RoutePath)) {
      return currentPath.value === pathOrName;
    }
    if (Object.values(ROUTE_NAMES).includes(pathOrName as RouteName)) {
      return currentName.value === pathOrName;
    }
    return false;
  };

  /**
   * Get route title by path or name
   */
  const getRouteTitle = (pathOrName: RoutePath | RouteName): string => {
    if (Object.values(ROUTE_PATHS).includes(pathOrName as RoutePath)) {
      const metadata = getRouteMetadata(pathOrName as RoutePath);
      return metadata?.meta.title || 'Unknown Route';
    }

    if (Object.values(ROUTE_NAMES).includes(pathOrName as RouteName)) {
      // Find metadata by name
      const metadataEntry = Object.entries(ROUTE_METADATA).find(
        ([, metadata]) => metadata.meta.title === pathOrName
      );
      return metadataEntry?.[1].meta.title || 'Unknown Route';
    }

    return 'Unknown Route';
  };

  /**
   * Check if navigation to a route is allowed
   */
  const canNavigateTo = (pathOrName: RoutePath | RouteName): boolean => {
    try {
      // Determine target path
      let targetPath: RoutePath;

      if (Object.values(ROUTE_PATHS).includes(pathOrName as RoutePath)) {
        targetPath = pathOrName as RoutePath;
      } else if (Object.values(ROUTE_NAMES).includes(pathOrName as RouteName)) {
        const pathEntry = Object.entries(ROUTE_METADATA).find(
          ([, metadata]) => metadata.meta.title === pathOrName
        );
        if (!pathEntry) {
          return false;
        }
        targetPath = pathEntry[0] as RoutePath;
      } else {
        return false;
      }

      // Validate path
      const pathValidation = validateRoutePath(targetPath);
      if (!pathValidation.success) {
        return false;
      }

      // Check accessibility
      const metadata = getRouteMetadata(targetPath);
      if (!metadata) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  // ==================== ERROR HANDLING ====================

  /**
   * Get last navigation error
   */
  const getLastError = (): string | null => {
    return navigationError.value;
  };

  // ==================== RETURN INTERFACE ====================

  return {
    // State (readonly)
    navigationState: navigationState.value,
    currentPath: currentPath.value,
    currentName: currentName.value,
    currentMode: currentMode.value,
    breadcrumbs: breadcrumbs.value,
    isNavigating: readonly(isNavigating).value,
    navigationError: readonly(navigationError).value,

    // Navigation methods
    navigateTo,
    goBack,
    goForward,
    refresh,

    // Mode management
    switchNavigationMode,
    getAvailableRoutes,

    // Utility methods
    isCurrentRoute,
    getRouteTitle,
    canNavigateTo,

    // Error handling
    clearNavigationError,
    getLastError,

    // Cleanup
    cleanup,
  };
};

/**
 * Type guard for router composable return
 */
export const isRouterComposable = (value: unknown): value is RouterComposableReturn => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'navigateTo' in value &&
    'currentPath' in value &&
    'navigationState' in value
  );
};
