import type { Goal } from '../../types';
import type {
  GoalRow,
  GoalInsert,
  GoalUpdate,
} from './repositories/GoalRepository';

/**
 * Map a Supabase `goals` row → Zustand `Goal`.
 * The `category` field is app-only and not stored in the database.
 */
export function goalRowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    deadline: row.deadline ?? '',
    category: 'Savings',
    status: row.status,
  };
}

/**
 * Map a Zustand `Goal` (without id) → insert payload for the `goals` table.
 * The `category` field is app-only and omitted from the DB payload.
 */
export function goalToInsert(
  goal: Omit<Goal, 'id'>,
): GoalInsert {
  return {
    name: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    deadline: goal.deadline || null,
    status: goal.status,
  };
}

/**
 * Map a full Zustand `Goal` → update payload for the `goals` table.
 * The `category` field is app-only and omitted from the DB payload.
 */
export function goalToUpdate(goal: Goal): GoalUpdate {
  return {
    name: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    deadline: goal.deadline || null,
    status: goal.status,
  };
}
