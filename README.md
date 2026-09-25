# NSS LICET Portal

Public website, student portal and admin CMS for the NSS unit of Loyola-ICAM College of Engineering and Technology.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · Framer Motion · Supabase (Auth, Postgres, Storage, RLS)

## What's inside

| Area | Routes |
| --- | --- |
| Public site | `/` home · `/events` (upcoming / past, filters) · `/events/[slug]` · `/leaderboard` → `/leaderboard/[batch]` · `/team` (OB list by tenure & batch) · `/gallery` |
| Student auth | `/register` (3-step form, saved to Supabase) → `/login` |
| Student dashboard | `/dashboard`: details, activities, attendance %, points, batch rank. Sections stay blurred until an admin reveals them |
| Admin | `/admin/login` → `/admin` overview, students, events, attendance, leaderboard & points, office bearers, gallery, settings & visibility |

### How the blur works
`site_settings` has three switches (`blur_activities`, `blur_attendance`, `blur_points`). Each student also has a `reveal_details` flag, which admins can set per student or for a whole batch at once.
This is enforced in the database: RLS on `attendance` and `points_ledger` refuses the rows until the section is revealed. The server only sends placeholder content to a locked section, so the data can't be read from the browser.

### Leaderboard
Points live in `points_ledger`. A student's total is the sum of their entries. Points come from:
- **Attendance:** marking a student present auto-awards the event's points, and unmarking removes them.
- **Manual awards/deductions:** on `/admin/points`.
- **CSV bulk import:** rows of `register_no,points,reason`.

## Setup

1. **Install:** `npm install`
2. **Create a Supabase project** (free plan allows 2 active projects per owner).
3. **Run the migrations** in `supabase/migrations/` in order. Paste each one into the Supabase SQL editor, or use `supabase db push`.
   - `…_init_schema.sql`: tables, RLS policies, functions, the `media` storage bucket
   - `…_seed_content.sql`: batches 22-26 → 26-30, the 2025-26 events, OB list, and gallery
4. **Env vars:** copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Both are under Project Settings → API.
5. **Auth URLs:** in Supabase → Authentication → URL Configuration, set **Site URL** to your domain and add `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback`) to the redirect URLs.
   If you don't want email confirmation, turn off *Confirm email* under Auth → Providers → Email.
6. **Create the first admin:** register normally at `/register`, then run this in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   After that, admins can promote other users from `/admin/students`.
7. `npm run dev` → http://localhost:3000

Without Supabase keys, the public pages still render from bundled demo data (`src/lib/fallback.ts`). Login, the dashboard and admin need a real project.

## Photos
- Photos from the Drive export are converted to WebP in `public/images/` (events + Orientation Day 2026).
- New photos: upload them in **Admin → Gallery**, **Events** (cover) or **Office bearers** (portrait). They're resized to WebP in the browser and stored in the Supabase `media` bucket.
- HEIC files from iPhones may not decode in every browser. Convert them to JPG first if an upload fails.

## Project layout
```
src/
  app/(site)/        public pages + dashboard (navbar/footer layout)
  app/(auth)/        login, register
  app/admin/         admin login, (panel)/ pages, actions.ts (server actions)
  app/auth/          email callback, sign-out
  components/        ui/ (motion, cursor, wheel) · site/ · auth/ · admin/ · dashboard/
  lib/               supabase clients, data access, types, fallback data
  proxy.ts           session refresh + route protection (Next 16's replacement for middleware)
supabase/migrations/ schema + seed
```
