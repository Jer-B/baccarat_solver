import { defineStore } from 'pinia';
import type {
  Card,
  ShoeState,
  EdgeCalculation,
  PatternAnalysis,
  HandResult,
  BurnedCardAnalysis,
  Rank,
  Suit,
  CardValue,
} from '../types/cards';
import { useProfessionalBurnEstimation } from '../composables/useProfessionalBurnEstimation';
import {
  BurnAnalysisIntegration,
  type BurnAnalysisMetadata,
} from '../services/burnAnalysisIntegration';

interface BettingStats {
  totalHands: number;
  correctBets: number;
  incorrectBets: number;
  totalAmountWagered: number;
  totalWinLoss: number;
  winRate: number;
  roi: number; // Return on Investment
  edgeSortingAccuracy: number;
  pairBetAccuracy: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  averageBetSize: number;
  biggestWin: number;
  biggestLoss: number;
  profitableHands: number;
  breakEvenHands: number;
  losingHands: number;
}

interface BaccaratState {
  shoe: ShoeState;
  edgeCalculations: EdgeCalculation;
  patternAnalysis: PatternAnalysis;
  burnedCardAnalysis: BurnedCardAnalysis;
  bettingStats: BettingStats;
  burnAnalysisMetadata?: BurnAnalysisMetadata;
  settings: {
    numberOfDecks: number;
    cutCardPosition: number;
    showConfidenceLevels: boolean;
    trackBurnedCards: boolean;
    showPatternAnalysis: boolean;
    showAdvancedAnalysis: boolean;
    monteCarlo: {
      autoRun: boolean;
      runEveryNHands: number;
      simulations: number;
      handsToSimulate: number;
      riskThresholds: {
        highRiskOfRuin: number;
        lowProfitProbability: number;
        negativeExpectedValue: number;
        highVolatility: number;
      };
    };
    kelly: {
      enabled: boolean;
      changeThreshold: number; // Percentage change to trigger notification
      fractionalKelly: number; // Multiplier for safety (0.25 = 25% of Kelly)
      maxKellyPercentage: number; // Maximum Kelly percentage allowed
      bankrollAmount: number; // Assumed bankroll for calculations
      autoAdjustBetSize: boolean; // Auto-adjust based on Kelly
    };
    calculationTriggers: {
      autoCalculateEdges: boolean;
      edgeChangeThresholds: {
        playerEdge: number;
        bankerEdge: number;
        playerPairEdge: number;
        bankerPairEdge: number;
        edgeSortingAdvantage: number;
      };
      shoeCompositionTriggers: {
        enabled: boolean;
        significantCardChange: number; // Percentage change to trigger recalculation
        penetrationThreshold: number; // Minimum penetration before triggering
      };
    };
    payouts: {
      player: number;
      banker: number;
      tie: number;
      playerPair: number;
      bankerPair: number;
      bankerCommission: number; // Percentage as decimal (0.05 = 5%)
    };
  };
  history: {
    hands: HandResult[];
    currentHandNumber: number;
  };
  ui: {
    selectedTab: string;
    showAdvancedFeatures: boolean;
    isCalculating: boolean;
    sessionActive: boolean; // Track if a gaming session is active
    sessionStartTime: number | null; // Timestamp when session started
    currentSessionId: string | null; // Current session ID from Supabase
  };
  lastPenetrationCheck: number;
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
        banker: [],
      },
      totalCards: 0,
      cardsDealt: 0,
    },
    edgeCalculations: {
      playerEdge: -0.0106, // Standard house edge
      bankerEdge: -0.0106,
      tieEdge: -0.1436,
      playerPairEdge: -0.1076,
      bankerPairEdge: -0.1076,
      confidence: 0,
      edgeSortingAdvantage: 0,
      cutCardImpact: 0,
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
        currentTieStreak: 0,
        longestPlayerStreak: 0,
        longestBankerStreak: 0,
        longestTieStreak: 0,
      },
    },
    burnedCardAnalysis: {
      totalBurned: 0,
      burnedByRank: new Map(),
      burnedBySuit: new Map(),
      estimatedImpact: 0,
      confidenceLevel: 0,
    },
    bettingStats: {
      totalHands: 0,
      correctBets: 0,
      incorrectBets: 0,
      totalAmountWagered: 0,
      totalWinLoss: 0,
      winRate: 0,
      roi: 0,
      edgeSortingAccuracy: 0,
      pairBetAccuracy: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      currentStreak: 0,
      currentStreakType: 'none',
      averageBetSize: 0,
      biggestWin: 0,
      biggestLoss: 0,
      profitableHands: 0,
      breakEvenHands: 0,
      losingHands: 0,
    },
    settings: {
      numberOfDecks: 8,
      cutCardPosition: 16, // cards from bottom
      showConfidenceLevels: true,
      trackBurnedCards: true, // Always enabled
      showPatternAnalysis: true, // Always enabled
      showAdvancedAnalysis: true, // Always show pair analysis
      monteCarlo: {
        autoRun: true,
        runEveryNHands: 3,
        simulations: 10000,
        handsToSimulate: 100,
        riskThresholds: {
          highRiskOfRuin: 0.15,
          lowProfitProbability: 0.4,
          negativeExpectedValue: 0,
          highVolatility: 500,
        },
      },
      kelly: {
        enabled: true,
        changeThreshold: 0.25,
        fractionalKelly: 0.5,
        maxKellyPercentage: 0.25,
        bankrollAmount: 1000,
        autoAdjustBetSize: false,
      },
      calculationTriggers: {
        autoCalculateEdges: true,
        edgeChangeThresholds: {
          playerEdge: 0.005,
          bankerEdge: 0.005,
          playerPairEdge: 0.005,
          bankerPairEdge: 0.005,
          edgeSortingAdvantage: 0.005,
        },
        shoeCompositionTriggers: {
          enabled: true,
          significantCardChange: 10,
          penetrationThreshold: 0.5,
        },
      },
      payouts: {
        player: 1, // 1:1 payout
        banker: 1, // 1:1 payout
        tie: 8, // 8:1 payout
        playerPair: 11, // 11:1 payout
        bankerPair: 11, // 11:1 payout
        bankerCommission: 0.05, // 5% commission
      },
    },
    history: {
      hands: [],
      currentHandNumber: 0,
    },
    ui: {
      selectedTab:
        typeof window !== 'undefined'
          ? localStorage.getItem('baccarat-selectedTab') || 'game'
          : 'game',
      showAdvancedFeatures: false,
      isCalculating: false,
      sessionActive: false, // Session starts inactive
      sessionStartTime: null, // No session started yet
      currentSessionId: null, // Current session ID from Supabase
    },
    lastPenetrationCheck: 0,
  }),

  getters: {
    remainingDecks: state => {
      const totalCards = Array.from(state.shoe.remainingCards.values()).reduce(
        (sum, count) => sum + count,
        0
      );
      return totalCards / 52;
    },

    currentPenetration: state => {
      const totalInitialCards = state.settings.numberOfDecks * 52;
      const remainingCards = Array.from(state.shoe.remainingCards.values()).reduce(
        (sum, count) => sum + count,
        0
      );
      return (totalInitialCards - remainingCards) / totalInitialCards;
    },

    shouldShuffleWarning: state => {
      const remainingCards = Array.from(state.shoe.remainingCards.values()).reduce(
        (sum, count) => sum + count,
        0
      );
      return state.shoe.cutCardPosition !== null && remainingCards <= state.shoe.cutCardPosition;
    },

    totalCardsRemaining: state => {
      return Array.from(state.shoe.remainingCards.values()).reduce((sum, count) => sum + count, 0);
    },

    estimatedRoundsRemaining: state => {
      const remainingCards = Array.from(state.shoe.remainingCards.values()).reduce(
        (sum, count) => sum + count,
        0
      );
      return Math.floor(remainingCards / 6); // Average 6 cards per round
    },

    bestBetRecommendation: state => {
      const edges = state.edgeCalculations;
      const bets = [
        { name: 'Player', edge: edges.playerEdge },
        { name: 'Banker', edge: edges.bankerEdge },
        { name: 'Tie', edge: edges.tieEdge },
        { name: 'Player Pair', edge: edges.playerPairEdge },
        { name: 'Banker Pair', edge: edges.bankerPairEdge },
      ];

      return bets.reduce((best, current) => (current.edge > best.edge ? current : best));
    },

    kellyBestBet: state => {
      const stats = state.bettingStats;
      const edges = state.edgeCalculations;

      // If no betting history, return null
      if (stats.totalHands === 0) {
        return null;
      }

      // Get professional burn estimation
      const burnEstimation = useProfessionalBurnEstimation();
      const professionalRec = burnEstimation.professionalRecommendation.value;

      const bets = [
        { name: 'Player', edge: edges.playerEdge, type: 'player' },
        { name: 'Banker', edge: edges.bankerEdge, type: 'banker' },
        { name: 'Tie', edge: edges.tieEdge, type: 'tie' },
        { name: 'Player Pair', edge: edges.playerPairEdge, type: 'playerPair' },
        { name: 'Banker Pair', edge: edges.bankerPairEdge, type: 'bankerPair' },
      ];

      // Calculate Kelly percentage for each bet type
      const kellyBets = bets.map(bet => {
        // Adjust edge based on professional burn analysis
        let adjustedEdge = bet.edge;
        if (professionalRec) {
          adjustedEdge += professionalRec.edgeAdjustment;
        }

        // Simplified Kelly calculation: f = (bp - q) / b
        // where b = odds, p = win probability, q = loss probability
        const winProbability = Math.max(0.01, Math.min(0.99, 0.5 + adjustedEdge)); // Adjust probability based on edge
        const lossProbability = 1 - winProbability;

        // Get payout odds for each bet type
        let odds = 1; // Default 1:1
        switch (bet.type) {
          case 'player':
            odds = state.settings.payouts.player;
            break;
          case 'banker':
            odds = state.settings.payouts.banker * (1 - state.settings.payouts.bankerCommission);
            break;
          case 'tie':
            odds = state.settings.payouts.tie;
            break;
          case 'playerPair':
          case 'bankerPair':
            odds = state.settings.payouts.playerPair;
            break;
        }

        let kellyPercentage = Math.max(0, (odds * winProbability - lossProbability) / odds);

        // Apply professional burn estimation adjustments
        if (professionalRec) {
          kellyPercentage *= professionalRec.kellyPercentage / 0.02; // Scale based on professional recommendation
        }

        return {
          ...bet,
          kellyPercentage,
          winProbability,
          odds,
          adjustedEdge,
          burnAdjustment: professionalRec?.edgeAdjustment || 0,
        };
      });

      // Return the bet with highest Kelly percentage, but only if it's positive
      const bestKellyBet = kellyBets.reduce((best, current) =>
        current.kellyPercentage > best.kellyPercentage ? current : best
      );

      return bestKellyBet.kellyPercentage > 0 ? bestKellyBet : null;
    },

    monteCarloBestBet: state => {
      const edges = state.edgeCalculations;

      // Simple Monte Carlo recommendation based on expected value and risk
      const bets = [
        { name: 'Player', edge: edges.playerEdge, type: 'player' },
        { name: 'Banker', edge: edges.bankerEdge, type: 'banker' },
        { name: 'Tie', edge: edges.tieEdge, type: 'tie' },
        { name: 'Player Pair', edge: edges.playerPairEdge, type: 'playerPair' },
        { name: 'Banker Pair', edge: edges.bankerPairEdge, type: 'bankerPair' },
      ];

      // Calculate risk-adjusted expected value for each bet
      const monteCarloScores = bets.map(bet => {
        const expectedValue = bet.edge;

        // Get volatility factor for each bet type
        let volatilityFactor = 1;
        switch (bet.type) {
          case 'tie':
            volatilityFactor = 3; // High volatility
            break;
          case 'playerPair':
          case 'bankerPair':
            volatilityFactor = 2.5; // High volatility
            break;
          case 'player':
          case 'banker':
            volatilityFactor = 1; // Low volatility
            break;
        }

        // Risk-adjusted score (penalize high volatility)
        const riskAdjustedScore = expectedValue / volatilityFactor;

        return {
          ...bet,
          expectedValue,
          volatilityFactor,
          riskAdjustedScore,
        };
      });

      // Return the bet with highest risk-adjusted score, but only if it's positive
      const bestMonteCarloBet = monteCarloScores.reduce((best, current) =>
        current.riskAdjustedScore > best.riskAdjustedScore ? current : best
      );

      return bestMonteCarloBet.riskAdjustedScore > 0 ? bestMonteCarloBet : null;
    },

    handHistory: state => state.history.hands,

    // Detailed pair analysis for each rank
    pairAnalysis: state => {
      const remainingCards = state.shoe.remainingCards;
      const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

      const totalCardsRemaining = Array.from(remainingCards.values()).reduce(
        (sum, count) => sum + count,
        0
      );

      return ranks.map(rank => {
        const cardsOfThisRank = suits.reduce((sum, suit) => {
          return sum + (remainingCards.get(`${rank}-${suit}`) || 0);
        }, 0);

        let pairProbability = 0;
        if (cardsOfThisRank >= 2 && totalCardsRemaining >= 2) {
          const firstCardProb = cardsOfThisRank / totalCardsRemaining;
          const secondCardProb = (cardsOfThisRank - 1) / (totalCardsRemaining - 1);
          pairProbability = firstCardProb * secondCardProb;
        }

        return {
          rank,
          cardsRemaining: cardsOfThisRank,
          pairProbability,
          isRich: cardsOfThisRank > state.settings.numberOfDecks * 4 * 0.7, // More than 70% remaining
          isDepleted: cardsOfThisRank <= state.settings.numberOfDecks * 4 * 0.3, // Less than 30% remaining
        };
      });
    },

    // Calculate current hand values using baccarat rules
    currentHandValues: state => {
      const calculateHandValue = (cards: Card[]): number => {
        return cards.reduce((sum, card) => sum + card.value, 0) % 10;
      };

      return {
        player: calculateHandValue(state.shoe.currentHand.player),
        banker: calculateHandValue(state.shoe.currentHand.banker),
      };
    },

    // Check if actions are allowed (session must be active)
    canPerformActions: state => state.ui.sessionActive,

    // Check if there's a hand to clear
    hasHandToClear: state => {
      return state.shoe.currentHand.player.length > 0 || state.shoe.currentHand.banker.length > 0;
    },

    // Check if we can add more cards (max 6 total in baccarat)
    canAddMoreCards: state => {
      const totalCards =
        state.shoe.currentHand.player.length + state.shoe.currentHand.banker.length;
      return totalCards < 6;
    },
  },

  actions: {
    initializeShoe() {
      console.log('Initializing shoe with', this.settings.numberOfDecks, 'decks');
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

      console.log(
        'Shoe initialized with',
        newShoe.size,
        'card types and',
        this.shoe.totalCards,
        'total cards'
      );
      console.log('Sample card counts:', Array.from(newShoe.entries()).slice(0, 5));

      // Recalculate edges for fresh shoe
      if (this.settings.calculationTriggers.autoCalculateEdges) {
        this.recalculateEdges();
      }
    },

    trackBurnedCard(card: Card) {
      if (this.settings.trackBurnedCards) {
        const burnedCard = {
          ...card,
          isBurned: true,
          timestamp: Date.now(),
          position: this.shoe.cardsDealt,
        };

        this.shoe.burnedCards.push(burnedCard);
        this.updateCardCount(card, -1);
        this.updateBurnedCardAnalysis(card);

        if (this.settings.calculationTriggers.autoCalculateEdges) {
          this.recalculateEdges();
        }
      }
    },

    // Draw a random card from the shoe
    drawRandomCard(): Card | null {
      const availableCards: { key: string; count: number; rank: Rank; suit: Suit }[] = [];

      // Collect all available cards
      for (const [key, count] of this.shoe.remainingCards.entries()) {
        if (count > 0) {
          const [rank, suit] = key.split('-') as [Rank, Suit];
          availableCards.push({ key, count, rank, suit });
        }
      }

      if (availableCards.length === 0) {
        return null; // No cards left
      }

      // Create weighted array for random selection
      const weightedCards: { rank: Rank; suit: Suit }[] = [];
      for (const cardType of availableCards) {
        for (let i = 0; i < cardType.count; i++) {
          weightedCards.push({ rank: cardType.rank, suit: cardType.suit });
        }
      }

      // Select random card
      const randomIndex = Math.floor(Math.random() * weightedCards.length);
      const selectedCard = weightedCards[randomIndex];

      // Create card object with proper value
      const card: Card = {
        rank: selectedCard.rank,
        suit: selectedCard.suit,
        value: this.getCardValue(selectedCard.rank),
        timestamp: Date.now(),
      };

      return card;
    },

    // Burn a card (remove from shoe and track)
    burnCard(card: Card): void {
      // Update card count
      this.updateCardCount(card, -1);

      // Track as burned card
      this.trackBurnedCard(card);
    },

    // Professional burn card tracking - tracks unknown burns
    burnUnknownCards(count: number): void {
      // Input validation
      if (count <= 0) {
        console.warn('[burn-analysis][validation] Cannot burn zero or negative cards');
        return;
      }

      if (count > this.totalCardsRemaining) {
        console.error(
          `[burn-analysis][error] Cannot burn ${count} cards - only ${this.totalCardsRemaining} remaining`
        );
        return;
      }

      console.log(`[burn-analysis][initialization] Starting burn of ${count} unknown cards`, {
        cardsRemaining: this.totalCardsRemaining,
        totalBurned: this.burnedCardAnalysis.totalBurned,
      });

      // Professional approach: Track that cards were burned without revealing specific cards
      try {
        // Calculate current shoe composition for proportional removal
        const totalRemaining = this.totalCardsRemaining;
        const cardKeys = Array.from(this.shoe.remainingCards.keys());

        for (let i = 0; i < count; i++) {
          // Create unknown burn record without revealing specific card
          const unknownBurn: Card = {
            rank: 'UNKNOWN' as any, // Explicitly unknown - not a real rank
            suit: 'UNKNOWN' as any, // Explicitly unknown - not a real suit
            value: -1 as any, // Explicitly unknown - invalid value
            isBurned: true,
            isUnknownBurn: true, // Key flag for professional tracking
            timestamp: Date.now(),
            handNumber: this.history.currentHandNumber,
          };

          this.shoe.burnedCards.push(unknownBurn);
          this.burnedCardAnalysis.totalBurned++;

          // Remove one card proportionally from remaining cards
          // This maintains the shoe composition while reducing total count
          if (cardKeys.length > 0) {
            // Find a card type that still has cards remaining
            let removedCard = false;
            for (const key of cardKeys) {
              const currentCount = this.shoe.remainingCards.get(key) || 0;
              if (currentCount > 0) {
                this.shoe.remainingCards.set(key, currentCount - 1);
                removedCard = true;
                break;
              }
            }

            // If no cards found (shouldn't happen with validation), log error
            if (!removedCard) {
              console.error('[burn-analysis][error] No cards available to remove during burn');
              break;
            }
          }

          // Increment cards dealt counter
          this.shoe.cardsDealt++;
          this.shoe.penetration = this.shoe.cardsDealt / this.shoe.totalCards;
        }

        // Trigger professional analysis to estimate impact without revealing cards
        this.triggerProfessionalBurnAnalysis();

        console.log('[burn-analysis][completion] Successfully burned unknown cards', {
          burnedCount: count,
          totalBurned: this.burnedCardAnalysis.totalBurned,
          cardsRemaining: this.totalCardsRemaining,
          penetration: `${(this.shoe.penetration * 100).toFixed(1)}%`,
        });
      } catch (error) {
        console.error('[burn-analysis][error] Error burning unknown cards:', error);
      }
    },

    // Apply suspected burn card with confidence weighting
    applySuspectedBurn(card: Card, confidence: number): void {
      // Weight the impact based on confidence level
      const weightedDelta = -(confidence / 100);

      // Partially update card count based on confidence
      const key = `${card.rank}-${card.suit}`;
      const currentCount = this.shoe.remainingCards.get(key) || 0;
      const adjustedCount = Math.max(0, currentCount + weightedDelta);
      this.shoe.remainingCards.set(key, adjustedCount);

      // Track as suspected burn with confidence metadata
      const suspectedBurnCard = {
        ...card,
        isBurned: true,
        confidence,
        timestamp: Date.now(),
        handNumber: this.history.currentHandNumber,
      };

      this.shoe.burnedCards.push(suspectedBurnCard);
      this.updateBurnedCardAnalysis(card);

      // Recalculate edges with new information
      if (this.settings.calculationTriggers.autoCalculateEdges) {
        this.recalculateEdges();
      }
    },

    // Helper method to get card value for baccarat
    getCardValue(rank: Rank): CardValue {
      switch (rank) {
        case 'A':
          return 1;
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          return parseInt(rank) as CardValue;
        case '10':
        case 'J':
        case 'Q':
        case 'K':
          return 0;
        default:
          return 0;
      }
    },

    updateCardCount(card: Card, delta: number) {
      const key = `${card.rank}-${card.suit}`;
      const currentCount = this.shoe.remainingCards.get(key) || 0;
      const newCount = Math.max(0, currentCount + delta);
      this.shoe.remainingCards.set(key, newCount);
      this.shoe.cardsDealt += Math.abs(delta);

      // Update penetration
      this.shoe.penetration = this.shoe.cardsDealt / this.shoe.totalCards;

      // Check for significant shoe composition changes
      if (this.settings.calculationTriggers.shoeCompositionTriggers.enabled) {
        this.checkShoeCompositionTrigger();
      }
    },

    checkShoeCompositionTrigger() {
      // Only check if we have enough penetration
      if (
        this.shoe.penetration <
        this.settings.calculationTriggers.shoeCompositionTriggers.penetrationThreshold
      ) {
        return;
      }

      // Calculate percentage change in card composition since last check
      const currentPenetration = this.shoe.penetration * 100;
      const threshold =
        this.settings.calculationTriggers.shoeCompositionTriggers.significantCardChange;

      // Store last penetration check (you might want to add this to state)
      if (!this.lastPenetrationCheck) {
        this.lastPenetrationCheck = 0;
      }

      const penetrationChange = currentPenetration - this.lastPenetrationCheck;

      // Trigger recalculation if change is significant and auto-calculate is enabled
      if (penetrationChange >= threshold && this.settings.calculationTriggers.autoCalculateEdges) {
        this.lastPenetrationCheck = currentPenetration;
        this.recalculateEdges();
      }
    },

    updateBurnedCardAnalysis(card: Card) {
      this.burnedCardAnalysis.totalBurned++;

      // Update by rank
      const rankCount = this.burnedCardAnalysis.burnedByRank.get(card.rank) || 0;
      this.burnedCardAnalysis.burnedByRank.set(card.rank, rankCount + 1);

      // Update by suit
      const suitCount = this.burnedCardAnalysis.burnedBySuit.get(card.suit) || 0;
      this.burnedCardAnalysis.burnedBySuit.set(card.suit, suitCount + 1);

      // Track which hand this card was burned in (for internal tracking)
      const cardWithHandNumber = {
        ...card,
        handNumber: this.history.currentHandNumber,
        timestamp: Date.now(),
      };

      // Add to burned cards array if not already there
      if (
        !this.shoe.burnedCards.find(
          bc =>
            bc.rank === card.rank &&
            bc.suit === card.suit &&
            bc.handNumber === this.history.currentHandNumber
        )
      ) {
        this.shoe.burnedCards.push(cardWithHandNumber);
      }

      // Update confidence level
      this.burnedCardAnalysis.confidenceLevel = this.calculateBurnedCardConfidence();
    },

    calculateBurnedCardConfidence(): number {
      const totalBurned = this.burnedCardAnalysis.totalBurned;
      const totalCards = this.shoe.totalCards;
      return Math.min(totalBurned / (totalCards * 0.1), 1); // 10% burned cards = 100% confidence
    },

    calculateBurnedCardImpact(): number {
      // Calculate the impact of burned cards on edge calculations
      const totalBurned = this.burnedCardAnalysis.totalBurned;
      const totalCards = this.shoe.totalCards;

      if (totalBurned === 0) {
        return 0;
      }

      // Impact increases with more cards burned (higher penetration)
      const penetrationImpact = (totalBurned / totalCards) * 0.5; // Max 50% impact

      return Math.min(penetrationImpact, 0.5);
    },

    recalculateEdges() {
      this.ui.isCalculating = true;

      // Calculate dynamic edges based on current shoe composition
      setTimeout(() => {
        this.edgeCalculations.confidence = this.calculateConfidence();
        this.edgeCalculations.cutCardImpact = this.calculateCutCardImpact();

        // Calculate dynamic pair edges based on remaining cards
        this.edgeCalculations.playerPairEdge = this.calculatePairEdge();
        this.edgeCalculations.bankerPairEdge = this.calculatePairEdge(); // Same calculation for both

        // Calculate edge sorting advantage (always enabled for professional play)
        this.edgeCalculations.edgeSortingAdvantage = this.calculateEdgeSortingAdvantage();

        // Apply edge sorting advantage to main bets
        this.edgeCalculations.playerEdge = -0.0106 + this.edgeCalculations.edgeSortingAdvantage;
        this.edgeCalculations.bankerEdge = -0.0106 + this.edgeCalculations.edgeSortingAdvantage;

        this.ui.isCalculating = false;
      }, 100);
    },

    calculateConfidence(): number {
      const totalInitialCards = this.settings.numberOfDecks * 52;
      const knownCards =
        this.shoe.burnedCards.length +
        this.shoe.currentHand.player.length +
        this.shoe.currentHand.banker.length;
      return Math.min(knownCards / totalInitialCards, 1);
    },

    calculateCutCardImpact(): number {
      if (!this.shoe.cutCardPosition) {
        return 0;
      }

      const remainingCards = this.totalCardsRemaining;
      const cutCardDistance = remainingCards - this.shoe.cutCardPosition;

      // Impact increases as we approach the cut card
      return Math.max(0, 1 - cutCardDistance / remainingCards);
    },

    calculatePairEdge(): number {
      const remainingCards = this.shoe.remainingCards;
      const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

      // Calculate total cards remaining
      const totalCardsRemaining = Array.from(remainingCards.values()).reduce(
        (sum, count) => sum + count,
        0
      );

      if (totalCardsRemaining < 2) {
        return -1;
      } // Can't form pairs with less than 2 cards

      let totalPairProbability = 0;

      // For each rank, calculate probability of getting a pair
      for (const rank of ranks) {
        // Count remaining cards of this rank across all suits
        const cardsOfThisRank = suits.reduce((sum, suit) => {
          return sum + (remainingCards.get(`${rank}-${suit}`) || 0);
        }, 0);

        if (cardsOfThisRank >= 2) {
          // Probability of getting 2 cards of same rank for first 2 cards dealt
          // P(first card is this rank) * P(second card is same rank | first was this rank)
          const firstCardProb = cardsOfThisRank / totalCardsRemaining;
          const secondCardProb = (cardsOfThisRank - 1) / (totalCardsRemaining - 1);
          const pairProbability = firstCardProb * secondCardProb;

          totalPairProbability += pairProbability;
        }
      }

      // Pair bet typically pays 11:1 (win 11 units for every 1 unit bet)
      const payout = 11;

      // Calculate edge: (probability of winning * payout) - probability of losing
      // Edge = (P(win) * payout) - P(lose) * 1
      // Since P(lose) = 1 - P(win), this becomes:
      // Edge = (P(win) * payout) - (1 - P(win)) = P(win) * (payout + 1) - 1
      const edge = totalPairProbability * (payout + 1) - 1;

      return edge;
    },

    calculateEdgeSortingAdvantage(): number {
      const remainingCards = this.shoe.remainingCards;
      const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

      // Calculate total cards remaining
      const totalCardsRemaining = Array.from(remainingCards.values()).reduce(
        (sum, count) => sum + count,
        0
      );

      if (totalCardsRemaining === 0) {
        return 0;
      }

      // Edge sorting focuses on identifying high-value vs low-value cards
      // High cards (6,7,8,9,10,J,Q,K,A) favor banker slightly
      // Low cards (A,2,3,4,5) favor player slightly

      const highValueRanks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const lowValueRanks = ['A', '2', '3', '4', '5'];

      let highValueCards = 0;
      let lowValueCards = 0;

      // Count remaining high and low value cards
      for (const rank of highValueRanks) {
        for (const suit of suits) {
          highValueCards += remainingCards.get(`${rank}-${suit}`) || 0;
        }
      }

      for (const rank of lowValueRanks) {
        for (const suit of suits) {
          lowValueCards += remainingCards.get(`${rank}-${suit}`) || 0;
        }
      }

      // Calculate the imbalance
      const highValueRatio = highValueCards / totalCardsRemaining;
      const lowValueRatio = lowValueCards / totalCardsRemaining;

      // Edge sorting advantage is proportional to the imbalance
      // Positive advantage when more high cards remain (favors banker)
      // Negative advantage when more low cards remain (favors player)
      const imbalance = highValueRatio - lowValueRatio;

      // Scale the advantage (professional edge sorting can provide 0.5-6% advantage)
      const maxAdvantage = 0.06; // 6% maximum advantage
      const advantage = imbalance * maxAdvantage * 2; // Multiply by 2 for sensitivity

      return Math.max(-maxAdvantage, Math.min(maxAdvantage, advantage));
    },

    addHandResult(result: HandResult) {
      this.history.currentHandNumber++;
      const handWithNumber = {
        ...result,
        handNumber: this.history.currentHandNumber,
        timestamp: Date.now(),
      };

      this.history.hands.push(handWithNumber);
      this.updatePatternAnalysis(result.winner);

      // Update burned card analysis based on cards that were in the hand
      const allHandCards = [...result.player, ...result.banker];
      allHandCards.forEach(card => {
        this.updateBurnedCardAnalysis(card);
      });

      // Update burned card analysis totals
      this.burnedCardAnalysis.estimatedImpact = this.calculateBurnedCardImpact();

      // Clear current hand
      this.shoe.currentHand = { player: [], banker: [] };
    },

    updatePatternAnalysis(winner: 'player' | 'banker' | 'tie') {
      if (!this.settings.showPatternAnalysis) {
        return;
      }

      this.patternAnalysis.lastOutcomes.push(winner);

      // Update streak analysis
      if (winner === 'player') {
        this.patternAnalysis.streakAnalysis.currentPlayerStreak++;
        this.patternAnalysis.streakAnalysis.currentBankerStreak = 0;
        this.patternAnalysis.streakAnalysis.currentTieStreak = 0;
        this.patternAnalysis.streakAnalysis.longestPlayerStreak = Math.max(
          this.patternAnalysis.streakAnalysis.longestPlayerStreak,
          this.patternAnalysis.streakAnalysis.currentPlayerStreak
        );
      } else if (winner === 'banker') {
        this.patternAnalysis.streakAnalysis.currentBankerStreak++;
        this.patternAnalysis.streakAnalysis.currentPlayerStreak = 0;
        this.patternAnalysis.streakAnalysis.currentTieStreak = 0;
        this.patternAnalysis.streakAnalysis.longestBankerStreak = Math.max(
          this.patternAnalysis.streakAnalysis.longestBankerStreak,
          this.patternAnalysis.streakAnalysis.currentBankerStreak
        );
      } else if (winner === 'tie') {
        this.patternAnalysis.streakAnalysis.currentTieStreak++;
        this.patternAnalysis.streakAnalysis.currentPlayerStreak = 0;
        this.patternAnalysis.streakAnalysis.currentBankerStreak = 0;
        this.patternAnalysis.streakAnalysis.longestTieStreak = Math.max(
          this.patternAnalysis.streakAnalysis.longestTieStreak,
          this.patternAnalysis.streakAnalysis.currentTieStreak
        );
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
          currentTieStreak: 0,
          longestPlayerStreak: 0,
          longestBankerStreak: 0,
          longestTieStreak: 0,
        },
      };

      this.burnedCardAnalysis = {
        totalBurned: 0,
        burnedByRank: new Map(),
        burnedBySuit: new Map(),
        estimatedImpact: 0,
        confidenceLevel: 0,
      };
    },

    updateSettings(newSettings: Partial<BaccaratState['settings']>) {
      this.settings = { ...this.settings, ...newSettings };

      // Reinitialize shoe if deck count changed
      if (newSettings.numberOfDecks && newSettings.numberOfDecks !== this.settings.numberOfDecks) {
        this.initializeShoe();
      }
    },

    clearHistory() {
      this.history.hands = [];
      this.history.currentHandNumber = 0;
      this.resetAnalysis();
      this.resetBettingStats();
    },

    resetBettingStats() {
      this.bettingStats = {
        totalHands: 0,
        correctBets: 0,
        incorrectBets: 0,
        totalAmountWagered: 0,
        totalWinLoss: 0,
        winRate: 0,
        roi: 0,
        edgeSortingAccuracy: 0,
        pairBetAccuracy: 0,
        longestWinStreak: 0,
        longestLossStreak: 0,
        currentStreak: 0,
        currentStreakType: 'none',
        averageBetSize: 0,
        biggestWin: 0,
        biggestLoss: 0,
        profitableHands: 0,
        breakEvenHands: 0,
        losingHands: 0,
      };
    },

    recordBet(
      betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair',
      amount: number,
      result: HandResult
    ) {
      this.bettingStats.totalHands++;
      this.bettingStats.totalAmountWagered += amount;

      let won = false;
      let payout = 0;
      const payouts = this.settings.payouts;

      // Calculate if bet won and payout
      switch (betType) {
        case 'player':
          won = result.winner === 'player';
          payout = won ? amount * payouts.player : -amount;
          break;
        case 'banker':
          won = result.winner === 'banker';
          if (won) {
            const winnings = amount * payouts.banker;
            const commission = winnings * payouts.bankerCommission;
            payout = winnings - commission; // Net profit after commission
          } else {
            payout = -amount;
          }
          break;
        case 'tie':
          won = result.winner === 'tie';
          payout = won ? amount * payouts.tie : -amount;
          break;
        case 'playerPair':
          won = result.playerPair;
          payout = won ? amount * payouts.playerPair : -amount;
          break;
        case 'bankerPair':
          won = result.bankerPair;
          payout = won ? amount * payouts.bankerPair : -amount;
          break;
      }

      // Update win/loss tracking
      if (won) {
        this.bettingStats.correctBets++;
        this.bettingStats.profitableHands++;
        if (this.bettingStats.currentStreakType === 'win') {
          this.bettingStats.currentStreak++;
        } else {
          this.bettingStats.currentStreak = 1;
          this.bettingStats.currentStreakType = 'win';
        }
        this.bettingStats.longestWinStreak = Math.max(
          this.bettingStats.longestWinStreak,
          this.bettingStats.currentStreak
        );
      } else {
        this.bettingStats.incorrectBets++;
        this.bettingStats.losingHands++;
        if (this.bettingStats.currentStreakType === 'loss') {
          this.bettingStats.currentStreak++;
        } else {
          this.bettingStats.currentStreak = 1;
          this.bettingStats.currentStreakType = 'loss';
        }
        this.bettingStats.longestLossStreak = Math.max(
          this.bettingStats.longestLossStreak,
          this.bettingStats.currentStreak
        );
      }

      // Update financial tracking
      this.bettingStats.totalWinLoss += payout;
      this.bettingStats.biggestWin = Math.max(this.bettingStats.biggestWin, payout);
      this.bettingStats.biggestLoss = Math.min(this.bettingStats.biggestLoss, payout);

      // Calculate derived statistics
      this.bettingStats.winRate = this.bettingStats.correctBets / this.bettingStats.totalHands;
      this.bettingStats.roi =
        this.bettingStats.totalAmountWagered > 0
          ? this.bettingStats.totalWinLoss / this.bettingStats.totalAmountWagered
          : 0;
      this.bettingStats.averageBetSize =
        this.bettingStats.totalAmountWagered / this.bettingStats.totalHands;

      // Calculate edge sorting accuracy (simplified - tracks if we bet on the recommended side)
      const recommendedBet = this.bestBetRecommendation.name.toLowerCase();
      if (betType === 'player' || betType === 'banker') {
        if ((betType === recommendedBet && won) || (betType !== recommendedBet && !won)) {
          // Our edge sorting recommendation was correct
          this.bettingStats.edgeSortingAccuracy =
            (this.bettingStats.edgeSortingAccuracy * (this.bettingStats.totalHands - 1) + 1) /
            this.bettingStats.totalHands;
        } else {
          // Our edge sorting recommendation was wrong
          this.bettingStats.edgeSortingAccuracy =
            (this.bettingStats.edgeSortingAccuracy * (this.bettingStats.totalHands - 1)) /
            this.bettingStats.totalHands;
        }
      }

      // Calculate pair bet accuracy
      if (betType === 'playerPair' || betType === 'bankerPair') {
        const pairBetCount = this.history.hands.filter(h => h.playerPair || h.bankerPair).length;
        if (pairBetCount > 0) {
          this.bettingStats.pairBetAccuracy = won
            ? (this.bettingStats.pairBetAccuracy * (pairBetCount - 1) + 1) / pairBetCount
            : (this.bettingStats.pairBetAccuracy * (pairBetCount - 1)) / pairBetCount;
        }
      }
    },

    // Calculate payout for a given bet type and amount
    calculatePayout(
      betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair',
      betAmount: number,
      won: boolean
    ): number {
      if (!won) {
        return 0;
      }

      const payouts = this.settings.payouts;

      switch (betType) {
        case 'player': {
          return betAmount * (payouts.player + 1);
        }
        case 'banker': {
          const winnings = betAmount * payouts.banker;
          const commission = winnings * payouts.bankerCommission;
          return betAmount + winnings - commission;
        }
        case 'tie': {
          return betAmount * (payouts.tie + 1);
        }
        case 'playerPair': {
          return betAmount * (payouts.playerPair + 1);
        }
        case 'bankerPair': {
          return betAmount * (payouts.bankerPair + 1);
        }
        default:
          return 0;
      }
    },

    // Get expected value for a bet type (for edge calculations)
    getExpectedValue(betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair'): number {
      const payouts = this.settings.payouts;

      // These are approximate probabilities - in a real implementation,
      // these would be calculated based on the current shoe composition
      const probabilities = {
        player: 0.4462,
        banker: 0.4585,
        tie: 0.0953,
        playerPair: 0.0745,
        bankerPair: 0.0745,
      };

      const prob = probabilities[betType];

      switch (betType) {
        case 'player': {
          return prob * payouts.player - (1 - prob);
        }
        case 'banker': {
          const bankerWinnings = payouts.banker * (1 - payouts.bankerCommission);
          return prob * bankerWinnings - (1 - prob);
        }
        case 'tie': {
          return prob * payouts.tie - (1 - prob);
        }
        case 'playerPair': {
          return prob * payouts.playerPair - (1 - prob);
        }
        case 'bankerPair': {
          return prob * payouts.bankerPair - (1 - prob);
        }
        default:
          return 0;
      }
    },

    // Recalculate all statistics when payout settings change
    recalculateBettingStats() {
      // This would be called when payout settings change to update historical ROI calculations
      // For now, we'll just recalculate the current ROI based on existing data
      if (this.bettingStats.totalAmountWagered > 0) {
        this.bettingStats.roi =
          this.bettingStats.totalWinLoss / this.bettingStats.totalAmountWagered;
      }
    },

    setSelectedTab(tabId: string) {
      console.log('[ui-navigation][tab-change] Setting selected tab', {
        previousTab: this.ui.selectedTab,
        newTab: tabId,
      });

      this.ui.selectedTab = tabId;

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('baccarat-selectedTab', tabId);
      }
    },

    async startSession() {
      this.ui.sessionActive = true;
      this.ui.sessionStartTime = Date.now();

      // Initialize a fresh shoe when starting a session
      this.initializeShoe();

      // Record session to Supabase
      try {
        const { sessionService } = await import('../services/sessionService');
        const session = await sessionService.createSession({
          started_at: new Date().toISOString(),
        });

        // Store the session ID for later updates
        this.ui.currentSessionId = session.id;

        console.log('[session-tracking][initialization] Session recorded to database', {
          sessionId: session.id,
        });
      } catch (error) {
        console.error('[session-tracking][error] Failed to record session to database', { error });
        // Continue with local session even if database fails
        // Note: Toast notification is handled by sessionService
      }

      // Session started
    },

    async endSession() {
      // Calculate session duration before clearing session data
      let duration = '00:00:00';
      let handsPlayed = 0;
      let durationSeconds = 0;
      const sessionId = this.ui.currentSessionId;

      if (this.ui.sessionStartTime) {
        const elapsed = Date.now() - this.ui.sessionStartTime;
        durationSeconds = Math.floor(elapsed / 1000);
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        handsPlayed = this.history.hands.length;
      }

      this.ui.sessionActive = false;
      this.ui.sessionStartTime = null;
      this.ui.currentSessionId = null;

      // Update session in Supabase
      if (sessionId) {
        try {
          const { sessionService } = await import('../services/sessionService');
          await sessionService.updateSession(sessionId, {
            ended_at: new Date().toISOString(),
            duration_seconds: durationSeconds,
            total_hands: handsPlayed,
            status: 'completed',
          });

          console.log('[session-tracking][cleanup] Session updated in database', {
            sessionId,
            duration: durationSeconds,
            hands: handsPlayed,
          });
        } catch (error) {
          console.error('[session-tracking][error] Failed to update session in database', {
            error,
            sessionId,
          });
          // Note: Toast notification is handled by sessionService
        }
      }

      // Clear current hand and reset betting stats when ending session
      this.shoe.currentHand = { player: [], banker: [] };
      this.resetBettingStats();

      // Session ended
    },

    setupEdgeSortingDemo() {
      // Create a scenario where edge sorting would be advantageous
      this.initializeShoe();

      // Simulate removing many low-value cards to create high-card rich scenario
      const lowValueRanks = ['A', '2', '3', '4', '5'];
      const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

      // Remove 60% of low-value cards to simulate them being dealt/burned
      for (const rank of lowValueRanks) {
        for (const suit of suits) {
          const key = `${rank}-${suit}`;
          const currentCount = this.shoe.remainingCards.get(key) || 0;
          const newCount = Math.floor(currentCount * 0.4); // Keep only 40%
          this.shoe.remainingCards.set(key, newCount);
        }
      }

      // Also remove some medium cards to make the effect more pronounced
      const mediumRanks = ['6', '7'];
      for (const rank of mediumRanks) {
        for (const suit of suits) {
          const key = `${rank}-${suit}`;
          const currentCount = this.shoe.remainingCards.get(key) || 0;
          const newCount = Math.floor(currentCount * 0.7); // Keep 70%
          this.shoe.remainingCards.set(key, newCount);
        }
      }

      // Recalculate edges to show the advantage
      this.recalculateEdges();
    },

    setupPairBettingDemo() {
      // Create a scenario where pair betting becomes favorable
      this.initializeShoe();

      const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

      // Remove most cards except keep many Aces and Kings
      const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q'];

      // Remove 80% of non-Ace, non-King cards
      for (const rank of ranks) {
        for (const suit of suits) {
          const key = `${rank}-${suit}`;
          const currentCount = this.shoe.remainingCards.get(key) || 0;
          const newCount = Math.floor(currentCount * 0.2); // Keep only 20%
          this.shoe.remainingCards.set(key, newCount);
        }
      }

      // Keep most Aces and Kings to create pair opportunities
      // This creates a scenario where Ace and King pairs become very likely

      // Recalculate edges to show favorable pair betting
      this.recalculateEdges();
    },

    // Professional burn card analysis integration
    runProfessionalBurnAnalysis() {
      // Only run if we have unknown burns to analyze
      const unknownBurns = this.shoe.burnedCards.filter(card => card.isUnknownBurn);
      if (unknownBurns.length === 0) {
        return;
      }

      // Use the professional burn estimation composable
      const burnEstimation = useProfessionalBurnEstimation();

      const analysis = burnEstimation.analyzeBurnScenarios(
        this.shoe.remainingCards,
        this.history.hands,
        this.shoe.burnedCards.filter(card => !card.isUnknownBurn), // Only known burns
        this.currentPenetration
      );

      // Apply the analysis results to our calculations
      this.applyBurnAnalysisToEdges(analysis);

      // Update burn analysis metadata for Kelly and Monte Carlo integration
      this.burnAnalysisMetadata = {
        weightedEdgeImpact: analysis.weightedEdgeImpact,
        uncertaintyLevel: analysis.confidenceInterval
          ? analysis.confidenceInterval[1] - analysis.confidenceInterval[0]
          : 0.1,
        kellyMultiplier: analysis.kellyMultiplier,
        monteCarloAdjustment: analysis.monteCarloAdjustment,
        lastUpdated: Date.now(),
      };

      console.log('Professional burn analysis completed:', {
        scenarios: analysis.scenarios.length,
        weightedEdgeImpact: analysis.weightedEdgeImpact,
        kellyMultiplier: analysis.kellyMultiplier,
        recommendedAction: analysis.recommendedAction,
      });
    },

    applyBurnAnalysisToEdges(analysis: {
      weightedEdgeImpact?: number;
      confidenceInterval?: [number, number];
      kellyMultiplier?: number;
      monteCarloAdjustment?: number;
      uncertaintyLevel?: number;
    }) {
      if (!analysis) {
        return;
      }

      // Create burn analysis metadata using standardized service
      const burnMetadata: BurnAnalysisMetadata = {
        weightedEdgeImpact: analysis.weightedEdgeImpact || 0,
        uncertaintyLevel: analysis.uncertaintyLevel || 0.1,
        kellyMultiplier: analysis.kellyMultiplier || 1.0,
        monteCarloAdjustment: analysis.monteCarloAdjustment || 1.0,
        lastUpdated: Date.now(),
      };

      // Validate metadata using standardized service
      if (!BurnAnalysisIntegration.validateMetadata(burnMetadata)) {
        console.warn('Invalid burn analysis metadata, using defaults');
        this.burnAnalysisMetadata = BurnAnalysisIntegration.createDefaultMetadata();
        return;
      }

      // Store the validated metadata
      this.burnAnalysisMetadata = burnMetadata;

      // Apply edge adjustments using standardized integration
      this.edgeCalculations = BurnAnalysisIntegration.applyToEdges(
        this.edgeCalculations,
        this.burnAnalysisMetadata
      );

      console.log('Applied burn analysis to edges using standardized integration:', {
        burnMetadata: this.burnAnalysisMetadata,
        updatedEdges: this.edgeCalculations,
      });
    },

    // Auto-run professional burn analysis when conditions change
    triggerProfessionalBurnAnalysis() {
      try {
        // Only run if we have enough data and penetration
        if (this.history.hands.length >= 3 && this.currentPenetration > 0.1) {
          this.runProfessionalBurnAnalysis();
        } else {
          console.log('Insufficient data for professional burn analysis:', {
            hands: this.history.hands.length,
            penetration: this.currentPenetration,
            required: { minHands: 3, minPenetration: 0.1 },
          });
        }
      } catch (error) {
        console.error('Error triggering professional burn analysis:', error);
      }
    },
  },
});
