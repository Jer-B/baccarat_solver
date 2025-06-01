<!-- Headless Balance Settings Primitive -->
<template>
  <component :is="element" :class="computedClass" :role="role" :aria-label="ariaLabel">
    <slot
      :balanceState="balanceState"
      :constraints="constraints"
      :actions="actions"
      :validation="validation"
      :config="config"
      :onUpdateStartingBalance="handleUpdateStartingBalance"
      :onUpdateUsePreviousBalance="handleUpdateUsePreviousBalance"
      :onGetPreviousBalance="handleGetPreviousBalance"
    />
  </component>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults, defineProps, defineEmits } from 'vue';
import { BALANCE_SETTINGS } from '@/config/sessionControlSettings';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface Props {
  element?: string;
  class?: string;
  role?: string;
  ariaLabel?: string;
  initialStartingBalance?: number;
  initialUsePreviousBalance?: boolean;
  initialPreviousBalance?: number;
  canModifyBalance?: boolean;
  previousBalanceLoader?: () => Promise<number>;
}

interface Emits {
  'update:startingBalance': [balance: number];
  'update:usePreviousBalance': [usePrevious: boolean];
  'balance-change': [balanceState: BalanceState];
  'validation-error': [field: string, error: string];
  'previous-balance-loaded': [balance: number];
}

export interface BalanceState {
  startingBalance: number;
  usePreviousEndBalance: boolean;
  previousEndBalance: number;
  isValid: boolean;
  isDirty: boolean;
}

export interface BalanceConstraints {
  minBalance: number;
  maxBalance: number;
  step: number;
}

export interface BalanceActions {
  canModifyBalance: boolean;
  canUsePreviousBalance: boolean;
  isLoadingPreviousBalance: boolean;
}

export interface BalanceValidation {
  startingBalanceError: string | null;
  hasErrors: boolean;
}

