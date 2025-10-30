-- Fix Storage RLS Policies for KYC Documents
-- Run these commands in your Supabase SQL Editor

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Hosts can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Hosts can view their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Hosts can update their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Hosts can delete their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can view all KYC documents" ON storage.objects;

-- Create more permissive policies for authenticated users
-- Policy: Authenticated users can upload to host-kyc-documents bucket
CREATE POLICY "Authenticated users can upload KYC documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated'
);

-- Policy: Authenticated users can view KYC documents
CREATE POLICY "Authenticated users can view KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated'
);

-- Policy: Authenticated users can update KYC documents
CREATE POLICY "Authenticated users can update KYC documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated'
);

-- Policy: Authenticated users can delete KYC documents
CREATE POLICY "Authenticated users can delete KYC documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'host-kyc-documents' AND
  auth.role() = 'authenticated'
);

-- Alternative: More secure policies with user ID validation
-- Uncomment these if you want more restrictive access:

/*
-- Policy: Hosts can upload their own KYC documents (more secure)
CREATE POLICY "Hosts can upload their own KYC documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'host-kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Hosts can view their own KYC documents (more secure)
CREATE POLICY "Hosts can view their own KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'host-kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Super admins can view all KYC documents (more secure)
CREATE POLICY "Super admins can view all KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'host-kyc-documents' AND
  EXISTS (
    SELECT 1 FROM public.super_admins 
    WHERE id = auth.uid() AND is_active = true
  )
);
*/

-- Ensure the bucket exists and is properly configured
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

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;


































