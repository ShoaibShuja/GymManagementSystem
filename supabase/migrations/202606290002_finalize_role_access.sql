-- Finalize Admin and Staff/Receptionist access boundaries.
-- RLS remains the real security layer. Frontend role checks only shape the UI.

drop policy if exists "profiles_insert_own_staff" on public.profiles;
drop policy if exists "members_insert_staff_admin" on public.members;
drop policy if exists "members_update_staff_admin" on public.members;
drop policy if exists "attendance_logs_update_staff_admin" on public.attendance_logs;

create policy "profiles_admin_insert"
on public.profiles for insert
to authenticated
with check (public.is_admin());

create policy "members_admin_insert"
on public.members for insert
to authenticated
with check (public.is_admin());

create policy "members_admin_update"
on public.members for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "attendance_logs_admin_update"
on public.attendance_logs for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
