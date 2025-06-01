<!-- Headless Burn Settings Primitive -->
<template>
  <component :is="element" :class="computedClass" :role="role" :aria-label="ariaLabel">
    <slot
      :burnState="burnState"
      :constraints="constraints"
      :actions="actions"
      :validation="validation"
      :config="config"
      :statusMessage="statusMessage"
      :onUpdateAutoBurnEnabled="handleUpdateAutoBurnEnabled"
      :onUpdateAutoBurnCount="handleUpdateAutoBurnCount"
      :onUpdateManualBurnCount="handleUpdateManualBurnCount"
      :onManualBurn="handleManualBurn"
      :onAutoBurn="handleAutoBurn"
    />
  </component>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults, defineProps, defineEmits } from 'vue';
import { BURN_SETTINGS } from '@/config/sessionControlSettings';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface Props {
  element?: string;
  class?: string;
  role?: string;
  ariaLabel?: string;
  initialAutoBurnEnabled?: boolean;
  initialAutoBurnCount?: number;
  initialManualBurnCount?: number;
  canPerformActions?: boolean;
  totalCardsRemaining?: number;
  manualBurnExecutor?: (count: number) => Promise<void>;
  autoBurnExecutor?: (count: number) => Promise<void>;
}

interface Emits {
  'update:autoBurnEnabled': [enabled: boolean];
  'update:autoBurnCount': [count: number];
  'update:manualBurnCount': [count: number];
  'manual-burn': [burnCount: number, cardsRemaining: number];
  'auto-burn': [burnCount: number, cardsRemaining: number];
  'burn-change': [burnState: BurnState];
  'validation-error': [field: string, error: string];
}

export interface BurnState {
  autoBurnEnabled: boolean;
  autoBurnCount: number;
  manualBurnCount: number;
  isValid: boolean;
  isDirty: boolean;
  canAutoBurn: boolean;
  canManualBurn: boolean;
}

export interface BurnConstraints {
  minBurnCount: number;
  maxBurnCount: number;
  minManualBurn: number;
}

export interface BurnActions {
  canPerformActions: boolean;
  canModifySettings: boolean;
  isExecutingManualBurn: boolean;
  isExecutingAutoBurn: boolean;
}

export interface BurnValidation {
  autoBurnCountError: string | null;
  manualBurnCountError: string | null;
  hasErrors: boolean;
}

