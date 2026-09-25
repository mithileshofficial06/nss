-- Volunteer roster: profiles can exist before the student has an account, so attendance and
-- points from the NSS registers can be recorded for everyone on the volunteers list.
-- When a student signs up with a register number that matches an unclaimed profile, that profile
-- is re-keyed to their new auth user and keeps its attendance and points.
--
-- Weekly NSS-hour (ABSL) sessions are stored as events in the 'NSS Hour' category. They drive the
-- dashboard attendance percentage but are not counted as "events" in public figures.

-- ---------------------------------------------------------------- profiles without an auth user
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles alter column id set default gen_random_uuid();
alter table public.profiles alter column email drop not null;

-- Attendance and points follow a profile when it is claimed (its id changes)
alter table public.attendance drop constraint if exists attendance_student_id_fkey;
alter table public.attendance add constraint attendance_student_id_fkey
  foreign key (student_id) references public.profiles(id) on delete cascade on update cascade;
alter table public.points_ledger drop constraint if exists points_ledger_student_id_fkey;
alter table public.points_ledger add constraint points_ledger_student_id_fkey
  foreign key (student_id) references public.profiles(id) on delete cascade on update cascade;

-- Replaces the old profiles -> auth.users cascade: deleting an account deletes its profile
create or replace function public.handle_deleted_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.profiles where id = old.id;
  return old;
end;
$$;
drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_deleted_user();
revoke execute on function public.handle_deleted_user() from public, anon, authenticated;

-- ---------------------------------------------------------------- sign-up claims a roster profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  reg  text  := nullif(upper(trim(meta->>'register_no')), '');
begin
  if reg is not null then
    update public.profiles p set
      id         = new.id,
      email      = new.email,
      full_name  = coalesce(nullif(meta->>'full_name', ''), p.full_name),
      department = coalesce(nullif(meta->>'department', ''), p.department),
      section    = coalesce(nullif(meta->>'section', ''), p.section),
      phone      = coalesce(nullif(meta->>'phone', ''), p.phone),
      batch_id   = coalesce(nullif(meta->>'batch_id', '')::uuid, p.batch_id)
    where p.register_no = reg
      and not exists (select 1 from auth.users u where u.id = p.id);
    if found then
      return new;
    end if;
  end if;

  insert into public.profiles (id, full_name, email, register_no, department, section, phone, batch_id)
  values (
    new.id,
    coalesce(nullif(meta->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    reg,
    nullif(meta->>'department', ''),
    nullif(meta->>'section', ''),
    nullif(meta->>'phone', ''),
    nullif(meta->>'batch_id', '')::uuid
  );
  return new;
end;
$$;

-- The claim above runs without a signed-in user (auth.uid() is null), so the guard must let it
-- set the email. Signed-in students still can't change their role, reveal flag or email.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not public.is_admin() then
    new.role := old.role;
    new.reveal_details := old.reveal_details;
    new.email := old.email;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- leaderboard and public figures
create or replace function public.get_leaderboard(p_batch_id uuid)
returns table (student_id uuid, full_name text, department text, avatar_url text, points bigint, events_attended bigint, rank bigint)
language sql stable security definer set search_path = ''
as $$
  with totals as (
    select p.id, p.full_name, p.department, p.avatar_url,
           coalesce((select sum(l.points) from public.points_ledger l where l.student_id = p.id), 0) as points,
           (select count(*) from public.attendance a join public.events e on e.id = a.event_id
             where a.student_id = p.id and a.status = 'present' and e.category <> 'NSS Hour') as events_attended
    from public.profiles p
    where p.batch_id = p_batch_id and p.role = 'student'
  )
  select id, full_name, department, avatar_url, points, events_attended,
         rank() over (order by points desc, events_attended desc)
  from totals
  where public.is_admin() or (select leaderboard_public from public.site_settings where id)
  order by points desc, events_attended desc, full_name;
$$;

-- Service hours: 3 per event attended, 1 per NSS hour attended.
create or replace function public.get_public_stats()
returns table (volunteers bigint, events bigint, hours bigint, batches bigint)
language sql stable security definer set search_path = ''
as $$
  select
    (select count(*) from public.profiles where role = 'student'),
    (select count(*) from public.events where is_published and category <> 'NSS Hour' and event_date <= current_date),
    (select coalesce(sum(case when e.category = 'NSS Hour' then 1 else 3 end), 0)
       from public.attendance a join public.events e on e.id = a.event_id where a.status = 'present'),
    (select count(*) from public.batches);
$$;
