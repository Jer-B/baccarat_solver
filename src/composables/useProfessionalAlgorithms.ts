// =============================================================================
// USE PROFESSIONAL ALGORITHMS COMPOSABLE
// =============================================================================
// Comprehensive integration of Kelly Criterion, Monte Carlo, and Burn Analysis
// Provides unified recommendations for professional gambling operations

import { ref, computed, watch, readonly, nextTick } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useKellyCriterion, type KellyRecommendation } from './useKellyCriterion';
import { useMonteCarloSimulation, type MonteCarloAnalysis } from './useMonteCarloSimulation';
import { useProfessionalBurnEstimation } from './useProfessionalBurnEstimation';
import { useNotifications } from './useNotifications';
import type { BetType } from '@/config/bettingInterfaceSettings';
import type { PayoutValues } from '@/config/payoutSettings';
import type { HandResult } from '@/types/cards';

/**
 * Unified professional recommendation
 */
export interface ProfessionalRecommendation {
  // Primary recommendation
  recommendedBetType: BetType | null;
  recommendedBetSize: number;
  confidence: number;

  // Supporting data
  kellyRecommendation: KellyRecommendation | null;
  monteCarloAnalysis: MonteCarloAnalysis | null;
  burnAnalysisEdge: number;

  // Risk assessment
  overallRiskLevel: 'low' | 'medium' | 'high';
  riskOfRuin: number;
  expectedValue: number;

  // Explanations
  rationale: string;
  warnings: string[];

  // Metadata
  calculationTime: number;
  lastUpdated: Date;
}

/**
 * Algorithm performance tracking
 */
export interface AlgorithmPerformance {
  kelly: {
    accuracy: number;
    avgProfit: number;
    recommendationCount: number;
  };
  monteCarlo: {
    predictionAccuracy: number;
    riskAssessmentAccuracy: number;
    simulationCount: number;
  };
  burnAnalysis: {
    edgeImprovementAccuracy: number;
    edgeAdjustmentMagnitude: number;
    analysisCount: number;
  };
}

/**
 * Professional algorithms composable for unified algorithm coordination
 */
