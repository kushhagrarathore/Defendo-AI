-- Host KYC Table Schema
-- This table stores KYC documents submitted by hosts for verification

CREATE TABLE IF NOT EXISTS public.host_kyc (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    host_id uuid NOT NULL,
    document_type text NOT NULL CHECK (document_type IN ('company_registration', 'pan_card', 'gst_registration', 'trade_license', 'office_address_proof')),
    document_url text NOT NULL,
    status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT host_kyc_pkey PRIMARY KEY (id),
    CONSTRAINT host_kyc_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.host_profiles(id),
    CONSTRAINT host_kyc_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.super_admins(id)
);

-- Enable RLS
ALTER TABLE public.host_kyc ENABLE ROW LEVEL SECURITY;

-- RLS Policies for host_kyc
-- Hosts can view their own KYC documents
CREATE POLICY "Hosts can view their own KYC documents" ON public.host_kyc
    FOR SELECT USING (host_id = auth.uid());

-- Hosts can insert their own KYC documents
CREATE POLICY "Hosts can insert their own KYC documents" ON public.host_kyc
    FOR INSERT WITH CHECK (host_id = auth.uid());

-- Hosts can update their own pending KYC documents
CREATE POLICY "Hosts can update their own pending KYC documents" ON public.host_kyc
    FOR UPDATE USING (
        host_id = auth.uid() AND status = 'pending'
    );

-- Super admins can view all KYC documents
CREATE POLICY "Super admins can view all KYC documents" ON public.host_kyc
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Super admins can update KYC status
CREATE POLICY "Super admins can update KYC status" ON public.host_kyc
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_host_kyc_host_id ON public.host_kyc(host_id);
CREATE INDEX IF NOT EXISTS idx_host_kyc_status ON public.host_kyc(status);
CREATE INDEX IF NOT EXISTS idx_host_kyc_submitted_at ON public.host_kyc(submitted_at);

-- Grant permissions
GRANT ALL ON public.host_kyc TO authenticated;
GRANT ALL ON public.host_kyc TO service_role;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_host_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_host_kyc_updated_at
    BEFORE UPDATE ON public.host_kyc
    FOR EACH ROW
    EXECUTE FUNCTION update_host_kyc_updated_at();
