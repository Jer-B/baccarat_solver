<!-- Headless Session Control Primitive -->
<template>
  <component :is="element" :class="computedClass" :role="role" :aria-label="ariaLabel">
    <slot
      :sessionState="sessionState"
      :burnSettings="burnSettings"
      :deckSettings="deckSettings"
      :balanceSettings="balanceSettings"
      :sessionActions="sessionActions"
      :burnActions="burnActions"
      :deckActions="deckActions"
      :balanceActions="balanceActions"
      :sessionDuration="sessionDuration"
      :canPerformActions="canPerformActions"
      :totalCardsRemaining="totalCardsRemaining"
      :onStartSession="handleStartSession"
      :onEndSession="handleEndSession"
      :onManualBurn="handleManualBurn"
      :onUpdateAutoBurnEnabled="handleUpdateAutoBurnEnabled"
      :onUpdateAutoBurnCount="handleUpdateAutoBurnCount"
      :onUpdateManualBurnCount="handleUpdateManualBurnCount"
      :onUpdateNumberOfDecks="handleUpdateNumberOfDecks"
      :onUpdateCutCardPosition="handleUpdateCutCardPosition"
      :onInitializeShoe="handleInitializeShoe"
      :onUpdateStartingBalance="handleUpdateStartingBalance"
      :onUpdateUsePreviousBalance="handleUpdateUsePreviousBalance"
    />
  </component>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useNotifications } from '@/composables/useNotifications';
import { SESSION_DEFAULTS } from '@/config/gameSettings';

// Types
interface Props {
  element?: string;
  class?: string;
  role?: string;
  ariaLabel?: string;
  initialAutoBurnEnabled?: boolean;
  initialAutoBurnCount?: number;
  initialManualBurnCount?: number;
  initialStartingBalance?: number;
}

interface Emits {
  'session-start': [sessionState: SessionState];
  'session-end': [sessionState: SessionState];
  'manual-burn': [burnCount: number, cardsRemaining: number];
  'auto-burn': [burnCount: number, cardsRemaining: number];
  'settings-change': [settings: BurnSettings];
  'balance-change': [balanceSettings: BalanceSettings];
}

export interface SessionState {
  isActive: boolean;
  startTime: number | null;
  duration: string;
  status: 'inactive' | 'active';
}

export interface BurnSettings {
  autoBurnEnabled: boolean;
  autoBurnCount: number;
  manualBurnCount: number;
}

export interface SessionActions {
  canStart: boolean;
  canEnd: boolean;
  startLabel: string;
  endLabel: string;
}

export interface BurnActions {
  canManualBurn: boolean;
  canAutoBurn: boolean;
  manualBurnLabel: string;
  autoBurnLabel: string;
}

export interface DeckSettings {
  numberOfDecks: number;
  cutCardPosition: number;
}

export interface DeckActions {
  canModifySettings: boolean;
  initializeLabel: string;
  deckOptions: number[];
}

export interface BalanceSettings {
  startingBalance: number;
  usePreviousEndBalance: boolean;
  previousEndBalance: number;
}

export interface BalanceActions {
  canModifyBalance: boolean;
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  element: 'div',
  class: '',
  role: 'region',
  ariaLabel: 'Session Control',
  initialAutoBurnEnabled: SESSION_DEFAULTS.AUTO_BURN_ENABLED,
  initialAutoBurnCount: SESSION_DEFAULTS.AUTO_BURN_COUNT,
  initialManualBurnCount: SESSION_DEFAULTS.MANUAL_BURN_COUNT,
  initialStartingBalance: SESSION_DEFAULTS.STARTING_BALANCE,
});

// Emits
const emit = defineEmits<Emits>();

// Store and composables
const store = useBaccaratStore();
const { info, success, warning } = useNotifications();

// Reactive state
const autoBurnEnabled = ref(props.initialAutoBurnEnabled);
const autoBurnCount = ref(props.initialAutoBurnCount);
const manualBurnCount = ref(props.initialManualBurnCount);
const startingBalance = ref(props.initialStartingBalance);
const usePreviousEndBalance = ref(false);
const previousEndBalance = ref(0);
const sessionDuration = ref('00:00:00');

// Timer management
let durationInterval: NodeJS.Timeout | null = null;

// Computed properties
const computedClass = computed(() => props.class);

