-- Database Schema for Defendo Host Platform
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create host_profiles table
CREATE TABLE IF NOT EXISTS public.host_profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  company_name text,
  avatar_url text,
  phone text,
  address text,
  services_offered text[],
  verified boolean DEFAULT false,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT host_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT host_profile_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Note: This app is designed for host profiles only
-- Regular user profiles table removed as this is a host-only platform

-- Create providers table
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  price numeric,
  verified boolean DEFAULT false,
  CONSTRAINT providers_pkey PRIMARY KEY (id)
);

-- Create bookings table (for client bookings with hosts)
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid,
  host_id uuid,
  service_type text CHECK (service_type = ANY (ARRAY['securityGuard'::text, 'dronePatrol'::text, 'patrol'::text, 'surveillance'::text])),
  date timestamp with time zone NOT NULL,
  duration integer NOT NULL,
  location text,
  status text DEFAULT 'pending'::text,
  price numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  booking_date date,
  start_time time without time zone,
  end_time time without time zone,
  duration_hours integer,
  latitude double precision,
  longitude double precision,
  payment_status text NOT NULL DEFAULT 'pending'::text,
  updated_at timestamp with time zone,
  client_notes text,
  currency text DEFAULT 'INR'::text,
  payment_method text,
  transaction_id text UNIQUE,
  refund_id text UNIQUE,
  host_payout_status text DEFAULT 'pending'::text,
  payout_date timestamp with time zone,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.host_profiles(id)
);

-- Create emergency_contacts table (for hosts)
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  host_id uuid,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT emergency_contacts_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.host_profiles(id)
);

-- Create location_history table (for hosts)
CREATE TABLE IF NOT EXISTS public.location_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  host_id uuid,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision,
  speed double precision,
  heading double precision,
  altitude double precision,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  address text,
  safety_score integer,
  CONSTRAINT location_history_pkey PRIMARY KEY (id),
  CONSTRAINT location_history_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.host_profiles(id)
);

-- Create sos_alerts table (for hosts)
CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  host_id uuid,
  latitude double precision,
  longitude double precision,
  description text,
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  address text,
  device_info jsonb,
  updated_at timestamp with time zone,
  resolved_at timestamp with time zone,
  police_notified boolean DEFAULT false,
  emergency_contacts_notified boolean DEFAULT false,
  location_accuracy double precision,
  battery_level integer,
  signal_strength integer,
  CONSTRAINT sos_alerts_pkey PRIMARY KEY (id),
  CONSTRAINT sos_alerts_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.host_profiles(id)
);

-- Enable Row Level Security
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for host_profiles
CREATE POLICY "Users can view their own host profile" ON public.host_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own host profile" ON public.host_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own host profile" ON public.host_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Note: RLS policies for profiles table removed as this is a host-only platform

-- Create RLS Policies for bookings
CREATE POLICY "Hosts can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Create RLS Policies for emergency_contacts
CREATE POLICY "Hosts can manage their own emergency contacts" ON public.emergency_contacts
  FOR ALL USING (auth.uid() = host_id);

-- Create RLS Policies for location_history
CREATE POLICY "Hosts can manage their own location history" ON public.location_history
  FOR ALL USING (auth.uid() = host_id);

-- Create RLS Policies for sos_alerts
CREATE POLICY "Hosts can manage their own SOS alerts" ON public.sos_alerts
  FOR ALL USING (auth.uid() = host_id);

-- Create function to handle new host signup
CREATE OR REPLACE FUNCTION public.handle_new_host()
RETURNS trigger AS $$
BEGIN
  -- Always create host profile for new users (this is a host-only platform)
  INSERT INTO public.host_profiles (id, email, full_name, company_name, phone, address, services_offered)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    ARRAY[]::text[] -- Initialize empty services array
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new host signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_host();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_host_profiles_email ON public.host_profiles(email);
CREATE INDEX IF NOT EXISTS idx_host_profiles_company_name ON public.host_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON public.bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_host_id ON public.emergency_contacts(host_id);
CREATE INDEX IF NOT EXISTS idx_location_history_host_id ON public.location_history(host_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_host_id ON public.sos_alerts(host_id);
