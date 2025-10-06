-- Fix RLS policies for host_kyc table to allow super admin updates
-- This script ensures super admins can update KYC records

-- First, let's check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'host_kyc';

-- Drop existing policies that might be blocking updates
DROP POLICY IF EXISTS "hosts_can_update_own_kyc" ON public.host_kyc;
DROP POLICY IF EXISTS "super_admins_can_update_kyc" ON public.host_kyc;
DROP POLICY IF EXISTS "super_admins_can_manage_kyc" ON public.host_kyc;

-- Create a comprehensive policy for super admins to manage all KYC records
CREATE POLICY "super_admins_can_manage_kyc" ON public.host_kyc
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.super_admins sa
    WHERE sa.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.super_admins sa
    WHERE sa.id = auth.uid()
  )
);

-- Allow hosts to read their own KYC records
CREATE POLICY "hosts_can_read_own_kyc" ON public.host_kyc
FOR SELECT TO authenticated
USING (host_id = auth.uid());

-- Allow hosts to insert their own KYC records
CREATE POLICY "hosts_can_insert_own_kyc" ON public.host_kyc
FOR INSERT TO authenticated
WITH CHECK (host_id = auth.uid());

-- Allow hosts to update their own KYC records (but not status changes)
CREATE POLICY "hosts_can_update_own_kyc" ON public.host_kyc
FOR UPDATE TO authenticated
USING (host_id = auth.uid())
WITH CHECK (
  host_id = auth.uid() 
  AND (
    -- Hosts can only update non-status fields
    OLD.status = NEW.status
    OR 
    -- Or if they're updating status, it should be to 'submitted' only
    NEW.status = 'submitted'
  )
);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'host_kyc'
ORDER BY policyname;



















