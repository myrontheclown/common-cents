import type { Budget } from '../../types';
import type {
  BudgetRow,
  BudgetInsert,
  BudgetUpdate,
} from './repositories/BudgetRepository';

export function budgetRowToBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    category: row.category,
    limit: row.limit_amount,
    spent: row.spent,
    period: row.period as 'monthly' | 'weekly',
  };
}

export function budgetToInsert(
  budget: Omit<Budget, 'id'>,
): BudgetInsert {
  return {
    category: budget.category,
    limit_amount: budget.limit,
    spent: budget.spent,
    period: budget.period,
  };
}

export function budgetToUpdate(budget: Budget): BudgetUpdate {
  return {
    category: budget.category,
    limit_amount: budget.limit,
    period: budget.period,
  };
}
