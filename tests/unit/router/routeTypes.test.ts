/**
 * Router Types System Tests - Excellence Level
 *
 * Comprehensive testing of route types, constants, validation schemas,
 * and type guards with 100% coverage of the type system.
 */

import { describe, it, expect } from 'vitest';
import {
  // Type guards
  isValidRoutePath,
  isValidRouteName,
  isValidNavigationMode,
  isValidRouteCategory,
  isValidAccessLevel,

  // Branded type creators
  createRoutePath,
  createRouteName,

  // Constants
  ROUTE_PATHS,
  ROUTE_NAMES,
  ROUTE_METADATA,
  NAVIGATION_MODES,
  ROUTE_CATEGORIES,
  ACCESS_LEVELS,
  TRANSITION_TYPES,

  // Zod schemas for validation
  RoutePathSchema,
  RouteNameSchema,
  NavigationModeSchema,
  RouteCategorySchema,
  AccessLevelSchema,

  // Constants export
  ROUTE_CONSTANTS,
} from '../../../src/types/core/routeTypes';

// ==================== MAIN TEST SUITE ====================

describe('Router Types System', () => {
  describe('Constants Definition', () => {
    it('should define navigation modes correctly', () => {
      expect(NAVIGATION_MODES).toEqual(['original', 'cdd']);
      expect(NAVIGATION_MODES).toHaveLength(2);
    });

    it('should define route categories correctly (no auth)', () => {
      expect(ROUTE_CATEGORIES).toEqual(['game', 'history', 'settings']);
      expect(ROUTE_CATEGORIES).toHaveLength(3);
      expect(ROUTE_CATEGORIES).not.toContain('auth'); // No auth system
    });

    it('should define access levels correctly (public only)', () => {
      expect(ACCESS_LEVELS).toEqual(['public']);
      expect(ACCESS_LEVELS).toHaveLength(1);
      expect(ACCESS_LEVELS).not.toContain('user'); // No user restrictions
      expect(ACCESS_LEVELS).not.toContain('admin'); // No admin functionality
    });

    it('should define transition types correctly', () => {
      expect(TRANSITION_TYPES).toEqual(['fade', 'slide', 'none']);
      expect(TRANSITION_TYPES).toHaveLength(3);
    });
  });

  describe('Route Paths', () => {
    it('should define all required route paths', () => {
      expect(ROUTE_PATHS.ROOT).toBe('/');
      expect(ROUTE_PATHS.ORIGINAL_GAME).toBe('/game');
      expect(ROUTE_PATHS.ORIGINAL_HISTORY).toBe('/history');
      expect(ROUTE_PATHS.CDD_ROOT).toBe('/cdd');
      expect(ROUTE_PATHS.CDD_GAME).toBe('/cdd/game');
      expect(ROUTE_PATHS.CDD_HISTORY).toBe('/cdd/history');
      expect(ROUTE_PATHS.CDD_SETTINGS).toBe('/cdd/settings');
      expect(ROUTE_PATHS.SETTINGS).toBe('/settings');
    });

    it('should not include auth-related paths', () => {
      expect(Object.values(ROUTE_PATHS)).not.toContain('/login');
      expect(Object.values(ROUTE_PATHS)).not.toContain('/profile');
      expect(Object.values(ROUTE_PATHS)).not.toContain('/admin');
    });

    it('should have consistent path structure', () => {
      // All CDD paths should start with /cdd
      expect(ROUTE_PATHS.CDD_ROOT).toMatch(/^\/cdd$/);
      expect(ROUTE_PATHS.CDD_GAME).toMatch(/^\/cdd\//);
      expect(ROUTE_PATHS.CDD_HISTORY).toMatch(/^\/cdd\//);
      expect(ROUTE_PATHS.CDD_SETTINGS).toMatch(/^\/cdd\//);
    });
  });

  describe('Route Names', () => {
    it('should define all required route names', () => {
      expect(ROUTE_NAMES.ROOT).toBe('Root');
      expect(ROUTE_NAMES.ORIGINAL_GAME).toBe('Game');
      expect(ROUTE_NAMES.ORIGINAL_HISTORY).toBe('History');
      expect(ROUTE_NAMES.CDD_GAME).toBe('CDDGame');
      expect(ROUTE_NAMES.CDD_HISTORY).toBe('CDDHistory');
      expect(ROUTE_NAMES.CDD_SETTINGS).toBe('CDDSettings');
      expect(ROUTE_NAMES.SETTINGS).toBe('Settings');
    });

    it('should use PascalCase naming convention', () => {
      Object.values(ROUTE_NAMES).forEach(name => {
        expect(name).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
      });
    });
  });

  describe('Route Metadata', () => {
    it('should have metadata for all route paths', () => {
      Object.values(ROUTE_PATHS).forEach(path => {
        expect(ROUTE_METADATA[path]).toBeDefined();
      });
    });

    it('should have consistent metadata structure', () => {
      Object.values(ROUTE_METADATA).forEach(metadata => {
        expect(metadata).toHaveProperty('category');
        expect(metadata).toHaveProperty('navigationMode');
        expect(metadata).toHaveProperty('accessLevel');
        expect(metadata).toHaveProperty('transition');
        expect(metadata).toHaveProperty('meta');
        expect(metadata.meta).toHaveProperty('title');
        expect(metadata.meta).toHaveProperty('description');
      });
    });

    it('should only use public access level (no restrictions)', () => {
      Object.values(ROUTE_METADATA).forEach(metadata => {
        expect(metadata.accessLevel).toBe('public');
      });
    });

    it('should have appropriate navigation modes', () => {
      // Original routes should use 'original' mode
      expect(ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_GAME].navigationMode).toBe('original');
      expect(ROUTE_METADATA[ROUTE_PATHS.ORIGINAL_HISTORY].navigationMode).toBe('original');

      // CDD routes should use 'cdd' mode
      expect(ROUTE_METADATA[ROUTE_PATHS.CDD_GAME].navigationMode).toBe('cdd');
      expect(ROUTE_METADATA[ROUTE_PATHS.CDD_HISTORY].navigationMode).toBe('cdd');
      expect(ROUTE_METADATA[ROUTE_PATHS.CDD_SETTINGS].navigationMode).toBe('cdd');
    });
  });

  describe('Type Arrays', () => {
    it('should define navigation modes correctly', () => {
      expect(NAVIGATION_MODES).toEqual(['original', 'cdd']);
    });

    it('should define route categories correctly', () => {
      expect(ROUTE_CATEGORIES).toEqual(['game', 'history', 'settings']);
    });

    it('should define access levels correctly', () => {
      expect(ACCESS_LEVELS).toEqual(['public']);
    });

    it('should define transition types correctly', () => {
      expect(TRANSITION_TYPES).toEqual(['fade', 'slide', 'none']);
    });
  });

  describe('Type Guards', () => {
    describe('isValidRoutePath', () => {
      it('should validate correct route paths', () => {
        expect(isValidRoutePath('/')).toBe(true);
        expect(isValidRoutePath('/game')).toBe(true);
        expect(isValidRoutePath('/cdd/game')).toBe(true);
      });

      it('should reject invalid route paths', () => {
        expect(isValidRoutePath('')).toBe(false);
        expect(isValidRoutePath('game')).toBe(false); // Missing leading slash
        expect(isValidRoutePath('/invalid-route')).toBe(false);
        expect(isValidRoutePath(123)).toBe(false);
        expect(isValidRoutePath(null)).toBe(false);
      });
    });

    describe('isValidRouteName', () => {
      it('should validate correct route names', () => {
        expect(isValidRouteName('Root')).toBe(true);
        expect(isValidRouteName('Game')).toBe(true);
        expect(isValidRouteName('CDDGame')).toBe(true);
      });

      it('should reject invalid route names', () => {
        expect(isValidRouteName('')).toBe(false);
        expect(isValidRouteName('game')).toBe(false); // Must be PascalCase
        expect(isValidRouteName('GAME')).toBe(false);
        expect(isValidRouteName('Game Name')).toBe(false); // No spaces
        expect(isValidRouteName(123)).toBe(false);
      });
    });

    describe('isValidNavigationMode', () => {
      it('should validate correct navigation modes', () => {
        expect(isValidNavigationMode('original')).toBe(true);
        expect(isValidNavigationMode('cdd')).toBe(true);
      });

      it('should reject invalid navigation modes', () => {
        expect(isValidNavigationMode('invalid')).toBe(false);
        expect(isValidNavigationMode('')).toBe(false);
        expect(isValidNavigationMode('Original')).toBe(false); // Case sensitive
        expect(isValidNavigationMode(123)).toBe(false);
      });
    });

    describe('isValidRouteCategory', () => {
      it('should validate correct route categories', () => {
        expect(isValidRouteCategory('game')).toBe(true);
        expect(isValidRouteCategory('history')).toBe(true);
        expect(isValidRouteCategory('settings')).toBe(true);
      });

      it('should reject auth category (no auth)', () => {
        expect(isValidRouteCategory('auth')).toBe(false);
        expect(isValidRouteCategory('admin')).toBe(false);
        expect(isValidRouteCategory('user')).toBe(false);
      });

      it('should reject invalid categories', () => {
        expect(isValidRouteCategory('invalid')).toBe(false);
        expect(isValidRouteCategory('')).toBe(false);
        expect(isValidRouteCategory(123)).toBe(false);
      });
    });

    describe('isValidAccessLevel', () => {
      it('should validate correct access levels', () => {
        expect(isValidAccessLevel('public')).toBe(true);
      });

      it('should reject restricted access levels', () => {
        expect(isValidAccessLevel('user')).toBe(false);
        expect(isValidAccessLevel('admin')).toBe(false);
        expect(isValidAccessLevel('private')).toBe(false);
      });

      it('should reject invalid access levels', () => {
        expect(isValidAccessLevel('invalid')).toBe(false);
        expect(isValidAccessLevel('')).toBe(false);
        expect(isValidAccessLevel(123)).toBe(false);
      });
    });
  });

  describe('Branded Type Creators', () => {
    describe('createRoutePath', () => {
      it('should create valid route paths', () => {
        const path = createRoutePath('/game');
        expect(path).toBe('/game');
        expect(typeof path).toBe('string');
      });

      it('should throw for invalid paths', () => {
        expect(() => createRoutePath('')).toThrow('Invalid route path');
        expect(() => createRoutePath('game')).toThrow('Invalid route path');
      });
    });

    describe('createRouteName', () => {
      it('should create valid route names', () => {
        const name = createRouteName('Game');
        expect(name).toBe('Game');
        expect(typeof name).toBe('string');
      });

      it('should throw for invalid names', () => {
        expect(() => createRouteName('')).toThrow('Invalid route name');
        expect(() => createRouteName('game')).toThrow('Invalid route name');
      });
    });
  });

  describe('Zod Schemas', () => {
    describe('RoutePathSchema', () => {
      it('should validate and transform valid paths', () => {
        const result = RoutePathSchema.safeParse('/game');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('/game');
        }
      });

      it('should reject invalid paths', () => {
        expect(RoutePathSchema.safeParse('').success).toBe(false);
        expect(RoutePathSchema.safeParse('game').success).toBe(false);
      });
    });

    describe('RouteNameSchema', () => {
      it('should validate and transform valid names', () => {
        const result = RouteNameSchema.safeParse('Game');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('Game');
        }
      });

      it('should reject invalid names', () => {
        expect(RouteNameSchema.safeParse('').success).toBe(false);
        expect(RouteNameSchema.safeParse('game').success).toBe(false);
      });
    });

    describe('NavigationModeSchema', () => {
      it('should validate correct modes', () => {
        expect(NavigationModeSchema.safeParse('original').success).toBe(true);
        expect(NavigationModeSchema.safeParse('cdd').success).toBe(true);
      });

      it('should reject invalid modes', () => {
        expect(NavigationModeSchema.safeParse('invalid').success).toBe(false);
      });
    });

    describe('RouteCategorySchema', () => {
      it('should validate correct categories', () => {
        expect(RouteCategorySchema.safeParse('game').success).toBe(true);
        expect(RouteCategorySchema.safeParse('history').success).toBe(true);
        expect(RouteCategorySchema.safeParse('settings').success).toBe(true);
      });

      it('should reject auth categories (no auth)', () => {
        expect(RouteCategorySchema.safeParse('auth').success).toBe(false);
        expect(RouteCategorySchema.safeParse('admin').success).toBe(false);
      });
    });

    describe('AccessLevelSchema', () => {
      it('should validate public access level', () => {
        expect(AccessLevelSchema.safeParse('public').success).toBe(true);
      });

      it('should reject restricted access levels', () => {
        expect(AccessLevelSchema.safeParse('user').success).toBe(false);
        expect(AccessLevelSchema.safeParse('admin').success).toBe(false);
      });
    });
  });

  describe('Route Constants Export', () => {
    it('should export consolidated constants object', () => {
      expect(ROUTE_CONSTANTS).toBeDefined();
      expect(ROUTE_CONSTANTS.PATHS).toBe(ROUTE_PATHS);
      expect(ROUTE_CONSTANTS.NAMES).toBe(ROUTE_NAMES);
      expect(ROUTE_CONSTANTS.METADATA).toBe(ROUTE_METADATA);
      expect(ROUTE_CONSTANTS.NAVIGATION_MODES).toBe(NAVIGATION_MODES);
      expect(ROUTE_CONSTANTS.ROUTE_CATEGORIES).toBe(ROUTE_CATEGORIES);
      expect(ROUTE_CONSTANTS.ACCESS_LEVELS).toBe(ACCESS_LEVELS);
      expect(ROUTE_CONSTANTS.TRANSITION_TYPES).toBe(TRANSITION_TYPES);
    });
  });

  describe('No Auth Integration Verification', () => {
    it('should not have any auth-related constants', () => {
      expect(ROUTE_CATEGORIES).not.toContain('auth');
      expect(ACCESS_LEVELS).not.toContain('user');
      expect(ACCESS_LEVELS).not.toContain('admin');
    });

    it('should not have auth-related route paths', () => {
      const authPaths = ['/login', '/logout', '/register', '/profile', '/admin'];
      authPaths.forEach(path => {
        expect(Object.values(ROUTE_PATHS)).not.toContain(path);
      });
    });

    it('should not have auth-related route names', () => {
      const authNames = ['Login', 'Logout', 'Register', 'Profile', 'Admin'];
      authNames.forEach(name => {
        expect(Object.values(ROUTE_NAMES)).not.toContain(name);
      });
    });

    it('should only use public access level in metadata', () => {
      Object.values(ROUTE_METADATA).forEach(metadata => {
        expect(metadata.accessLevel).toBe('public');
      });
    });
  });
});
