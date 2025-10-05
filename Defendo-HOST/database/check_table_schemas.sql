-- Check and fix table schemas

-- Check if host_kyc table exists and has correct columns
DO $$
BEGIN
    -- Check if host_kyc table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'host_kyc' AND table_schema = 'public') THEN
        RAISE NOTICE 'host_kyc table does not exist, creating it...';
        
        CREATE TABLE public.host_kyc (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            document_type TEXT NOT NULL,
            document_url TEXT NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
            submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            reviewed_at TIMESTAMP WITH TIME ZONE,
            rejection_reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'host_kyc table created successfully';
    ELSE
        RAISE NOTICE 'host_kyc table exists';
    END IF;
    
    -- Check if host_profiles table exists and has correct columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'host_profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'host_profiles table does not exist, creating it...';
        
        CREATE TABLE public.host_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            email TEXT,
            company_name TEXT,
            phone TEXT,
            state TEXT,
            city TEXT,
            logo_url TEXT,
            verified BOOLEAN DEFAULT false,
            is_admin BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'host_profiles table created successfully';
    ELSE
        RAISE NOTICE 'host_profiles table exists';
    END IF;
    
    -- Check if required columns exist in host_kyc
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'host_kyc' AND column_name = 'host_id') THEN
        RAISE NOTICE 'host_id column missing in host_kyc table';
    END IF;
    
    -- Check if required columns exist in host_profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'host_profiles' AND column_name = 'id') THEN
        RAISE NOTICE 'id column missing in host_profiles table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'host_profiles' AND column_name = 'verified') THEN
        RAISE NOTICE 'verified column missing in host_profiles table';
        ALTER TABLE public.host_profiles ADD COLUMN verified BOOLEAN DEFAULT false;
    END IF;
    
    -- Note: is_admin column not added since it doesn't exist in current schema
    -- You can add admin functionality later by adding the is_admin column
    
END $$;
