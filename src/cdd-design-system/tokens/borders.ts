export const borderRadius = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

export const borderWidth = {
  0: '0px',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const;

// Gambling-specific borders
export const cardBorders = {
  default: {
    width: borderWidth[1],
    radius: borderRadius.lg,
  },
  elevated: {
    width: borderWidth[2],
    radius: borderRadius.xl,
  },
} as const;

export const panelBorders = {
  default: {
    width: borderWidth[1],
    radius: borderRadius.md,
  },
  elevated: {
    width: borderWidth[1],
    radius: borderRadius.lg,
  },
} as const;

export type BorderRadius = keyof typeof borderRadius;
export type BorderWidth = keyof typeof borderWidth;
