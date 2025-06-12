<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- Shared components only for original implementation -->
    <template v-if="!isCDDRoute">
      <!-- Header Component -->
      <CommonAppHeader
        :show-developer-tools="showDeveloperTools"
        @toggle-developer-tools="handleDeveloperToolsToggle"
        @toggle-info-panels="handleInfoPanelsToggle"
      />

      <!-- Developer Tools Panel (Collapsible) -->
      <DeveloperToolsPanel v-if="showDeveloperTools" @close="handleDeveloperToolsClose" />

      <!-- Navigation Tabs -->
      <CommonTabMenu :tabs="tabs" @tab-click="handleTabClick" @tab-change="handleTabChange" />

      <!-- Connection Status Banner -->
      <ConnectionStatusBanner />
    </template>

    <!-- Main Content -->
    <main :class="isCDDRoute ? '' : 'container mx-auto px-4 py-6'">
      <router-view />
    </main>

    <!-- Theme-Aware DB Status (Global) -->
    <ThemeAwareDbStatus />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide, computed, nextTick } from 'vue';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useThemeStore } from '@/stores/themeStore';
import { useBettingInterface } from '@/composables/useBettingInterface';
import { useSessionPersistence } from '@/composables/useSessionPersistence';
import { TOGGLE_SETTINGS } from '@/config/gameSettings';
import { useRoute } from 'vue-router';

import { testSupabaseConnection } from './utils/testSupabase';
import ConnectionStatusBanner from './components/ConnectionStatusBanner.vue';
import CommonAppHeader from './components/CommonAppHeader.vue';
import DeveloperToolsPanel from './components/testing/DeveloperToolsPanel.vue';
import CommonTabMenu from './components/common/CommonTabMenu.vue';
import ThemeAwareDbStatus from './components/common/ThemeAwareDbStatus.vue';

const store = useBaccaratStore();
const connectionStore = useConnectionStore();
const themeStore = useThemeStore();
const route = useRoute();

// Session persistence with setup() pattern
const { handlePageLoad, cleanupSessionPersistence } = useSessionPersistence();

// Developer tools state with configuration integration
const showDeveloperTools = ref(getInitialDeveloperToolsState());

function getInitialDeveloperToolsState(): boolean {
  if (TOGGLE_SETTINGS.PERSIST_TOGGLE_STATES) {
    const stored = localStorage.getItem('showDeveloperTools');
    return stored ? JSON.parse(stored) : TOGGLE_SETTINGS.DEV_TOOLS_DEFAULT_VISIBLE;
  }
  return TOGGLE_SETTINGS.DEV_TOOLS_DEFAULT_VISIBLE;
}

// Navigation tabs
const tabs = [
  { id: 'game', name: 'Game', path: '/game' },
  { id: 'history', name: 'History', path: '/history' },
];

// Event handlers
const handleDeveloperToolsToggle = (): void => {
  showDeveloperTools.value = !showDeveloperTools.value;
  if (TOGGLE_SETTINGS.PERSIST_TOGGLE_STATES) {
    localStorage.setItem('showDeveloperTools', JSON.stringify(showDeveloperTools.value));
  }
};

const handleDeveloperToolsClose = (): void => {
  showDeveloperTools.value = false;
  if (TOGGLE_SETTINGS.PERSIST_TOGGLE_STATES) {
    localStorage.setItem('showDeveloperTools', JSON.stringify(false));
  }
};

const handleInfoPanelsToggle = (): void => {
  // Delegate to store via header
};

// Tab navigation event handlers
const handleTabClick = (tab: any): void => {
  // Tab click handling
};

const handleTabChange = (tab: any): void => {
  // Tab change handling
};

// Setup lifecycle with setup() pattern
onMounted(async () => {
  // Initialize theme AFTER mount to ensure persistence has loaded
  await nextTick();
  themeStore.initializeTheme();

  // Handle page load and setup session persistence
  await handlePageLoad();

  // Initialize stores with configuration
  await connectionStore.initialize();

  // Initialize shoe on app start
  store.initializeShoe();

  // Test Supabase connection (legacy - now handled by connection store)
  await testSupabaseConnection();
});

onUnmounted(() => {
  cleanupSessionPersistence();
});

// Provide betting interface to child components
const { bettingInterface, currentRoundBet, isBettingAllowed, placeBet } = useBettingInterface();
provide('currentRoundBet', currentRoundBet);
provide('bettingInterface', bettingInterface);
provide('placeBet', placeBet);
provide('isBettingAllowed', isBettingAllowed);

// Computed property to determine if the current route is a CDD route
const isCDDRoute = computed(() => route.path.startsWith('/cdd'));
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
