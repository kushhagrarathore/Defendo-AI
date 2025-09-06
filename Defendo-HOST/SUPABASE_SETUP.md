# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your Defendo Host.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `defendo-host-platform`
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 3. Update Your Configuration

1. Open `src/lib/supabase.js`
2. Replace the placeholder values:

```javascript
// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'your-anon-key'
```

## 4. Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:

### Site URL
- Set to: `http://localhost:3001` (for development)
- For production, set to your actual domain

### Redirect URLs
Add these URLs:
- `http://localhost:3001/dashboard` (for development)
- `http://localhost:3001/login` (for development)
- Your production URLs when deploying

### Email Templates (Optional)
You can customize the email templates for:
- Email confirmation
- Password reset
- Magic link

## 5. Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email settings:
   - **Enable email confirmations**: Recommended for production
   - **Enable email change confirmations**: Recommended

## 6. Test Your Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3001/signup`
3. Create a test account
4. Check your email for confirmation (if enabled)
5. Try logging in at `http://localhost:3001/login`

## 7. Database Schema (Optional)

If you want to store additional user data, you can create a `profiles` table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own profile
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
```

## 8. Environment Variables (Recommended)

For better security, use environment variables:

1. Create a `as.env.local` file in your project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. Update `src/lib/supabase.js`:
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 9. Production Deployment

When deploying to production:

1. Update your Supabase project settings:
   - **Site URL**: Your production domain
   - **Redirect URLs**: Add your production URLs
2. Update your environment variables
3. Make sure your domain is added to the allowed origins

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check that you copied the correct anon key
2. **"Invalid redirect URL"**: Make sure your redirect URLs are added in Supabase settings
3. **Email not sending**: Check your email provider settings in Supabase
4. **CORS errors**: Make sure your domain is in the allowed origins

### Getting Help:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

## Security Best Practices

1. **Never expose your service role key** in client-side code
2. **Use Row Level Security (RLS)** for database tables
3. **Enable email confirmations** in production
4. **Use strong passwords** for your Supabase project
5. **Regularly rotate your API keys**
6. **Monitor your project usage** and set up alerts

Your Supabase authentication is now ready to use! 🎉
