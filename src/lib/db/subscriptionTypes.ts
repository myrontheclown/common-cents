import type { Subscription } from '../../types';
import type {
  SubscriptionRow,
  SubscriptionInsert,
  SubscriptionUpdate,
} from './repositories/SubscriptionRepository';

export function subscriptionRowToSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    service_name: row.service_name,
    amount: row.amount,
    billing_cycle: row.billing_cycle,
    category: row.category ?? '',
    payment_account: row.vault_id ?? '',
    renewal_date: row.renewal_date,
    auto_debit: true,
    active: row.active,
    icon: 'CreditCard',
    color: '#38BDF8',
  };
}

export function subscriptionToInsert(
  sub: Omit<Subscription, 'id'>,
): SubscriptionInsert {
  return {
    service_name: sub.service_name,
    amount: sub.amount,
    billing_cycle: sub.billing_cycle,
    renewal_date: sub.renewal_date,
    vault_id: sub.payment_account || null,
    category: sub.category || null,
    active: sub.active,
  };
}

export function subscriptionToUpdate(
  sub: Subscription,
): SubscriptionUpdate {
  return {
    service_name: sub.service_name,
    amount: sub.amount,
    billing_cycle: sub.billing_cycle,
    renewal_date: sub.renewal_date,
    vault_id: sub.payment_account || null,
    category: sub.category || null,
    active: sub.active,
  };
}
