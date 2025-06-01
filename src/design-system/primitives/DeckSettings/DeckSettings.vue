<!-- Headless Deck Settings Primitive -->
<template>
  <component :is="element" :class="computedClass" :role="role" :aria-label="ariaLabel">
    <slot
      :deckState="deckState"
      :constraints="constraints"
      :actions="actions"
      :validation="validation"
      :config="config"
      :onUpdateNumberOfDecks="handleUpdateNumberOfDecks"
      :onUpdateCutCardPosition="handleUpdateCutCardPosition"
      :onInitializeShoe="handleInitializeShoe"
    />
  </component>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults, defineProps, defineEmits } from 'vue';
import { DECK_SETTINGS } from '@/config/sessionControlSettings';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface Props {
  element?: string;
  class?: string;
  role?: string;
  ariaLabel?: string;
  initialNumberOfDecks?: number;
  initialCutCardPosition?: number;
  canModifySettings?: boolean;
  shoeInitializer?: () => void;
}

interface Emits {
  'update:numberOfDecks': [numberOfDecks: number];
  'update:cutCardPosition': [cutCardPosition: number];
  'deck-change': [deckState: DeckState];
  'initialize-shoe': [];
  'validation-error': [field: string, error: string];
}

export interface DeckState {
  numberOfDecks: number;
  cutCardPosition: number;
  isValid: boolean;
  isDirty: boolean;
  totalCards: number;
  cutCardFromTop: number;
}

export interface DeckConstraints {
  deckOptions: readonly number[];
  minCutCard: number;
  maxCutCard: number;
}

export interface DeckActions {
  canModifySettings: boolean;
  canInitializeShoe: boolean;
}

export interface DeckValidation {
  cutCardPositionError: string | null;
  hasErrors: boolean;
}

