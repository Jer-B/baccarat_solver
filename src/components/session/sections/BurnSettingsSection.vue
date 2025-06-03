<!-- Burn Settings Styled Section -->
<template>
  <BurnSettings
    :initial-auto-burn-enabled="initialAutoBurnEnabled"
    :initial-auto-burn-count="initialAutoBurnCount"
    :initial-manual-burn-count="initialManualBurnCount"
    :can-perform-actions="canPerformActions"
    :total-cards-remaining="totalCardsRemaining"
    :manual-burn-executor="manualBurnExecutor"
    :auto-burn-executor="autoBurnExecutor"
    @update:auto-burn-enabled="$emit('update:autoBurnEnabled', $event)"
    @update:auto-burn-count="$emit('update:autoBurnCount', $event)"
    @update:manual-burn-count="$emit('update:manualBurnCount', $event)"
    @manual-burn="(...args) => $emit('manual-burn', ...args)"
    @auto-burn="(...args) => $emit('auto-burn', ...args)"
    @burn-change="$emit('burn-change', $event)"
    @validation-error="handleValidationError"
  >
    <template
      #default="{
        burnState,
        constraints,
        actions,
        validation,
        config,
        statusMessage,
        onUpdateAutoBurnEnabled,
        onUpdateAutoBurnCount,
        onUpdateManualBurnCount,
        onManualBurn,
        onAutoBurn,
      }"
    >
      <!-- Burn Settings Section - EXACT UI PRESERVATION -->
      <div :class="config.styling.SECTION_CONTAINER">
        <div :class="config.styling.HEADER">
          <h3 :class="config.styling.TITLE">{{ config.labels.SECTION_TITLE }}</h3>
        </div>
        <p :class="config.styling.SUBTITLE">{{ config.labels.SECTION_SUBTITLE }}</p>

        <!-- Auto Burn Settings -->
        <div :class="config.styling.AUTO_BURN_CONTAINER">
          <div :class="config.styling.AUTO_BURN_CONTROLS">
            <label :class="config.styling.CHECKBOX_LABEL">
              <input
                type="checkbox"
                :checked="burnState.autoBurnEnabled"
                @change="onUpdateAutoBurnEnabled(($event.target as HTMLInputElement).checked)"
                :disabled="!actions.canModifySettings"
                :class="config.styling.CHECKBOX"
              />
              <span :class="config.styling.CHECKBOX_TEXT">{{ config.labels.AUTO_BURN_LABEL }}</span>
            </label>
            <div :class="config.styling.INPUT_CONTROLS">
              <input
                :value="burnState.autoBurnCount"
                @input="onUpdateAutoBurnCount(Number(($event.target as HTMLInputElement).value))"
                :disabled="!burnState.autoBurnEnabled || !actions.canModifySettings"
                type="number"
                :min="constraints.minBurnCount"
                :max="constraints.maxBurnCount"
                :class="config.styling.COUNT_INPUT"
                :placeholder="config.labels.PLACEHOLDER_AUTO"
              />
              <span :class="config.styling.UNIT_LABEL">{{ config.labels.CARDS_UNIT }}</span>
            </div>
            <div :class="config.styling.STATUS_TEXT">{{ statusMessage }}</div>
          </div>
          <div v-if="validation.autoBurnCountError" :class="config.styling.VALIDATION_ERROR">
            {{ validation.autoBurnCountError }}
          </div>
        </div>

        <!-- Manual Burn Section -->
        <div :class="config.styling.MANUAL_SECTION">
          <div :class="config.styling.MANUAL_CONTROLS">
            <label :class="config.styling.MANUAL_LABEL">{{
              config.labels.MANUAL_BURN_LABEL
            }}</label>
            <input
              :value="burnState.manualBurnCount"
              @input="onUpdateManualBurnCount(Number(($event.target as HTMLInputElement).value))"
              :disabled="!actions.canPerformActions"
              type="number"
              :min="constraints.minManualBurn"
              :max="constraints.maxBurnCount"
              :class="config.styling.MANUAL_INPUT"
              :placeholder="config.labels.PLACEHOLDER_MANUAL"
              :title="config.labels.TOOLTIP_MANUAL"
            />
            <button
              @click="onManualBurn"
              :disabled="!burnState.canManualBurn || actions.isExecutingManualBurn"
              :class="
                burnState.canManualBurn && !actions.isExecutingManualBurn
                  ? config.styling.BURN_BUTTON_ENABLED
                  : config.styling.BURN_BUTTON_DISABLED
              "
            >
              {{ config.labels.BURN_BUTTON }}
            </button>
          </div>
          <div :class="config.styling.CARDS_REMAINING">
            {{ config.labels.CARDS_REMAINING.replace('{count}', totalCardsRemaining.toString()) }}
          </div>
          <div v-if="validation.manualBurnCountError" :class="config.styling.VALIDATION_ERROR">
            {{ validation.manualBurnCountError }}
          </div>
        </div>

        <!-- Burn Settings Information -->
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
                {{ config.infoPanel.CONTENT.AUTO_BURN_FEATURES.TITLE }}
              </div>
              <div v-for="point in config.infoPanel.CONTENT.AUTO_BURN_FEATURES.POINTS" :key="point">
                {{ point }}
              </div>
            </div>
            <div>
              <div :class="config.styling.INFO_SECTION_TITLE">
                {{ config.infoPanel.CONTENT.PROFESSIONAL_TRACKING.TITLE }}
              </div>
              <div
                v-for="point in config.infoPanel.CONTENT.PROFESSIONAL_TRACKING.POINTS"
                :key="point"
              >
                {{ point }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BurnSettings>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue';
import { BurnSettings } from '@/design-system/primitives/BurnSettings';
import type { BurnState } from '@/design-system/primitives/BurnSettings';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { useNotifications } from '@/composables/useNotifications';
import InfoSectionToggleButton from '@/components/common/button/InfoSectionToggleButton.vue';
import { BURN_SETTINGS } from '@/config/sessionControlSettings';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface Props {
  initialAutoBurnEnabled?: boolean;
  initialAutoBurnCount?: number;
  initialManualBurnCount?: number;
  canPerformActions?: boolean;
  totalCardsRemaining?: number;
  manualBurnExecutor?: (count: number) => Promise<void>;
  autoBurnExecutor?: (count: number) => Promise<void>;
}

interface Emits {
  'update:autoBurnEnabled': [enabled: boolean];
  'update:autoBurnCount': [count: number];
  'update:manualBurnCount': [count: number];
  'manual-burn': [burnCount: number, cardsRemaining: number];
  'auto-burn': [burnCount: number, cardsRemaining: number];
  'burn-change': [burnState: BurnState];
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

withDefaults(defineProps<Props>(), {
  initialAutoBurnEnabled: BURN_SETTINGS.DEFAULTS.AUTO_BURN_ENABLED,
  initialAutoBurnCount: BURN_SETTINGS.DEFAULTS.AUTO_BURN_COUNT,
  initialManualBurnCount: BURN_SETTINGS.DEFAULTS.MANUAL_BURN_COUNT,
  canPerformActions: true,
  totalCardsRemaining: 416, // 8 decks default
  manualBurnExecutor: undefined,
  autoBurnExecutor: undefined,
});

defineEmits<Emits>();

// =============================================================================
// STORE & COMPOSABLES
// =============================================================================

const visibilityStore = useVisibilityStore();
const { warning } = useNotifications();

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleValidationError = (field: string, error: string) => {
  console.warn('[burn-settings-section][validation] Validation error occurred', {
    field,
    error,
  });

  warning(`Burn Settings: ${error}`);
};
</script>

<style scoped>
/* Burn Settings Section styling using design tokens */
.burn-settings-section {
  /* All styling comes from configuration and design tokens */
}
</style>
