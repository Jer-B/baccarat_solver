// Breakpoint Design Tokens
// Using EM units for better accessibility (respects user font size preferences)

// Base font size for calculations (browser default)
const BASE_FONT_SIZE = 16; // 16px

// Helper function to convert px to em
const pxToEm = (px: number): number => px / BASE_FONT_SIZE;

export const breakpoints = {
  // Raw pixel values (for reference)
  px: {
    xs: 320, // Mobile portrait minimum
    sm: 480, // Mobile landscape
    md: 768, // Tablet portrait
    lg: 992, // Tablet landscape / Small desktop
    xl: 1200, // Desktop
    '2xl': 1440, // Large desktop
    '3xl': 1920, // Ultra-wide desktop
  },

  // EM values (preferred for media queries)
  em: {
    xs: pxToEm(320), // 20em
    sm: pxToEm(480), // 30em
    md: pxToEm(768), // 48em
    lg: pxToEm(992), // 62em
    xl: pxToEm(1200), // 75em
    '2xl': pxToEm(1440), // 90em
    '3xl': pxToEm(1920), // 120em
  },
} as const;

// Media query ranges for components
export const mediaQueries = {
  // Mobile Portrait: 320px - 479px (20em - 29.9375em)
  mobilePortrait: `(max-width: ${breakpoints.em.sm - 0.0625}em)`,

  // Mobile Landscape: 480px - 767px (30em - 47.9375em)
  mobileLandscape: `(min-width: ${breakpoints.em.sm}em) and (max-width: ${breakpoints.em.md - 0.0625}em)`,

  // Tablet Portrait: 768px - 991px (48em - 61.9375em)
  tabletPortrait: `(min-width: ${breakpoints.em.md}em) and (max-width: ${breakpoints.em.lg - 0.0625}em)`,

  // Tablet Landscape: 992px - 1199px (62em - 74.9375em)
  tabletLandscape: `(min-width: ${breakpoints.em.lg}em) and (max-width: ${breakpoints.em.xl - 0.0625}em)`,

  // Small Desktop: 1200px - 1439px (75em - 89.9375em)
  smallDesktop: `(min-width: ${breakpoints.em.xl}em) and (max-width: ${breakpoints.em['2xl'] - 0.0625}em)`,

  // Large Desktop: 1440px - 1919px (90em - 119.9375em)
  largeDesktop: `(min-width: ${breakpoints.em['2xl']}em) and (max-width: ${breakpoints.em['3xl'] - 0.0625}em)`,

  // Ultra-wide Desktop: 1920px+ (120em+)
  ultraWideDesktop: `(min-width: ${breakpoints.em['3xl']}em)`,

  // Minimum width protection (prevent breaking below 320px/20em)
  minWidth: `(max-width: ${breakpoints.em.xs - 0.0625}em)`,

  // High DPI displays
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
} as const;

// Semantic breakpoint helpers
export const screens = {
  mobile: breakpoints.em.sm,
  tablet: breakpoints.em.md,
  laptop: breakpoints.em.lg,
  desktop: breakpoints.em.xl,
  wide: breakpoints.em['2xl'],
  ultraWide: breakpoints.em['3xl'],
} as const;

// CSS Custom Properties (for use in CSS files)
export const breakpointVars = {
  '--bp-xs': `${breakpoints.em.xs}em`,
  '--bp-sm': `${breakpoints.em.sm}em`,
  '--bp-md': `${breakpoints.em.md}em`,
  '--bp-lg': `${breakpoints.em.lg}em`,
  '--bp-xl': `${breakpoints.em.xl}em`,
  '--bp-2xl': `${breakpoints.em['2xl']}em`,
  '--bp-3xl': `${breakpoints.em['3xl']}em`,
} as const;

// Responsive typography scale based on breakpoints
export const responsiveTypography = {
  // Header title scaling
  headerTitle: {
    mobilePortrait: '1rem', // 16px
    mobileLandscape: '1.125rem', // 18px
    tabletPortrait: '1.25rem', // 20px
    tabletLandscape: '1.5rem', // 24px
    smallDesktop: '1.75rem', // 28px
    largeDesktop: '2rem', // 32px
    ultraWideDesktop: '2.25rem', // 36px (capped)
  },

  // Button/toggle scaling
  toggleSize: {
    mobilePortrait: { width: '2.75rem', height: '1.375rem' }, // 44px × 22px
    mobileLandscape: { width: '3.75rem', height: '1.75rem' }, // 60px × 28px
    tabletPortrait: { width: '6.875rem', height: '1.875rem' }, // 110px × 30px
    tabletLandscape: { width: '8.125rem', height: '2rem' }, // 130px × 32px
    smallDesktop: { width: '8.75rem', height: '2rem' }, // 140px × 32px
    largeDesktop: { width: '9.375rem', height: '2.125rem' }, // 150px × 34px (capped)
  },
} as const;

export type BreakpointKey = keyof typeof breakpoints.em;
export type MediaQueryKey = keyof typeof mediaQueries;
export type ScreenKey = keyof typeof screens;
