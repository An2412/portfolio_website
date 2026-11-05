-- ============================================================
-- One-shot bootstrap for the CV manager on a FRESH Supabase project.
-- Run once in: Supabase Dashboard > SQL Editor > New query > Run.
--
-- Safe to re-run: it uses IF NOT EXISTS / DROP POLICY IF EXISTS and
-- recreates exactly the same secure policies as supabase/secure-cv.sql.
--
-- Admin email: phamngocanh7679@gmail.com
-- ============================================================

-- ------------------------------------------------------------
-- 1. Storage bucket (public read, admin-only write)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', true)
on conflict (id) do update set public = true;

-- ------------------------------------------------------------
-- 2. Table with CV metadata
-- ------------------------------------------------------------
create table if not exists public.cv_entries (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  file_name text not null,
  url text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists cv_entries_is_default_idx
  on public.cv_entries (is_default)
  where is_default;

-- ------------------------------------------------------------
-- 3. Row Level Security: public reads the default CV, admin writes
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 4. Storage policies: public read, admin-only write
-- ------------------------------------------------------------
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
