// =============================================================================
// USE PAYOUT SETTINGS COMPOSABLE
// =============================================================================
// Manages live PayoutSettings integration for real-time payout calculations
// Replaces hardcoded store.settings.payouts with dynamic payout preset system

import { ref, computed, watch, onMounted, readonly } from 'vue';
import { payoutPresetService, type PayoutPreset } from '@/services/payoutPresetService';
import type { PayoutValues } from '@/config/payoutSettings';
import { useToast } from 'vue-toastification';
import { useBaccaratStore } from '@/stores/baccaratStore';

/**
 * Live PayoutSettings management composable
 * Provides real-time payout values that replace hardcoded store.settings.payouts
 */
export function usePayoutSettings() {
  // =============================================================================
  // REACTIVE STATE
  // =============================================================================

  const toast = useToast();
  const store = useBaccaratStore();

  // Current live payout values
  const currentPayoutValues = ref<PayoutValues>({
    player_payout: 1.0,
    banker_payout: 1.0,
    banker_commission: 0.05,
    tie_payout: 8.0,
    player_pair_payout: 11.0,
    banker_pair_payout: 11.0,
  });

  // Available presets
  const availablePresets = ref<PayoutPreset[]>([]);
  const currentPreset = ref<PayoutPreset | null>(null);

  // Loading states
  const isLoading = ref(false);
  const isUpdatingPreset = ref(false);

  // Error handling
  const lastError = ref<string | null>(null);

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  // Live payout reference for UI display
  const payoutReference = computed(() => ({
    player: `${currentPayoutValues.value.player_payout}:1`,
    banker: `${currentPayoutValues.value.banker_payout}:1`,
    bankerCommission: `${(currentPayoutValues.value.banker_commission * 100).toFixed(1)}%`,
    tie: `${currentPayoutValues.value.tie_payout}:1`,
    playerPair: `${currentPayoutValues.value.player_pair_payout}:1`,
    bankerPair: `${currentPayoutValues.value.banker_pair_payout}:1`,
  }));

  // Check if current values match any preset
  const matchingPreset = computed(() => {
    return (
      availablePresets.value.find(
        preset =>
          preset.player_payout === currentPayoutValues.value.player_payout &&
          preset.banker_payout === currentPayoutValues.value.banker_payout &&
          preset.banker_commission === currentPayoutValues.value.banker_commission &&
          preset.tie_payout === currentPayoutValues.value.tie_payout &&
          preset.player_pair_payout === currentPayoutValues.value.player_pair_payout &&
          preset.banker_pair_payout === currentPayoutValues.value.banker_pair_payout
      ) || null
    );
  });

  // Current configuration status
  const configurationStatus = computed(() => {
    if (matchingPreset.value) {
      return {
        type: 'preset' as const,
        name: matchingPreset.value.name,
        isDefault: matchingPreset.value.is_default,
        isSystem: matchingPreset.value.is_system_preset,
      };
    }
    return {
      type: 'manual' as const,
      name: 'Manual Configuration',
      isDefault: false,
      isSystem: false,
    };
  });

  // =============================================================================
  // ACTIONS
  // =============================================================================

  /**
   * Load all available presets from database
   */
  const loadPresets = async (): Promise<void> => {
    console.log('[use-payout-settings][action] Loading available presets');
    isLoading.value = true;
    lastError.value = null;

    try {
      availablePresets.value = await payoutPresetService.getAllPresets();
      console.log('[use-payout-settings][success] Loaded presets', {
        count: availablePresets.value.length,
      });
    } catch (error) {
      const errorMessage = `Failed to load payout presets: ${(error as Error).message}`;
      console.error('[use-payout-settings][error] Failed to load presets', { error });
      lastError.value = errorMessage;
      toast.error(errorMessage, { timeout: 5000 });
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Load and apply the default preset
   */
  const loadDefaultPreset = async (): Promise<void> => {
    console.log('[use-payout-settings][action] Loading default preset');
    isLoading.value = true;
    lastError.value = null;

    try {
      const defaultPreset = await payoutPresetService.getDefaultPreset();

      if (defaultPreset) {
        await applyPreset(defaultPreset.id);
        console.log('[use-payout-settings][success] Applied default preset', {
          name: defaultPreset.name,
        });
      } else {
        // No default preset, use hardcoded store values as fallback
        console.log('[use-payout-settings][fallback] No default preset, using store values');
        currentPayoutValues.value = {
          player_payout: store.settings.payouts.player,
          banker_payout: store.settings.payouts.banker,
          banker_commission: store.settings.payouts.bankerCommission,
          tie_payout: store.settings.payouts.tie,
          player_pair_payout: store.settings.payouts.playerPair,
          banker_pair_payout: store.settings.payouts.bankerPair,
        };
      }
    } catch (error) {
      const errorMessage = `Failed to load default preset: ${(error as Error).message}`;
      console.error('[use-payout-settings][error] Failed to load default preset', { error });
      lastError.value = errorMessage;

      // Fallback to store values
      currentPayoutValues.value = {
        player_payout: store.settings.payouts.player,
        banker_payout: store.settings.payouts.banker,
        banker_commission: store.settings.payouts.bankerCommission,
        tie_payout: store.settings.payouts.tie,
        player_pair_payout: store.settings.payouts.playerPair,
        banker_pair_payout: store.settings.payouts.bankerPair,
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Apply a specific preset by ID
   */
  const applyPreset = async (presetId: string): Promise<void> => {
    console.log('[use-payout-settings][action] Applying preset', { presetId });
    isUpdatingPreset.value = true;
    lastError.value = null;

    try {
      const preset = await payoutPresetService.getPresetById(presetId);

      if (!preset) {
        throw new Error('Preset not found');
      }

      // Update current values
      currentPayoutValues.value = {
        player_payout: preset.player_payout,
        banker_payout: preset.banker_payout,
        banker_commission: preset.banker_commission,
        tie_payout: preset.tie_payout,
        player_pair_payout: preset.player_pair_payout,
        banker_pair_payout: preset.banker_pair_payout,
      };

      currentPreset.value = preset;

      console.log('[use-payout-settings][success] Applied preset', {
        name: preset.name,
        values: currentPayoutValues.value,
      });

      // Toast removed per user request - no "Applied payout preset" toast needed
    } catch (error) {
      const errorMessage = `Failed to apply preset: ${(error as Error).message}`;
      console.error('[use-payout-settings][error] Failed to apply preset', { error, presetId });
      lastError.value = errorMessage;
      toast.error(errorMessage, { timeout: 5000 });
    } finally {
      isUpdatingPreset.value = false;
    }
  };

  /**
   * Update payout values manually (switches to manual mode)
   */
  const updatePayoutValues = (
    newValues: Partial<PayoutValues>,
    preservePreset: boolean = false
  ): void => {
    console.log('[use-payout-settings][action] Updating payout values', {
      newValues,
      preservePreset,
      currentPreset: currentPreset.value?.name || 'none',
    });

    currentPayoutValues.value = {
      ...currentPayoutValues.value,
      ...newValues,
    };

    // Only clear current preset if not preserving preset selection
    if (!preservePreset) {
      currentPreset.value = null;
      console.log('[use-payout-settings][success] Updated to manual configuration', {
        values: currentPayoutValues.value,
      });
    } else {
      console.log('[use-payout-settings][success] Updated values while preserving preset context', {
        values: currentPayoutValues.value,
        presetName: currentPreset.value?.name || 'none',
      });
    }
  };

  /**
   * Update payout values while preserving current preset selection
   * This allows users to modify presets without switching to manual mode
   */
  const updatePayoutValuesPreservePreset = (newValues: Partial<PayoutValues>): void => {
    updatePayoutValues(newValues, true);
  };

  /**
   * Set a preset as default
   */
  const setAsDefault = async (presetId: string): Promise<void> => {
    console.log('[use-payout-settings][action] Setting preset as default', { presetId });
    isUpdatingPreset.value = true;
    lastError.value = null;

    try {
      await payoutPresetService.setDefaultPreset(presetId);
      await loadPresets(); // Reload to update default status

      console.log('[use-payout-settings][success] Set preset as default', { presetId });
      toast.success('Preset set as default', { timeout: 3000 });
    } catch (error) {
      const errorMessage = `Failed to set default preset: ${(error as Error).message}`;
      console.error('[use-payout-settings][error] Failed to set default preset', {
        error,
        presetId,
      });
      lastError.value = errorMessage;
      toast.error(errorMessage, { timeout: 5000 });
    } finally {
      isUpdatingPreset.value = false;
    }
  };

  /**
   * Calculate potential payout for a given bet
   */
  const calculatePotentialPayout = (
    betType: 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair',
    betAmount: number
  ): number => {
    switch (betType) {
      case 'player':
        return betAmount * (currentPayoutValues.value.player_payout + 1);
      case 'banker':
        const bankerWinnings = betAmount * currentPayoutValues.value.banker_payout;
        const commission = bankerWinnings * currentPayoutValues.value.banker_commission;
        return betAmount + bankerWinnings - commission;
      case 'tie':
        return betAmount * (currentPayoutValues.value.tie_payout + 1);
      case 'playerPair':
        return betAmount * (currentPayoutValues.value.player_pair_payout + 1);
      case 'bankerPair':
        return betAmount * (currentPayoutValues.value.banker_pair_payout + 1);
      default:
        return 0;
    }
  };

  // =============================================================================
  // WATCHERS FOR REAL-TIME INTEGRATION
  // =============================================================================

  // Watch for payout value changes and emit events
  watch(
    currentPayoutValues,
    (newValues, oldValues) => {
      console.log('[use-payout-settings][watch] Payout values changed', {
        oldValues,
        newValues,
        configStatus: configurationStatus.value,
      });

      // Sync with store for backward compatibility
      store.updateSettings({
        payouts: {
          player: newValues.player_payout,
          banker: newValues.banker_payout,
          bankerCommission: newValues.banker_commission,
          tie: newValues.tie_payout,
          playerPair: newValues.player_pair_payout,
          bankerPair: newValues.banker_pair_payout,
        },
      });
    },
    { deep: true }
  );

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  onMounted(async () => {
    console.log('[use-payout-settings][lifecycle] Initializing PayoutSettings');

    // Load available presets and apply default
    await Promise.all([loadPresets(), loadDefaultPreset()]);

    console.log('[use-payout-settings][lifecycle] PayoutSettings initialized', {
      currentValues: currentPayoutValues.value,
      currentPreset: currentPreset.value?.name || 'Manual',
      availablePresets: availablePresets.value.length,
    });
  });

  // =============================================================================
  // RETURN COMPOSABLE API
  // =============================================================================

  return {
    // Reactive state
    currentPayoutValues: readonly(currentPayoutValues),
    availablePresets: readonly(availablePresets),
    currentPreset: readonly(currentPreset),
    payoutReference: readonly(payoutReference),
    configurationStatus: readonly(configurationStatus),
    matchingPreset: readonly(matchingPreset),

    // Loading states
    isLoading: readonly(isLoading),
    isUpdatingPreset: readonly(isUpdatingPreset),
    lastError: readonly(lastError),

    // Actions
    loadPresets,
    loadDefaultPreset,
    applyPreset,
    updatePayoutValues,
    updatePayoutValuesPreservePreset,
    setAsDefault,
    calculatePotentialPayout,
  };
}
