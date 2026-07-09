import type { Transaction, Budget, Goal, Subscription, Achievement, Account, PaymentMethod } from '../../types';
import { daysBetween, isInRange } from './dateRanges';

export interface PeriodSummary {
  income: number;
  expenses: number;
  savings: number;
  cashflow: number;
  transactionCount: number;
  daysInPeriod: number;
  averageDailySpending: number;
  topCategory: { name: string; amount: number } | null;
  topCategories: { name: string; amount: number; percentage: number }[];
  largestExpense: Transaction | null;
  budgetHealth: { onTrack: number; overBudget: number; total: number };
  goalsProgress: { current: number; target: number; percentage: number };
  subscriptionCost: number;
  achievementsUnlocked: number;
  mostUsedPaymentMethod: { name: string; count: number } | null;
  netWorth: number;
}

export function calculatePeriodSummary(
  start: string,
  end: string,
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  subscriptions: Subscription[],
  achievements: Achievement[],
  accounts: Account[],
  paymentMethods: PaymentMethod[],
): PeriodSummary {
  const txs = transactions.filter(t => isInRange(t.date, start, end));
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const dayCount = daysBetween(start, end);
  const avgDaily = dayCount > 0 ? expenses / dayCount : 0;

  const categoryMap: Record<string, number> = {};
  const expenseTxs = txs.filter(t => t.type === 'expense');
  for (const t of expenseTxs) {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  }
  const categoryEntries = Object.entries(categoryMap)
    .map(([name, amount]) => ({ name, amount, percentage: expenses > 0 ? (amount / expenses) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);
  const topCategory = categoryEntries.length > 0 ? { name: categoryEntries[0].name, amount: categoryEntries[0].amount } : null;

  const largestExpense = expenseTxs.length > 0
    ? expenseTxs.reduce((max, t) => t.amount > max.amount ? t : max, expenseTxs[0])
    : null;

  const onTrack = budgets.filter(b => b.spent <= b.limit).length;
  const overBudget = budgets.filter(b => b.spent > b.limit).length;

  const goalsCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
  const goalsTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  const subCost = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => {
      if (s.billing_cycle === 'yearly') return sum + (s.amount / 12);
      return sum + s.amount;
    }, 0);

  const achCount = achievements.filter(a => a.isUnlocked && a.unlockedAt && isInRange(a.unlockedAt, start, end)).length;

  const pmUsage: Record<string, number> = {};
  for (const t of expenseTxs) {
    if (t.paymentMethodId) {
      pmUsage[t.paymentMethodId] = (pmUsage[t.paymentMethodId] || 0) + 1;
    }
  }
  let mostUsedPm: { name: string; count: number } | null = null;
  let maxCount = 0;
  for (const [pmId, count] of Object.entries(pmUsage)) {
    if (count > maxCount) {
      maxCount = count;
      const pm = paymentMethods.find(p => p.id === pmId);
      if (pm) {
        mostUsedPm = { name: pm.name, count };
      }
    }
  }

  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);

  return {
    income,
    expenses,
    savings: income - expenses,
    cashflow: income - expenses,
    transactionCount: txs.length,
    daysInPeriod: dayCount,
    averageDailySpending: avgDaily,
    topCategory,
    topCategories: categoryEntries,
    largestExpense,
    budgetHealth: { onTrack, overBudget, total: budgets.length },
    goalsProgress: { current: goalsCurrent, target: goalsTarget, percentage: goalsTarget > 0 ? (goalsCurrent / goalsTarget) * 100 : 0 },
    subscriptionCost: subCost,
    achievementsUnlocked: achCount,
    mostUsedPaymentMethod: mostUsedPm,
    netWorth,
  };
}
