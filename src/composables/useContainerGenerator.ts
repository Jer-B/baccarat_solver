/**
 * 🏗️ useContainerGenerator Composable - Over Excellence Level
 *
 * Vue composable for dynamic container generation with reactive configuration.
 * Provides container creation, management, and event handling.
 *
 * @fileoverview Container generator composable with TypeScript excellence
 * @version 1.0.0
 * @author CDD Architecture Team
 */

import { ref, computed, watch, onBeforeUnmount, type Ref } from 'vue';
import {
  type ContainerConfig,
  type ContainerId,
  type MultiContainerConfig,
  type ActionButtonConfig,
  type ContainerConfigUpdate,
  type TitleBarUpdate,
  type LayoutUpdate,
  type ThemeUpdate,
  type MutableContainerConfig,
  ContainerType,
  TitleFeature,
  createContainerId,
  createBasicContainerConfig,
  createSessionControlConfig,
} from '../types/core/containerGeneratorTypes';

// ==================== INTERFACES ====================

interface UseContainerGeneratorOptions {
  readonly debug?: boolean;
  readonly autoCleanup?: boolean;
  readonly maxContainers?: number;
  readonly enableValidation?: boolean;
}

interface ContainerState {
  readonly config: ContainerConfig;
  readonly isExpanded: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastUpdated: Date;
}

interface UseContainerGeneratorReturn {
  // State management
  readonly containers: Ref<Map<ContainerId, ContainerState>>;
  readonly activeContainerId: Ref<ContainerId | null>;
  readonly totalContainers: Ref<number>;
  readonly hasContainers: Ref<boolean>;

  // Container operations
  readonly createContainer: (config: ContainerConfig) => ContainerId;
  readonly updateContainer: (id: ContainerId, updates: ContainerConfigUpdate) => boolean;
  readonly removeContainer: (id: ContainerId) => boolean;
  readonly getContainer: (id: ContainerId) => ContainerState | undefined;
  readonly clearAllContainers: () => void;

  // State management
  readonly toggleExpansion: (id: ContainerId) => boolean;
  readonly setExpansion: (id: ContainerId, expanded: boolean) => boolean;
  readonly setLoading: (id: ContainerId, loading: boolean) => boolean;
  readonly setError: (id: ContainerId, error: string | null) => boolean;

  // Configuration helpers
  readonly updateTitleBarConfig: (id: ContainerId, updates: TitleBarUpdate) => boolean;
  readonly updateLayoutConfig: (id: ContainerId, updates: LayoutUpdate) => boolean;
  readonly updateThemeConfig: (id: ContainerId, updates: ThemeUpdate) => boolean;

  // Action handling
  readonly updateActionButton: (
    id: ContainerId,
    actionId: string,
    updates: Partial<ActionButtonConfig>
  ) => boolean;
  readonly triggerAction: (id: ContainerId, actionId: string) => Promise<void>;

  // Preset creators
  readonly createSessionControl: () => ContainerId;
  readonly createSimplePanel: (title: string) => ContainerId;
  readonly createCollapsiblePanel: (title: string, initialExpanded?: boolean) => ContainerId;
  readonly createActionPanel: (title: string, actions: ActionButtonConfig[]) => ContainerId;

  // Multi-container support
  readonly createMultiContainer: (config: MultiContainerConfig) => ContainerId[];
  readonly getContainersByType: (type: ContainerType) => ContainerState[];

  // Utilities
  readonly exportConfiguration: () => Record<string, ContainerConfig>;
  readonly importConfiguration: (configs: Record<string, ContainerConfig>) => void;
  readonly validateConfiguration: (config: ContainerConfig) => { valid: boolean; errors: string[] };

  // Cleanup
  readonly cleanup: () => void;
}

// ==================== COMPOSABLE IMPLEMENTATION ====================

