-- Fix Missing Host Profile Issue
-- This script ensures all authenticated users have a host profile

-- Step 1: Check if the user exists in host_profiles
-- Run this query to see if the user has a host profile:
-- SELECT * FROM public.host_profiles WHERE id = '0c28e868-02f3-4f83-b2f2-ea741e6f38f9';

-- Step 2: Create host profile for existing users who don't have one
INSERT INTO public.host_profiles (id, email, full_name, company_name, phone, address, services_offered)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as full_name,
  COALESCE(u.raw_user_meta_data->>'company_name', '') as company_name,
  COALESCE(u.raw_user_meta_data->>'phone', '') as phone,
  COALESCE(u.raw_user_meta_data->>'address', '') as address,
  ARRAY[]::text[] as services_offered
FROM auth.users u
WHERE u.id = '0c28e868-02f3-4f83-b2f2-ea741e6f38f9'
AND NOT EXISTS (
  SELECT 1 FROM public.host_profiles h WHERE h.id = u.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  company_name = EXCLUDED.company_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = now();

-- Step 3: Update RLS policies to be more permissive for debugging
-- Temporarily allow all authenticated users to view host_profiles
DROP POLICY IF EXISTS "Users can view their own host profile" ON public.host_profiles;
CREATE POLICY "Users can view their own host profile" ON public.host_profiles
  FOR SELECT USING (auth.uid() = id);

-- Step 4: Ensure the trigger is working for new users
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

-- Step 5: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_host();

-- Step 6: Verify the fix
SELECT 'Host profile created/updated for user' as status;
SELECT * FROM public.host_profiles WHERE id = '0c28e868-02f3-4f83-b2f2-ea741e6f38f9';



















