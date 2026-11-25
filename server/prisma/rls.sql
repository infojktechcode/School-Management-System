-- Row Level Security for the School Management System.
-- Run after `prisma migrate deploy` / `prisma db push` on the Supabase project.
--
-- The API talks to Postgres through Prisma with the service role, which
-- bypasses RLS. These policies protect the Supabase Data API (anon and
-- authenticated keys) from cross-tenant reads and writes.

create extension if not exists pgcrypto;

-- School id is carried in the Supabase JWT as a custom claim.
create or replace function public.current_school_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'school_id', '')::uuid;
$$;

-- Enable RLS on every public table.
do $$
declare
  table_record record;
begin
  for table_record in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', table_record.tablename);
  end loop;
end
$$;

-- Tenant-owned tables: rows are visible and writable only for the JWT's school.
do $$
declare
  table_record record;
begin
  for table_record in
    select c.table_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema and t.table_name = c.table_name
    where c.table_schema = 'public'
      and c.column_name = 'school_id'
      and t.table_type = 'BASE TABLE'
  loop
    execute format('drop policy if exists tenant_isolation on public.%I', table_record.table_name);
    execute format(
      'create policy tenant_isolation on public.%I for all to authenticated
       using (school_id = public.current_school_id())
       with check (school_id = public.current_school_id())',
      table_record.table_name
    );
  end loop;
end
$$;

-- Users may read their own row and members of their school.
drop policy if exists users_read_own_school on public.users;
create policy users_read_own_school on public.users
  for select to authenticated
  using (
    supabase_user_id = auth.uid()
    or school_id = public.current_school_id()
  );

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update to authenticated
  using (supabase_user_id = auth.uid())
  with check (supabase_user_id = auth.uid());

-- Role/permission catalogues are read-only for authenticated users.
drop policy if exists roles_read on public.roles;
create policy roles_read on public.roles for select to authenticated using (true);

drop policy if exists permissions_read on public.permissions;
create policy permissions_read on public.permissions for select to authenticated using (true);

drop policy if exists user_roles_read on public.user_roles;
create policy user_roles_read on public.user_roles
  for select to authenticated
  using (
    user_id in (select id from public.users where school_id = public.current_school_id())
  );

drop policy if exists role_permissions_read on public.role_permissions;
create policy role_permissions_read on public.role_permissions
  for select to authenticated using (true);

-- Academic children that inherit their tenant through a parent row.
drop policy if exists terms_tenant on public.terms;
create policy terms_tenant on public.terms
  for all to authenticated
  using (
    exists (
      select 1 from public.academic_years y
      where y.id = terms.academic_year_id
        and y.school_id = public.current_school_id()
    )
  )
  with check (
    exists (
      select 1 from public.academic_years y
      where y.id = terms.academic_year_id
        and y.school_id = public.current_school_id()
    )
  );

drop policy if exists streams_tenant on public.streams;
create policy streams_tenant on public.streams
  for all to authenticated
  using (
    exists (
      select 1 from public.class_levels c
      where c.id = streams.class_level_id
        and c.school_id = public.current_school_id()
    )
  )
  with check (
    exists (
      select 1 from public.class_levels c
      where c.id = streams.class_level_id
        and c.school_id = public.current_school_id()
    )
  );

-- Higher-risk tables are intentionally denied to the Data API. Only the
-- service role (server) can touch payments, audit logs and auth credentials.
drop policy if exists audit_logs_deny on public.audit_logs;
create policy audit_logs_deny on public.audit_logs for all to authenticated using (false);

-- Performance indexes aligned with the dashboard and list queries.
create index if not exists idx_students_school_status on public.students (school_id, status);
create index if not exists idx_attendance_school_date on public.attendances (school_id, date);
create index if not exists idx_invoices_student_status on public.student_invoices (student_id, status);
create index if not exists idx_payments_school_paid_at on public.payments (school_id, paid_at);
create index if not exists idx_marks_student on public.marks (student_id);
create index if not exists idx_notifications_user_status on public.notifications (user_id, status);
create index if not exists idx_audit_logs_school_created on public.audit_logs (school_id, created_at);
