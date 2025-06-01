<template>
  <div class="space-y-6">
    <SessionHistory />
  </div>
</template>

<script setup lang="ts">
import SessionHistory from '@/components/history/SessionHistory.vue';
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
