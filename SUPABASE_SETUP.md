# Supabase Storage Setup Guide

To fix the `Bucket not found` error and enable CV uploads, you need to run the following SQL commands in your Supabase Dashboard.

> **Dự án mới?** Chỉ cần chạy một file duy nhất [`supabase/setup-cv.sql`](./supabase/setup-cv.sql):
> nó tạo bucket `cvs`, bảng `cv_entries`, bật RLS và policy chỉ admin được ghi.
> File dưới đây giữ lại để tham khảo từng bước.

## Instructions
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Click on **SQL Editor** (the page icon in the left sidebar).
4. Click **New Query**.
5. Copy and paste the code below into the editor.
6. Click **Run** (Green button).

## SQL Code - Part 1: Storage (Already ran?)

```sql
-- 1. Create the Storage Bucket (public read, so CV links work for visitors)
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', true)
on conflict (id) do nothing;

-- 2. Public read only
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Allow Uploads" on storage.objects;
drop policy if exists "Public can read CV files" on storage.objects;

create policy "Public can read CV files"
on storage.objects for select
using (bucket_id = 'cvs');
```

> ⚠️ Không dùng policy `Allow Uploads` cho `anon` nữa. Quyền upload/update/delete
> chỉ dành cho admin đã đăng nhập — xem phần cuối file này.

## SQL Code - Part 2: Database Table (NEW - RUN THIS!)

To enable the dynamic CV Manager (Set Default instantly), run this block:

```sql
----------------------------------------------------------------
-- 3. Create the Database Table for CV Metadata
----------------------------------------------------------------
create table public.cv_entries (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  file_name text not null,
  url text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

----------------------------------------------------------------
-- 4. Enable Security (RLS) for Table
----------------------------------------------------------------
alter table public.cv_entries enable row level security;

-- Public can read the default CV; admin can read everything.
create policy "Public can view default CVs"
on public.cv_entries for select
using (
  is_default = true
  or coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com'
);

-- Only the admin email can insert/update/delete.
create policy "Admin can insert CVs"
on public.cv_entries for insert to authenticated
with check (coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com');

create policy "Admin can update CVs"
on public.cv_entries for update to authenticated
using (coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com')
with check (coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com');

create policy "Admin can delete CVs"
on public.cv_entries for delete to authenticated
using (coalesce(auth.jwt() ->> 'email', '') = 'phamngocanh7679@gmail.com');
```

> Nếu bạn đã chạy SQL cũ (policy `Enable ... for all users`), hãy chạy file
> [`supabase/secure-cv.sql`](./supabase/secure-cv.sql) để xoá policy cũ và thay bằng policy an toàn.

## Verification
1. Run the SQL above.
2. Go to **Table Editor** in Supabase.
3. You should see a new table `cv_entries`.
4. Go back to your website Admin page (`/cv-mn`), upload a CV, and click "Set Default".
5. Go to the Home page and refresh. The Download button should link to the new CV instantly.
