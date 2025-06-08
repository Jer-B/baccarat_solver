/**
 * 🎯 Type System - Main Index
 *
 * Centralized type exports with organized structure for the entire application.
 * This file provides single import location for all type definitions.
 */

// ==================== CORE TYPES ====================
export type * from './core/themeTypes';
export type * from './core/routeTypes';

// ==================== COMPONENT TYPES ====================
export type * from './components/themeComponentTypes';

// ==================== ERROR TYPES ====================
export type * from './errors/themeErrorTypes';

// ==================== TYPE UTILITIES ====================

/**
 * Generic result type for operations that can succeed or fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

/**
 * Make all properties of type T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specified properties K of type T required
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specified properties K of type T optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extract function parameter types as tuple
 */
export type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;

/**
 * Extract function return type
 */
export type ReturnType<T> = T extends (...args: unknown[]) => infer R ? R : unknown;

/**
 * Utility to create branded types for domain-specific values
 */
export type Brand<T, TBrand extends string> = T & { readonly __brand: TBrand };

/**
 * Theme-specific branded types for type safety
 */
export type ThemeClassName = Brand<string, 'ThemeClassName'>;
export type ComponentName = Brand<string, 'ComponentName'>;
export type OperationName = Brand<string, 'OperationName'>;

// ==================== FUTURE TYPE IMPORTS ====================
// Add future type imports here as the application grows
// export type * from './router/routerTypes';
// export type * from './api/apiTypes';
// export type * from './store/storeTypes';
// export type * from './utils/utilityTypes';
// ==================== NAMED EXPORTS ====================

// Theme constants and utilities
export {
  THEME_MODES,
  THEME_CONSTANTS,
  THEME_DISPLAY_INFO,
  ThemeModeSchema,
  ThemeStateSchema,
  PersistenceDataSchema,
  isValidThemeMode,
  parseThemeMode,
  assertThemeMode,
} from './core/themeTypes';

// Route constants and utilities
export {
  NAVIGATION_MODES,
  ROUTE_CATEGORIES,
  ACCESS_LEVELS,
  TRANSITION_TYPES,
  ROUTE_PATHS,
  ROUTE_NAMES,
  ROUTE_METADATA,
  ROUTE_CONSTANTS,
  RoutePathSchema,
  RouteNameSchema,
  NavigationModeSchema,
  RouteCategorySchema,
  AccessLevelSchema,
  TransitionTypeSchema,
  NavigationOptionsSchema,
  RouteValidationContextSchema,
  isValidRoutePath,
  isValidRouteName,
  isValidNavigationMode,
  isValidRouteCategory,
  isValidAccessLevel,
  createRoutePath,
  createRouteName,
} from './core/routeTypes';

// Error constants
export { ThemeErrorType, ThemeErrorSeverity } from './errors/themeErrorTypes';
