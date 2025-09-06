# Test Host Profiles Setup

## Quick Test Steps

### 1. Run the Database Migration
1. Go to your Supabase SQL Editor
2. Copy and paste the contents of `database/ensure_host_profiles_only.sql`
3. Click **Run** to execute the migration

### 2. Test New User Signup
1. Go to your app's signup page
2. Create a new test account with:
   - Full Name: "Test Host"
   - Company Name: "Test Security Co"
   - Email: "test@example.com"
   - Phone: "1234567890"
   - Address: "123 Test Street"
   - Password: "testpassword123"

### 3. Verify Data Storage
1. Go to your Supabase Table Editor
2. Check the `host_profiles` table
3. You should see the new user data there
4. The `profiles` table should NOT have any new entries

### 4. Test Login
1. Log out and log back in with the test account
2. Check that the dashboard shows the correct host information
3. Verify the user data is loaded from `host_profiles`

## Expected Results

✅ **New signups** → Data goes to `host_profiles` table only  
✅ **Existing users** → Migrated to `host_profiles` table  
✅ **Login** → Loads data from `host_profiles` table  
✅ **Dashboard** → Shows host-specific information  
✅ **No data** → Goes to `profiles` table anymore  

## Troubleshooting

If data still goes to `profiles` table:
1. Check that the trigger was created successfully
2. Verify the migration script ran without errors
3. Test with a completely new email address
4. Check Supabase logs for any errors

## Database Verification Queries

Run these in Supabase SQL Editor to verify:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check host_profiles data
SELECT id, email, full_name, company_name FROM public.host_profiles;

-- Check profiles data (should not have new entries)
SELECT id, email, full_name FROM public.profiles;
```
