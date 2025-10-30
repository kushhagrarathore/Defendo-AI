-- Create Test KYC Data for Admin Dashboard Testing
-- Run this in your Supabase SQL Editor

-- First, let's check if we have any host profiles
SELECT 'Current host profiles:' as info;
SELECT id, email, full_name, company_name FROM public.host_profiles LIMIT 5;

-- Create a test host profile if none exists
INSERT INTO public.host_profiles (id, email, full_name, company_name, phone, address, services_offered)
VALUES (
  '0c28e868-02f3-4f83-b2f2-ea741e6f38f9', -- Use the user ID from your error
  'test@example.com',
  'Test Host',
  'Test Security Company',
  '+1234567890',
  '123 Test Street, Test City',
  ARRAY['security_guard', 'drone_patrol']
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  company_name = EXCLUDED.company_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = now();

-- Create test KYC records
INSERT INTO public.host_kyc (host_id, document_type, document_url, status, submitted_at)
VALUES 
  (
    '0c28e868-02f3-4f83-b2f2-ea741e6f38f9',
    'company_registration',
    '0c28e868-02f3-4f83-b2f2-ea741e6f38f9/test_company_registration.pdf',
    'submitted',
    now() - interval '1 day'
  ),
  (
    '0c28e868-02f3-4f83-b2f2-ea741e6f38f9',
    'pan_card',
    '0c28e868-02f3-4f83-b2f2-ea741e6f38f9/test_pan_card.jpg',
    'pending',
    now() - interval '2 hours'
  )
ON CONFLICT DO NOTHING;

-- Verify the test data
SELECT 'Test KYC records created:' as info;
SELECT 
  hk.id,
  hk.document_type,
  hk.document_url,
  hk.status,
  hk.submitted_at,
  hp.full_name,
  hp.email,
  hp.company_name
FROM public.host_kyc hk
JOIN public.host_profiles hp ON hk.host_id = hp.id
WHERE hk.host_id = '0c28e868-02f3-4f83-b2f2-ea741e6f38f9'
ORDER BY hk.submitted_at DESC;

-- Check if super_admins table has the current user
SELECT 'Super admin check:' as info;
SELECT * FROM public.super_admins WHERE id = '0c28e868-02f3-4f83-b2f2-ea741e6f38f9';

-- If no super admin record exists, create one
INSERT INTO public.super_admins (id, email, full_name, role, is_active)
VALUES (
  '0c28e868-02f3-4f83-b2f2-ea741e6f38f9',
  'test@example.com',
  'Test Admin',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_active = true;
































