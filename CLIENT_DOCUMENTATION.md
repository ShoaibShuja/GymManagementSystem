# Client Documentation

## 1. Project Overview

The Gym Management System is a simple web app for running a small gym. It helps the owner and staff keep daily gym records in one place instead of using paper notebooks or scattered spreadsheets.

The app helps with:

- Members and their membership dates.
- Trainers and trainer assignments.
- Membership plans and prices.
- Manual monthly payment tracking.
- Attendance check-ins.
- Dashboard totals and expiry alerts.
- Admin and staff access control.

The app does not do:

- Online card payments.
- Public customer signup.
- Email or SMS marketing.
- Trainer scheduling or booking.
- Inventory or equipment tracking.
- Multiple branch management.
- Advanced business analytics.

## 2. Login Guide

Open the app and go to the login page. Enter the email and password created for you by the gym administrator.

There is no public signup page. New login accounts must be created in Supabase by a developer or administrator, and each login user must also have a matching app profile.

There are two user roles:

- Admin: full access. Admins can manage members, trainers, plans, payments, attendance, and user roles.
- Staff: limited access. Staff can view daily records, record attendance, record payments, and edit payment notes. Staff cannot manage members, trainers, plans, assignments, roles, or delete records.

If you can log in but cannot open a page or button, your role may not allow that action.

## 3. Dashboard Guide

The Dashboard gives a quick view of the gym today.

Dashboard cards:

- Active members: members currently marked as active.
- Inactive members: members kept in records but not currently active.
- Expired members: members whose status is expired.
- Pending payments: members who do not have a paid record for the current month.
- Collected this month: total manual payments recorded as paid this month.
- Expiring soon: memberships ending within the selected alert window.
- Today's attendance: check-ins recorded today.

Expiry alerts show members whose membership end date is close. The Dashboard has an "Expiry alert days" field. It starts at 7 days, but you can change it from 1 to 60 days while viewing the Dashboard.

Pending payments are based on the selected current month. If a member does not have a paid payment record for that month, they are counted as pending.

## 4. Members Guide

The Members page stores member contact details, membership plan, status, join date, membership dates, and notes.

To add a member as an Admin:

1. Open Members.
2. Click Add member.
3. Enter the member name and phone number.
4. Add email, address, and notes if needed.
5. Choose a status.
6. Choose a membership plan.
7. Choose the membership start date.
8. Save the member.

To edit a member as an Admin:

1. Open Members.
2. Find the member using search or filters.
3. Click Edit.
4. Update the details.
5. Save the changes.

To deactivate a member, edit the member and change the status to Inactive. This keeps the member in the records.

To delete a member as an Admin, click Delete and confirm. Deleting permanently removes the member record, so use it carefully. Staff users cannot delete members.

Membership dates:

- The start date is the date the membership begins.
- The end date is calculated from the selected plan duration.
- A 1-month plan starting on June 1 ends on June 30.
- A 3-month plan starting on June 1 ends on August 31.

Member status:

- Active: the member currently uses the gym.
- Inactive: the member is kept in records but is not currently active.
- Expired: the membership needs renewal or follow-up.

## 5. Trainers Guide

The Trainers page stores trainer name, phone, specialty, status, notes, and assigned members.

To add a trainer as an Admin:

1. Open Trainers.
2. Click Add trainer.
3. Enter the trainer name.
4. Add phone, specialty, and notes if needed.
5. Choose Active or Inactive.
6. Save the trainer.

To assign a trainer to a member as an Admin:

1. Open Trainers.
2. Find the trainer.
3. Open Assignments.
4. Select an active member.
5. Click Assign.

To remove an assignment as an Admin:

1. Open the trainer's Assignments window.
2. Find the assigned member.
3. Click Remove.

Removing an assignment only removes the trainer-member link. It does not delete the trainer or member.

Staff can view trainers and assignments, but staff cannot add trainers or manage assignments.

## 6. Plans Guide

Membership plans control the price and duration of a member's membership.

Common plans are:

- Monthly: usually 1 month.
- Quarterly: usually 3 months.
- Yearly: usually 12 months.

Plan price affects the expected payment amount on the Payments page. If a member is assigned to a Monthly plan, the Monthly plan price is used as the expected amount.

Plan duration affects the member's membership end date. When you choose a plan and start date for a member, the app calculates the end date from the plan duration.

Only Admin users can add, edit, or deactivate plans. Staff users can view plans.

## 7. Payments Guide

Payments are manual. The app records that a payment happened, but it does not collect money online.

To check paid and unpaid members:

1. Open Payments.
2. Choose the payment month.
3. Use the All, Paid, or Unpaid filter.
4. Search by member name or phone if needed.

To mark a payment as paid:

1. Open Payments.
2. Choose the correct month.
3. Find the member.
4. Click Mark paid.
5. Add notes if needed.
6. Save the payment.

Payment history shows saved payment records. It includes the member, amount, payment month, payment date, who recorded it, and notes.

Admins can remove payment records after confirmation. Staff can record payments and edit payment notes, but staff cannot delete payment records.

## 8. Attendance Guide

