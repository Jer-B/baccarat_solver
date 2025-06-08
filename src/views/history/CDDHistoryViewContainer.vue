<template>
  <div class="cdd-history-container">
    <!-- History Title -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">CDD Game History</h2>
      <p class="text-lg text-gray-600">Professional Game History Analysis & Records</p>
    </div>

    <!-- History Layout -->
    <CDDHistoryView />
  </div>
</template>

<script setup lang="ts">
import CDDHistoryView from './CDDHistoryView.vue';
</script>
