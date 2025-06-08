/**
 * 🧭 Vue Router Configuration - Excellence Level
 *
 * Enhanced Vue Router setup with type-safe route definitions,
 * comprehensive error handling, and integration with our router system.
 *
 * Integrates with our excellence-level router type system and validation.
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// Route type imports
import {
  ROUTE_PATHS,
  ROUTE_NAMES,
  ROUTE_METADATA,
  createRoutePath,
  type RoutePath,
  type NavigationMode,
} from '@/types/core/routeTypes';

// Validation and error handling
import { validateRouteTransition } from '@/utils/validation/routeValidation';
// import { validateRouteAccess } from '@/utils/validation/routeValidation'; // COMMENTED OUT - No access restrictions
import { getRouteErrorHandler, RouteErrorTypes } from '@/utils/errors/routeErrorHandler';

// View imports
import GameView from '../views/GameView.vue';
import HistoryView from '../views/HistoryView.vue';

// CDD Implementation imports
import CDDMainContainer from '../views/CDDMainContainer.vue';
import CDDGameViewContainer from '../views/game/CDDGameViewContainer.vue';
import CDDHistoryViewContainer from '../views/history/CDDHistoryViewContainer.vue';
import CDDSettingsViewContainer from '../views/settings/CDDSettingsViewContainer.vue';

// ==================== ROUTE DEFINITIONS ====================

/**
 * Type-safe route definitions with proper metadata integration
 */
const routes: RouteRecordRaw[] = [
  // Root redirect
  {
    path: ROUTE_PATHS.ROOT,
    redirect: ROUTE_PATHS.ORIGINAL_GAME,
  },

  // Original routes
  {
    path: ROUTE_PATHS.ORIGINAL_GAME,
    name: ROUTE_NAMES.ORIGINAL_GAME,
    component: GameView,
    meta: {
      title: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_GAME].meta.title,
      description: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_GAME].meta.description,
      category: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_GAME].category,
      navigationMode: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_GAME].navigationMode,
      // accessLevel: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_GAME].accessLevel, // COMMENTED OUT - No access restrictions
    },
  },
  {
    path: ROUTE_PATHS.ORIGINAL_HISTORY,
    name: ROUTE_NAMES.ORIGINAL_HISTORY,
    component: HistoryView,
    meta: {
      title: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_HISTORY].meta.title,
      description: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_HISTORY].meta.description,
      category: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_HISTORY].category,
      navigationMode: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_HISTORY].navigationMode,
      // accessLevel: ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_HISTORY].accessLevel, // COMMENTED OUT - No access restrictions
    },
  },

  // CDD routes
  {
    path: ROUTE_PATHS.CDD_ROOT,
    component: CDDMainContainer,
    meta: {
      navigationMode: 'cdd' as NavigationMode,
    },
    children: [
      {
        path: '',
        redirect: ROUTE_PATHS.CDD_GAME,
      },
      {
        path: 'game',
        name: ROUTE_NAMES.CDD_GAME,
        component: CDDGameViewContainer,
        meta: {
          title: ROUTE_METADATA[ROUTE_PATHS.CDD_GAME].meta.title,
          description: ROUTE_METADATA[ROUTE_PATHS.CDD_GAME].meta.description,
          category: ROUTE_METADATA[ROUTE_PATHS.CDD_GAME].category,
          navigationMode: ROUTE_METADATA[ROUTE_PATHS.CDD_GAME].navigationMode,
          // accessLevel: ROUTE_METADATA[ROUTE_PATHS.CDD_GAME].accessLevel, // COMMENTED OUT - No access restrictions
        },
      },
      {
        path: 'history',
        name: ROUTE_NAMES.CDD_HISTORY,
        component: CDDHistoryViewContainer,
        meta: {
          title: ROUTE_METADATA[ROUTE_PATHS.CDD_HISTORY].meta.title,
          description: ROUTE_METADATA[ROUTE_PATHS.CDD_HISTORY].meta.description,
          category: ROUTE_METADATA[ROUTE_PATHS.CDD_HISTORY].category,
          navigationMode: ROUTE_METADATA[ROUTE_PATHS.CDD_HISTORY].navigationMode,
          // accessLevel: ROUTE_METADATA[ROUTE_PATHS.CDD_HISTORY].accessLevel, // COMMENTED OUT - No access restrictions
        },
      },
      {
        path: 'settings',
        name: ROUTE_NAMES.CDD_SETTINGS,
        component: CDDSettingsViewContainer,
        meta: {
          title: ROUTE_METADATA[ROUTE_PATHS.CDD_SETTINGS].meta.title,
          description: ROUTE_METADATA[ROUTE_PATHS.CDD_SETTINGS].meta.description,
          category: ROUTE_METADATA[ROUTE_PATHS.CDD_SETTINGS].category,
          navigationMode: ROUTE_METADATA[ROUTE_PATHS.CDD_SETTINGS].navigationMode,
          // accessLevel: ROUTE_METADATA[ROUTE_PATHS.CDD_SETTINGS].accessLevel, // COMMENTED OUT - No access restrictions
        },
      },
    ],
  },
];

