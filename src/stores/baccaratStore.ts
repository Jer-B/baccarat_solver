import { defineStore } from 'pinia';
import type { 
  Card, 
  ShoeState, 
  EdgeCalculation, 
  PatternAnalysis, 
  HandResult,
  BurnedCardAnalysis,
  Rank,
  Suit
} from '../types/cards';

interface BaccaratState {
  shoe: ShoeState;
  edgeCalculations: EdgeCalculation;
  patternAnalysis: PatternAnalysis;
  burnedCardAnalysis: BurnedCardAnalysis;
  settings: {
    numberOfDecks: number;
    cutCardPosition: number;
    isEdgeSortingEnabled: boolean;
    showConfidenceLevels: boolean;
    trackBurnedCards: boolean;
    autoCalculateEdges: boolean;
    showPatternAnalysis: boolean;
  };
  history: {
    hands: HandResult[];
    currentHandNumber: number;
  };
  ui: {
    selectedTab: string;
    showAdvancedFeatures: boolean;
    isCalculating: boolean;
  };
}

export const useBaccaratStore = defineStore('baccarat', {
  state: (): BaccaratState => ({
    shoe: {
      remainingCards: new Map(),
      burnedCards: [],
      cutCardPosition: null,
      penetration: 0,
      currentHand: {
        player: [],
        banker: []
      },
      totalCards: 0,
      cardsDealt: 0
    },
    edgeCalculations: {
      playerEdge: -0.0106, // Standard house edge
      bankerEdge: -0.0106,
      tieEdge: -0.1436,
      playerPairEdge: -0.1076,
      bankerPairEdge: -0.1076,
      confidence: 0,
      edgeSortingAdvantage: 0,
      cutCardImpact: 0
    },
    patternAnalysis: {
      playerStreaks: [],
      bankerStreaks: [],
      choppingPatterns: [],
      alternatingPatterns: [],
      lastOutcomes: [],
      streakAnalysis: {
        currentPlayerStreak: 0,
        currentBankerStreak: 0,
        longestPlayerStreak: 0,
        longestBankerStreak: 0
      }
    },
    burnedCardAnalysis: {
      totalBurned: 0,
      burnedByRank: new Map(),
      burnedBySuit: new Map(),
      estimatedImpact: 0,
      confidenceLevel: 0
    },
    settings: {
      numberOfDecks: 8,
      cutCardPosition: 16, // cards from bottom
      isEdgeSortingEnabled: false,
      showConfidenceLevels: true,
      trackBurnedCards: true,
      autoCalculateEdges: true,
      showPatternAnalysis: true
    },
    history: {
      hands: [],
      currentHandNumber: 0
    },
    ui: {
      selectedTab: 'game',
      showAdvancedFeatures: false,
      isCalculating: false
    }
  }),

  getters: {
    remainingDecks: (state) => {
      const totalCards = Array.from(state.shoe.remainingCards.values()).reduce((sum, count) => sum + count, 0);
      return totalCards / 52;
    },
    
    currentPenetration: (state) => {
      const totalInitialCards = state.settings.numberOfDecks * 52;
      const remainingCards = Array.from(state.shoe.remainingCards.values()).reduce((sum, count) => sum + count, 0);
      return (totalInitialCards - remainingCards) / totalInitialCards;
    },

    shouldShuffleWarning: (state) => {
      const remainingCards = Array.from(state.shoe.remainingCards.values()).reduce((sum, count) => sum + count, 0);
      return state.shoe.cutCardPosition !== null && remainingCards <= state.shoe.cutCardPosition;
    },

    totalCardsRemaining: (state) => {
      return Array.from(state.shoe.remainingCards.values()).reduce((sum, count) => sum + count, 0);
    },

    estimatedRoundsRemaining: (state) => {
      const remainingCards = Array.from(state.shoe.remainingCards.values()).reduce((sum, count) => sum + count, 0);
      return Math.floor(remainingCards / 6); // Average 6 cards per round
    },

    bestBetRecommendation: (state) => {
      const edges = state.edgeCalculations;
      const bets = [
        { name: 'Player', edge: edges.playerEdge },
        { name: 'Banker', edge: edges.bankerEdge },
        { name: 'Tie', edge: edges.tieEdge },
        { name: 'Player Pair', edge: edges.playerPairEdge },
        { name: 'Banker Pair', edge: edges.bankerPairEdge }
      ];
      
      return bets.reduce((best, current) => 
        current.edge > best.edge ? current : best
      );
    }
  },

  actions: {
    initializeShoe() {
      const newShoe = new Map<string, number>();
      const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
      const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      
      suits.forEach(suit => {
        ranks.forEach(rank => {
          newShoe.set(`${rank}-${suit}`, this.settings.numberOfDecks);
        });
      });
      
      this.shoe.remainingCards = newShoe;
      this.shoe.burnedCards = [];
      this.shoe.cutCardPosition = this.settings.cutCardPosition;
      this.shoe.penetration = 0;
      this.shoe.currentHand = { player: [], banker: [] };
      this.shoe.totalCards = this.settings.numberOfDecks * 52;
      this.shoe.cardsDealt = 0;
      this.history.hands = [];
      this.history.currentHandNumber = 0;
      this.resetAnalysis();
    },

    trackBurnedCard(card: Card) {
      if (this.settings.trackBurnedCards) {
        const burnedCard = { 
          ...card, 
          isBurned: true, 
          timestamp: Date.now(),
          position: this.shoe.cardsDealt
        };
        
        this.shoe.burnedCards.push(burnedCard);
        this.updateCardCount(card, -1);
        this.updateBurnedCardAnalysis(card);
        
        if (this.settings.autoCalculateEdges) {
          this.recalculateEdges();
        }
      }
    },

    updateCardCount(card: Card, delta: number) {
      const key = `${card.rank}-${card.suit}`;
      const currentCount = this.shoe.remainingCards.get(key) || 0;
      const newCount = Math.max(0, currentCount + delta);
      this.shoe.remainingCards.set(key, newCount);
      this.shoe.cardsDealt += Math.abs(delta);
    },

    updateBurnedCardAnalysis(card: Card) {
      this.burnedCardAnalysis.totalBurned++;
      
      // Update by rank
      const rankCount = this.burnedCardAnalysis.burnedByRank.get(card.rank) || 0;
      this.burnedCardAnalysis.burnedByRank.set(card.rank, rankCount + 1);
      
      // Update by suit
      const suitCount = this.burnedCardAnalysis.burnedBySuit.get(card.suit) || 0;
      this.burnedCardAnalysis.burnedBySuit.set(card.suit, suitCount + 1);
      
      // Update confidence level
      this.burnedCardAnalysis.confidenceLevel = this.calculateBurnedCardConfidence();
    },

    calculateBurnedCardConfidence(): number {
      const totalBurned = this.burnedCardAnalysis.totalBurned;
      const totalCards = this.shoe.totalCards;
      return Math.min(totalBurned / (totalCards * 0.1), 1); // 10% burned cards = 100% confidence
    },

    recalculateEdges() {
      this.ui.isCalculating = true;
      
      // This is where we'll implement the advanced mathematical calculations
      // For now, we'll use simplified calculations
      setTimeout(() => {
        this.edgeCalculations.confidence = this.calculateConfidence();
        this.edgeCalculations.cutCardImpact = this.calculateCutCardImpact();
        this.ui.isCalculating = false;
      }, 100);
    },

    calculateConfidence(): number {
      const totalInitialCards = this.settings.numberOfDecks * 52;
      const knownCards = this.shoe.burnedCards.length + 
                        this.shoe.currentHand.player.length + 
                        this.shoe.currentHand.banker.length;
      return Math.min(knownCards / totalInitialCards, 1);
    },

    calculateCutCardImpact(): number {
      if (!this.shoe.cutCardPosition) return 0;
      
      const remainingCards = this.totalCardsRemaining;
      const cutCardDistance = remainingCards - this.shoe.cutCardPosition;
      
      // Impact increases as we approach the cut card
      return Math.max(0, 1 - (cutCardDistance / remainingCards));
    },

    addHandResult(result: HandResult) {
      this.history.currentHandNumber++;
      const handWithNumber = {
        ...result,
        handNumber: this.history.currentHandNumber,
        timestamp: Date.now()
      };
      
      this.history.hands.push(handWithNumber);
      this.updatePatternAnalysis(result.winner);
      
      // Clear current hand
      this.shoe.currentHand = { player: [], banker: [] };
    },

    updatePatternAnalysis(winner: 'player' | 'banker' | 'tie') {
      if (!this.settings.showPatternAnalysis) return;
      
      this.patternAnalysis.lastOutcomes.push(winner);
      
      // Update streak analysis
      if (winner === 'player') {
        this.patternAnalysis.streakAnalysis.currentPlayerStreak++;
        this.patternAnalysis.streakAnalysis.currentBankerStreak = 0;
        this.patternAnalysis.streakAnalysis.longestPlayerStreak = Math.max(
          this.patternAnalysis.streakAnalysis.longestPlayerStreak,
          this.patternAnalysis.streakAnalysis.currentPlayerStreak
        );
      } else if (winner === 'banker') {
        this.patternAnalysis.streakAnalysis.currentBankerStreak++;
        this.patternAnalysis.streakAnalysis.currentPlayerStreak = 0;
        this.patternAnalysis.streakAnalysis.longestBankerStreak = Math.max(
          this.patternAnalysis.streakAnalysis.longestBankerStreak,
          this.patternAnalysis.streakAnalysis.currentBankerStreak
        );
      } else {
        // Tie doesn't break streaks but doesn't extend them either
      }
      
      // Keep only last 100 outcomes
      if (this.patternAnalysis.lastOutcomes.length > 100) {
        this.patternAnalysis.lastOutcomes = this.patternAnalysis.lastOutcomes.slice(-100);
      }
    },

    resetAnalysis() {
      this.patternAnalysis = {
        playerStreaks: [],
        bankerStreaks: [],
        choppingPatterns: [],
        alternatingPatterns: [],
        lastOutcomes: [],
        streakAnalysis: {
          currentPlayerStreak: 0,
          currentBankerStreak: 0,
          longestPlayerStreak: 0,
          longestBankerStreak: 0
        }
      };
      
      this.burnedCardAnalysis = {
        totalBurned: 0,
        burnedByRank: new Map(),
        burnedBySuit: new Map(),
        estimatedImpact: 0,
        confidenceLevel: 0
      };
    },

    updateSettings(newSettings: Partial<BaccaratState['settings']>) {
      this.settings = { ...this.settings, ...newSettings };
      
      // Reinitialize shoe if deck count changed
      if (newSettings.numberOfDecks && newSettings.numberOfDecks !== this.settings.numberOfDecks) {
        this.initializeShoe();
      }
    }
  }
}); 