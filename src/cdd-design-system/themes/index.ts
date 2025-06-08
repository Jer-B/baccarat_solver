// Theme System - Single Source of Truth

import { luxuryTheme } from './definitions/luxury';
import { eliteTheme } from './definitions/elite';
import fs from 'fs';
import path from 'path';

export { luxuryTheme } from './definitions/luxury';
export { eliteTheme } from './definitions/elite';

// Re-export ThemeMode from centralized type system
export type { ThemeMode } from '@/types';

// Theme Registry
export const themes = {
  luxury: luxuryTheme,
  elite: eliteTheme,
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = typeof luxuryTheme | typeof eliteTheme;

// CSS Custom Properties Generation
export const generateThemeProperties = (theme: Theme): Record<string, string> => {
  return {
    // Header
    '--theme-header-bg': theme.header.background,
    '--theme-header-border': theme.header.border,
    '--theme-header-shadow': theme.header.shadow,
    '--theme-text-shadow': theme.header.textShadow,
    '--theme-text-glow': theme.header.textGlow,

    // Toggle/Track
    '--theme-track-bg': theme.toggle.trackBackground,
    '--theme-track-border': theme.toggle.trackBorder,
    '--theme-track-border-hover': theme.toggle.trackBorderHover,
    '--theme-track-shadow': theme.toggle.trackShadow,
    '--theme-track-shadow-hover': theme.toggle.trackShadowHover,

    // Slider
    '--theme-slider-bg': theme.toggle.sliderBackground,
    '--theme-slider-shadow': theme.toggle.sliderShadow,
    '--theme-slider-text-color': theme.toggle.sliderTextColor,

    // Colors
    '--theme-primary': theme.colors.primary,
    '--theme-primary-hover': theme.colors.primaryHover,
    '--theme-text-primary': theme.colors.textPrimary,
    '--theme-text-secondary': theme.colors.textSecondary,

    // Tab Menu
    '--theme-tab-menu-bg': theme.tabMenu.background,
    '--theme-tab-menu-border': theme.tabMenu.border,

    // Tab States
    '--theme-tab-inactive-color': theme.tabMenu.inactive.color,
    '--theme-tab-inactive-bg': theme.tabMenu.inactive.background,
    '--theme-tab-inactive-hover-color': theme.tabMenu.inactive.hoverColor,
    '--theme-tab-inactive-hover-bg': theme.tabMenu.inactive.hoverBackground,
    '--theme-tab-inactive-hover-shadow': theme.tabMenu.inactive.hoverShadow,

    '--theme-tab-active-color': theme.tabMenu.active.color,
    '--theme-tab-active-bg': theme.tabMenu.active.background,
    '--theme-tab-active-border': theme.tabMenu.active.border,
    '--theme-tab-active-text-shadow': theme.tabMenu.active.textShadow || 'none',
    '--theme-tab-active-text-glow': theme.tabMenu.active.textGlow || 'none',
    '--theme-tab-active-shadow': theme.tabMenu.active.shadow,

    // Switch Button
    '--theme-switch-bg': theme.switchButton.background,
    '--theme-switch-color': theme.switchButton.color,
    '--theme-switch-border': theme.switchButton.border,
    '--theme-switch-text-shadow': theme.switchButton.textShadow,
    '--theme-switch-shadow': theme.switchButton.shadow,
    '--theme-switch-hover-bg': theme.switchButton.hoverBackground,
    '--theme-switch-hover-color': theme.switchButton.hoverColor,
    '--theme-switch-hover-border': theme.switchButton.hoverBorder,
    '--theme-switch-hover-shadow': theme.switchButton.hoverShadow,
  };
};

// CSS Generation Function
export const generateThemeCSS = (themeName: ThemeName): string => {
  const theme = themes[themeName];
  const props = generateThemeProperties(theme);

  return `/* ⚠️  AUTO-GENERATED CSS - DO NOT EDIT MANUALLY! ⚠️ 
 * Generated from: src/cdd-design-system/themes/definitions/${themeName}.ts
 * To modify theme colors, edit the TypeScript file and run: yarn build:themes
 * Last generated: ${new Date().toISOString()}
 */

[data-theme='${themeName}'] {
${Object.entries(props)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}
`;
};

// Build Script - Generate CSS files from TypeScript definitions
export const buildThemes = (): void => {
  const generatedDir = path.join(__dirname, 'generated');

  // Ensure generated directory exists
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  // Generate CSS for each theme
  Object.keys(themes).forEach(themeName => {
    const css = generateThemeCSS(themeName as ThemeName);
    const filePath = path.join(generatedDir, `${themeName}.css`);

    fs.writeFileSync(filePath, css, 'utf8');
    console.log(`✅ Generated: ${filePath}`);
  });

  console.log('🎯 Theme CSS generation complete!');
};

// Auto-build in development (Node.js environment)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  // Only auto-build if we're in Node.js (not browser) and not in production
  try {
    buildThemes();
  } catch (error) {
    console.warn('⚠️  Could not auto-generate theme CSS:', error);
  }
}
