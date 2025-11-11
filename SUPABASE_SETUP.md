# Supabase SQL Schema

Copy and run the following SQL statements in your Supabase project's SQL editor to set up the database schema.

## Step 1: Create Barangays Table

```sql
create table public.barangays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  municipality text not null,
  island_group text null,
  is_active boolean not null default true,
  unique(name, municipality)
);
```

## Step 2: Create Report Status Enum

```sql
create type public.report_status as enum ('new','triaged','in_progress','resolved','rejected');
```

## Step 3: Create Reports Table

```sql
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  barangay_id uuid references public.barangays(id) on delete restrict,
  lat double precision,
  lng double precision,
  category text check (category in ('broken_pole','fallen_wire','tree_on_line','transformer_noise','kwh_meter_damage','other')),
  description text,
  contact_hint text,
  status public.report_status not null default 'new',
  source_ip inet,
  device_fingerprint text,
  turnstile_ok boolean default false
);
```

## Step 4: Create Report Photos Table

```sql
create table public.report_photos (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  storage_path text not null,
  width int,
  height int
);
```

## Step 5: Create Staff Profiles Table

```sql
create table public.staff_profiles (
  uid uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text check (role in ('admin','moderator')) not null default 'moderator'
);
```

## Step 6: Create Barangay Updates Table

```sql
create table public.barangay_updates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  barangay_id uuid references public.barangays(id) on delete cascade,
  headline text not null,
  body text,
  power_status text check (power_status in ('no_power','partial','energized')) not null,
  eta text,
  author_uid uuid references auth.users(id),
  is_published boolean not null default true
);
```

## Step 7: Create Storage Bucket

In Supabase Dashboard > Storage > Create Bucket:

- Name: `report-photos`
- Privacy: `Private`

## Step 8: Enable Row Level Security (RLS)

```sql
alter table public.reports enable row level security;
alter table public.report_photos enable row level security;
alter table public.barangay_updates enable row level security;
```

## Step 9: Create RLS Policies

```sql
-- Public can insert reports
create policy "public_insert_reports" on public.reports
for insert to anon
with check (true);

-- Public can view reports (limited fields)
create policy "public_select_reports_minimal" on public.reports
for select using (true);

-- Staff can update reports
create policy "staff_update_reports" on public.reports
for update to authenticated using (
  exists(select 1 from public.staff_profiles sp where sp.uid = auth.uid())
);

-- Staff can delete reports
create policy "staff_delete_reports" on public.reports
for delete to authenticated using (
  exists(select 1 from public.staff_profiles sp where sp.uid = auth.uid())
);

-- Anyone can insert photos
create policy "insert_photos_anyone" on public.report_photos
for insert to anon with check (
  exists(select 1 from public.reports r where r.id = report_id)
);

-- Anyone can view photos
create policy "select_photos_public" on public.report_photos for select using (true);

-- Everyone can read barangay updates
create policy "read_updates_all" on public.barangay_updates for select using (true);

-- Only staff can write barangay updates
create policy "write_updates_staff" on public.barangay_updates
for insert to authenticated with check (
  exists(select 1 from public.staff_profiles sp where sp.uid = auth.uid())
);
```

## Step 10: Create Indexes (Optional, for Performance)

```sql
create index idx_reports_barangay on public.reports(barangay_id);
create index idx_reports_status on public.reports(status);
create index idx_reports_created_at on public.reports(created_at desc);
create index idx_report_photos_report on public.report_photos(report_id);
create index idx_barangay_updates_barangay on public.barangay_updates(barangay_id);
create index idx_barangay_updates_created_at on public.barangay_updates(created_at desc);
```

## Step 11: Seed Sample Barangays (Optional)

```sql
insert into public.barangays (name, municipality) values
('San Isidro', 'Cabanatuan'),
('San Francisco', 'Cabanatuan'),
('Gapan', 'Gapan'),
('Santa Rosa', 'Cabanatuan'),
('Santo Domingo', 'Cabanatuan');
```

## Step 12: Create Staff Account

1. Go to Supabase > Authentication > Users
2. Click "Invite user"
3. Enter staff email and send invite
4. Once invited, add them to `staff_profiles` table:

```sql
insert into public.staff_profiles (uid, display_name, role) values
('[USER_ID]', 'John Smith', 'moderator');
```

Replace `[USER_ID]` with the UUID from the users table.

---

## Environment Variables

After setting up Supabase, get these values from Supabase Settings > API:

- `VITE_SUPABASE_URL`: Your project URL
- `VITE_SUPABASE_ANON_KEY`: Anonymous public key
- `VITE_TURNSTILE_SITEKEY`: Cloudflare Turnstile sitekey (get from Cloudflare Dashboard)

Create a `.env.local` file in your project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TURNSTILE_SITEKEY=your-cloudflare-sitekey
```
