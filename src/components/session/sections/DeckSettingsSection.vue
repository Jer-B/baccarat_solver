<!-- Deck Settings Styled Section -->
<template>
  <DeckSettings
    :initial-number-of-decks="initialNumberOfDecks"
    :initial-cut-card-position="initialCutCardPosition"
    :can-modify-settings="canModifySettings"
    :shoe-initializer="shoeInitializer"
    @update:number-of-decks="$emit('update:numberOfDecks', $event)"
    @update:cut-card-position="$emit('update:cutCardPosition', $event)"
    @deck-change="$emit('deck-change', $event)"
    @initialize-shoe="$emit('initialize-shoe')"
    @validation-error="handleValidationError"
  >
    <template
      #default="{
        deckState,
        constraints,
        actions,
        validation,
        config,
        onUpdateNumberOfDecks,
        onUpdateCutCardPosition,
      }"
    >
      <!-- Deck Settings Section - EXACT UI PRESERVATION -->
      <div :class="config.styling.SECTION_CONTAINER">
        <div :class="config.styling.HEADER">
          <h3 :class="config.styling.TITLE">{{ config.labels.SECTION_TITLE }}</h3>
        </div>

        <div :class="config.styling.GRID">
          <!-- Number of Decks -->
          <div :class="config.styling.FIELD_CONTAINER">
            <label :class="config.styling.LABEL">{{ config.labels.NUMBER_OF_DECKS }}</label>
            <select
              :value="deckState.numberOfDecks"
              @change="onUpdateNumberOfDecks(Number(($event.target as HTMLSelectElement).value))"
              :disabled="!actions.canModifySettings"
              :class="config.styling.SELECT"
            >
              <option
                v-for="deckOption in constraints.deckOptions"
                :key="deckOption"
                :value="deckOption"
              >
                {{ deckOption }}
              </option>
            </select>
          </div>

          <!-- Cut Card Position -->
          <div :class="config.styling.FIELD_CONTAINER">
            <label :class="config.styling.LABEL">
              {{ config.labels.CUT_CARD_POSITION }}
            </label>
            <div :class="config.styling.INPUT_WRAPPER">
              <input
                :value="deckState.cutCardPosition"
                @input="onUpdateCutCardPosition(Number(($event.target as HTMLInputElement).value))"
                :disabled="!actions.canModifySettings"
                type="number"
                :min="constraints.minCutCard"
                :max="constraints.maxCutCard"
                :class="config.styling.INPUT"
                :placeholder="config.labels.PLACEHOLDER"
                :title="config.labels.CUT_CARD_TOOLTIP"
              />
              <span :class="config.styling.UNIT_LABEL">{{ config.labels.CARDS_UNIT }}</span>
            </div>
            <div v-if="validation.cutCardPositionError" :class="config.styling.VALIDATION_ERROR">
              {{ validation.cutCardPositionError }}
            </div>
          </div>
        </div>

        <!-- Deck Settings Information -->
        <div :class="config.styling.INFO_CONTAINER">
          <div :class="config.styling.INFO_HEADER">
            <h4 :class="config.styling.INFO_TITLE">{{ config.infoPanel.TITLE }}</h4>
            <InfoSectionToggleButton
              :section="config.infoPanel.SECTION"
              :subsection="config.infoPanel.SUBSECTION"
            />
          </div>
          <div
            v-if="visibilityStore.isVisible(config.infoPanel.SECTION, config.infoPanel.SUBSECTION)"
            :class="config.styling.INFO_CONTENT"
          >
            <div>
              <div :class="config.styling.INFO_SECTION_TITLE">
                {{ config.infoPanel.CONTENT.HOW_IT_WORKS.TITLE }}
              </div>
              <div
                v-for="point in getInfoPoints(
                  config.infoPanel.CONTENT.HOW_IT_WORKS.POINTS,
                  deckState.cutCardPosition
                )"
                :key="point"
              >
                {{ point }}
              </div>
            </div>
            <div>
              <div :class="config.styling.INFO_SECTION_TITLE">
                {{ config.infoPanel.CONTENT.SETTINGS_GUIDE.TITLE }}
              </div>
              <div v-for="point in config.infoPanel.CONTENT.SETTINGS_GUIDE.POINTS" :key="point">
                {{ point }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </DeckSettings>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue';
import { DeckSettings } from '@/design-system/primitives/DeckSettings';
import type { DeckState } from '@/design-system/primitives/DeckSettings';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { useNotifications } from '@/composables/useNotifications';
import InfoSectionToggleButton from '@/components/common/button/InfoSectionToggleButton.vue';
import { DECK_SETTINGS } from '@/config/sessionControlSettings';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface Props {
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
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

withDefaults(defineProps<Props>(), {
  initialNumberOfDecks: DECK_SETTINGS.DEFAULTS.NUMBER_OF_DECKS,
  initialCutCardPosition: DECK_SETTINGS.DEFAULTS.CUT_CARD_POSITION,
  canModifySettings: true,
  shoeInitializer: undefined,
});

defineEmits<Emits>();

// =============================================================================
// STORE & COMPOSABLES
// =============================================================================

const visibilityStore = useVisibilityStore();
const { warning } = useNotifications();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getInfoPoints = (points: readonly string[], cutCardPosition: number): string[] => {
  return points.map(point => point.replace('{cutCardPosition}', cutCardPosition.toString()));
};

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleValidationError = (field: string, error: string) => {
  console.warn('[deck-settings-section][validation] Validation error occurred', {
    field,
    error,
  });

  warning(`Deck Settings: ${error}`);
};
</script>

<style scoped>
/* Deck Settings Section styling using design tokens */
.deck-settings-section {
  /* All styling comes from configuration and design tokens */
}
</style>
