-- Ensure all user data goes to host_profiles table
-- Run this in your Supabase SQL Editor

-- Step 1: Migrate any existing profiles to host_profiles
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

-- Step 2: Create or replace the trigger function to ONLY create host_profiles
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

-- Step 3: Drop any existing triggers and create the new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_host();

-- Step 4: Disable RLS on profiles table to prevent new inserts
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 5: Create a policy to prevent new inserts into profiles
DROP POLICY IF EXISTS "Prevent new profiles" ON public.profiles;
CREATE POLICY "Prevent new profiles" ON public.profiles
  FOR INSERT WITH CHECK (false);

-- Step 6: Verify the setup
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as profiles_count FROM public.profiles;
SELECT COUNT(*) as host_profiles_count FROM public.host_profiles;
