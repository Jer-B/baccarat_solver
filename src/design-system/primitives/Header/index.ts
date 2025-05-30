export { default as Header } from './Header.vue';

// Export types for external use
export interface HeaderAction {
  id: string;
  label: string;
  activeLabel?: string;
  title?: string;
  activeTitle?: string;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger';
  isActive?: boolean;
}

export interface HeaderProps {
  as?: string;
  title: string;
  actions?: HeaderAction[];
  class?: string;
  role?: string;
  ariaLabel?: string;
}

export interface HeaderEmits {
  actionClick: [actionId: string, action: HeaderAction];
}
