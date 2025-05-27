import type { EdgeCalculation } from '../types/cards';

export interface BurnAnalysisMetadata {
  weightedEdgeImpact: number;
  uncertaintyLevel: number;
  kellyMultiplier: number;
  monteCarloAdjustment: number;
  lastUpdated: number;
}

export interface MonteCarloParams {
  winRate: number;
  avgBetSize: number;
  avgWin: number;
  avgLoss: number;
  simulations: number;
  handsToSimulate: number;
}

/**
 * Central service for standardizing burn analysis integration
 * across all systems (Kelly, Monte Carlo, Edge calculations)
 */
export class BurnAnalysisIntegration {
  /**
   * Apply burn analysis adjustments to Kelly Criterion calculations
   */
  static applyToKelly(baseKelly: number, burnMetadata?: BurnAnalysisMetadata): number {
    if (!burnMetadata) {
      return baseKelly;
    }

    let adjustedKelly = baseKelly;

    // Apply burn analysis Kelly multiplier
    adjustedKelly *= burnMetadata.kellyMultiplier;

    // Reduce Kelly percentage based on uncertainty level
    const uncertaintyReduction = 1 - burnMetadata.uncertaintyLevel * 0.3; // Max 30% reduction
    adjustedKelly *= uncertaintyReduction;

    // Ensure Kelly stays within reasonable bounds
    return Math.max(0.001, Math.min(0.5, adjustedKelly));
  }

  /**
   * Apply burn analysis adjustments to Monte Carlo simulation parameters
   */
  static applyToMonteCarlo(
    baseParams: MonteCarloParams,
    burnMetadata?: BurnAnalysisMetadata
  ): MonteCarloParams {
    if (!burnMetadata) {
      return baseParams;
    }

    const adjustedParams = { ...baseParams };

    // Apply burn adjustment to win rate
    const burnAdjustment = burnMetadata.monteCarloAdjustment;
    adjustedParams.winRate = Math.max(0.1, Math.min(0.9, baseParams.winRate * burnAdjustment));

    // Increase variance based on uncertainty
    const uncertaintyMultiplier = 1 + burnMetadata.uncertaintyLevel * 0.5;

    // Apply uncertainty to win/loss amounts (more variance when uncertain)
    adjustedParams.avgWin *= 1 + (Math.random() - 0.5) * 0.2 * uncertaintyMultiplier;
    adjustedParams.avgLoss *= 1 + (Math.random() - 0.5) * 0.2 * uncertaintyMultiplier;

    return adjustedParams;
  }

  /**
   * Apply burn analysis adjustments to edge calculations
   */
  static applyToEdges(
    baseEdges: EdgeCalculation,
    burnMetadata?: BurnAnalysisMetadata
  ): EdgeCalculation {
    if (!burnMetadata) {
      return baseEdges;
    }

    const adjustedEdges = { ...baseEdges };
    const edgeAdjustment = burnMetadata.weightedEdgeImpact;

    // Adjust main bet edges based on burn analysis
    adjustedEdges.playerEdge += edgeAdjustment;
    adjustedEdges.bankerEdge += edgeAdjustment;

    // Adjust pair edges (burns typically reduce pair probabilities)
    const pairAdjustment = edgeAdjustment * 0.5; // Pairs are less affected
    adjustedEdges.playerPairEdge += pairAdjustment;
    adjustedEdges.bankerPairEdge += pairAdjustment;

    // Update confidence based on burn analysis uncertainty
    const uncertaintyPenalty = Math.min(burnMetadata.uncertaintyLevel * 0.3, 0.2);
    adjustedEdges.confidence = Math.max(baseEdges.confidence - uncertaintyPenalty, 0.1);

    // Apply edge sorting advantage adjustment
    if (adjustedEdges.edgeSortingAdvantage !== undefined) {
      adjustedEdges.edgeSortingAdvantage += edgeAdjustment * 0.3; // Moderate impact on edge sorting
    }

    return adjustedEdges;
  }