export function useProfessionalAlgorithms() {
  // =============================================================================
  // DEPENDENCIES
  // =============================================================================

  const store = useBaccaratStore();
  const kellyCriterion = useKellyCriterion();
  const monteCarlo = useMonteCarloSimulation();
  const burnEstimation = useProfessionalBurnEstimation();
  const { success, warning, error } = useNotifications();

  // =============================================================================
  // REACTIVE STATE
  // =============================================================================

  // Current unified recommendation
  const currentRecommendation = ref<ProfessionalRecommendation | null>(null);

  // Algorithm performance tracking
  const algorithmPerformance = ref<AlgorithmPerformance>({
    kelly: { accuracy: 0, avgProfit: 0, recommendationCount: 0 },
    monteCarlo: { predictionAccuracy: 0, riskAssessmentAccuracy: 0, simulationCount: 0 },
    burnAnalysis: { edgeImprovementAccuracy: 0, edgeAdjustmentMagnitude: 0, analysisCount: 0 },
  });

  // Calculation state
  const isCalculating = ref(false);
  const calculationProgress = ref(0);
  const lastCalculationTime = ref<Date | null>(null);

  // Algorithm flags
  const algorithmsEnabled = ref({
    kelly: true,
    monteCarlo: true,
    burnAnalysis: true,
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  // Current bankroll
  const currentBankroll = computed(() => store.ui.currentBalance);

  // Overall algorithm status
  const algorithmStatus = computed(() => {
    if (isCalculating.value) {
      return { status: 'calculating', color: 'blue' } as const;
    }
    if (!currentRecommendation.value) {
      return { status: 'inactive', color: 'gray' } as const;
    }

    const rec = currentRecommendation.value;
    if (rec.confidence > 0.8 && rec.recommendedBetType) {
      return { status: 'high_confidence', color: 'green' } as const;
    }
    if (rec.confidence > 0.6 && rec.recommendedBetType) {
      return { status: 'moderate_confidence', color: 'yellow' } as const;
    }
    if (rec.warnings.length > 0) {
      return { status: 'warning', color: 'orange' } as const;
    }
    return { status: 'low_confidence', color: 'red' } as const;
  });

  // Recommendation summary
  const recommendationSummary = computed(() => {
    if (!currentRecommendation.value) {
      return 'No professional recommendations available';
    }

    const rec = currentRecommendation.value;
    if (!rec.recommendedBetType) {
      return 'No favorable betting opportunities detected';
    }

    const betType = rec.recommendedBetType.toUpperCase();
    const betSize = rec.recommendedBetSize.toFixed(2);
    const confidence = (rec.confidence * 100).toFixed(0);

    return `${betType}: $${betSize} (${confidence}% confidence)`;
  });

  // =============================================================================
  // MAIN CALCULATION FUNCTIONS
  // =============================================================================

  /**
   * Calculate unified professional recommendation
   */
  const calculateUnifiedRecommendation = async (
    payoutValues: PayoutValues,
    bankroll: number
  ): Promise<ProfessionalRecommendation | null> => {
    console.log('[professional-algorithms][unified] Starting unified calculation', {
      bankroll,
      payoutValues,
      enabledAlgorithms: algorithmsEnabled.value,
    });

    const startTime = Date.now();
    isCalculating.value = true;
    calculationProgress.value = 0;

    try {
      const warnings: string[] = [];
      let kellyRecommendation: KellyRecommendation | null = null;
      let monteCarloAnalysis: MonteCarloAnalysis | null = null;
      let burnAnalysisEdge = 0;

      // Step 1: Kelly Criterion calculation (30% of progress)
      if (algorithmsEnabled.value.kelly) {
        calculationProgress.value = 10;
        console.log('[professional-algorithms][kelly] Calculating Kelly recommendation');

        kellyRecommendation = kellyCriterion.calculateOptimalKellyRecommendation(
          payoutValues,
          bankroll
        );

        if (!kellyRecommendation) {
          warnings.push('Kelly Criterion found no favorable betting opportunities');
        }

        calculationProgress.value = 30;
      }

      // Step 2: Monte Carlo simulation (40% of progress)
      if (algorithmsEnabled.value.monteCarlo) {
        calculationProgress.value = 40;
        console.log('[professional-algorithms][monte-carlo] Running Monte Carlo analysis');

        try {
          monteCarloAnalysis = await monteCarlo.runComprehensiveAnalysis(payoutValues, bankroll);

          if (
            !monteCarloAnalysis.bestScenario ||
            monteCarloAnalysis.bestScenario.recommendation !== 'favorable'
          ) {
            warnings.push('Monte Carlo simulation shows unfavorable risk-reward profile');
          }
        } catch (err) {
          console.warn('[professional-algorithms][monte-carlo] Monte Carlo failed', err);
          warnings.push('Monte Carlo simulation encountered errors');
        }

        calculationProgress.value = 70;
      }

      // Step 3: Burn analysis integration (20% of progress)
      if (algorithmsEnabled.value.burnAnalysis && store.burnAnalysisMetadata) {
        calculationProgress.value = 80;
        console.log('[professional-algorithms][burn-analysis] Integrating burn analysis');

        burnAnalysisEdge = store.burnAnalysisMetadata.weightedEdgeImpact;

        if (Math.abs(burnAnalysisEdge) < 0.001) {
          warnings.push('Burn analysis shows minimal edge impact');
        }

        calculationProgress.value = 90;
      }

      // Step 4: Unified recommendation synthesis (10% of progress)
      calculationProgress.value = 95;

      const unifiedRecommendation = synthesizeRecommendation(
        kellyRecommendation,
        monteCarloAnalysis,
        burnAnalysisEdge,
        warnings,
        startTime
      );

      calculationProgress.value = 100;

      // Update state
      currentRecommendation.value = unifiedRecommendation;
      lastCalculationTime.value = new Date();

      console.log('[professional-algorithms][unified] Unified calculation completed', {
        recommendedBetType: unifiedRecommendation.recommendedBetType,
        recommendedBetSize: unifiedRecommendation.recommendedBetSize,
        confidence: unifiedRecommendation.confidence,
        calculationTime: unifiedRecommendation.calculationTime,
        warnings: warnings.length,
      });

      // Show notification for significant recommendations
      if (unifiedRecommendation.confidence > 0.7 && unifiedRecommendation.recommendedBetType) {
        success(
          `🎯 High-confidence opportunity: ${unifiedRecommendation.recommendedBetType.toUpperCase()} - $${unifiedRecommendation.recommendedBetSize.toFixed(2)}`,
          { timeout: 5000 }
        );
      } else if (warnings.length > 0) {
        warning(
          `⚠️ Professional analysis shows ${warnings.length} concern${warnings.length > 1 ? 's' : ''}`,
          { timeout: 4000 }
        );
      }

      return unifiedRecommendation;
    } catch (err) {
      console.error('[professional-algorithms][unified] Error during calculation', err);
      error('❌ Professional algorithm calculation failed', { timeout: 5000 });
      return null;
    } finally {
      isCalculating.value = false;
      calculationProgress.value = 0;
    }
  };

  /**
   * Synthesize unified recommendation from individual algorithms
   */
  const synthesizeRecommendation = (
    kellyRec: KellyRecommendation | null,
    monteCarloAnalysis: MonteCarloAnalysis | null,
    burnEdge: number,
    warnings: string[],
    startTime: number
  ): ProfessionalRecommendation => {
    console.log('[professional-algorithms][synthesis] Synthesizing recommendation', {
      hasKelly: Boolean(kellyRec),
      hasMonteCarlo: Boolean(monteCarloAnalysis),
      burnEdge,
      warnings: warnings.length,
    });

    // Determine best bet type by algorithm consensus
    let recommendedBetType: BetType | null = null;
    let recommendedBetSize = 0;
    let confidence = 0;
    let overallRiskLevel: 'low' | 'medium' | 'high' = 'high';
    let riskOfRuin = 1;
    let expectedValue = 0;

    // Algorithm voting system
    const betTypeVotes: Partial<Record<BetType, number>> = {};
    const confidenceFactors: number[] = [];

    // Kelly Criterion vote
    if (kellyRec?.recommendedBetType) {
      betTypeVotes[kellyRec.recommendedBetType] =
        (betTypeVotes[kellyRec.recommendedBetType] || 0) + 1;
      confidenceFactors.push(kellyRec.confidence);

      if (!recommendedBetType || kellyRec.confidence > confidence) {
        recommendedBetType = kellyRec.recommendedBetType;
        recommendedBetSize = kellyRec.optimalBetSize;
        confidence = kellyRec.confidence;
        riskOfRuin = kellyRec.riskOfRuin;
        expectedValue = kellyRec.expectedValue;
      }
    }

    // Monte Carlo vote
    if (monteCarloAnalysis?.bestScenario?.recommendation === 'favorable') {
      const mcBetType = monteCarloAnalysis.bestScenario.betType;
      betTypeVotes[mcBetType] = (betTypeVotes[mcBetType] || 0) + 1;

      const mcConfidence = 1 - monteCarloAnalysis.bestScenario.result.riskOfRuin;
      confidenceFactors.push(mcConfidence);

      // Monte Carlo provides risk assessment
      if (monteCarloAnalysis.bestScenario.riskLevel === 'low') {
        overallRiskLevel = 'low';
      } else if (
        monteCarloAnalysis.bestScenario.riskLevel === 'medium' &&
        overallRiskLevel === 'high'
      ) {
        overallRiskLevel = 'medium';
      }

      // Update risk metrics
      riskOfRuin = Math.max(riskOfRuin, monteCarloAnalysis.bestScenario.result.riskOfRuin);
      expectedValue = Math.max(expectedValue, monteCarloAnalysis.bestScenario.result.expectedValue);
    }

    // Burn analysis adjustment
    if (Math.abs(burnEdge) > 0.005) {
      // Significant burn edge detected
      if (burnEdge > 0) {
        confidenceFactors.push(0.8); // High confidence boost
      } else {
        confidenceFactors.push(0.3); // Confidence penalty
        warnings.push('Burn analysis suggests unfavorable conditions');
      }
    }

    // Calculate final confidence as weighted average
    if (confidenceFactors.length > 0) {
      confidence =
        confidenceFactors.reduce((sum, factor) => sum + factor, 0) / confidenceFactors.length;
    }

    // Apply consensus penalty if algorithms disagree
    const uniqueVotes = Object.keys(betTypeVotes).length;
    if (uniqueVotes > 1) {
      confidence *= 0.8; // 20% penalty for disagreement
      warnings.push('Professional algorithms show mixed signals');
    }

    // Final recommendation validation
    if (confidence < 0.5 || expectedValue <= 0 || riskOfRuin > 0.2) {
      recommendedBetType = null;
      recommendedBetSize = 0;
      warnings.push('Professional analysis recommends avoiding betting in current conditions');
    }

    // Generate rationale
    const rationale = generateRationale(kellyRec, monteCarloAnalysis, burnEdge, confidence);

    const recommendation: ProfessionalRecommendation = {
      recommendedBetType,
      recommendedBetSize,
      confidence,
      kellyRecommendation: kellyRec,
      monteCarloAnalysis,
      burnAnalysisEdge: burnEdge,
      overallRiskLevel,
      riskOfRuin,
      expectedValue,
      rationale,
      warnings,
      calculationTime: Date.now() - startTime,
      lastUpdated: new Date(),
    };

    console.log('[professional-algorithms][synthesis] Recommendation synthesized', {
      recommendation: {
        betType: recommendedBetType,
        betSize: recommendedBetSize,
        confidence,
        riskLevel: overallRiskLevel,
      },
      votingResults: betTypeVotes,
      confidenceFactors,
    });

    return recommendation;
  };

  /**
   * Generate human-readable rationale
   */
  const generateRationale = (
    kellyRec: KellyRecommendation | null,
    monteCarloAnalysis: MonteCarloAnalysis | null,
    burnEdge: number,
    confidence: number
  ): string => {
    const parts: string[] = [];

    if (kellyRec?.recommendedBetType) {
      parts.push(
        `Kelly Criterion suggests ${kellyRec.recommendedBetType.toUpperCase()} with ${(kellyRec.kellyPercentage * 100).toFixed(1)}% of bankroll`
      );
    }

    if (monteCarloAnalysis?.bestScenario) {
      const mc = monteCarloAnalysis.bestScenario;
      parts.push(
        `Monte Carlo simulation shows ${(mc.result.probabilityOfProfit * 100).toFixed(1)}% win probability with ${mc.riskLevel} risk`
      );
    }

    if (Math.abs(burnEdge) > 0.001) {
      const direction = burnEdge > 0 ? 'favorable' : 'unfavorable';
      parts.push(
        `Burn analysis indicates ${direction} edge adjustment of ${(Math.abs(burnEdge) * 100).toFixed(2)}%`
      );
    }

    if (parts.length === 0) {
      return 'Professional algorithms recommend waiting for better conditions';
    }

    return `${parts.join('. ')}.`;
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Get professional advice based on current recommendation
   */
  const getProfessionalAdvice = (): string => {
    if (!currentRecommendation.value) {
      return 'Run professional analysis to get algorithm-based recommendations';
    }

    const rec = currentRecommendation.value;

    if (rec.warnings.length > 0) {
      return `⚠️ ${rec.warnings[0]} Consider waiting for more favorable conditions.`;
    }

    if (!rec.recommendedBetType) {
      return 'No favorable betting opportunities detected by professional algorithms. Consider waiting.';
    }

    const confidenceLevel =
      rec.confidence > 0.8 ? 'High' : rec.confidence > 0.6 ? 'Moderate' : 'Low';

    return `${confidenceLevel} confidence recommendation: ${rec.rationale}`;
  };

  /**
   * Check if algorithms need recalculation
   */
  const needsRecalculation = (): boolean => {
    if (!lastCalculationTime.value) {
      return true;
    }

    const timeSinceLastCalc = Date.now() - lastCalculationTime.value.getTime();

    // Recalculate every 2 minutes or on significant changes
    return timeSinceLastCalc > 2 * 60 * 1000;
  };

  /**
   * Toggle algorithm enabled state
   */
  const toggleAlgorithm = (algorithm: keyof typeof algorithmsEnabled.value): void => {
    algorithmsEnabled.value[algorithm] = !algorithmsEnabled.value[algorithm];

    console.log('[professional-algorithms][toggle] Algorithm toggled', {
      algorithm,
      enabled: algorithmsEnabled.value[algorithm],
    });

    // Trigger recalculation if algorithms are enabled
    if (algorithmsEnabled.value[algorithm] && currentBankroll.value > 0) {
      nextTick(() => {
        // This would be triggered by the component using this composable
      });
    }
  };

  // =============================================================================
  // WATCHERS
  // =============================================================================

  // Watch for edge calculations changes
  watch(
    () => store.edgeCalculations,
    () => {
      console.log('[professional-algorithms][watch] Edge calculations updated');

      if (needsRecalculation()) {
        // Debounce recalculation
        setTimeout(() => {
          // This would be triggered by the component using this composable
        }, 1000);
      }
    },
    { deep: true }
  );

  // Watch for burn analysis updates
  watch(
    () => store.burnAnalysisMetadata,
    newMetadata => {
      console.log('[professional-algorithms][watch] Burn analysis updated', newMetadata);

      if (newMetadata && needsRecalculation()) {
        // Burn analysis changed - recalculate immediately
        setTimeout(() => {
          // This would be triggered by the component using this composable
        }, 500);
      }
    },
    { deep: true }
  );

  // =============================================================================
  // RETURN COMPOSABLE API
  // =============================================================================

  return {
    // Reactive state
    currentRecommendation: readonly(currentRecommendation),
    algorithmPerformance: readonly(algorithmPerformance),
    algorithmStatus: readonly(algorithmStatus),
    recommendationSummary: readonly(recommendationSummary),

    // Calculation state
    isCalculating: readonly(isCalculating),
    calculationProgress: readonly(calculationProgress),
    lastCalculationTime: readonly(lastCalculationTime),

    // Algorithm controls
    algorithmsEnabled: readonly(algorithmsEnabled),

    // Main methods
    calculateUnifiedRecommendation,

    // Utility methods
    getProfessionalAdvice,
    needsRecalculation,
    toggleAlgorithm,

    // Individual algorithm access
    kellyCriterion: readonly(kellyCriterion),
    monteCarlo: readonly(monteCarlo),
    burnEstimation: readonly(burnEstimation),
  };
}
