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

Optional for Supabase CLI or project scripts:

```bash
SUPABASE_DB_PASSWORD=
SUPABASE_PROJECT_ID=
```

Do not commit real `.env.local` values.

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

1. Create a Supabase project.
2. Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the anon key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY`. Keep it private.
5. Apply the SQL migrations in `supabase/migrations`.
6. Optionally run `supabase/seed.sql` for development data.
7. Create Supabase Auth users manually.
8. Ensure every Auth user has a matching row in `profiles`.

Current database tables:

- `profiles`
- `membership_plans`
- `members`
- `trainers`
- `trainer_member_assignments`
- `payments`
- `attendance_logs`

RLS is part of the security model. Keep RLS enabled in production.

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

## Deployment

Recommended deployment target: Vercel.

1. Push the production branch to GitHub.
2. Create or connect a Vercel project.
3. Set the required Supabase environment variables in Vercel.
4. Apply Supabase migrations to the production Supabase project.
5. Create production Auth users and matching `profiles` rows.
6. Run checks before release:

```bash
npm run lint
npm run typecheck
npm run build
```

7. Deploy on Vercel.

After changing environment variables in Vercel, redeploy the app.

## Documentation

- Client and handover guide: `CLIENT_DOCUMENTATION.md`
- Current build state: `PROJECT_STATE.md`
