-- Fix Super Admin Storage Access for KYC Documents
-- Run these commands in your Supabase SQL Editor

-- Step 1: Drop all existing storage policies for host-kyc-documents bucket
DROP POLICY IF EXISTS "Authenticated users can upload KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Hosts can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Hosts can view their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Hosts can update their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Hosts can delete their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can view all KYC documents" ON storage.objects;

-- Step 2: Create proper RLS policies for storage.objects

-- Policy 1: Hosts can upload their own KYC documents
CREATE POLICY "Hosts can upload own KYC documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Hosts can view their own KYC documents
CREATE POLICY "Hosts can view own KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Hosts can update their own KYC documents
CREATE POLICY "Hosts can update own KYC documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Hosts can delete their own KYC documents
CREATE POLICY "Hosts can delete own KYC documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Super admins can view ALL KYC documents (CRITICAL FOR ADMIN DASHBOARD)
CREATE POLICY "Super admins can view all KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.super_admins 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Policy 6: Super admins can update ALL KYC documents (for admin actions)
CREATE POLICY "Super admins can update all KYC documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.super_admins 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Step 3: Ensure the super_admins table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.super_admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'super_admin'::text,
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Step 4: Enable RLS on super_admins table
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for super_admins table
DROP POLICY IF EXISTS "Super admins can view all super_admins" ON public.super_admins;
DROP POLICY IF EXISTS "Super admins can insert" ON public.super_admins;
DROP POLICY IF EXISTS "Super admins can update" ON public.super_admins;
DROP POLICY IF EXISTS "Super admins can delete" ON public.super_admins;

-- Allow super admins to view all super admins
CREATE POLICY "Super admins can view all super_admins" ON public.super_admins
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid() AND is_active = true));

-- Allow super admins to insert new super admins
CREATE POLICY "Super admins can insert" ON public.super_admins
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid() AND is_active = true));

-- Allow super admins to update super admins
CREATE POLICY "Super admins can update" ON public.super_admins
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid() AND is_active = true));

-- Allow super admins to delete super admins
CREATE POLICY "Super admins can delete" ON public.super_admins
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid() AND is_active = true));

-- Step 6: Ensure the storage bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'host-kyc-documents',
  'host-kyc-documents',
  false, -- Private bucket
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

-- Step 7: Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Step 8: Create a test super admin if none exists
INSERT INTO public.super_admins (id, email, full_name, role, is_active)
VALUES (
  '0c28e868-02f3-4f83-b2f2-ea741e6f38f9', -- Replace with your actual user ID
  'admin@defendo.com',
  'Super Admin',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_active = true;

-- Step 9: Verify the setup
SELECT 'Storage policies created successfully' as status;
SELECT 'Super admin created/updated' as status;
SELECT * FROM public.super_admins WHERE id = '0c28e868-02f3-4f83-b2f2-ea741e6f38f9';


















