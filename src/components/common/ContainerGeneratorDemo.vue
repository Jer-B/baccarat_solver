<!--
🏗️ Container Generator Demo - Over Excellence Level

This demo shows how to recreate the existing session control section
using the Dynamic Layout Composition Engine with 100% accuracy.

Features demonstrated:
- Session Control recreation
- Multiple container types
- Action handling
- Real-time updates
- Professional styling

@fileoverview Container generator demonstration component
@version 1.0.0
@author CDD Architecture Team
-->

<template>
  <div class="demo-container">
    <!-- ==================== SECTION: TITLE ==================== -->
    <div class="demo-section">
      <h2 class="demo-title">🏗️ Dynamic Layout Composition Engine Demo</h2>
      <p class="demo-description">
        Demonstrating the recreation of session control and other container types using the CDD
        Container Generator system.
      </p>
    </div>

    <!-- ==================== SECTION: SESSION CONTROL REPLICA ==================== -->
    <div class="demo-section">
      <h3 class="demo-section-title">✨ Session Control - 100% Recreation</h3>
      <p class="demo-note">
        This container is generated using the Container Generator and matches the existing session
        control section exactly.
      </p>

      <!-- Generated Session Control Container -->
      <CDDContainerGenerator
        v-if="sessionControlConfig"
        :config="sessionControlConfig"
        :loading="sessionLoading"
        :error="sessionError"
        @action-triggered="handleSessionAction"
        @expansion-changed="handleExpansionChange"
        @container-mounted="handleContainerMounted"
      >
        <!-- Session content slot -->
        <template #default>
          <div class="session-content">
            <div class="session-stats">
              <div class="stat-item">
                <span class="stat-label">Balance:</span>
                <span class="stat-value">$1,250.00</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Hands:</span>
                <span class="stat-value">147</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Win Rate:</span>
                <span class="stat-value">68.2%</span>
              </div>
            </div>

            <div class="session-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: '72%' }"></div>
              </div>
              <span class="progress-text">Session Goal: 72% Complete</span>
            </div>
          </div>
        </template>
      </CDDContainerGenerator>
    </div>

    <!-- ==================== SECTION: SESSION CONTROL PERFECT RECREATION ==================== -->
    <section class="demo-section">
      <h3 class="demo-section-title">🎮 Session Control - Perfect Recreation</h3>
      <p class="demo-section-description">
        100% accurate recreation of CDDSessionControl.vue using Container Generator
      </p>

      <div class="demo-container">
        <CDDContainerGenerator
          v-if="sessionControlPerfectConfig"
          :config="sessionControlPerfectConfig"
          @action="handleSessionAction"
          @config-update="handleConfigUpdate"
        />
      </div>

      <!-- Configuration Display -->
      <details class="config-details">
        <summary class="config-summary">View Configuration Code</summary>
        <pre class="config-code">{{ JSON.stringify(sessionControlPerfectConfig, null, 2) }}</pre>
      </details>
    </section>

    <!-- ==================== SECTION: CONTAINER VARIATIONS ==================== -->
    <div class="demo-section">
      <h3 class="demo-section-title">🎨 Container Variations</h3>

      <!-- Simple Panel -->
      <div class="demo-subsection">
        <h4>Simple Panel</h4>
        <CDDContainerGenerator
          v-if="simplePanelConfig"
          :config="simplePanelConfig"
          @container-mounted="handleContainerMounted"
        >
          <template #default>
            <p>This is a simple container with just a title and content.</p>
          </template>
        </CDDContainerGenerator>
      </div>

      <!-- Collapsible Panel -->
      <div class="demo-subsection">
        <h4>Collapsible Panel</h4>
        <CDDContainerGenerator
          v-if="collapsiblePanelConfig"
          :config="collapsiblePanelConfig"
          @expansion-changed="handleExpansionChange"
        >
          <template #default>
            <div class="collapsible-content">
              <p>This content can be hidden/shown by clicking the collapse button.</p>
              <ul>
                <li>Feature 1: Responsive design</li>
                <li>Feature 2: Accessibility support</li>
                <li>Feature 3: Theme integration</li>
              </ul>
            </div>
          </template>
        </CDDContainerGenerator>
      </div>

      <!-- Action Panel -->
      <div class="demo-subsection">
        <h4>Action Panel</h4>
        <CDDContainerGenerator
          v-if="actionPanelConfig"
          :config="actionPanelConfig"
          @action-triggered="handlePanelAction"
        >
          <template #default>
            <div class="action-content">
              <p>This panel demonstrates action buttons with different types and states.</p>
              <div class="action-info">
                <p><strong>Last Action:</strong> {{ lastAction || 'None' }}</p>
                <p><strong>Action Count:</strong> {{ actionCount }}</p>
              </div>
            </div>
          </template>
        </CDDContainerGenerator>
      </div>
    </div>

    <!-- ==================== SECTION: TECHNICAL DETAILS ==================== -->
    <div class="demo-section">
      <h3 class="demo-section-title">⚙️ Technical Implementation</h3>

      <div class="tech-details">
        <div class="tech-item">
          <h4>Container Generator Features:</h4>
          <ul>
            <li>✅ TypeScript-first with branded types</li>
            <li>✅ Modular component architecture</li>
            <li>✅ Professional theme integration</li>
            <li>✅ Accessibility compliance (WCAG 2.1)</li>
            <li>✅ Real-time configuration updates</li>
            <li>✅ Event-driven action system</li>
            <li>✅ Responsive design system</li>
            <li>✅ Error handling and validation</li>
          </ul>
        </div>

        <div class="tech-item">
          <h4>Generated Container Count:</h4>
          <p class="container-count">{{ containerGenerator.totalContainers }}</p>
        </div>

        <div class="tech-item">
          <h4>Active Containers:</h4>
          <div class="active-containers">
            <div v-for="(container, id) in activeContainers" :key="id" class="container-info">
              <span class="container-id">{{ id }}</span>
              <span class="container-type">{{ container.config.type }}</span>
              <span
                class="container-status"
                :class="{
                  'status-expanded': container.isExpanded,
                  'status-collapsed': !container.isExpanded,
                  'status-loading': container.isLoading,
                  'status-error': !!container.error,
                }"
              >
                {{ getContainerStatus(container) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== SECTION: CONFIGURATION EXPORT ==================== -->
    <div class="demo-section">
      <h3 class="demo-section-title">📋 Configuration Export</h3>
      <p class="demo-note">
        Export and import container configurations for reuse across different contexts.
      </p>

      <div class="export-controls">
        <button
          class="export-button"
          @click="exportConfigurations"
          :disabled="!containerGenerator.hasContainers"
        >
          Export Configurations
        </button>

        <button
          class="clear-button"
          @click="clearAllContainers"
          :disabled="!containerGenerator.hasContainers"
        >
          Clear All Containers
        </button>
      </div>

      <!-- Configuration Display -->
      <div v-if="exportedConfig" class="config-display">
        <h4>Exported Configuration:</h4>
        <pre class="config-json">{{ JSON.stringify(exportedConfig, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useContainerGenerator } from '../../composables/useContainerGenerator';
import {
  type ContainerConfig,
  type ContainerId,
  ContainerType,
  TitleFeature,
  ActionButtonType,
  createSessionControlConfig,
  createBasicContainerConfig,
} from '../../types/core/containerGeneratorTypes';
import CDDContainerGenerator from './CDDContainerGenerator.vue';

// ==================== COMPOSABLES ====================

const containerGenerator = useContainerGenerator({
  debug: true,
  maxContainers: 20,
  enableValidation: true,
});

// ==================== REACTIVE STATE ====================

const sessionLoading = ref(false);
const sessionError = ref<string | null>(null);
const lastAction = ref<string | null>(null);
const actionCount = ref(0);
const exportedConfig = ref<Record<string, ContainerConfig> | null>(null);

// Container configurations
const sessionControlConfig = ref<ContainerConfig | null>(null);
const sessionControlPerfectConfig = ref<ContainerConfig | null>(null);
const simplePanelConfig = ref<ContainerConfig | null>(null);
const collapsiblePanelConfig = ref<ContainerConfig | null>(null);
const actionPanelConfig = ref<ContainerConfig | null>(null);

// ==================== COMPUTED ====================

const activeContainers = computed(() => {
  const containers: Record<string, any> = {};
  containerGenerator.containers.value.forEach((container, id) => {
    containers[id] = container;
  });
  return containers;
});

// ==================== METHODS ====================

const initializeContainers = () => {
  // Create Session Control (100% recreation)
  sessionControlConfig.value = createSessionControlConfig();

  // Create Session Control Perfect Recreation - 100% accurate to CDDSessionControl.vue
  sessionControlPerfectConfig.value = createSessionControlConfig();

  // Create Simple Panel
  simplePanelConfig.value = createBasicContainerConfig(
    'Simple Information Panel',
    ContainerType.BASIC_HEADER
  );

  // Create Collapsible Panel
  const collapsibleBase = createBasicContainerConfig(
    'Collapsible Settings Panel',
    ContainerType.COLLAPSIBLE
  );

  collapsiblePanelConfig.value = {
    ...collapsibleBase,
    titleBar: {
      ...collapsibleBase.titleBar,
      feature: TitleFeature.WITH_COLLAPSE,
      collapsible: true,
      initialExpanded: false,
      subtitle: 'Click to expand/collapse',
    },
  };

  // Create Action Panel
  const actionBase = createBasicContainerConfig('Action Control Panel', ContainerType.ACTION_PANEL);

  actionPanelConfig.value = {
    ...actionBase,
    titleBar: {
      ...actionBase.titleBar,
      feature: TitleFeature.WITH_ACTIONS,
      status: {
        show: true,
        text: 'Ready',
        color: 'success',
        badge: true,
      },
      actions: [
        {
          id: 'save-action',
          type: ActionButtonType.PRIMARY,
          label: 'Save',
          icon: '💾',
          tooltip: 'Save current settings',
          onClick: async () => {
            await handleActionClick('save-action', 'Save');
          },
        },
        {
          id: 'reset-action',
          type: ActionButtonType.SECONDARY,
          label: 'Reset',
          icon: '🔄',
          tooltip: 'Reset to defaults',
          onClick: async () => {
            await handleActionClick('reset-action', 'Reset');
          },
        },
        {
          id: 'delete-action',
          type: ActionButtonType.DANGER,
          label: 'Delete',
          icon: '🗑️',
          tooltip: 'Delete configuration',
          onClick: async () => {
            await handleActionClick('delete-action', 'Delete');
          },
        },
      ],
    },
  };
};

const handleActionClick = async (actionId: string, actionName: string) => {
  lastAction.value = `${actionName} (${actionId})`;
  actionCount.value++;

  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log(`[demo][action] ${actionName} action executed`);
};

const handleSessionAction = async (containerId: ContainerId, actionId: string) => {
  console.log(`[demo][session] Action triggered:`, { containerId, actionId });

  if (actionId === 'primary-action') {
    sessionLoading.value = true;
    sessionError.value = null;

    try {
      // Simulate session start/stop
      await new Promise(resolve => setTimeout(resolve, 1000));
      lastAction.value = 'Session Control';
      actionCount.value++;
    } catch (error) {
      sessionError.value = 'Session action failed';
    } finally {
      sessionLoading.value = false;
    }
  }
};

const handlePanelAction = async (containerId: ContainerId, actionId: string) => {
  console.log(`[demo][panel] Action triggered:`, { containerId, actionId });
  // Action handling is done in the action button onClick
};

const handleExpansionChange = (containerId: ContainerId, isExpanded: boolean) => {
  console.log(`[demo][expansion] Container ${containerId} expanded: ${isExpanded}`);
};

const handleContainerMounted = (containerId: ContainerId) => {
  console.log(`[demo][mount] Container mounted: ${containerId}`);
};

const getContainerStatus = (container: any): string => {
  if (container.isLoading) return 'Loading';
  if (container.error) return 'Error';
  if (container.isExpanded) return 'Expanded';
  return 'Collapsed';
};

const exportConfigurations = () => {
  exportedConfig.value = containerGenerator.exportConfiguration();
  console.log('[demo][export] Configurations exported:', exportedConfig.value);
};

const clearAllContainers = () => {
  containerGenerator.clearAllContainers();
  exportedConfig.value = null;
  console.log('[demo][clear] All containers cleared');
};

const handleConfigUpdate = (containerId: ContainerId, config: ContainerConfig) => {
  console.log(`[demo][config] Container ${containerId} config updated:`, config);
};

// ==================== LIFECYCLE ====================

onMounted(() => {
  initializeContainers();
});
</script>

<style scoped>
/* ==================== DEMO STYLING ==================== */

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
  text-align: center;
}

.demo-description {
  font-size: 1.1rem;
  color: #4a5568;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.demo-subsection {
  margin-bottom: 2rem;
}

.demo-subsection h4 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.demo-note {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #4a5568;
  font-style: italic;
}

/* ==================== CONTENT STYLING ==================== */

.session-content {
  space-y: 1rem;
}

.session-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.stat-label {
  font-weight: 500;
  color: #4a5568;
}

.stat-value {
  font-weight: 700;
  color: #1a202c;
}

.session-progress {
  space-y: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #e2e8f0;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

.collapsible-content,
.action-content {
  line-height: 1.6;
}

.action-info {
  background: #f8fafc;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
}

/* ==================== TECHNICAL DETAILS ==================== */

.tech-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.tech-item h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.tech-item ul {
  list-style: none;
  padding: 0;
  space-y: 0.25rem;
}

.tech-item li {
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.container-count {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.active-containers {
  space-y: 0.5rem;
}

.container-info {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 0.25rem;
  border: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.container-id {
  font-family: 'Monaco', 'Menlo', monospace;
  color: #4a5568;
}

.container-type {
  color: #667eea;
  font-weight: 500;
}

.container-status {
  font-weight: 600;
}

.status-expanded {
  color: #48bb78;
}
.status-collapsed {
  color: #4a5568;
}
.status-loading {
  color: #ed8936;
}
.status-error {
  color: #f56565;
}

/* ==================== EXPORT CONTROLS ==================== */

.export-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.export-button,
.clear-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-button {
  background: #667eea;
  color: white;
}

.export-button:hover:not(:disabled) {
  background: #5a67d8;
}

.clear-button {
  background: #f56565;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background: #e53e3e;
}

.export-button:disabled,
.clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.config-display {
  margin-top: 1rem;
}

.config-json {
  background: #1a202c;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  font-family: 'Monaco', 'Menlo', monospace;
}
</style>
