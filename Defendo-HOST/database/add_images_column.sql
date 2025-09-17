-- Add images column to host_services table
-- Run this in your Supabase SQL Editor

-- Add images column to store array of image URLs
ALTER TABLE public.host_services 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Add comment to the column
COMMENT ON COLUMN public.host_services.images IS 'Array of image URLs from Supabase Storage';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'host_services' 
AND column_name = 'images';

-- Show current data structure
SELECT id, service_name, images FROM public.host_services LIMIT 5;
