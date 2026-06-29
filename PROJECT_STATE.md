# Project State

## Current Phase

Phase 2: Authentication flow and protected dashboard shell.

## Completed Setup

- Date: 2026-06-29
- Next.js App Router project organized under `src/app`.
- TypeScript strict mode is enabled.
- Tailwind CSS and shadcn/ui are configured.
- ESLint and Prettier scripts are available.
- TanStack Query provider is wired into the root layout.
- Basic Supabase browser, server, and admin client helpers are in `src/lib/supabase`.
- A clean foundation landing screen replaced the default starter page.
- `.env.example` was added for Supabase environment variables.
- Supabase SQL migration added for core database tables.
- RLS policies added for admin and staff access.
- Development seed data added for plans, trainers, members, payments, and attendance.
- Typed Supabase clients and server auth helpers added.
- Login page added with Supabase email/password authentication.
- Logout action added.
- Next.js `proxy.ts` added to refresh Supabase auth sessions.
- Protected dashboard route group added.
- Responsive dashboard shell added with sidebar, top bar, mobile navigation, user profile display, and logout.
- Placeholder pages added for Dashboard, Members, Trainers, Plans, Payments, Attendance, Settings, and Users.
- Role-aware navigation added so staff users do not see admin-only links.
- Admin-only settings routes are protected server-side.

## Installed Packages

- `@supabase/supabase-js`
- `@supabase/ssr`
- `@tanstack/react-query`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `date-fns`
- `lucide-react`
- `sonner`
- `shadcn`
- `prettier`

## Database Tables Added

- `profiles`
- `membership_plans`
- `members`
- `trainers`
- `trainer_member_assignments`
- `payments`
- `attendance_logs`

## Security Added

- RLS is enabled on all public app tables.
- Admin users can manage all records.
- Staff users can view operational records and create/update member, payment, and attendance records.
- Staff users cannot delete critical records.
- Profiles are protected so users can only see their own profile unless they are admin.

## Folder Structure

- `src/app`: Next.js App Router routes, layout, and global styles.
- `src/components`: shared UI and provider components.
- `src/components/ui`: shadcn/ui components.
- `src/features`: future feature modules.
- `src/lib`: shared utilities and Supabase clients.
- `src/hooks`: future shared hooks.
- `src/schemas`: future Zod schemas.
- `src/types`: shared TypeScript types.

## Supabase Files

- `supabase/migrations/202606290001_initial_schema.sql`: schema, constraints, indexes, triggers, helper functions, and RLS policies.
- `supabase/seed.sql`: development seed data.

## Next Step

Build the first real feature workflow: member management CRUD with Zod validation, React Hook Form, Supabase queries, and table search/filter UI.

## Known Limitations

- Signup is not exposed in the app; users should be created through Supabase Auth or a future admin-only user management page.
- Dashboard metric cards are placeholders and do not query live records yet.
- Feature pages are protected placeholders only; CRUD workflows are not built yet.
- A user must have a matching `profiles` row before they can access the dashboard.
