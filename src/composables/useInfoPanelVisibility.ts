import { computed } from 'vue';
import { useVisibilityStore } from '../stores/visibilityStore';

/**
 * Composable for managing info panel visibility
 * Provides centralized logic for both global and section-specific toggles
 */
export function useInfoPanelVisibility() {
  const visibilityStore = useVisibilityStore();

  console.log('[info-panel-visibility][initialization] Composable initialized', {
    globalMode: visibilityStore.globalToggleMode,
  });

  // Computed properties for reactive access
  const isGlobalToggleEnabled = computed(() => visibilityStore.globalToggleMode);

  return {
    // Global visibility methods
    toggleGlobalVisibility: () => {
      console.log('[info-panel-visibility][global-action] Toggling global visibility');
      visibilityStore.toggleGlobalVisibility();
    },

    setGlobalVisibility: (visible: boolean) => {
      console.log('[info-panel-visibility][global-action] Setting global visibility', { visible });
      visibilityStore.setGlobalVisibility(visible);
    },

    // Section-specific visibility methods
    toggleSectionVisibility: (section: string, subsection: string) => {
      console.log('[info-panel-visibility][section-action] Toggling section visibility', {
        section,
        subsection,
      });
      visibilityStore.toggleSectionVisibility(section, subsection);
    },

    setSectionVisibility: (section: string, subsection: string, visible: boolean) => {
      console.log('[info-panel-visibility][section-action] Setting section visibility', {
        section,
        subsection,
        visible,
      });
      visibilityStore.setSectionVisibility(section, subsection, visible);
    },

    // Getters
    isVisible: (section: string, subsection: string) => {
      return visibilityStore.isVisible(section, subsection);
    },

    getToggleButtonText: (section: string, subsection: string) => {
      return visibilityStore.getToggleButtonText(section, subsection);
    },

    isToggleEnabled: () => {
      return visibilityStore.isToggleEnabled();
    },

    getGlobalToggleText: () => {
      return visibilityStore.getGlobalToggleText;
    },

    // Tooltip methods for accessibility
    getGlobalTooltip: () => {
      return visibilityStore.globalToggleMode ? 'Hide all info panels' : 'Show all info panels';
    },

    getSectionTooltip: (section: string, subsection: string) => {
      const isVisible = visibilityStore.isVisible(section, subsection);
      return isVisible ? `Hide ${subsection} section` : `Show ${subsection} section`;
    },

    // Reactive computed properties
    isGlobalToggleEnabled,

    // Store reference for reactive access
    store: visibilityStore,
  };
}
