# COMMON CENTS DATABASE V1

## Philosophy

Common Cents tracks money.

Common Cents does not track identity.

No account numbers.
No UPI IDs.
No card numbers.
No banking credentials.

---

# ENTITY RELATIONSHIP

User
↓
Vaults
↓
Payment Methods
↓
Transactions
↓
Analytics

---

## USERS

Stores user preferences.

Fields:

- id
- display_name
- currency
- monthly_savings_goal
- category_threshold
- reminder_enabled
- reminder_time
- current_streak
- longest_streak
- last_logged_date
- created_at
- updated_at

---

## VAULTS

Vaults store money.

Types:

- bank
- cash
- investment
- credit
- asset
- liability

Fields:

- id
- user_id
- display_name
- type
- balance
- icon
- color
- active
- created_at
- updated_at

Examples:

- HDFC Savings
- SBI Savings
- Groww Portfolio
- Cash
- ICICI Credit Card

---

## PAYMENT METHODS

Payment methods access money.

Types:

- upi
- debit_card
- credit_card
- cash
- net_banking

Fields:

- id
- user_id
- vault_id
- display_name
- type
- icon
- color
- active
- created_at
- updated_at

Examples:

- Google Pay
- PhonePe
- HDFC Debit Card
- Cash

---

## TRANSACTIONS

Fields:

- id
- user_id
- vault_id
- payment_method_id
- date
- amount
- transaction_type
- description
- category
- notes
- tags
- status
- recurring
- recurring_frequency
- created_at
- updated_at

Transaction types:

- income
- expense
- transfer

- status

Statuses:

- completed
- pending
- failed

- tags

---

## BUDGETS

Fields:

- id
- user_id
- category
- limit_amount
- spent
- period
- created_at
- updated_at

Periods:

- weekly
- monthly

---

## SUBSCRIPTIONS

Fields:

- id
- user_id
- vault_id
- payment_method_id
- service_name
- amount
- billing_cycle
- renewal_date
- category
- active
- created_at
- updated_at

Billing cycles:

- monthly
- yearly

---

## GOALS

Fields:

- id
- user_id
- name
- target_amount
- current_amount
- deadline
- status
- created_at
- updated_at

Statuses:

- active
- paused
- completed

---

## ACHIEVEMENTS

Fields:

- id
- title
- description
- points
- icon

---

## USER_ACHIEVEMENTS

Fields:

- user_id
- achievement_id
- unlocked_at

## DESIGN PRINCIPLES

1. Vaults store money.
2. Payment methods access money.
3. Transactions create financial history.
4. Common Cents never stores banking credentials.
5. Analytics are derived from transactions.
6. Net worth is derived from vault balances.
7. The database must support local-first caching.
