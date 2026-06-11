-- ============================================================
-- ConnectED — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

create table profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  username        text unique not null,
  full_name       text,
  avatar_url      text,
  year_group      text check (year_group in ('Year 7','Year 8','Year 9','Year 10','Year 11','Year 12')),
  house           text,
  student_id      text unique,
  class_teacher   text,
  subjects        text[],
  bio             text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid references profiles(id) on delete cascade,
  content         text not null,
  likes_count     int default 0,
  comments_count  int default 0,
  created_at      timestamptz default now()
);

create table post_likes (
  post_id   uuid references posts(id) on delete cascade,
  user_id   uuid references profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

create table messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  content     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

create table notes (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid references profiles(id) on delete cascade,
  title            text not null,
  subject          text not null,
  file_url         text not null,
  file_size_bytes  bigint,
  downloads_count  int default 0,
  created_at       timestamptz default now()
);

create table study_buddy_profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references profiles(id) on delete cascade unique,
  academic_level        text,
  subjects_studying     text[],
  subjects_needing_help text[],
  study_styles          text[],
  is_active             boolean default true,
  created_at            timestamptz default now()
);

create table buddy_connections (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid references profiles(id) on delete cascade,
  receiver_id  uuid references profiles(id) on delete cascade,
  status       text check (status in ('pending','accepted','declined')) default 'pending',
  created_at   timestamptz default now(),
  unique (requester_id, receiver_id)
);

create table peer_tutors (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references profiles(id) on delete cascade unique,
  subjects       text[],
  rating         numeric(3,2) default 0,
  total_sessions int default 0,
  is_available   boolean default true,
  bio            text,
  created_at     timestamptz default now()
);

create table tutor_bookings (
  id               uuid primary key default gen_random_uuid(),
  tutor_id         uuid references peer_tutors(id) on delete cascade,
  student_id       uuid references profiles(id) on delete cascade,
  subject          text not null,
  topic            text,
  scheduled_date   date,
  duration_minutes int,
  status           text check (status in ('pending','confirmed','completed','cancelled')) default 'pending',
  created_at       timestamptz default now()
);

create table events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  event_date  date not null,
  event_time  time,
  location    text,
  category    text,
  created_by  uuid references profiles(id),
  created_at  timestamptz default now()
);

