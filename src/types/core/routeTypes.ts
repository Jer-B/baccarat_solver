/**
 * 🧭 Router Types - Excellence Level
 *
 * Core router type definitions with professional validation, error handling,
 * and TypeScript integration for Vue Router management.
 *
 * Follows the same excellence patterns as themeTypes.ts with comprehensive
 * type safety, branded types, and integration with the broader application architecture.
 */

import { z } from 'zod';

// ==================== CORE ROUTE TYPES ====================

/**
 * Branded type for route paths to prevent string confusion
 */
export type RoutePath = string & { __brand: 'RoutePath' };

/**
 * Branded type for route names to ensure type safety
 */
export type RouteName = string & { __brand: 'RouteName' };

/**
 * Available navigation modes in the application
 */
export const NAVIGATION_MODES = ['original', 'cdd'] as const;
export type NavigationMode = (typeof NAVIGATION_MODES)[number];

/**
 * Available route categories for organization
 */
export const ROUTE_CATEGORIES = [
  'game',
  'history',
  'settings',
  // 'auth',    // COMMENTED OUT - No authentication restrictions
  // 'admin'    // COMMENTED OUT - No admin routes yet
] as const;
export type RouteCategory = (typeof ROUTE_CATEGORIES)[number];

/**
 * Route access levels for permissions
 * NOTE: Access control commented out - Everyone can access project for now
 */
export const ACCESS_LEVELS = [
  'public',
  // 'user',  // COMMENTED OUT - No access restrictions yet
  // 'admin'  // COMMENTED OUT - No admin functionality yet
] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

/**
 * Page transition types
 */
export const TRANSITION_TYPES = ['fade', 'slide', 'none'] as const;
export type TransitionType = (typeof TRANSITION_TYPES)[number];

// ==================== ROUTE CONSTANTS ====================

/**
 * Application route paths with typed safety
 */
export const ROUTE_PATHS = {
  // Root and redirects
  ROOT: '/' as RoutePath,

  // Original routes
  ORIGINAL_GAME: '/game' as RoutePath,
  ORIGINAL_HISTORY: '/history' as RoutePath,

  // CDD routes
  CDD_ROOT: '/cdd' as RoutePath,
  CDD_GAME: '/cdd/game' as RoutePath,
  CDD_HISTORY: '/cdd/history' as RoutePath,
  CDD_SETTINGS: '/cdd/settings' as RoutePath,

  // Shared routes (for future use)
  SETTINGS: '/settings' as RoutePath,
  // PROFILE: '/profile' as RoutePath,    // COMMENTED OUT - No user profiles yet
  // ADMIN: '/admin' as RoutePath,        // COMMENTED OUT - No admin functionality yet
} as const;

/**
 * Application route names with typed safety
 */
export const ROUTE_NAMES = {
  ROOT: 'Root' as RouteName,
  ORIGINAL_GAME: 'Game' as RouteName,
  ORIGINAL_HISTORY: 'History' as RouteName,
  CDD_GAME: 'CDDGame' as RouteName,
  CDD_HISTORY: 'CDDHistory' as RouteName,
  CDD_SETTINGS: 'CDDSettings' as RouteName,
  SETTINGS: 'Settings' as RouteName,
  // PROFILE: 'Profile' as RouteName,     // COMMENTED OUT - No user profiles yet
  // ADMIN: 'Admin' as RouteName,         // COMMENTED OUT - No admin functionality yet
} as const;

/**
 * Complete route metadata configuration
 */
