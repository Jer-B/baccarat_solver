/**
 * 🎯 Theme System - Component Type Definitions
 *
 * TypeScript type definitions for theme-related Vue components.
 * Contains props, emits, and component-specific interfaces.
 */

import type { ThemeMode } from '@/types/core/themeTypes';

// ==================== THEME TOGGLE COMPONENT ====================

/**
 * Theme Toggle Component Props
 */
export interface ThemeToggleProps {
  /** Disable the toggle interaction */
  disabled?: boolean;

  /** Size variant for the toggle */
  size?: 'sm' | 'base' | 'lg';

  /** Whether to show text labels in the toggle */
  showLabels?: boolean;
}

/**
 * Theme Toggle Component Emits
 */
export interface ThemeToggleEmits {
  /** Emitted when theme changes */
  'theme-changed': [theme: ThemeMode];

  /** Emitted when toggle is clicked */
  'toggle-clicked': [event: MouseEvent];
}

// ==================== COMMON GAME HEADER COMPONENT ====================

/**
 * Common Game Header Component Props
 */
export interface GameHeaderProps {
  /** Header title text */
  title?: string;

  /** Whether to show the theme toggle */
  showThemeToggle?: boolean;

  /** Custom CSS classes for styling */
  customClasses?: string;
}

/**
 * Common Game Header Component Emits
 */
export interface GameHeaderEmits {
  /** Emitted when header action is triggered */
  'header-action': [action: string];

  /** Emitted when theme toggle interaction occurs */
  'theme-toggle': [theme: ThemeMode];
}

// ==================== TAB MENU COMPONENT ====================

/**
 * Tab Menu Component Props
 */
export interface TabMenuProps {
  /** Currently active tab identifier */
  activeTab?: string;

  /** Available tab configurations */
  tabs?: TabConfiguration[];

  /** Whether to show the switch-to-original button */
  showSwitchButton?: boolean;
}

/**
 * Tab configuration interface
 */
export interface TabConfiguration {
  /** Unique tab identifier */
  id: string;

  /** Display label for the tab */
  label: string;

  /** Route path for navigation */
  path: string;

  /** Optional icon for the tab */
  icon?: string;

  /** Whether tab is disabled */
  disabled?: boolean;
}

/**
 * Tab Menu Component Emits
 */
export interface TabMenuEmits {
  /** Emitted when active tab changes */
  'tab-changed': [tabId: string];

  /** Emitted when switch-to-original button is clicked */
  'switch-to-original': [];
}

// ==================== THEME-AWARE COMPONENT PROPS ====================

/**
 * Base props for theme-aware components
 */
export interface ThemeAwareComponentProps {
  /** Force specific theme for component */
  forceTheme?: ThemeMode;

  /** Disable theme reactivity */
  disableThemeReactivity?: boolean;

  /** Custom theme class overrides */
  themeClassOverrides?: Partial<Record<ThemeMode, string>>;
}

/**
 * Base emits for theme-aware components
 */
export interface ThemeAwareComponentEmits {
  /** Emitted when component theme state changes */
  'theme-state-change': [theme: ThemeMode, isActive: boolean];
}

// ==================== COMPONENT COMPOSITION TYPES ====================

/**
 * Theme component composition options
 */
export interface ThemeComponentComposition {
  /** Component name for debugging and error reporting */
  componentName: string;

  /** Whether to auto-initialize theme on mount */
  autoInitialize?: boolean;

  /** Whether to watch for theme changes */
  watchThemeChanges?: boolean;

  /** Custom error handling for component */
  errorHandler?: (error: Error) => void;
}

/**
 * Theme component state interface
 */
export interface ThemeComponentState {
  /** Current active theme */
  currentTheme: ThemeMode;

  /** Whether component theme is initialized */
  isThemeInitialized: boolean;

  /** Component-specific theme error state */
  themeError: string | null;

  /** Theme-related loading state */
  isThemeLoading: boolean;
}
