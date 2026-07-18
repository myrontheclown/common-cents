import { supabase } from '../../supabase';

/**
 * Row shape returned by Supabase from the `goals` table.
 * Column names match the PostgreSQL schema (snake_case).
 */
export interface GoalRow {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

/**
 * Payload for inserting a new goal row.
 * Omits server-managed fields: id, user_id, created_at, updated_at.
 * user_id is injected by the repository at call time.
 */
export interface GoalInsert {
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string | null;
  status?: 'active' | 'paused' | 'completed';
}

/**
 * Payload for updating an existing goal row.
 * All fields are optional; only provided fields are sent to the DB.
 */
export interface GoalUpdate {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string | null;
  status?: 'active' | 'paused' | 'completed';
}

export class GoalRepository {
  /**
   * Fetch all active goals for a given user.
   */
  async getGoals(userId: string): Promise<GoalRow[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as GoalRow[];
  }

  /**
   * Create a new goal for the given user.
   * Returns the created row so the caller can use the server-assigned id.
   */
  async createGoal(
    userId: string,
    insert: GoalInsert,
  ): Promise<GoalRow> {
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: userId, ...insert })
      .select('*')
      .single();

    if (error) throw error;
    return data as GoalRow;
  }

  /**
   * Update an existing goal. Only the provided fields are sent.
   * Returns the updated row.
   */
  async updateGoal(
    goalId: string,
    updates: GoalUpdate,
  ): Promise<GoalRow> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select('*')
      .single();

    if (error) throw error;
    return data as GoalRow;
  }

  /**
   * Delete a goal by removing it from the database.
   */
  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  }
}
