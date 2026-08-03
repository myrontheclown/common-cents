import type { Account, Budget } from '../types';

export const DEFAULT_MINIMUM_BALANCE = 1000;

export function getMinimumBalance(account: { minimumBalance?: number }): number {
  return account.minimumBalance != null && account.minimumBalance > 0
    ? account.minimumBalance
    : DEFAULT_MINIMUM_BALANCE;
}

export function isLowBalance(account: { minimumBalance?: number; balance: number }): boolean {
  return account.balance < getMinimumBalance(account);
}

export function applyTransactionToAccounts(
  accounts: Account[],
  tx: { accountId: string; type: string; amount: number },
  sign: 1 | -1
): Account[] {
  return accounts.map(acc => {
    if (acc.id === tx.accountId) {
      const delta = (tx.type === 'income' ? tx.amount : -tx.amount) * sign;
      return { ...acc, balance: Number((acc.balance + delta).toFixed(2)) };
    }
    return acc;
  });
}

export function applyTransactionToBudgets(
  budgets: Budget[],
  tx: { type: string; category: string; amount: number },
  sign: 1 | -1
): Budget[] {
  if (tx.type !== 'expense') return budgets;
  return budgets.map(b => {
    if (b.category.toLowerCase() === tx.category.toLowerCase()) {
      const newSpent = b.spent + tx.amount * sign;
      if (sign === -1) {
        return { ...b, spent: Number(Math.max(0, newSpent).toFixed(2)) };
      }
      return { ...b, spent: Number(newSpent.toFixed(2)) };
    }
    return b;
  });
}
