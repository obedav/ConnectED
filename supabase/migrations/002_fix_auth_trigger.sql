-- ============================================================
-- ConnectED — Fix auth trigger & add username availability RPC
-- Migration: 002_fix_auth_trigger.sql
-- ============================================================

-- Updated trigger: skip silently if the profile row already exists (retry/idempotent)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- RPC: lets anon users check username availability before signing up
create or replace function is_username_taken(uname text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where lower(username) = lower(uname));
$$;

grant execute on function is_username_taken(text) to anon, authenticated;
