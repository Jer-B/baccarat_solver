import { defineStore } from 'pinia';

interface VisibilityState {
  globalToggleMode: boolean; // When true, shows sections by default; when false, hides by default
  visibility: {
    shoeComposition: {
      cutCardInfo: boolean | null; // null means use global default
    };
    payoutSettings: {
      payoutExamples: boolean | null;
      presetInfo: boolean | null;
    };
    pairAnalysis: {
      legendInfo: boolean | null;
    };
    bettingInterface: {
      payoutInfo: boolean | null;
    };
    burnAnalysis: {
      professionalNotes: boolean | null;
    };
    professionalRecommendations: {
      professionalNotes: boolean | null;
    };
    professionalBurnAnalysis: {
      professionalNotes: boolean | null;
    };
    burnCardEstimator: {
      professionalTips: boolean | null;
      burnIntelligence: boolean | null;
    };
    dealerTellAnalysis: {
      professionalTips: boolean | null;
    };
    sessionControl: {
      burnInfo: boolean | null;
    };
  };
}

export const useVisibilityStore = defineStore('visibility', {
  state: (): VisibilityState => ({
    globalToggleMode: true, // Default to showing all sections
    visibility: {
      shoeComposition: {
        cutCardInfo: null, // Use global default
      },
      payoutSettings: {
        payoutExamples: null, // Use global default
        presetInfo: null, // Use global default
      },
      pairAnalysis: {
        legendInfo: null, // Use global default
      },
      bettingInterface: {
        payoutInfo: null, // Use global default
      },
      burnAnalysis: {
        professionalNotes: false, // Explicit override - always hidden by default
      },
      professionalRecommendations: {
        professionalNotes: null, // Use global default
      },
      professionalBurnAnalysis: {
        professionalNotes: null, // Use global default
      },
      burnCardEstimator: {
        professionalTips: null, // Use global default
        burnIntelligence: null, // Use global default
      },
      dealerTellAnalysis: {
        professionalTips: null, // Use global default
      },
      sessionControl: {
        burnInfo: null, // Use global default
      },
    },
  }),

  getters: {
    // Check if content should be visible - individual sections can override global mode
    isVisible: state => (section: string, subsection: string) => {
      const sectionVisibility = (
        state.visibility as Record<string, Record<string, boolean | null>>
      )[section];
      if (!sectionVisibility) {
        return false;
      }

      const individualState = sectionVisibility[subsection];

      // If individual state is explicitly set (not null), use it
      if (individualState !== null) {
        return individualState;
      }

      // Otherwise, use global default
      return state.globalToggleMode;
    },

    // Get appropriate button text based on actual section state
    getToggleButtonText: state => (section: string, subsection: string) => {
      const sectionVisibility = (
        state.visibility as Record<string, Record<string, boolean | null>>
      )[section];
      if (!sectionVisibility) {
        return '👁️‍🗨️ Show';
      }

      const individualState = sectionVisibility[subsection];

      // Determine actual visibility state
      const isVisible = individualState !== null ? individualState : state.globalToggleMode;
      return isVisible ? '👁️ Hide' : '👁️‍🗨️ Show';
    },

    // Individual toggles always work
    isToggleEnabled: () => () => {
      return true;
    },

    // Get global toggle button text
    getGlobalToggleText: state => {
      return state.globalToggleMode ? '🙈 Hide All Info Panels' : '👁️ Show All Info Panels';
    },
  },

  actions: {
    toggleGlobalVisibility() {
      console.log('[visibility-management][global-toggle] Toggling global visibility mode', {
        previousMode: this.globalToggleMode,
        newMode: !this.globalToggleMode,
      });

      // Smart reset BEFORE toggling: if an individual override matches the CURRENT global state,
      // reset it to null so it will follow the new global state instead of being "stuck"
      Object.keys(this.visibility).forEach(section => {
        const sectionObj = (this.visibility as Record<string, Record<string, boolean | null>>)[
          section
        ];
        Object.keys(sectionObj).forEach(subsection => {
          const individualState = sectionObj[subsection];

          // If individual override matches CURRENT global state, reset to follow new global
          if (individualState === this.globalToggleMode) {
            console.log(
              '[visibility-management][global-toggle] Resetting section to follow new global default',
              {
                section,
                subsection,
                previousOverride: individualState,
                currentGlobalState: this.globalToggleMode,
                willFollowNewGlobal: !this.globalToggleMode,
              }
            );
            sectionObj[subsection] = null;
          }
        });
      });

      // Now toggle the global state
      this.globalToggleMode = !this.globalToggleMode;
    },

    setGlobalVisibility(visible: boolean) {
      console.log('[visibility-management][global-set] Setting global visibility mode', {
        previousMode: this.globalToggleMode,
        newMode: visible,
      });

      this.globalToggleMode = visible;
    },

    // Toggle individual section visibility - always works
    toggleSectionVisibility(section: string, subsection: string) {
      console.log('[visibility-management][section-toggle] Toggling section visibility', {
        section,
        subsection,
        globalMode: this.globalToggleMode,
      });

      const sectionVisibility = (this.visibility as Record<string, Record<string, boolean | null>>)[
        section
      ];
      if (sectionVisibility) {
        const individualState = sectionVisibility[subsection];
        const currentState = individualState !== null ? individualState : this.globalToggleMode;
        const newState = !currentState;

        // Set explicit individual state (override global)
        sectionVisibility[subsection] = newState;

        console.log('[visibility-management][section-toggle] Section visibility changed', {
          section,
          subsection,
          previousState: currentState,
          newState,
          wasUsingGlobal: individualState === null,
          globalDefault: this.globalToggleMode,
        });
      }
    },

    // Set individual section visibility - always works
    setSectionVisibility(section: string, subsection: string, visible: boolean) {
      console.log('[visibility-management][section-set] Setting section visibility', {
        section,
        subsection,
        visible,
        globalMode: this.globalToggleMode,
      });

      const sectionVisibility = (this.visibility as Record<string, Record<string, boolean | null>>)[
        section
      ];
      if (sectionVisibility) {
        sectionVisibility[subsection] = visible;
      }
    },

    // Reset a section to use global default (remove individual override)
    resetSectionToGlobal(section: string, subsection: string) {
      console.log('[visibility-management][section-reset] Resetting section to global default', {
        section,
        subsection,
        globalMode: this.globalToggleMode,
      });

      const sectionVisibility = (this.visibility as Record<string, Record<string, boolean | null>>)[
        section
      ];
      if (sectionVisibility) {
        sectionVisibility[subsection] = null;
      }
    },

    // Reset all sections to use global default (remove all individual overrides)
    resetAllSectionsToGlobal() {
      console.log(
        '[visibility-management][global-reset] Resetting all sections to global default',
        {
          globalMode: this.globalToggleMode,
        }
      );

      Object.keys(this.visibility).forEach(section => {
        const sectionObj = (this.visibility as Record<string, Record<string, boolean | null>>)[
          section
        ];
        Object.keys(sectionObj).forEach(subsection => {
          sectionObj[subsection] = null;
        });
      });
    },

    // Apply global mode to all sections (set all to explicit values)
    applyGlobalModeToAllSections() {
      console.log('[visibility-management][global-apply] Applying global mode to all sections', {
        globalMode: this.globalToggleMode,
      });

      // Set all sections to explicit values matching global mode
      Object.keys(this.visibility).forEach(section => {
        const sectionObj = (this.visibility as Record<string, Record<string, boolean | null>>)[
          section
        ];
        Object.keys(sectionObj).forEach(subsection => {
          sectionObj[subsection] = this.globalToggleMode;
        });
      });
    },
  },
});
