import type { HandResult } from '@/types/cards';

/**
 * Game Service - Handles core game operations and hand management
 */
export class GameService {
  /**
   * Create a complete hand result from current game state
   */
  static createHandResult(
    playerCards: any[],
    bankerCards: any[],
    playerValue: number,
    bankerValue: number,
    handNumber: number
  ): HandResult {
    // Determine winner
    let winner: 'player' | 'banker' | 'tie';
    if (playerValue > bankerValue) {
      winner = 'player';
    } else if (bankerValue > playerValue) {
      winner = 'banker';
    } else {
      winner = 'tie';
    }

    // Check for pairs
    const playerPair = playerCards.length >= 2 && playerCards[0].rank === playerCards[1].rank;
    const bankerPair = bankerCards.length >= 2 && bankerCards[0].rank === bankerCards[1].rank;

    // Check for naturals
    const natural =
      (playerValue >= 8 || bankerValue >= 8) &&
      playerCards.length === 2 &&
      bankerCards.length === 2;

    return {
      player: [...playerCards],
      banker: [...bankerCards],
      winner,
      playerPair,
      bankerPair,
      playerTotal: playerValue,
      bankerTotal: bankerValue,
      natural,
      timestamp: Date.now(),
      handNumber,
    };
  }

  /**
   * Validate if a hand can be cleared
   */
  static canClearHand(canPerformActions: boolean, playerCards: any[], bankerCards: any[]): boolean {
    const totalCards = playerCards.length + bankerCards.length;
    const hasMinimumCards = totalCards >= 4;

    return canPerformActions && hasMinimumCards;
  }

  /**
   * Calculate hand status based on current cards and values
   */
  static getHandStatus(
    playerCards: any[],
    bankerCards: any[],
    playerValue: number,
    bankerValue: number
  ): string {
    const playerCardCount = playerCards.length;
    const bankerCardCount = bankerCards.length;

    // Check for naturals
    if ((playerValue >= 8 || bankerValue >= 8) && playerCardCount === 2 && bankerCardCount === 2) {
      return 'Natural';
    }

    // Check if hand is complete (both have 2 or 3 cards)
    if (playerCardCount >= 2 && bankerCardCount >= 2) {
      if (playerCardCount === 2 && bankerCardCount === 2) {
        // Check if more cards needed based on baccarat rules
        if (playerValue <= 5 || bankerValue <= 5) {
          return 'In Progress';
        }
        return 'Complete';
      }
      return 'Complete';
    }

    return 'In Progress';
  }

  /**
   * Determine current winner
   */
  static getCurrentWinner(playerValue: number, bankerValue: number): string {
    if (playerValue > bankerValue) {
      return 'Player';
    }
    if (bankerValue > playerValue) {
      return 'Banker';
    }
    return 'Tie';
  }

  /**
   * Get CSS class for current winner
   */
  static getCurrentWinnerClass(playerValue: number, bankerValue: number): string {
    const winner = this.getCurrentWinner(playerValue, bankerValue);
    if (winner === 'Player') {
      return 'text-blue-600';
    }
    if (winner === 'Banker') {
      return 'text-red-600';
    }
    return 'text-green-600';
  }

  /**
   * Get CSS class for edge values
   */
  static getEdgeClass(edge: number): string {
    if (edge > 0) {
      return 'edge-positive';
    }
    if (edge < 0) {
      return 'edge-negative';
    }
    return 'edge-neutral';
  }
}
