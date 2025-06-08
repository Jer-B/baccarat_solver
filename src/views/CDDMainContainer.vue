<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <CDDCommonGameHeader />

    <!-- Navigation Tab Menu -->
    <CDDCommonTabMenu />

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import CDDCommonGameHeader from '@/components/common/CDDCommonGameHeader.vue';
import CDDCommonTabMenu from '@/components/common/CDDCommonTabMenu.vue';
</script>
