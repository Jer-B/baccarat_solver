<template>
  <div class="min-h-screen unified-body-background flex flex-col">
    <!-- Header -->
    <CDDCommonGameHeader />

    <!-- Navigation Tab Menu -->
    <CDDCommonTabMenu />

    <!-- Main Content Area - Extended Width and Smooth Footer Connection -->
    <main class="flex-1 w-full px-4 sm:px-6 lg:px-8 pt-8 pb-0 unified-content-background">
      <router-view />
    </main>

    <!-- Footer -->
    <CDDCommonFooter />
  </div>
</template>

<script setup lang="ts">
import CDDCommonGameHeader from '@/components/common/CDDCommonGameHeader.vue';
import CDDCommonTabMenu from '@/components/common/CDDCommonTabMenu.vue';
import CDDCommonFooter from '@/components/common/CDDCommonFooter.vue';
</script>

<style scoped>
/* Unified Elegant Background - Professional Over-Excellence Level */
.unified-body-background {
  background: var(--theme-unified-body-bg, #f9fafb);
}

.unified-content-background {
  background: var(--theme-unified-content-bg, #f9fafb);
  /* Removed border-radius and box-shadow for smooth footer connection */
}
</style>
