// Platinum Elite Theme
export const eliteTheme = {
  name: 'Platinum Elite',
  description: 'Ultimate sophistication',
  icon: '💎',

  // Header
  header: {
    background: 'linear-gradient(135deg, #2c2c2c, #1a1a1a, #0d0d0d)',
    border: 'rgba(229, 228, 226, 0.12)',
    shadow:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 30px rgba(229, 228, 226, 0.04)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(229, 228, 226, 0.15)',
    textGlow: 'drop-shadow(0 0 2px rgba(229, 228, 226, 0.25))',
  },

  // Toggle/Track
  toggle: {
    trackBackground: 'linear-gradient(135deg, #2c2c2c, #1a1a1a)',
    trackBorder: 'rgba(229, 228, 226, 0.2)',
    trackBorderHover: 'rgba(248, 248, 255, 0.3)',
    trackShadow: '0 0 20px rgba(229, 228, 226, 0.05)',
    trackShadowHover: '0 0 30px rgba(229, 228, 226, 0.1)',
    sliderBackground: 'linear-gradient(135deg, #e5e4e2, #d3d3d3)',
    sliderShadow: '0 4px 20px rgba(229, 228, 226, 0.25), 0 0 30px rgba(248, 248, 255, 0.15)',
    sliderTextColor: '#2c2c2c',
  },

  // Colors
  colors: {
    primary: '#e5e4e2',
    primaryHover: '#f8f8ff',
    textPrimary: '#e5e4e2',
    textSecondary: 'rgba(229, 228, 226, 0.6)',
  },

  // Tab Menu - CLEAR CONTRAST LIKE THEME TOGGLE
  tabMenu: {
    background: '#ffffff', // Clean white background
    border: 'rgba(0, 0, 0, 0.08)',

    // INACTIVE = Light Gray (clearly secondary and faded)
    inactive: {
      color: '#a1a1aa', // Light gray - faded appearance
      background: 'transparent',
      hoverColor: '#71717a', // Medium gray on hover
      hoverBackground: 'rgba(0, 0, 0, 0.02)',
      hoverShadow: 'none',
    },

    // ACTIVE = Dark/Prominent (stands out clearly)
    active: {
      color: '#000000', // Pure black text - bold and prominent
      background: '#ffffff', // Clean white background
      border: '#000000', // Black border to match text
      textShadow: 'none', // No shadow needed for dark text
      textGlow: '0 0 8px rgba(229, 228, 226, 0.12)', // Subtle platinum glow
      shadow: '0 2px 8px rgba(0, 0, 0, 0.15)', // Subtle dark shadow
    },
  },

  // Switch Button
  switchButton: {
    background: 'linear-gradient(135deg, #2c2c2c, #1a1a1a)',
    color: '#e5e4e2',
    border: 'rgba(229, 228, 226, 0.2)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
    shadow: '0 0 15px rgba(229, 228, 226, 0.05)',
    hoverBackground: 'linear-gradient(135deg, #333333, #1f1f1f)',
    hoverColor: '#f8f8ff',
    hoverBorder: 'rgba(248, 248, 255, 0.3)',
    hoverShadow: '0 4px 20px rgba(229, 228, 226, 0.15), 0 0 30px rgba(248, 248, 255, 0.1)',
  },
} as const;

export type EliteTheme = typeof eliteTheme;
