-- Role-based trigger to save data in correct table
-- Run this in your Supabase SQL Editor

-- Step 1: Create the role-based trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if user has role "host" in metadata
  IF NEW.raw_user_meta_data->>'role' = 'host' THEN
    -- Create host profile
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
  ELSE
    -- Create regular profile (fallback)
    INSERT INTO public.profiles (id, email, full_name, phone)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop old trigger and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 3: Migrate existing profiles to host_profiles (since this is a host-only platform)
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

-- Step 4: Verify the setup
SELECT 'Role-based trigger created successfully' as status;
SELECT COUNT(*) as profiles_count FROM public.profiles;
SELECT COUNT(*) as host_profiles_count FROM public.host_profiles;
