import { supabase } from '../../supabase';

export interface SubscriptionRow {
  id: string;
  user_id: string;
  vault_id: string | null;
  payment_method_id: string | null;
  service_name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  renewal_date: string;
  category: string | null;
  active: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInsert {
  service_name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  renewal_date: string;
  vault_id?: string | null;
  category?: string | null;
  active?: boolean;
  color?: string | null;
}

export interface SubscriptionUpdate {
  service_name?: string;
  amount?: number;
  billing_cycle?: 'monthly' | 'yearly';
  renewal_date?: string;
  vault_id?: string | null;
  category?: string | null;
  active?: boolean;
  color?: string | null;
}

export class SubscriptionRepository {
  async getSubscriptions(userId: string): Promise<SubscriptionRow[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as SubscriptionRow[];
  }

  async createSubscription(
    userId: string,
    insert: SubscriptionInsert,
  ): Promise<SubscriptionRow> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ user_id: userId, ...insert })
      .select('*')
      .single();

    if (error) throw error;
    return data as SubscriptionRow;
  }

  async updateSubscription(
    subId: string,
    updates: SubscriptionUpdate,
  ): Promise<SubscriptionRow> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subId)
      .select('*')
      .single();

    if (error) throw error;
    return data as SubscriptionRow;
  }

  async deleteSubscription(subId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({ active: false })
      .eq('id', subId);

    if (error) throw error;
  }
}
