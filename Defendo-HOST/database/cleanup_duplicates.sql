-- Clean up any duplicate or conflicting data
-- Run this in your Supabase SQL Editor

-- Step 1: Check for duplicate host profiles
SELECT 'Checking for duplicate host profiles...' as status;

-- Find duplicates by email
SELECT email, COUNT(*) as count
FROM public.host_profiles
GROUP BY email
HAVING COUNT(*) > 1;

-- Find duplicates by id
SELECT id, COUNT(*) as count
FROM public.host_profiles
GROUP BY id
HAVING COUNT(*) > 1;

-- Step 2: Remove duplicate host profiles (keep the most recent one)
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM public.host_profiles
)
DELETE FROM public.host_profiles
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 3: Check for orphaned host profiles (no corresponding auth user)
DELETE FROM public.host_profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- Step 4: Verify cleanup
SELECT 'Cleanup completed' as status;
SELECT COUNT(*) as host_profiles_count FROM public.host_profiles;
SELECT COUNT(*) as auth_users_count FROM auth.users;
