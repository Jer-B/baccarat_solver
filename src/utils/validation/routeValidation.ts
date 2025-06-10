/**
 * 🔍 Route Validation - Excellence Level
 *
 * Comprehensive route validation system with Zod schemas, type safety,
 * and advanced validation patterns for Vue Router integration.
 */

import { z } from 'zod';

// Type imports
import type { RoutePath, RouteName, NavigationMode, RouteMetadata } from '@/types/core/routeTypes';

import {
  ROUTE_PATHS,
  ROUTE_NAMES,
  ROUTE_METADATA,
  NAVIGATION_MODES,
  createRoutePath,
  createRouteName,
  isValidRoutePath,
  isValidRouteName,
  isValidNavigationMode,
} from '@/types/core/routeTypes';

// ==================== ADDITIONAL INTERFACES ====================

/**
 * Route guard context for navigation guards
 */
interface RouteGuardContext {
  from: RoutePath;
  targetRoute: RoutePath;
  navigationMode: NavigationMode;
  timestamp: Date;
  userAgent: string;
  sessionId: string;
}

// ==================== VALIDATION RESULT TYPES ====================

/**
 * Validation result pattern (consistent with theme system)
 */
interface ValidationSuccess<TData = unknown> {
  success: true;
  data: TData;
}

interface ValidationError {
  success: false;
  error: {
    message: string;
    code: string;
    field?: string;
    details?: Record<string, unknown>;
  };
}

export type ValidationResult<TData = unknown> = ValidationSuccess<TData> | ValidationError;

// ==================== ZOD SCHEMAS ====================

/**
 * Route path validation schema
 */
const RoutePathSchema = z
  .string()
  .min(1, 'Route path cannot be empty')
  .refine(value => isValidRoutePath(value), 'Invalid route path format or unknown route');

/**
 * Route name validation schema
 */
const RouteNameSchema = z
  .string()
  .min(1, 'Route name cannot be empty')
  .refine(value => isValidRouteName(value), 'Invalid route name format or unknown route name');

/**
 * Navigation mode validation schema
 */
const NavigationModeSchema = z
  .enum(['original', 'cdd'] as const)
  .refine(value => isValidNavigationMode(value), 'Invalid navigation mode');

/**
 * Route transition validation schema
 */
const RouteTransitionSchema = z.object({
  fromPath: RoutePathSchema,
  toPath: RoutePathSchema,
  navigationMode: NavigationModeSchema,
  preserveQuery: z.boolean().optional(),
  preserveHash: z.boolean().optional(),
  force: z.boolean().optional(),
});

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate route path with comprehensive checks
 */
export const validateRoutePath = (path: string): ValidationResult<RoutePath> => {
  try {
    const parsedPath = RoutePathSchema.parse(path);
    const routePath = createRoutePath(parsedPath);

    return {
      success: true,
      data: routePath,
    };
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.errors[0]?.message || 'Route path validation failed'
        : 'Unknown validation error';

    return {
      success: false,
      error: {
        message,
        code: 'INVALID_ROUTE_PATH',
        field: 'path',
        details: { providedPath: path },
      },
    };
  }
};

/**
 * Validate route name with comprehensive checks
 */
export const validateRouteName = (name: string): ValidationResult<RouteName> => {
  try {
    const parsedName = RouteNameSchema.parse(name);
    const routeName = createRouteName(parsedName);

    return {
      success: true,
      data: routeName,
    };
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.errors[0]?.message || 'Route name validation failed'
        : 'Unknown validation error';

    return {
      success: false,
      error: {
        message,
        code: 'INVALID_ROUTE_NAME',
        field: 'name',
        details: { providedName: name },
      },
    };
  }
};

/**
 * Validate navigation mode
 */
export const validateNavigationMode = (mode: string): ValidationResult<NavigationMode> => {
  try {
    const parsedMode = NavigationModeSchema.parse(mode);

    return {
      success: true,
      data: parsedMode,
    };
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.errors[0]?.message || 'Navigation mode validation failed'
        : 'Unknown validation error';

    return {
      success: false,
      error: {
        message,
        code: 'INVALID_NAVIGATION_MODE',
        field: 'mode',
        details: {
          providedMode: mode,
          validModes: NAVIGATION_MODES,
        },
      },
    };
  }
};

/**
 * Validate route transition compatibility
 */
export const validateRouteTransition = (transition: {
  fromPath: RoutePath;
  toPath: RoutePath;
  navigationMode: NavigationMode;
}): ValidationResult<boolean> => {
  try {
    // Validate the transition data structure
    const parsedTransition = RouteTransitionSchema.parse(transition);

    // Basic checks that always pass since there are no restrictions
    const fromMetadata = ROUTE_METADATA[parsedTransition.fromPath];
    const toMetadata = ROUTE_METADATA[parsedTransition.toPath];

    if (!fromMetadata || !toMetadata) {
      return {
        success: false,
        error: {
          message: 'Route metadata not found for transition',
          code: 'ROUTE_METADATA_MISSING',
          details: {
            fromPath: parsedTransition.fromPath,
            toPath: parsedTransition.toPath,
          },
        },
      };
    }

    // All transitions are allowed since there are no access restrictions
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? `Route transition validation failed: ${error.errors[0]?.message}`
        : 'Unknown transition validation error';

    return {
      success: false,
      error: {
        message,
        code: 'INVALID_ROUTE_TRANSITION',
        details: { transition },
      },
    };
  }
};

