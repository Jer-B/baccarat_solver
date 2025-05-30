export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type CardValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Card {
  suit: Suit;
  rank: Rank;
  value: CardValue;
  isEdgeSorted?: boolean;
  isBurned?: boolean;
  isUnknownBurn?: boolean; // Flag for professional burn tracking - we know something was burned but not what
  position?: number;
  timestamp?: number;
  handNumber?: number; // Track which hand this card was burned in
  confidence?: number; // Confidence level for suspected burns (0-100)
}

export interface ShoeState {
  remainingCards: Map<string, number>; // key is rank+suit
  burnedCards: Card[];
  cutCardPosition: number | null;
  penetration: number;
  currentHand: {
    player: Card[];
    banker: Card[];
  };
  totalCards: number;
  cardsDealt: number;
}

export interface BetType {
  player: boolean;
  banker: boolean;
  tie: boolean;
  playerPair: boolean;
  bankerPair: boolean;
}

export interface EdgeCalculation {
  playerEdge: number;
  bankerEdge: number;
  tieEdge: number;
  playerPairEdge: number;
  bankerPairEdge: number;
  confidence: number;
  edgeSortingAdvantage?: number;
  cutCardImpact?: number;
}

export interface PatternAnalysis {
  playerStreaks: number[];
  bankerStreaks: number[];
  choppingPatterns: boolean[];
  alternatingPatterns: boolean[];
  lastOutcomes: string[];
  streakAnalysis: {
    currentPlayerStreak: number;
    currentBankerStreak: number;
    currentTieStreak: number;
    longestPlayerStreak: number;
    longestBankerStreak: number;
    longestTieStreak: number;
  };
}

export interface HandResult {
  player: Card[];
  banker: Card[];
  winner: 'player' | 'banker' | 'tie';
  playerPair: boolean;
  bankerPair: boolean;
  playerTotal: number;
  bankerTotal: number;
  natural: boolean;
  timestamp: number;
  handNumber: number;
  // Betting information
  betInfo?: {
    betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair';
    betAmount: number;
    won: boolean;
    payout: number;
    netResult: number; // payout - betAmount
  };
}

export interface BurnedCardAnalysis {
  totalBurned: number;
  burnedByRank: Map<Rank, number>;
  burnedBySuit: Map<Suit, number>;
  estimatedImpact: number;
  confidenceLevel: number;
}
