export { default as DeckSettings } from './DeckSettings.vue';

// Export types for external use
export type {
  DeckState,
  DeckConstraints,
  DeckActions,
  DeckValidation,
  DeckConfig,
} from './DeckSettings.vue';

// Import types for use in interfaces
import type {
  DeckState,
  DeckConstraints,
  DeckActions,
  DeckValidation,
  DeckConfig,
} from './DeckSettings.vue';

export interface DeckSettingsProps {
  element?: string;
  class?: string;
  role?: string;
  ariaLabel?: string;
  initialNumberOfDecks?: number;
  initialCutCardPosition?: number;
  canModifySettings?: boolean;
  shoeInitializer?: () => void;
}

export interface DeckSettingsEmits {
  'update:numberOfDecks': [numberOfDecks: number];
  'update:cutCardPosition': [cutCardPosition: number];
  'deck-change': [deckState: DeckState];
  'initialize-shoe': [];
  'validation-error': [field: string, error: string];
}

export interface DeckSettingsSlotProps {
  deckState: DeckState;
  constraints: DeckConstraints;
  actions: DeckActions;
  validation: DeckValidation;
  config: DeckConfig;
  onUpdateNumberOfDecks: (numberOfDecks: number) => void;
  onUpdateCutCardPosition: (cutCardPosition: number) => void;
  onInitializeShoe: () => void;
}
