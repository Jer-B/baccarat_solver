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
} from '../types/cards';

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
    globalToggleMode: boolean; // When true, all toggles are active; when false, all sections are hidden by default
    visibility: {
      shoeComposition: {
        cutCardInfo: boolean;
      };
      payoutSettings: {
        payoutExamples: boolean;
        presetInfo: boolean;
      };
      pairAnalysis: {
        legendInfo: boolean;
      };
      bettingInterface: {
        payoutInfo: boolean;
      };
    };
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
      selectedTab: 'game',
      showAdvancedFeatures: false,
      isCalculating: false,
      globalToggleMode: true, // Default to showing all sections
      visibility: {
        shoeComposition: {
          cutCardInfo: true,
        },
        payoutSettings: {
          payoutExamples: true,
          presetInfo: true,
        },
        pairAnalysis: {
          legendInfo: true,
        },
        bettingInterface: {
          payoutInfo: true,
        },
      },
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

      const bets = [
        { name: 'Player', edge: edges.playerEdge, type: 'player' },
        { name: 'Banker', edge: edges.bankerEdge, type: 'banker' },
        { name: 'Tie', edge: edges.tieEdge, type: 'tie' },
        { name: 'Player Pair', edge: edges.playerPairEdge, type: 'playerPair' },
        { name: 'Banker Pair', edge: edges.bankerPairEdge, type: 'bankerPair' },
      ];

      // Calculate Kelly percentage for each bet type
      const kellyBets = bets.map(bet => {
        // Simplified Kelly calculation: f = (bp - q) / b
        // where b = odds, p = win probability, q = loss probability
        const winProbability = Math.max(0.01, Math.min(0.99, 0.5 + bet.edge)); // Adjust probability based on edge
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

        const kellyPercentage = Math.max(0, (odds * winProbability - lossProbability) / odds);

        return {
          ...bet,
          kellyPercentage,
          winProbability,
          odds,
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

    // Global visibility getter that respects globalToggleMode
    isVisible: state => (section: string, subsection: string) => {
      if (!state.ui.globalToggleMode) {
        return false; // If global toggle is off, hide everything
      }

      // Access nested visibility settings
      const sectionVisibility = (state.ui.visibility as Record<string, Record<string, boolean>>)[
        section
      ];
      if (!sectionVisibility) return false;

      return sectionVisibility[subsection] ?? false;
    },

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
      if (!this.shoe.cutCardPosition) return 0;

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

      if (totalCardsRemaining < 2) return -1; // Can't form pairs with less than 2 cards

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

      if (totalCardsRemaining === 0) return 0;

      // Edge sorting focuses on identifying high-value vs low-value cards
      // High cards (6,7,8,9,10,J,Q,K,A) favor banker slightly
      // Low cards (A,2,3,4,5) favor player slightly

      const highValueRanks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const lowValueRanks = ['A', '2', '3', '4', '5'];

      let highValueCards = 0;
      let _lowValueCards = 0;

      // Count remaining high and low value cards
      for (const rank of highValueRanks) {
        for (const suit of suits) {
          highValueCards += remainingCards.get(`${rank}-${suit}`) || 0;
        }
      }

      for (const rank of lowValueRanks) {
        for (const suit of suits) {
          _lowValueCards += remainingCards.get(`${rank}-${suit}`) || 0;
        }
      }

      // Calculate the imbalance
      const highValueRatio = highValueCards / totalCardsRemaining;
      const expectedRatio = 0.5; // In a balanced shoe, should be roughly 50/50

      // Edge sorting advantage is proportional to the imbalance
      // Positive advantage when more high cards remain (favors banker)
      // Negative advantage when more low cards remain (favors player)
      const imbalance = highValueRatio - expectedRatio;

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
      if (!won) return 0;

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

    toggleGlobalVisibility() {
      this.ui.globalToggleMode = !this.ui.globalToggleMode;
    },

    setGlobalVisibility(visible: boolean) {
      this.ui.globalToggleMode = visible;
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
  },
});