/**
 * Validate route access (COMMENTED OUT - No access restrictions)
 *
 * This function is preserved for future use when access control might be needed.
 * Currently, all routes are publicly accessible.
 */
export const validateRouteAccess = (
  targetPath: RoutePath,
  context: RouteGuardContext
): { allowed: boolean; reason?: string; fallbackPath?: RoutePath } => {
  // COMMENTED OUT - No access restrictions for now
  // Everyone can access all routes until project requirements change

  console.log('[route-validation][access] Route access granted - no restrictions', {
    targetPath,
    from: context.from,
    mode: context.navigationMode,
  });

  return {
    allowed: true,
    reason: 'Route access granted - no restrictions',
  };

  /* COMMENTED OUT - Original access control logic preserved for future use
  try {
    // Get route metadata for access level checking
    const routeMetadata = ROUTE_METADATA[targetPath];

    if (!routeMetadata) {
      console.warn('[route-validation][access] Route metadata not found:', { targetPath });
      return {
        allowed: false,
        reason: 'Route metadata not found',
        fallbackPath: ROUTE_PATHS.ROOT,
      };
    }

    // Check access level requirements
    const requiredAccessLevel = routeMetadata.accessLevel;
    
    // For now, all routes are 'public' so access is always granted
    if (requiredAccessLevel === 'public') {
      return {
        allowed: true,
        reason: 'Public route access granted',
      };
    }

    // Future: Add user role checking here
    // const userRole = getUserRole(); // To be implemented
    // if (userRole === 'admin' && requiredAccessLevel === 'admin') {
    //   return { allowed: true, reason: 'Admin access granted' };
    // }

    console.warn('[route-validation][access] Access denied:', {
      targetPath,
      requiredAccessLevel,
      reason: 'Insufficient permissions',
    });

    return {
      allowed: false,
      reason: 'Insufficient permissions',
      fallbackPath: ROUTE_PATHS.ROOT,
    };
  } catch (error) {
    console.error('[route-validation][access] Access validation error:', error);
    
    return {
      allowed: false,
      reason: 'Access validation failed',
      fallbackPath: ROUTE_PATHS.ROOT,
    };
  }
  */
};

/**
 * Create a route guard with validation (SIMPLIFIED - No access restrictions)
 */
export const createRouteGuard = (
  validator: (context: RouteGuardContext) => ValidationResult<boolean>,
  fallbackPath: RoutePath = ROUTE_PATHS.ROOT
) => {
  return (destinationRoute: any, from: any, next: any) => {
    try {
      const context: RouteGuardContext = {
        from: createRoutePath(from.path),
        targetRoute: createRoutePath(destinationRoute.path),
        navigationMode: destinationRoute.meta?.navigationMode || 'original',
        timestamp: new Date(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        sessionId: `session-${Date.now()}`,
      };

      // SIMPLIFIED - No access restrictions, just log the navigation
      console.log('[route-guard] Navigation allowed - no restrictions', {
        from: context.from,
        to: context.targetRoute,
        mode: context.navigationMode,
      });

      next();

      /* COMMENTED OUT - Original guard logic preserved for future use
      const validationResult = validator(context);

      if (validationResult.success) {
        console.log('[route-guard] Navigation validated:', {
          from: context.from,
          to: context.targetRoute,
          mode: context.navigationMode,
        });
        next();
      } else {
        console.warn('[route-guard] Navigation blocked:', {
          from: context.from,
          to: context.targetRoute,
          reason: validationResult.error.message,
        });
        next(fallbackPath);
      }
      */
    } catch (error) {
      console.error('[route-guard] Guard execution error:', error);
      // Allow navigation to continue even if guard fails
      next();
    }
  };
};

/**
 * Get route metadata safely
 */
export const getRouteMetadata = (path: RoutePath): RouteMetadata | null => {
  try {
    const metadata = ROUTE_METADATA[path];

    if (!metadata) {
      console.warn('[route-validation][metadata] Route metadata not found:', { path });
      return null;
    }

    return metadata;
  } catch (error) {
    console.error('[route-validation][metadata] Error getting route metadata:', error);
    return null;
  }
};

/**
 * Get suggested routes for navigation mode
 */
export const getSuggestedRoutes = (mode: NavigationMode): RoutePath[] => {
  try {
    const routes = Object.entries(ROUTE_METADATA)
      .filter(([, metadata]) => metadata.navigationMode === mode)
      .map(([path]) => path as RoutePath);

    return routes;
  } catch (error) {
    console.error('[route-validation][suggestions] Error getting suggested routes:', error);
    return [];
  }
};

/**
 * Get route category safely
 */
export const getRouteCategory = (path: RoutePath): string => {
  const metadata = getRouteMetadata(path);
  return metadata?.category || 'unknown';
};

/**
 * Check if route transition is safe (simplified - always true now)
 */
export const isTransitionSafe = (fromPath: RoutePath, targetPath: RoutePath): boolean => {
  try {
    // SIMPLIFIED - All transitions are safe since there are no restrictions
    const fromMetadata = getRouteMetadata(fromPath);
    const toMetadata = getRouteMetadata(targetPath);

    if (!fromMetadata || !toMetadata) {
      console.warn('[route-validation][transition] Missing metadata for transition:', {
        fromPath,
        targetPath,
      });
      return false;
    }

    // All transitions are safe
    return true;

    /* COMMENTED OUT - Original transition safety logic preserved for future use
    // Check if navigation modes are compatible
    const sameMode = fromMetadata.navigationMode === toMetadata.navigationMode;
    const crossModeAllowed = true; // For now, allow all cross-mode navigation

    // Check access level compatibility
    const accessCompatible = true; // For now, all access levels are compatible

    return sameMode || crossModeAllowed && accessCompatible;
    */
  } catch (error) {
    console.error('[route-validation][transition] Error checking transition safety:', error);
    return false;
  }
};

/**
 * Validate route parameters
 */
export const validateRouteParams = (
  path: RoutePath,
  params: Record<string, string>
): ValidationResult<Record<string, string>> => {
  try {
    // Basic parameter validation
    const cleanParams: Record<string, string> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.trim() !== '') {
        cleanParams[key] = value.trim();
      }
    }

    return {
      success: true,
      data: cleanParams,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Route parameter validation failed',
        code: 'INVALID_ROUTE_PARAMS',
        details: { path, params },
      },
    };
  }
};