export interface BalanceConfig {
  labels: typeof BALANCE_SETTINGS.LABELS;
  defaults: typeof BALANCE_SETTINGS.DEFAULTS;
  constraints: typeof BALANCE_SETTINGS.CONSTRAINTS;
  infoPanel: typeof BALANCE_SETTINGS.INFO_PANEL;
  styling: typeof BALANCE_SETTINGS.STYLING;
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

const props = withDefaults(defineProps<Props>(), {
  element: 'div',
  class: '',
  role: 'region',
  ariaLabel: 'Balance Settings',
  initialStartingBalance: BALANCE_SETTINGS.DEFAULTS.STARTING_BALANCE,
  initialUsePreviousBalance: BALANCE_SETTINGS.DEFAULTS.USE_PREVIOUS_BALANCE,
  initialPreviousBalance: 0,
  canModifyBalance: true,
  previousBalanceLoader: undefined,
});

const emit = defineEmits<Emits>();

// =============================================================================
// REACTIVE STATE
// =============================================================================

const startingBalance = ref(props.initialStartingBalance);
const usePreviousEndBalance = ref(props.initialUsePreviousBalance);
const previousEndBalance = ref(props.initialPreviousBalance);
const isDirty = ref(false);
const isLoadingPreviousBalance = ref(false);
const startingBalanceError = ref<string | null>(null);

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const computedClass = computed(() => props.class);

const balanceState = computed(
  (): BalanceState => ({
    startingBalance: startingBalance.value,
    usePreviousEndBalance: usePreviousEndBalance.value,
    previousEndBalance: previousEndBalance.value,
    isValid: !startingBalanceError.value,
    isDirty: isDirty.value,
  })
);

const constraints = computed(
  (): BalanceConstraints => ({
    minBalance: BALANCE_SETTINGS.CONSTRAINTS.MIN_BALANCE,
    maxBalance: BALANCE_SETTINGS.CONSTRAINTS.MAX_BALANCE,
    step: BALANCE_SETTINGS.CONSTRAINTS.STEP,
  })
);

const actions = computed(
  (): BalanceActions => ({
    canModifyBalance: props.canModifyBalance,
    canUsePreviousBalance: !isLoadingPreviousBalance.value,
    isLoadingPreviousBalance: isLoadingPreviousBalance.value,
  })
);

const validation = computed(
  (): BalanceValidation => ({
    startingBalanceError: startingBalanceError.value,
    hasErrors: Boolean(startingBalanceError.value),
  })
);

const config = computed(
  (): BalanceConfig => ({
    labels: BALANCE_SETTINGS.LABELS,
    defaults: BALANCE_SETTINGS.DEFAULTS,
    constraints: BALANCE_SETTINGS.CONSTRAINTS,
    infoPanel: BALANCE_SETTINGS.INFO_PANEL,
    styling: BALANCE_SETTINGS.STYLING,
  })
);

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

const validateStartingBalance = (balance: number): string | null => {
  if (isNaN(balance) || balance < 0) {
    return `Balance must be at least ${BALANCE_SETTINGS.CONSTRAINTS.MIN_BALANCE}`;
  }

  if (balance > BALANCE_SETTINGS.CONSTRAINTS.MAX_BALANCE) {
    return `Balance must be at most ${BALANCE_SETTINGS.CONSTRAINTS.MAX_BALANCE}`;
  }

  return null;
};

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleUpdateStartingBalance = (balance: number) => {
  console.log('[balance-settings][update] Updating starting balance', {
    previousBalance: startingBalance.value,
    newBalance: balance,
  });

  // Validate new balance
  const error = validateStartingBalance(balance);
  startingBalanceError.value = error;

  if (error) {
    console.warn('[balance-settings][validation] Starting balance validation failed', {
      balance,
      error,
    });
    emit('validation-error', 'startingBalance', error);
    return;
  }

  // Update state
  startingBalance.value = balance;
  isDirty.value = true;

  // Emit events
  emit('update:startingBalance', balance);
  emit('balance-change', balanceState.value);

  console.log('[balance-settings][completion] Starting balance updated successfully', {
    newBalance: balance,
    isValid: !startingBalanceError.value,
  });
};

const handleUpdateUsePreviousBalance = async (usePrevious: boolean) => {
  console.log('[balance-settings][update] Updating use previous balance setting', {
    previousSetting: usePreviousEndBalance.value,
    newSetting: usePrevious,
  });

  usePreviousEndBalance.value = usePrevious;
  isDirty.value = true;

  // If enabling previous balance, load the actual previous balance
  if (usePrevious && props.previousBalanceLoader) {
    try {
      const previousBalance = await handleGetPreviousBalance();
      handleUpdateStartingBalance(previousBalance);
    } catch (error) {
      console.error('[balance-settings][error] Failed to load previous balance', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Reset to default if loading fails
      handleUpdateStartingBalance(BALANCE_SETTINGS.DEFAULTS.FALLBACK_BALANCE);
    }
  } else if (!usePrevious) {
    // Reset to default balance when disabling previous balance
    handleUpdateStartingBalance(BALANCE_SETTINGS.DEFAULTS.FALLBACK_BALANCE);
  }

  emit('update:usePreviousBalance', usePrevious);
  emit('balance-change', balanceState.value);

  console.log('[balance-settings][completion] Use previous balance updated successfully', {
    usePrevious,
    currentBalance: startingBalance.value,
  });
};

const handleGetPreviousBalance = async (): Promise<number> => {
  if (!props.previousBalanceLoader) {
    console.warn('[balance-settings][warning] No previous balance loader provided');
    return BALANCE_SETTINGS.DEFAULTS.FALLBACK_BALANCE;
  }

  console.log('[balance-settings][loading] Loading previous session end balance');
  isLoadingPreviousBalance.value = true;

  try {
    const balance = await props.previousBalanceLoader();
    previousEndBalance.value = balance;

    console.log('[balance-settings][success] Previous balance loaded successfully', {
      balance,
    });

    emit('previous-balance-loaded', balance);
    return balance;
  } catch (error) {
    console.error('[balance-settings][error] Failed to load previous balance', {
      error: error instanceof Error ? error.message : String(error),
    });

    const fallbackBalance = BALANCE_SETTINGS.DEFAULTS.FALLBACK_BALANCE;
    previousEndBalance.value = fallbackBalance;
    return fallbackBalance;
  } finally {
    isLoadingPreviousBalance.value = false;
  }
};
</script>

<style scoped>
/* No styles - this is a headless component */
</style>
