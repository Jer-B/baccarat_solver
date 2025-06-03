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
import { computed, reactive, ref, watch, nextTick } from 'vue';
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
  const currentStr = JSON.stringify(state.currentValues);
  const originalStr = JSON.stringify(originalValues.value);
  const hasChanges = currentStr !== originalStr;

  console.log('[payout-settings][computed] hasUnsavedChanges evaluation', {
    hasChanges,
    currentValues: state.currentValues,
    originalValues: originalValues.value,
    selectedPreset: state.selectedPreset?.name,
    isCustomPreset: state.selectedPreset && !state.selectedPreset.is_system_preset,
    canSaveChanges: hasChanges && state.selectedPreset && !state.selectedPreset.is_system_preset,
    comparison: {
      playerPayout: {
        current: state.currentValues.player_payout,
        original: originalValues.value.player_payout,
        changed: state.currentValues.player_payout !== originalValues.value.player_payout,
      },
      bankerCommission: {
        current: state.currentValues.banker_commission,
        original: originalValues.value.banker_commission,
        changed: state.currentValues.banker_commission !== originalValues.value.banker_commission,
      },
    },
  });

  return hasChanges;
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

  console.log('[payout-settings][calc] Force updating example calculations', {
    betAmount,
    currentValues: state.currentValues,
    previousResults: state.exampleCalculations.results,
  });

  // Force complete re-calculation with current values
  const newResults = {
    player: calculatePayout('player_payout', betAmount),
    banker: calculatePayout('banker_payout', betAmount),
    tie: calculatePayout('tie_payout', betAmount),
    playerPair: calculatePayout('player_pair_payout', betAmount),
    bankerPair: calculatePayout('banker_pair_payout', betAmount),
  };

  // Force reactivity by replacing the entire object
  state.exampleCalculations.results = { ...newResults };

  console.log('[payout-settings][calc] Updated example calculations', {
    newResults: state.exampleCalculations.results,
    playerPayout: `$${newResults.player.totalReturn.toFixed(2)} (${state.currentValues.player_payout}:1)`,
    bankerPayout: `$${newResults.banker.totalReturn.toFixed(2)} (${state.currentValues.banker_payout}:1 - ${(state.currentValues.banker_commission * 100).toFixed(1)}% commission)`,
    tiePayout: `$${newResults.tie.totalReturn.toFixed(2)} (${state.currentValues.tie_payout}:1)`,
  });
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
    console.log('[payout-settings][blocked] Manual editing disabled');
    return;
  }

  console.log('[payout-settings][action] Manual edit made to field', {
    field,
    value,
    previousValue: state.currentValues[field],
    selectedPreset: state.selectedPreset?.name,
    preservingPresetSelection: true,
    willTriggerHasUnsavedChanges: true,
  });

  // Update the value
  state.currentValues[field] = value;

  // Force immediate update of example calculations
  updateExampleCalculations();

  console.log('[payout-settings][state] After manual edit', {
    updatedField: field,
    newValue: state.currentValues[field],
    allCurrentValues: { ...state.currentValues },
    originalValues: { ...originalValues.value },
    hasUnsavedChanges: JSON.stringify(state.currentValues) !== JSON.stringify(originalValues.value),
    exampleCalculations: state.exampleCalculations.results,
  });

  // Clear any existing validation errors for this field
  state.validationErrors = state.validationErrors.filter(error => error.field !== field);

  // Validate the new value
  validateCurrentValues();

  // Emit manual value change event
  emit('manual-value-change', field, value);

  // Emit general payout change event
  const changeEvent: PayoutChangeEvent = {
    values: { ...state.currentValues },
    source: 'manual',
    // Include preset info if still selected
    presetId: state.selectedPreset?.id,
    presetName: state.selectedPreset?.name,
  };
  emit('payout-change', changeEvent);

  console.log('[payout-settings][emitted] Events emitted for manual edit', {
    manualValueChangeEvent: { field, value },
    payoutChangeEvent: changeEvent,
  });
};

