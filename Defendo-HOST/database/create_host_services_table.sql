-- Create host_services table for storing services offered by hosts
-- Run this in your Supabase SQL Editor

-- Create host_services table
CREATE TABLE IF NOT EXISTS public.host_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  service_type text NOT NULL CHECK (service_type = ANY (ARRAY['securityGuard'::text, 'dronePatrol'::text, 'patrol'::text, 'surveillance'::text, 'eventSecurity'::text, 'bodyguard'::text, 'other'::text])),
  price_per_hour numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'INR'::text,
  location text,
  is_active boolean DEFAULT true,
  rating numeric DEFAULT 0,
  total_bookings integer DEFAULT 0,
  availability_schedule jsonb,
  specializations text[],
  equipment_included text[],
  certifications text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT host_services_pkey PRIMARY KEY (id),
  CONSTRAINT host_services_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.host_profiles(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.host_services ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for host_services
-- Hosts can view and manage their own services
CREATE POLICY "Hosts can view their own services" ON public.host_services
  FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own services" ON public.host_services
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own services" ON public.host_services
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own services" ON public.host_services
  FOR DELETE USING (auth.uid() = host_id);

-- Users can view all active services (for booking)
CREATE POLICY "Users can view active services" ON public.host_services
  FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_host_services_host_id ON public.host_services(host_id);
CREATE INDEX IF NOT EXISTS idx_host_services_service_type ON public.host_services(service_type);
CREATE INDEX IF NOT EXISTS idx_host_services_is_active ON public.host_services(is_active);
CREATE INDEX IF NOT EXISTS idx_host_services_price ON public.host_services(price_per_hour);
CREATE INDEX IF NOT EXISTS idx_host_services_rating ON public.host_services(rating);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_host_services_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_host_services_updated_at
  BEFORE UPDATE ON public.host_services
  FOR EACH ROW EXECUTE PROCEDURE public.update_host_services_updated_at();

-- Insert some sample services for testing
INSERT INTO public.host_services (host_id, name, description, service_type, price_per_hour, currency, location, specializations, equipment_included)
SELECT 
  hp.id,
  'Event Security',
  'Professional security services for events and gatherings',
  'eventSecurity',
  50.00,
  'USD',
  'New York, NY',
  ARRAY['Crowd Control', 'Access Control', 'Emergency Response'],
  ARRAY['Radio Communication', 'First Aid Kit', 'Flashlight']
FROM public.host_profiles hp
WHERE hp.email = 'photo@yopmail.com'
LIMIT 1;

INSERT INTO public.host_services (host_id, name, description, service_type, price_per_hour, currency, location, specializations, equipment_included)
SELECT 
  hp.id,
  'Bodyguard Protection',
  'Personal protection services for high-profile individuals',
  'bodyguard',
  75.00,
  'USD',
  'New York, NY',
  ARRAY['Personal Protection', 'Threat Assessment', 'Defensive Driving'],
  ARRAY['Body Armor', 'Communication Device', 'Medical Kit']
FROM public.host_profiles hp
WHERE hp.email = 'photo@yopmail.com'
LIMIT 1;

INSERT INTO public.host_services (host_id, name, description, service_type, price_per_hour, currency, location, specializations, equipment_included)
SELECT 
  hp.id,
  'Patrol Services',
  'Regular patrol and monitoring services for properties',
  'patrol',
  35.00,
  'USD',
  'New York, NY',
  ARRAY['Property Monitoring', 'Incident Response', 'Report Writing'],
  ARRAY['Patrol Vehicle', 'Security Camera', 'Incident Forms']
FROM public.host_profiles hp
WHERE hp.email = 'photo@yopmail.com'
LIMIT 1;

-- Verify the setup
SELECT 'Host services table created successfully' as status;
SELECT COUNT(*) as services_count FROM public.host_services;