export interface BurnConfig {
  labels: typeof BURN_SETTINGS.LABELS;
  defaults: typeof BURN_SETTINGS.DEFAULTS;
  constraints: typeof BURN_SETTINGS.CONSTRAINTS;
  statusMessages: typeof BURN_SETTINGS.STATUS_MESSAGES;
  infoPanel: typeof BURN_SETTINGS.INFO_PANEL;
  styling: typeof BURN_SETTINGS.STYLING;
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

const props = withDefaults(defineProps<Props>(), {
  element: 'div',
  class: '',
  role: 'region',
  ariaLabel: 'Burn Settings',
  initialAutoBurnEnabled: BURN_SETTINGS.DEFAULTS.AUTO_BURN_ENABLED,
  initialAutoBurnCount: BURN_SETTINGS.DEFAULTS.AUTO_BURN_COUNT,
  initialManualBurnCount: BURN_SETTINGS.DEFAULTS.MANUAL_BURN_COUNT,
  canPerformActions: true,
  totalCardsRemaining: 416, // 8 decks default
  manualBurnExecutor: undefined,
  autoBurnExecutor: undefined,
});

const emit = defineEmits<Emits>();

// =============================================================================
// REACTIVE STATE
// =============================================================================

const autoBurnEnabled = ref(props.initialAutoBurnEnabled);
const autoBurnCount = ref(props.initialAutoBurnCount);
const manualBurnCount = ref(props.initialManualBurnCount);
const isDirty = ref(false);
const isExecutingManualBurn = ref(false);
const isExecutingAutoBurn = ref(false);
const autoBurnCountError = ref<string | null>(null);
const manualBurnCountError = ref<string | null>(null);

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const computedClass = computed(() => props.class);

const burnState = computed(
  (): BurnState => ({
    autoBurnEnabled: autoBurnEnabled.value,
    autoBurnCount: autoBurnCount.value,
    manualBurnCount: manualBurnCount.value,
    isValid: !autoBurnCountError.value && !manualBurnCountError.value,
    isDirty: isDirty.value,
    canAutoBurn:
      autoBurnEnabled.value &&
      autoBurnCount.value > 0 &&
      autoBurnCount.value <= props.totalCardsRemaining,
    canManualBurn:
      props.canPerformActions &&
      manualBurnCount.value > 0 &&
      manualBurnCount.value <= props.totalCardsRemaining,
  })
);

const constraints = computed(
  (): BurnConstraints => ({
    minBurnCount: BURN_SETTINGS.CONSTRAINTS.MIN_BURN_COUNT,
    maxBurnCount: BURN_SETTINGS.CONSTRAINTS.MAX_BURN_COUNT,
    minManualBurn: BURN_SETTINGS.CONSTRAINTS.MIN_MANUAL_BURN,
  })
);

const actions = computed(
  (): BurnActions => ({
    canPerformActions: props.canPerformActions,
    canModifySettings: true, // Always allow modifying settings
    isExecutingManualBurn: isExecutingManualBurn.value,
    isExecutingAutoBurn: isExecutingAutoBurn.value,
  })
);

const validation = computed(
  (): BurnValidation => ({
    autoBurnCountError: autoBurnCountError.value,
    manualBurnCountError: manualBurnCountError.value,
    hasErrors: Boolean(autoBurnCountError.value) || Boolean(manualBurnCountError.value),
  })
);

const config = computed(
  (): BurnConfig => ({
    labels: BURN_SETTINGS.LABELS,
    defaults: BURN_SETTINGS.DEFAULTS,
    constraints: BURN_SETTINGS.CONSTRAINTS,
    statusMessages: BURN_SETTINGS.STATUS_MESSAGES,
    infoPanel: BURN_SETTINGS.INFO_PANEL,
    styling: BURN_SETTINGS.STYLING,
  })
);

const statusMessage = computed((): string => {
  if (autoBurnEnabled.value && autoBurnCount.value > 0) {
    return BURN_SETTINGS.STATUS_MESSAGES.AUTO_ENABLED_WITH_COUNT.replace(
      '{count}',
      autoBurnCount.value.toString()
    );
  } else if (autoBurnEnabled.value && autoBurnCount.value === 0) {
    return BURN_SETTINGS.STATUS_MESSAGES.AUTO_ENABLED_NO_COUNT;
  }
  return BURN_SETTINGS.STATUS_MESSAGES.AUTO_DISABLED;
});

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

const validateAutoBurnCount = (count: number): string | null => {
  if (isNaN(count) || count < BURN_SETTINGS.CONSTRAINTS.MIN_BURN_COUNT) {
    return `Auto burn count must be at least ${BURN_SETTINGS.CONSTRAINTS.MIN_BURN_COUNT}`;
  }

  if (count > BURN_SETTINGS.CONSTRAINTS.MAX_BURN_COUNT) {
    return `Auto burn count must be at most ${BURN_SETTINGS.CONSTRAINTS.MAX_BURN_COUNT}`;
  }

  if (count > props.totalCardsRemaining) {
    return `Cannot burn ${count} cards - only ${props.totalCardsRemaining} remaining`;
  }

  return null;
};

const validateManualBurnCount = (count: number): string | null => {
  if (isNaN(count) || count < BURN_SETTINGS.CONSTRAINTS.MIN_MANUAL_BURN) {
    return `Manual burn count must be at least ${BURN_SETTINGS.CONSTRAINTS.MIN_MANUAL_BURN}`;
  }

  if (count > BURN_SETTINGS.CONSTRAINTS.MAX_BURN_COUNT) {
    return `Manual burn count must be at most ${BURN_SETTINGS.CONSTRAINTS.MAX_BURN_COUNT}`;
  }

  if (count > props.totalCardsRemaining) {
    return `Cannot burn ${count} cards - only ${props.totalCardsRemaining} remaining`;
  }

  return null;
};

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleUpdateAutoBurnEnabled = (enabled: boolean) => {
  console.log('[burn-settings][update] Updating auto burn enabled', {
    previousEnabled: autoBurnEnabled.value,
    newEnabled: enabled,
  });

  autoBurnEnabled.value = enabled;
  isDirty.value = true;

  emit('update:autoBurnEnabled', enabled);
  emit('burn-change', burnState.value);

  console.log('[burn-settings][completion] Auto burn enabled updated successfully', {
    autoBurnEnabled: enabled,
    autoBurnCount: autoBurnCount.value,
  });
};

const handleUpdateAutoBurnCount = (count: number) => {
  console.log('[burn-settings][update] Updating auto burn count', {
    previousCount: autoBurnCount.value,
    newCount: count,
  });

  // Validate new count
  const error = validateAutoBurnCount(count);
  autoBurnCountError.value = error;

  if (error) {
    console.warn('[burn-settings][validation] Auto burn count validation failed', {
      count,
      totalCardsRemaining: props.totalCardsRemaining,
      error,
    });
    emit('validation-error', 'autoBurnCount', error);
    return;
  }

  // Update state
  autoBurnCount.value = count;
  isDirty.value = true;

  emit('update:autoBurnCount', count);
  emit('burn-change', burnState.value);

  console.log('[burn-settings][completion] Auto burn count updated successfully', {
    autoBurnCount: count,
    isValid: !autoBurnCountError.value,
  });
};

const handleUpdateManualBurnCount = (count: number) => {
  console.log('[burn-settings][update] Updating manual burn count', {
    previousCount: manualBurnCount.value,
    newCount: count,
  });

  // Validate new count
  const error = validateManualBurnCount(count);
  manualBurnCountError.value = error;

  if (error) {
    console.warn('[burn-settings][validation] Manual burn count validation failed', {
      count,
      totalCardsRemaining: props.totalCardsRemaining,
      error,
    });
    emit('validation-error', 'manualBurnCount', error);
    return;
  }

  // Update state
  manualBurnCount.value = count;
  isDirty.value = true;

  emit('update:manualBurnCount', count);
  emit('burn-change', burnState.value);

  console.log('[burn-settings][completion] Manual burn count updated successfully', {
    manualBurnCount: count,
    isValid: !manualBurnCountError.value,
  });
};

const handleManualBurn = async () => {
  if (!props.canPerformActions || manualBurnCount.value <= 0) {
    console.warn('[burn-settings][warning] Cannot perform manual burn', {
      canPerformActions: props.canPerformActions,
      manualBurnCount: manualBurnCount.value,
    });
    return;
  }

  if (manualBurnCount.value > props.totalCardsRemaining) {
    console.warn('[burn-settings][warning] Insufficient cards for manual burn', {
      manualBurnCount: manualBurnCount.value,
      totalCardsRemaining: props.totalCardsRemaining,
    });
    return;
  }

  console.log('[burn-settings][action] Performing manual burn', {
    burnCount: manualBurnCount.value,
    cardsRemaining: props.totalCardsRemaining,
  });

  isExecutingManualBurn.value = true;

  try {
    if (props.manualBurnExecutor) {
      await props.manualBurnExecutor(manualBurnCount.value);
    }

    emit('manual-burn', manualBurnCount.value, props.totalCardsRemaining - manualBurnCount.value);

    // Reset manual burn count for next use
    manualBurnCount.value = BURN_SETTINGS.DEFAULTS.MANUAL_BURN_RESET;

    console.log('[burn-settings][success] Manual burn completed successfully', {
      burnedCount: manualBurnCount.value,
      newCardsRemaining: props.totalCardsRemaining - manualBurnCount.value,
    });
  } catch (error) {
    console.error('[burn-settings][error] Manual burn execution failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    isExecutingManualBurn.value = false;
  }
};

const handleAutoBurn = async () => {
  if (!autoBurnEnabled.value || autoBurnCount.value <= 0) {
    console.warn('[burn-settings][warning] Cannot perform auto burn', {
      autoBurnEnabled: autoBurnEnabled.value,
      autoBurnCount: autoBurnCount.value,
    });
    return;
  }

  if (autoBurnCount.value > props.totalCardsRemaining) {
    console.warn('[burn-settings][warning] Insufficient cards for auto burn', {
      autoBurnCount: autoBurnCount.value,
      totalCardsRemaining: props.totalCardsRemaining,
    });
    return;
  }

  console.log('[burn-settings][action] Performing auto burn', {
    burnCount: autoBurnCount.value,
    cardsRemaining: props.totalCardsRemaining,
  });

  isExecutingAutoBurn.value = true;

  try {
    if (props.autoBurnExecutor) {
      await props.autoBurnExecutor(autoBurnCount.value);
    }

    emit('auto-burn', autoBurnCount.value, props.totalCardsRemaining - autoBurnCount.value);

    console.log('[burn-settings][success] Auto burn completed successfully', {
      burnedCount: autoBurnCount.value,
      newCardsRemaining: props.totalCardsRemaining - autoBurnCount.value,
    });
  } catch (error) {
    console.error('[burn-settings][error] Auto burn execution failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    isExecutingAutoBurn.value = false;
  }
};
</script>

<style scoped>
/* No styles - this is a headless component */
</style>
