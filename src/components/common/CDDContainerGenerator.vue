<!--
🏗️ CDD Container Generator Component - Over Excellence Level

Dynamic container generation system supporting multiple container types
with conditional features, positioning, and theme integration.

@fileoverview Container generator Vue component with TypeScript excellence
@version 1.0.0
@author CDD Architecture Team
-->

<template>
  <div
    :class="containerClasses"
    :style="containerStyles"
    role="region"
    :aria-labelledby="`${config.id}-title`"
    :aria-expanded="isExpanded"
    :aria-busy="loading"
    @keydown="handleKeyDown"
    ref="containerRef"
  >
    <!-- 🎯 TITLE BAR - Conditional rendering based on feature type -->
    <header
      v-if="showTitleBar"
      :class="titleBarClasses"
      :style="titleBarStyles"
      @click="handleTitleClick"
      role="banner"
      :aria-controls="`${config.id}-content`"
    >
      <!-- Title Section -->
      <div class="cdd-title-section">
        <h2 :id="`${config.id}-title`" :class="titleClasses">
          {{ config.titleBar.title }}
        </h2>

        <!-- Subtitle -->
        <p v-if="config.titleBar.subtitle" :class="subtitleClasses">
          {{ config.titleBar.subtitle }}
        </p>
      </div>

      <!-- Status Indicator -->
      <div v-if="showStatus" :class="statusClasses" :aria-label="statusAriaLabel">
        <span v-if="config.titleBar.status?.badge" :class="statusBadgeClasses">
          {{ statusText }}
        </span>
        <span v-else>{{ statusText }}</span>
      </div>

      <!-- Collapsed State Info (duration, buttons) -->
      <div v-if="!isExpanded && showCollapsedInfo" :class="collapsedInfoClasses">
        <!-- Custom collapsed content slot -->
        <slot
          name="collapsed-info"
          :config="config"
          :is-expanded="isExpanded"
          :loading="loading"
          :error="error"
        >
          <!-- Default collapsed info -->
          <span class="cdd-collapsed-duration">{{ collapsedDuration }}</span>
        </slot>

        <!-- Action buttons in collapsed state -->
        <div v-if="showActionsInCollapsed" class="cdd-collapsed-actions">
          <button
            v-for="action in visibleActions"
            :key="action.id"
            :class="getActionButtonClasses(action)"
            :disabled="action.disabled || loading"
            :aria-label="action.tooltip || action.label"
            @click.stop="handleActionClick(action)"
          >
            <span v-if="action.loading" class="cdd-button-spinner" />
            <span v-if="action.icon" :class="`icon-${action.icon}`" />
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Action Buttons (expanded state) -->
      <div v-if="isExpanded && showActions" :class="actionsClasses">
        <button
          v-for="action in config.titleBar.actions"
          :key="action.id"
          :class="getActionButtonClasses(action)"
          :disabled="action.disabled || loading"
          :aria-label="action.tooltip || action.label"
          @click.stop="handleActionClick(action)"
        >
          <span v-if="action.loading" class="cdd-button-spinner" />
          <span v-if="action.icon" :class="`icon-${action.icon}`" />
          {{ action.label }}
        </button>
      </div>

      <!-- Collapse Toggle Button -->
      <button
        v-if="isCollapsible"
        :class="collapseButtonClasses"
        :aria-label="collapseAriaLabel"
        @click.stop="handleCollapseToggle"
      >
        <span :class="collapseIconClasses" />
      </button>
    </header>

    <!-- 🎯 CONTENT AREA - Always present, conditionally visible -->
    <main
      :id="`${config.id}-content`"
      :class="contentClasses"
      :style="contentStyles"
      :aria-hidden="!isExpanded"
      role="main"
    >
      <!-- Loading State -->
      <div v-if="loading" :class="loadingClasses" role="status" aria-label="Loading content">
        <div class="cdd-loading-spinner" />
        <span class="cdd-loading-text">Loading...</span>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        :class="errorClasses"
        role="alert"
        :aria-describedby="`${config.id}-error`"
      >
        <div class="cdd-error-icon" />
        <div class="cdd-error-content">
          <h3 class="cdd-error-title">Something went wrong</h3>
          <p :id="`${config.id}-error`" class="cdd-error-message">{{ error }}</p>
          <button class="cdd-error-retry" @click="$emit('retry-requested', config.id)">
            Try Again
          </button>
        </div>
      </div>

      <!-- Normal Content -->
      <div v-else :class="normalContentClasses">
        <!-- Before Content Slot -->
        <slot
          name="before-content"
          :config="config"
          :is-expanded="isExpanded"
          :loading="loading"
          :error="error"
        />

        <!-- Main Content Slot -->
        <slot
          :config="config"
          :is-expanded="isExpanded"
          :loading="loading"
          :error="error"
          :container-id="config.id"
        >
          <!-- Default content when no slot provided -->
          <div class="cdd-default-content">
            <p>No content provided for container: {{ config.titleBar.title }}</p>
          </div>
        </slot>

        <!-- After Content Slot -->
        <slot
          name="after-content"
          :config="config"
          :is-expanded="isExpanded"
          :loading="loading"
          :error="error"
        />
      </div>
    </main>

    <!-- 🎯 FOOTER - Optional footer content -->
    <footer v-if="$slots.footer" :class="footerClasses" role="contentinfo">
      <slot
        name="footer"
        :config="config"
        :is-expanded="isExpanded"
        :loading="loading"
        :error="error"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import {
  type ContainerConfig,
  type ContainerId,
  type ActionButtonConfig,
  ContainerType,
  TitleFeature,
  ActionButtonType,
} from '../../types/core/containerGeneratorTypes';

