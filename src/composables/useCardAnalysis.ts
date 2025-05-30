import { useBaccaratStore } from '@/stores/baccaratStore';
import type { Rank } from '@/types/cards';

export function useCardAnalysis() {
  const store = useBaccaratStore();

  // Helper methods for burned cards analysis
  const getBurnedCardColor = (count: number): string => {
    if (count === 0) {
      return 'text-gray-400';
    }
    if (count <= 2) {
      return 'text-green-600';
    }
    if (count <= 4) {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  const getBurnedCardsByValue = (value: number): number => {
    let count = 0;

    if (value === 0) {
      // Count 10, J, Q, K
      count += store.burnedCardAnalysis.burnedByRank.get('10') || 0;
      count += store.burnedCardAnalysis.burnedByRank.get('J') || 0;
      count += store.burnedCardAnalysis.burnedByRank.get('Q') || 0;
      count += store.burnedCardAnalysis.burnedByRank.get('K') || 0;
    } else if (value === 1) {
      // Count Aces
      count += store.burnedCardAnalysis.burnedByRank.get('A') || 0;
    } else {
      // Count number cards 2-9
      count += store.burnedCardAnalysis.burnedByRank.get(value.toString() as Rank) || 0;
    }

    return count;
  };

  return {
    getBurnedCardColor,
    getBurnedCardsByValue,
  };
}
