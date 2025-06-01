<template>
  <!-- Headless PayoutSettings Primitive - Pure Logic with Slot-based API -->
  <component :is="'div'">
    <slot
      :state="state"
      :canAddCustomPreset="canAddCustomPreset"
      :canDeleteSelectedPreset="canDeleteSelectedPreset"
      :canSetAsDefault="canSetAsDefault"
      :hasUnsavedChanges="hasUnsavedChanges"
      :actions="actions"
      :handlers="handlers"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { payoutPresetService } from '@/services/payoutPresetService';
import { PAYOUT_UTILS, PAYOUT_SETTINGS_DEFAULTS } from '@/config/payoutSettings';
import type {
  PayoutSettingsProps,
  PayoutSettingsEmits,
  PayoutSettingsState,
  PayoutSettingsSlotProps,
} from './index';
import type { PayoutPreset } from '@/services/payoutPresetService';
import type { PayoutValues, PayoutChangeEvent, ValidationError } from '@/config/payoutSettings';

// =============================================================================
// PROPS & EMITS
// =============================================================================

const props = withDefaults(defineProps<PayoutSettingsProps>(), {
  enablePresetManagement: true,
  enableManualEditing: true,
  showPayoutExamples: true,
  showPresetInfo: true,
  exampleBetAmount: PAYOUT_SETTINGS_DEFAULTS.EXAMPLE_BET_AMOUNT,
  presetsLoading: false,
  savingPreset: false,
  validationErrors: () => [],
  presetError: null,
});

const emit = defineEmits<PayoutSettingsEmits>();

// =============================================================================
// REACTIVE STATE
// =============================================================================

const state = reactive<PayoutSettingsState>({
  currentValues: PAYOUT_UTILS.createDefaultPayoutValues(),
  availablePresets: [],
  selectedPreset: null,
  showAddPresetDialog: false,
  newPresetName: '',
  isLoadingPresets: false,
  isSavingPreset: false,
  validationErrors: [],
  isValid: true,
  exampleCalculations: {
    betAmount: props.exampleBetAmount,
    results: {
      player: { totalReturn: 0, profit: 0 },
      banker: { totalReturn: 0, profit: 0 },
      tie: { totalReturn: 0, profit: 0 },
      playerPair: { totalReturn: 0, profit: 0 },
      bankerPair: { totalReturn: 0, profit: 0 },
    },
  },
});

// Original values for change detection
const originalValues = ref<PayoutValues>(PAYOUT_UTILS.createDefaultPayoutValues());

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const canAddCustomPreset = computed((): boolean => {
  return (
    props.enablePresetManagement &&
    state.availablePresets.filter(p => !p.is_system_preset).length <
      PAYOUT_SETTINGS_DEFAULTS.MAX_CUSTOM_PRESETS
  );
});

const canDeleteSelectedPreset = computed((): boolean => {
  return (
    props.enablePresetManagement &&
    state.selectedPreset !== null &&
    !state.selectedPreset.is_system_preset
  );
});

const canSetAsDefault = computed((): boolean => {
  return (
    props.enablePresetManagement &&
    state.selectedPreset !== null &&
    !state.selectedPreset.is_default
  );
});

const hasUnsavedChanges = computed((): boolean => {
  return JSON.stringify(state.currentValues) !== JSON.stringify(originalValues.value);
});

// =============================================================================
// PAYOUT CALCULATION METHODS
// =============================================================================

const calculatePayout = (
  betType: keyof PayoutValues,
  betAmount: number
): { totalReturn: number; profit: number } => {
  let payoutRatio: number;
  let commission = 0;

  switch (betType) {
    case 'player_payout':
      payoutRatio = state.currentValues.player_payout;
      break;
    case 'banker_payout':
      payoutRatio = state.currentValues.banker_payout;
      commission = state.currentValues.banker_commission;
      break;
    case 'tie_payout':
      payoutRatio = state.currentValues.tie_payout;
      break;
    case 'player_pair_payout':
      payoutRatio = state.currentValues.player_pair_payout;
      break;
    case 'banker_pair_payout':
      payoutRatio = state.currentValues.banker_pair_payout;
      break;
    default:
      payoutRatio = 1;
  }

  const totalReturn = PAYOUT_UTILS.calculateTotalPayout(betAmount, payoutRatio, commission);
  const profit = PAYOUT_UTILS.calculateProfit(betAmount, payoutRatio, commission);

  return { totalReturn, profit };
};

