<!-- Styled Session Control Component with CDD Sections -->
<template>
  <div :class="config.STYLING.MAIN_CONTAINER">
    <!-- Session Header -->
    <div :class="config.STYLING.HEADER_CONTAINER">
      <div :class="config.STYLING.HEADER_LEFT">
        <h2 :class="config.STYLING.TITLE">{{ config.LABELS.TITLE }}</h2>

        <!-- Session Status Indicator -->
        <div :class="config.STYLING.STATUS_CONTAINER">
          <div
            :class="[
              config.STYLING.STATUS_INDICATOR_BASE,
              gameStore.ui.sessionActive
                ? config.STYLING.STATUS_ACTIVE
                : config.STYLING.STATUS_INACTIVE,
            ]"
          ></div>
          <span
            :class="[
              config.STYLING.STATUS_TEXT_BASE,
              gameStore.ui.sessionActive
                ? config.STYLING.STATUS_TEXT_ACTIVE
                : config.STYLING.STATUS_TEXT_INACTIVE,
            ]"
          >
            {{
              gameStore.ui.sessionActive
                ? config.LABELS.STATUS_ACTIVE
                : config.LABELS.STATUS_INACTIVE
            }}
          </span>
        </div>

        <!-- Session Duration (if active) -->
        <div
          v-if="gameStore.ui.sessionActive && sessionDurationDisplay"
          :class="config.STYLING.DURATION_TEXT"
        >
          {{ config.LABELS.DURATION_PREFIX }} {{ sessionDurationDisplay }}
        </div>
      </div>

      <!-- Session Control Buttons -->
      <div :class="config.STYLING.BUTTON_CONTAINER">
        <button
          v-if="!gameStore.ui.sessionActive"
          @click="handleSessionStart"
          :disabled="!canStartSession"
          :class="config.STYLING.START_BUTTON"
        >
          <svg
            :class="config.STYLING.BUTTON_ICON"
            fill="none"
            stroke="currentColor"
            :viewBox="config.ICONS.START_SESSION.VIEWBOX"
          >
            <path
              v-for="(path, index) in config.ICONS.START_SESSION.PATHS"
              :key="index"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="path"
            ></path>
          </svg>
          <span>{{ config.LABELS.START_BUTTON }}</span>
        </button>

        <button
          v-if="gameStore.ui.sessionActive"
          @click="handleSessionEnd"
          :class="config.STYLING.END_BUTTON"
        >
          <svg
            :class="config.STYLING.BUTTON_ICON"
            fill="none"
            stroke="currentColor"
            :viewBox="config.ICONS.END_SESSION.VIEWBOX"
          >
            <path
              v-for="(path, index) in config.ICONS.END_SESSION.PATHS"
              :key="index"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="path"
            ></path>
          </svg>
          <span>{{ config.LABELS.END_BUTTON }}</span>
        </button>
      </div>
    </div>

    <!-- CDD Balance Settings Section -->
    <BalanceSettingsSection
      :initial-starting-balance="gameStore.ui.currentBalance"
      :initial-use-previous-balance="usePreviousEndBalance"
      :initial-previous-balance="previousEndBalance"
      :can-modify-balance="!gameStore.ui.sessionActive"
      :previous-balance-loader="loadPreviousBalance"
      @update:starting-balance="handleUpdateStartingBalance"
      @update:use-previous-balance="handleUpdateUsePreviousBalance"
      @balance-change="handleBalanceChange"
    />

    <!-- CDD Deck Settings Section -->
    <DeckSettingsSection
      :initial-number-of-decks="gameStore.settings.numberOfDecks"
      :initial-cut-card-position="gameStore.settings.cutCardPosition"
      :can-modify-settings="!gameStore.ui.sessionActive"
      :shoe-initializer="handleInitializeShoe"
      @update:number-of-decks="handleUpdateNumberOfDecks"
      @update:cut-card-position="handleUpdateCutCardPosition"
      @deck-change="handleDeckChange"
      @initialize-shoe="handleInitializeShoe"
    />

    <!-- CDD Burn Settings Section -->
    <BurnSettingsSection
      :initial-auto-burn-enabled="autoBurnEnabled"
      :initial-auto-burn-count="autoBurnCount"
      :initial-manual-burn-count="manualBurnCount"
      :can-perform-actions="gameStore.ui.sessionActive"
      :total-cards-remaining="totalCardsRemaining"
      :manual-burn-executor="executeManualBurn"
      :auto-burn-executor="executeAutoBurn"
      @update:auto-burn-enabled="handleUpdateAutoBurnEnabled"
      @update:auto-burn-count="handleUpdateAutoBurnCount"
      @update:manual-burn-count="handleUpdateManualBurnCount"
      @manual-burn="handleManualBurn"
      @auto-burn="handleAutoBurn"
      @burn-change="handleBurnChange"
    />

    <!-- CDD Payout Settings Section -->
    <PayoutSettingsSection
      :initial-payout-values="initialPayoutValues"
      :selected-preset-id="selectedPayoutPresetId"
      :enable-preset-management="true"
      :enable-manual-editing="!gameStore.ui.sessionActive"
      :show-payout-examples="true"
      :show-preset-info="true"
      :example-bet-amount="exampleBetAmount"
      :presets-loading="payoutPresetsLoading"
      :saving-preset="savingPayoutPreset"
      :validation-errors="payoutValidationErrors"
      :preset-error="payoutPresetError"
      @payout-change="handlePayoutChange"
      @manual-value-change="handlePayoutManualValueChange"
      @preset-selected="handlePayoutPresetSelected"
      @preset-created="handlePayoutPresetCreated"
      @preset-updated="handlePayoutPresetUpdated"
      @preset-deleted="handlePayoutPresetDeleted"
      @default-preset-changed="handlePayoutDefaultPresetChanged"
      @reset-to-defaults="handlePayoutResetToDefaults"
      @validation-error="handlePayoutValidationError"
      @validation-success="handlePayoutValidationSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, watch } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useNotifications } from '@/composables/useNotifications';
