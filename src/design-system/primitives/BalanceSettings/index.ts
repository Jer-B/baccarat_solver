export { default as BalanceSettings } from './BalanceSettings.vue';

// Export types for external use
export type {
  BalanceState,
  BalanceConstraints,
  BalanceActions,
  BalanceValidation,
  BalanceConfig,
} from './BalanceSettings.vue';

// Import types for use in interfaces
import type {
  BalanceState,
  BalanceConstraints,
  BalanceActions,
  BalanceValidation,
  BalanceConfig,
} from './BalanceSettings.vue';

export interface BalanceSettingsProps {
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

export interface BalanceSettingsEmits {
  'update:startingBalance': [balance: number];
  'update:usePreviousBalance': [usePrevious: boolean];
  'balance-change': [balanceState: BalanceState];
  'validation-error': [field: string, error: string];
  'previous-balance-loaded': [balance: number];
}

export interface BalanceSettingsSlotProps {
  balanceState: BalanceState;
  constraints: BalanceConstraints;
  actions: BalanceActions;
  validation: BalanceValidation;
  config: BalanceConfig;
  onUpdateStartingBalance: (balance: number) => void;
  onUpdateUsePreviousBalance: (usePrevious: boolean) => void;
  onGetPreviousBalance: () => Promise<number>;
}
