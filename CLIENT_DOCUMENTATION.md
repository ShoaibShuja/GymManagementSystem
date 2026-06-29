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

The Dashboard, Membership Plans, Members, Trainers, Payments, Attendance, Settings, and Users pages now have real tables, forms, totals, alerts, search/filter controls, role-based access, and a polished responsive interface.

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

- Admin: can manage members, trainers, membership plans, payments, attendance records, and staff profile roles.
- Staff: can view daily gym records, record payments, edit payment notes, and record attendance check-ins.

Admin users see admin-only navigation such as Settings and Users. Staff users do not see those links.

The database security rules also enforce these permissions. Hiding buttons in the app is only for a cleaner screen; it is not the only security layer.

## Admin Role

Admins can:

- Add, edit, and delete members.
- Add, edit, and deactivate membership plans.
- Add, edit, and deactivate trainers.
- Manage trainer assignments.
- Record and edit manual payments.
- Remove payment records.
- Record attendance.
- Delete attendance records.
- Open Settings and Users.
- Change existing profile roles between Admin and Staff.

Admins should be limited to trusted owners or managers because they can change important records.

## Staff Role

Staff or receptionists can:

- View dashboard numbers and expiry alerts.
- View members and member attendance history.
- View trainers and trainer assignments.
- View membership plans.
- Record manual payments and edit payment notes.
- Record attendance check-ins.
- Search and filter records for daily work.

Staff cannot:

- Add, edit, or delete members.
- Add, edit, or deactivate plans.
- Add, edit, or deactivate trainers.
- Manage trainer assignments.
- Delete payments or attendance records.
- Open admin settings.
- Manage user roles.

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

## User Interface Guide

The app is designed to be simple for a small gym team.

- Use the sidebar on desktop to move between pages.
- Use the menu button on mobile to open the same navigation.
- Main actions, such as Add member or Mark paid, appear near the top of the relevant page or inside the table row they affect.
- Search boxes and filters sit above the related table.
- Status badges show important states such as Active, Inactive, Expired, Paid, and Unpaid.
- Destructive actions such as Delete, Remove, or Deactivate use stronger styling and ask for confirmation where needed.
- Empty screens explain what to do next instead of showing a blank page.
- Loading skeletons show that the app is fetching data.
- Success and error messages appear as small notifications after actions.

On smaller screens, tables can scroll sideways. Forms and dialogs stay within the screen so staff can complete work from a phone.

## Dashboard Overview

The Dashboard gives the owner and staff a quick daily summary.

It shows:

- Active members: members currently marked as Active.
- Inactive members: members kept in the system but not currently active.
- Expired members: members whose status is Expired.
- Pending payments: members who do not have a paid payment record for the current month.
- Collected this month: total manual payment amount recorded for the current month.
- Expiring soon: members whose membership end date is inside the alert window.
- Today's attendance: check-ins recorded today.

These numbers are for daily business tracking. They are intentionally simple and do not include advanced charts or complex analytics.

## Expiry Alerts

The Dashboard shows a Membership Expiry Alerts list.

By default, it shows members whose membership ends within 7 days. The alert days field can be changed on the Dashboard if the gym wants to look further ahead.

Each alert shows the member name, phone number, plan, status, end date, and how many days are left. This helps staff follow up before a membership expires.

## Membership Plans

Membership plans are the packages the gym sells, such as Monthly, Quarterly, or Yearly.

The Plans page has a search box to find plans by name.

To add a membership plan:

1. Open Plans from the dashboard menu.
2. Click New plan.
3. Enter the plan name, duration in months, and price.
4. Click Save plan.

Admins can edit a plan later. Admins can also deactivate a plan. Deactivating is safer than deleting because old member records can still show which plan they used.

Staff users can view plans, but plan creation and editing are admin-only.

## Members

The Members page shows each member's name, phone number, plan, status, join date, and membership end date.

The Members page can be searched and filtered. Staff can search by member name or phone number, filter by member status, filter by membership plan, and filter by paid or unpaid payment state for a selected month.

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

Only admins can add, edit, or delete members. Staff can view member records, search and filter members, and open member attendance history.
When an admin clicks Delete, the app asks for confirmation before permanently removing the member record.

## Member Status

- Active means the member currently has an active membership.
- Inactive means the member is not currently using the gym but is kept in the records.
- Expired means the member's membership period has ended or needs renewal.

## Trainers

The Trainers page stores trainer profiles and shows which members are assigned to each trainer.

The Trainers page can be searched by trainer name or phone number. It can also be filtered by Active or Inactive status and by specialty.

