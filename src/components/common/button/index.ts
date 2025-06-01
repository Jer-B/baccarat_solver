// Button Components Exports

// =============================================================================
// CORE BUTTON COMPONENTS
// =============================================================================

export { default as BaseToggleButton } from './BaseToggleButton.vue';
export { default as InfoPanelToggleButton } from './InfoPanelToggleButton.vue';
export { default as DevToolsToggleButton } from './DevToolsToggleButton.vue';
export { default as InfoSectionToggleButton } from './InfoSectionToggleButton.vue';

// =============================================================================
// TYPESCRIPT INTERFACES
// =============================================================================

// Component Size Type
export type ComponentSize = 'sm' | 'md' | 'lg';

// Component Variant Type
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

// Base Toggle Button Props Interface
export interface BaseToggleButtonProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  isActive?: boolean;
  disabled?: boolean;
  activeText?: string;
  inactiveText?: string;
  activeTooltip?: string;
  inactiveTooltip?: string;
  ariaLabel?: string;
}

// Info Panel Toggle Button Props Interface
export interface InfoPanelToggleButtonProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
}

// Dev Tools Toggle Button Props Interface
export interface DevToolsToggleButtonProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  isActive?: boolean;
  disabled?: boolean;
}

// Info Section Toggle Button Props Interface
export interface InfoSectionToggleButtonProps {
  section: string;
  subsection: string;
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  ariaLabel?: string;
}

// Button Events Interface
export interface ButtonEmits {
  (event: 'click'): void;
  (event: 'toggle', value?: boolean): void;
}

// =============================================================================
// COMPONENT REGISTRY
// =============================================================================

// For dynamic component usage
export const BUTTON_COMPONENTS = {
  BaseToggleButton: 'BaseToggleButton',
  InfoPanelToggleButton: 'InfoPanelToggleButton',
  DevToolsToggleButton: 'DevToolsToggleButton',
  InfoSectionToggleButton: 'InfoSectionToggleButton',
} as const;

export type ButtonComponentType = keyof typeof BUTTON_COMPONENTS;
