import type { Transaction } from '../../types';
import type { TransactionRow, TransactionInsert, TransactionUpdate } from './repositories/TransactionRepository';

/**
 * Map a Supabase `transactions` row → Zustand `Transaction`.
 *
 * @throws {Error} If the row has transaction_type === 'transfer',
 *   which the frontend does not support.
 */
export function transactionRowToTransaction(row: TransactionRow): Transaction {
  if (row.transaction_type === 'transfer') {
    throw new Error('Transfer transactions are not supported in the frontend');
  }

  return {
    id: row.id,
    date: row.transaction_time.split('T')[0],
    amount: row.amount,
    description: row.description,
    category: row.category,
    type: row.transaction_type,
    accountId: row.vault_id,
    paymentMethodId: row.payment_method_id ?? undefined,
  };
}

/**
 * Map a Zustand `Transaction` (without id) → insert payload for the `transactions` table.
 * Fields that have database defaults (tags, status, recurring, etc.) are omitted.
 */
export function transactionToInsert(
  tx: Omit<Transaction, 'id'>,
): TransactionInsert {
  return {
    vault_id: tx.accountId,
    payment_method_id: tx.paymentMethodId ?? null,
    transaction_time: `${tx.date}T00:00:00Z`,
    amount: tx.amount,
    transaction_type: tx.type,
    description: tx.description,
    category: tx.category,
  };
}

/**
 * Map a full Zustand `Transaction` → update payload for the `transactions` table.
 * Fields that have database defaults (tags, status, recurring, etc.) are omitted.
 */
export function transactionToUpdate(tx: Transaction): TransactionUpdate {
  return {
    vault_id: tx.accountId,
    payment_method_id: tx.paymentMethodId ?? null,
    transaction_time: `${tx.date}T00:00:00Z`,
    amount: tx.amount,
    transaction_type: tx.type,
    description: tx.description,
    category: tx.category,
  };
}
