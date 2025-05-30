<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- Header Component -->
    <CommonAppHeader
      :show-developer-tools="showDeveloperTools"
      @toggle-developer-tools="toggleDeveloperTools"
    />

    <!-- Developer Tools Panel (Collapsible) -->
    <DeveloperToolsPanel v-if="showDeveloperTools" @close="toggleDeveloperTools" />

    <!-- Navigation Tabs -->
    <CommonTabMenu :tabs="tabs" @tab-click="handleTabClick" @tab-change="handleTabChange" />

    <!-- Connection Status Banner -->
    <ConnectionStatusBanner />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useBettingInterface } from '@/composables/useBettingInterface';
import { useGameLogic } from '@/composables/useGameLogic';

import { testSupabaseConnection } from './utils/testSupabase';
import ConnectionStatusBanner from './components/ConnectionStatusBanner.vue';
import CommonAppHeader from './components/CommonAppHeader.vue';
import DeveloperToolsPanel from './components/testing/DeveloperToolsPanel.vue';
import CommonTabMenu from './components/common/CommonTabMenu.vue';

const store = useBaccaratStore();

// Use betting interface composable
const {
  bettingInterface,
  currentRoundBet,
  isBettingAllowed,
  placeBet,
  settleCurrentBet,
  startNewRound,
} = useBettingInterface();

// Use game logic composable
const { createHandResult } = useGameLogic();

const tabs = [
  { id: 'game', name: 'Game', path: '/game' },
  { id: 'history', name: 'History', path: '/history' },
];

// Developer tools state
const showDeveloperTools = ref(false);

// Toggle developer tools panel
const toggleDeveloperTools = (): void => {
  showDeveloperTools.value = !showDeveloperTools.value;
  console.log('[ui-components][user-action] Developer tools toggled', {
    visible: showDeveloperTools.value,
  });
};

// Tab navigation event handlers
const handleTabClick = (tab: any): void => {
  console.log('[navigation][tab-click] Tab clicked', {
    tabId: tab.id,
    tabName: tab.name,
    tabPath: tab.path,
    timestamp: new Date().toISOString(),
  });
};

const handleTabChange = (tab: any): void => {
  console.log('[navigation][tab-change] Tab changed', {
    tabId: tab.id,
    tabName: tab.name,
    tabPath: tab.path,
    timestamp: new Date().toISOString(),
  });
};

onMounted(async () => {
  // Initialize shoe on app start (always initialize regardless of session state)
  console.log('App mounted, initializing shoe...');
  store.initializeShoe();
  console.log('Shoe initialized, total cards:', store.totalCardsRemaining);

  // Test Supabase connection
  await testSupabaseConnection();
});

// Provide betting interface to child components
provide('currentRoundBet', currentRoundBet);
provide('bettingInterface', bettingInterface);
provide('placeBet', placeBet);
provide('isBettingAllowed', isBettingAllowed);
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
