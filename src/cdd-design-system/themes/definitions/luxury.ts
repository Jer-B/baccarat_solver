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

  // Tab Menu (Harmonized Premium Fintech Approach)
  tabMenu: {
    background: 'linear-gradient(180deg, #1a1a2e, #1e2243)', // Harmonized gradient bridging header to content
    border: 'rgba(0, 212, 170, 0.15)', // Enhanced border from header accent
    borderTop: '1px solid rgba(0, 212, 170, 0.15)', // Top border connecting to header
    borderBottom: '1px solid rgba(0, 212, 170, 0.1)', // Softer bottom border
    shadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 212, 170, 0.08)', // Enhanced professional depth

    inactive: {
      color: 'rgba(255, 255, 255, 0.8)', // Harmonized with dark background
      background: 'transparent',
      hoverColor: 'rgba(255, 255, 255, 0.95)',
      hoverBackground: 'rgba(0, 212, 170, 0.05)', // Subtle brand accent on hover
      hoverShadow: '0 0 10px rgba(0, 212, 170, 0.1)',
    },

    active: {
      color: '#00d4aa', // Brand color for active state
      background: 'rgba(0, 212, 170, 0.08)', // Subtle brand background
      border: 'rgba(0, 212, 170, 0.2)', // Enhanced active border
      textShadow: '0 1px 2px rgba(0, 212, 170, 0.2)', // Brand text enhancement
      textGlow: 'drop-shadow(0 0 2px rgba(0, 212, 170, 0.3))',
      shadow: '0 0 15px rgba(0, 212, 170, 0.15)', // Enhanced glow for active state
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

  // Health Indicators
  health: {
    healthyColor: '#00d4aa',
    healthyGlow: 'drop-shadow(0 0 4px rgba(0, 212, 170, 0.6))',
    checkingColor: '#ffa500',
    checkingGlow: 'drop-shadow(0 0 4px rgba(255, 165, 0, 0.6))',
    errorColor: '#ff6b6b',
    errorGlow: 'drop-shadow(0 0 4px rgba(255, 107, 107, 0.6))',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
  },

  // Body Background (for full-width seamless appearance)
  body: {
    background: '#0f0f23', // Darkest color from header gradient for seamless flow
  },

  // Unified Elegant Background (Professional Over-Excellence Level)
  unified: {
    bodyBackground: 'linear-gradient(180deg, #16213e, #1a1a2e)', // Keep harmonized dark gradient for seamless header flow
    contentBackground: '#dbdddf', // LIGHT content for trust, readability, and customer confidence
  },
} as const;

export type LuxuryTheme = typeof luxuryTheme;
