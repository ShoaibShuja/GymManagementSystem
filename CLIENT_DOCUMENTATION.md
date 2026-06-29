# Client Documentation

## What This Project Is

This project is a Gym Management System for a small gym. It will help the gym owner manage members, trainers, membership plans, payments, attendance, and expiry alerts from one simple web app.

## Technology Used

The project uses modern web technology:

- Next.js for the website and app screens.
- TypeScript to reduce coding mistakes.
- Tailwind CSS and shadcn/ui for a clean, professional design.
- Supabase for the database and login system.
- TanStack Query for keeping app data fresh.
- React Hook Form and Zod for reliable forms.
- Vercel for hosting.

## What Has Been Completed So Far

The project foundation is ready. The app now has the main development tools, UI component system, styling setup, Supabase connection helpers, and basic project folders.

The database design has also been added. It stores gym members, trainers, membership plans, trainer assignments, manual payments, attendance check-ins, and user profiles.

The login screen and protected dashboard layout have also been added. After signing in, users see the main app navigation and placeholder pages for each gym section.

Member pages, trainer pages, payments, and attendance are still placeholders. The real forms, tables, and workflows will be added in the next phases.

## Basic Project Organization

- `src/app` holds the app pages and main layout.
- `src/components` holds reusable screen parts.
- `src/components/ui` holds ready-made UI pieces like buttons, cards, inputs, tables, dialogs, and badges.
- `src/features` will hold gym features such as members, trainers, payments, and attendance.
- `src/lib` holds shared helper code, including Supabase setup.
- `src/schemas` will hold form validation rules.
- `src/types` holds shared TypeScript types.

## What The Database Stores

- User profiles: the people who can log in to the app.
- Membership plans: Monthly, Quarterly, and Yearly plans.
- Members: gym member contact details, membership dates, status, and notes.
- Trainers: trainer contact details, specialty, status, and notes.
- Trainer assignments: which trainer is assigned to which member.
- Payments: manual monthly payment records.
- Attendance: member check-in records.

## User Roles

There are two app roles:

- Admin: can manage all records, plans, trainers, members, payments, attendance, and staff profiles.
- Staff: can view daily gym records and help with member operations, payments, and attendance, but cannot delete critical records or manage roles.

Admin users see admin-only navigation such as Settings and Users. Staff users do not see those links.

## Login

Users sign in with an email and password created in Supabase. A user also needs a matching app profile before the dashboard opens.

There is no public signup page. This keeps the app safer for a real gym because new staff accounts should be created by the owner or administrator.

## Dashboard Navigation

The dashboard has links for:

- Dashboard
- Members
- Trainers
- Plans
- Payments
- Attendance
- Settings and Users for admins only

On desktop, the navigation is shown in the sidebar. On mobile, it opens from the menu button at the top.

## Payments

Payments are tracked manually. The system records whether a member paid for a month, the amount, the payment date, and notes.

The app does not process online payments, charge cards, or connect to a payment gateway.

## Current Next Step

The next step is to build the first real workflow: adding, editing, searching, and managing gym members.
