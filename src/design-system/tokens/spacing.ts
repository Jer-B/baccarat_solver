/**
 * Design System - Spacing Tokens
 * Systematic spacing scale for consistent layouts
 */

export const spacing = {
  // Base spacing scale (rem-based for accessibility)
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
} as const;

// Semantic spacing for specific use cases
export const semanticSpacing = {
  // Component internal spacing
  component: {
    xs: spacing[1], // 4px - tight spacing
    sm: spacing[2], // 8px - small spacing
    md: spacing[4], // 16px - default spacing
    lg: spacing[6], // 24px - large spacing
    xl: spacing[8], // 32px - extra large spacing
  },

  // Layout spacing
  layout: {
    section: spacing[12], // 48px - between major sections
    panel: spacing[8], // 32px - panel padding
    card: spacing[6], // 24px - card padding
    grid: spacing[6], // 24px - grid gaps
  },

  // Interactive element spacing
  interactive: {
    button: {
      padding: {
        sm: `${spacing[1]} ${spacing[3]}`, // 4px 12px
        md: `${spacing[2]} ${spacing[4]}`, // 8px 16px
        lg: `${spacing[3]} ${spacing[6]}`, // 12px 24px
      },
      gap: spacing[2], // 8px - gap between buttons
    },
    toggle: {
      padding: `${spacing[1]} ${spacing[2]}`, // 4px 8px
      margin: spacing[1], // 4px
    },
    form: {
      fieldGap: spacing[4], // 16px - between form fields
      labelGap: spacing[2], // 8px - between label and input
      groupGap: spacing[6], // 24px - between form groups
    },
  },

  // Typography spacing
  typography: {
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },
} as const;

// CSS Custom Property names
export const spacingVars = {
  component: {
    xs: '--spacing-component-xs',
    sm: '--spacing-component-sm',
    md: '--spacing-component-md',
    lg: '--spacing-component-lg',
    xl: '--spacing-component-xl',
  },
  layout: {
    section: '--spacing-layout-section',
    panel: '--spacing-layout-panel',
    card: '--spacing-layout-card',
    grid: '--spacing-layout-grid',
  },
  interactive: {
    buttonSm: '--spacing-button-sm',
    buttonMd: '--spacing-button-md',
    buttonLg: '--spacing-button-lg',
    toggle: '--spacing-toggle',
  },
} as const;

// Helper function to get spacing values
export const getSpacing = (token: keyof typeof spacing): string => {
  return spacing[token];
};

// Helper function to get semantic spacing
export const getSemanticSpacing = (
  category: string,
  subcategory?: string,
  variant?: string
): string => {
  const spacingGroup = (semanticSpacing as any)[category];

  if (!spacingGroup) {
    return spacing[4];
  } // fallback to 16px

  if (subcategory && variant) {
    return spacingGroup[subcategory]?.[variant] || spacing[4];
  }

  if (subcategory) {
    return spacingGroup[subcategory] || spacing[4];
  }

  return spacingGroup || spacing[4];
};

export type SpacingToken = keyof typeof spacing;
export type SemanticSpacingCategory = keyof typeof semanticSpacing;
