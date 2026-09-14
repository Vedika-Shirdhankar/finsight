-- FinSight Production Audit Log System Migration
-- Establishes immutable, append-only audit trail logging with strict RLS and performance indexes

-- 1. Create or update audit_logs table schema
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    old_data JSONB DEFAULT NULL,
    new_data JSONB DEFAULT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist (migration compatibility)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'resource_type') THEN
        ALTER TABLE public.audit_logs ADD COLUMN resource_type TEXT NOT NULL DEFAULT 'transaction';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'resource_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN resource_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'old_data') THEN
        ALTER TABLE public.audit_logs ADD COLUMN old_data JSONB DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'new_data') THEN
        ALTER TABLE public.audit_logs ADD COLUMN new_data JSONB DEFAULT NULL;
    END IF;
END $$;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop obsolete or permissive policies if present
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can update own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can delete own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users and admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can append own audit logs" ON public.audit_logs;

-- Policy 1: SELECT (Users can read their own logs; Admins can read all logs)
CREATE POLICY "Users and admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy 2: INSERT (Authenticated users can append audit logs for their own user_id)
CREATE POLICY "Users can append own audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- IMPORTANT: NO UPDATE OR DELETE POLICIES CREATED
-- Audit logs are strictly append-only from the application perspective.

-- 3. Create Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs (resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);

-- Composite Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_created ON public.audit_logs (resource_type, created_at DESC);

-- 4. Server-Side Paginated & Filtered Audit Retrieval RPC
CREATE OR REPLACE FUNCTION public.get_audit_logs(
    p_user_id UUID DEFAULT NULL,
    p_action TEXT DEFAULT NULL,
    p_resource_type TEXT DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_page INT DEFAULT 1,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    action TEXT,
    resource_type TEXT,
    resource_id TEXT,
    old_data JSONB,
    new_data JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    total_count BIGINT
) 
SECURITY DEFINER
AS $$
DECLARE
    v_offset INT;
    v_total BIGINT;
    v_caller_is_admin BOOLEAN;
BEGIN
    v_offset := (GREATEST(p_page, 1) - 1) * GREATEST(p_limit, 1);
    
    -- Check if calling user is admin via user_roles table
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO v_caller_is_admin;

    -- Count total matching rows
    SELECT COUNT(*) INTO v_total
    FROM public.audit_logs a
    WHERE (
        v_caller_is_admin OR a.user_id = auth.uid()
    )
    AND (p_user_id IS NULL OR a.user_id = p_user_id)
    AND (p_action IS NULL OR p_action = '' OR a.action = p_action)
    AND (p_resource_type IS NULL OR p_resource_type = '' OR a.resource_type = p_resource_type)
    AND (p_start_date IS NULL OR a.created_at >= p_start_date)
    AND (p_end_date IS NULL OR a.created_at <= p_end_date)
    AND (
        p_search IS NULL OR p_search = '' 
        OR a.resource_id ILIKE '%' || p_search || '%'
        OR a.action ILIKE '%' || p_search || '%'
        OR a.resource_type ILIKE '%' || p_search || '%'
        OR a.metadata::text ILIKE '%' || p_search || '%'
    );

    -- Return paginated records
    RETURN QUERY
    SELECT 
        a.id,
        a.user_id,
        a.action,
        a.resource_type,
        a.resource_id,
        a.old_data,
        a.new_data,
        a.metadata,
        a.created_at,
        v_total AS total_count
    FROM public.audit_logs a
    WHERE (
        v_caller_is_admin OR a.user_id = auth.uid()
    )
    AND (p_user_id IS NULL OR a.user_id = p_user_id)
    AND (p_action IS NULL OR p_action = '' OR a.action = p_action)
    AND (p_resource_type IS NULL OR p_resource_type = '' OR a.resource_type = p_resource_type)
    AND (p_start_date IS NULL OR a.created_at >= p_start_date)
    AND (p_end_date IS NULL OR a.created_at <= p_end_date)
    AND (
        p_search IS NULL OR p_search = '' 
        OR a.resource_id ILIKE '%' || p_search || '%'
        OR a.action ILIKE '%' || p_search || '%'
        OR a.resource_type ILIKE '%' || p_search || '%'
        OR a.metadata::text ILIKE '%' || p_search || '%'
    )
    ORDER BY a.created_at DESC
    LIMIT GREATEST(p_limit, 1)
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;
