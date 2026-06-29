-- Development seed data for the Gym Management System.
-- Run after the initial schema migration.
-- This seed intentionally does not create auth users.

insert into public.membership_plans (id, name, duration_months, price, is_active)
values
  ('10000000-0000-0000-0000-000000000001', 'Monthly', 1, 50.00, true),
  ('10000000-0000-0000-0000-000000000002', 'Quarterly', 3, 135.00, true),
  ('10000000-0000-0000-0000-000000000003', 'Yearly', 12, 480.00, true)
on conflict (id) do nothing;

insert into public.trainers (id, name, phone, specialty, status, notes)
values
  ('20000000-0000-0000-0000-000000000001', 'Omar Khan', '+1 555 0101', 'Strength training', 'active', 'Available weekday evenings.'),
  ('20000000-0000-0000-0000-000000000002', 'Sara Ahmed', '+1 555 0102', 'Weight loss and conditioning', 'active', 'Works well with beginners.')
on conflict (id) do nothing;

insert into public.members (
  id,
  name,
  phone,
  email,
  address,
  join_date,
  status,
  membership_plan_id,
  membership_start_date,
  membership_end_date,
  notes
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'Ali Rahman',
    '+1 555 0201',
    'ali@example.com',
    '12 Main Street',
    current_date - 20,
    'active',
    '10000000-0000-0000-0000-000000000001',
    date_trunc('month', current_date)::date,
    (date_trunc('month', current_date)::date + interval '1 month' - interval '1 day')::date,
    'Prefers evening workouts.'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'Mina Noor',
    '+1 555 0202',
    'mina@example.com',
    '45 Center Avenue',
    current_date - 45,
    'active',
    '10000000-0000-0000-0000-000000000002',
    date_trunc('month', current_date)::date,
    (date_trunc('month', current_date)::date + interval '3 months' - interval '1 day')::date,
    'Interested in conditioning.'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'Hassan Malik',
    '+1 555 0203',
    null,
    '78 West Road',
    current_date - 90,
    'inactive',
    '10000000-0000-0000-0000-000000000001',
    (date_trunc('month', current_date)::date - interval '2 months')::date,
    (date_trunc('month', current_date)::date - interval '1 month' - interval '1 day')::date,
    'Paused membership.'
  )
on conflict (id) do nothing;

insert into public.trainer_member_assignments (trainer_id, member_id)
values
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002')
on conflict (trainer_id, member_id) do nothing;

insert into public.payments (
  member_id,
  membership_plan_id,
  amount,
  payment_month,
  payment_date,
  status,
  notes
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    50.00,
    date_trunc('month', current_date)::date,
    current_date,
    'paid',
    'Paid in cash.'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    135.00,
    date_trunc('month', current_date)::date,
    null,
    'unpaid',
    'Payment pending.'
  )
on conflict (member_id, payment_month) do nothing;

insert into public.attendance_logs (member_id, check_in_time, notes)
values
  ('30000000-0000-0000-0000-000000000001', now() - interval '2 hours', 'Morning check-in.'),
  ('30000000-0000-0000-0000-000000000002', now() - interval '1 day', 'Completed conditioning session.')
on conflict do nothing;