To add a trainer:

1. Open Trainers from the dashboard menu.
2. Click Add trainer.
3. Enter the trainer name.
4. Add phone, specialty, and notes if needed.
5. Choose Active or Inactive.
6. Click Save trainer.

Admins can edit trainers later. Admins can also deactivate a trainer instead of deleting the trainer record. This keeps old records safer.

Staff users can view trainers and assigned members, but they cannot add, edit, deactivate, assign, or remove trainer assignments.

## Trainer Assignments

Trainer assignments connect trainers to members. One trainer can be assigned to many members.

To assign a trainer to a member:

1. Open Trainers from the dashboard menu.
2. Find the trainer.
3. Click Assignments.
4. Select an active member from the list.
5. Click Assign.

To remove a trainer assignment:

1. Open the trainer's Assignments window.
2. Find the assigned member.
3. Click Remove.

Removing an assignment only removes the trainer-member connection. It does not delete the trainer or the member.

## Payments

Payments are tracked manually. The system records whether a member paid for a month, the amount, the payment date, who recorded it, and notes.

The app does not process online payments, charge cards, or connect to a payment gateway.

To check who paid:

1. Open Payments from the dashboard menu.
2. Choose the month at the top of the page.
3. Use the Paid, Unpaid, or All filter.
4. Search by member name or phone if needed.

The amount due comes from the member's selected membership plan. If the member is on the Monthly plan, the page uses the Monthly plan price. If no payment record exists for that member and month, the member is shown as Unpaid.

Payment filters include month selection, Paid/Unpaid/All status, and member name or phone search.

To mark a member as paid:

1. Open Payments.
2. Choose the correct month.
3. Find the member in the overview table.
4. Click Mark paid.
5. Add notes if needed.
6. Save the payment.

Marking as paid creates a manual payment record for that member and month. It does not collect money online.
The system accepts the member and plan IDs already stored in the database when saving a payment.
When an admin marks a member as paid, the system can also set that member's status to Active. Staff can record the payment, but they do not have permission to edit the member profile.

Payment history shows recent payment records across all months. It includes the member name, amount, payment month, payment date, staff member who recorded it, and notes.

Admins can remove a payment record after confirming the action. Staff users can record payments and edit notes, but they do not see the remove payment action.

## Attendance

Attendance is a simple gym visit log. It records when a member checks in.

To check in a member:

1. Open Attendance from the dashboard menu.
2. Search for the member by name or phone.
3. Select the member.
4. Add an optional note if needed.
5. Click Check in.

The system records the member, check-in time, notes, and the logged-in user who recorded the visit.

The Attendance page shows today's attendance and recent attendance history. The Members page also has an Attendance button on each member row so staff can quickly view that member's recent check-ins.

Attendance history can be filtered by member name or phone number and by date. This helps staff find a specific visit without scanning the full history list.

If a member is Inactive or Expired, the app shows a warning before check-in. The system still allows staff or admin to record the visit because each gym may handle exceptions differently.

To prevent accidental double entries, the same member cannot be checked in again within 10 minutes.

Admins can delete attendance records after confirmation. Staff can record and view attendance, but they do not see the delete action.

## User Management

The Users page is admin-only.

It lists existing app profiles and lets an admin change a profile role between Admin and Staff. The current admin cannot remove their own admin role from this page, which helps prevent accidental lockout.

The app does not create login accounts or send invitations. New login accounts should still be created in Supabase Auth, then the matching profile can be managed in the app.

## Settings

The Settings page is admin-only. It gives admins a simple place to open user role management and review the access rules used by the app.

## Troubleshooting

If something does not work, try these steps first:

1. Refresh the page.
2. Check that the internet connection is working.
3. Sign out and sign in again.
4. Confirm the user has the correct role.
5. Ask the administrator to check that the user has a matching profile.

Common messages:

- "The email or password is not correct" means the login details do not match a Supabase Auth account.
- "This account does not have an app profile yet" means the login exists, but the app profile row is missing.
- "You do not have permission" means the user role is not allowed to do that action.
- "A record with these details already exists" means the same plan, payment, or assignment may already be saved.
- "Refresh the page and try again" usually means the app could not confirm the latest database state.

For form errors, check the highlighted field. Phone numbers, dates, prices, statuses, and roles must be entered in the expected format before saving.

If the problem continues, the administrator should check Supabase project settings, environment variables, and the database migrations.

## Current Next Step

The next step is to prepare deployment documentation and Supabase setup steps for production use.
