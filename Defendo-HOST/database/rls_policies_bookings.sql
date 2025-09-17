-- Row-Level Security policies for bookings to allow hosts to read their own bookings

-- Enable RLS (no-op if already enabled)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist to avoid duplicates during re-runs
DROP POLICY IF EXISTS "Bookings: providers can read own" ON public.bookings;
DROP POLICY IF EXISTS "Bookings: users can read own" ON public.bookings;

-- Allow authenticated hosts (providers) to SELECT bookings where they are the provider
CREATE POLICY "Bookings: providers can read own"
ON public.bookings
FOR SELECT
TO authenticated
USING (provider_id = auth.uid());

-- Allow authenticated end-users to SELECT bookings where they are the user
CREATE POLICY "Bookings: users can read own"
ON public.bookings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- NOTE:
-- This assumes public.bookings.provider_id stores the host's auth.user id (same as public.host_profiles.id).
-- If provider_id instead references another table (e.g., public.providers), either:
--   1) Migrate provider_id to store the host auth.user id, or
--   2) Replace the USING clause with an EXISTS that maps provider_id to auth.uid().
-- Example for (2):
-- USING (EXISTS (
--   SELECT 1 FROM public.host_profiles hp
--   WHERE hp.id = auth.uid() AND hp.id = public.bookings.provider_id
-- ));




