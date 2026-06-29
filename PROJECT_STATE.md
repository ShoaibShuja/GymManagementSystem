# Project State

## Current Phase

Phase 1: Foundation setup.

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

## Folder Structure

- `src/app`: Next.js App Router routes, layout, and global styles.
- `src/components`: shared UI and provider components.
- `src/components/ui`: shadcn/ui components.
- `src/features`: future feature modules.
- `src/lib`: shared utilities and Supabase clients.
- `src/hooks`: future shared hooks.
- `src/schemas`: future Zod schemas.
- `src/types`: shared TypeScript types.

## Next Step

Build Phase 2: Supabase database schema, authentication flow, protected routes, profile roles, and RLS policies.
