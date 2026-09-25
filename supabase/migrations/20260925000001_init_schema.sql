-- NSS Portal — core schema
-- Tables: batches, profiles, events, attendance, points_ledger, office_bearers, gallery, site_settings
-- Security model:
--   * Every table has RLS enabled.
--   * Admins are profiles with role = 'admin' (checked via public.is_admin()).
--   * Students can read their own attendance / points only when the admin has revealed
--     that section (globally via site_settings, or per-student via profiles.reveal_details).
--     This is enforced here, so the dashboard blur cannot be bypassed via the API.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- batches
create table public.batches (
  id          uuid primary key default gen_random_uuid(),
  label       text not null unique,            -- e.g. '24-28'
  start_year  int  not null,
  end_year    int  not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  check (end_year > start_year)
);

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null,
  email           text not null,
  register_no     text unique,
  department      text,
  section         text,
  phone           text,
  batch_id        uuid references public.batches(id) on delete set null,
  avatar_url      text,
  role            text not null default 'student' check (role in ('student', 'admin')),
  reveal_details  boolean not null default false,   -- per-student override of the dashboard blur
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index profiles_batch_idx on public.profiles(batch_id);

-- ---------------------------------------------------------------- events
create table public.events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  summary       text,
  description   text,
  category      text not null default 'Community',
  event_date    date not null,
  end_date      date,
  location      text,
  cover_url     text,
  register_url  text,                    -- Google Form link
  points        int  not null default 10, -- default points awarded for attending
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);
create index events_date_idx on public.events(event_date desc);

-- ---------------------------------------------------------------- attendance
create table public.attendance (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  event_id    uuid not null references public.events(id) on delete cascade,
  status      text not null default 'present' check (status in ('present', 'absent', 'excused')),
  role        text,        -- e.g. 'Volunteer', 'Coordinator'
  marked_at   timestamptz not null default now(),
  unique (student_id, event_id)
);
create index attendance_event_idx on public.attendance(event_id);

-- ---------------------------------------------------------------- points
create table public.points_ledger (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  event_id    uuid references public.events(id) on delete set null,
  points      int  not null,
  reason      text not null,
  created_at  timestamptz not null default now()
);
create index points_student_idx on public.points_ledger(student_id);

