import type { HandResult, Card, Rank, Suit, CardValue } from '@/types/cards';

/**
 * Developer Tools Service
 * Handles all business logic for developer tools functionality
 */
export class DeveloperToolsService {
  /**
   * Create a card with proper typing
   */
  private static createCard(rank: string, suit: string, value: number): Card {
    return {
      rank: rank as Rank,
      suit: suit as Suit,
      value: value as CardValue,
    };
  }

  /**
   * Generate predefined sample hands for testing
   */
  static generateSampleHands(): HandResult[] {
    console.log('[testing][initialization] Generating sample hands for testing');

    const sampleHands: HandResult[] = [
      {
        player: [this.createCard('K', 'hearts', 0), this.createCard('9', 'spades', 9)],
        banker: [this.createCard('7', 'diamonds', 7), this.createCard('2', 'clubs', 2)],
        winner: 'player',
        playerPair: false,
        bankerPair: false,
        playerTotal: 9,
        bankerTotal: 9,
        natural: true,
        timestamp: Date.now(),
        handNumber: 1,
      },
      {
        player: [this.createCard('5', 'hearts', 5), this.createCard('3', 'spades', 3)],
        banker: [this.createCard('Q', 'diamonds', 0), this.createCard('9', 'clubs', 9)],
        winner: 'banker',
        playerPair: false,
        bankerPair: false,
        playerTotal: 8,
        bankerTotal: 9,
        natural: true,
        timestamp: Date.now(),
        handNumber: 2,
      },
      {
        player: [this.createCard('A', 'hearts', 1), this.createCard('A', 'spades', 1)],
        banker: [this.createCard('6', 'diamonds', 6), this.createCard('4', 'clubs', 4)],
        winner: 'banker',
        playerPair: true,
        bankerPair: false,
        playerTotal: 2,
        bankerTotal: 0,
        natural: false,
        timestamp: Date.now(),
        handNumber: 3,
      },
      {
        player: [this.createCard('8', 'hearts', 8), this.createCard('2', 'spades', 2)],
        banker: [this.createCard('7', 'diamonds', 7), this.createCard('7', 'clubs', 7)],
        winner: 'banker',
        playerPair: false,
        bankerPair: true,
        playerTotal: 0,
        bankerTotal: 4,
        natural: false,
        timestamp: Date.now(),
        handNumber: 4,
      },
      {
        player: [this.createCard('4', 'hearts', 4), this.createCard('4', 'spades', 4)],
        banker: [this.createCard('4', 'diamonds', 4), this.createCard('4', 'clubs', 4)],
        winner: 'tie',
        playerPair: true,
        bankerPair: true,
        playerTotal: 8,
        bankerTotal: 8,
        natural: false,
        timestamp: Date.now(),
        handNumber: 5,
      },
    ];

    console.log('[testing][completion] Generated sample hands', { count: sampleHands.length });
    return sampleHands;
  }

  /**
   * Generate a random hand for testing
   */
  static generateRandomHand(handNumber: number): HandResult {
    console.log('[testing][initialization] Generating random hand for testing');

    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0];

    const getRandomCard = (): Card => {
      const rankIndex = Math.floor(Math.random() * ranks.length);
      const suitIndex = Math.floor(Math.random() * suits.length);
      return this.createCard(ranks[rankIndex], suits[suitIndex], values[rankIndex]);
    };

    const playerCards = [getRandomCard(), getRandomCard()];
    const bankerCards = [getRandomCard(), getRandomCard()];

    const playerTotal = (playerCards[0].value + playerCards[1].value) % 10;
    const bankerTotal = (bankerCards[0].value + bankerCards[1].value) % 10;

    let winner: 'player' | 'banker' | 'tie';
    if (playerTotal > bankerTotal) {
      winner = 'player';
    } else if (bankerTotal > playerTotal) {
      winner = 'banker';
    } else {
      winner = 'tie';
    }

    const playerPair = playerCards[0].rank === playerCards[1].rank;
    const bankerPair = bankerCards[0].rank === bankerCards[1].rank;

    const randomHand: HandResult = {
      player: playerCards,
      banker: bankerCards,
      winner,
      playerPair,
      bankerPair,
      playerTotal,
      bankerTotal,
      natural: playerTotal >= 8 || bankerTotal >= 8,
      timestamp: Date.now(),
      handNumber,
    };

    console.log('[testing][completion] Generated random hand', {
      winner,
      playerTotal,
      bankerTotal,
      handNumber,
    });

    return randomHand;
  }

  /**
   * Validate if actions can be performed
   */
  static validateActionPermission(canPerformActions: boolean, actionName: string): boolean {
    if (!canPerformActions) {
      console.warn(`[testing][validation] Cannot ${actionName} - session not active`);
      return false;
    }
    return true;
  }
}
