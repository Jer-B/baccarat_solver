export { default as Toggle } from './Toggle.vue';

// Export types for external use
export interface ToggleProps {
  modelValue?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  class?: string;
}

export interface ToggleEmits {
  'update:modelValue': [value: boolean];
  click: [event: MouseEvent];
}
