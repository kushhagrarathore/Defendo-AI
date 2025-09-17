-- Convenience script that ensures base summary views exist, then creates short aliases
-- Safe to run multiple times

-- 0) Ensure base views exist (create or replace definitions)
create or replace view public.host_booking_summaries
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
where b.provider_id = auth.uid();

create or replace view public.user_booking_summaries
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

-- Host-facing bookings view (restricted columns)
drop view if exists public.host_bookings_view cascade;
create view public.host_bookings_view
with (security_invoker = true)
as
select * from public.host_booking_summaries;

-- User-facing bookings view (restricted columns)
drop view if exists public.user_bookings_view cascade;
create view public.user_bookings_view
with (security_invoker = true)
as
select * from public.user_booking_summaries;

grant select on public.host_bookings_view to authenticated;
grant select on public.user_bookings_view to authenticated;

grant select on public.host_booking_summaries to authenticated;
grant select on public.user_booking_summaries to authenticated;