const resetToDefaults = async (): Promise<void> => {
  const defaultValues = PAYOUT_UTILS.createDefaultPayoutValues();

  Object.assign(state.currentValues, defaultValues);
  originalValues.value = { ...defaultValues };

  // Find and select the Vegas/Standard preset as default
  const vegasPreset = state.availablePresets.find(
    p => p.name.toLowerCase().includes('vegas') || p.name.toLowerCase().includes('standard')
  );

  if (vegasPreset) {
    // Select Vegas preset instead of clearing selection
    state.selectedPreset = vegasPreset;

    // Make it the default preset if it isn't already
    if (!vegasPreset.is_default) {
      try {
        await setDefaultPreset(vegasPreset.id);
      } catch (error) {
        console.warn('[payout-settings][warning] Could not set Vegas as default', { error });
      }
    }
  } else {
    // Fallback: clear selection if Vegas preset not found
    state.selectedPreset = null;
  }

  clearValidationErrors();
  updateExampleCalculations();

  const changeEvent: PayoutChangeEvent = {
    values: { ...state.currentValues },
    source: 'reset',
    presetId: state.selectedPreset?.id,
    presetName: state.selectedPreset?.name,
  };

  emit('reset-to-defaults');
  emit('payout-change', changeEvent);

  console.log('[payout-settings][action] Reset to default values and selected Vegas preset');
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

  // ✨ CRITICAL: Update originalValues to reflect the preset values
  // This ensures hasUnsavedChanges works correctly when user makes manual edits
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
    currentValues: state.currentValues,
    originalValues: originalValues.value,
    hasUnsavedChanges: JSON.stringify(state.currentValues) !== JSON.stringify(originalValues.value),
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

const updatePreset = async (presetId: string, updates: Partial<PayoutValues>): Promise<void> => {
  if (!props.enablePresetManagement) {
    return;
  }

  try {
    state.isSavingPreset = true;
    console.log('[payout-settings][presets] Updating preset', { presetId, updates });

    const updatedPreset = await payoutPresetService.updatePreset(presetId, updates);

    // Update preset in available list
    const presetIndex = state.availablePresets.findIndex(p => p.id === presetId);
    if (presetIndex !== -1) {
      state.availablePresets[presetIndex] = updatedPreset;
    }

    // If this is the currently selected preset, update the selection
    if (state.selectedPreset?.id === presetId) {
      state.selectedPreset = updatedPreset;
      // Update current values to match the updated preset
      Object.assign(state.currentValues, updates);
      // ✨ CRITICAL FIX: Update originalValues after successful save to reset hasUnsavedChanges
      originalValues.value = { ...state.currentValues };
    }

    emit('preset-updated', presetId, updates);

    console.log('[payout-settings][presets] Updated preset successfully', { presetId });
  } catch (error) {
    console.error('[payout-settings][error] Failed to update preset', { error, presetId });
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
  updatePreset,
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

// Watch for selectedPresetId changes from parent
watch(
  () => props.selectedPresetId,
  async newPresetId => {
    if (newPresetId && state.availablePresets.length > 0) {
      const preset = state.availablePresets.find(p => p.id === newPresetId);
      if (preset) {
        await selectPreset(preset, false); // Don't emit event since it's coming from parent
        console.log('[payout-settings][watch] Applied preset from selectedPresetId prop', {
          presetId: newPresetId,
          presetName: preset.name,
        });
      }
    } else if (!newPresetId) {
      // Clear selection if null/undefined
      state.selectedPreset = null;
    }
  },
  { immediate: true }
);

// Watch for when presets are loaded to apply selectedPresetId if set
watch(
  () => state.availablePresets.length,
  async newLength => {
    if (newLength > 0 && props.selectedPresetId) {
      const preset = state.availablePresets.find(p => p.id === props.selectedPresetId);
      if (preset && state.selectedPreset?.id !== preset.id) {
        await selectPreset(preset, false); // Don't emit event since it's from prop
        console.log('[payout-settings][watch] Applied preset after presets loaded', {
          presetId: props.selectedPresetId,
          presetName: preset.name,
        });
      }
    }
  }
);

// Watch for initialPayoutValues changes from parent (only if no preset selected)
watch(
  () => props.initialPayoutValues,
  newInitialValues => {
    if (newInitialValues && !props.selectedPresetId) {
      Object.assign(state.currentValues, newInitialValues);
      originalValues.value = { ...state.currentValues };
      updateExampleCalculations();
      console.log('[payout-settings][watch] Updated from initialPayoutValues', {
        values: newInitialValues,
      });
    }
  },
  { deep: true }
);

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

// ✨ CRITICAL: Watch currentValues for real-time payout example updates
watch(
  () => state.currentValues,
  async () => {
    // Force reactivity with nextTick to ensure all updates are processed
    await nextTick();
    updateExampleCalculations();
    console.log('[payout-settings][reactivity] Current values changed, updating examples', {
      currentValues: state.currentValues,
    });
  },
  { deep: true, immediate: true }
);

// Load presets on component mount
loadPresets();

// Initialize example calculations
updateExampleCalculations();

console.log('[payout-settings][initialization] PayoutSettings primitive initialized');
</script>
