-- Fix host_profiles RLS policies and permissions

-- First, let's check if the host_profiles table has the right structure
-- and fix any issues

-- Drop all existing policies on host_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.host_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.host_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.host_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.host_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.host_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.host_profiles;

-- Disable RLS temporarily to fix the table
ALTER TABLE public.host_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies that should work
CREATE POLICY "Enable read access for all users" ON public.host_profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.host_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on email" ON public.host_profiles
  FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Grant permissions
GRANT ALL ON public.host_profiles TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Also ensure the table has the right foreign key relationship
-- Check if the id column references auth.users(id)
DO $$
BEGIN
    -- Check if the foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'host_profile_id_fkey' 
        AND table_name = 'host_profiles'
    ) THEN
        -- Add the foreign key constraint if it doesn't exist
        ALTER TABLE public.host_profiles 
        ADD CONSTRAINT host_profile_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint to host_profiles';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists on host_profiles';
    END IF;
END $$;





