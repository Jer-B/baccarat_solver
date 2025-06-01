import { reactive, computed, watch, inject } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useNotifications } from '@/composables/useNotifications';

export type GameSequenceStep =
  | 'session_inactive'
  | 'ready_to_bet'
  | 'bet_placed'
  | 'drawing_cards'
  | 'round_complete'
  | 'round_result';

interface GameSequenceState {
  currentStep: GameSequenceStep;
  previousStep: GameSequenceStep | null;
  stepHistory: GameSequenceStep[];
  autoCompleteEnabled: boolean;
}

export function useGameSequence() {
  const store = useBaccaratStore();
  const { info, success, warning } = useNotifications();

  // Inject the current round bet state from App.vue
  const currentRoundBet = inject('currentRoundBet') as {
    hasBet: boolean;
    betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null;
    betAmount: number;
  } | null;

  const state = reactive<GameSequenceState>({
    currentStep: 'session_inactive',
    previousStep: null,
    stepHistory: [],
    autoCompleteEnabled: false,
  });

  const getCurrentRoundBet = () => {
    // Access the actual betting state from the injection system
    const hasBet = currentRoundBet?.hasBet || false;
    const totalCards = store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length;

    return {
      hasBet,
      totalCards,
    };
  };

  // Determine current step based on game state
  const determineCurrentStep = (): GameSequenceStep => {
    if (!store.ui.sessionActive) {
      return 'session_inactive';
    }

    const roundBet = getCurrentRoundBet();
    const totalCards = roundBet.totalCards;
    const hasBet = roundBet.hasBet;

    console.log('[game-sequence][determine-step] Determining current step', {
      sessionActive: store.ui.sessionActive,
      hasBet,
      totalCards,
      currentStep: state.currentStep,
    });

    // Session is active
    if (totalCards === 0 && !hasBet) {
      // No cards on table and no bet placed - ready to bet
      return 'ready_to_bet';
    } else if (totalCards === 0 && hasBet) {
      // Bet placed but no cards drawn yet
      return 'bet_placed';
    } else if (totalCards > 0 && totalCards < 6) {
      // Cards on table but not complete
      return 'drawing_cards';
    } else if (totalCards === 6) {
      // Maximum cards reached
      return 'round_complete';
    }

    return 'ready_to_bet';
  };

  // Update current step and handle transitions
  const updateStep = (newStep: GameSequenceStep, skipToast = false) => {
    const oldStep = state.currentStep;

    if (oldStep === newStep) {
      return; // No change
    }

    state.previousStep = oldStep;
    state.currentStep = newStep;
    state.stepHistory.push(newStep);

    console.log('[game-sequence] Step transition', {
      from: oldStep,
      to: newStep,
      skipToast,
    });

    // Show toast notification for step transitions
    if (!skipToast) {
      showStepToast(newStep, oldStep);
    }
  };

  // Show appropriate toast for step transition
  const showStepToast = (step: GameSequenceStep, previousStep: GameSequenceStep | null) => {
    switch (step) {
      case 'ready_to_bet':
        if (previousStep === 'session_inactive') {
          info('🎯 Session started! Place your bet to begin.', { timeout: 4000 });
        } else if (previousStep === 'round_result') {
          info('💰 Ready for next round! Place your bet.', { timeout: 3000 });
        }
        break;

      case 'bet_placed':
        success('✅ Bet placed! Start selecting cards.', { timeout: 3000 });
        break;

      case 'drawing_cards':
        const totalCards =
          store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length;
        if (totalCards === 4) {
          info("🃏 4 cards drawn. Continue if dealer hasn't stopped, or complete round.", {
            timeout: 4000,
          });
        } else if (totalCards === 6 && !state.autoCompleteEnabled) {
          warning('🚨 6 cards drawn! Hand is full - complete the round.', { timeout: 5000 });
        }
        break;

      case 'round_complete':
        if (!state.autoCompleteEnabled) {
          info('🏁 Round completed! Processing results...', { timeout: 3000 });
        }
        break;

      case 'round_result':
        // This will be called separately with the actual result
        break;
    }
  };

  // Show round result toast
  const showRoundResult = (result: string) => {
    updateStep('round_result', true); // Skip automatic toast for this step
    success(`🎲 Round Result: ${result}`, { timeout: 5000 });
  };

  // Manual step triggers
  const onBetPlaced = () => {
    updateStep('bet_placed');
  };

  const onCardDrawn = () => {
    const totalCards = store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length;

    if (totalCards > 0) {
      updateStep('drawing_cards');

      // Auto-complete on 6th card if enabled
      if (totalCards === 6 && state.autoCompleteEnabled) {
        setTimeout(() => {
          updateStep('round_complete');
          // Trigger auto complete - this would need to be handled by the parent component
          console.log('[game-sequence] Auto-completing round with 6 cards');
        }, 500);
      }
    }
  };

  const onRoundCompleted = () => {
    updateStep('round_complete');
  };

  const onSessionStarted = () => {
    updateStep('ready_to_bet');
  };

  const onSessionEnded = () => {
    updateStep('session_inactive');
  };

  // Reset sequence state
  const resetSequence = () => {
    state.stepHistory = [];
    state.previousStep = null;
    updateStep(determineCurrentStep(), true);
  };

  // Watch for game state changes
  watch(
    () => [
      store.ui.sessionActive,
      store.shoe.currentHand.player.length,
      store.shoe.currentHand.banker.length,
      currentRoundBet?.hasBet,
      currentRoundBet?.betType,
    ],
    () => {
      const expectedStep = determineCurrentStep();
      if (expectedStep !== state.currentStep) {
        console.log('[game-sequence][watcher] State change detected, updating step', {
          from: state.currentStep,
          to: expectedStep,
          sessionActive: store.ui.sessionActive,
          hasBet: currentRoundBet?.hasBet,
          totalCards: store.shoe.currentHand.player.length + store.shoe.currentHand.banker.length,
        });
        updateStep(expectedStep, true); // Skip toast for automatic updates
      }
    },
    { immediate: true, deep: true }
  );

  // Computed properties for UI
  const stepDisplay = computed(() => {
    switch (state.currentStep) {
      case 'session_inactive':
        return { text: 'Start Session', color: 'gray', bgColor: 'bg-gray-100' };
      case 'ready_to_bet':
        return { text: 'Place Bet', color: 'blue', bgColor: 'bg-blue-100' };
      case 'bet_placed':
        return { text: 'Bet Placed', color: 'green', bgColor: 'bg-green-100' };
      case 'drawing_cards':
        return { text: 'Drawing Cards', color: 'yellow', bgColor: 'bg-yellow-100' };
      case 'round_complete':
        return { text: 'Complete Round', color: 'orange', bgColor: 'bg-orange-100' };
      case 'round_result':
        return { text: 'Round Result', color: 'purple', bgColor: 'bg-purple-100' };
      default:
        return { text: 'Unknown', color: 'gray', bgColor: 'bg-gray-100' };
    }
  });

  const canBet = computed(() => state.currentStep === 'ready_to_bet');
  const canDrawCards = computed(() => ['bet_placed', 'drawing_cards'].includes(state.currentStep));
  const canCompleteRound = computed(() => state.currentStep === 'drawing_cards');

  return {
    // State
    state,
    stepDisplay,

    // Computed
    canBet,
    canDrawCards,
    canCompleteRound,

    // Methods
    updateStep,
    onBetPlaced,
    onCardDrawn,
    onRoundCompleted,
    onSessionStarted,
    onSessionEnded,
    showRoundResult,
    resetSequence,

    // Auto-complete toggle
    setAutoComplete: (enabled: boolean) => {
      state.autoCompleteEnabled = enabled;
      console.log('[game-sequence] Auto-complete', enabled ? 'enabled' : 'disabled');
    },
  };
}