-- ---------------------------------------------------------------- office bearers (OB list, per batch / tenure)
create table public.office_bearers (
  id          uuid primary key default gen_random_uuid(),
  batch_id    uuid references public.batches(id) on delete set null,
  tenure      text not null,           -- e.g. '2025-26'
  name        text not null,
  position    text not null,           -- 'President', 'Media Team', ...
  team        text not null default 'Office Bearers',
  department  text,
  photo_url   text,
  sort_order  int  not null default 100,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- gallery
create table public.gallery (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references public.events(id) on delete cascade,
  image_url   text not null,
  caption     text,
  sort_order  int not null default 100,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- site settings (single row)
create table public.site_settings (
  id                   boolean primary key default true check (id),
  blur_attendance      boolean not null default true,
  blur_activities      boolean not null default true,
  blur_points          boolean not null default true,
  leaderboard_public   boolean not null default true,
  registration_open    boolean not null default true,
  announcement         text,
  updated_at           timestamptz not null default now()
);
insert into public.site_settings (id) values (true);

-- ================================================================ helpers
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

-- Is the given dashboard section revealed for the current user?
create or replace function public.section_revealed(section text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select
    coalesce((select reveal_details from public.profiles where id = (select auth.uid())), false)
    or case section
         when 'attendance' then not s.blur_attendance
         when 'activities' then not s.blur_activities
         when 'points'     then not s.blur_points
         else false
       end
  from public.site_settings s where s.id;
$$;

-- Create a profile row whenever someone signs up (metadata comes from the register form).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, email, register_no, department, section, phone, batch_id)
  values (
    new.id,
    coalesce(nullif(meta->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(upper(meta->>'register_no'), ''),
    nullif(meta->>'department', ''),
    nullif(meta->>'section', ''),
    nullif(meta->>'phone', ''),
    nullif(meta->>'batch_id', '')::uuid
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Students may edit their own profile, but never role / reveal flag / email.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.reveal_details := old.reveal_details;
    new.email := old.email;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Leaderboard for one batch. Exposes only name / dept / avatar / points, never contact info.
create or replace function public.get_leaderboard(p_batch_id uuid)
returns table (student_id uuid, full_name text, department text, avatar_url text, points bigint, events_attended bigint, rank bigint)
language sql stable security definer set search_path = ''
as $$
  with totals as (
    select p.id, p.full_name, p.department, p.avatar_url,
           coalesce((select sum(l.points) from public.points_ledger l where l.student_id = p.id), 0) as points,
           (select count(*) from public.attendance a where a.student_id = p.id and a.status = 'present') as events_attended
    from public.profiles p
    where p.batch_id = p_batch_id and p.role = 'student'
  )
  select id, full_name, department, avatar_url, points, events_attended,
         rank() over (order by points desc, events_attended desc)
  from totals
  where public.is_admin() or (select leaderboard_public from public.site_settings where id)
  order by points desc, events_attended desc, full_name;
$$;

-- Public counters for the home page.
create or replace function public.get_public_stats()
returns table (volunteers bigint, events bigint, hours bigint, batches bigint)
language sql stable security definer set search_path = ''
as $$
  select
    (select count(*) from public.profiles where role = 'student'),
    (select count(*) from public.events where is_published),
    (select count(*) * 3 from public.attendance where status = 'present'),
    (select count(*) from public.batches);
$$;

-- ================================================================ RLS
alter table public.batches        enable row level security;
alter table public.profiles       enable row level security;
alter table public.events         enable row level security;
alter table public.attendance     enable row level security;
alter table public.points_ledger  enable row level security;
alter table public.office_bearers enable row level security;
alter table public.gallery        enable row level security;
alter table public.site_settings  enable row level security;

-- Public read content
create policy "batches readable by all"  on public.batches        for select using (true);
create policy "events readable by all"   on public.events         for select using (is_published or (select public.is_admin()));
create policy "obs readable by all"      on public.office_bearers for select using (true);
create policy "gallery readable by all"  on public.gallery        for select using (true);
create policy "settings readable by all" on public.site_settings  for select using (true);

-- Admin write on content
create policy "admin writes batches"  on public.batches        for all using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin writes events"   on public.events         for all using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin writes obs"      on public.office_bearers for all using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin writes gallery"  on public.gallery        for all using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin updates settings" on public.site_settings for update using ((select public.is_admin())) with check ((select public.is_admin()));

-- Profiles
create policy "read own profile or admin" on public.profiles for select
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "update own profile or admin" on public.profiles for update
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));
create policy "admin deletes profiles" on public.profiles for delete using ((select public.is_admin()));

-- Attendance: students see their own rows only once revealed
create policy "read attendance" on public.attendance for select using (
  (select public.is_admin())
  or (student_id = (select auth.uid())
      and (public.section_revealed('attendance') or public.section_revealed('activities')))
);
create policy "admin writes attendance" on public.attendance for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Points: students see their own ledger only once revealed
create policy "read points" on public.points_ledger for select using (
  (select public.is_admin())
  or (student_id = (select auth.uid()) and public.section_revealed('points'))
);
create policy "admin writes points" on public.points_ledger for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Function execute grants
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_profile_update() from public, anon, authenticated;
grant execute on function public.get_leaderboard(uuid) to anon, authenticated;
grant execute on function public.get_public_stats() to anon, authenticated;
grant execute on function public.section_revealed(text) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ================================================================ storage (photos uploaded from the admin panel)
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media public read"  on storage.objects for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects for insert with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and (select public.is_admin()));
