// =============================================================================
// HEADLESS PAYOUT SETTINGS PRIMITIVE - TYPESCRIPT INTERFACES
// =============================================================================

import type { PayoutPreset } from '@/services/payoutPresetService';
import type { PayoutValues, PayoutChangeEvent, ValidationError } from '@/config/payoutSettings';

// =============================================================================
// PROPS INTERFACE
// =============================================================================

export interface PayoutSettingsProps {
  // Initial payout values
  initialPayoutValues?: Partial<PayoutValues>;

  // Selected preset ID (if any)
  selectedPresetId?: string | null;

  // Control whether preset management is available
  enablePresetManagement?: boolean;

  // Control whether manual editing is allowed
  enableManualEditing?: boolean;

  // Show/hide info panels
  showPayoutExamples?: boolean;
  showPresetInfo?: boolean;

  // Example bet amount for calculations
  exampleBetAmount?: number;

  // Loading states for async operations
  presetsLoading?: boolean;
  savingPreset?: boolean;

  // Error states
  validationErrors?: ValidationError[];
  presetError?: string | null;
}

// =============================================================================
// EMITS INTERFACE
// =============================================================================

export interface PayoutSettingsEmits {
  // Payout value changes
  'payout-change': [event: PayoutChangeEvent];
  'manual-value-change': [field: keyof PayoutValues, value: number];

  // Preset management events
  'preset-selected': [preset: PayoutPreset];
  'preset-created': [presetData: { name: string; values: PayoutValues }];
  'preset-updated': [presetId: string, updates: Partial<PayoutValues>];
  'preset-deleted': [presetId: string];
  'default-preset-changed': [presetId: string];

  // User actions
  'reset-to-defaults': [];

  // Validation events
  'validation-error': [errors: ValidationError[]];
  'validation-success': [];
}

// =============================================================================
// STATE INTERFACE
// =============================================================================

export interface PayoutSettingsState {
  // Current payout values
  currentValues: PayoutValues;

  // Available presets
  availablePresets: PayoutPreset[];

  // Currently selected preset
  selectedPreset: PayoutPreset | null;

  // UI state
  showAddPresetDialog: boolean;
  newPresetName: string;

  // Loading states
  isLoadingPresets: boolean;
  isSavingPreset: boolean;

  // Validation state
  validationErrors: ValidationError[];
  isValid: boolean;

  // Example calculations
  exampleCalculations: {
    betAmount: number;
    results: {
      player: { totalReturn: number; profit: number };
      banker: { totalReturn: number; profit: number };
      tie: { totalReturn: number; profit: number };
      playerPair: { totalReturn: number; profit: number };
      bankerPair: { totalReturn: number; profit: number };
    };
  };
}

// =============================================================================
// SLOT PROPS INTERFACES
// =============================================================================

export interface PayoutSettingsSlotProps {
  // State access
  state: PayoutSettingsState;

  // Computed properties
  canAddCustomPreset: boolean;
  canDeleteSelectedPreset: boolean;
  canSetAsDefault: boolean;
  hasUnsavedChanges: boolean;

  // Action methods
  actions: {
    // Payout value management
    updatePayoutValue: (field: keyof PayoutValues, value: number) => void;
    resetToDefaults: () => void;

    // Preset management
    selectPreset: (preset: PayoutPreset) => void;
    createPreset: (name: string) => Promise<void>;
    deletePreset: (presetId: string) => Promise<void>;
    setDefaultPreset: (presetId: string) => Promise<void>;

    // Dialog management
    showAddPresetDialog: () => void;
    hideAddPresetDialog: () => void;

    // Validation
    validateCurrentValues: () => ValidationError[];
    clearValidationErrors: () => void;

    // Calculations
    calculatePayout: (
      betType: keyof PayoutValues,
      betAmount: number
    ) => { totalReturn: number; profit: number };
    updateExampleCalculations: () => void;
  };

  // Event handlers for parent components
  handlers: {
    onPayoutChange: (event: PayoutChangeEvent) => void;
    onPresetSelected: (preset: PayoutPreset) => void;
    onValidationError: (errors: ValidationError[]) => void;
  };
}

// =============================================================================
// CONFIGURATION INTERFACES
// =============================================================================

export interface PayoutSettingsConfig {
  // Default values
  defaults: PayoutValues;

  // Validation rules
  validation: {
    minPayout: number;
    maxPayout: number;
    minCommission: number;
    maxCommission: number;
    payoutStep: number;
    commissionStep: number;
  };

  // UI configuration
  ui: {
    exampleBetAmount: number;
    maxCustomPresets: number;
    maxPresetNameLength: number;
    minPresetNameLength: number;
  };
}

// =============================================================================
// UTILITY TYPE DEFINITIONS
// =============================================================================

export type PayoutField = keyof PayoutValues;
export type PresetType = 'system' | 'custom';

export interface PresetSummary {
  id: string;
  name: string;
  type: PresetType;
  isDefault: boolean;
  values: PayoutValues;
  formattedSummary: string;
}

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

export type { PayoutValues, PayoutChangeEvent, ValidationError } from '@/config/payoutSettings';

export type { PayoutPreset } from '@/services/payoutPresetService';

// =============================================================================
// COMPONENT EXPORT
// =============================================================================

export { default as PayoutSettings } from './PayoutSettings.vue';
