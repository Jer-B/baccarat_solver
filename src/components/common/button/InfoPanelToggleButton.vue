<!-- Global Info Panels Toggle Button Component -->
<template>
  <BaseToggleButton
    variant="secondary"
    :size="size"
    :is-active="isActive"
    :disabled="disabled"
    :active-text="'👁️ Hide Infos'"
    :inactive-text="'👁️‍🗨️ Show Infos'"
    :active-tooltip="computedTooltip"
    :inactive-tooltip="computedTooltip"
    :aria-label="'Toggle global info panels visibility'"
    :class="computedClasses"
    @toggle="handleToggle"
  />
</template>

<script setup lang="ts">
import { computed, withDefaults, defineProps, defineEmits } from 'vue';
import { useVisibilityStore } from '@/stores/visibilityStore';
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
  disabled?: boolean;
}

interface Emits {
  (event: 'toggle'): void;
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: TOGGLE_SETTINGS.HEADER_TOGGLE_SIZE,
  disabled: false,
});

const emit = defineEmits<Emits>();

// =============================================================================
// STORE INTEGRATION
// =============================================================================

const visibilityStore = useVisibilityStore();

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const isActive = computed(() => visibilityStore.globalToggleMode);

const computedTooltip = computed(() => {
  return isActive.value ? 'Hide all info panels' : 'Show all info panels';
});

const computedClasses = computed(() => [
  'info-panel-toggle-button',
  {
    'info-panel-toggle-button--active': isActive.value,
    'info-panel-toggle-button--disabled': props.disabled,
  },
]);

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleToggle = () => {
  if (!props.disabled) {
    visibilityStore.toggleGlobalVisibility();
    emit('toggle');
  }
};
</script>

<style scoped>
/* InfoPanelToggleButton - Domain-specific styling for info panel toggle */

/* Preserve exact green active state colors per user requirement */
.info-panel-toggle-button.base-toggle-button--active,
:deep(.base-toggle-button.info-panel-toggle-button--active) {
  background-color: var(--color-semantic-success-100, #d1fae5) !important;
  color: var(--color-semantic-success-700, #047857) !important;
  border: 1px solid var(--color-semantic-success-500, #10b981) !important;
}

.info-panel-toggle-button.base-toggle-button--active:hover:not(.info-panel-toggle-button--disabled),
:deep(
  .base-toggle-button.info-panel-toggle-button--active:hover:not(
      .info-panel-toggle-button--disabled
    )
) {
  background-color: var(--color-semantic-success-50, #ecfdf5) !important;
}
</style>