// ==================== COMPONENT INTERFACE ====================

interface Props {
  config: ContainerConfig;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
  debug?: boolean;
}

interface Emits {
  (e: 'expansion-changed', containerId: ContainerId, isExpanded: boolean): void;
  (e: 'action-triggered', containerId: ContainerId, actionId: string): void;
  (e: 'container-mounted', containerId: ContainerId): void;
  (e: 'container-unmounted', containerId: ContainerId): void;
  (e: 'retry-requested', containerId: ContainerId): void;
  (e: 'error-occurred', containerId: ContainerId, error: Error): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  disabled: false,
  debug: false,
});

const emit = defineEmits<Emits>();

// ==================== REACTIVE STATE ====================

const containerRef = ref<HTMLElement>();
const isExpanded = ref(props.config.titleBar.initialExpanded ?? true);
const collapsedDuration = ref('0h 0m 0s'); // This would be passed from parent for session control

// ==================== COMPUTED PROPERTIES ====================

// Title bar visibility
const showTitleBar = computed(() => props.config.titleBar.feature !== TitleFeature.NONE);

// Title bar features
const showStatus = computed(() => props.config.titleBar.status?.show ?? false);

const showActions = computed(
  () =>
    props.config.titleBar.feature === TitleFeature.WITH_ACTIONS ||
    props.config.titleBar.feature === TitleFeature.FULL_FEATURED
);

const showActionsInCollapsed = computed(
  () => props.config.titleBar.showActionsInCollapsed ?? false
);

const showCollapsedInfo = computed(() => !isExpanded.value && isCollapsible.value);

const isCollapsible = computed(() => props.config.titleBar.collapsible ?? false);

// Action handling
const visibleActions = computed(
  () => props.config.titleBar.actions?.slice(0, 2) ?? [] // Show max 2 actions in collapsed state
);

// Status
const statusText = computed(() => props.config.titleBar.status?.text ?? 'Ready');

const statusAriaLabel = computed(() => `Status: ${statusText.value}`);

// Accessibility
const collapseAriaLabel = computed(() =>
  isExpanded.value ? 'Collapse section' : 'Expand section'
);

// ==================== CSS CLASSES ====================

