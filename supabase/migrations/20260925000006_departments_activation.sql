-- 1. Departments are the seven NSS units: CSE A, CSE B, AIDS, IT, EEE, ECE, MECH.
--    CSE was stored as department 'CSE' + section 'A'/'B'; fold the section into the department.
-- 2. lookup_volunteer(): lets the "Activate your account" page confirm that a register number
--    belongs to an imported volunteer who hasn't signed up yet.

update public.profiles
   set department = 'CSE ' || upper(trim(section)), section = null
 where upper(department) = 'CSE' and upper(trim(section)) in ('A', 'B');

update public.profiles
   set department = upper(department)
 where upper(department) in ('AIDS', 'IT', 'EEE', 'ECE', 'MECH');

-- Anything else (e.g. CSE without a section) is cleared for an admin to set from the Students page
update public.profiles
   set department = null
 where department is not null
   and department not in ('CSE A', 'CSE B', 'AIDS', 'IT', 'EEE', 'ECE', 'MECH');

alter table public.profiles drop constraint if exists profiles_department_check;
alter table public.profiles add constraint profiles_department_check
  check (department is null or department in ('CSE A', 'CSE B', 'AIDS', 'IT', 'EEE', 'ECE', 'MECH'));

-- Only answers for records that have no account yet; returns nothing for claimed or unknown numbers.
create or replace function public.lookup_volunteer(p_register_no text)
returns table (full_name text, department text, batch text)
language sql stable security definer set search_path = ''
as $$
  select p.full_name, p.department, b.label
  from public.profiles p
  left join public.batches b on b.id = p.batch_id
  where p.register_no = upper(trim(p_register_no))
    and not exists (select 1 from auth.users u where u.id = p.id);
$$;
grant execute on function public.lookup_volunteer(text) to anon, authenticated;
