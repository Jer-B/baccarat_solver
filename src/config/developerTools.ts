import type { PanelSection } from '@/design-system/primitives/Panel';

/**
 * Developer Tools Panel Configuration
 * Centralized configuration for all developer tools sections, actions, and styling
 */

// UI Styling Configuration - PRESERVE EXACT CURRENT APPEARANCE
export const DEVELOPER_TOOLS_STYLING = {
  // Panel container styling - EXACT preservation
  BACKGROUND_GRADIENT: 'linear-gradient(135deg, #374151, #4b5563)',
  BORDER_TOP: '2px solid #6b7280',
  TEXT_COLOR: 'white',

  // Panel title and subtitle styling
  TITLE_COLOR: 'white',
  SUBTITLE_COLOR: '#d1d5db',

  // Section title styling
  SECTION_TITLE_COLOR: '#e5e7eb',

  // Button variants with EXACT color preservation
  BUTTON_VARIANTS: {
    PRIMARY: {
      BACKGROUND: '#3b82f6',
      BORDER: '#2563eb',
      HOVER_BACKGROUND: '#2563eb',
      HOVER_BORDER: '#1d4ed8',
    },
    SECONDARY: {
      BACKGROUND: '#64748b',
      BORDER: '#475569',
      HOVER_BACKGROUND: '#475569',
      HOVER_BORDER: '#334155',
    },
    SUCCESS: {
      BACKGROUND: '#10b981',
      BORDER: '#059669',
      HOVER_BACKGROUND: '#059669',
      HOVER_BORDER: '#047857',
    },
    WARNING: {
      BACKGROUND: '#f59e0b',
      BORDER: '#d97706',
      HOVER_BACKGROUND: '#d97706',
      HOVER_BORDER: '#b45309',
    },
    DANGER: {
      BACKGROUND: '#ef4444',
      BORDER: '#dc2626',
      HOVER_BACKGROUND: '#dc2626',
      HOVER_BORDER: '#b91c1c',
    },
    INFO: {
      BACKGROUND: '#06b6d4',
      BORDER: '#0891b2',
      HOVER_BACKGROUND: '#0891b2',
      HOVER_BORDER: '#0e7490',
    },
  },
} as const;

// Action Configuration Interface
interface ActionConfig {
  actionId: string;
  label: string;
  title: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  icon: string;
  requiresPermission?: boolean;
}

// Section Configuration Interface
interface SectionConfig {
  sectionId: string;
  title: string;
  actions: ActionConfig[];
}

// Developer Tools Sections Configuration
export const DEVELOPER_TOOLS_SECTIONS: SectionConfig[] = [
  {
    sectionId: 'shoeManagement',
    title: 'Shoe Management',
    actions: [
      {
        actionId: 'initializeShoe',
        label: 'New Shoe',
        title: 'Initialize a fresh shoe with all cards reset',
        variant: 'primary',
        icon: '🃏',
        requiresPermission: false,
      },
    ],
  },
  {
    sectionId: 'sampleData',
    title: 'Sample Data',
    actions: [
      {
        actionId: 'addSampleHands',
        label: 'Sample Hands',
        title: 'Add predefined sample hands for testing',
        variant: 'info',
        icon: '📊',
        requiresPermission: true,
      },
      {
        actionId: 'addRandomHand',
        label: 'Random Hand',
        title: 'Generate and add a random hand',
        variant: 'primary',
        icon: '🎲',
        requiresPermission: true,
      },
    ],
  },
  {
    sectionId: 'demoScenarios',
    title: 'Demo Scenarios',
    actions: [
      {
        actionId: 'setupEdgeDemo',
        label: 'Edge Demo',
        title: 'Simulate high-card rich shoe for edge sorting advantage',
        variant: 'warning',
        icon: '🃏',
        requiresPermission: true,
      },
      {
        actionId: 'setupPairDemo',
        label: 'Pair Demo',
        title: 'Simulate favorable conditions for pair betting',
        variant: 'danger',
        icon: '👥',
        requiresPermission: true,
      },
    ],
  },
];

// Configuration helper functions
export const getDeveloperToolsSections = (canPerformActions: boolean): PanelSection[] => {
  return DEVELOPER_TOOLS_SECTIONS.map(section => ({
    sectionId: section.sectionId,
    title: section.title,
    actions: section.actions.map(action => ({
      actionId: action.actionId,
      label: action.label,
      title: action.title,
      variant: action.variant,
      icon: action.icon,
      disabled: action.requiresPermission ? !canPerformActions : false,
    })),
  }));
};

// Export types for TypeScript integration
export type { ActionConfig, SectionConfig };
