// =============================================================================
// USE MONTE CARLO SIMULATION COMPOSABLE
// =============================================================================
// Professional Monte Carlo simulations for risk assessment and outcome probability
// Integrates with Kelly Criterion, burn analysis, and edge calculations

import { ref, computed, watch, readonly } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { BurnAnalysisIntegration, type MonteCarloParams } from '@/services/burnAnalysisIntegration';
import type { BetType } from '@/config/bettingInterfaceSettings';
import type { PayoutValues } from '@/config/payoutSettings';

/**
 * Monte Carlo simulation result interface
 */
export interface MonteCarloResult {
  simulations: number;
  handsSimulated: number;
  expectedValue: number;
  probabilityOfProfit: number;
  confidenceRange: { lower: number; upper: number };
  riskOfRuin: number;
  expectedWinRate: number;
  maxDrawdown: number;
  bestCaseScenario: number;
  worstCaseScenario: number;
  volatility: number;
  sharpeRatio: number;
}

/**
 * Monte Carlo scenario for specific bet type
 */
export interface MonteCarloScenario {
  betType: BetType;
  result: MonteCarloResult;
  recommendation: 'favorable' | 'neutral' | 'unfavorable';
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Monte Carlo session analysis
 */
export interface MonteCarloAnalysis {
  scenarios: MonteCarloScenario[];
  bestScenario: MonteCarloScenario | null;
  overallRecommendation: string;
  riskAssessment: string;
  calculationTime: number;
  lastUpdated: Date;
}

/**
 * Monte Carlo simulation composable for professional risk assessment
 */
export function useMonteCarloSimulation() {
  // =============================================================================
  // REACTIVE STATE
  // =============================================================================

  const store = useBaccaratStore();

  // Current simulation results
  const currentAnalysis = ref<MonteCarloAnalysis | null>(null);

  // Simulation status
  const isSimulating = ref(false);
  const simulationProgress = ref(0);
  const lastSimulationTime = ref<Date | null>(null);

  // Simulation history
  const simulationHistory = ref<MonteCarloAnalysis[]>([]);

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  // Monte Carlo settings from store
  const monteCarloSettings = computed(() => store.settings.monteCarlo);

  // Current bankroll
  const currentBankroll = computed(() => store.ui.currentBalance);

  // Edge calculations
  const edgeCalculations = computed(() => store.edgeCalculations);

  // Betting statistics for simulation parameters
  const bettingStats = computed(() => store.bettingStats);

  // Simulation status indicator
  const simulationStatus = computed(() => {
    if (isSimulating.value) {
      return { status: 'running', color: 'blue' } as const;
    }
    if (!currentAnalysis.value) {
      return { status: 'inactive', color: 'gray' } as const;
    }

    const analysis = currentAnalysis.value;
    if (analysis.bestScenario?.recommendation === 'favorable') {
      return { status: 'favorable', color: 'green' } as const;
    }
    if (analysis.bestScenario?.recommendation === 'unfavorable') {
      return { status: 'unfavorable', color: 'red' } as const;
    }
    return { status: 'neutral', color: 'yellow' } as const;
  });

  // =============================================================================
  // SIMULATION METHODS
  // =============================================================================

  /**
   * Run Monte Carlo simulation for a specific bet type
   */
  const simulateBetType = async (
    betType: BetType,
    payoutValues: PayoutValues,
    bankroll: number,
    simulations: number = monteCarloSettings.value.simulations,
    handsToSimulate: number = monteCarloSettings.value.handsToSimulate
  ): Promise<MonteCarloResult> => {
    console.log('[monte-carlo][simulation] Starting simulation for bet type', {
      betType,
      simulations,
      handsToSimulate,
      bankroll,
    });

    // Get edge and payout for this bet type
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
        throw new Error(`Unknown bet type: ${betType}`);
    }

    // Calculate win probability from edge
    let winRate: number;
    if (betType === 'player' || betType === 'banker') {
      winRate = (edge + 1) / 2;
    } else {
      // For other bets, derive from house edge
      winRate = Math.max(0.01, Math.min(0.99, 0.5 + edge / 2));
    }

    // Use betting statistics if available
    const avgBetSize = bettingStats.value.averageBetSize || bankroll * 0.02; // Default 2% of bankroll
    const avgWin = avgBetSize * payout;
    const avgLoss = avgBetSize;

    // Prepare base simulation parameters
    const baseParams: MonteCarloParams = {
      winRate,
      avgBetSize,
      avgWin,
      avgLoss,
      simulations,
      handsToSimulate,
    };

    // Apply burn analysis adjustments if available
    const adjustedParams = BurnAnalysisIntegration.applyToMonteCarlo(
      baseParams,
      store.burnAnalysisMetadata
    );

    console.log('[monte-carlo][parameters] Simulation parameters', {
      baseParams,
      adjustedParams,
      burnAnalysisApplied: Boolean(store.burnAnalysisMetadata),
    });

    // Run simulation
    const results: number[] = [];
    const drawdowns: number[] = [];
    let totalRuins = 0;

    for (let sim = 0; sim < simulations; sim++) {
      // Update progress
      if (sim % Math.floor(simulations / 100) === 0) {
        simulationProgress.value = (sim / simulations) * 100;
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      let currentBalance = bankroll;
      let maxBalance = bankroll;
      let maxDrawdown = 0;
      let totalReturn = 0;
      let ruined = false;

      for (let hand = 0; hand < handsToSimulate; hand++) {
        if (ruined) {
          break;
        }

        // Calculate bet size (Kelly or fixed percentage)
        const betSize = Math.min(adjustedParams.avgBetSize, currentBalance * 0.1); // Max 10% of current balance

        if (betSize <= 0 || currentBalance <= 0) {
          ruined = true;
          break;
        }

        // Simulate hand outcome
        const isWin = Math.random() < adjustedParams.winRate;

        if (isWin) {
          const winAmount = Math.min(adjustedParams.avgWin, betSize * payout);
          currentBalance += winAmount;
          totalReturn += winAmount;
        } else {
          const lossAmount = Math.min(adjustedParams.avgLoss, betSize);
          currentBalance -= lossAmount;
          totalReturn -= lossAmount;

          if (currentBalance <= 0) {
            ruined = true;
            totalReturn = -bankroll; // Total ruin
          }
        }

        // Track drawdown
        maxBalance = Math.max(maxBalance, currentBalance);
        const currentDrawdown = (maxBalance - currentBalance) / maxBalance;
        maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
      }

      results.push(totalReturn);
      drawdowns.push(maxDrawdown);
      if (ruined) {
        totalRuins++;
      }
    }

    // Calculate statistics
    results.sort((a, b) => a - b);
    drawdowns.sort((a, b) => a - b);

    const profits = results.filter(r => r > 0).length;
    const expectedValue = results.reduce((sum, r) => sum + r, 0) / simulations;
    const variance =
      results.reduce((sum, r) => sum + Math.pow(r - expectedValue, 2), 0) / simulations;
    const volatility = Math.sqrt(variance);

    // Confidence intervals (95%)
    const lowerIndex = Math.floor(simulations * 0.025);
    const upperIndex = Math.floor(simulations * 0.975);

    // Sharpe ratio (simplified)
    const sharpeRatio = volatility > 0 ? expectedValue / volatility : 0;

    const result: MonteCarloResult = {
      simulations,
      handsSimulated: handsToSimulate,
      expectedValue,
      probabilityOfProfit: profits / simulations,
      confidenceRange: {
        lower: results[lowerIndex],
        upper: results[upperIndex],
      },
      riskOfRuin: totalRuins / simulations,
      expectedWinRate: adjustedParams.winRate,
      maxDrawdown: drawdowns[Math.floor(simulations * 0.9)], // 90th percentile drawdown
      bestCaseScenario: results[results.length - 1],
      worstCaseScenario: results[0],
      volatility,
      sharpeRatio,
    };

    console.log('[monte-carlo][result] Simulation completed', {
      betType,
      result,
      totalRuins,
      profits,
    });

    return result;
  };

  /**
   * Determine recommendation based on Monte Carlo result
   */
  const determineRecommendation = (
    result: MonteCarloResult
  ): MonteCarloScenario['recommendation'] => {
    // Favorable conditions
    if (
      result.expectedValue > 0 &&
      result.probabilityOfProfit > 0.5 &&
      result.riskOfRuin < 0.1 &&
      result.sharpeRatio > 0.5
    ) {
      return 'favorable';
    }

    // Unfavorable conditions
    if (
      result.expectedValue < 0 ||
      result.probabilityOfProfit < 0.4 ||
      result.riskOfRuin > 0.2 ||
      result.sharpeRatio < -0.5
    ) {
      return 'unfavorable';
    }

    return 'neutral';
  };

  /**
   * Determine risk level based on Monte Carlo result
   */
  const determineRiskLevel = (result: MonteCarloResult): MonteCarloScenario['riskLevel'] => {
    if (
      result.riskOfRuin > 0.15 ||
      result.maxDrawdown > 0.5 ||
      result.volatility > currentBankroll.value * 2
    ) {
      return 'high';
    }
    if (
      result.riskOfRuin > 0.05 ||
      result.maxDrawdown > 0.25 ||
      result.volatility > currentBankroll.value
    ) {
      return 'medium';
    }
    return 'low';
  };

  /**
   * Run comprehensive Monte Carlo analysis for all bet types
   */
  const runComprehensiveAnalysis = async (
    payoutValues: PayoutValues,
    bankroll: number
  ): Promise<MonteCarloAnalysis> => {
    console.log('[monte-carlo][analysis] Starting comprehensive analysis', {
      bankroll,
      payoutValues,
    });

    const startTime = Date.now();
    isSimulating.value = true;
    simulationProgress.value = 0;

    try {
      const betTypes: BetType[] = ['player', 'banker', 'tie', 'playerPair', 'bankerPair'];
      const scenarios: MonteCarloScenario[] = [];

      // Run simulation for each bet type
      for (let i = 0; i < betTypes.length; i++) {
        const betType = betTypes[i];
        simulationProgress.value = (i / betTypes.length) * 80; // Reserve 20% for analysis

        const result = await simulateBetType(betType, payoutValues, bankroll);
        const recommendation = determineRecommendation(result);
        const riskLevel = determineRiskLevel(result);

        scenarios.push({
          betType,
          result,
          recommendation,
          riskLevel,
        });
      }

      simulationProgress.value = 90;

      // Find best scenario
      const favorableScenarios = scenarios.filter(s => s.recommendation === 'favorable');
      const bestScenario =
        favorableScenarios.length > 0
          ? favorableScenarios.reduce((best, current) =>
              current.result.sharpeRatio > best.result.sharpeRatio ? current : best
            )
          : scenarios.reduce((best, current) =>
              current.result.expectedValue > best.result.expectedValue ? current : best
            );

      // Generate overall recommendation
      let overallRecommendation: string;
      if (favorableScenarios.length > 0) {
        overallRecommendation = `${favorableScenarios.length} favorable betting opportunity${favorableScenarios.length > 1 ? 'ies' : 'y'} identified. Best: ${bestScenario.betType.toUpperCase()} with ${(bestScenario.result.probabilityOfProfit * 100).toFixed(1)}% win probability.`;
      } else {
        overallRecommendation =
          'No favorable betting opportunities identified. Consider waiting for better conditions or reducing bet sizes.';
      }

      // Generate risk assessment
      const highRiskScenarios = scenarios.filter(s => s.riskLevel === 'high').length;
      const mediumRiskScenarios = scenarios.filter(s => s.riskLevel === 'medium').length;

      let riskAssessment: string;
      if (highRiskScenarios > 2) {
        riskAssessment =
          'High overall risk detected. Consider reducing exposure or implementing strict stop-loss limits.';
      } else if (mediumRiskScenarios > 2) {
        riskAssessment =
          'Moderate risk environment. Standard risk management protocols recommended.';
      } else {
        riskAssessment =
          'Low-to-moderate risk environment. Normal betting strategies can be employed.';
      }

      simulationProgress.value = 100;

      const analysis: MonteCarloAnalysis = {
        scenarios,
        bestScenario: bestScenario || null,
        overallRecommendation,
        riskAssessment,
        calculationTime: Date.now() - startTime,
        lastUpdated: new Date(),
      };

      // Update current analysis
      currentAnalysis.value = analysis;
      lastSimulationTime.value = new Date();

      // Add to history (keep last 50)
      simulationHistory.value.push(analysis);
      if (simulationHistory.value.length > 50) {
        simulationHistory.value = simulationHistory.value.slice(-50);
      }

      console.log('[monte-carlo][analysis] Comprehensive analysis completed', {
        scenarios: scenarios.length,
        favorableScenarios: favorableScenarios.length,
        bestScenario: bestScenario?.betType,
        calculationTime: analysis.calculationTime,
      });

      return analysis;
    } catch (error) {
      console.error('[monte-carlo][analysis] Error during analysis', error);
      throw error;
    } finally {
      isSimulating.value = false;
      simulationProgress.value = 0;
    }
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Format Monte Carlo result for display
   */
  const formatResult = (result: MonteCarloResult): string => {
    const ev =
      result.expectedValue >= 0
        ? `+$${result.expectedValue.toFixed(2)}`
        : `-$${Math.abs(result.expectedValue).toFixed(2)}`;
    const winRate = (result.probabilityOfProfit * 100).toFixed(1);
    return `EV: ${ev}, Win Rate: ${winRate}%, Risk of Ruin: ${(result.riskOfRuin * 100).toFixed(1)}%`;
  };

  /**
   * Get simulation advice based on current analysis
   */
  const getSimulationAdvice = (): string => {
    if (!currentAnalysis.value) {
      return 'Run Monte Carlo simulation to get risk assessment and betting recommendations.';
    }

    const analysis = currentAnalysis.value;

    if (analysis.bestScenario?.recommendation === 'favorable') {
      return `${analysis.overallRecommendation} Risk level: ${analysis.bestScenario.riskLevel}. ${analysis.riskAssessment}`;
    }

    return `${analysis.overallRecommendation} ${analysis.riskAssessment}`;
  };

  /**
   * Check if new simulation is needed based on significant changes
   */
  const needsNewSimulation = (): boolean => {
    if (!lastSimulationTime.value) {
      return true;
    }

    const timeSinceLastSim = Date.now() - lastSimulationTime.value.getTime();
    const autoRunInterval = monteCarloSettings.value.runEveryNHands;
    const handsPlayed = bettingStats.value.totalHands;

    // Time-based check (every 5 minutes)
    if (timeSinceLastSim > 5 * 60 * 1000) {
      return true;
    }

    // Hand-based check
    if (handsPlayed > 0 && handsPlayed % autoRunInterval === 0) {
      return true;
    }

    // Edge change check (simplified)
    return false;
  };

  // =============================================================================
  // WATCHERS
  // =============================================================================

  // Watch for edge calculation changes
  watch(
    () => edgeCalculations.value,
    newEdges => {
      console.log('[monte-carlo][watch] Edge calculations updated', newEdges);

      if (monteCarloSettings.value.autoRun && needsNewSimulation()) {
        // Debounce to avoid excessive calculations
        setTimeout(() => {
          if (currentBankroll.value > 0) {
            // This would be triggered by the component using this composable
          }
        }, 1000);
      }
    },
    { deep: true }
  );

  // Watch for betting stats changes
  watch(
    () => bettingStats.value.totalHands,
    newHandCount => {
      console.log('[monte-carlo][watch] Hand count updated', { newHandCount });

      if (
        monteCarloSettings.value.autoRun &&
        newHandCount % monteCarloSettings.value.runEveryNHands === 0
      ) {
        // Auto-run simulation based on hand count
        setTimeout(() => {
          if (currentBankroll.value > 0) {
            // This would be triggered by the component using this composable
          }
        }, 500);
      }
    }
  );

  // =============================================================================
  // RETURN COMPOSABLE API
  // =============================================================================

  return {
    // Reactive state
    currentAnalysis: readonly(currentAnalysis),
    simulationHistory: readonly(simulationHistory),
    simulationStatus: readonly(simulationStatus),

    // Loading states
    isSimulating: readonly(isSimulating),
    simulationProgress: readonly(simulationProgress),
    lastSimulationTime: readonly(lastSimulationTime),

    // Simulation methods
    simulateBetType,
    runComprehensiveAnalysis,

    // Utility methods
    formatResult,
    getSimulationAdvice,
    needsNewSimulation,

    // Settings
    monteCarloSettings: readonly(monteCarloSettings),
  };
}
