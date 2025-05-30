import { reactive } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { BettingService } from '@/services/bettingService';
import type { HandResult } from '@/types/cards';
import type { BetResult } from '@/services/bettingService';

// Types
interface BettingPreset {
  balance: number;
  betAmount: number;
  selectedBet: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair';
}

interface CurrentRoundBet {
  hasBet: boolean;
  betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | null;
  betAmount: number;
}

export function useBettingInterface() {
  const store = useBaccaratStore();

  // Betting Interface State
  const bettingInterface = reactive({
    balance: 1000,
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
      bettingInterface.balance,
      isBettingAllowed(),
      currentRoundBet.hasBet
    );

    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    // At this point, validation passed, so selectedBet is guaranteed to be non-null
    const selectedBet = bettingInterface.selectedBet!;

    // Place the bet for this round
    currentRoundBet.hasBet = true;
    currentRoundBet.betType = selectedBet;
    currentRoundBet.betAmount = bettingInterface.betAmount;

    // Deduct bet amount from balance immediately
    bettingInterface.balance -= bettingInterface.betAmount;

    // Show placement message
    const message = BettingService.formatBetPlacement(bettingInterface.betAmount, selectedBet);
    alert(message);

    // Clear selection for next round
    bettingInterface.selectedBet = null;
  };

  // Settle current bet
  const settleCurrentBet = (handResult: HandResult): BetResult => {
    if (!currentRoundBet.hasBet || !currentRoundBet.betType) {
      return { won: false, payout: 0, netResult: 0 };
    }

    // Calculate payout using service
    const betResult = BettingService.calculatePayout(
      currentRoundBet.betType,
      currentRoundBet.betAmount,
      handResult,
      store.settings.payouts
    );

    // Add payout to balance
    bettingInterface.balance += betResult.payout;

    // Record the bet in statistics
    store.recordBet(currentRoundBet.betType, currentRoundBet.betAmount, handResult);

    // Show result message
    const message = BettingService.formatBetResult(betResult, bettingInterface.balance);
    alert(message);

    // Reset bet for next round
    resetCurrentBet();

    return betResult;
  };

  // Reset bet for new round
  const resetCurrentBet = (): void => {
    currentRoundBet.hasBet = false;
    currentRoundBet.betType = null;
    currentRoundBet.betAmount = 0;
  };

  // Start new round
  const startNewRound = (): void => {
    resetCurrentBet();
  };

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
