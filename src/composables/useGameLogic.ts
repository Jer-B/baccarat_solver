import { useBaccaratStore } from '@/stores/baccaratStore';
import { GameService } from '@/services/gameService';
import type { HandResult } from '@/types/cards';

export function useGameLogic() {
  const store = useBaccaratStore();

  // Hand summary methods
  const getCurrentWinner = (): string => {
    return GameService.getCurrentWinner(
      store.currentHandValues.player,
      store.currentHandValues.banker
    );
  };

  const getCurrentWinnerClass = (): string => {
    return GameService.getCurrentWinnerClass(
      store.currentHandValues.player,
      store.currentHandValues.banker
    );
  };

  const getHandStatus = (): string => {
    return GameService.getHandStatus(
      store.shoe.currentHand.player,
      store.shoe.currentHand.banker,
      store.currentHandValues.player,
      store.currentHandValues.banker
    );
  };

  const getEdgeClass = (edge: number): string => {
    return GameService.getEdgeClass(edge);
  };

  const canClearHand = (): boolean => {
    return GameService.canClearHand(
      store.canPerformActions,
      store.shoe.currentHand.player,
      store.shoe.currentHand.banker
    );
  };

  const createHandResult = (): HandResult => {
    return GameService.createHandResult(
      store.shoe.currentHand.player,
      store.shoe.currentHand.banker,
      store.currentHandValues.player,
      store.currentHandValues.banker,
      store.handHistory.length + 1
    );
  };

  return {
    // Winner and status methods
    getCurrentWinner,
    getCurrentWinnerClass,
    getHandStatus,
    getEdgeClass,
    canClearHand,
    createHandResult,
  };
}
