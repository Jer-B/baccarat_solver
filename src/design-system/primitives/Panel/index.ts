export { default as Panel } from './Panel.vue';

// Export types for external use
export interface PanelAction {
  actionId: string;
  label: string;
  title?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
  icon?: string;
}

export interface PanelSection {
  sectionId: string;
  title: string;
  actions: PanelAction[];
}

export interface PanelProps {
  as?: string;
  title: string;
  subtitle?: string;
  sections?: PanelSection[];
  isClosable?: boolean;
  class?: string;
  role?: string;
  ariaLabel?: string;
}

export interface PanelEmits {
  close: [];
  sectionAction: [sectionId: string, actionId: string, action: PanelAction];
}
