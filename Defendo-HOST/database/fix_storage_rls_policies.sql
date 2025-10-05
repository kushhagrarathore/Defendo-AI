-- Fix storage RLS policies for guard_services bucket

-- First, let's check if the guard_services bucket exists and create it if needed
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('guard_services', 'guard_services', false, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('service-images', 'service-images', false, 52428800, ARRAY['image/*']),
  ('host-kyc-documents', 'host-kyc-documents', false, 52428800, ARRAY['image/*', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload guard images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view guard images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update guard images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete guard images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view service images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view KYC documents" ON storage.objects;

-- Create storage policies for guard_services bucket
CREATE POLICY "Allow authenticated users to upload guard images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'guard_services' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view guard images" ON storage.objects
  FOR SELECT USING (bucket_id = 'guard_services' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update guard images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'guard_services' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete guard images" ON storage.objects
  FOR DELETE USING (bucket_id = 'guard_services' AND auth.role() = 'authenticated');

-- Create storage policies for service-images bucket
CREATE POLICY "Allow authenticated users to upload service images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'service-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view service images" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-images' AND auth.role() = 'authenticated');

-- Create storage policies for host-kyc-documents bucket
CREATE POLICY "Allow authenticated users to upload KYC documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'host-kyc-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view KYC documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'host-kyc-documents' AND auth.role() = 'authenticated');

-- Grant storage permissions
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;
