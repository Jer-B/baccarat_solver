<template>
  <button
    :class="computedClasses"
    :disabled="disabled"
    :title="computedTooltip"
    :aria-pressed="isActive"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <slot :isActive="isActive" :buttonText="buttonText">
      {{ buttonText }}
    </slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

type ComponentSize = 'sm' | 'md' | 'lg';
type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface Props {
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

interface Emits {
  (event: 'click'): void;
  (event: 'toggle', value: boolean): void;
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  isActive: false,
  disabled: false,
  activeText: 'Active',
  inactiveText: 'Inactive',
  activeTooltip: '',
  inactiveTooltip: '',
  ariaLabel: '',
});

const emit = defineEmits<Emits>();

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const buttonText = computed(() => (props.isActive ? props.activeText : props.inactiveText));

const computedTooltip = computed(() =>
  props.isActive ? props.activeTooltip : props.inactiveTooltip
);

const computedClasses = computed(() => [
  'base-toggle-button',
  `base-toggle-button--${props.variant}`,
  `base-toggle-button--${props.size}`,
  {
    'base-toggle-button--active': props.isActive,
    'base-toggle-button--disabled': props.disabled,
  },
]);

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
    emit('toggle', !props.isActive);
  }
};
</script>

<style scoped>
/* BaseToggleButton - Styled wrapper providing design token integration */
.base-toggle-button {
  /* Base button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--spacing-1, 0.25rem);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  /* Default neutral styling */
  background-color: var(--color-neutral-200, #e5e7eb);
  color: var(--color-neutral-800, #1f2937);
}

.base-toggle-button:hover:not(.base-toggle-button--disabled) {
  background-color: var(--color-neutral-300, #d1d5db);
}

/* Remove focus outlines as per user requirement */
.base-toggle-button:focus {
  outline: none;
}

.base-toggle-button:focus-visible {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: 2px;
}

/* Size variants */
.base-toggle-button--sm {
  padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
  font-size: 0.75rem;
}

.base-toggle-button--md {
  padding: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
  font-size: 0.875rem;
}

.base-toggle-button--lg {
  padding: var(--spacing-3, 0.75rem) var(--spacing-6, 1.5rem);
  font-size: 1rem;
}

/* Variant styles */
.base-toggle-button--secondary {
  background-color: var(--color-neutral-200, #e5e7eb);
  color: var(--color-neutral-800, #1f2937);
}

.base-toggle-button--secondary:hover:not(.base-toggle-button--disabled) {
  background-color: var(--color-neutral-300, #d1d5db);
}

.base-toggle-button--warning {
  background-color: var(--color-semantic-warning-500, #f59e0b);
  color: white;
}

.base-toggle-button--warning:hover:not(.base-toggle-button--disabled) {
  background-color: var(--color-semantic-warning-600, #d97706);
}

/* Disabled state */
.base-toggle-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
