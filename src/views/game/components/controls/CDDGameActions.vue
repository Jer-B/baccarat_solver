<template>
  <div class="cdd-card-elevated">
    <div class="cdd-card-header">
      <h3 class="text-lg font-semibold text-gray-900">Game Actions</h3>
    </div>
    <div class="cdd-card-body">
      <div class="space-y-4">
        <CDDButton variant="success" class="w-full"> Deal New Hand </CDDButton>
        <CDDButton variant="warning" class="w-full"> Clear Table </CDDButton>
        <CDDButton variant="danger" class="w-full"> End Game </CDDButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CDDButton from '../../../../components/ui/CDDButton.vue';
</script>
