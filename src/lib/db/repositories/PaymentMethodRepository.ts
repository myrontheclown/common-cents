import { supabase } from '../../supabase';

/**
 * Row shape returned by Supabase from the `payment_methods` table.
 * Column names match the PostgreSQL schema (snake_case).
 */
export interface PaymentMethodRow {
  id: string;
  user_id: string;
  vault_id: string;
  display_name: string;
  type: 'upi' | 'debit_card' | 'credit_card' | 'cash' | 'net_banking';
  icon: string | null;
  color: string | null;
  active: boolean;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for inserting a new payment method row.
 * Omits server-managed fields: id, user_id, created_at, updated_at.
 * user_id is injected by the repository at call time.
 */
export interface PaymentMethodInsert {
  vault_id: string;
  display_name: string;
  type: 'upi' | 'debit_card' | 'credit_card' | 'cash' | 'net_banking';
  icon?: string | null;
  color?: string | null;
}

/**
 * Payload for updating an existing payment method row.
 * All fields are optional; only provided fields are sent to the DB.
 */
export interface PaymentMethodUpdate {
  vault_id?: string;
  display_name?: string;
  type?: 'upi' | 'debit_card' | 'credit_card' | 'cash' | 'net_banking';
  icon?: string | null;
  color?: string | null;
  active?: boolean;
  favorite?: boolean;
}

export class PaymentMethodRepository {
  /**
   * Fetch all active payment methods for a given user.
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethodRow[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as PaymentMethodRow[];
  }

  /**
   * Create a new payment method for the given user.
   * Returns the created row so the caller can use the server-assigned id.
   */
  async createPaymentMethod(
    userId: string,
    insert: PaymentMethodInsert,
  ): Promise<PaymentMethodRow> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({ user_id: userId, ...insert })
      .select('*')
      .single();

    if (error) throw error;
    return data as PaymentMethodRow;
  }

  /**
   * Update an existing payment method. Only the provided fields are sent.
   * Returns the updated row.
   */
  async updatePaymentMethod(
    paymentMethodId: string,
    updates: PaymentMethodUpdate,
  ): Promise<PaymentMethodRow> {
    const { data, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', paymentMethodId)
      .select('*')
      .single();

    if (error) throw error;
    return data as PaymentMethodRow;
  }

  /**
   * Soft-delete a payment method by setting `active = false`.
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .update({ active: false })
      .eq('id', paymentMethodId);

    if (error) throw error;
  }
}
