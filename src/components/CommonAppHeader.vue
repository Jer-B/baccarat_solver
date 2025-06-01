<template>
  <Header :title="props.title" class="app-header">
    <template #default>
      <div class="header-container">
        <div class="header-content">
          <!-- Main Title Section -->
          <div class="header-title-section">
            <h1 class="header-title">{{ props.title }}</h1>
          </div>

          <!-- Actions Section -->
          <div class="header-actions" role="toolbar" aria-label="Header actions">
            <!-- Info Panels Toggle Button -->
            <InfoPanelToggleButton variant="secondary" size="md" @toggle="handleInfoPanelsToggle" />

            <!-- Developer Tools Toggle Button -->
            <DevToolsToggleButton
              variant="warning"
              size="md"
              :is-active="showDeveloperTools"
              @toggle="handleDeveloperToolsToggle"
            />
          </div>
        </div>
      </div>
    </template>
  </Header>
</template>

<script setup lang="ts">
import { withDefaults, defineProps, defineEmits } from 'vue';
import { Header } from '@/design-system/primitives/Header';
import InfoPanelToggleButton from '@/components/common/button/InfoPanelToggleButton.vue';
import DevToolsToggleButton from '@/components/common/button/DevToolsToggleButton.vue';

// Props for header configuration
interface Props {
  title?: string;
  showDeveloperTools?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '🎯 Baccarat Pro',
  showDeveloperTools: false,
});

// Emits for actions - purely event delegation
const emit = defineEmits<{
  toggleDeveloperTools: [];
  toggleInfoPanels: [];
}>();

// Pure event delegation handlers - no business logic
const handleInfoPanelsToggle = (): void => {
  emit('toggleInfoPanels');
  console.log('[common-app-header][event] Info panels toggle delegated');
};

const handleDeveloperToolsToggle = (): void => {
  emit('toggleDeveloperTools');
  console.log('[common-app-header][event] Developer tools toggle delegated');
};
</script>

<style scoped>
/* CommonAppHeader Layout Styles */
.app-header {
  /* Use the original app-header styles from style.css - no overrides needed */
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-4, 1rem);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4, 1rem) 0;
}

.header-title-section {
  flex: 1;
}

.header-title {
  /* Inherit all styles from .app-header .header-title in style.css */
  /* The global styles set: font-size: 1.25rem, font-weight: 700, color: white */
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
}

/* Remove any unwanted focus styles */
.header-actions button:focus {
  outline: none;
}

.header-actions button:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-3, 0.75rem);
    text-align: center;
  }

  .header-actions {
    justify-content: center;
    width: 100%;
  }
}
</style>
