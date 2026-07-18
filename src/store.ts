/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Account, Transaction, Budget, Subscription, Goal, Achievement, AIInsight, UserPreferences, PaymentMethod } from './types';
import { VaultRepository } from './lib/db/repositories';
import { TransactionRepository, TransactionRow } from './lib/db/repositories/TransactionRepository';
import { applyTransactionToAccounts, applyTransactionToBudgets } from './lib/financialHelpers';
import { PaymentMethodRepository } from './lib/db/repositories/PaymentMethodRepository';
import { GoalRepository } from './lib/db/repositories/GoalRepository';
import { SubscriptionRepository } from './lib/db/repositories/SubscriptionRepository';
import { BudgetRepository } from './lib/db/repositories/BudgetRepository';
import { AchievementRepository } from './lib/db/repositories/AchievementRepository';
import { vaultRowToAccount, accountToVaultInsert, accountToVaultUpdate } from './lib/db/types';
import { paymentMethodRowToPaymentMethod, paymentMethodToInsert, paymentMethodToUpdate } from './lib/db/paymentMethodTypes';
import { goalRowToGoal, goalToInsert, goalToUpdate } from './lib/db/goalTypes';
import { subscriptionRowToSubscription, subscriptionToInsert, subscriptionToUpdate } from './lib/db/subscriptionTypes';
import { budgetRowToBudget, budgetToInsert, budgetToUpdate } from './lib/db/budgetTypes';
import { mergeAchievements } from './lib/db/achievementTypes';

const vaultRepo = new VaultRepository();
const transactionRepo = new TransactionRepository();
const paymentMethodRepo = new PaymentMethodRepository();
const goalRepo = new GoalRepository();
const subscriptionRepo = new SubscriptionRepository();
const budgetRepo = new BudgetRepository();
const achievementRepo = new AchievementRepository();

interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: Subscription[];
  goals: Goal[];
  achievements: Achievement[];
  insights: AIInsight[];
  preferences: UserPreferences;
  paymentMethods: PaymentMethod[];
  isVaultsHydrated: boolean;
  isTransactionsHydrated: boolean;
  isPaymentMethodsHydrated: boolean;
  isGoalsHydrated: boolean;
  isSubscriptionsHydrated: boolean;
  isBudgetsHydrated: boolean;
  isAchievementsHydrated: boolean;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>, userId?: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  
  setAccounts: (accounts: Account[]) => void;
  setVaultsHydrated: (hydrated: boolean) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setTransactionsHydrated: (hydrated: boolean) => void;
  setPaymentMethods: (paymentMethods: PaymentMethod[]) => void;
  setPaymentMethodsHydrated: (hydrated: boolean) => void;
  setGoals: (goals: Goal[]) => void;
  setGoalsHydrated: (hydrated: boolean) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setSubscriptionsHydrated: (hydrated: boolean) => void;
  setBudgets: (budgets: Budget[]) => void;
  setBudgetsHydrated: (hydrated: boolean) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setAchievementsHydrated: (hydrated: boolean) => void;
  addAccount: (acc: Omit<Account, 'id'>, userId?: string) => Promise<void>;
  updateAccount: (acc: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  addBudget: (bgt: Omit<Budget, 'id'>, userId?: string) => Promise<void>;
  updateBudget: (bgt: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  addSubscription: (sub: Omit<Subscription, 'id'>, userId?: string) => Promise<void>;
  updateSubscription: (sub: Subscription) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleSubscriptionActive: (id: string) => Promise<void>;
  
  addGoal: (goal: Omit<Goal, 'id'>, userId?: string) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  unlockAchievement: (id: string, userId?: string) => Promise<void>;
  setInsights: (insights: AIInsight[]) => void;

  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>, userId?: string) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  updatePaymentMethod: (pm: PaymentMethod) => Promise<void>;
  recalculateStreak: () => void;
}



