# Project State

## Current Phase

Phase 2: Supabase database and auth foundation.

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

Build the authentication screens, protected dashboard route group, and first admin/staff login flow.