export const useContainerGenerator = (
  options: UseContainerGeneratorOptions = {}
): UseContainerGeneratorReturn => {
  const {
    debug = false,
    autoCleanup = true,
    maxContainers = 50,
    enableValidation = true,
  } = options;

  // ==================== REACTIVE STATE ====================

  const containers = ref<Map<ContainerId, ContainerState>>(new Map());
  const activeContainerId = ref<ContainerId | null>(null);

  // ==================== COMPUTED PROPERTIES ====================

  const totalContainers = computed(() => containers.value.size);
  const hasContainers = computed(() => containers.value.size > 0);

  // ==================== VALIDATION ====================

  const validateConfiguration = (config: ContainerConfig): { valid: boolean; errors: string[] } => {
    if (!enableValidation) return { valid: true, errors: [] };

    const errors: string[] = [];

    // Basic validation
    if (!config.id) errors.push('Container ID is required');
    if (!config.type) errors.push('Container type is required');
    if (!config.titleBar.title.trim()) errors.push('Title is required');

    // Layout validation
    if (config.layout.customDimensions) {
      const { customDimensions } = config.layout;
      if (customDimensions.width && !isValidCSSValue(customDimensions.width)) {
        errors.push('Invalid width value');
      }
      if (customDimensions.height && !isValidCSSValue(customDimensions.height)) {
        errors.push('Invalid height value');
      }
    }

    // Action button validation
    if (config.titleBar.actions) {
      config.titleBar.actions.forEach((action, index) => {
        if (!action.id) errors.push(`Action ${index}: ID is required`);
        if (!action.label.trim()) errors.push(`Action ${index}: Label is required`);
        if (typeof action.onClick !== 'function')
          errors.push(`Action ${index}: onClick must be a function`);
      });
    }

    return { valid: errors.length === 0, errors };
  };

  const isValidCSSValue = (value: string): boolean => {
    const cssValueRegex = /^(\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax)|auto|inherit|initial)$/;
    return cssValueRegex.test(value);
  };

  // ==================== CONTAINER OPERATIONS ====================

  const createContainer = (config: ContainerConfig): ContainerId => {
    if (debug) console.log('[container-generator][create] Creating container:', config.id);

    // Validate configuration
    const validation = validateConfiguration(config);
    if (!validation.valid) {
      const errorMsg = `Configuration validation failed: ${validation.errors.join(', ')}`;
      console.error('[container-generator][error]', errorMsg);
      throw new Error(errorMsg);
    }

    // Check container limit
    if (containers.value.size >= maxContainers) {
      const errorMsg = `Maximum containers limit (${maxContainers}) exceeded`;
      console.error('[container-generator][error]', errorMsg);
      throw new Error(errorMsg);
    }

    // Check for duplicate ID
    if (containers.value.has(config.id)) {
      const errorMsg = `Container with ID ${config.id} already exists`;
      console.error('[container-generator][error]', errorMsg);
      throw new Error(errorMsg);
    }

    // Create container state
    const containerState: ContainerState = {
      config,
      isExpanded: config.titleBar.initialExpanded ?? true,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
    };

    containers.value.set(config.id, containerState);

    if (!activeContainerId.value) {
      activeContainerId.value = config.id;
    }

    if (debug) console.log('[container-generator][success] Container created:', config.id);
    return config.id;
  };

  const updateContainer = (id: ContainerId, updates: ContainerConfigUpdate): boolean => {
    if (debug) console.log('[container-generator][update] Updating container:', id);

    const container = containers.value.get(id);
    if (!container) {
      console.warn('[container-generator][warning] Container not found:', id);
      return false;
    }

    try {
      // Deep merge configuration with proper handling of partial nested objects
      const updatedConfig: ContainerConfig = {
        ...container.config,
        ...updates,
        // Only merge nested objects if they exist in updates
        ...(updates.titleBar && {
          titleBar: { ...container.config.titleBar, ...updates.titleBar },
        }),
        ...(updates.layout && {
          layout: { ...container.config.layout, ...updates.layout },
        }),
        ...(updates.content && {
          content: { ...container.config.content, ...updates.content },
        }),
        ...(updates.theme && {
          theme: { ...container.config.theme, ...updates.theme },
        }),
        ...(updates.interaction && {
          interaction: { ...container.config.interaction, ...updates.interaction },
        }),
      };

      // Validate updated configuration
      const validation = validateConfiguration(updatedConfig);
      if (!validation.valid) {
        console.error('[container-generator][error] Update validation failed:', validation.errors);
        return false;
      }

      // Update container state
      const updatedState: ContainerState = {
        ...container,
        config: updatedConfig,
        lastUpdated: new Date(),
      };

      containers.value.set(id, updatedState);

      if (debug) console.log('[container-generator][success] Container updated:', id);
      return true;
    } catch (error) {
      console.error('[container-generator][error] Update failed:', error);
      return false;
    }
  };

  const removeContainer = (id: ContainerId): boolean => {
    if (debug) console.log('[container-generator][remove] Removing container:', id);

    const removed = containers.value.delete(id);

    if (removed && activeContainerId.value === id) {
      const remainingIds = Array.from(containers.value.keys());
      activeContainerId.value = remainingIds.length > 0 ? remainingIds[0] : null;
    }

    if (debug && removed) console.log('[container-generator][success] Container removed:', id);
    return removed;
  };

  const getContainer = (id: ContainerId): ContainerState | undefined => {
    return containers.value.get(id);
  };

  const clearAllContainers = (): void => {
    if (debug) console.log('[container-generator][clear] Clearing all containers');
    containers.value.clear();
    activeContainerId.value = null;
  };

  // ==================== STATE MANAGEMENT ====================

  const toggleExpansion = (id: ContainerId): boolean => {
    const container = containers.value.get(id);
    if (!container) return false;

    const updatedState: ContainerState = {
      ...container,
      isExpanded: !container.isExpanded,
      lastUpdated: new Date(),
    };

    containers.value.set(id, updatedState);
    return true;
  };

  const setExpansion = (id: ContainerId, expanded: boolean): boolean => {
    const container = containers.value.get(id);
    if (!container) return false;

    const updatedState: ContainerState = {
      ...container,
      isExpanded: expanded,
      lastUpdated: new Date(),
    };

    containers.value.set(id, updatedState);
    return true;
  };

  const setLoading = (id: ContainerId, loading: boolean): boolean => {
    const container = containers.value.get(id);
    if (!container) return false;

    const updatedState: ContainerState = {
      ...container,
      isLoading: loading,
      lastUpdated: new Date(),
    };

    containers.value.set(id, updatedState);
    return true;
  };

  const setError = (id: ContainerId, error: string | null): boolean => {
    const container = containers.value.get(id);
    if (!container) return false;

    const updatedState: ContainerState = {
      ...container,
      error,
      lastUpdated: new Date(),
    };

    containers.value.set(id, updatedState);
    return true;
  };

  // ==================== CONFIGURATION HELPERS ====================

  const updateTitleBarConfig = (id: ContainerId, updates: TitleBarUpdate): boolean => {
    return updateContainer(id, { titleBar: updates as any });
  };

  const updateLayoutConfig = (id: ContainerId, updates: LayoutUpdate): boolean => {
    return updateContainer(id, { layout: updates as any });
  };

  const updateThemeConfig = (id: ContainerId, updates: ThemeUpdate): boolean => {
    return updateContainer(id, { theme: updates as any });
  };

  // ==================== ACTION HANDLING ====================

  const updateActionButton = (
    id: ContainerId,
    actionId: string,
    updates: Partial<ActionButtonConfig>
  ): boolean => {
    const container = containers.value.get(id);
    if (!container || !container.config.titleBar.actions) return false;

    const updatedActions = container.config.titleBar.actions.map(action =>
      action.id === actionId ? { ...action, ...updates } : action
    );

    return updateTitleBarConfig(id, { actions: updatedActions });
  };

  const triggerAction = async (id: ContainerId, actionId: string): Promise<void> => {
    const container = containers.value.get(id);
    if (!container || !container.config.titleBar.actions) {
      throw new Error(`Container ${id} or action ${actionId} not found`);
    }

    const action = container.config.titleBar.actions.find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found in container ${id}`);
    }

    try {
      setLoading(id, true);
      setError(id, null);

      await action.onClick();

      if (debug) console.log('[container-generator][action] Action triggered:', { id, actionId });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(id, errorMsg);
      console.error('[container-generator][error] Action failed:', { id, actionId, error });
      throw error;
    } finally {
      setLoading(id, false);
    }
  };

  // ==================== PRESET CREATORS ====================

  const createSessionControl = (): ContainerId => {
    const config = createSessionControlConfig();
    return createContainer(config);
  };

  const createSimplePanel = (title: string): ContainerId => {
    const config = createBasicContainerConfig(title, ContainerType.BASIC_HEADER);
    return createContainer(config);
  };

  const createCollapsiblePanel = (title: string, initialExpanded: boolean = true): ContainerId => {
    const baseConfig = createBasicContainerConfig(title, ContainerType.COLLAPSIBLE);

    // Create updated config with proper TypeScript typing
    const config: ContainerConfig = {
      ...baseConfig,
      titleBar: {
        ...baseConfig.titleBar,
        feature: TitleFeature.WITH_COLLAPSE,
        collapsible: true,
        initialExpanded,
      },
    };

    return createContainer(config);
  };

  const createActionPanel = (title: string, actions: ActionButtonConfig[]): ContainerId => {
    const baseConfig = createBasicContainerConfig(title, ContainerType.ACTION_PANEL);

    // Create updated config with proper TypeScript typing
    const config: ContainerConfig = {
      ...baseConfig,
      titleBar: {
        ...baseConfig.titleBar,
        feature: TitleFeature.WITH_ACTIONS,
        actions,
      },
    };

    return createContainer(config);
  };

  // ==================== MULTI-CONTAINER SUPPORT ====================

  const createMultiContainer = (config: MultiContainerConfig): ContainerId[] => {
    const containerIds: ContainerId[] = [];

    config.containers.forEach(containerConfig => {
      try {
        const id = createContainer(containerConfig);
        containerIds.push(id);
      } catch (error) {
        console.error(
          '[container-generator][error] Failed to create container in multi-container:',
          error
        );
      }
    });

    return containerIds;
  };

  const getContainersByType = (type: ContainerType): ContainerState[] => {
    return Array.from(containers.value.values()).filter(
      container => container.config.type === type
    );
  };

  // ==================== UTILITIES ====================

  const exportConfiguration = (): Record<string, ContainerConfig> => {
    const configs: Record<string, ContainerConfig> = {};
    containers.value.forEach((state, id) => {
      configs[id] = state.config;
    });
    return configs;
  };

  const importConfiguration = (configs: Record<string, ContainerConfig>): void => {
    clearAllContainers();

    Object.values(configs).forEach(config => {
      try {
        createContainer(config);
      } catch (error) {
        console.error('[container-generator][error] Failed to import container:', error);
      }
    });
  };

  // ==================== CLEANUP ====================

  const cleanup = (): void => {
    if (debug) console.log('[container-generator][cleanup] Performing cleanup');
    clearAllContainers();
  };

  // Auto cleanup on unmount
  if (autoCleanup) {
    onBeforeUnmount(() => {
      cleanup();
    });
  }

  // ==================== RETURN API ====================

  return {
    // State management
    containers,
    activeContainerId,
    totalContainers,
    hasContainers,

    // Container operations
    createContainer,
    updateContainer,
    removeContainer,
    getContainer,
    clearAllContainers,

    // State management
    toggleExpansion,
    setExpansion,
    setLoading,
    setError,

    // Configuration helpers
    updateTitleBarConfig,
    updateLayoutConfig,
    updateThemeConfig,

    // Action handling
    updateActionButton,
    triggerAction,

    // Preset creators
    createSessionControl,
    createSimplePanel,
    createCollapsiblePanel,
    createActionPanel,

    // Multi-container support
    createMultiContainer,
    getContainersByType,

    // Utilities
    exportConfiguration,
    importConfiguration,
    validateConfiguration,

    // Cleanup
    cleanup,
  };
};
