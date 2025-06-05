import { reactive, computed, onMounted, onUnmounted } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useNotifications } from '@/composables/useNotifications';
import { BettingService } from '@/services/bettingService';
import type { HandResult } from '@/types/cards';
import type { BetResult } from '@/services/bettingService';
import type { PayoutValues } from '@/config/payoutSettings';
import type { ComputedRef } from 'vue';

// Types
interface BettingPreset {
  betAmount: number;
  selectedBet: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair';
}

interface CurrentRoundBet {
  hasBet: boolean;
  betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null;
  betAmount: number;
}

export function useBettingInterface(currentPayoutValues?: ComputedRef<PayoutValues>) {
  const store = useBaccaratStore();
  const { success, error, warning } = useNotifications();

  // Betting Interface State (removed balance - now comes from store)
  const bettingInterface = reactive({
    betAmount: 10,
    selectedBet: null as 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null,
    currentPreset: null as BettingPreset | null,
  });

  // Betting state for current round
  const currentRoundBet = reactive<CurrentRoundBet>({
    hasBet: false,
    betType: null,
    betAmount: 0,
  });

  // Betting validation
  const isBettingAllowed = (): boolean => {
    // Betting is only allowed when session is active and no cards are on the table (new round)
    return (
      store.canPerformActions &&
      store.shoe.currentHand.player.length === 0 &&
      store.shoe.currentHand.banker.length === 0
    );
  };

  // Place bet function
  const placeBet = (): void => {
    const validation = BettingService.validateBet(
      bettingInterface.selectedBet,
      bettingInterface.betAmount,
      store.ui.currentBalance, // Use store balance
      isBettingAllowed(),
      currentRoundBet.hasBet
    );

    if (!validation.isValid) {
      error(`❌ ${validation.errorMessage}`);
      return;
    }

    // At this point, validation passed, so selectedBet is guaranteed to be non-null
    const selectedBet = bettingInterface.selectedBet!;

    // Place the bet for this round
    currentRoundBet.hasBet = true;
    currentRoundBet.betType = selectedBet;
    currentRoundBet.betAmount = bettingInterface.betAmount;

    // Deduct bet amount from store balance
    store.ui.currentBalance -= bettingInterface.betAmount;

    // Show placement message
    const message = BettingService.formatBetPlacement(bettingInterface.betAmount, selectedBet);
    success(`✅ ${message}`);

    // Clear selection for next round
    bettingInterface.selectedBet = null;
  };

  // Settle current bet
  const settleCurrentBet = (handResult: HandResult): BetResult => {
    if (!currentRoundBet.hasBet || !currentRoundBet.betType) {
      return { won: false, payout: 0, netResult: 0 };
    }

    console.log('[betting-interface][settle] Settling bet', {
      betType: currentRoundBet.betType,
      betAmount: currentRoundBet.betAmount,
      winner: handResult.winner,
      balanceBefore: store.ui.currentBalance,
    });

    // Use provided payout values or fallback to store values
    const payoutSettings = currentPayoutValues
      ? {
          player: currentPayoutValues.value.player_payout,
          banker: currentPayoutValues.value.banker_payout,
          bankerCommission: currentPayoutValues.value.banker_commission,
          tie: currentPayoutValues.value.tie_payout,
          playerPair: currentPayoutValues.value.player_pair_payout,
          bankerPair: currentPayoutValues.value.banker_pair_payout,
        }
      : store.settings.payouts;

    // Calculate payout using service
    const betResult = BettingService.calculatePayout(
      currentRoundBet.betType,
      currentRoundBet.betAmount,
      handResult,
      payoutSettings
    );

    // Add payout to store balance
    store.ui.currentBalance += betResult.payout;

    console.log('[betting-interface][settle] Bet settled', {
      won: betResult.won,
      payout: betResult.payout,
      netResult: betResult.netResult,
      balanceAfter: store.ui.currentBalance,
      note: 'Bet state NOT reset yet - caller must handle reset after hand processing',
    });

    // Record the bet in statistics
    store.recordBet(currentRoundBet.betType, currentRoundBet.betAmount, handResult);

    // Show result message
    const message = BettingService.formatBetResult(betResult, store.ui.currentBalance);
    const emoji = betResult.won ? '🎉' : '💸';
    success(`${emoji} ${message}`);

    // ✨ CRITICAL FIX: DO NOT reset bet here!
    // The bet state must remain until hand is completely processed and saved
    // resetCurrentBet(); // REMOVED - caller must reset after hand processing

    return betResult;
  };

  // Reset bet for new round
  const resetCurrentBet = (): void => {
    console.log('[betting-interface] Resetting current bet state');
    currentRoundBet.hasBet = false;
    currentRoundBet.betType = null;
    currentRoundBet.betAmount = 0;

    // Also reset the betting interface selection for clarity
    bettingInterface.selectedBet = null;
  };

  // Start new round
  const startNewRound = (): void => {
    resetCurrentBet();
  };

  // Handle session ending event
  const handleSessionEnding = (event: CustomEvent): void => {
    console.log('[betting-interface][session-ending] Session ending event received', {
      hasPendingBet: currentRoundBet.hasBet,
      betAmount: currentRoundBet.betAmount,
      betType: currentRoundBet.betType,
      currentBalance: store.ui.currentBalance,
    });

    // Cancel any pending bet and restore balance
    if (currentRoundBet.hasBet && currentRoundBet.betAmount > 0) {
      console.log('[betting-interface][session-ending] Cancelling pending bet', {
        betType: currentRoundBet.betType,
        betAmount: currentRoundBet.betAmount,
        balanceBeforeRestore: store.ui.currentBalance,
      });

      // Restore the bet amount to balance
      store.ui.currentBalance += currentRoundBet.betAmount;

      console.log(
        '[betting-interface][session-ending] Balance restored after pending bet cancellation',
        {
          restoredAmount: currentRoundBet.betAmount,
          newBalance: store.ui.currentBalance,
        }
      );

      // Show notification to user
      warning(
        `🔄 Pending bet of $${currentRoundBet.betAmount.toFixed(2)} on ${currentRoundBet.betType?.toUpperCase()} cancelled - balance restored`
      );

      // Reset the bet state
      resetCurrentBet();
    }
  };

  // Set up event listeners
  onMounted(() => {
    window.addEventListener('session-ending', handleSessionEnding as EventListener);
    console.log('[betting-interface][lifecycle] Session ending event listener added');
  });

  onUnmounted(() => {
    window.removeEventListener('session-ending', handleSessionEnding as EventListener);
    console.log('[betting-interface][lifecycle] Session ending event listener removed');
  });

  return {
    // State
    bettingInterface,
    currentRoundBet,

    // Methods
    isBettingAllowed,
    placeBet,
    settleCurrentBet,
    startNewRound,
    resetCurrentBet,
  };
}
