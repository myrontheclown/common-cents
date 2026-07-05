/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AccountType = 'bank' | 'cash' | 'investment' | 'credit' | 'asset' | 'liability';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string; // Tailwind bg color class or raw color hex (e.g. '#FF6B6B')
  icon: string;  // Icon name from lucide-react
}

export type PaymentMethodType = 'upi' | 'debit' | 'credit' | 'cash' | 'netbanking';

export interface PaymentMethod {
  id: string;
  name: string; // Display Name, e.g. "Google Pay"
  type: PaymentMethodType;
  accountId: string; // Linked Vault (Account) ID
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO string 'YYYY-MM-DD'
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  accountId: string;
  paymentMethodId?: string; // LINKED PAYMENT METHOD
  isPending?: boolean;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
}

export interface Subscription {
  id: string;
  // Required fields for the new entity
  service_name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  category: string;
  payment_account: string;
  renewal_date: string;
  auto_debit: boolean;
  active: boolean;
  icon: string;
  color: string;

  // Backward compatibility fields
  name?: string;
  frequency?: 'monthly' | 'annual' | 'yearly';
  nextBillingDate?: string;
  accountId?: string;
  isActive?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: 'active' | 'completed' | 'paused';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  icon: string;
  points: number;
}

export interface AIInsight {
  id: string;
  date: string;
  type: 'tip' | 'warning' | 'celebration' | 'analysis';
  title: string;
  summary: string;
  detail: string;
  impactValue?: string;
  actionableStep?: string;
}

export interface UserPreferences {
  name: string;
  currency: string;
  monthlySavingsGoal: number;
  categoryThreshold: number; // Spend threshold percentage (e.g., 80)
  theme: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  currentStreak?: number;
  longestStreak?: number;
  lastLoggedDate?: string;
}

export interface WrappedSlide {
  id: string;
  title: string;
  subtitle: string;
  type: 'intro' | 'networth' | 'spending' | 'biggest_expense' | 'personality' | 'summary';
  stats?: Record<string, string | number>;
  colorTheme: string; // e.g. '#FFDE4D'
}