const containerClasses = computed(() => [
  'cdd-container',
  `cdd-container--${props.config.type}`,
  `cdd-container--${props.config.layout.size}`,
  `cdd-container--${props.config.layout.position}`,
  `cdd-theme--${props.config.theme.theme}`,
  `cdd-variant--${props.config.theme.variant}`,
  {
    'cdd-container--expanded': isExpanded.value,
    'cdd-container--collapsed': !isExpanded.value,
    'cdd-container--loading': props.loading,
    'cdd-container--error': !!props.error,
    'cdd-container--disabled': props.disabled,
    'cdd-container--collapsible': isCollapsible.value,
  },
  props.config.layout.className,
]);

const titleBarClasses = computed(() => [
  'cdd-title-bar',
  `cdd-title-bar--${props.config.titleBar.feature}`,
  {
    'cdd-title-bar--clickable': isCollapsible.value,
    'cdd-title-bar--with-status': showStatus.value,
    'cdd-title-bar--with-actions': showActions.value,
  },
]);

const titleClasses = computed(() => [
  'cdd-title',
  {
    'cdd-title--large': props.config.type === ContainerType.FULL_FEATURED,
    'cdd-title--medium': props.config.type === ContainerType.ACTION_PANEL,
    'cdd-title--small': props.config.type === ContainerType.SIMPLE,
  },
]);

const subtitleClasses = computed(() => ['cdd-subtitle']);

const statusClasses = computed(() => [
  'cdd-status',
  `cdd-status--${props.config.titleBar.status?.color ?? 'neutral'}`,
  {
    'cdd-status--pulse': props.config.titleBar.status?.pulse ?? false,
    'cdd-status--badge': props.config.titleBar.status?.badge ?? false,
  },
]);

const statusBadgeClasses = computed(() => [
  'cdd-status-badge',
  `cdd-status-badge--${props.config.titleBar.status?.color ?? 'neutral'}`,
]);

const collapsedInfoClasses = computed(() => ['cdd-collapsed-info']);

const actionsClasses = computed(() => ['cdd-actions']);

const collapseButtonClasses = computed(() => ['cdd-collapse-button']);

const collapseIconClasses = computed(() => [
  'cdd-collapse-icon',
  {
    'cdd-collapse-icon--expanded': isExpanded.value,
    'cdd-collapse-icon--collapsed': !isExpanded.value,
  },
]);

const contentClasses = computed(() => [
  'cdd-content',
  `cdd-content--padding-${props.config.content.padding ?? 'md'}`,
  `cdd-content--background-${props.config.content.background ?? 'neutral'}`,
  {
    'cdd-content--hidden': !isExpanded.value,
    'cdd-content--scrollable': props.config.content.scrollable ?? false,
  },
  props.config.content.customClassName,
]);

const loadingClasses = computed(() => ['cdd-loading']);

const errorClasses = computed(() => ['cdd-error']);

const normalContentClasses = computed(() => ['cdd-normal-content']);

const footerClasses = computed(() => ['cdd-footer']);

// ==================== STYLES ====================

const containerStyles = computed(() => ({
  '--cdd-z-index': props.config.layout.zIndex?.toString(),
  '--cdd-border-radius': `var(--radius-${props.config.theme.borderRadius})`,
  '--cdd-shadow': `var(--shadow-${props.config.theme.shadow})`,
  ...props.config.layout.customDimensions,
  ...(props.config.content.maxHeight && { '--cdd-max-height': props.config.content.maxHeight }),
}));

const titleBarStyles = computed(() => ({}));

const contentStyles = computed(() => ({
  maxHeight: props.config.content.maxHeight || 'none',
}));

// ==================== ACTION BUTTON STYLING ====================

/**
 * ✅ ActionButtonType Usage:
 * ActionButtonType is used here to generate CSS classes for action buttons.
 * Each action.type (PRIMARY, SECONDARY, DANGER, INFO, CUSTOM) gets a corresponding CSS class.
 * This enables different styling for different button types through the design system.
 */
const getActionButtonClasses = (action: ActionButtonConfig) => [
  'cdd-action-button',
  `cdd-action-button--${action.type}`,
  {
    'cdd-action-button--loading': action.loading,
    'cdd-action-button--disabled': action.disabled || props.loading,
  },
];

// ==================== EVENT HANDLERS ====================

