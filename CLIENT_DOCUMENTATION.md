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

No gym features have been built yet. Member pages, trainer pages, payments, attendance, login, and the dashboard will be added in the next phases.

## Basic Project Organization

- `src/app` holds the app pages and main layout.
- `src/components` holds reusable screen parts.
- `src/components/ui` holds ready-made UI pieces like buttons, cards, inputs, tables, dialogs, and badges.
- `src/features` will hold gym features such as members, trainers, payments, and attendance.
- `src/lib` holds shared helper code, including Supabase setup.
- `src/schemas` will hold form validation rules.
- `src/types` holds shared TypeScript types.

## Current Next Step

The next step is to connect Supabase properly, create the database tables, add login, and protect the dashboard so only allowed users can access it.
