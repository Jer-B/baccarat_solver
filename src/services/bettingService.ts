import type { HandResult } from '@/types/cards';

export interface BetResult {
  won: boolean;
  payout: number;
  netResult: number;
}

export interface PayoutSettings {
  player: number;
  banker: number;
  bankerCommission: number;
  tie: number;
  playerPair: number;
  bankerPair: number;
}

/**
 * Betting Service - Handles betting calculations and payout logic
 */
export class BettingService {
  /**
   * Calculate payout for a specific bet type
   */
  static calculatePayout(
    betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair',
    betAmount: number,
    handResult: HandResult,
    payouts: PayoutSettings
  ): BetResult {
    let payout = 0;
    let won = false;

    switch (betType) {
      case 'player':
        won = handResult.winner === 'player';
        payout = won ? betAmount * (payouts.player + 1) : 0;
        break;
      case 'banker':
        won = handResult.winner === 'banker';
        if (won) {
          const winnings = betAmount * payouts.banker;
          const commission = winnings * payouts.bankerCommission;
          payout = betAmount + winnings - commission;
        } else {
          payout = 0;
        }
        break;
      case 'tie':
        won = handResult.winner === 'tie';
        payout = won ? betAmount * (payouts.tie + 1) : 0;
        break;
      case 'playerPair':
        won = handResult.playerPair;
        payout = won ? betAmount * (payouts.playerPair + 1) : 0;
        break;
      case 'bankerPair':
        won = handResult.bankerPair;
        payout = won ? betAmount * (payouts.bankerPair + 1) : 0;
        break;
    }

    const netResult = payout - betAmount;

    return { won, payout, netResult };
  }

  /**
   * Validate betting conditions
   */
  static validateBet(
    selectedBet: string | null,
    betAmount: number,
    balance: number,
    isBettingAllowed: boolean,
    hasBet: boolean
  ): { isValid: boolean; errorMessage?: string } {
    if (!isBettingAllowed) {
      return {
        isValid: false,
        errorMessage: 'Please start a session before placing bets.',
      };
    }

    if (hasBet) {
      return {
        isValid: false,
        errorMessage:
          'You have already placed a bet for this round. Wait for the hand to complete.',
      };
    }

    if (betAmount > balance) {
      return {
        isValid: false,
        errorMessage: 'Insufficient balance for this bet amount.',
      };
    }

    return { isValid: true };
  }

  /**
   * Format bet result message
   */
  static formatBetResult(betResult: BetResult, newBalance: number): string {
    const result = betResult.won ? 'WON' : 'LOST';
    const resultText =
      betResult.netResult >= 0
        ? `+$${betResult.netResult.toFixed(2)}`
        : `$${betResult.netResult.toFixed(2)}`;

    return `${result}! ${resultText} - New Balance: $${newBalance.toFixed(2)}`;
  }

  /**
   * Format bet placement message
   */
  static formatBetPlacement(betAmount: number, betType: string): string {
    return `Bet placed: $${betAmount} on ${betType}. Waiting for hand to complete...`;
  }
}
