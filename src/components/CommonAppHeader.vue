<template>
  <Header
    :title="title"
    :actions="headerActions"
    class="app-header"
    @action-click="handleActionClick"
  >
    <template
      #default="{ title, actions, onActionClick, getActionLabel, getActionTitle, isActionActive }"
    >
      <div class="header-container">
        <div class="header-content">
          <!-- Main Title Section -->
          <div class="header-title-section">
            <h1 class="header-title">{{ title }}</h1>
          </div>

          <!-- Actions Section -->
          <div class="header-actions" role="toolbar" aria-label="Header actions">
            <button
              v-for="action in actions"
              :key="action.id"
              @click="onActionClick(action.id)"
              @keydown.enter="onActionClick(action.id)"
              @keydown.space.prevent="onActionClick(action.id)"
              :class="['action-button', isActionActive(action.id) ? 'active' : 'inactive']"
              :title="getActionTitle(action.id)"
              :aria-label="getActionTitle(action.id)"
              :aria-pressed="isActionActive(action.id)"
              type="button"
            >
              {{ getActionLabel(action.id) }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </Header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Header, type HeaderAction } from '@/design-system/primitives/Header';

// Props for header configuration
interface Props {
  showDeveloperTools: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '🎯 Baccarat Pro',
});

// Emits for developer tools toggle
const emit = defineEmits<{
  toggleDeveloperTools: [];
}>();

// Header actions configuration
const headerActions = computed((): HeaderAction[] => [
  {
    id: 'developerTools',
    label: '🛠️ Dev Tools',
    activeLabel: '🛠️ Hide Tools',
    title: 'Toggle developer tools',
    activeTitle: 'Hide developer tools',
    variant: 'warning',
    isActive: props.showDeveloperTools,
  },
]);

// Handle action clicks from headless component
const handleActionClick = (actionId: string): void => {
  switch (actionId) {
    case 'developerTools':
      emit('toggleDeveloperTools');
      console.log('[user-interface][user-action] Developer tools toggled from header');
      break;
    default:
      console.warn(`[user-interface][warning] Unknown header action: ${actionId}`);
  }
};
</script>

<style scoped>
.app-header {
  /* Component-specific styles can be added here if needed */
}
</style>
