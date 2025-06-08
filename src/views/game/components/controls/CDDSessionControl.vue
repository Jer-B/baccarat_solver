<template>
  <div class="cdd-card-elevated">
    <div class="cdd-card-header">
      <h3 class="text-lg font-semibold text-gray-900">Session Control</h3>
    </div>
    <div class="cdd-card-body">
      <div class="space-y-4">
        <CDDButton variant="primary" class="w-full"> Start New Session </CDDButton>
        <CDDButton variant="secondary" class="w-full"> Load Session </CDDButton>
        <CDDButton variant="warning" class="w-full"> Save Session </CDDButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CDDButton from '../../../../components/ui/CDDButton.vue';
</script>
