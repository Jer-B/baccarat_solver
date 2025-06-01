export { default as BurnSettings } from './BurnSettings.vue';

// Export types for external use
export type {
  BurnState,
  BurnConstraints,
  BurnActions,
  BurnValidation,
  BurnConfig,
} from './BurnSettings.vue';

// Import types for use in interfaces
import type {
  BurnState,
  BurnConstraints,
  BurnActions,
  BurnValidation,
  BurnConfig,
} from './BurnSettings.vue';

export interface BurnSettingsProps {
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

export interface BurnSettingsEmits {
  'update:autoBurnEnabled': [enabled: boolean];
  'update:autoBurnCount': [count: number];
  'update:manualBurnCount': [count: number];
  'manual-burn': [burnCount: number, cardsRemaining: number];
  'auto-burn': [burnCount: number, cardsRemaining: number];
  'burn-change': [burnState: BurnState];
  'validation-error': [field: string, error: string];
}

export interface BurnSettingsSlotProps {
  burnState: BurnState;
  constraints: BurnConstraints;
  actions: BurnActions;
  validation: BurnValidation;
  config: BurnConfig;
  statusMessage: string;
  onUpdateAutoBurnEnabled: (enabled: boolean) => void;
  onUpdateAutoBurnCount: (count: number) => void;
  onUpdateManualBurnCount: (count: number) => void;
  onManualBurn: () => Promise<void>;
  onAutoBurn: () => Promise<void>;
}