import { SESSION_CONTROL, SESSION_CONTROL_DEFAULTS } from '@/config/sessionControlSettings';
import { PAYOUT_SETTINGS_DEFAULTS } from '@/config/payoutSettings';

// Session Control Sections
import BalanceSettingsSection from './sections/BalanceSettingsSection.vue';
import DeckSettingsSection from './sections/DeckSettingsSection.vue';
import BurnSettingsSection from './sections/BurnSettingsSection.vue';
import PayoutSettingsSection from './sections/PayoutSettingsSection.vue';

// Design System Types
import type { BalanceState } from '@/design-system/primitives/BalanceSettings';
import type { DeckState } from '@/design-system/primitives/DeckSettings';
import type { BurnState } from '@/design-system/primitives/BurnSettings';
import type { PayoutValues, PayoutChangeEvent, ValidationError } from '@/config/payoutSettings';
import type { PayoutPreset } from '@/services/payoutPresetService';

// =============================================================================
// EMITS INTERFACE
// =============================================================================

interface Emits {
  'session-start': [];
  'session-end': [];
  'auto-burn': [burnCount: number, cardsRemaining: number];
  'manual-burn': [burnCount: number, cardsRemaining: number];
  'settings-change': [settings: SessionSettings];
  'balance-change': [balanceState: BalanceState];
  'payout-change': [event: PayoutChangeEvent];
}

interface SessionSettings {
  numberOfDecks: number;
  cutCardPosition: number;
  autoBurnEnabled: boolean;
  autoBurnCount: number;
  startingBalance: number;
  usePreviousEndBalance: boolean;
  // Add payout settings to the session settings
  payoutValues: PayoutValues;
  selectedPayoutPresetId?: string | null;
}

// =============================================================================
// COMPONENT SETUP
// =============================================================================

const emit = defineEmits<Emits>();

// =============================================================================
// STORES & COMPOSABLES
// =============================================================================

const gameStore = useBaccaratStore();
const { success, error: showError } = useNotifications();

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = SESSION_CONTROL;
const defaults = SESSION_CONTROL_DEFAULTS;

// =============================================================================
// LOCAL STATE FOR SESSION SETTINGS (NOW CONFIGURATION-DRIVEN)
// =============================================================================

// These properties don't exist in the store, so we manage them locally with configuration defaults
const usePreviousEndBalance = ref(defaults.SESSION_STATE.USE_PREVIOUS_END_BALANCE);
const previousEndBalance = ref(defaults.SESSION_STATE.PREVIOUS_END_BALANCE);
const autoBurnEnabled = ref(defaults.SESSION_STATE.AUTO_BURN_ENABLED);
const autoBurnCount = ref(defaults.SESSION_STATE.AUTO_BURN_COUNT);
const manualBurnCount = ref(defaults.SESSION_STATE.MANUAL_BURN_COUNT);

