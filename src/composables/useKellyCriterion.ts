// =============================================================================
// USE KELLY CRITERION COMPOSABLE
// =============================================================================
// Professional Kelly Criterion calculations for optimal bet sizing
// Integrates with burn analysis, edge calculations, and risk management

import { ref, computed, watch, readonly } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import type { BetType } from '@/config/bettingInterfaceSettings';
import type { PayoutValues } from '@/config/payoutSettings';

/**
 * Kelly recommendation interface
 */
export interface KellyRecommendation {
  optimalBetSize: number;
  kellyPercentage: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  confidence: number;
  expectedValue: number;
  riskOfRuin: number;
  recommendedBetType: BetType | null;
}

/**
 * Kelly calculation parameters
 */
export interface KellyParams {
  edge: number;
  winProbability: number;
  payout: number;
  bankroll: number;
  fractionalKelly?: number;
  maxKellyPercentage?: number;
}

/**
 * Kelly Criterion composable for professional bet sizing calculations
 */
export function useKellyCriterion() {
  // =============================================================================
  // REACTIVE STATE
  // =============================================================================

  const store = useBaccaratStore();

  // Current Kelly recommendation
  const currentRecommendation = ref<KellyRecommendation | null>(null);

  // Calculation parameters
  const isCalculating = ref(false);
  const lastCalculationTime = ref<Date | null>(null);

  // Kelly history for analysis
  const kellyHistory = ref<KellyRecommendation[]>([]);

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  // Kelly settings from store
  const kellySettings = computed(() => store.settings.kelly);

  // Current bankroll from UI state
  const currentBankroll = computed(() => store.ui.currentBalance);

  // Edge calculations from store
  const edgeCalculations = computed(() => store.edgeCalculations);

  // Best bet recommendation based on Kelly
  const bestKellyBet = computed(() => store.kellyBestBet);

  // Kelly status indicator
  const kellyStatus = computed(() => {
    if (!currentRecommendation.value) {
      return { status: 'inactive', color: 'gray' } as const;
    }

    const kelly = currentRecommendation.value;
    if (kelly.kellyPercentage > kellySettings.value.maxKellyPercentage) {
      return { status: 'high_risk', color: 'red' } as const;
    }
    if (kelly.kellyPercentage > 0.1) {
      return { status: 'favorable', color: 'green' } as const;
    }
    if (kelly.kellyPercentage > 0.02) {
      return { status: 'moderate', color: 'yellow' } as const;
    }
    return { status: 'unfavorable', color: 'red' } as const;
  });

  // =============================================================================
  // KELLY CALCULATION METHODS
  // =============================================================================

  /**
   * Calculate Kelly percentage using the standard formula
   * f* = (bp - q) / b
   * where:
   * - f* = fraction of capital to wager
   * - b = odds received on the wager (payout ratio)
   * - p = probability of winning
   * - q = probability of losing (1 - p)
   */
  const calculateKellyPercentage = (params: KellyParams): number => {
    const { edge, winProbability, payout } = params;

    // Validate inputs
    if (winProbability <= 0 || winProbability >= 1) {
      console.warn('[kelly-criterion][calculation] Invalid win probability', winProbability);
      return 0;
    }

    if (payout <= 0) {
      console.warn('[kelly-criterion][calculation] Invalid payout ratio', payout);
      return 0;
    }

    const lossProbability = 1 - winProbability;

    // Kelly formula: f* = (bp - q) / b
    const kellyPercentage = (payout * winProbability - lossProbability) / payout;

    // Apply fractional Kelly for safety
    const fractionalKelly = params.fractionalKelly ?? kellySettings.value.fractionalKelly;
    const adjustedKelly = kellyPercentage * fractionalKelly;

    // Cap at maximum allowed percentage
    const maxKelly = params.maxKellyPercentage ?? kellySettings.value.maxKellyPercentage;
    const finalKelly = Math.max(0, Math.min(adjustedKelly, maxKelly));

    console.log('[kelly-criterion][calculation] Kelly calculation', {
      winProbability,
      lossProbability,
      payout,
      rawKelly: kellyPercentage,
      fractionalKelly,
      adjustedKelly,
      maxKelly,
      finalKelly,
    });

    return finalKelly;
  };

  /**
   * Calculate optimal bet size based on Kelly percentage
   */
  const calculateOptimalBetSize = (kellyPercentage: number, bankroll: number): number => {
    const betSize = bankroll * kellyPercentage;

    // Ensure minimum bet size
    const minBet = 1; // $1 minimum
    const maxBet = bankroll * 0.5; // Never bet more than 50% of bankroll

    return Math.max(minBet, Math.min(betSize, maxBet));
  };

  /**
   * Calculate risk of ruin for given Kelly percentage
   */
  const calculateRiskOfRuin = (kellyPercentage: number, winProbability: number): number => {
    if (kellyPercentage <= 0 || winProbability >= 1) {
      return 0;
    }

    // Simplified risk of ruin calculation
    const edge = winProbability * 2 - 1; // Convert to edge
    if (edge <= 0) {
      return 1;
    } // Negative edge = certain ruin eventually

    // Risk of ruin formula for Kelly betting
    const riskOfRuin = Math.pow(
      (1 - winProbability) / winProbability,
      (1 / kellyPercentage) * edge
    );

    return Math.min(riskOfRuin, 1);
  };

  /**
   * Determine risk level based on Kelly percentage and other factors
   */
  const determineRiskLevel = (kellyPercentage: number): KellyRecommendation['riskLevel'] => {
    if (kellyPercentage > 0.15) {
      return 'aggressive';
    }
    if (kellyPercentage > 0.05) {
      return 'moderate';
    }
    return 'conservative';
  };

  // =============================================================================
  // MAIN CALCULATION FUNCTIONS
  // =============================================================================

  /**
   * Calculate Kelly recommendation for a specific bet type
   */
  const calculateKellyForBetType = (
    betType: BetType,
    payoutValues: PayoutValues,
    bankroll: number
  ): KellyRecommendation | null => {
    console.log('[kelly-criterion][calculate] Calculating Kelly for bet type', {
      betType,
      bankroll,
      payoutValues,
    });

    // Get edge for this bet type
    const edges = edgeCalculations.value;
    let edge: number;
    let payout: number;

    switch (betType) {
      case 'player':
        edge = edges.playerEdge;
        payout = payoutValues.player_payout;
        break;
      case 'banker':
        edge = edges.bankerEdge;
        payout = payoutValues.banker_payout;
        break;
      case 'tie':
        edge = edges.tieEdge;
        payout = payoutValues.tie_payout;
        break;
      case 'playerPair':
        edge = edges.playerPairEdge;
        payout = payoutValues.player_pair_payout;
        break;
      case 'bankerPair':
        edge = edges.bankerPairEdge;
        payout = payoutValues.banker_pair_payout;
        break;
      default:
        console.warn('[kelly-criterion][calculate] Unknown bet type', betType);
        return null;
    }

    // Calculate win probability from edge
    // For even money bets: edge = (p * 1) - ((1-p) * 1) = 2p - 1
    // So: p = (edge + 1) / 2
    let winProbability: number;

    if (betType === 'player' || betType === 'banker') {
      winProbability = (edge + 1) / 2;
    } else {
      // For other bets, use house edge to derive probability
      // This is a simplified calculation - in reality it's more complex
      winProbability = Math.max(0.01, Math.min(0.99, 0.5 + edge / 2));
    }

    // Apply burn analysis adjustments if available
    if (store.burnAnalysisMetadata?.kellyMultiplier) {
      edge *= store.burnAnalysisMetadata.kellyMultiplier;
      console.log('[kelly-criterion][burn-adjustment] Applied burn analysis adjustment', {
        originalEdge: edge / store.burnAnalysisMetadata.kellyMultiplier,
        kellyMultiplier: store.burnAnalysisMetadata.kellyMultiplier,
        adjustedEdge: edge,
      });
    }

    // Calculate Kelly percentage
    const kellyParams: KellyParams = {
      edge,
      winProbability,
      payout,
      bankroll,
    };

    const kellyPercentage = calculateKellyPercentage(kellyParams);
    const optimalBetSize = calculateOptimalBetSize(kellyPercentage, bankroll);
    const riskOfRuin = calculateRiskOfRuin(kellyPercentage, winProbability);
    const riskLevel = determineRiskLevel(kellyPercentage);

    // Calculate expected value
    const expectedValue =
      winProbability * optimalBetSize * payout - (1 - winProbability) * optimalBetSize;

    // Calculate confidence based on edge strength and sample size
    const confidence = Math.min(0.95, Math.max(0.1, Math.abs(edge) * 10 + 0.5));

    const recommendation: KellyRecommendation = {
      optimalBetSize,
      kellyPercentage,
      riskLevel,
      confidence,
      expectedValue,
      riskOfRuin,
      recommendedBetType: kellyPercentage > 0.01 ? betType : null,
    };

    console.log('[kelly-criterion][result] Kelly calculation completed', {
      betType,
      recommendation,
      kellyParams,
    });

    return recommendation;
  };

  /**
   * Calculate Kelly recommendations for all bet types and return the best one
   */
  const calculateOptimalKellyRecommendation = (
    payoutValues: PayoutValues,
    bankroll: number
  ): KellyRecommendation | null => {
    console.log('[kelly-criterion][optimal] Calculating optimal Kelly recommendation', {
      bankroll,
      payoutValues,
    });

    isCalculating.value = true;

    try {
      const betTypes: BetType[] = ['player', 'banker', 'tie', 'playerPair', 'bankerPair'];
      const recommendations: (KellyRecommendation & { betType: BetType })[] = [];

      // Calculate Kelly for each bet type
      for (const betType of betTypes) {
        const recommendation = calculateKellyForBetType(betType, payoutValues, bankroll);
        if (recommendation && recommendation.kellyPercentage > 0) {
          recommendations.push({ ...recommendation, betType });
        }
      }

      // Sort by expected value adjusted for risk
      recommendations.sort((a, b) => {
        const aScore = a.expectedValue * (1 - a.riskOfRuin) * a.confidence;
        const bScore = b.expectedValue * (1 - b.riskOfRuin) * b.confidence;
        return bScore - aScore;
      });

      const bestRecommendation = recommendations[0];

      if (bestRecommendation) {
        const finalRecommendation: KellyRecommendation = {
          optimalBetSize: bestRecommendation.optimalBetSize,
          kellyPercentage: bestRecommendation.kellyPercentage,
          riskLevel: bestRecommendation.riskLevel,
          confidence: bestRecommendation.confidence,
          expectedValue: bestRecommendation.expectedValue,
          riskOfRuin: bestRecommendation.riskOfRuin,
          recommendedBetType: bestRecommendation.betType,
        };

        // Update current recommendation
        currentRecommendation.value = finalRecommendation;
        lastCalculationTime.value = new Date();

        // Add to history (keep last 100)
        kellyHistory.value.push(finalRecommendation);
        if (kellyHistory.value.length > 100) {
          kellyHistory.value = kellyHistory.value.slice(-100);
        }

        console.log('[kelly-criterion][optimal] Optimal recommendation calculated', {
          recommendedBetType: bestRecommendation.betType,
          optimalBetSize: finalRecommendation.optimalBetSize,
          kellyPercentage: finalRecommendation.kellyPercentage,
          expectedValue: finalRecommendation.expectedValue,
          totalRecommendations: recommendations.length,
        });

        return finalRecommendation;
      }

      console.log('[kelly-criterion][optimal] No favorable Kelly recommendations found');
      currentRecommendation.value = null;
      return null;
    } catch (error) {
      console.error('[kelly-criterion][optimal] Error calculating Kelly recommendation', error);
      return null;
    } finally {
      isCalculating.value = false;
    }
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Format Kelly recommendation for display
   */
  const formatRecommendation = (recommendation: KellyRecommendation): string => {
    if (!recommendation.recommendedBetType) {
      return 'No favorable bets identified';
    }

    const betType = recommendation.recommendedBetType.toUpperCase();
    const betSize = recommendation.optimalBetSize.toFixed(2);
    const percentage = (recommendation.kellyPercentage * 100).toFixed(1);

    return `${betType}: $${betSize} (${percentage}% of bankroll)`;
  };

  /**
   * Get Kelly advice based on current recommendation
   */
  const getKellyAdvice = (): string => {
    if (!currentRecommendation.value) {
      return 'Waiting for edge calculations to complete...';
    }

    const rec = currentRecommendation.value;

    if (!rec.recommendedBetType) {
      return 'No favorable betting opportunities detected. Consider waiting for better conditions.';
    }

    switch (rec.riskLevel) {
      case 'conservative':
        return `Conservative opportunity: ${formatRecommendation(rec)}. Low risk approach recommended.`;
      case 'moderate':
        return `Moderate opportunity: ${formatRecommendation(rec)}. Balanced risk-reward scenario.`;
      case 'aggressive':
        return `High-confidence opportunity: ${formatRecommendation(rec)}. Strong edge detected but higher risk.`;
      default:
        return formatRecommendation(rec);
    }
  };

  /**
   * Check if Kelly recommendation has changed significantly
   */
  const hasSignificantChange = (threshold: number = 0.02): boolean => {
    if (kellyHistory.value.length < 2) {
      return false;
    }

    const current = kellyHistory.value[kellyHistory.value.length - 1];
    const previous = kellyHistory.value[kellyHistory.value.length - 2];

    const percentageChange = Math.abs(current.kellyPercentage - previous.kellyPercentage);
    const sizeChange = Math.abs(current.optimalBetSize - previous.optimalBetSize);

    return percentageChange >= threshold || sizeChange >= 5; // $5 threshold
  };

  // =============================================================================
  // WATCHERS
  // =============================================================================

  // Watch for edge calculation changes
  watch(
    () => edgeCalculations.value,
    newEdges => {
      console.log('[kelly-criterion][watch] Edge calculations updated', newEdges);
      // Auto-recalculate if enabled and we have a bankroll
      if (kellySettings.value.enabled && currentBankroll.value > 0) {
        // Debounce calculation to avoid excessive recalculation
        setTimeout(() => {
          // This would be triggered by the component using this composable
        }, 500);
      }
    },
    { deep: true }
  );

  // Watch for bankroll changes
  watch(
    () => currentBankroll.value,
    newBankroll => {
      console.log('[kelly-criterion][watch] Bankroll updated', { newBankroll });
      if (newBankroll <= 0) {
        currentRecommendation.value = null;
      }
    }
  );

  // =============================================================================
  // RETURN COMPOSABLE API
  // =============================================================================

  return {
    // Reactive state
    currentRecommendation: readonly(currentRecommendation),
    kellyHistory: readonly(kellyHistory),
    kellyStatus: readonly(kellyStatus),
    bestKellyBet: readonly(bestKellyBet),

    // Loading states
    isCalculating: readonly(isCalculating),
    lastCalculationTime: readonly(lastCalculationTime),

    // Calculation methods
    calculateKellyForBetType,
    calculateOptimalKellyRecommendation,

    // Utility methods
    formatRecommendation,
    getKellyAdvice,
    hasSignificantChange,

    // Settings
    kellySettings: readonly(kellySettings),
  };
}
