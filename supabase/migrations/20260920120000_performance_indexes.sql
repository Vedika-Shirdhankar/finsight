-- FinSight Database Performance Optimization Migration
-- Adds targeted, non-redundant B-tree and composite indexes based on actual query patterns

-- 1. Accelerates filtering by account and ledger balance calculation per account
CREATE INDEX IF NOT EXISTS idx_transactions_account_id 
    ON public.transactions (account_id);

-- 2. Speeds up transaction type filtering (income vs expense vs transfer)
CREATE INDEX IF NOT EXISTS idx_transactions_type 
    ON public.transactions (type);

-- 3. Composite index: Speeds up dashboard expense vs income queries ordered by date
-- Query Pattern: SELECT * FROM transactions WHERE user_id =  AND type = 'expense' ORDER BY transaction_date DESC
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date 
    ON public.transactions (user_id, type, transaction_date DESC);

-- 4. Composite index: Speeds up category drift, anomaly detection, and budget tracking queries
-- Query Pattern: SELECT * FROM transactions WHERE user_id =  AND category_id =  ORDER BY transaction_date DESC
CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date 
    ON public.transactions (user_id, category_id, transaction_date DESC);

-- 5. Speeds up active recurring transactions lookup for 90-day cash flow projections
-- Query Pattern: SELECT * FROM recurring_transactions WHERE user_id =  AND is_active = true
CREATE INDEX IF NOT EXISTS idx_recurring_txns_user_active 
    ON public.recurring_transactions (user_id, is_active);

-- 6. Speeds up savings goals tracking by target date
-- Query Pattern: SELECT * FROM savings_goals WHERE user_id =  ORDER BY target_date ASC
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_target_date 
    ON public.savings_goals (user_id, target_date ASC);
