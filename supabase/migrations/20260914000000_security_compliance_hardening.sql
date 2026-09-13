-- FinSight Security & Compliance Hardening Migration
-- Enforces Strict Row-Level Security (RLS), Audit Trail Triggers, and Shared Account Member Access Control

-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policy: Users can only read their own audit logs
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2. Hardened RLS Policies on Shared Accounts
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;

-- Shared Account View Policy: User can view if owner or accepted member
CREATE POLICY "Strict Shared Account Member Isolation"
    ON public.account_members FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.accounts a 
            WHERE a.id = account_members.account_id AND a.user_id = auth.uid()
        )
    );

-- 3. Audit Trigger Function for Sensitive Transaction Edits & Deletions
CREATE OR REPLACE FUNCTION public.log_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
        VALUES (OLD.user_id, 'TRANSACTION_DELETE', 'transactions', OLD.id::text, row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
        VALUES (NEW.user_id, 'TRANSACTION_UPDATE', 'transactions', NEW.id::text, jsonb_build_object('old', row_to_json(OLD)::jsonb, 'new', row_to_json(NEW)::jsonb));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Audit Trigger to Transactions Table
DROP TRIGGER IF EXISTS trg_audit_transactions ON public.transactions;
CREATE TRIGGER trg_audit_transactions
    AFTER UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.log_transaction_changes();
