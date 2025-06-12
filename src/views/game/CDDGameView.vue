<template>
  <div class="cdd-game-view">
    <!-- Game Layout - Responsive and Spacious -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <!-- Session Control - Full Row Width -->
      <div class="col-span-1 md:col-span-2 xl:col-span-3 space-y-6">
        <CDDSessionControl />
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
