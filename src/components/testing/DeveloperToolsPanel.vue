<template>
  <Panel
    title="🛠️ Developer Tools"
    subtitle="Testing & Development Options"
    :sections="panelSections"
    :is-closable="false"
    class="dev-panel"
    @close="handleClose"
    @section-action="handleSectionAction"
  >
    <template
      #default="{
        title,
        subtitle,
        sections,
        isClosable,
        onClose,
        onSectionAction,
        isSectionActionDisabled,
        getSectionActionLabel,
        getSectionActionTitle,
      }"
    >
      <div class="panel-container">
        <!-- Panel Header -->
        <div class="panel-header">
          <div class="panel-title-section">
            <span class="panel-title">{{ title }}</span>
            <span class="panel-subtitle">{{ subtitle }}</span>
          </div>

          <button
            v-if="isClosable"
            @click="onClose"
            @keydown.enter="onClose"
            @keydown.space.prevent="onClose"
            class="panel-close"
            type="button"
            title="Close developer tools"
            aria-label="Close developer tools"
          >
            ✕
          </button>
        </div>

        <!-- Panel Sections -->
        <div class="panel-sections">
          <div v-for="section in sections" :key="section.sectionId" class="panel-section">
            <h3 class="section-title">{{ section.title }}</h3>

            <div class="section-actions">
              <button
                v-for="action in section.actions"
                :key="action.actionId"
                @click="onSectionAction(section.sectionId, action.actionId)"
                @keydown.enter="onSectionAction(section.sectionId, action.actionId)"
                @keydown.space.prevent="onSectionAction(section.sectionId, action.actionId)"
                :class="['section-action', action.variant || 'secondary']"
                :disabled="isSectionActionDisabled(section.sectionId, action.actionId)"
                :title="getSectionActionTitle(section.sectionId, action.actionId)"
                :aria-label="getSectionActionTitle(section.sectionId, action.actionId)"
                type="button"
              >
                <span v-if="action.icon">{{ action.icon }}</span>
                {{ getSectionActionLabel(section.sectionId, action.actionId) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Panel, type PanelSection } from '@/design-system/primitives/Panel';
import { useBaccaratStore } from '@/stores/baccaratStore';
import { useVisibilityStore } from '@/stores/visibilityStore';
import { DeveloperToolsService } from '@/services/developerToolsService';

// Emits for close action
const emit = defineEmits<{
  close: [];
}>();

// Stores
const store = useBaccaratStore();
const visibilityStore = useVisibilityStore();

// Panel sections configuration
const panelSections = computed((): PanelSection[] => [
  {
    sectionId: 'infoPanels',
    title: 'Info Panels',
    actions: [
      {
        actionId: 'toggleVisibility',
        label: visibilityStore.globalToggleMode ? '👁️ Visible' : '👁️‍🗨️ Hidden',
        title: visibilityStore.globalToggleMode ? 'Hide all info panels' : 'Show all info panels',
        variant: visibilityStore.globalToggleMode ? 'success' : 'secondary',
        icon: '',
      },
    ],
  },
  {
    sectionId: 'sampleData',
    title: 'Sample Data',
    actions: [
      {
        actionId: 'addSampleHands',
        label: 'Sample Hands',
        title: 'Add predefined sample hands for testing',
        variant: 'info',
        icon: '📊',
        disabled: !store.canPerformActions,
      },
      {
        actionId: 'addRandomHand',
        label: 'Random Hand',
        title: 'Generate and add a random hand',
        variant: 'primary',
        icon: '🎲',
        disabled: !store.canPerformActions,
      },
    ],
  },
  {
    sectionId: 'demoScenarios',
    title: 'Demo Scenarios',
    actions: [
      {
        actionId: 'setupEdgeDemo',
        label: 'Edge Demo',
        title: 'Simulate high-card rich shoe for edge sorting advantage',
        variant: 'warning',
        icon: '🃏',
        disabled: !store.canPerformActions,
      },
      {
        actionId: 'setupPairDemo',
        label: 'Pair Demo',
        title: 'Simulate favorable conditions for pair betting',
        variant: 'danger',
        icon: '👥',
        disabled: !store.canPerformActions,
      },
    ],
  },
]);

// Event handlers
const handleClose = (): void => {
  emit('close');
  console.log('[user-interface][user-action] Developer tools closed from panel');
};

const handleSectionAction = (sectionId: string, actionId: string): void => {
  console.log(`[testing][user-action] Section action: ${sectionId}.${actionId}`);

  switch (sectionId) {
    case 'infoPanels':
      handleInfoPanelAction(actionId);
      break;
    case 'sampleData':
      handleSampleDataAction(actionId);
      break;
    case 'demoScenarios':
      handleDemoScenarioAction(actionId);
      break;
    default:
      console.warn(`[testing][warning] Unknown section: ${sectionId}`);
  }
};

// Section-specific action handlers
const handleInfoPanelAction = (actionId: string): void => {
  switch (actionId) {
    case 'toggleVisibility': {
      visibilityStore.toggleGlobalVisibility();
      console.log('[testing][visibility] Global visibility toggled');
      break;
    }
    default:
      console.warn(`[testing][warning] Unknown info panel action: ${actionId}`);
  }
};

const handleSampleDataAction = (actionId: string): void => {
  if (!DeveloperToolsService.validateActionPermission(store.canPerformActions, actionId)) {
    return;
  }

  switch (actionId) {
    case 'addSampleHands': {
      const sampleHands = DeveloperToolsService.generateSampleHands();
      sampleHands.forEach(hand => store.addHandResult(hand));
      console.log('[testing][completion] Added sample hands', { count: sampleHands.length });
      break;
    }
    case 'addRandomHand': {
      const randomHand = DeveloperToolsService.generateRandomHand(store.handHistory.length + 1);
      store.addHandResult(randomHand);
      console.log('[testing][completion] Added random hand');
      break;
    }
    default:
      console.warn(`[testing][warning] Unknown sample data action: ${actionId}`);
  }
};

const handleDemoScenarioAction = (actionId: string): void => {
  if (!DeveloperToolsService.validateActionPermission(store.canPerformActions, actionId)) {
    return;
  }

  switch (actionId) {
    case 'setupEdgeDemo':
      store.setupEdgeSortingDemo();
      console.log('[testing][completion] Edge sorting demo setup');
      break;
    case 'setupPairDemo':
      store.setupPairBettingDemo();
      console.log('[testing][completion] Pair betting demo setup');
      break;
    default:
      console.warn(`[testing][warning] Unknown demo scenario action: ${actionId}`);
  }
};
</script>
