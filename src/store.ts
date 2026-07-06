/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Account, Transaction, Budget, Subscription, Goal, Achievement, AIInsight, UserPreferences, PaymentMethod } from './types';
import { VaultRepository } from './lib/db/repositories';
import { vaultRowToAccount, accountToVaultInsert, accountToVaultUpdate } from './lib/db/types';

const vaultRepo = new VaultRepository();

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
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (tx: Transaction) => void;
  
  setAccounts: (accounts: Account[]) => void;
  setVaultsHydrated: (hydrated: boolean) => void;
  addAccount: (acc: Omit<Account, 'id'>, userId?: string) => Promise<void>;
  updateAccount: (acc: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  addBudget: (bgt: Omit<Budget, 'id'>) => void;
  updateBudget: (bgt: Budget) => void;
  deleteBudget: (id: string) => void;
  
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (sub: Subscription) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscriptionActive: (id: string) => void;
  
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  unlockAchievement: (id: string) => void;
  setInsights: (insights: AIInsight[]) => void;

  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => void;
  deletePaymentMethod: (id: string) => void;
  updatePaymentMethod: (pm: PaymentMethod) => void;
  recalculateStreak: () => void;
}

const initialAccounts: Account[] = [
  { id: 'bank-1', name: 'HDFC Checking', type: 'bank', balance: 142500.50, color: '#38BDF8', icon: 'Landmark' },
  { id: 'invest-1', name: 'Zerodha Portfolio', type: 'investment', balance: 384000.00, color: '#4ADE80', icon: 'TrendingUp' },
  { id: 'cash-1', name: 'Wallet Cash', type: 'cash', balance: 4500.00, color: '#F43F5E', icon: 'Coins' },
  { id: 'credit-1', name: 'Amex Gold', type: 'credit', balance: -12800.45, color: '#FB923C', icon: 'CreditCard' },
];

const initialBudgets: Budget[] = [
  { id: 'b-1', category: 'Food & Dining', limit: 25000, spent: 18450.50, period: 'monthly' },
  { id: 'b-2', category: 'Entertainment', limit: 10000, spent: 7850.00, period: 'monthly' },
  { id: 'b-3', category: 'Housing', limit: 45000, spent: 45000.00, period: 'monthly' },
  { id: 'b-4', category: 'Shopping', limit: 15000, spent: 8120.20, period: 'monthly' },
  { id: 'b-5', category: 'Transport', limit: 8000, spent: 5400.00, period: 'monthly' },
  { id: 'b-6', category: 'Utilities', limit: 10000, spent: 8210.00, period: 'monthly' },
];

const initialSubscriptions: Subscription[] = [
  { 
    id: 'sub-1', 
    name: 'Spotify Premium', 
    service_name: 'Spotify Premium',
    amount: 119.00, 
    frequency: 'monthly', 
    billing_cycle: 'monthly',
    nextBillingDate: '2026-07-15', 
    renewal_date: '2026-07-15',
    category: 'Entertainment', 
    accountId: 'credit-1', 
    payment_account: 'credit-1',
    isActive: true,
    active: true,
    auto_debit: true,
    icon: 'Music',
    color: '#FF78C4'
  },
  { 
    id: 'sub-2', 
    name: 'Netflix Ultra', 
    service_name: 'Netflix Ultra',
    amount: 649.00, 
    frequency: 'monthly', 
    billing_cycle: 'monthly',
    nextBillingDate: '2026-07-22', 
    renewal_date: '2026-07-22',
    category: 'Entertainment', 
    accountId: 'credit-1', 
    payment_account: 'credit-1',
    isActive: true,
    active: true,
    auto_debit: true,
    icon: 'Tv',
    color: '#FF9F9F'
  },
  { 
    id: 'sub-3', 
    name: 'GitHub Copilot', 
    service_name: 'GitHub Copilot',
    amount: 850.00, 
    frequency: 'monthly', 
    billing_cycle: 'monthly',
    nextBillingDate: '2026-07-10', 
    renewal_date: '2026-07-10',
    category: 'Utilities', 
    accountId: 'bank-1', 
    payment_account: 'bank-1',
    isActive: true,
    active: true,
    auto_debit: true,
    icon: 'Cpu',
    color: '#38BDF8'
  },
  { 
    id: 'sub-4', 
    name: 'AWS Cloud Sandbox', 
    service_name: 'AWS Cloud Sandbox',
    amount: 3500.00, 
    frequency: 'monthly', 
    billing_cycle: 'monthly',
    nextBillingDate: '2026-07-05', 
    renewal_date: '2026-07-05',
    category: 'Utilities', 
    accountId: 'bank-1', 
    payment_account: 'bank-1',
    isActive: true,
    active: true,
    auto_debit: false,
    icon: 'Cloud',
    color: '#FB923C'
  },
];

