# Database Setup Guide for Defendo Host

This guide will help you set up the database schema and configure Supabase for the Defendo Host platform.

## Prerequisites

1. A Supabase project created
2. Supabase CLI installed (optional but recommended)
3. Your Supabase project URL and anon key

## Step 1: Create Database Schema

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** tab
3. Copy and paste the contents of `database/schema.sql` into the editor
4. Click **Run** to execute the schema

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in your project root (if not already created)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Replace the placeholder values with your actual Supabase project URL and anon key

## Step 3: Verify Database Setup

After running the schema, you should see these tables created:

- `host_profiles` - Stores host/security provider information
- `profiles` - Stores general user profiles
- `providers` - Stores service provider information
- `bookings` - Stores booking information
- `emergency_contacts` - Stores emergency contact information
- `location_history` - Stores user location history
- `sos_alerts` - Stores SOS alert information

## Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Try signing up with a new account
3. Check the `host_profiles` table in Supabase to see if the data was created

## Database Schema Details

### Host Profiles Table

The `host_profiles` table stores information about security service providers:

- `id` - UUID (references auth.users)
- `email` - Email address
- `full_name` - Full name of the host
- `company_name` - Company name (optional)
- `avatar_url` - Profile picture URL
- `phone` - Phone number
- `address` - Physical address
- `services_offered` - Array of services offered
- `verified` - Verification status
- `rating` - Average rating
- `reviews` - Number of reviews
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Automatic Profile Creation

When a user signs up:

1. A record is automatically created in the `profiles` table
2. If the user provides a `company_name` during signup, a record is also created in the `host_profiles` table
3. The user's role is set based on whether they have a company name

## Row Level Security (RLS)

The database is configured with Row Level Security policies:

- Users can only view and modify their own profiles
- Users can only view their own bookings
- Users can only manage their own emergency contacts
- Users can only manage their own location history
- Users can only manage their own SOS alerts

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure RLS policies are properly set up
2. **Foreign Key Errors**: Ensure the `auth.users` table exists and has the correct structure
3. **Function Errors**: Make sure the `handle_new_user` function is created correctly

### Debugging

1. Check the Supabase logs in the dashboard
2. Use the browser's developer console to see client-side errors
3. Verify your environment variables are correct

## Next Steps

After setting up the database:

1. Test user registration and login
2. Verify that host profiles are created correctly
3. Test the dashboard functionality
4. Set up any additional business logic as needed

## Support

If you encounter any issues:

1. Check the Supabase documentation
2. Review the error logs in your Supabase dashboard
3. Ensure all environment variables are correctly set
4. Verify that the database schema was created without errors
