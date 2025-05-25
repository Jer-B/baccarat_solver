<template>
  <div class="flex gap-2 flex-wrap">
    <button
      @click="addSampleHands"
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
    >
      Add Sample Hands
    </button>
    <button
      @click="addRandomHand"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
    >
      Add Random Hand
    </button>
    <button
      @click="setupEdgeSortingDemo"
      class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
      title="Simulate high-card rich shoe for edge sorting advantage"
    >
      Edge Sorting Demo
    </button>
    <button
      @click="setupPairBettingDemo"
      class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
      title="Simulate favorable conditions for pair betting"
    >
      Pair Betting Demo
    </button>
  </div>
</template>

<script setup lang="ts">
import { useBaccaratStore } from '@/stores/baccaratStore';
import type { HandResult, Card, Rank, Suit, CardValue } from '@/types/cards';

const store = useBaccaratStore();

function createCard(rank: string, suit: string, value: number): Card {
  return {
    rank: rank as Rank,
    suit: suit as Suit,
    value: value as CardValue,
  };
}

function addSampleHands() {
  // Add a variety of sample hands to test the scoreboard
  const sampleHands: HandResult[] = [
    {
      player: [createCard('K', 'hearts', 0), createCard('9', 'spades', 9)],
      banker: [createCard('7', 'diamonds', 7), createCard('2', 'clubs', 2)],
      winner: 'player',
      playerPair: false,
      bankerPair: false,
      playerTotal: 9,
      bankerTotal: 9,
      natural: true,
      timestamp: Date.now(),
      handNumber: 1,
    },
    {
      player: [createCard('5', 'hearts', 5), createCard('3', 'spades', 3)],
      banker: [createCard('Q', 'diamonds', 0), createCard('9', 'clubs', 9)],
      winner: 'banker',
      playerPair: false,
      bankerPair: false,
      playerTotal: 8,
      bankerTotal: 9,
      natural: true,
      timestamp: Date.now(),
      handNumber: 2,
    },
    {
      player: [createCard('A', 'hearts', 1), createCard('A', 'spades', 1)],
      banker: [createCard('6', 'diamonds', 6), createCard('4', 'clubs', 4)],
      winner: 'banker',
      playerPair: true,
      bankerPair: false,
      playerTotal: 2,
      bankerTotal: 0,
      natural: false,
      timestamp: Date.now(),
      handNumber: 3,
    },
    {
      player: [createCard('8', 'hearts', 8), createCard('2', 'spades', 2)],
      banker: [createCard('7', 'diamonds', 7), createCard('7', 'clubs', 7)],
      winner: 'banker',
      playerPair: false,
      bankerPair: true,
      playerTotal: 0,
      bankerTotal: 4,
      natural: false,
      timestamp: Date.now(),
      handNumber: 4,
    },
    {
      player: [createCard('4', 'hearts', 4), createCard('4', 'spades', 4)],
      banker: [createCard('4', 'diamonds', 4), createCard('4', 'clubs', 4)],
      winner: 'tie',
      playerPair: true,
      bankerPair: true,
      playerTotal: 8,
      bankerTotal: 8,
      natural: false,
      timestamp: Date.now(),
      handNumber: 5,
    },
    {
      player: [createCard('J', 'hearts', 0), createCard('5', 'spades', 5)],
      banker: [createCard('3', 'diamonds', 3), createCard('2', 'clubs', 2)],
      winner: 'player',
      playerPair: false,
      bankerPair: false,
      playerTotal: 5,
      bankerTotal: 5,
      natural: false,
      timestamp: Date.now(),
      handNumber: 6,
    },
    {
      player: [createCard('9', 'hearts', 9), createCard('8', 'spades', 8)],
      banker: [createCard('6', 'diamonds', 6), createCard('3', 'clubs', 3)],
      winner: 'player',
      playerPair: false,
      bankerPair: false,
      playerTotal: 7,
      bankerTotal: 9,
      natural: false,
      timestamp: Date.now(),
      handNumber: 7,
    },
    {
      player: [createCard('2', 'hearts', 2), createCard('6', 'spades', 6)],
      banker: [createCard('K', 'diamonds', 0), createCard('8', 'clubs', 8)],
      winner: 'player',
      playerPair: false,
      bankerPair: false,
      playerTotal: 8,
      bankerTotal: 8,
      natural: false,
      timestamp: Date.now(),
      handNumber: 8,
    },
  ];

  // Add each hand to the store
  sampleHands.forEach(hand => {
    store.addHandResult(hand);
  });
}

function setupEdgeSortingDemo() {
  store.setupEdgeSortingDemo();
}

function setupPairBettingDemo() {
  store.setupPairBettingDemo();
}

function addRandomHand() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0];

  function getRandomCard() {
    const rankIndex = Math.floor(Math.random() * ranks.length);
    const suitIndex = Math.floor(Math.random() * suits.length);
    return createCard(ranks[rankIndex], suits[suitIndex], values[rankIndex]);
  }

  function calculateTotal(cards: Card[]): number {
    return cards.reduce((sum, card) => sum + card.value, 0) % 10;
  }

  const playerCards = [getRandomCard(), getRandomCard()];
  const bankerCards = [getRandomCard(), getRandomCard()];

  const playerTotal = calculateTotal(playerCards);
  const bankerTotal = calculateTotal(bankerCards);

  let winner: 'player' | 'banker' | 'tie';
  if (playerTotal > bankerTotal) {
    winner = 'player';
  } else if (bankerTotal > playerTotal) {
    winner = 'banker';
  } else {
    winner = 'tie';
  }

  const playerPair = playerCards[0].rank === playerCards[1].rank;
  const bankerPair = bankerCards[0].rank === bankerCards[1].rank;
  const natural = playerTotal === 8 || playerTotal === 9 || bankerTotal === 8 || bankerTotal === 9;

  const hand: HandResult = {
    player: playerCards,
    banker: bankerCards,
    winner,
    playerPair,
    bankerPair,
    playerTotal,
    bankerTotal,
    natural,
    timestamp: Date.now(),
    handNumber: store.handHistory.length + 1,
  };

  store.addHandResult(hand);
}
</script>
