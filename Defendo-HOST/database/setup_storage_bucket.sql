-- Setup Supabase Storage bucket for service images
-- Run this in your Supabase SQL Editor

-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload service images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to service images
CREATE POLICY "Public can view service images" ON storage.objects
FOR SELECT USING (bucket_id = 'service-images');

-- Allow users to update their own service images
CREATE POLICY "Users can update their own service images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own service images
CREATE POLICY "Users can delete their own service images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'service-images';
