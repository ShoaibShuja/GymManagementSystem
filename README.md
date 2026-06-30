# Gym Management System

A production-ready Gym Management System MIS for a small gym. It manages members, trainers, membership plans, manual payments, attendance, expiry alerts, and admin/staff access.

The app is intentionally simple. It does not include online payments, public signup, marketing tools, booking, inventory, multi-location support, or advanced analytics.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Supabase Auth and Postgres with RLS
- TanStack Query
- React Hook Form
- Zod
- date-fns
- lucide-react
- Vercel

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
copy .env.example .env.local
```

Fill in the Supabase values in `.env.local`.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Required for the app:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Variable notes:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL. This is safe to expose.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key. This is safe to expose because RLS protects the data.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key. This is server-only and must never be exposed in browser code, screenshots, or client-side logs.

Optional for Supabase CLI or project scripts:

```bash
SUPABASE_DB_PASSWORD=
SUPABASE_PROJECT_ID=
```

Local setup uses `.env.local` in the project root. Production setup uses the Environment Variables screen in Vercel. Do not commit real `.env`, `.env.local`, `.env.production`, or service role values. Only `.env.example` should be committed.

## Local Development Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run format:check
npm run format
```

Command purpose:

- `npm run dev`: starts local development.
- `npm run lint`: runs ESLint.
- `npm run typecheck`: runs TypeScript checks.
- `npm run build`: creates a production build.
- `npm run format:check`: checks formatting.
- `npm run format`: formats files.

## Supabase Setup

Use a separate Supabase project for production.

1. Create a Supabase project.
2. Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the anon key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY`. Keep it private.
5. Apply the SQL migrations in `supabase/migrations` in order.
6. Confirm RLS is enabled on all app tables.
7. Do not run development seed data in production unless the client wants demo records.
8. Create Supabase Auth users manually.
9. Ensure every Auth user has a matching row in `profiles`.

Current database tables:

- `profiles`
- `membership_plans`
- `members`
- `trainers`
- `trainer_member_assignments`
- `payments`
- `attendance_logs`

RLS is part of the security model. Keep RLS enabled in production.

### Production Seed Data Strategy

For development, `supabase/seed.sql` can create sample plans, members, trainers, payments, and attendance.

For production, prefer a clean database:

1. Apply migrations.
2. Create the first admin user.
3. Add real plans from the app.
4. Add real members, trainers, payments, and attendance from the app.

Only run seed data in production if the client explicitly wants demo data, and remove demo records before launch.

### Supabase Auth Checklist

In Supabase Dashboard, check:

- Email/password auth is enabled.
- Public signup remains disabled unless the business explicitly wants signup.
- The production Site URL is set to the Vercel production URL.
- Redirect URLs include the production URL.
- Redirect URLs include `http://localhost:3000` for local testing.
- Auth users are created manually for the owner and staff.
- Every Auth user has a matching `profiles` row.

### First Admin User

The app does not include public signup or an invitation flow. Create the first admin from Supabase:

1. Open Supabase Dashboard.
2. Go to Authentication, then Users.
3. Create a user for the gym owner.
4. Copy the new user's UUID.
5. Open SQL Editor.
6. Insert the matching admin profile:

```sql
insert into public.profiles (id, full_name, role)
values ('PASTE_AUTH_USER_UUID_HERE', 'Gym Owner', 'admin');
```

After this, the owner can log in and use Settings > Users to change existing profile roles between Admin and Staff.

## Project Structure

- `src/app`: App Router routes, layouts, and global styles.
- `src/app/(auth)`: login route.
- `src/app/(dashboard)`: protected dashboard routes.
- `src/components`: shared layout and reusable components.
- `src/components/ui`: shadcn/ui components.
- `src/features`: feature modules.
- `src/lib`: Supabase, auth, validation, error helpers, and utilities.
- `src/types`: database types.
- `supabase/migrations`: database schema and RLS policies.
- `supabase/seed.sql`: development seed data.

## Vercel Deployment

Recommended deployment target: Vercel.

### Vercel Project Settings

- Framework Preset: Next.js.
- Install Command: `npm install`.
- Build Command: `npm run build`.
- Output Directory: leave as Vercel default for Next.js.
- Development Command: `npm run dev`.
- Node version: use Vercel default unless a project policy requires pinning one.

### Step-by-Step Deployment

1. Push the production branch to GitHub.
2. Create or connect a Vercel project.
3. Select the repository.
4. Confirm the framework preset is Next.js.
5. Keep the install command as `npm install`.
6. Keep the build command as `npm run build`.
7. Add environment variables in Vercel Project Settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

8. Apply Supabase migrations to the production Supabase project.
9. Configure Supabase Auth Site URL and redirect URLs for the Vercel domain.
10. Create the first admin user and matching `profiles` row.
11. Run checks locally before release:

```bash
npm run lint
npm run typecheck
npm run build
```

12. Deploy on Vercel.
13. Test the production URL:

- Logged-out users should go to `/login`.
- Logged-in users should go to `/dashboard`.
- Staff users should not see Settings or Users.
- Mobile navigation should open and close correctly.
- Members, payments, attendance, and dashboard data should load from the production Supabase project.

After changing environment variables in Vercel, redeploy the app.

### Production Security Notes

- Do not commit `.env.local`.
- Do not paste `SUPABASE_SERVICE_ROLE_KEY` into client-side code.
- Do not disable RLS to fix deployment issues.
- Do not use development seed data as real production data.
- Do not give Staff users Admin role unless they should manage records and roles.

## Documentation

- Client and handover guide: `CLIENT_DOCUMENTATION.md`
- Current build state: `PROJECT_STATE.md`
- Version 1 release notes: `RELEASE_NOTES.md`
