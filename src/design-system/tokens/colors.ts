/**
 * Design System - Color Tokens
 * Single source of truth for all color decisions
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral Grays
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic Colors
  semantic: {
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },

  // Domain-Specific Colors (Baccarat)
  baccarat: {
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#0f5132',
      600: '#0d4429',
      700: '#0a3621',
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#dc3545',
      600: '#b91c1c',
      700: '#991b1b',
    },
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#ffc107',
      600: '#d97706',
      700: '#b45309',
    },
  },
} as const;

// Type extraction for TypeScript safety
export type ColorScale = typeof colors.primary;
export type ColorToken = keyof typeof colors;
export type ColorShade = keyof ColorScale;

// Helper function to get color values
export const getColor = (token: string, shade: string | number = 500): string => {
  const [category, subcategory] = token.split('.');
  const colorGroup = (colors as any)[category];

  if (!colorGroup) {
    return '#000000';
  }

  if (subcategory) {
    const subGroup = colorGroup[subcategory];
    return subGroup?.[shade] || '#000000';
  }

  return colorGroup[shade] || '#000000';
};

// CSS Custom Property names
export const colorVars = {
  primary: {
    50: '--color-primary-50',
    500: '--color-primary-500',
    600: '--color-primary-600',
    700: '--color-primary-700',
  },
  neutral: {
    100: '--color-neutral-100',
    200: '--color-neutral-200',
    300: '--color-neutral-300',
    600: '--color-neutral-600',
    800: '--color-neutral-800',
  },
  semantic: {
    success: '--color-success',
    warning: '--color-warning',
    danger: '--color-danger',
    info: '--color-info',
  },
} as const;
