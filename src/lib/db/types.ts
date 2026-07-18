import type { Account, AccountType } from '../../types';

/**
 * Row shape returned by Supabase from the `vaults` table.
 * Column names match the PostgreSQL schema (snake_case).
 */
export interface VaultRow {
  id: string;
  user_id: string;
  display_name: string;
  type: AccountType;
  balance: number;
  icon: string | null;
  color: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for inserting a new vault row.
 * Omits server-managed fields: id, user_id, created_at, updated_at.
 * user_id is injected by the repository at call time.
 */
export interface VaultInsert {
  display_name: string;
  type: AccountType;
  balance: number;
  icon?: string | null;
  color?: string | null;
}

/**
 * Payload for updating an existing vault row.
 * All fields are optional; only provided fields are sent to the DB.
 */
export interface VaultUpdate {
  display_name?: string;
  type?: AccountType;
  balance?: number;
  icon?: string | null;
  color?: string | null;
  active?: boolean;
}

/** Map a Supabase `vaults` row → Zustand `Account`. */
export function vaultRowToAccount(row: VaultRow): Account {
  return {
    id: row.id,
    name: row.display_name,
    type: row.type,
    balance: row.balance,
    color: row.color ?? '#38BDF8',
    icon: row.icon ?? 'Landmark',
  };
}

/** Map a Zustand `Account` (without id) → insert payload for the `vaults` table. */
export function accountToVaultInsert(
  account: Omit<Account, 'id'>,
): VaultInsert {
  return {
    display_name: account.name,
    type: account.type,
    balance: account.balance,
    color: account.color,
    icon: account.icon,
  };
}

/** Map a full Zustand `Account` → update payload for the `vaults` table. */
export function accountToVaultUpdate(account: Account): VaultUpdate {
  return {
    display_name: account.name,
    type: account.type,
    color: account.color,
    icon: account.icon,
  };
}