const sessionState = computed(
  (): SessionState => ({
    isActive: store.ui.sessionActive,
    startTime: store.ui.sessionStartTime,
    duration: sessionDuration.value,
    status: store.ui.sessionActive ? 'active' : 'inactive',
  })
);

const burnSettings = computed(
  (): BurnSettings => ({
    autoBurnEnabled: autoBurnEnabled.value,
    autoBurnCount: autoBurnCount.value,
    manualBurnCount: manualBurnCount.value,
  })
);

const sessionActions = computed(
  (): SessionActions => ({
    canStart: !store.ui.sessionActive,
    canEnd: store.ui.sessionActive,
    startLabel: 'Start Session',
    endLabel: 'End Session',
  })
);

const burnActions = computed(
  (): BurnActions => ({
    canManualBurn: store.canPerformActions && manualBurnCount.value > 0,
    canAutoBurn: autoBurnEnabled.value && autoBurnCount.value > 0,
    manualBurnLabel: '🔥 Burn Now',
    autoBurnLabel: `Auto burn ${autoBurnCount.value} cards`,
  })
);

const deckSettings = computed(
  (): DeckSettings => ({
    numberOfDecks: store.settings.numberOfDecks,
    cutCardPosition: store.settings.cutCardPosition,
  })
);

const deckActions = computed(
  (): DeckActions => ({
    canModifySettings: !store.ui.sessionActive, // Can only modify when session is inactive
    initializeLabel: 'New Shoe',
    deckOptions: [1, 2, 3, 4, 5, 6, 7, 8],
  })
);

const balanceSettings = computed(
  (): BalanceSettings => ({
    startingBalance: startingBalance.value,
    usePreviousEndBalance: usePreviousEndBalance.value,
    previousEndBalance: previousEndBalance.value,
  })
);

const balanceActions = computed(
  (): BalanceActions => ({
    canModifyBalance: !store.ui.sessionActive, // Can only modify when session is inactive
  })
);

const canPerformActions = computed(() => store.canPerformActions);

const totalCardsRemaining = computed(() => store.totalCardsRemaining);

