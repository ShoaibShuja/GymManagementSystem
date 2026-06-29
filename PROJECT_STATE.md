# Project State

## Current Phase

Phase 8: Role-based access finalized.

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
- Admin-only user/profile management is available under Settings > Users for existing profiles.
- Admins can list profiles and change a user's role between admin and staff.
- Admins cannot remove their own admin role from the Users page.
- Manual Payment Tracking page now shows a selected-month payment overview for all members.
- Payment status is calculated from whether a `payments` record exists for the member and selected month.
- Expected amount due is calculated from the member's selected membership plan price.
- Staff and admins can mark members as paid and add optional payment notes.
- Staff and admins can edit payment notes.
- Admins can remove payment records after a confirmation popup.
- Payment history table shows member name, amount, payment month, payment date, recorded-by user, and notes.
- Payment filters added for month, paid/unpaid status, and member name or phone search.
- Payment mark-as-paid validation now accepts existing Postgres UUID values used by the seed data and shows readable validation errors.
- Marking a member as paid updates the member status to active only when the action is performed by an admin.
- Basic Attendance page now supports member search, member selection, optional notes, and check-in recording.
- Attendance check-ins create `attendance_logs` records with member, check-in time, notes, and recorded-by profile.
- Today's attendance log and recent attendance history tables are live.
- Member rows now include an Attendance action that shows recent check-ins for that member.
- Admins can delete attendance records after confirmation; staff can record and view attendance.
- Duplicate check-ins are blocked if the same member was checked in within the last 10 minutes.
- Inactive and expired members show a friendly warning before check-in, but staff/admin can still decide to record the visit.
- Main Dashboard now shows live overview cards for active members, inactive members, expired members, pending payments this month, collected payments this month, expiring memberships, and today's attendance.
- Dashboard expiry alerts now highlight members whose membership ends within a configurable number of days. The default alert window is 7 days.
- Dashboard uses simple cards, focused lists, skeleton loading states, error states, and empty states without complex charts.
- Member filters are complete for name/phone search, member status, membership plan, payment state, and selected payment month.
- Trainer filters are complete for name/phone search, trainer status, and specialty.
- Attendance history filters are complete for member search and date filtering.
- Membership plan search is now active instead of a placeholder.
- Role-based access has been finalized for Admin and Staff/Receptionist.
- Admins can manage members, trainers, membership plans, payments, attendance records, and staff profile roles.
- Staff users can view members, trainers, plans, dashboard data, payment records, and attendance records.
- Staff users can record payments, edit payment notes, and record attendance check-ins.
- Staff users cannot add/edit/delete members, manage plans, manage trainers, manage assignments, delete records, open admin settings, or manage roles.
- Restricted navigation links are hidden for staff users.
- Admin-only settings routes show a friendly access denied page if a staff user reaches them directly.
- A follow-up RLS migration tightens database security so staff cannot write member rows or update attendance rows directly.
- Auth helper utilities are available for current user, current profile, role checks, and admin requirements.

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
- Admin users can manage operational records and profile roles.
- Staff users can view operational records, record payments, edit payment notes, and record attendance check-ins.
- Staff users cannot manage members, plans, trainers, trainer assignments, user roles, or delete records.
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
- `supabase/migrations/202606290002_finalize_role_access.sql`: final role access tightening for member/profile/attendance RLS.
- `supabase/seed.sql`: development seed data.

## Next Step

Prepare deployment documentation and Supabase setup steps for a production environment.

## Known Limitations

- Signup is not exposed in the app; login accounts should be created through Supabase Auth.
- The Users page manages existing profile roles only. It does not create Supabase Auth accounts or send invitations.
- A user must have a matching `profiles` row before they can access the dashboard.
- Advanced trainer scheduling, booking, and calendar sync were intentionally not added.
- Online payment gateways, invoices, and complex financial reports were intentionally not added.
- Advanced scheduling, calendar integration, biometric devices, and hardware check-in integrations were intentionally not added.