const handleTitleClick = (): void => {
  if (isCollapsible.value && !props.disabled) {
    handleCollapseToggle();
  }
};

const handleCollapseToggle = (): void => {
  if (props.disabled) return;

  isExpanded.value = !isExpanded.value;
  emit('expansion-changed', props.config.id, isExpanded.value);

  if (props.debug) {
    console.log('[container-generator][interaction] Expansion changed:', {
      containerId: props.config.id,
      isExpanded: isExpanded.value,
    });
  }
};

const handleActionClick = async (action: ActionButtonConfig): Promise<void> => {
  if (action.disabled || props.loading || props.disabled) return;

  try {
    emit('action-triggered', props.config.id, action.id);
    await action.onClick();

    if (props.debug) {
      console.log('[container-generator][action] Action triggered:', {
        containerId: props.config.id,
        actionId: action.id,
      });
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    emit('error-occurred', props.config.id, errorObj);

    console.error('[container-generator][error] Action failed:', {
      containerId: props.config.id,
      actionId: action.id,
      error: errorObj,
    });
  }
};

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.target !== containerRef.value) return;

  switch (event.key) {
    case 'Enter':
    case ' ':
      if (isCollapsible.value) {
        event.preventDefault();
        handleCollapseToggle();
      }
      break;
    case 'Escape':
      if (isExpanded.value && isCollapsible.value) {
        event.preventDefault();
        isExpanded.value = false;
        emit('expansion-changed', props.config.id, false);
      }
      break;
  }
};

// ==================== WATCHERS ====================

watch(
  () => props.config.titleBar.initialExpanded,
  newValue => {
    if (newValue !== undefined) {
      isExpanded.value = newValue;
    }
  }
);

// ==================== LIFECYCLE ====================

onMounted(() => {
  emit('container-mounted', props.config.id);

  if (props.debug) {
    console.log('[container-generator][lifecycle] Container mounted:', props.config.id);
  }
});

onBeforeUnmount(() => {
  emit('container-unmounted', props.config.id);

  if (props.debug) {
    console.log('[container-generator][lifecycle] Container unmounted:', props.config.id);
  }
});
</script>

<style scoped>
/* 🎨 CONTAINER GENERATOR STYLES */

.cdd-container {
  @apply relative w-full transition-all duration-300 ease-in-out;
  border-radius: var(--cdd-border-radius, theme(borderRadius.lg));
  box-shadow: var(--cdd-shadow, theme(boxShadow.md));
  z-index: var(--cdd-z-index, 1);
}

/* Container Variants */
.cdd-container--luxury {
  @apply bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200;
}

.cdd-container--elite {
  @apply bg-gradient-to-br from-slate-50 to-zinc-50 border border-slate-300;
}

/* Container States */
.cdd-container--loading {
  @apply opacity-90;
}

.cdd-container--error {
  @apply border-red-300 bg-red-50;
}

.cdd-container--disabled {
  @apply opacity-50 pointer-events-none;
}

/* Container Sizes */
.cdd-container--compact {
  @apply max-w-md;
}

.cdd-container--standard {
  @apply max-w-2xl;
}

.cdd-container--expanded {
  @apply max-w-4xl;
}

.cdd-container--full_width {
  @apply max-w-none w-full;
}

/* Title Bar */
.cdd-title-bar {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
  @apply bg-gradient-to-r from-purple-100 to-indigo-100;
}

.cdd-title-bar--clickable {
  @apply cursor-pointer hover:bg-gradient-to-r hover:from-purple-200 hover:to-indigo-200;
  @apply transition-colors duration-200;
}

.cdd-title-section {
  @apply flex-1 min-w-0;
}

.cdd-title {
  @apply text-lg font-semibold text-gray-900 truncate;
}

.cdd-title--large {
  @apply text-xl;
}

.cdd-title--medium {
  @apply text-lg;
}

.cdd-title--small {
  @apply text-base;
}

.cdd-subtitle {
  @apply text-sm text-gray-600 mt-1;
}

/* Status */
.cdd-status {
  @apply flex items-center gap-2 text-sm;
}

.cdd-status--neutral {
  @apply text-gray-600;
}