  /**
   * Calculate overall confidence level from burn analysis
   */
  static calculateOverallConfidence(burnMetadata?: BurnAnalysisMetadata): number {
    if (!burnMetadata) {
      return 1.0;
    }

    // Base confidence starts high and decreases with uncertainty
    const baseConfidence = 0.9;
    const uncertaintyPenalty = burnMetadata.uncertaintyLevel * 0.4;

    return Math.max(0.1, baseConfidence - uncertaintyPenalty);
  }

  /**
   * Generate professional recommendation based on burn analysis
   */
  static generateRecommendation(burnMetadata?: BurnAnalysisMetadata): {
    action: 'conservative' | 'neutral' | 'aggressive';
    reasoning: string;
    confidence: number;
  } {
    if (!burnMetadata) {
      return {
        action: 'neutral',
        reasoning: 'No burn analysis data available',
        confidence: 0.5,
      };
    }

    const { weightedEdgeImpact, uncertaintyLevel, kellyMultiplier } = burnMetadata;
    const confidence = this.calculateOverallConfidence(burnMetadata);

    let action: 'conservative' | 'neutral' | 'aggressive' = 'neutral';
    const reasons: string[] = [];

    // Determine action based on edge impact and uncertainty
    if (Math.abs(weightedEdgeImpact) > 0.005) {
      if (weightedEdgeImpact > 0 && uncertaintyLevel < 0.3) {
        action = 'aggressive';
        reasons.push(`Favorable edge impact: +${(weightedEdgeImpact * 100).toFixed(3)}%`);
      } else if (weightedEdgeImpact < 0 || uncertaintyLevel > 0.5) {
        action = 'conservative';
        reasons.push('Unfavorable conditions detected');
      }
    }

    // Kelly multiplier considerations
    if (kellyMultiplier > 1.1 && uncertaintyLevel < 0.4) {
      action = 'aggressive';
      reasons.push(
        `Kelly suggests increased betting: +${((kellyMultiplier - 1) * 100).toFixed(1)}%`
      );
    } else if (kellyMultiplier < 0.9) {
      action = 'conservative';
      reasons.push(`Kelly suggests reduced betting: -${((1 - kellyMultiplier) * 100).toFixed(1)}%`);
    }

    // Uncertainty considerations
    if (uncertaintyLevel > 0.6) {
      action = 'conservative';
      reasons.push(`High uncertainty: ${(uncertaintyLevel * 100).toFixed(1)}%`);
    }

    const reasoning =
      reasons.length > 0
        ? reasons.join('; ')
        : 'Standard conditions - no significant burn impact detected';

    return { action, reasoning, confidence };
  }

  /**
   * Validate burn analysis metadata
   */
  static validateMetadata(metadata: Partial<BurnAnalysisMetadata>): boolean {
    if (!metadata) {
      return false;
    }

    // Check required fields
    const requiredFields = [
      'weightedEdgeImpact',
      'uncertaintyLevel',
      'kellyMultiplier',
      'monteCarloAdjustment',
    ];
    for (const field of requiredFields) {
      if (
        !(field in metadata) ||
        typeof metadata[field as keyof BurnAnalysisMetadata] !== 'number'
      ) {
        return false;
      }
    }

    // Check value ranges
    const { uncertaintyLevel, kellyMultiplier, monteCarloAdjustment } =
      metadata as BurnAnalysisMetadata;

    if (uncertaintyLevel < 0 || uncertaintyLevel > 1) {
      return false;
    }
    if (kellyMultiplier < 0.1 || kellyMultiplier > 3.0) {
      return false;
    }
    if (monteCarloAdjustment < 0.1 || monteCarloAdjustment > 2.0) {
      return false;
    }

    return true;
  }

  /**
   * Create default burn analysis metadata
   */
  static createDefaultMetadata(): BurnAnalysisMetadata {
    return {
      weightedEdgeImpact: 0,
      uncertaintyLevel: 0.1,
      kellyMultiplier: 1.0,
      monteCarloAdjustment: 1.0,
      lastUpdated: Date.now(),
    };
  }
}