/**
 * Create validation context for guards
 */
export const createValidationContext = (
  currentPath: RoutePath,
  targetPath: RoutePath,
  navigationMode: NavigationMode
): RouteGuardContext => {
  return {
    from: currentPath,
    targetRoute: targetPath,
    navigationMode,
    timestamp: new Date(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    sessionId: `session-${Date.now()}`,
  };
};

/**
 * Validate multiple routes
 */
export const validateRoutes = (paths: string[]): ValidationResult<RoutePath[]> => {
  try {
    const validatedPaths: RoutePath[] = [];
    const errors: string[] = [];

    for (const path of paths) {
      const result = validateRoutePath(path);
      if (result.success) {
        validatedPaths.push(result.data);
      } else {
        errors.push(`${path}: ${result.error.message}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          message: `Route validation failed for ${errors.length} paths`,
          code: 'MULTIPLE_ROUTE_VALIDATION_FAILED',
          details: { errors },
        },
      };
    }

    return {
      success: true,
      data: validatedPaths,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Routes validation failed',
        code: 'ROUTES_VALIDATION_ERROR',
        details: { originalError: error },
      },
    };
  }
};

// ==================== ADDITIONAL VALIDATION FUNCTIONS ====================

/**
 * Get all available route names for validation and development
 */
export const getAllRouteNames = (): RouteName[] => {
  return Object.values(ROUTE_NAMES);
};

/**
 * Validate route name exists in the system
 */
export const isValidRouteNameInSystem = (name: RouteName): boolean => {
  return Object.values(ROUTE_NAMES).includes(name);
};

/**
 * Get route path by route name lookup
 */
export const getRoutePathByName = (routeName: RouteName): RoutePath | null => {
  try {
    // Find the route path that corresponds to this route name
    const pathEntry = Object.entries(ROUTE_METADATA).find(
      ([, metadata]) => metadata.meta.title === routeName
    );

    if (pathEntry) {
      return pathEntry[0] as RoutePath;
    }

    console.warn('[route-validation][name-lookup] Route name not found:', { routeName });
    return null;
  } catch (error) {
    console.error('[route-validation][name-lookup] Error finding route by name:', error);
    return null;
  }
};

/**
 * Validate route name format and existence
 */
export const validateRouteNameExists = (name: string): ValidationResult<RouteName> => {
  try {
    // First validate the format
    const formatResult = validateRouteName(name);
    if (!formatResult.success) {
      return formatResult;
    }

    // Then check if it exists in the system
    if (!isValidRouteNameInSystem(formatResult.data)) {
      return {
        success: false,
        error: {
          message: `Route name "${name}" is not registered in the system`,
          code: 'ROUTE_NAME_NOT_FOUND',
          field: 'name',
          details: {
            providedName: name,
            availableNames: getAllRouteNames(),
          },
        },
      };
    }

    return { success: true, data: formatResult.data };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Route name existence validation failed',
        code: 'ROUTE_NAME_VALIDATION_ERROR',
        details: { originalError: error },
      },
    };
  }
};
