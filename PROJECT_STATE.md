# Project State

## Current Phase

Phase 4: Trainer management and trainer assignments MVP.

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
- Membership Plans page now lists plans, creates plans, edits plans, and deactivates plans instead of hard deleting them.
- Member Management page now lists members, adds members, edits members, and allows admin-only member deletion.
- Member deletion now requires a confirmation popup before the record is permanently deleted.
- React Hook Form and Zod validation added for membership plan and member forms.
- Member form calculates the membership end date from the selected plan duration and membership start date.
- TanStack Query is used for plans and members data fetching, loading skeletons, error states, and mutation invalidation.
- Trainer Management page now lists trainers, creates trainers, edits trainers, and deactivates trainers instead of hard deleting them.
- Trainer form uses React Hook Form and Zod validation for name, phone, specialty, status, and notes.
- Trainer-to-member assignment feature is complete using the `trainer_member_assignments` table.
- Admins can assign one trainer to multiple active members and remove assignments.
- Staff users can view trainers and assigned members without seeing admin-only actions.

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

Build payment tracking MVP with monthly paid/unpaid records, manual mark-as-paid, and payment history.

## Known Limitations

- Signup is not exposed in the app; users should be created through Supabase Auth or a future admin-only user management page.
- Dashboard metric cards are placeholders and do not query live records yet.
- Dashboard metric cards, payments, and attendance pages are still placeholders.
- A user must have a matching `profiles` row before they can access the dashboard.
- Member search and plan search inputs are placeholders; real filtering is a future step.
- Payment logic was intentionally not added in this step.
- Advanced trainer scheduling, booking, and calendar sync were intentionally not added.
