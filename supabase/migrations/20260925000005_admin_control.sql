-- Admin control of the whole site:
--   * site_content: editable copy and photos for the public pages, one JSON value per section
--     (hero, about, slides, objectives, pages, footer). Missing keys fall back to the defaults in
--     src/lib/content.ts, so an empty table renders the site exactly as shipped.
--   * Admins can add volunteers directly (profiles without an account, see migration 003).

create table if not exists public.site_content (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table public.site_content enable row level security;

drop policy if exists "content readable by all" on public.site_content;
create policy "content readable by all" on public.site_content for select using (true);
drop policy if exists "admin writes content" on public.site_content;
create policy "admin writes content" on public.site_content for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin inserts profiles" on public.profiles;
create policy "admin inserts profiles" on public.profiles for insert
  with check ((select public.is_admin()));