const updateExampleCalculations = (): void => {
  const betAmount = state.exampleCalculations.betAmount;

  state.exampleCalculations.results = {
    player: calculatePayout('player_payout', betAmount),
    banker: calculatePayout('banker_payout', betAmount),
    tie: calculatePayout('tie_payout', betAmount),
    playerPair: calculatePayout('player_pair_payout', betAmount),
    bankerPair: calculatePayout('banker_pair_payout', betAmount),
  };
};

// =============================================================================
// VALIDATION METHODS
// =============================================================================

const validateCurrentValues = (): ValidationError[] => {
  const errors = PAYOUT_UTILS.validatePayoutValues(state.currentValues);
  state.validationErrors = errors;
  state.isValid = errors.length === 0;

  if (errors.length > 0) {
    emit('validation-error', errors);
  } else {
    emit('validation-success');
  }

  return errors;
};

const clearValidationErrors = (): void => {
  state.validationErrors = [];
  state.isValid = true;
};

// =============================================================================
// PAYOUT VALUE MANAGEMENT
// =============================================================================

const updatePayoutValue = (field: keyof PayoutValues, value: number): void => {
  if (!props.enableManualEditing) {
    return;
  }

  // Clear preset selection when manual edit is made
  if (state.selectedPreset) {
    state.selectedPreset = null;
    console.log('[payout-settings][action] Cleared preset selection due to manual edit', {
      field,
      value,
    });
  }

  state.currentValues[field] = value;

  // Clear any existing validation errors for this field
  state.validationErrors = state.validationErrors.filter(error => error.field !== field);

  // Validate the new value
  validateCurrentValues();

  // Update example calculations
  updateExampleCalculations();

  // Emit manual value change event
  emit('manual-value-change', field, value);

  // Emit general payout change event
  const changeEvent: PayoutChangeEvent = {
    values: { ...state.currentValues },
    source: 'manual',
  };
  emit('payout-change', changeEvent);
};

const resetToDefaults = (): void => {
  const defaultValues = PAYOUT_UTILS.createDefaultPayoutValues();

  Object.assign(state.currentValues, defaultValues);
  originalValues.value = { ...defaultValues };
  state.selectedPreset = null;

  clearValidationErrors();
  updateExampleCalculations();

  const changeEvent: PayoutChangeEvent = {
    values: { ...state.currentValues },
    source: 'reset',
  };

  emit('reset-to-defaults');
  emit('payout-change', changeEvent);

  console.log('[payout-settings][action] Reset to default values');
};

// =============================================================================
// PRESET MANAGEMENT
// =============================================================================

const loadPresets = async (): Promise<void> => {
  try {
    state.isLoadingPresets = true;
    console.log('[payout-settings][presets] Loading available presets');

    const presets = await payoutPresetService.getAllPresets();
    state.availablePresets = presets;

    // If no preset is selected, try to load the default one
    if (!state.selectedPreset && presets.length > 0) {
      const defaultPreset = presets.find(p => p.is_default);
      if (defaultPreset) {
        await selectPreset(defaultPreset, false); // Don't emit event during initial load
      }
    }

    console.log('[payout-settings][presets] Loaded presets', { count: presets.length });
  } catch (error) {
    console.error('[payout-settings][error] Failed to load presets', { error });
  } finally {
    state.isLoadingPresets = false;
  }
};

const selectPreset = async (preset: PayoutPreset, emitEvent = true): Promise<void> => {
  state.selectedPreset = preset;

  // Update current values with preset values
  state.currentValues = {
    player_payout: preset.player_payout,
    banker_payout: preset.banker_payout,
    banker_commission: preset.banker_commission,
    tie_payout: preset.tie_payout,
    player_pair_payout: preset.player_pair_payout,
    banker_pair_payout: preset.banker_pair_payout,
  };

  originalValues.value = { ...state.currentValues };

  clearValidationErrors();
  updateExampleCalculations();

  if (emitEvent) {
    const changeEvent: PayoutChangeEvent = {
      values: { ...state.currentValues },
      source: 'preset',
      presetId: preset.id,
      presetName: preset.name,
    };

    emit('preset-selected', preset);
    emit('payout-change', changeEvent);
  }

  console.log('[payout-settings][presets] Selected preset', {
    name: preset.name,
    id: preset.id,
    isDefault: preset.is_default,
  });
};

