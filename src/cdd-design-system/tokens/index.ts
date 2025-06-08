export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './borders';
export * from './animations';
export * from './breakpoints';
export * from '../themes/index';

import { colors } from './colors';
import { spacing, layout } from './spacing';
import { fonts, fontSize, fontWeight, lineHeight, letterSpacing } from './typography';
import { shadows, cardShadows, panelShadows } from './shadows';
import { borderRadius, borderWidth, cardBorders, panelBorders } from './borders';
import { transitions, easings, transitionSets } from './animations';
import { breakpoints, mediaQueries, screens, responsiveTypography } from './breakpoints';
import { themes, luxuryTheme, eliteTheme, generateThemeProperties } from '../themes/index';

// Export complete design system
export const designTokens = {
  colors,
  spacing,
  layout,
  fonts,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  shadows,
  cardShadows,
  panelShadows,
  borderRadius,
  borderWidth,
  cardBorders,
  panelBorders,
  transitions,
  easings,
  transitionSets,
  breakpoints,
  mediaQueries,
  screens,
  responsiveTypography,
  themes,
  luxuryTheme,
  eliteTheme,
  generateThemeProperties,
} as const;

export type DesignTokens = typeof designTokens;
