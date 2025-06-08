<template>
  <div class="cdd-game-view">
    <!-- Switch to Original Button -->
    <div class="flex justify-end mb-6">
      <button
        @click="switchToOriginal"
        class="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
      >
        ⬅️ Back to Original Game
      </button>
    </div>

    <!-- Placeholder Content -->
    <div class="text-center py-16">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">CDD Game Implementation</h1>
      <p class="text-lg text-gray-600 mb-8">This is the new Component-Driven Development version</p>
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-md mx-auto">
        <p class="text-purple-800">
          🚧 CDD components will be implemented here as we refactor the original codebase
        </p>
      </div>
    </div>
    <!-- Game Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column - Game Controls -->
      <div class="lg:col-span-1 space-y-6">
        <CDDSessionControl />
        <CDDGameActions />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import CDDSessionControl from './components/controls/CDDSessionControl.vue';
const router = useRouter();

const switchToOriginal = () => {
  router.push('/game');
};
</script>