const createPreset = async (name: string): Promise<void> => {
  if (!props.enablePresetManagement) {
    return;
  }

  try {
    state.isSavingPreset = true;
    console.log('[payout-settings][presets] Creating new preset', { name });

    const presetData = {
      name,
      ...state.currentValues,
    };

    const newPreset = await payoutPresetService.createPreset(presetData);

    // Add to available presets
    state.availablePresets.push(newPreset);

    // Select the new preset
    await selectPreset(newPreset);

    // Hide dialog and reset form
    state.showAddPresetDialog = false;
    state.newPresetName = '';

    emit('preset-created', { name, values: state.currentValues });

    console.log('[payout-settings][presets] Created preset successfully', {
      id: newPreset.id,
      name,
    });
  } catch (error) {
    console.error('[payout-settings][error] Failed to create preset', { error, name });
    throw error;
  } finally {
    state.isSavingPreset = false;
  }
};

const deletePreset = async (presetId: string): Promise<void> => {
  if (!props.enablePresetManagement) {
    return;
  }

  try {
    console.log('[payout-settings][presets] Deleting preset', { presetId });

    await payoutPresetService.deletePreset(presetId);

    // Remove from available presets
    state.availablePresets = state.availablePresets.filter(p => p.id !== presetId);

    // If this was the selected preset, clear selection
    if (state.selectedPreset?.id === presetId) {
      state.selectedPreset = null;
    }

    emit('preset-deleted', presetId);

    console.log('[payout-settings][presets] Deleted preset successfully', { presetId });
  } catch (error) {
    console.error('[payout-settings][error] Failed to delete preset', { error, presetId });
    throw error;
  }
};

const setDefaultPreset = async (presetId: string): Promise<void> => {
  if (!props.enablePresetManagement) {
    return;
  }

  try {
    console.log('[payout-settings][presets] Setting default preset', { presetId });

    const updatedPreset = await payoutPresetService.setDefaultPreset(presetId);

    // Update preset in available list
    const presetIndex = state.availablePresets.findIndex(p => p.id === presetId);
    if (presetIndex !== -1) {
      // Unset default on all others
      state.availablePresets.forEach(p => {
        p.is_default = false;
      });
      // Set new default
      state.availablePresets[presetIndex] = updatedPreset;
    }

    emit('default-preset-changed', presetId);

    console.log('[payout-settings][presets] Set default preset successfully', { presetId });
  } catch (error) {
    console.error('[payout-settings][error] Failed to set default preset', { error, presetId });
    throw error;
  }
};

// =============================================================================
// DIALOG MANAGEMENT
// =============================================================================

const showAddPresetDialog = (): void => {
  state.showAddPresetDialog = true;
  state.newPresetName = '';
};

const hideAddPresetDialog = (): void => {
  state.showAddPresetDialog = false;
  state.newPresetName = '';
};

// =============================================================================
// ACTIONS OBJECT
// =============================================================================

const actions: PayoutSettingsSlotProps['actions'] = {
  updatePayoutValue,
  resetToDefaults,
  selectPreset,
  createPreset,
  deletePreset,
  setDefaultPreset,
  showAddPresetDialog,
  hideAddPresetDialog,
  validateCurrentValues,
  clearValidationErrors,
  calculatePayout,
  updateExampleCalculations,
};

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handlers: PayoutSettingsSlotProps['handlers'] = {
  onPayoutChange: (event: PayoutChangeEvent) => emit('payout-change', event),
  onPresetSelected: (preset: PayoutPreset) => emit('preset-selected', preset),
  onValidationError: (errors: ValidationError[]) => emit('validation-error', errors),
};

// =============================================================================
// INITIALIZATION AND WATCHERS
// =============================================================================

// Initialize with provided values
if (props.initialPayoutValues) {
  Object.assign(state.currentValues, props.initialPayoutValues);
  originalValues.value = { ...state.currentValues };
}

// Update example calculations when bet amount changes
watch(
  () => props.exampleBetAmount,
  newAmount => {
    state.exampleCalculations.betAmount = newAmount;
    updateExampleCalculations();
  }
);

// Update validation errors from props
watch(
  () => props.validationErrors,
  newErrors => {
    if (newErrors) {
      state.validationErrors = newErrors;
      state.isValid = newErrors.length === 0;
    }
  },
  { immediate: true }
);

// Load presets on component mount
loadPresets();

// Initialize example calculations
updateExampleCalculations();

console.log('[payout-settings][initialization] PayoutSettings primitive initialized');
</script>
