-- Super Admins Table Schema
-- This table stores admin users who can access the admin dashboard

CREATE TABLE IF NOT EXISTS public.super_admins (
    id uuid NOT NULL,
    email text NOT NULL UNIQUE,
    full_name text NOT NULL,
    role text DEFAULT 'super_admin'::text,
    permissions jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    last_login timestamp with time zone,
    created_by uuid,
    CONSTRAINT super_admins_pkey PRIMARY KEY (id),
    CONSTRAINT super_admins_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
    CONSTRAINT super_admins_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.super_admins(id)
);

-- Enable RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for super_admins
-- Only super admins can read/write super admin records
CREATE POLICY "Super admins can view all super admin records" ON public.super_admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Super admins can insert super admin records" ON public.super_admins
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Super admins can update super admin records" ON public.super_admins
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);
CREATE INDEX IF NOT EXISTS idx_super_admins_active ON public.super_admins(is_active) WHERE is_active = true;

-- Grant permissions
GRANT ALL ON public.super_admins TO authenticated;
GRANT ALL ON public.super_admins TO service_role;

-- Example: Insert a super admin (replace with actual admin user ID)
-- INSERT INTO public.super_admins (id, email, full_name, role, permissions)
-- VALUES (
--     'your-admin-user-id-here',
--     'admin@defendo.com',
--     'System Administrator',
--     'super_admin',
--     '{"kyc_verify": true, "user_management": true, "system_settings": true}'::jsonb
-- );





















