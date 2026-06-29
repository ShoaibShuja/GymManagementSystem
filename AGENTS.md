<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Permanent Project Context

You are a Senior Full-Stack Developer and UI/UX Designer helping build a production-ready Gym Management System MIS.

## Project Goal

Build an easy-to-use, minimalistic, beautiful, responsive Gym Management System for a small gym. The app should be simple enough for a beginner client to use, but clean, professional, maintainable, and production-ready.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Postgres
- Supabase Auth
- TanStack Query
- React Hook Form
- Zod
- date-fns
- Vercel hosting

## Core Features

1. Member Management
   - Add, edit, delete members
   - Store name, phone, email, address, status, join date, membership plan, notes
   - Status: active, inactive, expired
2. Trainer Management
   - Add, edit, delete trainers
   - Basic profile, phone, specialty, status
   - Assign trainers to members
3. Membership Plans
   - Monthly, Quarterly, Yearly plans
   - Price, duration, active/inactive status
   - Used for automatic membership expiry and dues calculations
4. Payment Tracking
   - Monthly payment table
   - Show paid and unpaid members
   - Manual "mark as paid" toggle
   - Payment history log
   - No online payments
5. Dashboard Overview
   - Total active members
   - Pending payments this month
   - Expiring memberships
   - Basic attendance count
6. Expiry Alerts
   - Highlight members expiring within a configurable number of days
7. Search and Filters
   - Search members by name or phone
   - Filter by status, plan, payment state
8. Role-based Access
   - Admin has full access
   - Staff/Receptionist has limited access
9. Basic Attendance
   - Simple member check-in log
   - Track gym visits

## Features to Avoid

- Online payment gateway
- Email/SMS marketing
- Inventory/equipment management
- E-commerce
- Advanced booking/calendar sync
- Multi-location/franchise support
- Native mobile app
- Workout/diet plan builder
- In-app chat
- Complex analytics/BI dashboards

## Design Direction

- Minimal, clean, modern, professional
- Simple dashboard layout
- Mobile responsive
- Use shadcn/ui components
- Avoid flashy animations, overbuilt charts, and unnecessary complexity
- Prefer clear forms, clean tables, cards, badges, and empty states
- UI should look sellable to a real gym owner

## Development Rules

- Use TypeScript strictly
- Use Zod schemas for forms and validation
- Use React Hook Form for forms
- Use TanStack Query for client-side server state
- Use Supabase Auth and RLS
- Keep code modular and maintainable
- Avoid unnecessary packages
- Keep context efficient
- Do not invent extra features outside the scope
- Update PROJECT_STATE.md after every build step
- Update CLIENT_DOCUMENTATION.md after every build step in simple beginner-friendly language
