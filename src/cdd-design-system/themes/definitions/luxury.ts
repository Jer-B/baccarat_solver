// Modern Luxury Theme
export const luxuryTheme = {
  name: 'Modern Luxury',
  description: 'High-tech midnight navy with cyan',
  icon: '🌙',

  // Header
  header: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f0f23)',
    border: 'rgba(0, 212, 170, 0.15)',
    shadow:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 20px rgba(0, 212, 170, 0.05)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 212, 170, 0.2)',
    textGlow: 'drop-shadow(0 0 2px rgba(0, 212, 170, 0.3))',
  },

  // Toggle/Track
  toggle: {
    trackBackground: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    trackBorder: 'rgba(0, 212, 170, 0.25)',
    trackBorderHover: 'rgba(0, 255, 247, 0.4)',
    trackShadow: '0 0 15px rgba(0, 212, 170, 0.1)',
    trackShadowHover: '0 0 25px rgba(0, 212, 170, 0.15)',
    sliderBackground: 'linear-gradient(135deg, #00d4aa, #00b894)',
    sliderShadow: '0 4px 12px rgba(0, 212, 170, 0.3), 0 0 20px rgba(0, 212, 170, 0.2)',
    sliderTextColor: '#1a1a2e',
  },

  // Colors
  colors: {
    primary: '#00d4aa',
    primaryHover: '#00fff7',
    textPrimary: '#00d4aa',
    textSecondary: 'rgba(0, 212, 170, 0.7)',
  },

  // Tab Menu
  tabMenu: {
    background: 'linear-gradient(to bottom, #ffffff, #fefffe)',
    border: 'rgba(0, 212, 170, 0.12)',

    inactive: {
      color: '#6b7280',
      background: 'linear-gradient(to bottom, transparent, rgba(0, 212, 170, 0.02))',
      hoverColor: '#16213e',
      hoverBackground:
        'linear-gradient(to bottom, rgba(0, 212, 170, 0.06), rgba(0, 212, 170, 0.12))',
      hoverShadow: '0 0 10px rgba(0, 212, 170, 0.1)',
    },

    active: {
      color: '#00d4aa',
      background: 'linear-gradient(to bottom, rgba(0, 212, 170, 0.08), rgba(0, 212, 170, 0.15))',
      border: '#00d4aa',
      textShadow: '0 1px 2px rgba(0, 212, 170, 0.3)',
      textGlow: 'none',
      shadow: '0 0 15px rgba(0, 212, 170, 0.15)',
    },
  },

  // Switch Button
  switchButton: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    color: '#00d4aa',
    border: 'rgba(0, 212, 170, 0.25)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
    shadow: '0 0 10px rgba(0, 212, 170, 0.1)',
    hoverBackground: 'linear-gradient(135deg, #1e1e35, #1a253f)',
    hoverColor: '#00fff7',
    hoverBorder: 'rgba(0, 255, 247, 0.4)',
    hoverShadow: '0 4px 12px rgba(0, 212, 170, 0.2), 0 0 20px rgba(0, 255, 247, 0.15)',
  },
} as const;

export type LuxuryTheme = typeof luxuryTheme;
