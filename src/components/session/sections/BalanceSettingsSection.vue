<!-- Balance Settings Styled Section -->
<template>
  <BalanceSettings
    :initial-starting-balance="initialStartingBalance"
    :initial-use-previous-balance="initialUsePreviousBalance"
    :initial-previous-balance="initialPreviousBalance"
    :can-modify-balance="canModifyBalance"
    :previous-balance-loader="previousBalanceLoader"
    @update:starting-balance="$emit('update:startingBalance', $event)"
    @update:use-previous-balance="$emit('update:usePreviousBalance', $event)"
    @balance-change="$emit('balance-change', $event)"
    @validation-error="handleValidationError"
    @previous-balance-loaded="handlePreviousBalanceLoaded"
  >
    <template
      #default="{
        balanceState,
        constraints,
        actions,
        validation,
        config,
        onUpdateStartingBalance,
        onUpdateUsePreviousBalance,
        onGetPreviousBalance,
      }"
    >
      <!-- Balance Settings Section - EXACT UI PRESERVATION -->
      <div :class="config.styling.SECTION_CONTAINER">
        <div :class="config.styling.HEADER">
          <h3 :class="config.styling.TITLE">{{ config.labels.SECTION_TITLE }}</h3>
        </div>

        <div :class="config.styling.GRID">
          <!-- Starting Balance -->
          <div :class="config.styling.FIELD_CONTAINER">
            <label :class="config.styling.LABEL">{{ config.labels.STARTING_BALANCE }}</label>
            <div :class="config.styling.INPUT_WRAPPER">
              <span :class="config.styling.CURRENCY">{{ config.labels.CURRENCY_SYMBOL }}</span>
              <input
                :value="formatInitialValue(balanceState.startingBalance)"
                @input="
                  event =>
                    handleNumberInput(event, onUpdateStartingBalance, {
                      minValue: 1,
                      maxValue: 1000000000000,
                    })
                "
                @blur="
                  event =>
                    handleNumberBlur(event, onUpdateStartingBalance, {
                      minValue: 1,
                      defaultValue: 500,
                    })
                "
                :disabled="!actions.canModifyBalance"
                type="text"
                :class="config.styling.INPUT"
                :placeholder="config.labels.PLACEHOLDER"
              />
            </div>
            <div v-if="validation.startingBalanceError" :class="config.styling.VALIDATION_ERROR">
              {{ validation.startingBalanceError }}
            </div>
          </div>

          <!-- Use Previous End Balance -->
          <div :class="config.styling.FIELD_CONTAINER">
            <label :class="config.styling.LABEL">{{ config.labels.PREVIOUS_SESSION }}</label>
            <label :class="config.styling.CHECKBOX_LABEL">
              <input
                type="checkbox"
                id="usePreviousBalance"
                :checked="balanceState.usePreviousEndBalance"
                @change="
                  async event => {
                    const checked = (event.target as HTMLInputElement).checked;
                    await onUpdateUsePreviousBalance(checked);
                  }
                "
                :disabled="!actions.canModifyBalance || actions.isLoadingPreviousBalance"
                :class="config.styling.CHECKBOX"
              />
              <span :class="config.styling.CHECKBOX_TEXT">{{
                config.labels.USE_PREVIOUS_BALANCE
              }}</span>
            </label>
            <div v-if="balanceState.usePreviousEndBalance" :class="config.styling.PREVIOUS_BALANCE">
              Previous end balance: {{ config.labels.CURRENCY_SYMBOL
              }}{{ balanceState.previousEndBalance.toFixed(2) }}

              <!-- Manual Previous Balance Load Button -->
              <button
                @click="onGetPreviousBalance"
                :disabled="actions.isLoadingPreviousBalance"
                class="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                title="Refresh previous balance"
              >
                {{ actions.isLoadingPreviousBalance ? 'Loading...' : 'Refresh' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Balance Settings Information -->
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
                {{ config.infoPanel.CONTENT.BALANCE_MANAGEMENT.TITLE }}
              </div>
              <div v-for="point in config.infoPanel.CONTENT.BALANCE_MANAGEMENT.POINTS" :key="point">
                {{ point }}
              </div>
            </div>
            <div>
              <div :class="config.styling.INFO_SECTION_TITLE">
                {{ config.infoPanel.CONTENT.PROFESSIONAL_FEATURES.TITLE }}
              </div>
              <div
                v-for="point in config.infoPanel.CONTENT.PROFESSIONAL_FEATURES.POINTS"
                :key="point"
              >
                {{ point }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BalanceSettings>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue';
import { BalanceSettings } from '@/design-system/primitives/BalanceSettings';
import type { BalanceState } from '@/design-system/primitives/BalanceSettings';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { useNotifications } from '@/composables/useNotifications';
import InfoSectionToggleButton from '@/components/common/button/InfoSectionToggleButton.vue';
import { handleNumberInput, handleNumberBlur, formatInitialValue } from '@/utils/numberFormatting';
import { BALANCE_SETTINGS } from '@/config/sessionControlSettings';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface Props {
  initialStartingBalance?: number;
  initialUsePreviousBalance?: boolean;
  initialPreviousBalance?: number;
  canModifyBalance?: boolean;
  previousBalanceLoader?: () => Promise<number>;
}

interface Emits {
  'update:startingBalance': [balance: number];
  'update:usePreviousBalance': [usePrevious: boolean];
  'balance-change': [balanceState: BalanceState];
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

withDefaults(defineProps<Props>(), {
  initialStartingBalance: BALANCE_SETTINGS.DEFAULTS.STARTING_BALANCE,
  initialUsePreviousBalance: BALANCE_SETTINGS.DEFAULTS.USE_PREVIOUS_BALANCE,
  initialPreviousBalance: 0,
  canModifyBalance: true,
  previousBalanceLoader: undefined,
});

defineEmits<Emits>();

// =============================================================================
// STORE & COMPOSABLES
// =============================================================================

const visibilityStore = useVisibilityStore();
const { warning, success } = useNotifications();

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleValidationError = (field: string, error: string) => {
  console.warn('[balance-settings-section][validation] Validation error occurred', {
    field,
    error,
  });

  warning(`Balance Settings: ${error}`);
};

const handlePreviousBalanceLoaded = (balance: number) => {
  console.log('[balance-settings-section][success] Previous balance loaded', {
    balance,
  });

  success(`Previous session balance loaded: $${balance.toFixed(2)}`);
};
</script>

<style scoped>
/* Balance Settings Section styling using design tokens */
.balance-settings-section {
  /* All styling comes from configuration and design tokens */
}
</style>
