-- Create notifications table if not exists
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS optional: allow users to read their notifications
do $$ begin
  perform 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'Users can view own notifications';
  if not found then
    alter table public.notifications enable row level security;
    create policy "Users can view own notifications" on public.notifications
      for select using (auth.uid() = user_id);
  end if;
end $$;

-- Trigger to insert notification on host_profiles.verified change
create or replace function public.notify_on_verified_change()
returns trigger as $$
begin
  if TG_OP = 'UPDATE' and NEW.verified is distinct from OLD.verified then
    if NEW.verified = true then
      insert into public.notifications(user_id, type, title, message)
      values (NEW.id, 'company_verification', 'Account Verified ✅', 'Your account has been verified. You can now add services.');
    else
      insert into public.notifications(user_id, type, title, message)
      values (NEW.id, 'company_verification', 'Under Verification', 'Your documents are under verification.');
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_on_verified_change on public.host_profiles;
create trigger trg_notify_on_verified_change
after update on public.host_profiles
for each row execute function public.notify_on_verified_change();
































