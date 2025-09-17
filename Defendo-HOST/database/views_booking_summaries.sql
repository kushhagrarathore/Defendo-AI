-- Views exposing safe booking summaries for hosts and users
-- Requires RLS on public.bookings; views run with caller privileges

-- Ensure bookings has RLS and policies (refer to rls_policies_bookings.sql)
-- This script only creates views and grants

-- Host booking summaries: limited columns; only rows for current host
drop view if exists public.host_booking_summaries cascade;
create view public.host_booking_summaries
with (security_invoker = true)
as
select
  b.id,
  b.service_type,
  b.date,
  b.start_time,
  b.end_time,
  p.full_name as user_name
from public.bookings b
left join public.profiles p on p.id = b.user_id
where b.host_id = auth.uid();

-- User booking summaries: limited columns; only rows for current user
drop view if exists public.user_booking_summaries cascade;
create view public.user_booking_summaries
with (security_invoker = true)
as
select
  b.id,
  b.service_type,
  b.price,
  b.currency,
  b.date,
  b.start_time,
  b.end_time,
  b.status
from public.bookings b
where b.user_id = auth.uid();

-- Grant read access to authenticated role
grant select on public.host_booking_summaries to authenticated;
grant select on public.user_booking_summaries to authenticated;

-- Notes:
-- 1) RLS is enforced on the underlying table (public.bookings). With security_invoker=true,
--    the caller's RLS context (auth.uid()) applies to the table scan.
-- 2) The WHERE clauses add an extra safety filter aligned with the intended audience.
-- 3) No inserts/updates/deletes are exposed via these views.


