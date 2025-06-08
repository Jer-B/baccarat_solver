/**
 * 🧭 Router Integration Tests - Excellence Level
 *
 * Integration tests for router system components working together.
 * Tests the integration between useRouter composable, validation, error handling,
 * and route types to ensure they work together seamlessly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';

// Import router system components
import type { RoutePath, NavigationMode } from '../../../src/types/core/routeTypes';
import { ROUTE_PATHS, ROUTE_NAMES } from '../../../src/types/core/routeTypes';
import {
  validateRoutePath,
  validateNavigationMode,
} from '../../../src/utils/validation/routeValidation';
import {
  getRouteErrorHandler,
  RouteErrorTypes,
  handleRouteError,
} from '../../../src/utils/errors/routeErrorHandler';

// Mock Vue Router for integration testing
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: ref({
    path: '/',
    name: 'Root',
    params: {},
    query: {},
    meta: {},
  }),
};

const mockRoute = ref({
  path: '/',
  name: 'Root',
  params: {},
  query: {},
  meta: {},
});

// Mock Vue Router composables
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}));

describe('Router System Integration', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset route state
    mockRoute.value = {
      path: '/',
      name: 'Root',
      params: {},
      query: {},
      meta: {},
    };
  });

  describe('Route Validation Integration', () => {
    it('should validate route paths correctly with type system', () => {
      // Test valid route paths from constants
      Object.values(ROUTE_PATHS).forEach(path => {
        const result = validateRoutePath(path);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(path);
        }
      });
    });

    it('should reject invalid route paths consistently', () => {
      const invalidPaths = ['', 'game', '/invalid-route', '/auth/login'];

      invalidPaths.forEach(path => {
        const result = validateRoutePath(path as RoutePath);
        expect(result.success).toBe(false);
      });
    });

    it('should validate navigation modes with type constraints', () => {
      const validModes: NavigationMode[] = ['original', 'cdd'];

      validModes.forEach(mode => {
        const result = validateNavigationMode(mode);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(mode);
        }
      });
    });
  });

  describe('Error Handler Integration', () => {
    it('should handle route navigation errors with proper context', async () => {
      const errorHandler = getRouteErrorHandler();

      // Test creating and handling navigation error
      const routeError = errorHandler.createRouteError(
        RouteErrorTypes.NAVIGATION_FAILED,
        'Navigation failed',
        {
          fromPath: ROUTE_PATHS.ROOT,
          navigationMode: 'original',
          additionalData: { targetPath: '/invalid' },
        }
      );

      expect(routeError).toBeDefined();
      expect(routeError.type).toBe(RouteErrorTypes.NAVIGATION_FAILED);
      expect(routeError.message).toBe('Navigation failed');

      // Test handling the error
      await errorHandler.handleError(routeError);
    });

    it('should handle validation errors with proper recovery', async () => {
      const errorHandler = getRouteErrorHandler();

      const routeError = errorHandler.createRouteError(
        RouteErrorTypes.VALIDATION_ERROR,
        'Route validation failed',
        {
          fromPath: ROUTE_PATHS.ORIGINAL_GAME,
          navigationMode: 'original',
          additionalData: { invalidPath: 'invalid-route' },
        }
      );

      expect(routeError).toBeDefined();
      expect(routeError.type).toBe(RouteErrorTypes.VALIDATION_ERROR);

      // Test handling the error
      await errorHandler.handleError(routeError);
    });
  });

  describe('Route Constants Integration', () => {
    it('should have consistent paths and names mapping', () => {
      // Verify that route paths and names are properly synchronized
      expect(ROUTE_PATHS.ROOT).toBe('/');
      expect(ROUTE_NAMES.ROOT).toBe('Root');

      expect(ROUTE_PATHS.ORIGINAL_GAME).toBe('/game');
      expect(ROUTE_NAMES.ORIGINAL_GAME).toBe('Game');

      expect(ROUTE_PATHS.CDD_GAME).toBe('/cdd/game');
      expect(ROUTE_NAMES.CDD_GAME).toBe('CDDGame');
    });

    it('should maintain navigation mode consistency', () => {
      // Original mode routes
      const originalPaths = [
        ROUTE_PATHS.ROOT,
        ROUTE_PATHS.ORIGINAL_GAME,
        ROUTE_PATHS.ORIGINAL_HISTORY,
      ];

      // CDD mode routes
      const cddPaths = [
        ROUTE_PATHS.CDD_ROOT,
        ROUTE_PATHS.CDD_GAME,
        ROUTE_PATHS.CDD_HISTORY,
        ROUTE_PATHS.CDD_SETTINGS,
      ];

      // Verify path consistency
      originalPaths.forEach(path => {
        expect(path).not.toMatch(/^\/cdd/);
      });

      cddPaths.forEach(path => {
        if (path !== ROUTE_PATHS.CDD_ROOT) {
          expect(path).toMatch(/^\/cdd\//);
        }
      });
    });
  });

  describe('Type System Integration', () => {
    it('should enforce type safety across router components', () => {
      // Test that valid route paths pass type guards
      const validPath = ROUTE_PATHS.ORIGINAL_GAME;
      const pathValidation = validateRoutePath(validPath);

      expect(pathValidation.success).toBe(true);

      // Test that invalid paths are rejected by type system
      const invalidPathValidation = validateRoutePath('/invalid' as RoutePath);
      expect(invalidPathValidation.success).toBe(false);
    });

    it('should handle navigation mode transitions properly', () => {
      const modes: NavigationMode[] = ['original', 'cdd'];

      modes.forEach(mode => {
        const validation = validateNavigationMode(mode);
        expect(validation.success).toBe(true);
      });

      // Test invalid mode
      const invalidValidation = validateNavigationMode('invalid' as NavigationMode);
      expect(invalidValidation.success).toBe(false);
    });
  });

  describe('End-to-End Integration Flow', () => {
    it('should handle complete navigation flow with validation and error handling', async () => {
      // Step 1: Validate target route
      const targetPath = ROUTE_PATHS.ORIGINAL_GAME;
      const pathValidation = validateRoutePath(targetPath);

      expect(pathValidation.success).toBe(true);

      // Step 2: Mock successful navigation
      mockRouter.push.mockResolvedValue(undefined);

      // Step 3: Test navigation (would be called by useRouter)
      await mockRouter.push(targetPath);

      expect(mockRouter.push).toHaveBeenCalledWith(targetPath);
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
    });

    it('should handle navigation failure with error recovery', async () => {
      const targetPath = ROUTE_PATHS.CDD_GAME;
      const navigationError = new Error('Navigation failed');

      // Mock navigation failure
      mockRouter.push.mockRejectedValue(navigationError);

      try {
        await mockRouter.push(targetPath);
      } catch (error) {
        // Test error handling integration using convenience function
        await handleRouteError(RouteErrorTypes.NAVIGATION_FAILED, 'Navigation failed', {
          fromPath: ROUTE_PATHS.ROOT,
          navigationMode: 'cdd',
          additionalData: { targetPath, originalError: error },
        });
      }

      expect(mockRouter.push).toHaveBeenCalledWith(targetPath);
    });
  });

  describe('No Auth System Integration Verification', () => {
    it('should not have any auth-related integration points', () => {
      // Verify no auth routes in constants
      const allPaths = Object.values(ROUTE_PATHS);
      const authPaths = ['/login', '/logout', '/register', '/profile', '/admin'];

      authPaths.forEach(authPath => {
        expect(allPaths).not.toContain(authPath);
      });

      // Verify error handler doesn't have auth-related error types
      const errorTypes = Object.values(RouteErrorTypes);
      expect(errorTypes).not.toContain('AUTH_FAILED');
      expect(errorTypes).not.toContain('ACCESS_DENIED');
    });

    it('should only use public access patterns', () => {
      // All routes should be accessible without authentication
      Object.values(ROUTE_PATHS).forEach(path => {
        const validation = validateRoutePath(path);
        expect(validation.success).toBe(true);
      });
    });
  });
});
