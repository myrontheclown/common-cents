-- 
-- FINANCE.OS production PostgreSQL Database Schema
-- Optimized for high-throughput transactional ledger and fast analytical queries
--

-- Enable UUID extension for secure, non-sequential primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users (Stores user preferences and authentication reference)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) DEFAULT 'Alex Mercer',
    currency VARCHAR(10) DEFAULT 'USD',
    monthly_savings_goal NUMERIC(12, 2) DEFAULT 2500.00,
    category_threshold INTEGER DEFAULT 80, -- Budget alert percentage (e.g. 80%)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: accounts (Asset and debt accounts: Bank, Investment, Cash, Credit)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('bank', 'investment', 'cash', 'credit')),
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    color VARCHAR(30) NOT NULL, -- Visual theme color class
    icon VARCHAR(50) NOT NULL,  -- Lucide icon lookup string
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: transactions (Double-entry compatible cashflow ledger)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12, 2) NOT NULL, -- Stored as positive absolute value
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_pending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: budgets (Monthly or weekly limit allocations per spend category)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount_limit NUMERIC(12, 2) NOT NULL,
    period VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'weekly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, category, period)
);

-- Table: subscriptions (Recurring active debits mapping to accounts)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'annual')),
    next_billing_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: goals (Financial targets and savings goals)
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deadline DATE,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: achievements (Gamified saving milestones)
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY, -- Static string IDs like 'ach-1', 'ach-2'
    title VARCHAR(150) NOT NULL,
    description VARCHAR(255) NOT NULL,
    points INTEGER NOT NULL DEFAULT 100,
    icon VARCHAR(50) NOT NULL
);

-- Table: user_achievements (User-unlocked accomplishments)
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

--
-- PERFORMANCE INDEXING (Crucial for query efficiency and scalability)
--

-- Ledger searches & filters
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);

-- Subscriptions due dates
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_due ON subscriptions(next_billing_date) WHERE is_active = TRUE;

-- Budget tracking queries
CREATE INDEX IF NOT EXISTS idx_budgets_user_category ON budgets(user_id, category);

--
-- AUTOMATIC UPDATES (Triggers to keep balances/updated_at synced)
--

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger applications for updated_at
CREATE TRIGGER tg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER tg_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER tg_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER tg_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER tg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER tg_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- SEEDING DEFAULT STATIC ACHIEVEMENTS
INSERT INTO achievements (id, title, description, points, icon) VALUES
('ach-1', 'Aesthetic Saver', 'Saved more than 40% of income this month', 150, 'Sparkles')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO achievements (id, title, description, points, icon) VALUES
('ach-2', 'Subscription Slayer', 'Cancelled 3 or more inactive subscriptions', 200, 'Flame')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO achievements (id, title, description, points, icon) VALUES
('ach-3', 'Budget Tactician', 'Stayed 100% under budget in all categories', 250, 'ShieldAlert')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO achievements (id, title, description, points, icon) VALUES
('ach-4', 'Velocity Limit', 'Saved $10k inside your checking account', 300, 'Zap')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
