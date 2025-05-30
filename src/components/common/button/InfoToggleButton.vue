<template>
  <Toggle
    :section="section"
    :subsection="subsection"
    :variant="variant"
    :size="size"
    :disabled="isDisabled"
    :aria-label="computedAriaLabel"
    :class="tailwindClasses"
    @click="$emit('click', $event)"
    @toggle="$emit('toggle', $event)"
  >
    <template #default="{ text, isActive, isEnabled }">
      <span :class="{ 'font-semibold': isActive, 'opacity-75': !isEnabled }">
        {{ text }}
      </span>
    </template>
  </Toggle>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Toggle from '@/design-system/primitives/Toggle/Toggle.vue';
import type { ComponentSize, ComponentVariant } from '@/design-system/tokens';
import { useInfoPanelVisibility } from '../../../composables/useInfoPanelVisibility';

// Props interface
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

defineEmits<Emits>();

// Use the composable
const visibility = useInfoPanelVisibility();

// Computed properties
const isDisabled = computed(() => {
  if (props.disabled) {return true;}
  return !visibility.isToggleEnabled();
});

const computedAriaLabel = computed(() => {
  if (props.ariaLabel) {return props.ariaLabel;}
  const isVisible = visibility.isVisible(props.section, props.subsection);
  return `Toggle ${props.subsection} section: ${isVisible ? 'visible' : 'hidden'}`;
});

// Design system aware classes
const tailwindClasses = computed(() => {
  return [
    'info-toggle-button',
    'text-xs',
    'px-2',
    'py-1',
    'rounded',
    'transition-colors',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ].join(' ');
});
</script>

<style scoped>
/* InfoToggleButton using design system tokens */
:deep(.info-toggle-button) {
  /* Use design system color tokens */
  background-color: var(--color-neutral-200) !important;
  color: var(--color-neutral-800) !important;
  font-size: 0.75rem !important;
  padding: var(--spacing-1) var(--spacing-2) !important;
  border-radius: var(--spacing-1) !important;
  transition: background-color 0.15s ease-in-out !important;
}

:deep(.info-toggle-button:hover:not(.toggle-button--disabled)) {
  background-color: var(--color-neutral-300) !important;
}

:deep(.info-toggle-button:focus) {
  outline: 2px solid var(--color-primary-500) !important;
  outline-offset: 2px !important;
}

:deep(.info-toggle-button.toggle-button--disabled) {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}
</style>
