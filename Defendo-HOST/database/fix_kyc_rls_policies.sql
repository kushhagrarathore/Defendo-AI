-- Fix RLS policies for host_kyc and host_profiles tables

-- Enable RLS on host_kyc table
ALTER TABLE public.host_kyc ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own KYC records" ON public.host_kyc;
DROP POLICY IF EXISTS "Users can insert their own KYC records" ON public.host_kyc;
DROP POLICY IF EXISTS "Users can update their own KYC records" ON public.host_kyc;
DROP POLICY IF EXISTS "Admins can view all KYC records" ON public.host_kyc;
DROP POLICY IF EXISTS "Admins can update all KYC records" ON public.host_kyc;

-- Create RLS policies for host_kyc
CREATE POLICY "Users can view their own KYC records" ON public.host_kyc
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Users can insert their own KYC records" ON public.host_kyc
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Users can update their own KYC records" ON public.host_kyc
  FOR UPDATE USING (auth.uid() = provider_id);

-- Note: Admin policies removed since is_admin column doesn't exist
-- You can add admin functionality later by adding the is_admin column

-- Enable RLS on host_profiles table
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.host_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.host_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.host_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.host_profiles;

-- Create RLS policies for host_profiles
CREATE POLICY "Users can view their own profile" ON public.host_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.host_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Note: Admin policies removed since is_admin column doesn't exist
-- You can add admin functionality later by adding the is_admin column

-- Note: Admin function removed since is_admin column doesn't exist
-- You can add admin functionality later by adding the is_admin column

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.host_kyc TO anon, authenticated;
GRANT ALL ON public.host_profiles TO anon, authenticated;
