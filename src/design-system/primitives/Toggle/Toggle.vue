<template>
  <button
    :class="computedClasses"
    :disabled="disabled || !isEnabled"
    :title="computedTooltip"
    :aria-pressed="isActive"
    :aria-label="computedAriaLabel"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot :isActive="isActive" :isEnabled="isEnabled" :text="buttonText">
      {{ buttonText }}
    </slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVisibilityStore } from '@/stores/visibilityStore';
import type { ComponentSize, ComponentVariant } from '@/design-system/tokens';

// Props interface with TypeScript
interface Props {
  section: string;
  subsection: string;
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  ariaLabel?: string;
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
  disabled: false,
  ariaLabel: undefined,
});

// Emits interface
interface Emits {
  click: [event: MouseEvent];
  toggle: [isVisible: boolean];
}

const emit = defineEmits<Emits>();

// Store integration
const visibilityStore = useVisibilityStore();

// Computed properties for headless logic
const isVisible = computed(() => visibilityStore.isVisible(props.section, props.subsection));

const isEnabled = computed(() => visibilityStore.isToggleEnabled());

const isActive = computed(() => isVisible.value && isEnabled.value);

const buttonText = computed(() =>
  visibilityStore.getToggleButtonText(props.section, props.subsection)
);

const computedTooltip = computed(() => {
  if (!isEnabled.value) {
    return 'Enable info panels to toggle individual sections';
  }
  return isVisible.value ? 'Hide content' : 'Show content';
});

// Style computation (headless - can be overridden)
const computedClasses = computed(() => {
  const baseClasses = [
    'toggle-button',
    `toggle-button--${props.variant}`,
    `toggle-button--${props.size}`,
  ];

  if (isActive.value) {
    baseClasses.push('toggle-button--active');
  }

  if (!isEnabled.value || props.disabled) {
    baseClasses.push('toggle-button--disabled');
  }

  return baseClasses.join(' ');
});

// Event handlers
const handleClick = (event: MouseEvent) => {
  if (props.disabled || !isEnabled.value) {
    return;
  }

  visibilityStore.toggleSectionVisibility(props.section, props.subsection);

  emit('click', event);
  emit('toggle', !isVisible.value);
};

// Computed aria-label with fallback
const computedAriaLabel = computed(() => {
  return props.ariaLabel || `Toggle ${props.section} ${props.subsection} visibility`;
});
</script>

<style scoped>
/* Base toggle button styles using design tokens */
.toggle-button {
  /* Base styles - can be overridden by CSS custom properties */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--spacing-1, 0.25rem);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  /* Default variant */
  background-color: var(--color-neutral-200, #e5e7eb);
  color: var(--color-neutral-800, #1f2937);
}

.toggle-button:hover:not(.toggle-button--disabled) {
  background-color: var(--color-neutral-300, #d1d5db);
}

.toggle-button:focus {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: 2px;
}

/* Size variants */
.toggle-button--xs {
  padding: var(--spacing-0.5, 0.125rem) var(--spacing-1, 0.25rem);
  font-size: 0.75rem;
}

.toggle-button--sm {
  padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
  font-size: 0.75rem;
}

.toggle-button--md {
  padding: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
  font-size: 0.875rem;
}

.toggle-button--lg {
  padding: var(--spacing-3, 0.75rem) var(--spacing-6, 1.5rem);
  font-size: 1rem;
}

/* Variant styles */
.toggle-button--primary {
  background-color: var(--color-primary-500, #3b82f6);
  color: white;
}

.toggle-button--primary:hover:not(.toggle-button--disabled) {
  background-color: var(--color-primary-600, #2563eb);
}

.toggle-button--secondary {
  background-color: var(--color-neutral-600, #4b5563);
  color: white;
}

.toggle-button--secondary:hover:not(.toggle-button--disabled) {
  background-color: var(--color-neutral-700, #374151);
}

.toggle-button--success {
  background-color: var(--color-semantic-success-500, #10b981);
  color: white;
}

.toggle-button--success:hover:not(.toggle-button--disabled) {
  background-color: var(--color-semantic-success-600, #059669);
}

.toggle-button--ghost {
  background-color: transparent;
  color: var(--color-neutral-600, #4b5563);
  border: 1px solid var(--color-neutral-300, #d1d5db);
}

.toggle-button--ghost:hover:not(.toggle-button--disabled) {
  background-color: var(--color-neutral-50, #f9fafb);
}

/* State styles */
.toggle-button--active {
  background-color: var(--color-primary-100, #dbeafe);
  color: var(--color-primary-800, #1e40af);
  border: 1px solid var(--color-primary-300, #93c5fd);
}

.toggle-button--active:hover:not(.toggle-button--disabled) {
  background-color: var(--color-primary-200, #bfdbfe);
}

.toggle-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
