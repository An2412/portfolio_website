-- ============================================================
-- Secure CV Manager (run in Supabase Dashboard > SQL Editor)
-- Admin email: phamngocanh7679@gmail.com
-- This replaces the old "allow anon write" policies.
-- ============================================================

-- 1. Table: public can read the default CV, only admin can write
alter table public.cv_entries enable row level security;

drop policy if exists "Enable read access for all users" on public.cv_entries;
drop policy if exists "Enable insert for all users" on public.cv_entries;
drop policy if exists "Enable update for all users" on public.cv_entries;
drop policy if exists "Enable delete for all users" on public.cv_entries;
drop policy if exists "Public can view default CVs" on public.cv_entries;
drop policy if exists "Admin can insert CVs" on public.cv_entries;
drop policy if exists "Admin can update CVs" on public.cv_entries;
drop policy if exists "Admin can delete CVs" on public.cv_entries;

create policy "Public can view default CVs"
on public.cv_entries
for select
using (
  is_default = true
  or coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com'
);

create policy "Admin can insert CVs"
on public.cv_entries
for insert
to authenticated
with check (coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com');

create policy "Admin can update CVs"
on public.cv_entries
for update
to authenticated
using (coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com')
with check (coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com');

create policy "Admin can delete CVs"
on public.cv_entries
for delete
to authenticated
using (coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com');

-- 2. Storage: public can read files, only admin can upload/update/delete
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Allow Uploads" on storage.objects;
drop policy if exists "Public can read CV files" on storage.objects;
drop policy if exists "Admin can upload CV files" on storage.objects;
drop policy if exists "Admin can update CV files" on storage.objects;
drop policy if exists "Admin can delete CV files" on storage.objects;

create policy "Public can read CV files"
on storage.objects
for select
using (bucket_id = 'cvs');

create policy "Admin can upload CV files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'cvs'
  and coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com'
);

create policy "Admin can update CV files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'cvs'
  and coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com'
)
with check (
  bucket_id = 'cvs'
  and coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com'
);

create policy "Admin can delete CV files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'cvs'
  and coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com'
);
