-- Create service_types lookup table and migrate constraint to FK
-- Run this in Supabase SQL Editor

-- 1) Create service_types table (code as PK for stable references)
CREATE TABLE IF NOT EXISTS public.service_types (
  code text PRIMARY KEY,
  label text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0
);

-- 2) Seed common types (align with UI)
INSERT INTO public.service_types (code, label, description, sort_order) VALUES
  ('securityGuard', 'Security Guard', 'On-site guards and personal protection', 10),
  ('dronePatrol', 'Drone Patrol', 'Aerial monitoring and patrol via drones', 20),
  ('patrol', 'Patrol Services', 'Property patrol and monitoring services', 30),
  ('surveillance', 'Surveillance', 'CCTV and remote monitoring services', 40),
  ('eventSecurity', 'Event Security', 'Security for events and gatherings', 50),
  ('bodyguard', 'Bodyguard Protection', 'Close personal protection services', 60),
  ('other', 'Other', 'Other or custom security services', 99)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  is_active = true,
  sort_order = EXCLUDED.sort_order;

-- 3) Drop old CHECK constraint on host_services.service_type if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'host_services' AND c.conname = 'host_services_service_type_check'
  ) THEN
    ALTER TABLE public.host_services DROP CONSTRAINT host_services_service_type_check;
  END IF;
END $$;

-- 4) Ensure column type is text (compatible with FK)
ALTER TABLE public.host_services
  ALTER COLUMN service_type TYPE text;

-- 5) Add FK from host_services.service_type to service_types.code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'host_services' AND c.conname = 'host_services_service_type_fkey'
  ) THEN
    ALTER TABLE public.host_services
      ADD CONSTRAINT host_services_service_type_fkey
      FOREIGN KEY (service_type) REFERENCES public.service_types(code) ON UPDATE CASCADE;
  END IF;
END $$;

-- 6) Optional: backfill/normalize existing values if they used legacy codes
-- Example mapping from old values to new codes (adjust as needed):
-- UPDATE public.host_services SET service_type = 'securityGuard' WHERE service_type IN ('guards','studios','agencies');
-- UPDATE public.host_services SET service_type = 'dronePatrol' WHERE service_type IN ('drones');

-- 7) Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_service_types_sort_order ON public.service_types(sort_order);
CREATE INDEX IF NOT EXISTS idx_host_services_service_type ON public.host_services(service_type);

-- 8) Verify
SELECT 'service_types table ready' AS status;
SELECT code, label FROM public.service_types ORDER BY sort_order;