export const ROUTE_METADATA: Record<RoutePath, RouteMetadata> = {
  [ROUTE_PATHS.ROOT]: {
    category: 'game',
    navigationMode: 'original',
    accessLevel: 'public',
    // requiresAuth: false, // COMMENTED OUT - Authentication not needed
    transition: 'fade',
    meta: {
      title: 'Baccarat Pro',
      description: 'Professional Baccarat Analysis Platform',
    },
  },
  [ROUTE_PATHS.ORIGINAL_GAME]: {
    category: 'game',
    navigationMode: 'original',
    accessLevel: 'public',
    // requiresAuth: false, // COMMENTED OUT - Authentication not needed
    transition: 'fade',
    meta: {
      title: 'Game Analysis',
      description: 'Real-time baccarat game analysis and recommendations',
    },
  },
  [ROUTE_PATHS.ORIGINAL_HISTORY]: {
    category: 'history',
    navigationMode: 'original',
    accessLevel: 'public',
    // requiresAuth: false, // COMMENTED OUT - Authentication not needed
    transition: 'slide',
    meta: {
      title: 'Session History',
      description: 'Review past gaming sessions and performance analytics',
    },
  },
  [ROUTE_PATHS.CDD_ROOT]: {
    category: 'game',
    navigationMode: 'cdd',
    accessLevel: 'public',
    // requiresAuth: false, // COMMENTED OUT - Authentication not needed
    transition: 'fade',
    meta: {
      title: 'CDD Platform',
      description: 'Component-Driven Development interface',
    },
  },
  [ROUTE_PATHS.CDD_GAME]: {
    category: 'game',
    navigationMode: 'cdd',
    accessLevel: 'public',
    // requiresAuth: false, // COMMENTED OUT - Authentication not needed
    transition: 'fade',
    meta: {
      title: 'CDD Game',
      description: 'Component-driven game analysis interface',
    },
  },
  [ROUTE_PATHS.CDD_HISTORY]: {
    category: 'history',
    navigationMode: 'cdd',
    accessLevel: 'public',
    // requiresAuth: false, // COMMENTED OUT - Authentication not needed
    transition: 'slide',
    meta: {
      title: 'CDD History',
      description: 'Component-driven session history and analytics',
    },
  },
  [ROUTE_PATHS.CDD_SETTINGS]: {
    category: 'settings',
    navigationMode: 'cdd',
    accessLevel: 'public',
    // requiresAuth: false, // COMMENTED OUT - Authentication not needed
    transition: 'slide',
    meta: {
      title: 'CDD Settings',
      description: 'Component-driven platform configuration',
    },
  },
  [ROUTE_PATHS.SETTINGS]: {
    category: 'settings',
    navigationMode: 'original',
    accessLevel: 'public',
    // requiresAuth: false, // COMMENTED OUT - Authentication not needed
    transition: 'fade',
    meta: {
      title: 'Settings',
      description: 'Application settings and configuration',
    },
  },
  // COMMENTED OUT - No user profiles yet
  /*
  [ROUTE_PATHS.PROFILE]: {
    category: 'settings',
    navigationMode: 'original',
    accessLevel: 'public',
    // requiresAuth: true, // COMMENTED OUT - Authentication not needed
    transition: 'fade',
    meta: {
      title: 'User Profile',
      description: 'User account settings and preferences',
    },
  },
  */
  // COMMENTED OUT - No admin functionality yet
  /*
  [ROUTE_PATHS.ADMIN]: {
    category: 'admin',
    navigationMode: 'original',
    accessLevel: 'admin',
    // requiresAuth: true, // COMMENTED OUT - Authentication not needed
    transition: 'fade',
    meta: {
      title: 'Admin Panel',
      description: 'Administrative controls and system management',
    },
  },
  */
} as const;

// ==================== ROUTE INTERFACES ====================

/**
 * Enhanced route definition interface
 */
export interface RouteDefinition {
  readonly path: RoutePath;
  readonly name: RouteName;
  readonly component: () => Promise<unknown>;
  readonly category: RouteCategory;
  readonly accessLevel: AccessLevel;
  readonly navigationMode: NavigationMode;
  readonly transition: TransitionType;
  // readonly requiresAuth: boolean;        // COMMENTED OUT - No authentication system
  readonly showInNavigation: boolean;
  readonly meta: {
    readonly title: string;
    readonly description: string;
    readonly keywords?: readonly string[];
    readonly robots?: string;
  };
  readonly beforeEnter?: (targetRoute: unknown, fromRoute: unknown, nextCallback: unknown) => void;
  readonly children?: readonly RouteDefinition[];
}

/**
 * Navigation state interface
 */
export interface NavigationState {
  readonly currentPath: RoutePath;
  readonly currentName: RouteName;
  readonly currentMode: NavigationMode;
  readonly previousPath: RoutePath | null;
  readonly navigationHistory: readonly RoutePath[];
  readonly isNavigating: boolean;
  readonly navigationError: string | null;
}

/**
 * Navigation options for route transitions
 */
export interface NavigationOptions {
  readonly replace?: boolean;
  readonly force?: boolean;
  readonly transition?: TransitionType;
  readonly preserveQuery?: boolean;
  readonly preserveHash?: boolean;
  readonly query?: Record<string, string | number | boolean>;
  readonly params?: Record<string, string | number>;
  readonly onComplete?: () => void;
  readonly onAbort?: (reason: string) => void;
  readonly onError?: (error: Error) => void;
}

/**
 * Route metadata with comprehensive information
 */
export interface RouteMetadata {
  readonly meta: {
    readonly title: string;
    readonly description: string;
  };
  readonly category: RouteCategory;
  readonly navigationMode: NavigationMode;
  // NOTE: Authentication system commented out - not needed for current requirements
  // Preserved for potential future use (IP-based access control, user authentication)
  // readonly requiresAuth: boolean;
  readonly accessLevel: AccessLevel;
  readonly transition: TransitionType;
}

/**
 * Route validation context for security checks
 */
export interface RouteValidationContext {
  readonly currentPath?: RoutePath;
  readonly targetPath?: RoutePath;
  // readonly userRole?: string; // COMMENTED OUT - No user roles/access restrictions yet
  readonly timestamp: Date;
}

/**
 * Route breadcrumb interface
 */
export interface RouteBreadcrumb {
  readonly name: string;
  readonly path: RoutePath;
  readonly isActive: boolean;
  readonly isClickable: boolean;
}