create table event_registrations (
  event_id   uuid references events(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  primary key (event_id, user_id)
);

create table lost_items (
  id             uuid primary key default gen_random_uuid(),
  reporter_id    uuid references profiles(id) on delete cascade,
  title          text not null,
  description    text,
  location_found text,
  status         text check (status in ('missing','found','claimed')) default 'missing',
  image_url      text,
  created_at     timestamptz default now()
);

create table suggestions (
  id           uuid primary key default gen_random_uuid(),
  category     text not null,
  content      text not null,
  is_anonymous boolean default true,
  created_at   timestamptz default now()
);

create table academic_updates (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  content    text not null,
  category   text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table groups (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  creator_id        uuid references profiles(id),
  is_interest_group boolean default false,
  member_count      int default 0,
  created_at        timestamptz default now()
);

create table group_members (
  group_id  uuid references groups(id) on delete cascade,
  user_id   uuid references profiles(id) on delete cascade,
  role      text check (role in ('admin','member')) default 'member',
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_messages_sender_receiver_created
  on messages (sender_id, receiver_id, created_at);

create index idx_posts_author_created
  on posts (author_id, created_at);

create index idx_notes_subject_created
  on notes (subject, created_at);

create index idx_lost_items_status_created
  on lost_items (status, created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles            enable row level security;
alter table posts               enable row level security;
alter table post_likes          enable row level security;
alter table messages            enable row level security;
alter table notes               enable row level security;
alter table study_buddy_profiles enable row level security;
alter table buddy_connections   enable row level security;
alter table peer_tutors         enable row level security;
alter table tutor_bookings      enable row level security;
alter table events              enable row level security;
alter table event_registrations enable row level security;
alter table lost_items          enable row level security;
alter table suggestions         enable row level security;
alter table academic_updates    enable row level security;
alter table groups              enable row level security;
alter table group_members       enable row level security;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------

create policy "profiles_read_all"
  on profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- posts
-- ------------------------------------------------------------

create policy "posts_read_all"
  on posts for select
  to authenticated
  using (true);

create policy "posts_insert_own"
  on posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "posts_delete_own"
  on posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- post_likes
-- ------------------------------------------------------------

create policy "post_likes_insert_own"
  on post_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "post_likes_delete_own"
  on post_likes for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "post_likes_read_all"
  on post_likes for select
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- messages
-- ------------------------------------------------------------

create policy "messages_read_own"
  on messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "messages_insert_own"
  on messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "messages_update_own"
  on messages for update
  to authenticated
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- ------------------------------------------------------------
-- notes
-- ------------------------------------------------------------

create policy "notes_read_all"
  on notes for select
  to authenticated
  using (true);

create policy "notes_insert_own"
  on notes for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "notes_delete_own"
  on notes for delete
  to authenticated
  using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- suggestions (anonymous insert, no reads via API)
-- ------------------------------------------------------------

create policy "suggestions_insert_anon"
  on suggestions for insert
  to anon, authenticated
  with check (true);

-- ------------------------------------------------------------
-- lost_items
-- ------------------------------------------------------------

create policy "lost_items_read_all"
  on lost_items for select
  to authenticated
  using (true);

create policy "lost_items_insert_own"
  on lost_items for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create policy "lost_items_update_own"
  on lost_items for update
  to authenticated
  using (auth.uid() = reporter_id)
  with check (auth.uid() = reporter_id);

-- ------------------------------------------------------------
-- events (read all; only row creator can insert/update)
-- ------------------------------------------------------------

create policy "events_read_all"
  on events for select
  to authenticated
  using (true);

create policy "events_insert_creator"
  on events for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "events_update_creator"
  on events for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- ------------------------------------------------------------
-- event_registrations
-- ------------------------------------------------------------

create policy "event_registrations_read_own"
  on event_registrations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "event_registrations_insert_own"
  on event_registrations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "event_registrations_delete_own"
  on event_registrations for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- study_buddy_profiles
-- ------------------------------------------------------------

create policy "study_buddy_profiles_read_active"
  on study_buddy_profiles for select
  to authenticated
  using (is_active = true or auth.uid() = user_id);

create policy "study_buddy_profiles_insert_own"
  on study_buddy_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "study_buddy_profiles_update_own"
  on study_buddy_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "study_buddy_profiles_delete_own"
  on study_buddy_profiles for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- buddy_connections
-- ------------------------------------------------------------

create policy "buddy_connections_read_own"
  on buddy_connections for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "buddy_connections_insert_own"
  on buddy_connections for insert
  to authenticated
  with check (auth.uid() = requester_id);

create policy "buddy_connections_update_own"
  on buddy_connections for update
  to authenticated
  using (auth.uid() = receiver_id or auth.uid() = requester_id)
  with check (auth.uid() = receiver_id or auth.uid() = requester_id);

create policy "buddy_connections_delete_own"
  on buddy_connections for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

-- ------------------------------------------------------------
-- peer_tutors
-- ------------------------------------------------------------

create policy "peer_tutors_read_all"
  on peer_tutors for select
  to authenticated
  using (true);

create policy "peer_tutors_insert_own"
  on peer_tutors for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "peer_tutors_update_own"
  on peer_tutors for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "peer_tutors_delete_own"
  on peer_tutors for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- tutor_bookings
-- ------------------------------------------------------------

create policy "tutor_bookings_read_own"
  on tutor_bookings for select
  to authenticated
  using (
    auth.uid() = student_id
    or auth.uid() = (select user_id from peer_tutors where id = tutor_id)
  );

create policy "tutor_bookings_insert_student"
  on tutor_bookings for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "tutor_bookings_update_own"
  on tutor_bookings for update
  to authenticated
  using (
    auth.uid() = student_id
    or auth.uid() = (select user_id from peer_tutors where id = tutor_id)
  );

-- ------------------------------------------------------------
-- groups
-- ------------------------------------------------------------

create policy "groups_read_members"
  on groups for select
  to authenticated
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = id
        and group_members.user_id = auth.uid()
    )
    or creator_id = auth.uid()
  );

create policy "groups_insert_own"
  on groups for insert
  to authenticated
  with check (auth.uid() = creator_id);

create policy "groups_update_creator"
  on groups for update
  to authenticated
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

-- ------------------------------------------------------------
-- group_members
-- ------------------------------------------------------------

create policy "group_members_read_members"
  on group_members for select
  to authenticated
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_id
        and gm.user_id = auth.uid()
    )
  );

create policy "group_members_insert_own"
  on group_members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "group_members_delete_own"
  on group_members for delete
  to authenticated
  using (
    auth.uid() = user_id
    or auth.uid() = (select creator_id from groups where id = group_id)
  );

-- ------------------------------------------------------------
-- academic_updates
-- ------------------------------------------------------------

create policy "academic_updates_read_all"
  on academic_updates for select
  to authenticated
  using (true);

create policy "academic_updates_insert_creator"
  on academic_updates for insert
  to authenticated
  with check (auth.uid() = created_by);

-- ============================================================
-- TRIGGER: auto-create profile on auth.users insert
-- ============================================================

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
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- TRIGGER: keep posts likes_count / comments_count in sync
-- ============================================================

create or replace function sync_post_counts()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_table_name = 'post_likes' then
    if tg_op = 'INSERT' then
      update posts set likes_count = likes_count + 1 where id = new.post_id;
    elsif tg_op = 'DELETE' then
      update posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
    end if;

  elsif tg_table_name = 'post_comments' then
    if tg_op = 'INSERT' then
      update posts set comments_count = comments_count + 1 where id = new.post_id;
    elsif tg_op = 'DELETE' then
      update posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
    end if;
  end if;

  return null;
end;
$$;

create trigger trg_post_likes_count
  after insert or delete on post_likes
  for each row execute procedure sync_post_counts();

-- ============================================================
-- TRIGGER: updated_at on profiles
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();