Attendance is a simple check-in log for gym visits.

To check in a member:

1. Open Attendance.
2. Search for the member by name or phone.
3. Select the member.
4. Add a note if needed.
5. Click Check in.

The app records the member, time, note, and logged-in user who recorded the check-in.

Attendance history is shown on the Attendance page. You can filter it by member name, phone number, and date. The Members page also has an Attendance action to view a member's recent check-ins.

If a member is inactive or expired, the app shows a warning before check-in. The check-in can still be recorded because some gyms allow exceptions.

The same member cannot be checked in again within 10 minutes. This helps prevent accidental duplicate entries.

## 9. Search and Filter Guide

Use search boxes to quickly find records.

You can search members by:

- Name.
- Phone number.

You can filter member lists by:

- Status.
- Membership plan.
- Payment state.
- Payment month.

You can search trainers by name or phone, and filter by status or specialty.

You can filter payments by month and paid or unpaid state.

You can filter attendance by member search and date.

## 10. Maintenance Guide

Regular maintenance tasks:

- Update membership prices from the Plans page.
- Update member phone, email, address, notes, plan, and status from the Members page.
- Deactivate old members instead of deleting them when you want to keep history.
- Deactivate old trainers instead of deleting them when you want to keep history.
- Review pending payments every month.
- Review expiry alerts daily or weekly.

Do not change these without a developer:

- Supabase database tables.
- Supabase security policies.
- Vercel environment variables.
- Source code files.
- Auth account IDs or database IDs.
- Production database migrations.

## 11. Customization Guide

App name:

- The browser title is in `src/app/layout.tsx`.
- Sidebar and login screen text is in `src/components/layout/dashboard-shell.tsx` and `src/app/(auth)/login/page.tsx`.

Logo:

- The current app uses text branding, not an uploaded gym logo.
- If a logo is added later, it should be placed in `public` and connected in the layout or login page by a developer.

Colors:

- Main colors are in `src/app/globals.css`.
- Change colors carefully because contrast and readability matter.
- Ask a developer to check mobile screens after color changes.

Plan prices:

- Admins can change plan prices from the Plans page.
- Existing member records keep their selected plan, but payment amounts are based on the current plan price shown in the app.

Expiry alert days:

- The Dashboard starts with 7 alert days.
- Users can change the alert window directly on the Dashboard from 1 to 60 days.
- The default value is currently set in `src/features/dashboard/dashboard-view.tsx`.

## 12. Troubleshooting

Cannot log in:

- Check the email and password.
- Confirm the user exists in Supabase Auth.
- Confirm the user has a matching profile row in the app database.
- Confirm Supabase environment variables are set correctly.

Member not showing:

- Clear search text and filters.
- Check the member status filter.
- Check whether the member was deleted.
- Refresh the page.

Payment not showing:

- Check the selected payment month.
- Change the filter to All.
- Search by member name or phone.
- Confirm the payment was saved successfully.

Wrong expiry date:

- Check the member start date.
- Check the selected membership plan.
- Check the plan duration in months.
- Edit and save the member if the wrong plan or start date was selected.

Staff cannot access something:

- This may be correct. Staff users have limited access.
- Ask an Admin to perform admin-only actions such as editing members, managing plans, managing trainers, deleting records, or changing roles.

Supabase or Vercel environment variable issues:

- Check `NEXT_PUBLIC_SUPABASE_URL`.
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Check `SUPABASE_SERVICE_ROLE_KEY` if server admin actions need it.
- Make sure the same values are set in Vercel project settings for production.
- Redeploy the app after changing Vercel environment variables.

## 13. Developer Handover

Tech stack:

- Next.js 16 App Router.
- TypeScript.
- Tailwind CSS 4.
- shadcn/ui.
- Supabase Auth and Postgres with RLS.
- TanStack Query.
- React Hook Form.
- Zod.
- date-fns.
- Vercel hosting.

Main folder structure:

- `src/app`: routes, layouts, global styles, dashboard pages, auth pages.
- `src/components`: shared layout and UI components.
- `src/components/ui`: shadcn/ui components.
- `src/features`: feature modules for members, trainers, plans, payments, attendance, dashboard, auth, and users.
- `src/lib`: Supabase helpers, auth helpers, validation helpers, error helpers.
- `src/types`: database types.
- `supabase/migrations`: database schema and RLS migrations.
- `supabase/seed.sql`: development seed data.

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for admin operations.
- `SUPABASE_DB_PASSWORD`: optional local Supabase CLI value.
- `SUPABASE_PROJECT_ID`: optional local Supabase CLI value.

Database tables:

- `profiles`.
- `membership_plans`.
- `members`.
- `trainers`.
- `trainer_member_assignments`.
- `payments`.
- `attendance_logs`.

Deployment notes:

- Apply Supabase migrations before using the app in production.
- Enable and keep RLS policies in Supabase.
- Create Supabase Auth users manually.
- Ensure each Auth user has a matching `profiles` row.
- Set environment variables in Vercel.
- Deploy from the production branch.
- Run lint, typecheck, and build before release.

Common commands:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm run format
```
