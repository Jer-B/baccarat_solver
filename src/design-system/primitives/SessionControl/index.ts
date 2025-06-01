export { default as SessionControl } from './SessionControl.vue';

// Export types for external use
export type {
  SessionState,
  BurnSettings,
  SessionActions,
  BurnActions,
  BalanceSettings,
} from './SessionControl.vue';

// Import types for use in interfaces
import type {
  SessionState,
  BurnSettings,
  SessionActions,
  BurnActions,
  BalanceSettings,
} from './SessionControl.vue';

export interface SessionControlProps {
  element?: string;
  class?: string;
  role?: string;
  ariaLabel?: string;
  initialAutoBurnEnabled?: boolean;
  initialAutoBurnCount?: number;
  initialManualBurnCount?: number;
}

export interface SessionControlEmits {
  'session-start': [sessionState: SessionState];
  'session-end': [sessionState: SessionState];
  'manual-burn': [burnCount: number, cardsRemaining: number];
  'auto-burn': [burnCount: number, cardsRemaining: number];
  'settings-change': [settings: BurnSettings];
  'balance-change': [balanceSettings: BalanceSettings];
}

export interface SessionControlSlotProps {
  sessionState: SessionState;
  burnSettings: BurnSettings;
  sessionActions: SessionActions;
  burnActions: BurnActions;
  sessionDuration: string;
  canPerformActions: boolean;
  totalCardsRemaining: number;
  onStartSession: () => void;
  onEndSession: () => void;
  onManualBurn: () => void;
  onUpdateAutoBurnEnabled: (enabled: boolean) => void;
  onUpdateAutoBurnCount: (count: number) => void;
  onUpdateManualBurnCount: (count: number) => void;
}
