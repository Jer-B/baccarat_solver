import { useToast } from 'vue-toastification';
import { TOAST_TIMEOUTS, TOAST_CATEGORIES } from '../config/toast';

// Define toast options interface based on vue-toastification structure
interface ToastOptions {
  timeout?: number;
  closeOnClick?: boolean;
  pauseOnFocusLoss?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  draggablePercent?: number;
  showCloseButtonOnHover?: boolean;
  hideProgressBar?: boolean;
  closeButton?: string | boolean;
  icon?: boolean;
  rtl?: boolean;
  transition?: string;
  maxToasts?: number;
  newestOnTop?: boolean;
}

/**
 * Professional notifications composable for baccarat analysis application
 * Integrates with vue-toastification and follows structured logging standards
 */
export function useNotifications() {
  const toast = useToast();

  // Base notification methods with structured logging
  const success = (message: string, options?: ToastOptions) => {
    console.log('[user-interface][notification] Success notification displayed', { message });
    toast.success(message, { timeout: TOAST_TIMEOUTS.SUCCESS, ...options });
  };

  const error = (message: string, options?: ToastOptions) => {
    console.log('[user-interface][notification] Error notification displayed', { message });
    toast.error(message, { timeout: TOAST_TIMEOUTS.ERROR, ...options });
  };

  const warning = (message: string, options?: ToastOptions) => {
    console.log('[user-interface][notification] Warning notification displayed', { message });
    toast.warning(message, { timeout: TOAST_TIMEOUTS.WARNING, ...options });
  };

  const info = (message: string, options?: ToastOptions) => {
    console.log('[user-interface][notification] Info notification displayed', { message });
    toast.info(message, { timeout: TOAST_TIMEOUTS.INFO, ...options });
  };

  // Domain-specific notification methods for gambling analysis
  const burnAnalysisComplete = (method: string, confidence: number) => {
    console.log('[burn-analysis][calculation] Analysis completed successfully', {
      method,
      confidence,
    });
    toast.success(`${method} analysis completed (${(confidence * 100).toFixed(1)}% confidence)`, {
      timeout: 4000,
    });
  };

  const kellyCalculation = (fraction: number, edge: number) => {
    console.log('[kelly-criterion][calculation] Kelly fraction calculated', { fraction, edge });
    toast.success(
      `Kelly fraction: ${(fraction * 100).toFixed(2)}% (Edge: ${(edge * 100).toFixed(3)}%)`,
      {
        timeout: 5000,
      }
    );
  };

  const riskWarning = (currentRisk: number, maxRisk: number) => {
    console.log('[risk-management][warning] Risk threshold exceeded', { currentRisk, maxRisk });
    toast.warning(
      `Risk Alert: Current bet size (${(currentRisk * 100).toFixed(1)}%) exceeds recommended limit (${(maxRisk * 100).toFixed(1)}%)`,
      {
        timeout: 6000,
      }
    );
  };

  const sessionSaved = (sessionId: string) => {
    console.log('[session-tracking][persistence] Session saved successfully', { sessionId });
    toast.success('Session saved successfully', {
      timeout: 3000,
    });
  };

  const edgeCalculation = (betType: string, edge: number) => {
    console.log('[edge-calculation][calculation] Edge calculated for bet type', { betType, edge });
    if (edge > 0) {
      toast.success(`Favorable edge detected: ${betType} (${(edge * 100).toFixed(3)}%)`, {
        timeout: 4000,
      });
    } else {
      toast.info(`Edge calculated: ${betType} (${(edge * 100).toFixed(3)}%)`, {
        timeout: 3000,
      });
    }
  };

  const monteCarloComplete = (iterations: number, winRate: number) => {
    console.log('[monte-carlo][simulation] Monte Carlo simulation completed', {
      iterations,
      winRate,
    });
    toast.success(
      `Monte Carlo simulation completed: ${iterations} iterations, ${(winRate * 100).toFixed(1)}% win rate`,
      {
        timeout: 5000,
      }
    );
  };

  const dealerTellDetected = (tellType: string, confidence: number) => {
    console.log('[dealer-tells][detection] Dealer tell detected', { tellType, confidence });
    toast.warning(
      `Dealer tell detected: ${tellType} (${(confidence * 100).toFixed(1)}% confidence)`,
      {
        timeout: 6000,
      }
    );
  };

  const bankrollWarning = (currentBankroll: number, recommendedMin: number) => {
    console.log('[bankroll-management][warning] Bankroll below recommended minimum', {
      currentBankroll,
      recommendedMin,
    });
    toast.warning(
      `Bankroll Warning: $${currentBankroll.toFixed(2)} below recommended minimum of $${recommendedMin.toFixed(2)}`,
      {
        timeout: 5000,
      }
    );
  };

  // Session management notifications
  const sessionStarted = () => {
    console.log('[session-tracking][initialization] Gaming session started', {
      timestamp: Date.now(),
    });
    toast.success('🎯 Gaming session started!', {
      timeout: 4000,
    });
  };

  const sessionEnded = (duration: string, handsPlayed?: number) => {
    console.log('[session-tracking][cleanup] Gaming session ended', {
      duration,
      handsPlayed: handsPlayed || 0,
      timestamp: Date.now(),
    });
    toast.info(
      `📊 Session ended after ${duration}${handsPlayed ? ` • ${handsPlayed} hands played` : ''}`,
      {
        timeout: 5000,
      }
    );
  };

  return {
    // Base methods
    success,
    error,
    warning,
    info,

    // Domain-specific methods
    burnAnalysisComplete,
    kellyCalculation,
    riskWarning,
    sessionSaved,
    edgeCalculation,
    monteCarloComplete,
    dealerTellDetected,
    bankrollWarning,

    // Session management methods
    sessionStarted,
    sessionEnded,
  };
}
