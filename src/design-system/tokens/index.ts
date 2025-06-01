/**
 * Design System - Unified Token Export
 * Single import for all design tokens
 */

export * from './colors';
export * from './spacing';

import { colors, colorVars } from './colors';
import { spacing, semanticSpacing, spacingVars } from './spacing';

// Unified design tokens object
export const tokens = {
  colors,
  spacing,
  semanticSpacing,
} as const;

// Export CSS variable name mappings for programmatic access
export { colorVars, spacingVars };

// CSS Custom Properties generator
export const generateCSSCustomProperties = (): Record<string, string> => {
  const cssVars: Record<string, string> = {};

  // Generate color custom properties
  Object.entries(colors).forEach(([category, colorGroup]) => {
    if (colorGroup && typeof colorGroup === 'object') {
      Object.entries(colorGroup).forEach(([key, value]) => {
        if (typeof value === 'string') {
          cssVars[`--color-${category}-${key}`] = value;
        } else if (value && typeof value === 'object') {
          Object.entries(value).forEach(([shade, color]) => {
            if (typeof color === 'string') {
              cssVars[`--color-${category}-${key}-${shade}`] = color;
            }
          });
        }
      });
    }
  });

  // Generate spacing custom properties
  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });

  // Generate semantic spacing custom properties
  Object.entries(semanticSpacing).forEach(([category, spacingGroup]) => {
    if (spacingGroup && typeof spacingGroup === 'object') {
      Object.entries(spacingGroup).forEach(([key, value]) => {
        if (typeof value === 'string') {
          cssVars[`--spacing-${category}-${key}`] = value;
        } else if (value && typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'string') {
              cssVars[`--spacing-${category}-${key}-${subKey}`] = subValue;
            } else if (subValue && typeof subValue === 'object') {
              Object.entries(subValue).forEach(([variant, variantValue]) => {
                if (typeof variantValue === 'string') {
                  cssVars[`--spacing-${category}-${key}-${subKey}-${variant}`] = variantValue;
                }
              });
            }
          });
        }
      });
    }
  });

  return cssVars;
};

// CSS string generator for injection
export const generateCSSString = (): string => {
  const cssVars = generateCSSCustomProperties();
  const cssRules = Object.entries(cssVars)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');

  return `:root {\n${cssRules}\n}`;
};

// Token validation utilities
export const validateColorToken = (token: string): boolean => {
  const [category, subcategory, shade] = token.split('.');
  const colorGroup = (colors as any)[category];

  if (!colorGroup) {
    return false;
  }

  if (subcategory && shade) {
    return Boolean(colorGroup[subcategory]?.[shade]);
  }

  if (subcategory) {
    return Boolean(colorGroup[subcategory]);
  }

  return Boolean(colorGroup);
};

export const validateSpacingToken = (token: string): boolean => {
  return token in spacing;
};

// Design token types for TypeScript
export type DesignTokens = typeof tokens;
export type ColorTokenPath = string; // Could be enhanced with template literal types
export type SpacingTokenPath = string;

// Component variant types
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost';
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'focus';
