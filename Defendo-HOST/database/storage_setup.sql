-- Supabase Storage Setup for KYC Documents
-- Run these commands in your Supabase SQL Editor

-- 1. Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'host-kyc-documents',
  'host-kyc-documents',
  false, -- Private bucket
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
);

-- 2. Create storage policies for the bucket

-- Policy: Hosts can upload their own KYC documents
CREATE POLICY "Hosts can upload their own KYC documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'host-kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Hosts can view their own KYC documents
CREATE POLICY "Hosts can view their own KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'host-kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Hosts can update their own KYC documents
CREATE POLICY "Hosts can update their own KYC documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'host-kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Hosts can delete their own KYC documents
CREATE POLICY "Hosts can delete their own KYC documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'host-kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Super admins can view all KYC documents
CREATE POLICY "Super admins can view all KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'host-kyc-documents' AND
  EXISTS (
    SELECT 1 FROM public.super_admins 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- 3. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;




















