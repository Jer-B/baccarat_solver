import type { Rank, Suit } from '../types/cards';

// Configuration for different card deck sources
export interface CardDeckConfig {
  name: string;
  baseUrl: string;
  filePattern: string; // e.g., "{rank}_of_{suit}.svg" or "{rank}{suit}.svg"
  backPattern: string; // e.g., "card_back.svg"
}

// Popular free SVG card deck sources
export const CARD_DECK_SOURCES: Record<string, CardDeckConfig> = {
  // Chris Aguilar's SVG Playing Cards (Public Domain)
  aguilar: {
    name: 'Chris Aguilar SVG Cards',
    baseUrl: '/assets/cards/aguilar',
    filePattern: '{rank}_of_{suit}.svg',
    backPattern: 'card_back.svg',
  },

  // SVG-cards by htdebeer (Multiple styles)
  classic: {
    name: 'Classic SVG Cards',
    baseUrl: '/assets/cards/classic',
    filePattern: '{rank}_{suit}.svg',
    backPattern: 'back.svg',
  },

  // Custom baccarat-specific cards
  baccarat: {
    name: 'Baccarat Cards',
    baseUrl: '/assets/cards/baccarat',
    filePattern: '{rank}_{suit}.svg',
    backPattern: 'back_baccarat.svg',
  },
};

// Convert our rank/suit format to common naming conventions
export function formatCardFilename(rank: Rank, suit: Suit, config: CardDeckConfig): string {
  const rankMap: Record<Rank, string> = {
    A: 'ace',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    J: 'jack',
    Q: 'queen',
    K: 'king',
  };

  const suitMap: Record<Suit, string> = {
    hearts: 'hearts',
    diamonds: 'diamonds',
    clubs: 'clubs',
    spades: 'spades',
  };

  return config.filePattern.replace('{rank}', rankMap[rank]).replace('{suit}', suitMap[suit]);
}

// Get full URL for a card
export function getCardImageUrl(
  rank: Rank,
  suit: Suit,
  deckSource: keyof typeof CARD_DECK_SOURCES = 'aguilar'
): string {
  const config = CARD_DECK_SOURCES[deckSource];
  const filename = formatCardFilename(rank, suit, config);
  return `${config.baseUrl}/${filename}`;
}

// Get card back URL
export function getCardBackUrl(deckSource: keyof typeof CARD_DECK_SOURCES = 'aguilar'): string {
  const config = CARD_DECK_SOURCES[deckSource];
  return `${config.baseUrl}/${config.backPattern}`;
}

// Check if card image exists (for fallback handling)
export async function checkCardImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Download instructions for popular card decks
export const DOWNLOAD_INSTRUCTIONS = {
  aguilar: {
    name: 'Chris Aguilar SVG Playing Cards',
    url: 'https://totalnonsense.com/open-source-vector-playing-cards/',
    license: 'Public Domain',
    instructions: [
      '1. Visit https://totalnonsense.com/open-source-vector-playing-cards/',
      '2. Download the SVG version',
      '3. Extract to public/assets/cards/aguilar/',
      '4. Rename files to match pattern: ace_of_hearts.svg, 2_of_clubs.svg, etc.',
    ],
  },

  svgCards: {
    name: 'SVG-cards by htdebeer',
    url: 'https://github.com/htdebeer/SVG-cards',
    license: 'LGPL',
    instructions: [
      '1. Clone https://github.com/htdebeer/SVG-cards',
      '2. Copy SVG files to public/assets/cards/classic/',
      '3. Choose your preferred style (english, french, etc.)',
      '4. Rename files to match pattern: ace_hearts.svg, 2_clubs.svg, etc.',
    ],
  },

  playingCardsAssets: {
    name: 'Playing Cards Assets (npm)',
    url: 'https://www.npmjs.com/package/playing-cards-assets',
    license: 'MIT',
    instructions: [
      '1. Run: npm install playing-cards-assets',
      '2. Import cards in your component',
      '3. Use programmatically or copy to public folder',
    ],
  },
};

// Generate download script for setting up card assets
export function generateSetupScript(deckSource: keyof typeof CARD_DECK_SOURCES): string {
  const config = CARD_DECK_SOURCES[deckSource];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let script = `#!/bin/bash\n# Setup script for ${config.name}\n\n`;
  script += `mkdir -p public${config.baseUrl}\n\n`;
  script += '# Expected file structure:\n';

  ranks.forEach(rank => {
    suits.forEach(suit => {
      const filename = formatCardFilename(rank as Rank, suit as Suit, config);
      script += `# ${config.baseUrl}/${filename}\n`;
    });
  });

  script += `# ${config.baseUrl}/${config.backPattern}\n`;

  return script;
}
