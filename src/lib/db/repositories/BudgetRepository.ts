import { supabase } from '../../supabase';

export interface BudgetRow {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  spent: number;
  period: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetInsert {
  category: string;
  limit_amount: number;
  spent: number;
  period: string;
}

export interface BudgetUpdate {
  category?: string;
  limit_amount?: number;
  spent?: number;
  period?: string;
}

export class BudgetRepository {
  async getBudgets(userId: string): Promise<BudgetRow[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as BudgetRow[];
  }

  async createBudget(
    userId: string,
    insert: BudgetInsert,
  ): Promise<BudgetRow> {
    const { data, error } = await supabase
      .from('budgets')
      .insert({ user_id: userId, ...insert })
      .select('*')
      .single();

    if (error) throw error;
    return data as BudgetRow;
  }

  async updateBudget(
    budgetId: string,
    updates: BudgetUpdate,
  ): Promise<BudgetRow> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select('*')
      .single();

    if (error) throw error;
    return data as BudgetRow;
  }

  async deleteBudget(budgetId: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

    if (error) throw error;
  }
}
