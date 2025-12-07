-- Create host_service_subcategories table for better data structure and querying
-- This replaces the JSONB approach with a proper relational structure

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS public.host_service_subcategories;

-- Create the subcategories table
CREATE TABLE public.host_service_subcategories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES public.host_services(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Subcategory details
    subcategory_key VARCHAR(50) NOT NULL, -- e.g., 'security_guard', 'male_bouncer', 'other'
    subcategory_label VARCHAR(100) NOT NULL, -- e.g., 'Security Guard', 'Male Bouncer', 'Custom Guard Type'
    subcategory_type VARCHAR(20) NOT NULL DEFAULT 'predefined', -- 'predefined' or 'custom'
    
    -- Pricing information
    price_per_hour DECIMAL(10,2) NOT NULL CHECK (price_per_hour >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Additional metadata
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_service_subcategory UNIQUE (service_id, subcategory_key),
    CONSTRAINT valid_currency CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
    CONSTRAINT valid_subcategory_type CHECK (subcategory_type IN ('predefined', 'custom'))
);

-- Add comments for documentation
COMMENT ON TABLE public.host_service_subcategories IS 'Stores subcategories and pricing for host services with proper relational structure';
COMMENT ON COLUMN public.host_service_subcategories.subcategory_key IS 'Unique identifier for the subcategory type (snake_case)';
COMMENT ON COLUMN public.host_service_subcategories.subcategory_label IS 'Human-readable label for the subcategory';
COMMENT ON COLUMN public.host_service_subcategories.subcategory_type IS 'Whether this is a predefined or custom subcategory';
COMMENT ON COLUMN public.host_service_subcategories.price_per_hour IS 'Hourly rate for this specific subcategory';
COMMENT ON COLUMN public.host_service_subcategories.display_order IS 'Order for displaying subcategories (lower numbers first)';

-- Create indexes for optimal query performance
CREATE INDEX idx_subcategories_service_id ON public.host_service_subcategories(service_id);
CREATE INDEX idx_subcategories_host_id ON public.host_service_subcategories(host_id);
CREATE INDEX idx_subcategories_active ON public.host_service_subcategories(is_active) WHERE is_active = true;
CREATE INDEX idx_subcategories_type ON public.host_service_subcategories(subcategory_type);
CREATE INDEX idx_subcategories_service_active ON public.host_service_subcategories(service_id, is_active) WHERE is_active = true;

-- Create composite index for common queries
CREATE INDEX idx_subcategories_host_service ON public.host_service_subcategories(host_id, service_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.host_service_subcategories ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Hosts can view their own subcategories
CREATE POLICY "Hosts can view own subcategories" ON public.host_service_subcategories
    FOR SELECT USING (
        auth.uid() = host_id OR
        EXISTS (
            SELECT 1 FROM public.host_services 
            WHERE id = service_id AND host_id = auth.uid()
        )
    );

-- 2. Hosts can insert subcategories for their own services
CREATE POLICY "Hosts can insert own subcategories" ON public.host_service_subcategories
    FOR INSERT WITH CHECK (
        auth.uid() = host_id AND
        EXISTS (
            SELECT 1 FROM public.host_services 
            WHERE id = service_id AND host_id = auth.uid()
        )
    );

-- 3. Hosts can update their own subcategories
CREATE POLICY "Hosts can update own subcategories" ON public.host_service_subcategories
    FOR UPDATE USING (
        auth.uid() = host_id OR
        EXISTS (
            SELECT 1 FROM public.host_services 
            WHERE id = service_id AND host_id = auth.uid()
        )
    );

-- 4. Hosts can delete their own subcategories
CREATE POLICY "Hosts can delete own subcategories" ON public.host_service_subcategories
    FOR DELETE USING (
        auth.uid() = host_id OR
        EXISTS (
            SELECT 1 FROM public.host_services 
            WHERE id = service_id AND host_id = auth.uid()
        )
    );

-- 5. Public can view active subcategories for browsing services
CREATE POLICY "Public can view active subcategories" ON public.host_service_subcategories
    FOR SELECT USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM public.host_services 
            WHERE id = service_id AND is_active = true
        )
    );

-- 6. Super admins can view all subcategories
CREATE POLICY "Super admins can view all subcategories" ON public.host_service_subcategories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subcategories_updated_at
    BEFORE UPDATE ON public.host_service_subcategories
    FOR EACH ROW
    EXECUTE FUNCTION update_subcategories_updated_at();

-- Create a view for easy querying with service details
CREATE OR REPLACE VIEW public.service_subcategories_view AS
SELECT 
    sub.id,
    sub.service_id,
    sub.host_id,
    sub.subcategory_key,
    sub.subcategory_label,
    sub.subcategory_type,
    sub.price_per_hour,
    sub.currency,
    sub.description,
    sub.is_active,
    sub.display_order,
    sub.created_at,
    sub.updated_at,
    
    -- Service details
    hs.name as service_name,
    hs.service_type,
    hs.is_active as service_active,
    
    -- Host details
    hp.full_name as host_name,
    hp.company_name,
    hp.city,
    hp.state
    
FROM public.host_service_subcategories sub
JOIN public.host_services hs ON sub.service_id = hs.id
LEFT JOIN public.host_profiles hp ON sub.host_id = hp.id
WHERE sub.is_active = true AND hs.is_active = true;

-- Grant permissions on the view
GRANT SELECT ON public.service_subcategories_view TO authenticated;
GRANT SELECT ON public.service_subcategories_view TO anon;

-- Sample data insertion (for testing)
-- This will be executed after host_services exist
/*
INSERT INTO public.host_service_subcategories (
    service_id, host_id, subcategory_key, subcategory_label, 
    subcategory_type, price_per_hour, currency, display_order
) VALUES 
-- Example data (replace with actual service_id and host_id)
-- ('service-uuid-here', 'host-uuid-here', 'security_guard', 'Security Guard', 'predefined', 500.00, 'INR', 1),
-- ('service-uuid-here', 'host-uuid-here', 'security_supervisor', 'Security Supervisor', 'predefined', 750.00, 'INR', 2),
-- ('service-uuid-here', 'host-uuid-here', 'male_bouncer', 'Male Bouncer', 'predefined', 600.00, 'INR', 3),
-- ('service-uuid-here', 'host-uuid-here', 'female_bouncer', 'Female Bouncer', 'predefined', 600.00, 'INR', 4);
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'host_service_subcategories table created successfully with RLS policies and indexes!';
END $$;



