export interface RouteGuardContext {
  readonly from: RoutePath;
  readonly targetRoute: RoutePath;
  readonly navigationMode: NavigationMode;
  readonly timestamp: Date;
  readonly userAgent: string;
  readonly sessionId: string;
  // readonly userRole?: string; // COMMENTED OUT - No user roles/access restrictions yet
}

// ==================== ZOD VALIDATION SCHEMAS ====================

/**
 * Schema for validating route paths
 */
export const RoutePathSchema = z
  .string()
  .min(1, 'Route path cannot be empty')
  .regex(/^\//, 'Route path must start with /')
  .refine(
    path => Object.values(ROUTE_PATHS).includes(path as RoutePath),
    'Route path must be one of the defined valid paths'
  )
  .transform(path => path as RoutePath);

/**
 * Schema for validating route names
 */
export const RouteNameSchema = z
  .string()
  .min(1, 'Route name cannot be empty')
  .regex(/^[A-Z][a-zA-Z0-9]*$/, 'Route name must be PascalCase')
  .refine(
    name => Object.values(ROUTE_NAMES).includes(name as RouteName),
    'Route name must be one of the defined valid names'
  )
  .transform(name => name as RouteName);

/**
 * Schema for validating navigation modes
 */
export const NavigationModeSchema = z.enum(NAVIGATION_MODES, {
  errorMap: () => ({ message: 'Invalid navigation mode' }),
});

/**
 * Schema for validating route categories
 */
export const RouteCategorySchema = z.enum(ROUTE_CATEGORIES, {
  errorMap: () => ({ message: 'Invalid route category' }),
});

/**
 * Schema for validating access levels
 * NOTE: Only 'public' access level active - no restrictions
 */
export const AccessLevelSchema = z.enum(ACCESS_LEVELS, {
  errorMap: () => ({ message: 'Invalid access level' }),
});

/**
 * Schema for validating transition types
 */
export const TransitionTypeSchema = z.enum(TRANSITION_TYPES, {
  errorMap: () => ({ message: 'Invalid transition type' }),
});

/**
 * Schema for validating navigation options
 */
export const NavigationOptionsSchema = z.object({
  replace: z.boolean().optional(),
  force: z.boolean().optional(),
  transition: TransitionTypeSchema.optional(),
  preserveQuery: z.boolean().optional(),
  preserveHash: z.boolean().optional(),
  query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  params: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  onComplete: z.function().optional(),
  onAbort: z.function().optional(),
  onError: z.function().optional(),
});

/**
 * Schema for validating route validation context
 */
export const RouteValidationContextSchema = z.object({
  currentPath: RoutePathSchema.optional(),
  targetPath: RoutePathSchema.optional(),
  navigationMode: NavigationModeSchema.optional(),
  // userRole: z.string().optional(), // COMMENTED OUT - No user roles/access restrictions yet
  timestamp: z.date().optional(),
});

// ==================== UTILITY TYPE GUARDS ====================

/**
 * Type guard for route paths
 */
export const isValidRoutePath = (value: unknown): value is RoutePath => {
  return RoutePathSchema.safeParse(value).success;
};

/**
 * Type guard for route names
 */
export const isValidRouteName = (value: unknown): value is RouteName => {
  return RouteNameSchema.safeParse(value).success;
};

/**
 * Type guard for navigation modes
 */
export const isValidNavigationMode = (value: unknown): value is NavigationMode => {
  return NavigationModeSchema.safeParse(value).success;
};

/**
 * Type guard for route categories
 */
export const isValidRouteCategory = (value: unknown): value is RouteCategory => {
  return RouteCategorySchema.safeParse(value).success;
};

/**
 * Type guard for access levels
 * NOTE: Only validates 'public' access level - no restrictions
 */
export const isValidAccessLevel = (value: unknown): value is AccessLevel => {
  return AccessLevelSchema.safeParse(value).success;
};

// ==================== BRANDED TYPE CREATORS ====================

/**
 * Create a branded route path with validation
 */
export const createRoutePath = (path: string): RoutePath => {
  const result = RoutePathSchema.safeParse(path);
  if (!result.success) {
    throw new Error(`Invalid route path: ${path}`);
  }
  return result.data;
};

/**
 * Create a branded route name with validation
 */
export const createRouteName = (name: string): RouteName => {
  const result = RouteNameSchema.safeParse(name);
  if (!result.success) {
    throw new Error(`Invalid route name: ${name}`);
  }
  return result.data;
};

// ==================== CONSTANTS EXPORT ====================

/**
 * Typed route constants for use throughout the application
 */
export const ROUTE_CONSTANTS = {
  PATHS: ROUTE_PATHS,
  NAMES: ROUTE_NAMES,
  METADATA: ROUTE_METADATA,
  NAVIGATION_MODES,
  ROUTE_CATEGORIES,
  ACCESS_LEVELS,
  TRANSITION_TYPES,
} as const;
