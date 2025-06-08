/**
 * 🎯 Theme System - Core Type Definitions
 *
 * Pure TypeScript type definitions for theme system with strict typing.
 * Contains only theme-related types, interfaces, and constants.
 */

import { z } from 'zod';

// ==================== CORE THEME ENUMS & CONSTANTS ====================

/**
 * Available theme modes as readonly tuple for strict typing
 */
export const THEME_MODES = ['luxury', 'elite'] as const;

/**
 * Theme mode union type derived from THEME_MODES
 */
export type ThemeMode = (typeof THEME_MODES)[number];

/**
 * Theme system configuration constants
 */
export const THEME_CONSTANTS = {
  /** Default theme applied on initialization */
  DEFAULT_THEME: 'luxury' as ThemeMode,

  /** localStorage key for theme persistence */
  STORAGE_KEY: 'theme-store',

  /** HTML data attribute applied to document element */
  DATA_ATTRIBUTE: 'data-theme',

  /** Maximum time allowed for theme initialization (ms) */
  INITIALIZATION_TIMEOUT: 5000,

  /** Number of retry attempts for failed operations */
  PERSISTENCE_RETRY_COUNT: 3,

  /** Delay between error recovery attempts (ms) */
  ERROR_RECOVERY_DELAY: 1000,
} as const;

// ==================== THEME DISPLAY INFORMATION ====================

/**
 * Theme display metadata interface
 */
export interface ThemeDisplayInfo {
  /** Human-readable theme name */
  readonly name: string;

  /** Theme description for UI tooltips */
  readonly description: string;

  /** Emoji or icon representing the theme */
  readonly icon: string;
}

/**
 * Theme display information mapping with complete metadata
 */
export const THEME_DISPLAY_INFO: Record<ThemeMode, ThemeDisplayInfo> = {
  luxury: {
    name: 'Modern Luxury',
    description: 'High-tech midnight navy with cyan',
    icon: '🌙',
  },
  elite: {
    name: 'Platinum Elite',
    description: 'Ultimate sophistication',
    icon: '💎',
  },
} as const;

// ==================== THEME STATE INTERFACES ====================

/**
 * Core theme state interface
 */
export interface ThemeState {
  /** Currently active theme mode */
  currentTheme: ThemeMode;
}

/**
 * Extended theme state with initialization tracking
 */
export interface ThemeStateExtended extends ThemeState {
  /** Whether theme system has been initialized */
  isInitialized: boolean;

  /** Initialization error message if any */
  initializationError: string | null;
}

// ==================== THEME STORE INTERFACE ====================

/**
 * Complete theme store interface with all actions and getters
 */
export interface ThemeStore extends ThemeStateExtended {
  // ==================== COMPUTED GETTERS ====================

  /** True if current theme is luxury */
  readonly isLuxuryTheme: boolean;

  /** True if current theme is elite */
  readonly isEliteTheme: boolean;

  /** Human-readable display name of current theme */
  readonly themeDisplayName: string;

  /** Description of current theme */
  readonly themeDescription: string;

  /** Icon/emoji for current theme */
  readonly themeIcon: string;

  // ==================== THEME ACTIONS ====================

  /** Toggle between luxury and elite themes */
  toggleTheme(): Promise<void>;

  /** Set specific theme mode with validation */
  setTheme(theme: ThemeMode): Promise<void>;

  /** Set luxury theme (convenience method) */
  setLuxuryTheme(): Promise<void>;

  /** Set elite theme (convenience method) */
  setEliteTheme(): Promise<void>;

  /** Initialize theme system */
  initializeTheme(): Promise<void>;

  // ==================== VALIDATION UTILITIES ====================

  /** Validate current theme mode */
  validateCurrentTheme(): boolean;

  /** Get comprehensive theme system health status */
  getThemeSystemHealth(): {
    isInitialized: boolean;
    currentTheme: ThemeMode;
    hasError: boolean;
    errorMessage: string | null;
    isValidTheme: boolean;
    hasCriticalErrors: boolean;
  };
}

// ==================== ZOD VALIDATION SCHEMAS ====================

/**
 * Runtime validation schema for theme mode
 */
export const ThemeModeSchema = z.enum(THEME_MODES, {
  errorMap: () => ({ message: `Theme must be one of: ${THEME_MODES.join(', ')}` }),
});

/**
 * Runtime validation schema for theme state
 */
export const ThemeStateSchema = z.object({
  currentTheme: ThemeModeSchema,
});

/**
 * Runtime validation schema for persistence data
 */
export const PersistenceDataSchema = z.object({
  currentTheme: ThemeModeSchema,
  timestamp: z.number().optional(),
  version: z.string().optional(),
});

// ==================== TYPE GUARDS & UTILITIES ====================

/**
 * Type guard to check if value is valid theme mode
 */
export const isValidThemeMode = (value: unknown): value is ThemeMode => {
  return ThemeModeSchema.safeParse(value).success;
};

/**
 * Safe theme mode parsing with null return for invalid values
 */
export const parseThemeMode = (value: unknown): ThemeMode | null => {
  const result = ThemeModeSchema.safeParse(value);
  return result.success ? result.data : null;
};

/**
 * Theme mode assertion with detailed error message
 */
export const assertThemeMode = (value: unknown): ThemeMode => {
  const result = ThemeModeSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid theme mode: ${value}. Expected: ${THEME_MODES.join(' | ')}`);
  }
  return result.data;
};
