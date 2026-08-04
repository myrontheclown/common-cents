import type { BillingCycle, Subscription } from '../types';

export const BILLING_CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'half_yearly', 'yearly'];

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half-Yearly',
  yearly: 'Yearly',
};

export function getBillingCycle(sub: {
  billing_cycle?: BillingCycle | string;
  frequency?: string;
}): BillingCycle {
  const bc = sub.billing_cycle;
  if (bc === 'monthly' || bc === 'quarterly' || bc === 'half_yearly' || bc === 'yearly') {
    return bc;
  }
  if (sub.frequency === 'annual' || sub.frequency === 'yearly') {
    return 'yearly';
  }
  return 'monthly';
}

export function cycleMonths(cycle: BillingCycle): number {
  switch (cycle) {
    case 'quarterly':
      return 3;
    case 'half_yearly':
      return 6;
    case 'yearly':
      return 12;
    case 'monthly':
    default:
      return 1;
  }
}

export function cycleLabel(cycle: BillingCycle): string {
  return CYCLE_LABELS[cycle] || CYCLE_LABELS.monthly;
}

export function monthlyEquivalent(amount: number, cycle: BillingCycle): number {
  const months = cycleMonths(cycle);
  return months > 0 ? amount / months : amount;
}

export function yearlyEquivalent(amount: number, cycle: BillingCycle): number {
  return monthlyEquivalent(amount, cycle) * 12;
}

function toLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function advanceRenewalDate(dateStr: string, cycle: BillingCycle): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = cycleMonths(cycle);
  const targetDay = d;

  const targetMonth = (m - 1) + months;
  const targetYear = y + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;

  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const clampedDay = Math.min(targetDay, lastDay);
  const result = new Date(targetYear, normalizedMonth, clampedDay);

  const yy = result.getFullYear();
  const mm = String(result.getMonth() + 1).padStart(2, '0');
  const dd = String(result.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function daysUntil(dateStr: string, todayStr: string): number {
  const target = toLocalDate(dateStr).getTime();
  const today = toLocalDate(todayStr).getTime();
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export interface SubscriptionStatus {
  key: 'paused' | 'upcoming' | 'due_today' | 'overdue' | 'paid' | 'active';
  label: string;
  textClass: string;
  bgClass: string;
  progressClass: string;
}

export function getSubscriptionStatus(
  sub: Subscription,
  todayStr?: string,
): SubscriptionStatus {
  const today = todayStr ?? new Date().toISOString().split('T')[0];
  const isActive = sub.active ?? sub.isActive ?? true;

  if (!isActive) {
    return {
      key: 'paused',
      label: 'PAUSED',
      textClass: 'text-[var(--text-muted)]',
      bgClass: 'bg-[var(--bg-muted)]',
      progressClass: '#9CA3AF',
    };
  }

  const renewal = sub.renewal_date || sub.nextBillingDate || '';
  if (!renewal) {
    return {
      key: 'upcoming',
      label: 'UPCOMING',
      textClass: 'text-green-600',
      bgClass: 'bg-green-100',
      progressClass: '#22C55E',
    };
  }

  const diffDays = daysUntil(renewal, today);

  if (sub.lastPaidDate === today) {
    return {
      key: 'paid',
      label: 'PAID',
      textClass: 'text-green-700',
      bgClass: 'bg-green-100',
      progressClass: '#22C55E',
    };
  }

  if (diffDays < 0) {
    const n = Math.abs(diffDays);
    return {
      key: 'overdue',
      label: `Overdue by ${n} day${n !== 1 ? 's' : ''}`,
      textClass: 'text-red-600',
      bgClass: 'bg-red-100',
      progressClass: '#DC5C5C',
    };
  }

  if (diffDays === 0) {
    return {
      key: 'due_today',
      label: 'Due Today',
      textClass: 'text-orange-600',
      bgClass: 'bg-orange-100',
      progressClass: '#F59E0B',
    };
  }

  const suffix = `Renews in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  if (sub.lastPaidDate) {
    return {
      key: 'active',
      label: `Active · ${suffix}`,
      textClass: 'text-green-600',
      bgClass: 'bg-green-100',
      progressClass: '#22C55E',
    };
  }

  return {
    key: 'upcoming',
    label: suffix,
    textClass: 'text-green-600',
    bgClass: 'bg-green-100',
    progressClass: '#22C55E',
  };
}

export function getSubscriptionProgress(
  sub: Subscription,
  todayStr?: string,
): number {
  const today = todayStr ?? new Date().toISOString().split('T')[0];
  const renewal = sub.renewal_date || sub.nextBillingDate || '';
  if (!renewal) return 0;

  const cycle = getBillingCycle(sub);
  const months = cycleMonths(cycle);
  const renewalDate = toLocalDate(renewal);
  const lastRenewal = new Date(renewalDate);
  lastRenewal.setMonth(lastRenewal.getMonth() - months);

  const totalMs = renewalDate.getTime() - lastRenewal.getTime();
  const elapsedMs = toLocalDate(today).getTime() - lastRenewal.getTime();
  if (totalMs <= 0) return 0;

  return Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
}

export function subscriptionMonthlyCost(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(s => s.active ?? s.isActive ?? true)
    .reduce((sum, s) => sum + monthlyEquivalent(s.amount, getBillingCycle(s)), 0);
}
