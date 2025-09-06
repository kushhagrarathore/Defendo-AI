-- Update database schema to properly use host_profiles
-- Run this in your Supabase SQL Editor

-- Step 1: Update bookings table to reference host_profiles
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_provider_id_fkey;

-- Rename columns to be more clear
ALTER TABLE public.bookings     
RENAME COLUMN user_id TO client_id;

ALTER TABLE public.bookings 
RENAME COLUMN provider_id TO host_id;

-- Add new foreign key constraints
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES public.host_profiles(id);

-- Step 2: Update emergency_contacts table
ALTER TABLE public.emergency_contacts 
DROP CONSTRAINT IF EXISTS emergency_contacts_user_id_fkey;

ALTER TABLE public.emergency_contacts 
RENAME COLUMN user_id TO host_id;

ALTER TABLE public.emergency_contacts 
ADD CONSTRAINT emergency_contacts_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES public.host_profiles(id);

-- Step 3: Update location_history table
ALTER TABLE public.location_history 
DROP CONSTRAINT IF EXISTS location_history_user_id_fkey;

ALTER TABLE public.location_history 
RENAME COLUMN user_id TO host_id;

ALTER TABLE public.location_history 
ADD CONSTRAINT location_history_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES public.host_profiles(id);

-- Step 4: Update sos_alerts table
ALTER TABLE public.sos_alerts 
DROP CONSTRAINT IF EXISTS sos_alerts_user_id_fkey;

ALTER TABLE public.sos_alerts 
RENAME COLUMN user_id TO host_id;

ALTER TABLE public.sos_alerts 
ADD CONSTRAINT sos_alerts_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES public.host_profiles(id);

-- Step 5: Create the trigger function to always create host_profiles
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

-- Step 6: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 7: Migrate existing profiles to host_profiles
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

-- Step 8: Update RLS policies for host_profiles
DROP POLICY IF EXISTS "Users can view their own host profile" ON public.host_profiles;
DROP POLICY IF EXISTS "Users can insert their own host profile" ON public.host_profiles;
DROP POLICY IF EXISTS "Users can update their own host profile" ON public.host_profiles;

CREATE POLICY "Users can view their own host profile" ON public.host_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own host profile" ON public.host_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own host profile" ON public.host_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 9: Update RLS policies for other tables
DROP POLICY IF EXISTS "Hosts can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Hosts can insert their own bookings" ON public.bookings;

CREATE POLICY "Hosts can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Step 10: Verify the setup
SELECT 'Schema updated successfully for host_profiles' as status;
SELECT COUNT(*) as profiles_count FROM public.profiles;
SELECT COUNT(*) as host_profiles_count FROM public.host_profiles;
