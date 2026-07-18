import type { PaymentMethod } from '../../types';
import type {
  PaymentMethodRow,
  PaymentMethodInsert,
  PaymentMethodUpdate,
} from './repositories/PaymentMethodRepository';

const dbTypeToFrontend: Record<string, PaymentMethod['type']> = {
  upi: 'upi',
  debit_card: 'debit',
  credit_card: 'credit',
  cash: 'cash',
  net_banking: 'netbanking',
};

const frontendTypeToDb: Record<PaymentMethod['type'], PaymentMethodRow['type']> = {
  upi: 'upi',
  debit: 'debit_card',
  credit: 'credit_card',
  cash: 'cash',
  netbanking: 'net_banking',
};

/**
 * Map a Supabase `payment_methods` row → Zustand `PaymentMethod`.
 */
export function paymentMethodRowToPaymentMethod(row: PaymentMethodRow): PaymentMethod {
  return {
    id: row.id,
    name: row.display_name,
    type: dbTypeToFrontend[row.type] ?? 'upi',
    accountId: row.vault_id,
    color: row.color ?? '#38BDF8',
    icon: row.icon ?? 'CreditCard',
  };
}

/**
 * Map a Zustand `PaymentMethod` (without id) → insert payload for the `payment_methods` table.
 */
export function paymentMethodToInsert(
  pm: Omit<PaymentMethod, 'id'>,
): PaymentMethodInsert {
  return {
    vault_id: pm.accountId,
    display_name: pm.name,
    type: frontendTypeToDb[pm.type],
    color: pm.color,
    icon: pm.icon,
  };
}

/**
 * Map a full Zustand `PaymentMethod` → update payload for the `payment_methods` table.
 */
export function paymentMethodToUpdate(pm: PaymentMethod): PaymentMethodUpdate {
  return {
    vault_id: pm.accountId,
    display_name: pm.name,
    type: frontendTypeToDb[pm.type],
    color: pm.color,
    icon: pm.icon,
  };
}
