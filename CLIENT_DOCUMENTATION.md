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

The login screen and protected dashboard layout have also been added. After signing in, users see the main app navigation and the first working management pages.

Membership Plans and Members now have real tables and forms. Trainers, payments, and attendance are still placeholders and will be added in the next phases.

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

## Membership Plans

Membership plans are the packages the gym sells, such as Monthly, Quarterly, or Yearly.

To add a membership plan:

1. Open Plans from the dashboard menu.
2. Click New plan.
3. Enter the plan name, duration in months, and price.
4. Click Save plan.

Admins can edit a plan later. Admins can also deactivate a plan. Deactivating is safer than deleting because old member records can still show which plan they used.

Staff users can view plans, but plan creation and editing are admin-only.

## Members

The Members page shows each member's name, phone number, plan, status, join date, and membership end date.

To add a member:

1. Open Members from the dashboard menu.
2. Click Add member.
3. Enter the member name and phone number.
4. Select the member status.
5. Select a membership plan.
6. Choose the membership start date.
7. Add notes if needed.
8. Click Save member.

The membership end date is calculated automatically from the selected plan. For example, if a member starts a 1-month plan on June 1, the end date becomes June 30. If the plan is 3 months, the system counts 3 months from the start date and uses the day before as the end date.

Admins and staff can add and edit members. Only admins can delete members.
When an admin clicks Delete, the app asks for confirmation before permanently removing the member record.

## Member Status

- Active means the member currently has an active membership.
- Inactive means the member is not currently using the gym but is kept in the records.
- Expired means the member's membership period has ended or needs renewal.

## Payments

Payments are tracked manually. The system records whether a member paid for a month, the amount, the payment date, and notes.

The app does not process online payments, charge cards, or connect to a payment gateway.

## Current Next Step

The next step is to build trainer management and trainer assignment, then turn the member search box into a real search and filter tool.
