<template>
  <div class="space-y-6">
    <!-- Simple Switch to CDD Button -->
    <div class="flex justify-end">
      <button
        @click="switchToCDD"
        class="inline-flex items-center px-6 py-3 border border-purple-600 text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors shadow-sm"
      >
        🚀 CDD History Page
      </button>
    </div>

    <SessionHistory />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import SessionHistory from '@/components/history/SessionHistory.vue';

const router = useRouter();

const switchToCDD = () => {
  router.push('/cdd/history');
};
</script>

<style scoped>
.history-view {
  @apply max-w-7xl mx-auto;
}

/* Custom styles for baccarat theme */
.bg-baccarat-green {
  background-color: #059669;
}

.bg-baccarat-green:hover {
  background-color: #047857;
}
</style>
