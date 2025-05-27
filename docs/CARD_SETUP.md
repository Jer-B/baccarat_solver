# SVG Card Deck Setup Guide

Your baccarat application now includes a custom SVG card component with built-in fallback rendering. You can enhance it further by adding external SVG card assets.

## 🎯 Current Status

✅ **Built-in SVG Cards**: Your app already has functional SVG cards with:

- Proper baccarat value display
- Color-coded suits (red/black)
- Interactive hover effects
- Count badges for composition tracking
- Natural highlighting for 8s and 9s

## 🚀 Recommended External Card Decks

### 1. **Chris Aguilar SVG Playing Cards** (Recommended)

- **License**: Public Domain (completely free)
- **Quality**: Professional, clean design
- **URL**: https://totalnonsense.com/open-source-vector-playing-cards/

**Setup Steps:**

```bash
# 1. Create directory
mkdir -p public/assets/cards/aguilar

# 2. Download and extract SVG files
# 3. Rename files to match pattern:
#    ace_of_hearts.svg, 2_of_clubs.svg, etc.
```

### 2. **SVG-cards by htdebeer**

- **License**: LGPL
- **Quality**: Multiple styles available
- **URL**: https://github.com/htdebeer/SVG-cards

**Setup Steps:**

```bash
# 1. Clone repository
git clone https://github.com/htdebeer/SVG-cards.git

# 2. Copy desired style to your project
mkdir -p public/assets/cards/classic
cp SVG-cards/svg-cards/fronts/*.svg public/assets/cards/classic/
```

### 3. **Playing Cards Assets (npm)**

- **License**: MIT
- **Quality**: Consistent, modern design
- **Installation**: `npm install playing-cards-assets`

## 🛠️ Integration Options

### Option A: Keep Current Built-in SVG Cards (Recommended)

Your current implementation is fully functional and doesn't require external assets. The built-in SVG cards include:

- Baccarat value indicators
- Professional appearance
- Perfect integration with your app

### Option B: Add External SVG Assets

If you want to use external card images, update the `PlayingCard.vue` component:

```vue
<template>
  <div class="playing-card-container">
    <!-- Use external SVG if available, fallback to built-in -->
    <img
      v-if="useExternalAssets && cardImageUrl"
      :src="cardImageUrl"
      :alt="`${rank} of ${suit}`"
      class="card-image"
      @error="handleImageError"
    />

    <!-- Built-in SVG fallback -->
    <svg v-else class="playing-card-svg" viewBox="0 0 169 244">
      <!-- Your existing SVG content -->
    </svg>
  </div>
</template>

<script setup lang="ts">
import { getCardImageUrl } from '@/utils/cardAssets';

const cardImageUrl = computed(() => {
  if (cardRank.value && cardSuit.value) {
    return getCardImageUrl(cardRank.value, cardSuit.value, 'aguilar');
  }
  return null;
});
</script>
```

## 📁 File Structure

If you choose to add external assets:

```
public/
└── assets/
    └── cards/
        ├── aguilar/           # Chris Aguilar cards
        │   ├── ace_of_hearts.svg
        │   ├── 2_of_clubs.svg
        │   └── ...
        ├── classic/           # htdebeer cards
        │   ├── ace_hearts.svg
        │   ├── 2_clubs.svg
        │   └── ...
        └── baccarat/          # Custom baccarat cards
            ├── ace_hearts.svg
            └── ...
```

## 🎨 Customization Tips

### For Baccarat-Specific Design:

1. **Emphasize Values**: Make baccarat values (0-9) more prominent
2. **Color Coding**: Use consistent colors for Player (blue) and Banker (red)
3. **Minimalist Design**: Remove unnecessary decorative elements
4. **Large Suit Symbols**: Ensure suits are clearly visible at small sizes

### CSS Customization:

```css
.baccarat-card {
  /* Add baccarat-specific styling */
  border: 2px solid var(--baccarat-green);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-value-badge {
  /* Highlight baccarat values */
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
```

## 🔧 Utility Functions Available

Your app includes these helper functions in `src/utils/cardAssets.ts`:

- `getCardImageUrl(rank, suit, deckSource)` - Get URL for any card
- `getCardBackUrl(deckSource)` - Get card back URL
- `formatCardFilename(rank, suit, config)` - Convert to filename format
- `checkCardImageExists(url)` - Verify image exists
- `generateSetupScript(deckSource)` - Generate setup script

## 🎯 Recommendation

**For your baccarat application, I recommend sticking with the current built-in SVG cards** because:

1. ✅ **No external dependencies** - App works immediately
2. ✅ **Baccarat-optimized** - Shows values prominently
3. ✅ **Consistent design** - Matches your app's theme
4. ✅ **Interactive features** - Hover effects, count badges
5. ✅ **Performance** - No image loading delays

The built-in cards are specifically designed for baccarat and integrate perfectly with your hand value calculations and composition tracking.

## 🚀 Quick Test

Your cards are already working! Try:

1. Click cards in the Composition Chart to deal them
2. Watch hand values update in real-time
3. See natural highlighting for 8s and 9s
4. Use "Add Sample Hands" to test different scenarios

The SVG cards provide a professional, casino-quality experience without requiring any external assets!
