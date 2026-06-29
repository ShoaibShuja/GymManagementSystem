# Gym Management System

A production-ready Gym Management System MIS for a small gym. The foundation is configured with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, TanStack Query, React Hook Form, Zod, date-fns, and Vercel-friendly defaults.

## Getting Started

Install dependencies:

```bash
npm install
```

Copy environment variables:

```bash
copy .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` starts the local dev server.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs TypeScript checks.
- `npm run build` creates a production build.
- `npm run format:check` checks Prettier formatting.
- `npm run format` formats files.

## Project Structure

- `src/app` contains App Router routes and layouts.
- `src/components` contains shared React components.
- `src/components/ui` contains shadcn/ui components.
- `src/features` is reserved for feature modules.
- `src/lib` contains shared utilities and Supabase clients.
- `src/hooks` is reserved for shared React hooks.
- `src/schemas` is reserved for Zod schemas.
- `src/types` contains shared TypeScript types.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not commit real `.env.local` values.

## Current Status

The project foundation is complete. Feature pages, database schema, Supabase Auth, and RLS policies come next.
