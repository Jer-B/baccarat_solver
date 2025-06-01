// =============================================================================
// USE BALANCE MANAGEMENT COMPOSABLE
// =============================================================================
// Centralized balance management for real-time updates across all components
// Integrates with PayoutSettings, BettingInterface, and CurrentHand for seamless balance tracking

import { ref, computed, watch, readonly } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useToast } from 'vue-toastification';
import type { BetResult } from '@/services/bettingService';
import type { HandResult } from '@/types/cards';

/**
 * Balance change event interface
 */
export interface BalanceChangeEvent {
  previousBalance: number;
  newBalance: number;
  change: number;
  reason: 'bet_placed' | 'bet_settled' | 'session_start' | 'manual_adjustment' | 'round_completion';
  details?: {
    betType?: string;
    betAmount?: number;
    handResult?: HandResult;
    betResult?: BetResult;
    adjustmentAmount?: number;
    adjustmentReason?: string;
    sessionStarted?: boolean;
  };
  timestamp: Date;
}

/**
 * Balance management composable for real-time balance tracking
 * Provides centralized balance operations and real-time updates
 */
export function useBalanceManagement() {
  // =============================================================================
  // REACTIVE STATE
  // =============================================================================

  const store = useBaccaratStore();
  const toast = useToast();

  // Balance change history
  const balanceHistory = ref<BalanceChangeEvent[]>([]);

  // Current session statistics
  const sessionStartBalance = ref<number>(0);

  // Real-time balance state
  const isBalanceUpdating = ref(false);

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  // Current balance (reactive to store changes)
  const currentBalance = computed(() => store.ui.currentBalance);

  // Session profit/loss
  const sessionProfitLoss = computed(() => {
    if (sessionStartBalance.value === 0) {
      return 0;
    }
    return currentBalance.value - sessionStartBalance.value;
  });

  // Session profit/loss percentage
  const sessionProfitLossPercentage = computed(() => {
    if (sessionStartBalance.value === 0) {
      return 0;
    }
    return (sessionProfitLoss.value / sessionStartBalance.value) * 100;
  });

  // Balance status
  const balanceStatus = computed(() => {
    const profitLoss = sessionProfitLoss.value;
    if (profitLoss > 0) {
      return { type: 'profit', color: 'green' } as const;
    }
    if (profitLoss < 0) {
      return { type: 'loss', color: 'red' } as const;
    }
    return { type: 'neutral', color: 'gray' } as const;
  });

  // Recent balance changes (last 10)
  const recentBalanceChanges = computed(() => balanceHistory.value.slice(-10).reverse());

  // Balance statistics
  const balanceStatistics = computed(() => {
    const changes = balanceHistory.value.filter(change => change.reason === 'bet_settled');
    const wins = changes.filter(change => change.change > 0);
    const losses = changes.filter(change => change.change < 0);

    return {
      totalRounds: changes.length,
      winRounds: wins.length,
      lossRounds: losses.length,
      winRate: changes.length > 0 ? (wins.length / changes.length) * 100 : 0,
      averageWin:
        wins.length > 0 ? wins.reduce((sum, change) => sum + change.change, 0) / wins.length : 0,
      averageLoss:
        losses.length > 0
          ? Math.abs(losses.reduce((sum, change) => sum + change.change, 0) / losses.length)
          : 0,
      biggestWin: wins.length > 0 ? Math.max(...wins.map(change => change.change)) : 0,
      biggestLoss:
        losses.length > 0 ? Math.abs(Math.min(...losses.map(change => change.change))) : 0,
    };
  });

  // =============================================================================
  // ACTIONS
  // =============================================================================

  /**
   * Initialize session balance tracking
   */
  const initializeSessionBalance = (startingBalance: number): void => {
    console.log('[balance-management][action] Initializing session balance', { startingBalance });

    sessionStartBalance.value = startingBalance;
    balanceHistory.value = [];

    // Record session start event
    recordBalanceChange(startingBalance, startingBalance, 'session_start', {
      sessionStarted: true,
    });

    console.log('[balance-management][success] Session balance initialized', {
      startingBalance,
      currentBalance: currentBalance.value,
    });
  };

  /**
   * Update balance with automatic change tracking
   */
  const updateBalance = (
    newBalance: number,
    reason: BalanceChangeEvent['reason'],
    details?: BalanceChangeEvent['details']
  ): void => {
    console.log('[balance-management][action] Updating balance', {
      previousBalance: currentBalance.value,
      newBalance,
      change: newBalance - currentBalance.value,
      reason,
      details,
    });

    isBalanceUpdating.value = true;

    try {
      const previousBalance = currentBalance.value;

      // Update store balance
      store.ui.currentBalance = newBalance;

      // Record balance change
      recordBalanceChange(previousBalance, newBalance, reason, details);

      // Show appropriate notification
      showBalanceNotification(previousBalance, newBalance, reason);

      console.log('[balance-management][success] Balance updated', {
        previousBalance,
        newBalance,
        change: newBalance - previousBalance,
      });
    } catch (error) {
      console.error('[balance-management][error] Failed to update balance', {
        error,
        newBalance,
        reason,
      });
      toast.error(`Failed to update balance: ${(error as Error).message}`, { timeout: 5000 });
    } finally {
      isBalanceUpdating.value = false;
    }
  };

  /**
   * Handle bet placement (deduct bet amount from balance)
   */
  const handleBetPlacement = (betAmount: number, betType: string): void => {
    console.log('[balance-management][action] Handling bet placement', { betAmount, betType });

    const newBalance = currentBalance.value - betAmount;
    updateBalance(newBalance, 'bet_placed', {
      betAmount,
      betType,
    });
  };

  /**
   * Handle bet settlement (add payout to balance)
   */
  const handleBetSettlement = (betResult: BetResult, handResult: HandResult): void => {
    console.log('[balance-management][action] Handling bet settlement', { betResult, handResult });

    const newBalance = currentBalance.value + betResult.payout;
    updateBalance(newBalance, 'bet_settled', {
      betResult,
      handResult,
    });
  };

  /**
   * Manual balance adjustment (admin function)
   */
  const adjustBalance = (amount: number, reason?: string): void => {
    console.log('[balance-management][action] Manual balance adjustment', { amount, reason });

    const newBalance = currentBalance.value + amount;
    updateBalance(newBalance, 'manual_adjustment', {
      adjustmentAmount: amount,
      adjustmentReason: reason,
    });
  };

  /**
   * Calculate potential payout impact on balance
   */
  const calculatePotentialBalance = (
    betAmount: number,
    betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair',
    payoutMultiplier: number
  ): { winBalance: number; lossBalance: number } => {
    const currentBal = currentBalance.value;

    // If bet wins
    const winnings = betAmount * payoutMultiplier;
    const winBalance = currentBal + winnings;

    // If bet loses (already deducted when bet was placed)
    const lossBalance = currentBal;

    return { winBalance, lossBalance };
  };

  // =============================================================================
  // INTERNAL HELPERS
  // =============================================================================

  /**
   * Record balance change in history
   */
  const recordBalanceChange = (
    previousBalance: number,
    newBalance: number,
    reason: BalanceChangeEvent['reason'],
    details?: BalanceChangeEvent['details']
  ): void => {
    const change: BalanceChangeEvent = {
      previousBalance,
      newBalance,
      change: newBalance - previousBalance,
      reason,
      details,
      timestamp: new Date(),
    };

    balanceHistory.value.push(change);

    console.log('[balance-management][history] Balance change recorded', change);
  };

  /**
   * Show appropriate balance notification
   */
  const showBalanceNotification = (
    previousBalance: number,
    newBalance: number,
    reason: BalanceChangeEvent['reason']
  ): void => {
    const change = newBalance - previousBalance;
    const absChange = Math.abs(change);

    switch (reason) {
      case 'bet_placed':
        toast.info(`💰 Bet placed: -$${absChange.toFixed(2)}`, { timeout: 2000 });
        break;
      case 'bet_settled':
        if (change > 0) {
          toast.success(`🎉 Won: +$${change.toFixed(2)} (Total: $${newBalance.toFixed(2)})`, {
            timeout: 4000,
          });
        } else if (change < 0) {
          toast.warning(`💸 Lost: -$${absChange.toFixed(2)} (Total: $${newBalance.toFixed(2)})`, {
            timeout: 3000,
          });
        }
        break;
      case 'session_start':
        toast.info(`🎯 Session started with $${newBalance.toFixed(2)}`, { timeout: 3000 });
        break;
      case 'manual_adjustment':
        const adjustmentType = change > 0 ? 'increased' : 'decreased';
        toast.info(`⚖️ Balance ${adjustmentType}: ${change > 0 ? '+' : ''}$${change.toFixed(2)}`, {
          timeout: 3000,
        });
        break;
      case 'round_completion':
        // No notification for round completion unless there's a balance change
        if (Math.abs(change) > 0.01) {
          toast.info(`🏁 Round completed: ${change > 0 ? '+' : ''}$${change.toFixed(2)}`, {
            timeout: 2000,
          });
        }
        break;
    }
  };

  // =============================================================================
  // WATCHERS
  // =============================================================================

  // Watch for external store balance changes
  watch(
    () => store.ui.currentBalance,
    (newBalance, oldBalance) => {
      if (oldBalance !== undefined && Math.abs(newBalance - oldBalance) > 0.01) {
        console.log('[balance-management][watch] External balance change detected', {
          oldBalance,
          newBalance,
          change: newBalance - oldBalance,
        });
      }
    }
  );

  // =============================================================================
  // RETURN COMPOSABLE API
  // =============================================================================

  return {
    // Reactive state
    currentBalance: readonly(currentBalance),
    sessionStartBalance: readonly(sessionStartBalance),
    sessionProfitLoss: readonly(sessionProfitLoss),
    sessionProfitLossPercentage: readonly(sessionProfitLossPercentage),
    balanceStatus: readonly(balanceStatus),
    recentBalanceChanges: readonly(recentBalanceChanges),
    balanceStatistics: readonly(balanceStatistics),
    balanceHistory: readonly(balanceHistory),

    // Loading states
    isBalanceUpdating: readonly(isBalanceUpdating),

    // Actions
    initializeSessionBalance,
    updateBalance,
    handleBetPlacement,
    handleBetSettlement,
    adjustBalance,
    calculatePotentialBalance,
  };
}
