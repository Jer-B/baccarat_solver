<template>
  <Panel
    title="🛠️ Developer Tools"
    subtitle="Testing & Development Options"
    :sections="panelSections"
    :is-closable="false"
    class="dev-panel"
    @close="handleClose"
    @section-action="handleSectionAction"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Panel, type PanelAction } from '@/design-system/primitives/Panel';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { getDeveloperToolsSections } from '@/config/developerTools';
import { DeveloperToolsActionExecutor } from '@/services/developerToolsActionStrategy';

// Emits for close action
const emit = defineEmits<{
  close: [];
}>();

// Stores
const store = useBaccaratStore();

// Configuration-driven panel sections - NO hardcoded values
const panelSections = computed(() => {
  return getDeveloperToolsSections(store.canPerformActions);
});

// Event handlers - Clean, compositional approach
const handleClose = (): void => {
  emit('close');
  console.log('[user-interface][user-action] Developer tools closed from panel');
};

const handleSectionAction = (sectionId: string, actionId: string, action: PanelAction): void => {
  console.log(`[testing][user-action] Section action: ${sectionId}.${actionId}`, {
    action: {
      actionId: action.actionId,
      label: action.label,
      variant: action.variant,
      disabled: action.disabled,
      icon: action.icon,
    },
  });

  // Strategy pattern - NO switch statements
  DeveloperToolsActionExecutor.execute(sectionId, actionId, store);
};
</script>

<style scoped>
/* Developer Panel Component - EXACT UI PRESERVATION */
.dev-panel {
  background: linear-gradient(135deg, #374151, #4b5563);
  border-top: 2px solid #6b7280;
  color: white;
}

:deep(.panel-container) {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-4) var(--spacing-layout-panel);
}

:deep(.panel-header) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: var(--spacing-4);
}

:deep(.panel-title-section) {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

:deep(.panel-title) {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

:deep(.panel-subtitle) {
  font-size: 0.875rem;
  margin: 0;
  color: #d1d5db;
  font-weight: 500;
}

:deep(.panel-sections) {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-6);
}

@media (min-width: 768px) {
  :deep(.panel-sections) {
    grid-template-columns: repeat(3, 1fr);
  }
}

:deep(.panel-section) {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

:deep(.section-title) {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  color: #e5e7eb;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

:deep(.section-actions) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

:deep(.section-action) {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--spacing-2);
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  outline: none;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 120px;
  text-align: center;
}

:deep(.section-action:focus-visible) {
  outline: 2px solid white;
  outline-offset: 2px;
}

:deep(.section-action:disabled) {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none;
  background-color: #6b7280 !important;
  border-color: #9ca3af !important;
  color: #d1d5db !important;
}

:deep(.section-action:not(:disabled):hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Action Button Variants - Enhanced for better visibility */
:deep(.section-action.primary) {
  background-color: #3b82f6;
  border-color: #2563eb;
}

:deep(.section-action.primary:hover:not(:disabled)) {
  background-color: #2563eb;
  border-color: #1d4ed8;
}

:deep(.section-action.secondary) {
  background-color: #64748b;
  border-color: #475569;
}

:deep(.section-action.secondary:hover:not(:disabled)) {
  background-color: #475569;
  border-color: #334155;
}

:deep(.section-action.success) {
  background-color: #10b981;
  border-color: #059669;
}

:deep(.section-action.success:hover:not(:disabled)) {
  background-color: #059669;
  border-color: #047857;
}

:deep(.section-action.warning) {
  background-color: #f59e0b;
  border-color: #d97706;
}

:deep(.section-action.warning:hover:not(:disabled)) {
  background-color: #d97706;
  border-color: #b45309;
}

:deep(.section-action.danger) {
  background-color: #ef4444;
  border-color: #dc2626;
}

:deep(.section-action.danger:hover:not(:disabled)) {
  background-color: #dc2626;
  border-color: #b91c1c;
}

:deep(.section-action.info) {
  background-color: #06b6d4;
  border-color: #0891b2;
}

:deep(.section-action.info:hover:not(:disabled)) {
  background-color: #0891b2;
  border-color: #0e7490;
}
</style>
