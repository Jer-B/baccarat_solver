export const colors = {
  // Primary palette - Professional purple/indigo
  primary: {
    50: '#f8f7ff',
    100: '#efecff',
    200: '#e1dbff',
    300: '#cdc0ff',
    400: '#b197fc',
    500: '#9775fa',
    600: '#845ef7',
    700: '#7048e8',
    800: '#5f3dc4',
    900: '#4c2a85',
    950: '#2e1a4d',
  },

  // Secondary palette - Success green
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Danger palette - Error red
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Warning palette - Warning orange
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Premium palette - Gold accent
  premium: {
    50: '#fffdf7',
    100: '#fffaeb',
    200: '#fef3c7',
    300: '#fde68a',
    400: '#fcd34d',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Neutral palette - Gray scale
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
} as const;

export type ColorScale = typeof colors.primary;
export type ColorName = keyof typeof colors;
export type ColorShade = keyof ColorScale;
