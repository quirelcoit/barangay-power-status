-- Database Migration: Power Restoration Dashboard
-- Run this in Supabase SQL Editor

-- Verify barangays table exists (should already exist)
-- If not, create it:
-- CREATE TABLE public.barangays (
--   id uuid primary key default uuid_generate_v4(),
--   name text not null,
--   municipality text not null,
--   island_group text,
--   is_active boolean default true,
--   created_at timestamptz default now()
-- );

-- Create municipality_updates table for power status tracking (staff enters aggregate data per municipality)
CREATE TABLE IF NOT EXISTS public.municipality_updates (
  id uuid primary key default uuid_generate_v4(),
  municipality text not null,
  total_barangays integer not null,
  energized_barangays integer not null check (energized_barangays >= 0 and energized_barangays <= total_barangays),
  partial_barangays integer not null default 0 check (partial_barangays >= 0),
  no_power_barangays integer not null default 0 check (no_power_barangays >= 0),
  remarks text,
  photo_url text,
  updated_by uuid references auth.users(id),
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_municipality_updates_municipality 
ON public.municipality_updates(municipality);

CREATE INDEX IF NOT EXISTS idx_municipality_updates_created_at 
ON public.municipality_updates(created_at desc);

CREATE INDEX IF NOT EXISTS idx_municipality_updates_published 
ON public.municipality_updates(is_published) 
WHERE is_published = true;

-- Create municipality_status view for dashboard (get LATEST update per municipality only)
DROP VIEW IF EXISTS public.municipality_status;

CREATE VIEW public.municipality_status AS
WITH ranked_updates AS (
  SELECT 
    id,
    municipality,
    total_barangays,
    energized_barangays,
    partial_barangays,
    no_power_barangays,
    updated_at,
    ROW_NUMBER() OVER (PARTITION BY municipality ORDER BY updated_at DESC, id DESC) as rn
  FROM public.municipality_updates
  WHERE is_published = true
)
SELECT 
  municipality,
  total_barangays,
  energized_barangays,
  partial_barangays,
  no_power_barangays,
  ROUND((energized_barangays::numeric / total_barangays) * 100, 2) as percent_energized,
  updated_at as last_updated
FROM ranked_updates
WHERE rn = 1
ORDER BY municipality;

-- Create RLS policies for municipality_updates table
ALTER TABLE public.municipality_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to read published municipality updates" ON public.municipality_updates;
DROP POLICY IF EXISTS "Allow authenticated staff to insert municipality updates" ON public.municipality_updates;
DROP POLICY IF EXISTS "Allow authenticated staff to update municipality updates" ON public.municipality_updates;

-- Allow public to read published updates
CREATE POLICY "Allow public to read published municipality updates"
ON public.municipality_updates FOR SELECT
TO public
USING (is_published = true);

-- Allow authenticated users (staff) to insert and update
CREATE POLICY "Allow authenticated staff to insert municipality updates"
ON public.municipality_updates FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_profiles 
    WHERE uid = auth.uid() 
    AND (role = 'moderator' OR role = 'admin')
  )
);

CREATE POLICY "Allow authenticated staff to update municipality updates"
ON public.municipality_updates FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_profiles 
    WHERE uid = auth.uid() 
    AND (role = 'moderator' OR role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_profiles 
    WHERE uid = auth.uid() 
    AND (role = 'moderator' OR role = 'admin')
  )
);

-- Verify tables and view were created
SELECT 'Tables and views created successfully!' as status;