// Helper functions
const formatSessionDuration = (): string => {
  if (!store.ui.sessionStartTime) {
    return '00:00:00';
  }

  const now = Date.now();
  const elapsed = now - store.ui.sessionStartTime;

  const hours = Math.floor(
    elapsed /
      (SESSION_DEFAULTS.MILLISECONDS_PER_SECOND *
        SESSION_DEFAULTS.SECONDS_PER_MINUTE *
        SESSION_DEFAULTS.MINUTES_PER_HOUR)
  );
  const minutes = Math.floor(
    (elapsed %
      (SESSION_DEFAULTS.MILLISECONDS_PER_SECOND *
        SESSION_DEFAULTS.SECONDS_PER_MINUTE *
        SESSION_DEFAULTS.MINUTES_PER_HOUR)) /
      (SESSION_DEFAULTS.MILLISECONDS_PER_SECOND * SESSION_DEFAULTS.SECONDS_PER_MINUTE)
  );
  const seconds = Math.floor(
    (elapsed % (SESSION_DEFAULTS.MILLISECONDS_PER_SECOND * SESSION_DEFAULTS.SECONDS_PER_MINUTE)) /
      SESSION_DEFAULTS.MILLISECONDS_PER_SECOND
  );

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const startDurationTimer = () => {
  if (durationInterval) {
    clearInterval(durationInterval);
  }

  // Update immediately
  sessionDuration.value = formatSessionDuration();

  durationInterval = setInterval(() => {
    sessionDuration.value = formatSessionDuration();
  }, SESSION_DEFAULTS.TIMER_UPDATE_INTERVAL);
};

const stopDurationTimer = () => {
  if (durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
  }
  sessionDuration.value = '00:00:00';
};

const performAutoBurn = () => {
  if (!autoBurnEnabled.value || autoBurnCount.value <= 0) {
    return;
  }

  if (autoBurnCount.value > store.totalCardsRemaining) {
    warning(
      `Cannot auto burn ${autoBurnCount.value} cards • Only ${store.totalCardsRemaining} remaining`
    );
    return;
  }

  console.log('[session-control][auto-burn] Performing automatic burn at session start', {
    burnCount: autoBurnCount.value,
    cardsRemaining: store.totalCardsRemaining,
  });

  store.burnUnknownCards(autoBurnCount.value);
  emit('auto-burn', autoBurnCount.value, store.totalCardsRemaining);

  success(
    `🔥 Auto burned ${autoBurnCount.value} cards at session start • ${store.totalCardsRemaining} remaining`
  );
};

// Event handlers
const handleStartSession = () => {
  console.log('[session-control][initialization] Starting session with burn settings', {
    autoBurnEnabled: autoBurnEnabled.value,
    autoBurnCount: autoBurnCount.value,
    currentCardsRemaining: store.totalCardsRemaining,
    startingBalance: startingBalance.value,
  });

  // Set the store balance from the balance settings
  store.ui.currentBalance = startingBalance.value;

  store.startSession();

  console.log('[session-control][initialization] Session started, cards after init', {
    cardsRemaining: store.totalCardsRemaining,
    aboutToAutoBurn: autoBurnEnabled.value && autoBurnCount.value > 0,
    startingBalance: startingBalance.value,
  });

  startDurationTimer();
  emit('session-start', sessionState.value);

  // Auto burn if enabled and count > 0
  if (autoBurnEnabled.value && autoBurnCount.value > 0) {
    console.log('[session-control][auto-burn] About to perform auto burn', {
      cardsBeforeBurn: store.totalCardsRemaining,
      burnCount: autoBurnCount.value,
    });
    performAutoBurn();
    console.log('[session-control][auto-burn] Auto burn completed', {
      cardsAfterBurn: store.totalCardsRemaining,
    });
  }
};

const handleEndSession = () => {
  console.log('[session-control][cleanup] Ending session', {
    endBalance: store.ui.currentBalance,
  });

  // Capture the end balance for next session
  previousEndBalance.value = store.ui.currentBalance;

  store.endSession();
  stopDurationTimer();
  emit('session-end', sessionState.value);
};

const handleManualBurn = () => {
  if (!store.canPerformActions || !manualBurnCount.value || manualBurnCount.value <= 0) {
    return;
  }

  if (manualBurnCount.value > store.totalCardsRemaining) {
    warning(
      `Cannot burn ${manualBurnCount.value} cards • Only ${store.totalCardsRemaining} remaining`
    );
    return;
  }

  console.log('[session-control][manual-burn] Performing manual burn', {
    burnCount: manualBurnCount.value,
    cardsRemaining: store.totalCardsRemaining,
  });

  store.burnUnknownCards(manualBurnCount.value);
  emit('manual-burn', manualBurnCount.value, store.totalCardsRemaining);

  info(
    `🔥 Burned ${manualBurnCount.value} cards manually • ${store.totalCardsRemaining} remaining`
  );

  // Reset manual burn count for next use
  manualBurnCount.value = SESSION_DEFAULTS.MANUAL_BURN_RESET_VALUE;
};

const handleUpdateAutoBurnEnabled = (enabled: boolean) => {
  autoBurnEnabled.value = enabled;
  emit('settings-change', burnSettings.value);
};

const handleUpdateAutoBurnCount = (count: number) => {
  autoBurnCount.value = Math.max(
    SESSION_DEFAULTS.MIN_BURN_COUNT,
    Math.min(SESSION_DEFAULTS.MAX_BURN_COUNT, count)
  );
  emit('settings-change', burnSettings.value);
};

const handleUpdateManualBurnCount = (count: number) => {
  manualBurnCount.value = Math.max(1, Math.min(SESSION_DEFAULTS.MAX_BURN_COUNT, count));
  emit('settings-change', burnSettings.value);
};

const handleUpdateNumberOfDecks = (numberOfDecks: number) => {
  store.settings.numberOfDecks = numberOfDecks;
  emit('settings-change', burnSettings.value);
};

const handleUpdateCutCardPosition = (cutCardPosition: number) => {
  store.settings.cutCardPosition = cutCardPosition;
  emit('settings-change', burnSettings.value);
};

const handleInitializeShoe = () => {
  store.initializeShoe();
};

const handleUpdateStartingBalance = (balance: number) => {
  startingBalance.value = balance;
  emit('balance-change', balanceSettings.value);
};

const handleUpdateUsePreviousBalance = (usePrevious: boolean) => {
  usePreviousEndBalance.value = usePrevious;
  emit('balance-change', balanceSettings.value);
};

// Lifecycle
onMounted(() => {
  if (store.ui.sessionActive && store.ui.sessionStartTime) {
    startDurationTimer();
  }
});

onBeforeUnmount(() => {
  stopDurationTimer();
});
</script>

<style scoped>
/* No styles - this is a headless component */
</style>