export interface DeckConfig {
  labels: typeof DECK_SETTINGS.LABELS;
  defaults: typeof DECK_SETTINGS.DEFAULTS;
  constraints: typeof DECK_SETTINGS.CONSTRAINTS;
  infoPanel: typeof DECK_SETTINGS.INFO_PANEL;
  styling: typeof DECK_SETTINGS.STYLING;
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

const props = withDefaults(defineProps<Props>(), {
  element: 'div',
  class: '',
  role: 'region',
  ariaLabel: 'Deck Settings',
  initialNumberOfDecks: DECK_SETTINGS.DEFAULTS.NUMBER_OF_DECKS,
  initialCutCardPosition: DECK_SETTINGS.DEFAULTS.CUT_CARD_POSITION,
  canModifySettings: true,
  shoeInitializer: undefined,
});

const emit = defineEmits<Emits>();

// =============================================================================
// REACTIVE STATE
// =============================================================================

const numberOfDecks = ref(props.initialNumberOfDecks);
const cutCardPosition = ref(props.initialCutCardPosition);
const isDirty = ref(false);
const cutCardPositionError = ref<string | null>(null);

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const computedClass = computed(() => props.class);

const deckState = computed(
  (): DeckState => ({
    numberOfDecks: numberOfDecks.value,
    cutCardPosition: cutCardPosition.value,
    isValid: !cutCardPositionError.value,
    isDirty: isDirty.value,
    totalCards: numberOfDecks.value * 52, // 52 cards per deck
    cutCardFromTop: numberOfDecks.value * 52 - cutCardPosition.value,
  })
);

const constraints = computed(
  (): DeckConstraints => ({
    deckOptions: DECK_SETTINGS.CONSTRAINTS.DECK_OPTIONS,
    minCutCard: DECK_SETTINGS.CONSTRAINTS.MIN_CUT_CARD,
    maxCutCard: DECK_SETTINGS.CONSTRAINTS.MAX_CUT_CARD,
  })
);

const actions = computed(
  (): DeckActions => ({
    canModifySettings: props.canModifySettings,
    canInitializeShoe: props.canModifySettings && Boolean(props.shoeInitializer),
  })
);

const validation = computed(
  (): DeckValidation => ({
    cutCardPositionError: cutCardPositionError.value,
    hasErrors: Boolean(cutCardPositionError.value),
  })
);

const config = computed(
  (): DeckConfig => ({
    labels: DECK_SETTINGS.LABELS,
    defaults: DECK_SETTINGS.DEFAULTS,
    constraints: DECK_SETTINGS.CONSTRAINTS,
    infoPanel: DECK_SETTINGS.INFO_PANEL,
    styling: DECK_SETTINGS.STYLING,
  })
);

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

const validateCutCardPosition = (position: number): string | null => {
  if (isNaN(position) || position < DECK_SETTINGS.CONSTRAINTS.MIN_CUT_CARD) {
    return `Cut card position must be at least ${DECK_SETTINGS.CONSTRAINTS.MIN_CUT_CARD}`;
  }

  if (position > DECK_SETTINGS.CONSTRAINTS.MAX_CUT_CARD) {
    return `Cut card position must be at most ${DECK_SETTINGS.CONSTRAINTS.MAX_CUT_CARD}`;
  }

  // Validate against current deck configuration
  const totalCards = numberOfDecks.value * 52;
  if (position >= totalCards) {
    return `Cut card position cannot exceed total cards (${totalCards})`;
  }

  return null;
};

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleUpdateNumberOfDecks = (newNumberOfDecks: number) => {
  console.log('[deck-settings][update] Updating number of decks', {
    previousDecks: numberOfDecks.value,
    newDecks: newNumberOfDecks,
  });

  numberOfDecks.value = newNumberOfDecks;
  isDirty.value = true;

  // Revalidate cut card position with new deck count
  const error = validateCutCardPosition(cutCardPosition.value);
  cutCardPositionError.value = error;

  if (error) {
    console.warn('[deck-settings][validation] Cut card position invalid with new deck count', {
      numberOfDecks: newNumberOfDecks,
      cutCardPosition: cutCardPosition.value,
      error,
    });
    emit('validation-error', 'cutCardPosition', error);
  }

  emit('update:numberOfDecks', newNumberOfDecks);
  emit('deck-change', deckState.value);

  console.log('[deck-settings][completion] Number of decks updated successfully', {
    numberOfDecks: newNumberOfDecks,
    totalCards: newNumberOfDecks * 52,
    isValid: !cutCardPositionError.value,
  });
};

const handleUpdateCutCardPosition = (position: number) => {
  console.log('[deck-settings][update] Updating cut card position', {
    previousPosition: cutCardPosition.value,
    newPosition: position,
  });

  // Validate new position
  const error = validateCutCardPosition(position);
  cutCardPositionError.value = error;

  if (error) {
    console.warn('[deck-settings][validation] Cut card position validation failed', {
      position,
      numberOfDecks: numberOfDecks.value,
      error,
    });
    emit('validation-error', 'cutCardPosition', error);
    return;
  }

  // Update state
  cutCardPosition.value = position;
  isDirty.value = true;

  emit('update:cutCardPosition', position);
  emit('deck-change', deckState.value);

  console.log('[deck-settings][completion] Cut card position updated successfully', {
    cutCardPosition: position,
    cutCardFromTop: numberOfDecks.value * 52 - position,
    isValid: !cutCardPositionError.value,
  });
};

const handleInitializeShoe = () => {
  if (!props.shoeInitializer) {
    console.warn('[deck-settings][warning] No shoe initializer provided');
    return;
  }

  if (!props.canModifySettings) {
    console.warn('[deck-settings][warning] Cannot initialize shoe - modifications disabled');
    return;
  }

  console.log('[deck-settings][action] Initializing new shoe', {
    numberOfDecks: numberOfDecks.value,
    cutCardPosition: cutCardPosition.value,
    totalCards: numberOfDecks.value * 52,
  });

  try {
    props.shoeInitializer();
    emit('initialize-shoe');

    console.log('[deck-settings][success] Shoe initialized successfully');
  } catch (error) {
    console.error('[deck-settings][error] Failed to initialize shoe', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
</script>

<style scoped>
/* No styles - this is a headless component */
</style>