// Payout Settings State
const initialPayoutValues = ref<Partial<PayoutValues>>({});
const selectedPayoutPresetId = ref<string | null>(null);
const exampleBetAmount = ref(PAYOUT_SETTINGS_DEFAULTS.EXAMPLE_BET_AMOUNT);
const payoutPresetsLoading = ref(false);
const savingPayoutPreset = ref(false);
const payoutValidationErrors = ref<ValidationError[]>([]);
const payoutPresetError = ref<string | null>(null);
const currentPayoutValues = ref<PayoutValues>({
  player_payout: PAYOUT_SETTINGS_DEFAULTS.PLAYER_PAYOUT,
  banker_payout: PAYOUT_SETTINGS_DEFAULTS.BANKER_PAYOUT,
  banker_commission: PAYOUT_SETTINGS_DEFAULTS.BANKER_COMMISSION,
  tie_payout: PAYOUT_SETTINGS_DEFAULTS.TIE_PAYOUT,
  player_pair_payout: PAYOUT_SETTINGS_DEFAULTS.PLAYER_PAIR_PAYOUT,
  banker_pair_payout: PAYOUT_SETTINGS_DEFAULTS.BANKER_PAIR_PAYOUT,
});

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const canStartSession = computed(() => {
  return (
    !gameStore.ui.sessionActive &&
    gameStore.ui.currentBalance > defaults.VALIDATION.MIN_BALANCE_FOR_START
  );
});

// Real-time session duration
const sessionDurationDisplay = ref('0:00');
let sessionTimer: ReturnType<typeof setInterval> | null = null;

const totalCardsRemaining = computed(() => {
  return gameStore.shoe.totalCards - gameStore.shoe.cardsDealt;
});

// =============================================================================
// SESSION MANAGEMENT HANDLERS
// =============================================================================

