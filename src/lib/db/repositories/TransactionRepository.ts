import { supabase } from '../../supabase';

/**
 * Row shape returned by Supabase from the `transactions` table.
 * Column names match the PostgreSQL schema (snake_case).
 */
export interface TransactionRow {
  id: string;
  user_id: string;
  vault_id: string;
  payment_method_id: string | null;
  transaction_time: string;
  amount: number;
  transaction_type: 'income' | 'expense' | 'transfer';
  description: string;
  category: string;
  notes: string | null;
  tags: string[];
  status: 'completed' | 'pending' | 'failed';
  recurring: boolean;
  recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for inserting a new transaction row.
 * Omits server-managed fields: id, user_id, created_at, updated_at.
 * user_id is injected by the repository at call time.
 */
export interface TransactionInsert {
  vault_id: string;
  payment_method_id?: string | null;
  transaction_time: string;
  amount: number;
  transaction_type: 'income' | 'expense' | 'transfer';
  description: string;
  category: string;
  notes?: string | null;
  tags?: string[];
  status?: 'completed' | 'pending' | 'failed';
  recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
}

/**
 * Payload for updating an existing transaction row.
 * All fields are optional; only provided fields are sent to the DB.
 */
export interface TransactionUpdate {
  vault_id?: string;
  payment_method_id?: string | null;
  transaction_time?: string;
  amount?: number;
  transaction_type?: 'income' | 'expense' | 'transfer';
  description?: string;
  category?: string;
  notes?: string | null;
  tags?: string[];
  status?: 'completed' | 'pending' | 'failed';
  recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
}

export class TransactionRepository {
  /**
   * Fetch all transactions for a given user, ordered by transaction_time descending.
   */
  async getTransactions(userId: string): Promise<TransactionRow[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_time', { ascending: false });

    if (error) throw error;
    return data as TransactionRow[];
  }

  /**
   * Create a new transaction for the given user.
   * Returns the created row so the caller can use the server-assigned id.
   */
  async createTransaction(
    userId: string,
    transaction: TransactionInsert,
  ): Promise<TransactionRow> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ user_id: userId, ...transaction })
      .select('*')
      .single();

    if (error) throw error;
    return data as TransactionRow;
  }

  /**
   * Update an existing transaction. Only the provided fields are sent.
   * Returns the updated row.
   */
  async updateTransaction(
    transactionId: string,
    updates: TransactionUpdate,
  ): Promise<TransactionRow> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select('*')
      .single();

    if (error) throw error;
    return data as TransactionRow;
  }

  /**
   * Permanently delete a transaction.
   * This is a hard delete — the row is removed from the database.
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw error;
  }
}