export function calculateStreakFromTransactions(transactions: { date: string }[], todayStr: string) {
  const loggedDates = Array.from(new Set(transactions.map(t => t.date))).sort();
  
  if (loggedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastLoggedDate: '' };
  }

  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Calculate longest streak in the entire history
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (const dateStr of loggedDates) {
    const curDate = parseLocalDate(dateStr);
    if (!prevDate) {
      currentRun = 1;
    } else {
      const diffTime = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentRun += 1;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
    prevDate = curDate;
  }

  // Calculate current streak relative to todayStr
  let currentStreak = 0;
  const lastLoggedDate = loggedDates[loggedDates.length - 1];
  
  const todayObj = parseLocalDate(todayStr);
  const lastLoggedObj = parseLocalDate(lastLoggedDate);
  const diffTimeToday = todayObj.getTime() - lastLoggedObj.getTime();
  const diffDaysToday = Math.round(diffTimeToday / (1000 * 60 * 60 * 24));

  if (lastLoggedDate === todayStr || diffDaysToday <= 1) {
    currentStreak = 1;
    let checkObj = parseLocalDate(lastLoggedDate);
    
    while (true) {
      checkObj.setDate(checkObj.getDate() - 1);
      const y = checkObj.getFullYear();
      const m = String(checkObj.getMonth() + 1).padStart(2, '0');
      const d = String(checkObj.getDate()).padStart(2, '0');
      const prevDateStr = `${y}-${m}-${d}`;
      
      if (loggedDates.includes(prevDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak,
    lastLoggedDate
  };
}

const streakAchievementsInternal: Achievement[] = [
  { id: 'ach-streak-1', title: 'First Entry', description: 'Log your first transaction', isUnlocked: false, icon: 'Sparkles', points: 100 },
  { id: 'ach-streak-2', title: 'One Week Strong', description: 'Maintain a 7-day logging streak', isUnlocked: false, icon: 'Flame', points: 150 },
  { id: 'ach-streak-3', title: 'Monthly Discipline', description: 'Maintain a 30-day logging streak', isUnlocked: false, icon: 'Flame', points: 300 },
  { id: 'ach-streak-4', title: 'Financial Archivist', description: 'Maintain a 100-day logging streak', isUnlocked: false, icon: 'Flame', points: 500 }
];

export const updateStreakAndAchievementsInternal = (set: any, get: any, nextTransactions: Transaction[]) => {
  const currentPrefs = get().preferences || {};
  const currentAchs = get().achievements || [];
  
  let achievements = [...currentAchs];
  const missingAchs = streakAchievementsInternal.filter(sa => !achievements.some(a => a.id === sa.id));
  if (missingAchs.length > 0) {
    achievements = [...achievements, ...missingAchs];
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const streakResult = calculateStreakFromTransactions(nextTransactions, todayStr);

  const updatedPrefs = {
    ...currentPrefs,
    currentStreak: streakResult.currentStreak,
    longestStreak: streakResult.longestStreak,
    lastLoggedDate: streakResult.lastLoggedDate,
    reminderEnabled: currentPrefs.reminderEnabled ?? true,
    reminderTime: currentPrefs.reminderTime ?? '21:30'
  };

  const updatedAchs = achievements.map(ach => {
    let shouldUnlock = false;
    if (ach.id === 'ach-streak-1' && nextTransactions.length >= 1) {
      shouldUnlock = true;
    } else if (ach.id === 'ach-streak-2' && streakResult.longestStreak >= 7) {
      shouldUnlock = true;
    } else if (ach.id === 'ach-streak-3' && streakResult.longestStreak >= 30) {
      shouldUnlock = true;
    } else if (ach.id === 'ach-streak-4' && streakResult.longestStreak >= 100) {
      shouldUnlock = true;
    }

    if (shouldUnlock && !ach.isUnlocked) {
      return {
        ...ach,
        isUnlocked: true,
        unlockedAt: new Date().toISOString().split('T')[0]
      };
    }
    return ach;
  });

  set({
    preferences: updatedPrefs,
    achievements: updatedAchs
  });
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: [],
      transactions: [],
      budgets: [],
      subscriptions: [],
      goals: [],
      achievements: [],
      insights: [],
      preferences: {
        name: '',
        currency: 'INR',
        monthlySavingsGoal: 50000,
        categoryThreshold: 80,
        theme: 'neubrutalist',
        reminderEnabled: true,
        reminderTime: '21:30',
        currentStreak: 0,
        longestStreak: 0,
        lastLoggedDate: ''
      },
      paymentMethods: [],
      isVaultsHydrated: false,
      isTransactionsHydrated: false,
      isPaymentMethodsHydrated: false,
      isGoalsHydrated: false,
      isSubscriptionsHydrated: false,
      isBudgetsHydrated: false,
      isAchievementsHydrated: false,

      // Actions
      setAccounts: (accounts) => set({ accounts }),
      setVaultsHydrated: (hydrated) => set({ isVaultsHydrated: hydrated }),
      setTransactions: (transactions) => set({ transactions }),
      setTransactionsHydrated: (hydrated) => set({ isTransactionsHydrated: hydrated }),
      setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
      setPaymentMethodsHydrated: (hydrated) => set({ isPaymentMethodsHydrated: hydrated }),
      setGoals: (goals) => set({ goals }),
      setGoalsHydrated: (hydrated) => set({ isGoalsHydrated: hydrated }),
      setSubscriptions: (subscriptions) => set({ subscriptions }),
      setSubscriptionsHydrated: (hydrated) => set({ isSubscriptionsHydrated: hydrated }),
      setBudgets: (budgets) => set({ budgets }),
      setBudgetsHydrated: (hydrated) => set({ isBudgetsHydrated: hydrated }),
      setAchievements: (achievements) => set({ achievements }),
      setAchievementsHydrated: (hydrated) => set({ isAchievementsHydrated: hydrated }),

      addTransaction: async (tx, userId) => {
        if (!userId) {
          const id = 't-' + Math.random().toString(36).substring(2, 9);
          const newTx: Transaction = { ...tx, id };
          const updatedAccounts = applyTransactionToAccounts(get().accounts, tx, 1);
          const updatedBudgets = applyTransactionToBudgets(get().budgets, tx, 1);
          const nextTxs = [newTx, ...get().transactions];
          set({ transactions: nextTxs, accounts: updatedAccounts, budgets: updatedBudgets });
          updateStreakAndAchievementsInternal(set, get, nextTxs);
          return;
        }

        const tempId = crypto.randomUUID();
        const optimistic: Transaction = { ...tx, id: tempId };

        const txSnapshot = get().transactions;
        const accSnapshot = get().accounts;
        const bgtSnapshot = get().budgets;

        const updatedAccounts = applyTransactionToAccounts(get().accounts, tx, 1);
        const updatedBudgets = applyTransactionToBudgets(get().budgets, tx, 1);
        const nextTxs = [optimistic, ...txSnapshot];
        set({ transactions: nextTxs, accounts: updatedAccounts, budgets: updatedBudgets });
        updateStreakAndAchievementsInternal(set, get, nextTxs);

        let createdRow: TransactionRow | null = null;
        let vaultUpdated = false;
        let budgetUpdated = false;

        try {
          const row = await transactionRepo.createTransaction(userId, {
            vault_id: tx.accountId,
            payment_method_id: tx.paymentMethodId ?? null,
            transaction_time: tx.date,
            amount: tx.amount,
            transaction_type: tx.type,
            description: tx.description,
            category: tx.category,
          });
          createdRow = row;

          const currentAccount = get().accounts.find(a => a.id === tx.accountId)!;
          await vaultRepo.updateVault(tx.accountId, { balance: currentAccount.balance });
          vaultUpdated = true;

          if (tx.type === 'expense') {
            const currentBudget = get().budgets.find(b =>
              b.category.toLowerCase() === tx.category.toLowerCase()
            );
            if (currentBudget) {
              await budgetRepo.updateBudget(currentBudget.id, { spent: currentBudget.spent });
              budgetUpdated = true;
            }
          }

          set(s => ({
            transactions: s.transactions.map(t =>
              t.id === tempId
                ? {
                    id: row.id,
                    date: row.transaction_time.split('T')[0],
                    amount: row.amount,
                    description: row.description,
                    category: row.category,
                    type: row.transaction_type as 'income' | 'expense',
                    accountId: row.vault_id,
                    paymentMethodId: row.payment_method_id ?? undefined,
                  }
                : t
            ),
          }));
        } catch (e) {
          if (budgetUpdated) {
            try {
              const oldBudget = bgtSnapshot.find(b =>
                b.category.toLowerCase() === tx.category.toLowerCase()
              );
              if (oldBudget) {
                await budgetRepo.updateBudget(oldBudget.id, { spent: oldBudget.spent });
              }
            } catch {}
          }
          if (vaultUpdated) {
            try {
              const oldAccount = accSnapshot.find(a => a.id === tx.accountId)!;
              await vaultRepo.updateVault(tx.accountId, { balance: oldAccount.balance });
            } catch {}
          }
          if (createdRow) {
            try {
              await transactionRepo.deleteTransaction(createdRow.id);
            } catch {}
          }

          set({ transactions: txSnapshot, accounts: accSnapshot, budgets: bgtSnapshot });
          updateStreakAndAchievementsInternal(set, get, txSnapshot);
          throw e;
        }
      },

      deleteTransaction: async (id) => {
        const tx = get().transactions.find(t => t.id === id);
        if (!tx) return;

        const txSnapshot = get().transactions;
        const accSnapshot = get().accounts;
        const bgtSnapshot = get().budgets;

        const updatedAccounts = applyTransactionToAccounts(get().accounts, tx, -1);
        const updatedBudgets = applyTransactionToBudgets(get().budgets, tx, -1);
        const nextTxs = txSnapshot.filter(t => t.id !== id);
        set({ transactions: nextTxs, accounts: updatedAccounts, budgets: updatedBudgets });
        updateStreakAndAchievementsInternal(set, get, nextTxs);

        let vaultUpdated = false;
        let budgetUpdated = false;

        try {
          await transactionRepo.deleteTransaction(id);

          const currentAccount = get().accounts.find(a => a.id === tx.accountId)!;
          await vaultRepo.updateVault(tx.accountId, { balance: currentAccount.balance });
          vaultUpdated = true;

          if (tx.type === 'expense') {
            const currentBudget = get().budgets.find(b =>
              b.category.toLowerCase() === tx.category.toLowerCase()
            );
            if (currentBudget) {
              await budgetRepo.updateBudget(currentBudget.id, { spent: currentBudget.spent });
              budgetUpdated = true;
            }
          }
        } catch (e) {
          if (budgetUpdated) {
            try {
              const oldBudget = bgtSnapshot.find(b =>
                b.category.toLowerCase() === tx.category.toLowerCase()
              );
              if (oldBudget) {
                await budgetRepo.updateBudget(oldBudget.id, { spent: oldBudget.spent });
              }
            } catch {}
          }
          if (vaultUpdated) {
            try {
              const oldAccount = accSnapshot.find(a => a.id === tx.accountId)!;
              await vaultRepo.updateVault(tx.accountId, { balance: oldAccount.balance });
            } catch {}
          }

          set({ transactions: txSnapshot, accounts: accSnapshot, budgets: bgtSnapshot });
          updateStreakAndAchievementsInternal(set, get, txSnapshot);
          throw e;
        }
      },

      updateTransaction: async (updatedTx) => {
        const oldTx = get().transactions.find(t => t.id === updatedTx.id);
        if (!oldTx) return;

        const txSnapshot = get().transactions;
        const accSnapshot = get().accounts;
        const bgtSnapshot = get().budgets;

        let accounts = applyTransactionToAccounts(get().accounts, oldTx, -1);
        accounts = applyTransactionToAccounts(accounts, updatedTx, 1);
        let budgets = applyTransactionToBudgets(get().budgets, oldTx, -1);
        budgets = applyTransactionToBudgets(budgets, updatedTx, 1);
        const nextTxs = txSnapshot.map(t => t.id === updatedTx.id ? updatedTx : t);
        set({ transactions: nextTxs, accounts, budgets });
        updateStreakAndAchievementsInternal(set, get, nextTxs);

        const vaultIdsToUpdate = new Set([oldTx.accountId]);
        if (updatedTx.accountId !== oldTx.accountId) {
          vaultIdsToUpdate.add(updatedTx.accountId);
        }

        const budgetIdsToUpdate = new Map<string, string>();
        if (oldTx.type === 'expense') {
          const oldBudget = bgtSnapshot.find(b => b.category.toLowerCase() === oldTx.category.toLowerCase());
          if (oldBudget) budgetIdsToUpdate.set(oldBudget.id, oldBudget.category);
        }
        if (updatedTx.type === 'expense') {
          const newBudget = bgtSnapshot.find(b => b.category.toLowerCase() === updatedTx.category.toLowerCase());
          if (newBudget && !budgetIdsToUpdate.has(newBudget.id)) {
            budgetIdsToUpdate.set(newBudget.id, newBudget.category);
          }
        }

        let transactionUpdated = false;
        const updatedVaults: string[] = [];
        const updatedBudgets: string[] = [];

        try {
          const row = await transactionRepo.updateTransaction(updatedTx.id, {
            vault_id: updatedTx.accountId,
            payment_method_id: updatedTx.paymentMethodId ?? null,
            transaction_time: updatedTx.date,
            amount: updatedTx.amount,
            transaction_type: updatedTx.type,
            description: updatedTx.description,
            category: updatedTx.category,
          });
          transactionUpdated = true;

          for (const vaultId of vaultIdsToUpdate) {
            const currentAccount = get().accounts.find(a => a.id === vaultId)!;
            await vaultRepo.updateVault(vaultId, { balance: currentAccount.balance });
            updatedVaults.push(vaultId);
          }

          for (const [budgetId] of budgetIdsToUpdate) {
            const currentBudget = get().budgets.find(b => b.id === budgetId)!;
            await budgetRepo.updateBudget(budgetId, { spent: currentBudget.spent });
            updatedBudgets.push(budgetId);
          }

          set(s => ({
            transactions: s.transactions.map(t =>
              t.id === row.id
                ? {
                    id: row.id,
                    date: row.transaction_time.split('T')[0],
                    amount: row.amount,
                    description: row.description,
                    category: row.category,
                    type: row.transaction_type as 'income' | 'expense',
                    accountId: row.vault_id,
                    paymentMethodId: row.payment_method_id ?? undefined,
                  }
                : t
            ),
          }));
        } catch (e) {
          for (const budgetId of [...updatedBudgets].reverse()) {
            try {
              const oldBudget = bgtSnapshot.find(b => b.id === budgetId)!;
              await budgetRepo.updateBudget(budgetId, { spent: oldBudget.spent });
            } catch {}
          }
          for (const vaultId of [...updatedVaults].reverse()) {
            try {
              const oldAccount = accSnapshot.find(a => a.id === vaultId)!;
              await vaultRepo.updateVault(vaultId, { balance: oldAccount.balance });
            } catch {}
          }
          if (transactionUpdated) {
            try {
              await transactionRepo.updateTransaction(updatedTx.id, {
                vault_id: oldTx.accountId,
                payment_method_id: oldTx.paymentMethodId ?? null,
                transaction_time: oldTx.date,
                amount: oldTx.amount,
                transaction_type: oldTx.type,
                description: oldTx.description,
                category: oldTx.category,
              });
            } catch {}
          }

          set({ transactions: txSnapshot, accounts: accSnapshot, budgets: bgtSnapshot });
          updateStreakAndAchievementsInternal(set, get, txSnapshot);
          throw e;
        }
      },

      addAccount: async (acc, userId) => {
        if (!userId) {
          const id = 'acc-' + Math.random().toString(36).substring(2, 9);
          set(s => ({ accounts: [...s.accounts, { ...acc, id }] }));
          return;
        }
        const tempId = crypto.randomUUID();
        const optimistic: Account = { ...acc, id: tempId };
        const snapshot = get().accounts;
        set(s => ({ accounts: [...s.accounts, optimistic] }));
        try {
          const row = await vaultRepo.createVault(
            userId,
            accountToVaultInsert(acc)
          );
          set(s => ({
            accounts: s.accounts.map(a =>
              a.id === tempId
                ? vaultRowToAccount(row)
                : a
            )
          }));
        } catch (e) {
          set({ accounts: snapshot });
          throw e;
        }
      },

      updateAccount: async (updatedAcc) => {
        const snapshot = get().accounts;
        set(s => ({
          accounts: s.accounts.map(acc => acc.id === updatedAcc.id ? updatedAcc : acc)
        }));
        try {
          const row = await vaultRepo.updateVault(updatedAcc.id, accountToVaultUpdate(updatedAcc));
          set(s => ({
            accounts: s.accounts.map(a => a.id === row.id ? vaultRowToAccount(row) : a)
          }));
        } catch (e) {
          set({ accounts: snapshot });
          throw e;
        }
      },

      deleteAccount: async (id) => {
        const snapshot = get().accounts;
        set(s => ({
          accounts: s.accounts.filter(acc => acc.id !== id)
        }));
        try {
          await vaultRepo.deleteVault(id);
        } catch (e) {
          set({ accounts: snapshot });
          throw e;
        }
      },

      addBudget: async (bgt, userId) => {
        if (!userId) {
          const id = 'b-' + Math.random().toString(36).substring(2, 9);
          set(s => ({ budgets: [...s.budgets, { ...bgt, id }] }));
          return;
        }
        const tempId = crypto.randomUUID();
        const optimistic: Budget = { ...bgt, id: tempId };
        const snapshot = get().budgets;
        set(s => ({ budgets: [...s.budgets, optimistic] }));
        try {
          const row = await budgetRepo.createBudget(userId, budgetToInsert(bgt));
          set(s => ({
            budgets: s.budgets.map(b => b.id === tempId ? budgetRowToBudget(row) : b)
          }));
        } catch (e) {
          set({ budgets: snapshot });
          throw e;
        }
      },

      updateBudget: async (updatedBgt) => {
        const snapshot = get().budgets;
        set(s => ({
          budgets: s.budgets.map(b => b.id === updatedBgt.id ? updatedBgt : b)
        }));
        try {
          const row = await budgetRepo.updateBudget(updatedBgt.id, budgetToUpdate(updatedBgt));
          set(s => ({
            budgets: s.budgets.map(b => b.id === row.id ? budgetRowToBudget(row) : b)
          }));
        } catch (e) {
          set({ budgets: snapshot });
          throw e;
        }
      },

      deleteBudget: async (id) => {
        const snapshot = get().budgets;
        set(s => ({
          budgets: s.budgets.filter(b => b.id !== id)
        }));
        try {
          await budgetRepo.deleteBudget(id);
        } catch (e) {
          set({ budgets: snapshot });
          throw e;
        }
      },

      addSubscription: async (sub, userId) => {
        if (!userId) {
          const id = 'sub-' + Math.random().toString(36).substring(2, 9);
          set(s => ({ subscriptions: [...s.subscriptions, { ...sub, id }] }));
          return;
        }
        const tempId = crypto.randomUUID();
        const optimistic: Subscription = { ...sub, id: tempId };
        const snapshot = get().subscriptions;
        set(s => ({ subscriptions: [...s.subscriptions, optimistic] }));
        try {
          const row = await subscriptionRepo.createSubscription(userId, subscriptionToInsert(sub));
          set(s => ({
            subscriptions: s.subscriptions.map(sub => sub.id === tempId ? subscriptionRowToSubscription(row) : sub)
          }));
        } catch (e) {
          set({ subscriptions: snapshot });
          throw e;
        }
      },

      updateSubscription: async (updatedSub) => {
        const snapshot = get().subscriptions;
        set(s => ({
          subscriptions: s.subscriptions.map(sub => sub.id === updatedSub.id ? updatedSub : sub)
        }));
        try {
          const row = await subscriptionRepo.updateSubscription(updatedSub.id, subscriptionToUpdate(updatedSub));
          set(s => ({
            subscriptions: s.subscriptions.map(sub => sub.id === row.id ? subscriptionRowToSubscription(row) : sub)
          }));
        } catch (e) {
          set({ subscriptions: snapshot });
          throw e;
        }
      },

      deleteSubscription: async (id) => {
        const snapshot = get().subscriptions;
        set(s => ({
          subscriptions: s.subscriptions.filter(sub => sub.id !== id)
        }));
        try {
          await subscriptionRepo.deleteSubscription(id);
        } catch (e) {
          set({ subscriptions: snapshot });
          throw e;
        }
      },

      toggleSubscriptionActive: async (id) => {
        const target = get().subscriptions.find(sub => sub.id === id);
        if (!target) return;
        const newActive = !target.active;
        const updated = { ...target, active: newActive };
        const snapshot = get().subscriptions;
        set(s => ({
          subscriptions: s.subscriptions.map(sub => sub.id === id ? updated : sub)
        }));
        try {
          const row = await subscriptionRepo.updateSubscription(id, { active: newActive });
          set(s => ({
            subscriptions: s.subscriptions.map(sub => sub.id === row.id ? subscriptionRowToSubscription(row) : sub)
          }));
        } catch (e) {
          set({ subscriptions: snapshot });
          throw e;
        }
      },

      addGoal: async (goal, userId) => {
        if (!userId) {
          const id = 'g-' + Math.random().toString(36).substring(2, 9);
          set(s => ({ goals: [...s.goals, { ...goal, id }] }));
          return;
        }
        const tempId = crypto.randomUUID();
        const optimistic: Goal = { ...goal, id: tempId };
        const snapshot = get().goals;
        set(s => ({ goals: [...s.goals, optimistic] }));
        try {
          const row = await goalRepo.createGoal(userId, goalToInsert(goal));
          set(s => ({
            goals: s.goals.map(g => g.id === tempId ? goalRowToGoal(row) : g)
          }));
        } catch (e) {
          set({ goals: snapshot });
          throw e;
        }
      },

      updateGoal: async (updatedGoal) => {
        const snapshot = get().goals;
        set(s => ({
          goals: s.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
        }));
        try {
          const row = await goalRepo.updateGoal(updatedGoal.id, goalToUpdate(updatedGoal));
          set(s => ({
            goals: s.goals.map(g => g.id === row.id ? goalRowToGoal(row) : g)
          }));
        } catch (e) {
          set({ goals: snapshot });
          throw e;
        }
      },

      deleteGoal: async (id) => {
        const snapshot = get().goals;
        set(s => ({
          goals: s.goals.filter(g => g.id !== id)
        }));
        try {
          await goalRepo.deleteGoal(id);
        } catch (e) {
          set({ goals: snapshot });
          throw e;
        }
      },

      updatePreferences: (prefs) => {
        set(state => ({
          preferences: { ...state.preferences, ...prefs }
        }));
      },

      unlockAchievement: async (id, userId) => {
        const ach = get().achievements.find(a => a.id === id);
        if (!ach || ach.isUnlocked) return;

        const today = new Date().toISOString().split('T')[0];
        const snapshot = get().achievements;

        set(s => ({
          achievements: s.achievements.map(a =>
            a.id === id ? { ...a, isUnlocked: true, unlockedAt: today } : a
          )
        }));

        if (!userId) return;

        try {
          await achievementRepo.unlockAchievement(userId, id);
        } catch (e) {
          set({ achievements: snapshot });
          throw e;
        }
      },

      setInsights: (insights) => {
        set({ insights });
      },

      addPaymentMethod: async (pm, userId) => {
        if (!userId) {
          const id = 'pm-' + Math.random().toString(36).substring(2, 9);
          set(s => ({ paymentMethods: [...s.paymentMethods, { ...pm, id }] }));
          return;
        }
        const tempId = crypto.randomUUID();
        const optimistic: PaymentMethod = { ...pm, id: tempId };
        const snapshot = get().paymentMethods;
        set(s => ({ paymentMethods: [...s.paymentMethods, optimistic] }));
        try {
          const row = await paymentMethodRepo.createPaymentMethod(userId, paymentMethodToInsert(pm));
          set(s => ({
            paymentMethods: s.paymentMethods.map(p => p.id === tempId ? paymentMethodRowToPaymentMethod(row) : p)
          }));
        } catch (e) {
          set({ paymentMethods: snapshot });
          throw e;
        }
      },

      deletePaymentMethod: async (id) => {
        const snapshot = get().paymentMethods;
        set(s => ({
          paymentMethods: s.paymentMethods.filter(p => p.id !== id)
        }));
        try {
          await paymentMethodRepo.deletePaymentMethod(id);
        } catch (e) {
          set({ paymentMethods: snapshot });
          throw e;
        }
      },

      updatePaymentMethod: async (updatedPm) => {
        const snapshot = get().paymentMethods;
        set(s => ({
          paymentMethods: s.paymentMethods.map(p => p.id === updatedPm.id ? updatedPm : p)
        }));
        try {
          const row = await paymentMethodRepo.updatePaymentMethod(updatedPm.id, paymentMethodToUpdate(updatedPm));
          set(s => ({
            paymentMethods: s.paymentMethods.map(p => p.id === row.id ? paymentMethodRowToPaymentMethod(row) : p)
          }));
        } catch (e) {
          set({ paymentMethods: snapshot });
          throw e;
        }
      },
      
      recalculateStreak: () => {
        updateStreakAndAchievementsInternal(set, get, get().transactions);
      }
    }),
    {
      name: 'finance-os-storage',
      partialize: (state) => {
        const { isVaultsHydrated, isTransactionsHydrated, isPaymentMethodsHydrated, isGoalsHydrated, isSubscriptionsHydrated, isBudgetsHydrated, isAchievementsHydrated, ...rest } = state;
        return rest;
      },
    }
  )
);
