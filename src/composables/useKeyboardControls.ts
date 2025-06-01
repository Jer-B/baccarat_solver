import { onMounted, onUnmounted } from 'vue';
import type { Rank } from '@/types/cards';

interface KeyboardControlsConfig {
  canSelectCards: () => boolean;
  canBet: () => boolean;
  onCardSelect: (rank: Rank) => void;
  onPlayerBet: () => void;
  onBankerBet: () => void;
  onTieBet: () => void;
  onValidateBet: () => void;
  onCompleteRound: () => void;
}

export function useKeyboardControls(config: KeyboardControlsConfig) {
  // Keyboard mapping for card selection
  const keyToRankMap: Record<string, Rank> = {
    '1': 'A',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '0': '10',
    q: 'J',
    Q: 'J',
    w: 'Q',
    W: 'Q',
    e: 'K',
    E: 'K',
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    // Prevent handling if user is typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key.toLowerCase();
    const upperKey = event.key.toUpperCase();

    console.log('[keyboard-controls][keypress] Key pressed', {
      key: event.key,
      code: event.code,
      canSelectCards: config.canSelectCards(),
      canBet: config.canBet(),
    });

    // Card selection controls (only when cards are selectable)
    if (config.canSelectCards()) {
      const rank = keyToRankMap[event.key] || keyToRankMap[key];
      if (rank) {
        event.preventDefault();
        console.log('[keyboard-controls][card-selection] Card selected via keyboard', {
          key: event.key,
          rank,
        });
        config.onCardSelect(rank);
        return;
      }
    }

    // Betting controls (only when betting is possible)
    if (config.canBet()) {
      switch (upperKey) {
        case 'P':
          event.preventDefault();
          console.log('[keyboard-controls][betting] Player bet via keyboard');
          config.onPlayerBet();
          break;
        case 'B':
          event.preventDefault();
          console.log('[keyboard-controls][betting] Banker bet via keyboard');
          config.onBankerBet();
          break;
        case 'T':
          event.preventDefault();
          console.log('[keyboard-controls][betting] Tie bet via keyboard');
          config.onTieBet();
          break;
        case 'A':
          event.preventDefault();
          console.log('[keyboard-controls][betting] Validate bet via keyboard');
          config.onValidateBet();
          break;
      }
    }

    // Round control (works in both betting and card selection phases)
    if (upperKey === 'R') {
      event.preventDefault();
      console.log('[keyboard-controls][round-control] Complete round via keyboard');
      config.onCompleteRound();
    }
  };

  // Set up keyboard event listeners
  onMounted(() => {
    document.addEventListener('keydown', handleKeyPress);
    console.log('[keyboard-controls][lifecycle] Keyboard controls enabled');
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress);
    console.log('[keyboard-controls][lifecycle] Keyboard controls disabled');
  });

  return {
    keyToRankMap,
  };
}
