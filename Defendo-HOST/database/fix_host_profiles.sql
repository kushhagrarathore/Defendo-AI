-- Fix existing database to use host_profiles instead of profiles
-- Run this in your Supabase SQL Editor

-- First, let's check if there are any existing profiles that need to be migrated
-- and create host_profiles for them

-- Migrate existing profiles to host_profiles
INSERT INTO public.host_profiles (id, email, full_name, company_name, phone, address, services_offered)
SELECT 
  id,
  email,
  COALESCE(full_name, split_part(email, '@', 1)) as full_name,
  '' as company_name, -- Set empty company name for existing users
  COALESCE(phone, '') as phone,
  '' as address, -- Set empty address for existing users
  ARRAY[]::text[] as services_offered
FROM public.profiles
WHERE id NOT IN (SELECT id FROM public.host_profiles);

-- Update the trigger function to only create host_profiles
CREATE OR REPLACE FUNCTION public.handle_new_host()
RETURNS trigger AS $$
BEGIN
  -- Always create host profile for new users (this is a host-only platform)
  INSERT INTO public.host_profiles (id, email, full_name, company_name, phone, address, services_offered)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    ARRAY[]::text[] -- Initialize empty services array
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger and create the new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_host();

-- Optional: Drop the profiles table if you want to completely remove it
-- (Only do this after confirming host_profiles migration worked)
-- DROP TABLE IF EXISTS public.profiles;