.cdd-status--success {
  @apply text-green-600;
}

.cdd-status--warning {
  @apply text-orange-600;
}

.cdd-status--error {
  @apply text-red-600;
}

.cdd-status--info {
  @apply text-blue-600;
}

.cdd-status-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.cdd-status-badge--neutral {
  @apply bg-gray-100 text-gray-800;
}

.cdd-status-badge--success {
  @apply bg-green-100 text-green-800;
}

.cdd-status-badge--warning {
  @apply bg-orange-100 text-orange-800;
}

.cdd-status-badge--error {
  @apply bg-red-100 text-red-800;
}

.cdd-status-badge--info {
  @apply bg-blue-100 text-blue-800;
}

.cdd-status--pulse .cdd-status-badge {
  @apply animate-pulse;
}

/* Collapsed Info */
.cdd-collapsed-info {
  @apply flex items-center gap-3 text-sm text-gray-600;
}

.cdd-collapsed-duration {
  @apply font-mono font-medium;
}

.cdd-collapsed-actions {
  @apply flex gap-2;
}

/* Actions */
.cdd-actions {
  @apply flex items-center gap-2;
}

.cdd-action-button {
  @apply px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.cdd-action-button--primary {
  @apply bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500;
}

.cdd-action-button--secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
}

.cdd-action-button--danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}

.cdd-action-button--info {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.cdd-action-button--disabled {
  @apply opacity-50 cursor-not-allowed;
}

.cdd-button-spinner {
  @apply inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2;
}

/* Collapse Button */
.cdd-collapse-button {
  @apply p-1 rounded-md hover:bg-white/50 transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-purple-500;
}

.cdd-collapse-icon {
  @apply w-5 h-5 transform transition-transform duration-200;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3e%3c/path%3e%3c/svg%3e");
}

.cdd-collapse-icon--expanded {
  @apply rotate-180;
}

/* Content */
.cdd-content {
  @apply overflow-hidden transition-all duration-300 ease-in-out;
}

.cdd-content--hidden {
  @apply max-h-0 opacity-0;
}

.cdd-content--padding-none {
  @apply p-0;
}

.cdd-content--padding-sm {
  @apply p-3;
}

.cdd-content--padding-md {
  @apply p-4;
}

.cdd-content--padding-lg {
  @apply p-6;
}

.cdd-content--padding-xl {
  @apply p-8;
}

.cdd-content--background-transparent {
  @apply bg-transparent;
}

.cdd-content--background-neutral {
  @apply bg-white;
}

.cdd-content--background-accent {
  @apply bg-gradient-to-br from-purple-50 to-indigo-50;
}

.cdd-content--scrollable {
  @apply overflow-y-auto;
  max-height: var(--cdd-max-height, 400px);
}

/* Loading State */
.cdd-loading {
  @apply flex flex-col items-center justify-center py-8 text-gray-500;
}

.cdd-loading-spinner {
  @apply w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3;
}

.cdd-loading-text {
  @apply text-sm;
}

/* Error State */
.cdd-error {
  @apply flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md;
}

.cdd-error-icon {
  @apply w-5 h-5 text-red-500 mt-0.5 flex-shrink-0;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'%3e%3c/path%3e%3c/svg%3e");
}

.cdd-error-content {
  @apply flex-1 min-w-0;
}

.cdd-error-title {
  @apply text-sm font-medium text-red-800 mb-1;
}

.cdd-error-message {
  @apply text-sm text-red-700 mb-3;
}

.cdd-error-retry {
  @apply px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700;
  @apply transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500;
}

/* Default Content */
.cdd-default-content {
  @apply text-center py-8 text-gray-500;
}

/* Footer */
.cdd-footer {
  @apply border-t border-gray-200 p-4 bg-gray-50;
}

/* Responsive Design */
@media (max-width: 768px) {
  .cdd-title-bar {
    @apply flex-col items-start gap-3;
  }

  .cdd-actions {
    @apply w-full justify-end;
  }

  .cdd-collapsed-info {
    @apply flex-col items-start gap-2;
  }
}
</style>
