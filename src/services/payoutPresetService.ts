import { supabase } from '@/lib/supabase';

export interface PayoutPreset {
  id: string;
  name: string;
  player_payout: number;
  banker_payout: number;
  banker_commission: number;
  tie_payout: number;
  player_pair_payout: number;
  banker_pair_payout: number;
  is_default: boolean;
  is_system_preset: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePayoutPresetData {
  name: string;
  player_payout?: number;
  banker_payout?: number;
  banker_commission?: number;
  tie_payout?: number;
  player_pair_payout?: number;
  banker_pair_payout?: number;
}

export interface UpdatePayoutPresetData {
  name?: string;
  player_payout?: number;
  banker_payout?: number;
  banker_commission?: number;
  tie_payout?: number;
  player_pair_payout?: number;
  banker_pair_payout?: number;
  is_default?: boolean;
}

/**
 * Payout Preset Service - Manages custom casino payout configurations
 */
class PayoutPresetService {
  /**
   * Get all payout presets, ordered by system presets first, then by name
   */
  async getAllPresets(): Promise<PayoutPreset[]> {
    console.log('[payout-presets][fetch] Loading all payout presets');

    const { data, error } = await supabase
      .from('payout_presets')
      .select('*')
      .order('is_system_preset', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('[payout-presets][error] Failed to fetch presets', { error });
      throw new Error(`Failed to fetch payout presets: ${error.message}`);
    }

    console.log('[payout-presets][success] Loaded presets', { count: data?.length || 0 });
    return data || [];
  }

  /**
   * Get the current default preset
   */
  async getDefaultPreset(): Promise<PayoutPreset | null> {
    console.log('[payout-presets][fetch] Loading default preset');

    const { data, error } = await supabase
      .from('payout_presets')
      .select('*')
      .eq('is_default', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No default preset found
        console.log('[payout-presets][info] No default preset found');
        return null;
      }
      console.error('[payout-presets][error] Failed to fetch default preset', { error });
      throw new Error(`Failed to fetch default preset: ${error.message}`);
    }

    console.log('[payout-presets][success] Loaded default preset', { name: data.name });
    return data;
  }

  /**
   * Create a new custom payout preset
   */
  async createPreset(data: CreatePayoutPresetData): Promise<PayoutPreset> {
    console.log('[payout-presets][create] Creating new preset', { name: data.name });

    const presetData = {
      name: data.name,
      player_payout: data.player_payout || 1.0,
      banker_payout: data.banker_payout || 1.0,
      banker_commission: data.banker_commission || 0.05,
      tie_payout: data.tie_payout || 8.0,
      player_pair_payout: data.player_pair_payout || 11.0,
      banker_pair_payout: data.banker_pair_payout || 11.0,
      is_default: false, // New presets are never default
      is_system_preset: false, // Custom presets are never system presets
    };

    const { data: preset, error } = await supabase
      .from('payout_presets')
      .insert(presetData)
      .select()
      .single();

    if (error) {
      console.error('[payout-presets][error] Failed to create preset', { error, data: presetData });
      throw new Error(`Failed to create preset: ${error.message}`);
    }

    console.log('[payout-presets][success] Created preset', { id: preset.id, name: preset.name });
    return preset;
  }

  /**
   * Update an existing payout preset
   */
  async updatePreset(id: string, data: UpdatePayoutPresetData): Promise<PayoutPreset> {
    console.log('[payout-presets][update] Updating preset', { id, updates: Object.keys(data) });

    const { data: preset, error } = await supabase
      .from('payout_presets')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[payout-presets][error] Failed to update preset', { error, id, data });
      throw new Error(`Failed to update preset: ${error.message}`);
    }

    console.log('[payout-presets][success] Updated preset', { id: preset.id, name: preset.name });
    return preset;
  }

  /**
   * Delete a custom payout preset (system presets cannot be deleted)
   */
  async deletePreset(id: string): Promise<void> {
    console.log('[payout-presets][delete] Deleting preset', { id });

    // First check if it's a system preset
    const { data: preset, error: fetchError } = await supabase
      .from('payout_presets')
      .select('name, is_system_preset')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('[payout-presets][error] Failed to fetch preset for deletion', {
        fetchError,
        id,
      });
      throw new Error(`Failed to fetch preset: ${fetchError.message}`);
    }

    if (preset.is_system_preset) {
      console.error('[payout-presets][error] Cannot delete system preset', {
        id,
        name: preset.name,
      });
      throw new Error('Cannot delete system presets');
    }

    const { error } = await supabase.from('payout_presets').delete().eq('id', id);

    if (error) {
      console.error('[payout-presets][error] Failed to delete preset', { error, id });
      throw new Error(`Failed to delete preset: ${error.message}`);
    }

    console.log('[payout-presets][success] Deleted preset', { id, name: preset.name });
  }

  /**
   * Set a preset as the default (unsets all others)
   */
  async setDefaultPreset(id: string): Promise<PayoutPreset> {
    console.log('[payout-presets][default] Setting preset as default', { id });

    const { data: preset, error } = await supabase
      .from('payout_presets')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[payout-presets][error] Failed to set default preset', { error, id });
      throw new Error(`Failed to set default preset: ${error.message}`);
    }

    console.log('[payout-presets][success] Set default preset', {
      id: preset.id,
      name: preset.name,
    });
    return preset;
  }

  /**
   * Get preset by ID
   */
  async getPresetById(id: string): Promise<PayoutPreset | null> {
    console.log('[payout-presets][fetch] Loading preset by ID', { id });

    const { data, error } = await supabase.from('payout_presets').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[payout-presets][info] Preset not found', { id });
        return null;
      }
      console.error('[payout-presets][error] Failed to fetch preset', { error, id });
      throw new Error(`Failed to fetch preset: ${error.message}`);
    }

    console.log('[payout-presets][success] Loaded preset', { id: data.id, name: data.name });
    return data;
  }
}

export const payoutPresetService = new PayoutPresetService();
