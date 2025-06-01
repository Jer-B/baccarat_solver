<!-- Info Section Toggle Button - Small toggles for info areas -->
<template>
  <BaseToggleButton
    variant="secondary"
    :size="size"
    :is-active="isVisible"
    :disabled="isDisabled"
    :active-text="activeText"
    :inactive-text="inactiveText"
    :active-tooltip="activeTooltip"
    :inactive-tooltip="inactiveTooltip"
    :aria-label="computedAriaLabel"
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

// Use the same types as BaseToggleButton to ensure compatibility
type ComponentSize = 'sm' | 'md' | 'lg';
type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface Props {
  section: string;
  subsection: string;
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  ariaLabel?: string;
}

interface Emits {
  (event: 'click', payload: MouseEvent): void;
  (event: 'toggle', payload: boolean): void;
  (event: 'error', payload: { section: string; subsection: string; error: unknown }): void;
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary' as ComponentVariant,
  size: TOGGLE_SETTINGS.INFO_SECTION_TOGGLE_SIZE, // Use small size for info section toggles
  disabled: false,
  ariaLabel: undefined,
});

const emit = defineEmits<Emits>();

// =============================================================================
// STORE INTEGRATION
// =============================================================================

const visibilityStore = useVisibilityStore();

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const isVisible = computed(() => visibilityStore.isVisible(props.section, props.subsection));

const isDisabled = computed(() => {
  if (props.disabled) {
    return true;
  }
  return !visibilityStore.isToggleEnabled();
});

const activeText = computed(
  () => `${TOGGLE_SETTINGS.ICONS.INFO_ACTIVE} ${TOGGLE_SETTINGS.TEXT.HIDE}`
);
const inactiveText = computed(
  () => `${TOGGLE_SETTINGS.ICONS.INFO_INACTIVE} ${TOGGLE_SETTINGS.TEXT.SHOW}`
);

const activeTooltip = computed(() => `${TOGGLE_SETTINGS.TEXT.HIDE} ${props.subsection} section`);
const inactiveTooltip = computed(() => `${TOGGLE_SETTINGS.TEXT.SHOW} ${props.subsection} section`);

const computedAriaLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel;
  }
  const state = isVisible.value ? TOGGLE_SETTINGS.TEXT.VISIBLE : TOGGLE_SETTINGS.TEXT.HIDDEN;
  return `${TOGGLE_SETTINGS.TEXT.TOGGLE} ${props.subsection} section: ${state}`;
});

const computedClasses = computed(() => [
  'info-section-toggle-button',
  'text-xs', // Preserve exact styling from InfoToggleButton
  {
    'info-section-toggle-button--active': isVisible.value,
    'info-section-toggle-button--disabled': isDisabled.value,
  },
]);

// =============================================================================
// EVENT HANDLERS WITH ERROR BOUNDARIES
// =============================================================================

const handleToggle = async () => {
  if (isDisabled.value) {
    console.warn('[user-interface][warning] Toggle attempt on disabled button', {
      section: props.section,
      subsection: props.subsection,
      disabled: props.disabled,
      globalToggleEnabled: visibilityStore.isToggleEnabled(),
    });
    return;
  }

  try {
    // Store current state for rollback if needed
    const previousState = isVisible.value;

    console.log('[user-interface][user-action] Toggling section visibility', {
      section: props.section,
      subsection: props.subsection,
      currentState: previousState,
      targetState: !previousState,
    });

    // Attempt store operation with error boundary
    visibilityStore.toggleSectionVisibility(props.section, props.subsection);

    // Verify state change occurred
    const newState = visibilityStore.isVisible(props.section, props.subsection);
    const expectedState = !previousState;

    if (newState !== expectedState) {
      console.warn('[user-interface][warning] State change verification failed', {
        section: props.section,
        subsection: props.subsection,
        expectedState,
        actualState: newState,
        previousState,
      });
    }

    // Emit successful toggle event
    emit('toggle', newState);

    console.log('[user-interface][completion] Section visibility toggled successfully', {
      section: props.section,
      subsection: props.subsection,
      newState,
    });
  } catch (error) {
    // Error boundary - handle store operation failures gracefully
    console.error('[user-interface][error] Failed to toggle section visibility', {
      section: props.section,
      subsection: props.subsection,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

    // Emit error event for parent handling
    emit('error', { section: props.section, subsection: props.subsection, error });

    // Graceful degradation - button remains functional, just logs error
    // UI doesn't break, user gets feedback through console logs
  }
};
</script>

<style scoped>
/* InfoSectionToggleButton - Professional CSS without !important overrides */

/* CSS Custom Properties for dynamic styling */
.info-section-toggle-button {
  --info-toggle-font-size: 0.75rem;
  --info-toggle-padding-x: var(--spacing-2);
  --info-toggle-padding-y: var(--spacing-1);
  --info-toggle-border-radius: var(--spacing-1);
  --info-toggle-transition: background-color 0.15s ease-in-out;
  --info-toggle-bg-default: var(--color-neutral-200);
  --info-toggle-bg-hover: var(--color-neutral-300);
  --info-toggle-color-default: var(--color-neutral-800);
  --info-toggle-opacity-disabled: 0.5;
}

/* High specificity selector to override BaseToggleButton without !important */
.info-section-toggle-button:deep(.base-toggle-button) {
  font-size: var(--info-toggle-font-size);
  padding: var(--info-toggle-padding-y) var(--info-toggle-padding-x);
  border-radius: var(--info-toggle-border-radius);
  transition: var(--info-toggle-transition);
  background-color: var(--info-toggle-bg-default);
  color: var(--info-toggle-color-default);
  border: none;
}

/* Hover state with proper specificity */
.info-section-toggle-button:not(.info-section-toggle-button--disabled):deep(
    .base-toggle-button:hover
  ) {
  background-color: var(--info-toggle-bg-hover);
}

/* Focus state for accessibility */
.info-section-toggle-button:deep(.base-toggle-button:focus) {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Disabled state */
.info-section-toggle-button--disabled:deep(.base-toggle-button) {
  opacity: var(--info-toggle-opacity-disabled);
  cursor: not-allowed;
}

/* Ensure consistent sizing across different variants */
.info-section-toggle-button:deep(.base-toggle-button.size-sm),
.info-section-toggle-button:deep(.base-toggle-button.size-md),
.info-section-toggle-button:deep(.base-toggle-button.size-lg) {
  font-size: var(--info-toggle-font-size);
  padding: var(--info-toggle-padding-y) var(--info-toggle-padding-x);
}

/* Preserve exact visual appearance - no active state color changes */
/* Small toggles maintain neutral colors regardless of visibility state */
.info-section-toggle-button--active:deep(.base-toggle-button) {
  /* Intentionally no special styling - preserves current behavior */
  background-color: var(--info-toggle-bg-default);
  color: var(--info-toggle-color-default);
}
</style>
