-- Test script to check host_profiles table access

-- Check if the table exists and has the right columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'host_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'host_profiles';

-- Test a simple select to see if RLS is blocking access
SELECT COUNT(*) as total_profiles FROM public.host_profiles;

-- Check if the current user can access their own profile
SELECT id, email, full_name, company_name 
FROM public.host_profiles 
WHERE id = auth.uid()
LIMIT 1;







