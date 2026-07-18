import { supabase } from '../../supabase';
import type { VaultRow, VaultInsert, VaultUpdate } from '../types';

export class VaultRepository {
  /**
   * Fetch all active vaults for a given user.
   */
  async getVaults(userId: string): Promise<VaultRow[]> {
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as VaultRow[];
  }

  /**
   * Create a new vault for the given user.
   * Returns the created row so the caller can use the server-assigned id.
   */
  async createVault(
    userId: string,
    insert: VaultInsert,
  ): Promise<VaultRow> {
    const { data, error } = await supabase
      .from('vaults')
      .insert({ user_id: userId, ...insert })
      .select('*')
      .single();

    if (error) throw error;
    return data as VaultRow;
  }

  /**
   * Update an existing vault. Only the provided fields are sent.
   * Returns the updated row.
   */
  async updateVault(
    vaultId: string,
    updates: VaultUpdate,
  ): Promise<VaultRow> {
    const { data, error } = await supabase
      .from('vaults')
      .update(updates)
      .eq('id', vaultId)
      .select('*')
      .single();

    if (error) throw error;
    return data as VaultRow;
  }

  /**
   * Soft-delete a vault by setting `active = false`.
   * This preserves referential integrity for transactions, payment methods, etc.
   */
  async deleteVault(vaultId: string): Promise<void> {
    const { error } = await supabase
      .from('vaults')
      .update({ active: false })
      .eq('id', vaultId);

    if (error) throw error;
  }
}