const initialGoals: Goal[] = [
  { id: 'g-1', name: 'Mahindra Thar Downpayment', targetAmount: 500000, currentAmount: 325000, deadline: '2026-12-31', category: 'Transport', status: 'active' },
  { id: 'g-2', name: 'Emergency Fund', targetAmount: 150000, currentAmount: 115000, deadline: '2026-09-30', category: 'Savings', status: 'active' },
  { id: 'g-3', name: 'Goa Summer Trip 2026', targetAmount: 50000, currentAmount: 32000, deadline: '2026-07-15', category: 'Travel', status: 'active' },
];

const initialAchievements: Achievement[] = [
  { id: 'ach-1', title: 'Aesthetic Saver', description: 'Saved more than 40% of income this month', isUnlocked: true, unlockedAt: '2026-06-28', icon: 'Sparkles', points: 150 },
  { id: 'ach-2', title: 'Subscription Slayer', description: 'Cancelled 3 or more inactive subscriptions', isUnlocked: false, icon: 'Flame', points: 200 },
  { id: 'ach-3', title: 'Budget Tactician', description: 'Stayed 100% under budget in all categories', isUnlocked: true, unlockedAt: '2026-06-30', icon: 'ShieldAlert', points: 250 },
  { id: 'ach-4', title: 'Velocity Limit', description: 'Saved ₹1,00,000 inside your bank account', isUnlocked: true, unlockedAt: '2026-05-15', icon: 'Zap', points: 300 },
  { id: 'ach-streak-1', title: 'First Entry', description: 'Log your first transaction', isUnlocked: false, icon: 'Sparkles', points: 100 },
  { id: 'ach-streak-2', title: 'One Week Strong', description: 'Maintain a 7-day logging streak', isUnlocked: false, icon: 'Flame', points: 150 },
  { id: 'ach-streak-3', title: 'Monthly Discipline', description: 'Maintain a 30-day logging streak', isUnlocked: false, icon: 'Flame', points: 300 },
  { id: 'ach-streak-4', title: 'Financial Archivist', description: 'Maintain a 100-day logging streak', isUnlocked: false, icon: 'Flame', points: 500 }
];

const initialTransactions: Transaction[] = [
  { id: 't-1', date: '2026-06-29', amount: 1450.00, description: 'Swiggy Gourmet Order', category: 'Food & Dining', type: 'expense', accountId: 'credit-1', paymentMethodId: 'pm-5' },
  { id: 't-2', date: '2026-06-28', amount: 85000.00, description: 'HDFC Tech Paycheck', category: 'Income', type: 'income', accountId: 'bank-1', paymentMethodId: 'pm-1' },
  { id: 't-3', date: '2026-06-27', amount: 22000.00, description: 'Monthly Apartment Rent', category: 'Housing', type: 'expense', accountId: 'bank-1', paymentMethodId: 'pm-1' },
  { id: 't-4', date: '2026-06-26', amount: 649.00, description: 'Netflix Ultra subscription', category: 'Entertainment', type: 'expense', accountId: 'credit-1', paymentMethodId: 'pm-5' },
  { id: 't-5', date: '2026-06-25', amount: 2400.00, description: 'FabIndia Festive Kurta', category: 'Shopping', type: 'expense', accountId: 'credit-1', paymentMethodId: 'pm-5' },
  { id: 't-6', date: '2026-06-24', amount: 350.00, description: 'Starbucks Coffee Reserve', category: 'Food & Dining', type: 'expense', accountId: 'cash-1', paymentMethodId: 'pm-4' },
  { id: 't-7', date: '2026-06-22', amount: 1500.00, description: 'HP Petrol Pump Refuel', category: 'Transport', type: 'expense', accountId: 'credit-1', paymentMethodId: 'pm-5' },
  { id: 't-8', date: '2026-06-20', amount: 850.00, description: 'GitHub Copilot subscription', category: 'Utilities', type: 'expense', accountId: 'bank-1', paymentMethodId: 'pm-3' },
  { id: 't-9', date: '2026-06-18', amount: 3500.00, description: 'AWS Cloud Sandbox Bill', category: 'Utilities', type: 'expense', accountId: 'bank-1', paymentMethodId: 'pm-3' },
  { id: 't-10', date: '2026-06-15', amount: 85000.00, description: 'HDFC Tech Paycheck', category: 'Income', type: 'income', accountId: 'bank-1', paymentMethodId: 'pm-1' },
  { id: 't-11', date: '2026-06-14', amount: 1200.00, description: 'Zomato Food Delivery', category: 'Food & Dining', type: 'expense', accountId: 'cash-1', paymentMethodId: 'pm-4' },
  { id: 't-12', date: '2026-06-12', amount: 500.00, description: 'Delhi Metro Smart Card', category: 'Transport', type: 'expense', accountId: 'bank-1', paymentMethodId: 'pm-1' },
  { id: 't-13', date: '2026-06-10', amount: 119.00, description: 'Spotify Premium subscription', category: 'Entertainment', type: 'expense', accountId: 'credit-1', paymentMethodId: 'pm-5' },
  { id: 't-14', date: '2026-06-08', amount: 4500.00, description: 'Zerodha Dividend Payout', category: 'Income', type: 'income', accountId: 'invest-1' },
];