const handleSessionStart = () => {
  console.log('[session-control][action] Starting session', {
    numberOfDecks: gameStore.settings.numberOfDecks,
    cutCardPosition: gameStore.settings.cutCardPosition,
    startingBalance: gameStore.ui.currentBalance,
    autoBurnEnabled: autoBurnEnabled.value,
    autoBurnCount: autoBurnCount.value,
    payoutValues: currentPayoutValues.value,
    selectedPayoutPresetId: selectedPayoutPresetId.value,
  });

  try {
    gameStore.startSession();

    // Perform auto burn if enabled
    if (autoBurnEnabled.value && autoBurnCount.value > 0) {
      handleAutoBurn(autoBurnCount.value, totalCardsRemaining.value - autoBurnCount.value);
    }

    // Timer will start automatically via watcher
    emit('session-start');
    success('Session started successfully!');

    console.log('[session-control][success] Session started successfully', {
      sessionId: gameStore.ui.currentSessionId,
      isActive: gameStore.ui.sessionActive,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to start session';
    console.error('[session-control][error] Session start failed', { error: errorMessage });
    showError(`Failed to start session: ${errorMessage}`);
  }
};

const handleSessionEnd = () => {
  console.log('[session-control][action] Ending session', {
    sessionId: gameStore.ui.currentSessionId,
    duration: gameStore.ui.sessionStartTime ? Date.now() - gameStore.ui.sessionStartTime : 0,
  });

  try {
    gameStore.endSession();

    // Timer will stop automatically via watcher
    emit('session-end');
    success('Session ended successfully!');

    console.log('[session-control][success] Session ended successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to end session';
    console.error('[session-control][error] Session end failed', { error: errorMessage });
    showError(`Failed to end session: ${errorMessage}`);
  }
};

// =============================================================================
// BALANCE HANDLERS
// =============================================================================

const handleUpdateStartingBalance = (balance: number) => {
  console.log('[session-control][update] Updating starting balance', {
    previousBalance: gameStore.ui.currentBalance,
    newBalance: balance,
  });

  // Update the store's current balance
  gameStore.ui.currentBalance = balance;
  emitSettingsChange();
};

const handleUpdateUsePreviousBalance = (usePrevious: boolean) => {
  console.log('[session-control][update] Updating use previous balance', {
    previousUsePrevious: usePreviousEndBalance.value,
    newUsePrevious: usePrevious,
  });

  usePreviousEndBalance.value = usePrevious;
  emitSettingsChange();
};

const handleBalanceChange = (balanceState: BalanceState) => {
  console.log('[session-control][change] Balance state changed', balanceState);
  emit('balance-change', balanceState);
  emitSettingsChange();
};

const loadPreviousBalance = async (): Promise<number> => {
  console.log('[session-control][loader] Loading previous balance');

  // This is a placeholder implementation
  // In a real application, this would fetch the balance from the last session

  // For now, return the stored previous balance or fallback
  return previousEndBalance.value || config.FALLBACKS.BALANCE;
};

// =============================================================================
// DECK HANDLERS
// =============================================================================

const handleUpdateNumberOfDecks = (numberOfDecks: number) => {
  console.log('[session-control][update] Updating number of decks', {
    previousDecks: gameStore.settings.numberOfDecks,
    newDecks: numberOfDecks,
  });

  gameStore.updateSettings({ numberOfDecks });
  emitSettingsChange();
};

const handleUpdateCutCardPosition = (cutCardPosition: number) => {
  console.log('[session-control][update] Updating cut card position', {
    previousPosition: gameStore.settings.cutCardPosition,
    newPosition: cutCardPosition,
  });

  gameStore.updateSettings({ cutCardPosition });
  emitSettingsChange();
};

const handleDeckChange = (deckState: DeckState) => {
  console.log('[session-control][change] Deck state changed', deckState);
  emitSettingsChange();
};

const handleInitializeShoe = () => {
  console.log('[session-control][action] Initializing new shoe');

  try {
    gameStore.initializeShoe();
    success('New shoe initialized successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize shoe';
    console.error('[session-control][error] Shoe initialization failed', { error: errorMessage });
    showError(`Failed to initialize shoe: ${errorMessage}`);
  }
};

// =============================================================================
// BURN HANDLERS
// =============================================================================

const handleUpdateAutoBurnEnabled = (enabled: boolean) => {
  console.log('[session-control][update] Updating auto burn enabled', {
    previousEnabled: autoBurnEnabled.value,
    newEnabled: enabled,
  });

  autoBurnEnabled.value = enabled;
  emitSettingsChange();
};

const handleUpdateAutoBurnCount = (count: number) => {
  console.log('[session-control][update] Updating auto burn count', {
    previousCount: autoBurnCount.value,
    newCount: count,
  });

  autoBurnCount.value = count;
  emitSettingsChange();
};

const handleUpdateManualBurnCount = (count: number) => {
  console.log('[session-control][update] Updating manual burn count', {
    previousCount: manualBurnCount.value,
    newCount: count,
  });

  manualBurnCount.value = count;
};

const handleManualBurn = (burnCount: number, cardsRemaining: number) => {
  console.log('[session-control][action] Manual burn completed', {
    burnCount,
    cardsRemaining,
  });

  emit('manual-burn', burnCount, cardsRemaining);
  success(`Manually burned ${burnCount} cards. ${cardsRemaining} cards remaining.`);
};

const handleAutoBurn = (burnCount: number, cardsRemaining: number) => {
  console.log('[session-control][action] Auto burn completed', {
    burnCount,
    cardsRemaining,
  });

  emit('auto-burn', burnCount, cardsRemaining);
  success(`Auto burned ${burnCount} cards at session start.`);
};

const handleBurnChange = (burnState: BurnState) => {
  console.log('[session-control][change] Burn state changed', burnState);
  emitSettingsChange();
};

const executeManualBurn = async (count: number): Promise<void> => {
  console.log('[session-control][execution] Executing manual burn', { count });

  // Execute the actual burn using the store's method
  gameStore.burnUnknownCards(count);
};

const executeAutoBurn = async (count: number): Promise<void> => {
  console.log('[session-control][execution] Executing auto burn', { count });

  // Execute the actual burn using the store's method
  gameStore.burnUnknownCards(count);
};

// =============================================================================
// PAYOUT SETTINGS HANDLERS
// =============================================================================

const handlePayoutChange = (event: PayoutChangeEvent) => {
  console.log('[session-control][change] Payout values changed', {
    source: event.source,
    presetId: event.presetId,
    presetName: event.presetName,
    values: event.values,
  });

  // Update local payout values
  currentPayoutValues.value = { ...event.values };

  // If preset was selected, update the selected preset ID
  if (event.source === 'preset' && event.presetId) {
    selectedPayoutPresetId.value = event.presetId;
  } else if (event.source === 'manual' || event.source === 'reset') {
    // Clear preset selection when manually editing or resetting
    selectedPayoutPresetId.value = null;
  }

  emit('payout-change', event);
  emitSettingsChange();
  success('Payout settings updated!');
};

const handlePayoutManualValueChange = (field: keyof PayoutValues, value: number) => {
  console.log('[session-control][update] Payout manual value changed', {
    field,
    value,
  });

  // Update the current payout values
  currentPayoutValues.value[field] = value;

  // Clear preset selection since we're manually editing
  selectedPayoutPresetId.value = null;

  emitSettingsChange();
};

const handlePayoutPresetSelected = (preset: PayoutPreset) => {
  console.log('[session-control][action] Payout preset selected', {
    presetId: preset.id,
    presetName: preset.name,
  });

  selectedPayoutPresetId.value = preset.id;
  emitSettingsChange();
  success(`Selected ${preset.name} payout preset!`);
};

const handlePayoutPresetCreated = (presetData: { name: string; values: PayoutValues }) => {
  console.log('[session-control][action] Payout preset created', {
    name: presetData.name,
  });

  success(`Created custom preset: ${presetData.name}!`);
};

const handlePayoutPresetUpdated = (presetId: string, updates: Partial<PayoutValues>) => {
  console.log('[session-control][action] Payout preset updated', {
    presetId,
    updates,
  });

  success('Payout preset updated successfully!');
};

const handlePayoutPresetDeleted = (presetId: string) => {
  console.log('[session-control][action] Payout preset deleted', {
    presetId,
  });

  // If the deleted preset was selected, clear the selection
  if (selectedPayoutPresetId.value === presetId) {
    selectedPayoutPresetId.value = null;
  }

  success('Custom preset deleted successfully!');
};

const handlePayoutDefaultPresetChanged = (presetId: string) => {
  console.log('[session-control][action] Payout default preset changed', {
    presetId,
  });

  success('Default preset updated successfully!');
};

const handlePayoutResetToDefaults = () => {
  console.log('[session-control][action] Payout settings reset to defaults');

  selectedPayoutPresetId.value = null;
  emitSettingsChange();
  success('Payout settings reset to defaults!');
};

const handlePayoutValidationError = (errors: ValidationError[]) => {
  console.log('[session-control][error] Payout validation errors', {
    errorCount: errors.length,
    fields: errors.map(e => e.field),
  });

  payoutValidationErrors.value = errors;

  const errorMessages = errors.map(e => `${e.field}: ${e.message}`);
  showError(`Payout validation errors: ${errorMessages.join(', ')}`);
};

const handlePayoutValidationSuccess = () => {
  console.log('[session-control][success] Payout validation success');

  payoutValidationErrors.value = [];
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const emitSettingsChange = () => {
  const settings: SessionSettings = {
    numberOfDecks: gameStore.settings.numberOfDecks,
    cutCardPosition: gameStore.settings.cutCardPosition,
    autoBurnEnabled: autoBurnEnabled.value,
    autoBurnCount: autoBurnCount.value,
    startingBalance: gameStore.ui.currentBalance,
    usePreviousEndBalance: usePreviousEndBalance.value,
    payoutValues: currentPayoutValues.value,
    selectedPayoutPresetId: selectedPayoutPresetId.value,
  };

  console.log('[session-control][change] Settings changed', settings);
  emit('settings-change', settings);
};

// =============================================================================
// REAL-TIME TIMER FUNCTIONS
// =============================================================================

const updateSessionDuration = () => {
  if (!gameStore.ui.sessionActive || !gameStore.ui.sessionStartTime) {
    sessionDurationDisplay.value = '0:00';
    return;
  }

  const now = Date.now();
  const elapsed = now - gameStore.ui.sessionStartTime;
  const totalSeconds = Math.floor(elapsed / config.TIMING.MILLISECONDS_PER_SECOND);
  const minutes = Math.floor(totalSeconds / config.TIMING.SECONDS_PER_MINUTE);
  const seconds = totalSeconds % config.TIMING.SECONDS_PER_MINUTE;

  sessionDurationDisplay.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const startSessionTimer = () => {
  if (gameStore.ui.sessionActive && !sessionTimer) {
    updateSessionDuration(); // Initial update
    sessionTimer = setInterval(updateSessionDuration, 1000);
  }
};

const stopSessionTimer = () => {
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
};

// =============================================================================
// LIFECYCLE AND WATCHERS
// =============================================================================

// Watch session state to manage timer
watch(
  () => gameStore.ui.sessionActive,
  isActive => {
    if (isActive) {
      startSessionTimer();
    } else {
      stopSessionTimer();
      sessionDurationDisplay.value = '0:00';
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  stopSessionTimer();
});
</script>

<style scoped>
/* Session Control styling using configuration-driven classes */
.session-control {
  /* All styling comes from SESSION_CONTROL configuration */
}
</style>
