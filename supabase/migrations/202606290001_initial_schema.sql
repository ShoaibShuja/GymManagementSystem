-- Gym Management System initial Supabase schema.
-- Apply this migration in Supabase SQL Editor or with the Supabase CLI.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'staff',
  full_name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('admin', 'staff')),
  constraint profiles_full_name_check check (length(trim(full_name)) > 0)
);

create table public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_months integer not null,
  price numeric(10, 2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint membership_plans_name_check check (length(trim(name)) > 0),
  constraint membership_plans_duration_check check (duration_months > 0),
  constraint membership_plans_price_check check (price >= 0)
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  address text,
  join_date date not null default current_date,
  status text not null default 'active',
  membership_plan_id uuid references public.membership_plans (id) on delete set null,
  membership_start_date date not null default current_date,
  membership_end_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_name_check check (length(trim(name)) > 0),
  constraint members_phone_check check (length(trim(phone)) > 0),
  constraint members_status_check check (status in ('active', 'inactive', 'expired')),
  constraint members_membership_dates_check check (membership_end_date >= membership_start_date)
);

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  specialty text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainers_name_check check (length(trim(name)) > 0),
  constraint trainers_status_check check (status in ('active', 'inactive'))
);

create table public.trainer_member_assignments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  constraint trainer_member_assignments_unique unique (trainer_id, member_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  membership_plan_id uuid references public.membership_plans (id) on delete set null,
  amount numeric(10, 2) not null,
  payment_month date not null,
  payment_date date,
  status text not null default 'unpaid',
  notes text,
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint payments_amount_check check (amount >= 0),
  constraint payments_status_check check (status in ('paid', 'unpaid')),
  constraint payments_month_check check (payment_month = date_trunc('month', payment_month)::date),
  constraint payments_paid_date_check check (status = 'unpaid' or payment_date is not null),
  constraint payments_member_month_unique unique (member_id, payment_month)
);

create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  check_in_time timestamptz not null default now(),
  recorded_by uuid references public.profiles (id) on delete set null,
  notes text
);

create index profiles_role_idx on public.profiles (role);

create index membership_plans_is_active_idx on public.membership_plans (is_active);
create unique index membership_plans_active_name_unique
  on public.membership_plans (lower(name))
  where is_active = true;

create index members_status_idx on public.members (status);
create index members_plan_idx on public.members (membership_plan_id);
create index members_membership_end_date_idx on public.members (membership_end_date);
create index members_name_search_idx on public.members (lower(name));
create index members_phone_idx on public.members (phone);

create index trainers_status_idx on public.trainers (status);
create index trainers_name_search_idx on public.trainers (lower(name));

create index trainer_member_assignments_trainer_idx on public.trainer_member_assignments (trainer_id);
create index trainer_member_assignments_member_idx on public.trainer_member_assignments (member_id);

create index payments_member_idx on public.payments (member_id);
create index payments_month_idx on public.payments (payment_month);
create index payments_status_idx on public.payments (status);
create index payments_recorded_by_idx on public.payments (recorded_by);

create index attendance_logs_member_idx on public.attendance_logs (member_id);
create index attendance_logs_check_in_time_idx on public.attendance_logs (check_in_time);
create index attendance_logs_recorded_by_idx on public.attendance_logs (recorded_by);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger members_set_updated_at
before update on public.members
for each row execute function public.set_updated_at();

create trigger trainers_set_updated_at
before update on public.trainers
for each row execute function public.set_updated_at();

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_profile_role() = 'admin', false);
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_profile_role() in ('admin', 'staff'), false);
$$;

alter table public.profiles enable row level security;
alter table public.membership_plans enable row level security;
alter table public.members enable row level security;
alter table public.trainers enable row level security;
alter table public.trainer_member_assignments enable row level security;
alter table public.payments enable row level security;
alter table public.attendance_logs enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_own_staff"
on public.profiles for insert
to authenticated
with check (id = auth.uid() and role = 'staff');

create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_admin_delete"
on public.profiles for delete
to authenticated
using (public.is_admin());

create policy "membership_plans_read_staff_admin"
on public.membership_plans for select
to authenticated
using (public.is_staff_or_admin());

create policy "membership_plans_admin_insert"
on public.membership_plans for insert
to authenticated
with check (public.is_admin());

create policy "membership_plans_admin_update"
on public.membership_plans for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "membership_plans_admin_delete"
on public.membership_plans for delete
to authenticated
using (public.is_admin());

create policy "members_read_staff_admin"
on public.members for select
to authenticated
using (public.is_staff_or_admin());

create policy "members_insert_staff_admin"
on public.members for insert
to authenticated
with check (public.is_staff_or_admin());

create policy "members_update_staff_admin"
on public.members for update
to authenticated
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "members_admin_delete"
on public.members for delete
to authenticated
using (public.is_admin());

create policy "trainers_read_staff_admin"
on public.trainers for select
to authenticated
using (public.is_staff_or_admin());

create policy "trainers_admin_insert"
on public.trainers for insert
to authenticated
with check (public.is_admin());

create policy "trainers_admin_update"
on public.trainers for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "trainers_admin_delete"
on public.trainers for delete
to authenticated
using (public.is_admin());

create policy "trainer_assignments_read_staff_admin"
on public.trainer_member_assignments for select
to authenticated
using (public.is_staff_or_admin());

create policy "trainer_assignments_admin_insert"
on public.trainer_member_assignments for insert
to authenticated
with check (public.is_admin());

create policy "trainer_assignments_admin_update"
on public.trainer_member_assignments for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "trainer_assignments_admin_delete"
on public.trainer_member_assignments for delete
to authenticated
using (public.is_admin());

create policy "payments_read_staff_admin"
on public.payments for select
to authenticated
using (public.is_staff_or_admin());

create policy "payments_insert_staff_admin"
on public.payments for insert
to authenticated
with check (public.is_staff_or_admin());

create policy "payments_update_staff_admin"
on public.payments for update
to authenticated
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "payments_admin_delete"
on public.payments for delete
to authenticated
using (public.is_admin());

create policy "attendance_logs_read_staff_admin"
on public.attendance_logs for select
to authenticated
using (public.is_staff_or_admin());

create policy "attendance_logs_insert_staff_admin"
on public.attendance_logs for insert
to authenticated
with check (public.is_staff_or_admin());

create policy "attendance_logs_update_staff_admin"
on public.attendance_logs for update
to authenticated
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "attendance_logs_admin_delete"
on public.attendance_logs for delete
to authenticated
using (public.is_admin());