const initialPaymentMethods: PaymentMethod[] = [
  { id: 'pm-1', name: 'Google Pay', type: 'upi', accountId: 'bank-1', color: '#38BDF8', icon: 'Smartphone' },
  { id: 'pm-2', name: 'PhonePe', type: 'upi', accountId: 'bank-1', color: '#C084FC', icon: 'Smartphone' },
  { id: 'pm-3', name: 'HDFC Debit Card', type: 'debit', accountId: 'bank-1', color: '#4ADE80', icon: 'CreditCard' },
  { id: 'pm-4', name: 'Cash Pay', type: 'cash', accountId: 'cash-1', color: '#F43F5E', icon: 'Coins' },
  { id: 'pm-5', name: 'Amex Gold Card', type: 'credit', accountId: 'credit-1', color: '#FB923C', icon: 'CreditCard' }
];

const initialInsights: AIInsight[] = [
  {
    id: 'in-1',
    date: '2026-07-01',
    type: 'tip',
    title: 'Arbitrage Opportunity Found',
    summary: 'Transfer idle cash to higher-yield accounts.',
    detail: 'You have ₹1,42,500 sitting in your HDFC Checking earning 3.0% APY. Moving ₹1,00,000 to a High-Yield fixed sweep earning 7.2% APY yields an extra ~₹4,200/year in passive interest with zero risk.',
    impactValue: '+₹4,200/yr',
    actionableStep: 'Open dynamic yield cache in Zerodha or alternative HYSA.'
  },
  {
    id: 'in-2',
    date: '2026-06-30',
    type: 'warning',
    title: 'Velocity Threshold Alert: Food Category',
    summary: 'Food spending is on track to breach the monthly budget.',
    detail: 'Your monthly spend on Food & Dining is at ₹18,450.50 against a ₹25,000 limit. With 12 days remaining in the period, your velocity indicates you will breach the limit by ~₹3,500 if current behaviors are sustained.',
    impactValue: '-₹3,500 over',
    actionableStep: 'Cap eating out at ₹500/day for the next week.'
  },
  {
    id: 'in-3',
    date: '2026-06-28',
    type: 'celebration',
    title: 'Financial Milestone Unlocked: Emergency Stack',
    summary: 'Your high-yield cash cushion has covered 5 months of runway.',
    detail: 'Congratulations! Your cash reserves and emergency reserves combined cover 5 full months of your average baseline living expenses. You are officially in the top 10% of financial security brackets for your age.',
    impactValue: '5.2 Months Runway',
    actionableStep: 'Unlock the "Aesthetic Saver" medal inside achievement log.'
  }
];

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
      accounts: initialAccounts,
      transactions: initialTransactions,
      budgets: initialBudgets,
      subscriptions: initialSubscriptions,
      goals: initialGoals,
      achievements: initialAchievements,
      insights: initialInsights,
      preferences: {
        name: 'Myron',
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
      paymentMethods: initialPaymentMethods,
      isVaultsHydrated: false,

      // Actions
      setAccounts: (accounts) => set({ accounts }),
      setVaultsHydrated: (hydrated) => set({ isVaultsHydrated: hydrated }),

      addTransaction: (tx) => {
        const id = 't-' + Math.random().toString(36).substring(2, 9);
        const newTx: Transaction = { ...tx, id };
        
        // Update account balance
        const updatedAccounts = get().accounts.map(acc => {
          if (acc.id === tx.accountId) {
            const balanceDiff = tx.type === 'income' ? tx.amount : -tx.amount;
            return { ...acc, balance: Number((acc.balance + balanceDiff).toFixed(2)) };
          }
          return acc;
        });

        // Update budget spent
        const updatedBudgets = get().budgets.map(b => {
          if (tx.type === 'expense' && b.category.toLowerCase() === tx.category.toLowerCase()) {
            return { ...b, spent: Number((b.spent + tx.amount).toFixed(2)) };
          }
          return b;
        });

        const nextTxs = [newTx, ...get().transactions];
        set(state => ({
          transactions: nextTxs,
          accounts: updatedAccounts,
          budgets: updatedBudgets
        }));
        updateStreakAndAchievementsInternal(set, get, nextTxs);
      },

      deleteTransaction: (id) => {
        const tx = get().transactions.find(t => t.id === id);
        if (!tx) return;

        // Revert account balance
        const updatedAccounts = get().accounts.map(acc => {
          if (acc.id === tx.accountId) {
            const balanceDiff = tx.type === 'income' ? -tx.amount : tx.amount;
            return { ...acc, balance: Number((acc.balance + balanceDiff).toFixed(2)) };
          }
          return acc;
        });

        // Revert budget spent
        const updatedBudgets = get().budgets.map(b => {
          if (tx.type === 'expense' && b.category.toLowerCase() === tx.category.toLowerCase()) {
            return { ...b, spent: Number(Math.max(0, b.spent - tx.amount).toFixed(2)) };
          }
          return b;
        });

        const nextTxs = get().transactions.filter(t => t.id !== id);
        set(state => ({
          transactions: nextTxs,
          accounts: updatedAccounts,
          budgets: updatedBudgets
        }));
        updateStreakAndAchievementsInternal(set, get, nextTxs);
      },

      updateTransaction: (updatedTx) => {
        const oldTx = get().transactions.find(t => t.id === updatedTx.id);
        if (!oldTx) return;

        // Revert old transaction effects on accounts and budgets
        let accounts = get().accounts.map(acc => {
          if (acc.id === oldTx.accountId) {
            const balanceDiff = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
            return { ...acc, balance: Number((acc.balance + balanceDiff).toFixed(2)) };
          }
          return acc;
        });

        let budgets = get().budgets.map(b => {
          if (oldTx.type === 'expense' && b.category.toLowerCase() === oldTx.category.toLowerCase()) {
            return { ...b, spent: Number(Math.max(0, b.spent - oldTx.amount).toFixed(2)) };
          }
          return b;
        });

        // Apply updated transaction effects on accounts and budgets
        accounts = accounts.map(acc => {
          if (acc.id === updatedTx.accountId) {
            const balanceDiff = updatedTx.type === 'income' ? updatedTx.amount : -updatedTx.amount;
            return { ...acc, balance: Number((acc.balance + balanceDiff).toFixed(2)) };
          }
          return acc;
        });

        budgets = budgets.map(b => {
          if (updatedTx.type === 'expense' && b.category.toLowerCase() === updatedTx.category.toLowerCase()) {
            return { ...b, spent: Number((b.spent + updatedTx.amount).toFixed(2)) };
          }
          return b;
        });

        const nextTxs = get().transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
        set(state => ({
          transactions: nextTxs,
          accounts,
          budgets
        }));
        updateStreakAndAchievementsInternal(set, get, nextTxs);
      },

      addAccount: async (acc, userId) => {
        console.log("STORE ADD ACCOUNT");
        console.log("USER ID:", userId);
        console.log("ACCOUNT:", acc);
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

        console.log("CALLING SUPABASE INSERT");

        const row = await vaultRepo.createVault(
          userId,
          accountToVaultInsert(acc)
        );

        console.log("SUPABASE RETURNED:");
        console.log(row);

        set(s => ({
          accounts: s.accounts.map(a =>
            a.id === tempId
              ? vaultRowToAccount(row)
              : a
          )
        }));

      } catch (e) {

        console.error("SUPABASE INSERT FAILED");
        console.error(e);

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

      addBudget: (bgt) => {
        const id = 'b-' + Math.random().toString(36).substring(2, 9);
        set(state => ({
          budgets: [...state.budgets, { ...bgt, id }]
        }));
      },

      updateBudget: (updatedBgt) => {
        set(state => ({
          budgets: state.budgets.map(b => b.id === updatedBgt.id ? updatedBgt : b)
        }));
      },

      deleteBudget: (id) => {
        set(state => ({
          budgets: state.budgets.filter(b => b.id !== id)
        }));
      },

      addSubscription: (sub) => {
        const id = 'sub-' + Math.random().toString(36).substring(2, 9);
        const mappedSub = {
          ...sub,
          id,
          // Sync new fields to old fields
          name: sub.service_name || sub.name || '',
          frequency: sub.billing_cycle || (sub.frequency === 'annual' ? 'yearly' : 'monthly'),
          nextBillingDate: sub.renewal_date || sub.nextBillingDate || '',
          accountId: sub.payment_account || sub.accountId || '',
          isActive: sub.active ?? sub.isActive ?? true,
          // Sync old fields to new fields
          service_name: sub.service_name || sub.name || '',
          billing_cycle: sub.billing_cycle || (sub.frequency === 'annual' ? 'yearly' : 'monthly'),
          renewal_date: sub.renewal_date || sub.nextBillingDate || '',
          payment_account: sub.payment_account || sub.accountId || '',
          active: sub.active ?? sub.isActive ?? true,
          auto_debit: sub.auto_debit ?? true,
          icon: sub.icon || 'CreditCard',
          color: sub.color || '#38BDF8'
        };
        set(state => ({
          subscriptions: [...state.subscriptions, mappedSub]
        }));
      },

      updateSubscription: (updatedSub) => {
        set(state => ({
          subscriptions: state.subscriptions.map(s => {
            if (s.id === updatedSub.id) {
              return {
                ...s,
                ...updatedSub,
                name: updatedSub.service_name || updatedSub.name || s.name,
                frequency: updatedSub.billing_cycle || (updatedSub.frequency === 'annual' ? 'yearly' : 'monthly') || s.frequency,
                nextBillingDate: updatedSub.renewal_date || updatedSub.nextBillingDate || s.nextBillingDate,
                accountId: updatedSub.payment_account || updatedSub.accountId || s.accountId,
                isActive: updatedSub.active ?? updatedSub.isActive ?? s.isActive,
                service_name: updatedSub.service_name || updatedSub.name || s.service_name,
                billing_cycle: updatedSub.billing_cycle || (updatedSub.frequency === 'annual' ? 'yearly' : 'monthly') || s.billing_cycle,
                renewal_date: updatedSub.renewal_date || updatedSub.nextBillingDate || s.renewal_date,
                payment_account: updatedSub.payment_account || updatedSub.accountId || s.payment_account,
                active: updatedSub.active ?? updatedSub.isActive ?? s.active
              };
            }
            return s;
          })
        }));
      },

      deleteSubscription: (id) => {
        set(state => ({
          subscriptions: state.subscriptions.filter(s => s.id !== id)
        }));
      },

      toggleSubscriptionActive: (id) => {
        set(state => ({
          subscriptions: state.subscriptions.map(s => {
            if (s.id === id) {
              const newActive = s.active !== undefined ? !s.active : !s.isActive;
              return { 
                ...s, 
                isActive: newActive, 
                active: newActive 
              };
            }
            return s;
          })
        }));
      },

      addGoal: (goal) => {
        const id = 'g-' + Math.random().toString(36).substring(2, 9);
        set(state => ({
          goals: [...state.goals, { ...goal, id }]
        }));
      },

      updateGoal: (updatedGoal) => {
        set(state => ({
          goals: state.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
        }));
      },

      deleteGoal: (id) => {
        set(state => ({
          goals: state.goals.filter(g => g.id !== id)
        }));
      },

      updatePreferences: (prefs) => {
        set(state => ({
          preferences: { ...state.preferences, ...prefs }
        }));
      },

      unlockAchievement: (id) => {
        set(state => ({
          achievements: state.achievements.map(ach => 
            ach.id === id ? { ...ach, isUnlocked: true, unlockedAt: new Date().toISOString().split('T')[0] } : ach
          )
        }));
      },

      setInsights: (insights) => {
        set({ insights });
      },

      addPaymentMethod: (pm) => {
        const id = 'pm-' + Math.random().toString(36).substring(2, 9);
        set(state => ({
          paymentMethods: [...state.paymentMethods, { ...pm, id }]
        }));
      },

      deletePaymentMethod: (id) => {
        set(state => ({
          paymentMethods: state.paymentMethods.filter(p => p.id !== id)
        }));
      },

      updatePaymentMethod: (updatedPm) => {
        set(state => ({
          paymentMethods: state.paymentMethods.map(p => p.id === updatedPm.id ? updatedPm : p)
        }));
      },
      
      recalculateStreak: () => {
        updateStreakAndAchievementsInternal(set, get, get().transactions);
      }
    }),
    {
      name: 'finance-os-storage',
      partialize: (state) => {
        const { isVaultsHydrated, ...rest } = state;
        return rest;
      },
    }
  )
);