// ==================== ROUTER INSTANCE ====================

/**
 * Enhanced Vue Router instance with error handling
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ==================== NAVIGATION GUARDS ====================

/**
 * Helper to safely convert string path to RoutePath
 */
const createSafeRoutePath = (path: string): RoutePath => {
  try {
    return createRoutePath(path);
  } catch {
    // For invalid paths, return root as fallback
    return ROUTE_PATHS.ROOT;
  }
};

/**
 * Global before guard with comprehensive validation and error handling
 * NOTE: Access control commented out - no restrictions for now
 */
router.beforeEach(async (destinationRoute, from, next) => {
  const errorHandler = getRouteErrorHandler();

  try {
    console.log(
      `[router][navigation] Attempting navigation from ${from.path} to ${destinationRoute.path}`
    );

    // Convert paths to RoutePath safely
    const fromPath = createSafeRoutePath(from.path);
    const targetPath = createSafeRoutePath(destinationRoute.path);

    // Perform route transition validation if both paths are in our route system
    if (
      from.path !== '/' &&
      destinationRoute.path !== '/' &&
      Object.values(ROUTE_PATHS).includes(destinationRoute.path as RoutePath) &&
      Object.values(ROUTE_PATHS).includes(from.path as RoutePath)
    ) {
      const transitionResult = validateRouteTransition({
        fromPath,
        toPath: targetPath,
        navigationMode: (destinationRoute.meta?.navigationMode as NavigationMode) || 'original',
      });

      if (!transitionResult.success && transitionResult.error) {
        console.warn('[router][validation] Route transition warning:', {
          from: from.path,
          targetPath: destinationRoute.path,
          error: transitionResult.error.message,
        });
      }
    }

    // COMMENTED OUT - No access restrictions for now
    // Everyone can access all routes until project requirements change
    /*
    // Perform access validation if target path is in our route system
    if (Object.values(ROUTE_PATHS).includes(destinationRoute.path as RoutePath)) {
      const accessResult = validateRouteAccess(targetPath, {
        from: fromPath,
        targetRoute: targetPath,
        navigationMode: (destinationRoute.meta?.navigationMode as NavigationMode) || 'original',
        timestamp: new Date(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        sessionId: `session-${Date.now()}`,
      });

      if (!accessResult.allowed) {
        console.error('[router][access] Access denied:', {
          path: destinationRoute.path,
          reason: accessResult.reason,
          fallback: accessResult.fallbackPath,
        });

        if (accessResult.fallbackPath) {
          next(accessResult.fallbackPath);
          return;
        }
        next(false);
        return;
      }
    }
    */

    // Update document title
    if (destinationRoute.meta?.title) {
      document.title = `${destinationRoute.meta.title} | Baccarat Pro`;
    }

    console.log('[router][navigation] Navigation validated successfully', {
      from: from.path,
      targetPath: destinationRoute.path,
      mode: destinationRoute.meta?.navigationMode,
    });

    next();
  } catch (error) {
    console.error('[router][guard] Navigation guard error:', error);

    // Handle error through our error system
    const routeError = errorHandler.createRouteError(
      RouteErrorTypes.GUARD_REJECTION,
      `Navigation guard failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        fromPath: createSafeRoutePath(from.path),
        toPath: createSafeRoutePath(destinationRoute.path),
        originalError: error,
        additionalData: {
          stack: error instanceof Error ? error.stack : 'No stack trace available',
        },
      }
    );

    await errorHandler.handleError(routeError);

    // Allow navigation to continue with a warning
    next();
  }
});

/**
 * Global after guard for cleanup and logging
 */
router.afterEach((destinationRoute, from, failure) => {
  if (failure) {
    console.error('[router][after] Navigation failed:', {
      from: from.path,
      targetPath: destinationRoute.path,
      failure,
    });

    const errorHandler = getRouteErrorHandler();
    const routeError = errorHandler.createRouteError(
      RouteErrorTypes.NAVIGATION_FAILED,
      `Navigation failed: ${failure}`,
      {
        fromPath: createSafeRoutePath(from.path),
        toPath: createSafeRoutePath(destinationRoute.path),
        additionalData: { failure },
      }
    );

    errorHandler.handleError(routeError);
  } else {
    console.log('[router][after] Navigation completed successfully', {
      from: from.path,
      targetPath: destinationRoute.path,
      mode: destinationRoute.meta?.navigationMode,
    });
  }
});

/**
 * Global error handler for router errors
 */
router.onError(error => {
  console.error('[router][error] Router error occurred:', error);

  const errorHandler = getRouteErrorHandler();
  const routeError = errorHandler.createRouteError(
    RouteErrorTypes.NAVIGATION_FAILED,
    `Router error: ${error.message}`,
    {
      originalError: error,
      additionalData: {
        stack: error instanceof Error ? error.stack : 'No stack trace available',
      },
    },
    {
      severity: 'high',
    }
  );

  errorHandler.handleError(routeError);
});

// ==================== ROUTER EXPORT ====================

export default router;
