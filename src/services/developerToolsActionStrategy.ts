import type { useBaccaratStore } from '@/stores/baccaratStore';
import { DeveloperToolsService } from '@/services/developerToolsService';

/**
 * Strategy Pattern Implementation for Developer Tools Actions
 * Replaces switch-case statements with compositional, extensible action handling
 */

// Base strategy interface
interface ActionStrategy {
  execute(actionId: string, store: ReturnType<typeof useBaccaratStore>): void;
  validatePermission?(actionId: string, store: ReturnType<typeof useBaccaratStore>): boolean;
}

// Shoe Management Strategy
class ShoeManagementStrategy implements ActionStrategy {
  execute(actionId: string, store: ReturnType<typeof useBaccaratStore>): void {
    console.log(`[testing][action-strategy] Executing shoe management action: ${actionId}`);

    switch (actionId) {
      case 'initializeShoe': {
        store.initializeShoe();
        console.log('[testing][completion] New shoe initialized via strategy');
        break;
      }
      default:
        console.warn(`[testing][warning] Unknown shoe management action: ${actionId}`);
    }
  }
}

// Sample Data Strategy
class SampleDataStrategy implements ActionStrategy {
  validatePermission(actionId: string, store: ReturnType<typeof useBaccaratStore>): boolean {
    return DeveloperToolsService.validateActionPermission(store.canPerformActions, actionId);
  }

  execute(actionId: string, store: ReturnType<typeof useBaccaratStore>): void {
    console.log(`[testing][action-strategy] Executing sample data action: ${actionId}`);

    if (!this.validatePermission!(actionId, store)) {
      console.warn(`[testing][warning] Permission denied for action: ${actionId}`);
      return;
    }

    switch (actionId) {
      case 'addSampleHands': {
        const sampleHands = DeveloperToolsService.generateSampleHands();
        sampleHands.forEach(hand => store.addHandResult(hand));
        console.log('[testing][completion] Added sample hands via strategy', {
          count: sampleHands.length,
        });
        break;
      }
      case 'addRandomHand': {
        const randomHand = DeveloperToolsService.generateRandomHand(store.handHistory.length + 1);
        store.addHandResult(randomHand);
        console.log('[testing][completion] Added random hand via strategy');
        break;
      }
      default:
        console.warn(`[testing][warning] Unknown sample data action: ${actionId}`);
    }
  }
}

// Demo Scenarios Strategy
class DemoScenariosStrategy implements ActionStrategy {
  validatePermission(actionId: string, store: ReturnType<typeof useBaccaratStore>): boolean {
    return DeveloperToolsService.validateActionPermission(store.canPerformActions, actionId);
  }

  execute(actionId: string, store: ReturnType<typeof useBaccaratStore>): void {
    console.log(`[testing][action-strategy] Executing demo scenario action: ${actionId}`);

    if (!this.validatePermission!(actionId, store)) {
      console.warn(`[testing][warning] Permission denied for action: ${actionId}`);
      return;
    }

    switch (actionId) {
      case 'setupEdgeDemo':
        store.setupEdgeSortingDemo();
        console.log('[testing][completion] Edge sorting demo setup via strategy');
        break;
      case 'setupPairDemo':
        store.setupPairBettingDemo();
        console.log('[testing][completion] Pair betting demo setup via strategy');
        break;
      default:
        console.warn(`[testing][warning] Unknown demo scenario action: ${actionId}`);
    }
  }
}

// Strategy Registry - NO more switch statements in components
export const actionStrategies = new Map<string, ActionStrategy>([
  ['shoeManagement', new ShoeManagementStrategy()],
  ['sampleData', new SampleDataStrategy()],
  ['demoScenarios', new DemoScenariosStrategy()],
]);

// Strategy Executor - Clean interface for action execution
export class DeveloperToolsActionExecutor {
  static execute(
    sectionId: string,
    actionId: string,
    store: ReturnType<typeof useBaccaratStore>
  ): void {
    console.log(`[testing][strategy-executor] Executing: ${sectionId}.${actionId}`);

    const strategy = actionStrategies.get(sectionId);

    if (!strategy) {
      console.error(`[testing][error] No strategy found for section: ${sectionId}`);
      return;
    }

    try {
      strategy.execute(actionId, store);
      console.log(`[testing][strategy-executor] Successfully executed: ${sectionId}.${actionId}`);
    } catch (error) {
      console.error(
        `[testing][error] Strategy execution failed for ${sectionId}.${actionId}:`,
        error
      );
    }
  }

  // Helper method for registering new strategies (extensibility)
  static registerStrategy(sectionId: string, strategy: ActionStrategy): void {
    actionStrategies.set(sectionId, strategy);
    console.log(`[testing][strategy-executor] Registered new strategy: ${sectionId}`);
  }
}

// Export types for extensibility
export type { ActionStrategy };
