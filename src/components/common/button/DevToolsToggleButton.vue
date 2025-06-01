<!-- Developer Tools Toggle Button Component -->
<template>
  <BaseToggleButton
    variant="warning"
    :size="size"
    :is-active="isActive"
    :disabled="disabled"
    :active-text="'🔧 Dev Tools'"
    :inactive-text="'🔧 Dev Tools'"
    :active-tooltip="'Hide developer tools panel'"
    :inactive-tooltip="'Show developer tools panel'"
    :aria-label="'Toggle developer tools panel'"
    :class="computedClasses"
    @toggle="handleToggle"
  />
</template>

<script setup lang="ts">
import { computed, withDefaults, defineProps, defineEmits } from 'vue';
import BaseToggleButton from './BaseToggleButton.vue';
import { TOGGLE_SETTINGS } from '@/config/gameSettings';

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
}

interface Emits {
  (event: 'toggle'): void;
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

const props = withDefaults(defineProps<Props>(), {
  variant: 'warning',
  size: TOGGLE_SETTINGS.HEADER_TOGGLE_SIZE,
  isActive: false,
  disabled: false,
});

const emit = defineEmits<Emits>();

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const isActive = computed(() => props.isActive);

const computedClasses = computed(() => [
  'dev-tools-toggle-button',
  {
    'dev-tools-toggle-button--active': isActive.value,
    'dev-tools-toggle-button--disabled': props.disabled,
  },
]);

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleToggle = () => {
  if (!props.disabled) {
    emit('toggle');
  }
};
</script>

<style scoped>
/* DevToolsToggleButton - Domain-specific styling for dev tools toggle */

/* Preserve exact orange/yellow active state colors per user requirement */
.dev-tools-toggle-button.base-toggle-button--active,
:deep(.base-toggle-button.dev-tools-toggle-button--active) {
  background-color: var(--color-semantic-warning-100, #fef3c7) !important;
  color: var(--color-semantic-warning-800, #92400e) !important;
  border: 1px solid var(--color-semantic-warning-300, #fcd34d) !important;
}

.dev-tools-toggle-button.base-toggle-button--active:hover:not(.dev-tools-toggle-button--disabled),
:deep(
  .base-toggle-button.dev-tools-toggle-button--active:hover:not(.dev-tools-toggle-button--disabled)
) {
  background-color: var(--color-semantic-warning-200, #fde68a) !important;
}
</style>
