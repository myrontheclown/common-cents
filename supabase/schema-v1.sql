--
-- COMMON CENTS DATABASE V1
-- PostgreSQL / Supabase Schema
--

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
-- USERS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    email TEXT UNIQUE NOT NULL,

    display_name VARCHAR(100) NOT NULL DEFAULT 'Myron',

    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    monthly_savings_goal NUMERIC(12,2) DEFAULT 0,

    category_threshold INTEGER DEFAULT 80,

    reminder_enabled BOOLEAN DEFAULT TRUE,

    reminder_time TIME DEFAULT '21:30:00',

    current_streak INTEGER DEFAULT 0,

    longest_streak INTEGER DEFAULT 0,

    last_logged_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- VAULTS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    display_name VARCHAR(100) NOT NULL,

    type VARCHAR(20) NOT NULL
        CHECK (
            type IN (
                'bank',
                'cash',
                'investment',
                'credit',
                'asset',
                'liability'
            )
        ),

    balance NUMERIC(15,2)
    DEFAULT 0
    NOT NULL,

    icon VARCHAR(50),

    color VARCHAR(50),

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- PAYMENT METHODS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    favorite BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    vault_id UUID NOT NULL
        REFERENCES vaults(id)
        ON DELETE CASCADE,

    display_name VARCHAR(100) NOT NULL,

    type VARCHAR(30) NOT NULL
        CHECK (
            type IN (
                'upi',
                'debit_card',
                'credit_card',
                'cash',
                'net_banking'
            )
        ),

    icon VARCHAR(50),

    color VARCHAR(50),

    active BOOLEAN DEFAULT TRUE,

    favorite BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- TRANSACTIONS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    transaction_time TIMESTAMPTZ
    DEFAULT NOW(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    vault_id UUID NOT NULL
        REFERENCES vaults(id)
        ON DELETE CASCADE,

    payment_method_id UUID
        REFERENCES payment_methods(id)
        ON DELETE SET NULL,

    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),

    transaction_type VARCHAR(20) NOT NULL
        CHECK (
            transaction_type IN (
                'income',
                'expense',
                'transfer'
            )
        ),

    description VARCHAR(255) NOT NULL,

    category VARCHAR(100) NOT NULL,

    notes TEXT,

    tags TEXT[] DEFAULT '{}',

    status VARCHAR(20) DEFAULT 'completed'
        CHECK (
            status IN (
                'completed',
                'pending',
                'failed'
            )
        ),

    recurring BOOLEAN DEFAULT FALSE,

    recurring_frequency VARCHAR(20)
        CHECK (
            recurring_frequency IN (
                'daily',
                'weekly',
                'monthly',
                'yearly'
            )
        ),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- BUDGETS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    category VARCHAR(100) NOT NULL,

    limit_amount NUMERIC(15,2) NOT NULL,

    spent NUMERIC(15,2) DEFAULT 0,

    period VARCHAR(20) DEFAULT 'monthly'
        CHECK (
            period IN (
                'weekly',
                'monthly'
            )
        ),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, category, period)
);

--------------------------------------------------
-- SUBSCRIPTIONS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    vault_id UUID
        REFERENCES vaults(id)
        ON DELETE SET NULL,

    payment_method_id UUID
        REFERENCES payment_methods(id)
        ON DELETE SET NULL,

    service_name VARCHAR(100) NOT NULL,

    amount NUMERIC(15,2) NOT NULL,

    billing_cycle VARCHAR(20) DEFAULT 'monthly'
        CHECK (
            billing_cycle IN (
                'monthly',
                'yearly'
            )
        ),

    renewal_date DATE NOT NULL,

    category VARCHAR(100),

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- GOALS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,

    target_amount NUMERIC(15,2) NOT NULL,

    current_amount NUMERIC(15,2) DEFAULT 0,

    deadline DATE,

    status VARCHAR(20) DEFAULT 'active'
        CHECK (
            status IN (
                'active',
                'paused',
                'completed'
            )
        ),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- ACHIEVEMENTS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,

    title VARCHAR(150) NOT NULL,

    description TEXT NOT NULL,

    points INTEGER DEFAULT 100,

    icon VARCHAR(50)
);

--------------------------------------------------
-- USER ACHIEVEMENTS
--------------------------------------------------

CREATE TABLE IF NOT EXISTS user_achievements (
    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    achievement_id VARCHAR(50) NOT NULL
        REFERENCES achievements(id)
        ON DELETE CASCADE,

    unlocked_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY(user_id, achievement_id)
);

--------------------------------------------------
-- PERFORMANCE INDEXES
--------------------------------------------------

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user
ON transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date
ON transactions(transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category
ON transactions(category);

CREATE INDEX IF NOT EXISTS idx_transactions_vault
ON transactions(vault_id);

CREATE INDEX IF NOT EXISTS idx_transactions_payment_method
ON transactions(payment_method_id);

-- Vaults
CREATE INDEX IF NOT EXISTS idx_vaults_user
ON vaults(user_id);

-- Payment Methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user
ON payment_methods(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_vault
ON payment_methods(vault_id);

-- Budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user
ON budgets(user_id);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user
ON subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal
ON subscriptions(renewal_date);

-- Goals
CREATE INDEX IF NOT EXISTS idx_goals_user
ON goals(user_id);

--------------------------------------------------
-- UPDATED_AT TRIGGERS
--------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tg_vaults_updated
BEFORE UPDATE ON vaults
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tg_payment_methods_updated
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tg_transactions_updated
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tg_budgets_updated
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tg_subscriptions_updated
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tg_goals_updated
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


--------------------------------------------------
-- DEFAULT ACHIEVEMENTS
--------------------------------------------------

INSERT INTO achievements VALUES
(
    'first-entry',
    'First Entry',
    'Log your first transaction',
    50,
    'Receipt'
)
ON CONFLICT DO NOTHING;

INSERT INTO achievements VALUES
(
    'week-streak',
    'One Week Strong',
    'Maintain a 7-day logging streak',
    100,
    'Flame'
)
ON CONFLICT DO NOTHING;

INSERT INTO achievements VALUES
(
    'month-streak',
    'Monthly Discipline',
    'Maintain a 30-day logging streak',
    250,
    'Award'
)
ON CONFLICT DO NOTHING;

INSERT INTO achievements VALUES
(
    'hundred-streak',
    'Financial Archivist',
    'Maintain a 100-day logging streak',
    500,
    'Trophy'
)
ON CONFLICT DO NOTHING;

INSERT INTO achievements VALUES
(
    'budget-master',
    'Budget Tactician',
    'Stay under budget for every category',
    300,
    'Shield'
)
ON CONFLICT DO NOTHING;