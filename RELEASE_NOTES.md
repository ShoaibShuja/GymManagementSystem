# Release Notes

## Version 1.0.0

Release status: production-ready codebase after final deployment setup and production smoke testing.

## Completed Features

- Supabase email/password login and logout.
- Protected dashboard routes.
- Admin and Staff role-based navigation.
- Admin-only Settings and Users pages.
- User profile role management for existing profiles.
- Dashboard overview cards for active members, inactive members, expired members, pending payments, collected payments, expiring memberships, and today's attendance.
- Membership expiry alerts with adjustable alert days.
- Member management with add, edit, delete, status, plan, dates, contact details, and notes.
- Membership end date calculation from selected plan duration.
- Trainer management with add, edit, deactivate, status, specialty, and notes.
- Trainer-to-member assignments and assignment removal.
- Membership plan management with name, duration, price, active/inactive status, and plan search.
- Manual monthly payment tracking.
- Paid/unpaid filters and payment month selection.
- Payment history and payment notes.
- Basic attendance check-in log.
- Duplicate attendance protection within 10 minutes.
- Attendance history with member and date filters.
- Search and filters across members, trainers, plans, payments, and attendance.
- Responsive dashboard shell with desktop sidebar and mobile navigation.
- Loading states, empty states, error states, confirmation dialogs, and toasts.
- Friendly validation and database error messages.
- Supabase RLS policies for admin and staff access boundaries.

## Scope Confirmed Out

The following features are intentionally not included in Version 1:

- Online payment gateway.
- SMS or email marketing.
- Inventory management.
- E-commerce.
- Advanced booking or calendar sync.
- Multi-location support.
- Native mobile app.
- Workout or diet builder.
- In-app chat.
- Complex analytics or BI dashboards.

## Security Notes

- RLS is enabled in the SQL migrations.
- Dashboard routes require a valid profile.
- Settings and Users routes require Admin role.
- Staff users can view operational records, record payments, edit payment notes, and record attendance.
- Staff users cannot manage members, plans, trainers, assignments, roles, or delete records through app actions.
- `.env.example` contains placeholders only.
- Real `.env` files are ignored by git.
- The Supabase service role key must only be set in Vercel as a private server-side environment variable.

## Known Limitations

- No public signup page.
- New Supabase Auth users must be created manually.
- The Users page manages existing profiles only. It does not create Auth accounts or send invitations.
- A Supabase Auth user must have a matching `profiles` row before dashboard access works.
- No online payments or automated invoices.
- No trainer scheduling, booking, or calendar sync.
- No hardware or biometric attendance integration.
- No automated test framework is installed.
- Database types are maintained manually.

## Recommended Future Improvements

- Add an admin invitation or user creation flow.
- Generate database types from Supabase.
- Add lightweight automated tests for date calculations, server actions, and role checks.
- Add CSV export for members, payments, and attendance.
- Add printable payment receipts.
- Add a member renewal workflow.
- Add archive or soft-delete flows for old members and trainers.
- Add configurable organization settings for app name, default currency, and default expiry alert days.
- Add production monitoring and backup documentation.

## Setup Summary

1. Create a production Supabase project.
2. Apply migrations from `supabase/migrations` in order.
3. Keep RLS enabled.
4. Skip `supabase/seed.sql` in production unless demo data is intentionally required.
5. Create the first Supabase Auth user for the owner.
6. Insert the matching `profiles` row with role `admin`.
7. Add these Vercel environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

8. Configure Supabase Auth Site URL and redirect URLs for the Vercel production domain.
9. Deploy on Vercel with:

```bash
npm install
npm run build
```

10. Smoke test login, dashboard, members, trainers, plans, payments, attendance, admin access, staff restrictions, and mobile navigation.

## Final Verification Commands

```bash
npm run lint
npm run typecheck
npm run build
```
