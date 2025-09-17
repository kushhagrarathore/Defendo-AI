-- Add location column to host_services table
-- Run this in your Supabase SQL Editor

-- Add location column to host_services table
ALTER TABLE public.host_services 
ADD COLUMN IF NOT EXISTS location text;

-- Update existing records with sample location data
UPDATE public.host_services 
SET location = 'Mumbai, Maharashtra'
WHERE location IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.host_services.location IS 'Service location in format: City, State';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'host_services' 
AND column_name = 'location';

-- Show current data
SELECT id, name, location FROM public.host_services;
