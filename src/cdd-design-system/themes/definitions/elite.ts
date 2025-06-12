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

  // Tab Menu (Harmonized Premium Fintech Approach)
  tabMenu: {
    background: 'linear-gradient(180deg, #2c2c2c, #333333)', // Harmonized gradient bridging header to content
    border: 'rgba(229, 228, 226, 0.12)', // Subtle platinum border from header accent
    borderTop: '1px solid rgba(229, 228, 226, 0.12)', // Top border connecting to header
    borderBottom: '1px solid rgba(229, 228, 226, 0.08)', // Softer bottom border
    shadow: '0 4px 12px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(229, 228, 226, 0.06)', // Enhanced professional depth

    inactive: {
      color: 'rgba(229, 228, 226, 0.7)', // Harmonized platinum text
      background: 'transparent',
      hoverColor: 'rgba(229, 228, 226, 0.9)',
      hoverBackground: 'rgba(229, 228, 226, 0.05)', // Subtle platinum accent on hover
      hoverShadow: '0 0 10px rgba(229, 228, 226, 0.08)',
    },

    active: {
      color: '#e5e4e2', // Full platinum color for active state
      background: 'rgba(229, 228, 226, 0.08)', // Subtle platinum background
      border: 'rgba(229, 228, 226, 0.2)', // Enhanced active border
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)', // Subtle shadow for depth
      textGlow: 'drop-shadow(0 0 2px rgba(229, 228, 226, 0.3))',
      shadow: '0 0 15px rgba(229, 228, 226, 0.1)', // Enhanced glow for active state
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

  // Health Indicators (Enhanced Visibility for Elite Theme)
  health: {
    healthyColor: '#4ade80', // Bright green for better visibility against dark background
    healthyGlow: 'drop-shadow(0 0 6px rgba(74, 222, 128, 0.8))',
    checkingColor: '#fbbf24', // Brighter yellow for elite theme
    checkingGlow: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))',
    errorColor: '#f87171', // Brighter red for elite theme
    errorGlow: 'drop-shadow(0 0 4px rgba(248, 113, 113, 0.6))',
    background: 'linear-gradient(135deg, #2c2c2c, #1a1a1a)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
  },

  // Body Background (for full-width seamless appearance)
  body: {
    background: '#1a1a1a', // Darkest color from header gradient for seamless flow
  },

  // Unified Elegant Background (Professional Over-Excellence Level)
  unified: {
    bodyBackground: 'linear-gradient(180deg, #2c2c2c, #333333)', // Subtle upward gradient - middle platinum to lighter platinum
    contentBackground: '#dbdddf', // Same gradient for seamless unity
  },
} as const;

export type EliteTheme = typeof eliteTheme;
