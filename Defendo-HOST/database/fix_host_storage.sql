-- Simple fix to ensure host data goes to host_profiles table
-- Run this in your Supabase SQL Editor

-- Step 1: Drop any existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create a simple trigger that ALWAYS creates host_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Always create host profile (this is a host-focused platform)
  INSERT INTO public.host_profiles (id, email, full_name, company_name, phone, address, services_offered)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    ARRAY[]::text[]
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 4: Migrate existing profiles to host_profiles
INSERT INTO public.host_profiles (id, email, full_name, company_name, phone, address, services_offered)
SELECT 
  id,
  email,
  COALESCE(full_name, split_part(email, '@', 1)) as full_name,
  COALESCE(company_name, '') as company_name,
  COALESCE(phone, '') as phone,
  COALESCE(address, '') as address,
  ARRAY[]::text[] as services_offered
FROM public.profiles
WHERE id NOT IN (SELECT id FROM public.host_profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verify the fix
SELECT 'Fix completed - all new signups will go to host_profiles' as status;
SELECT COUNT(*) as profiles_count FROM public.profiles;
SELECT COUNT(*) as host_profiles_count FROM public.host_profiles;
