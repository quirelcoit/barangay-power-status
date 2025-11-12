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

-- Create barangay_updates table for power status tracking
CREATE TABLE IF NOT EXISTS public.barangay_updates (
  id uuid primary key default uuid_generate_v4(),
  barangay_id uuid not null references public.barangays(id) on delete cascade,
  power_status text not null check (power_status in ('no_power', 'partial', 'energized')),
  remarks text,
  photo_url text,
  lat double precision,
  lng double precision,
  updated_by uuid references auth.users(id),
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_barangay_updates_barangay_id 
ON public.barangay_updates(barangay_id);

CREATE INDEX IF NOT EXISTS idx_barangay_updates_created_at 
ON public.barangay_updates(created_at desc);

CREATE INDEX IF NOT EXISTS idx_barangay_updates_published 
ON public.barangay_updates(is_published) 
WHERE is_published = true;

-- Create municipality_status view for dashboard
CREATE OR REPLACE VIEW public.municipality_status AS
SELECT
  b.municipality,
  COUNT(*) as total_barangays,
  SUM(CASE WHEN u.power_status = 'energized' THEN 1 ELSE 0 END) as energized_barangays,
  SUM(CASE WHEN u.power_status = 'partial' THEN 1 ELSE 0 END) as partial_barangays,
  SUM(CASE WHEN u.power_status = 'no_power' THEN 1 ELSE 0 END) as no_power_barangays,
  ROUND(SUM(CASE WHEN u.power_status = 'energized' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as percent_energized,
  MAX(u.created_at) as last_updated
FROM public.barangays b
LEFT JOIN (
  SELECT DISTINCT ON (barangay_id) 
    barangay_id, 
    power_status, 
    created_at
  FROM public.barangay_updates
  WHERE is_published = true
  ORDER BY barangay_id, created_at DESC
) u ON b.id = u.barangay_id
WHERE b.is_active = true
GROUP BY b.municipality
ORDER BY b.municipality;

-- Create RLS policies for barangay_updates table
ALTER TABLE public.barangay_updates ENABLE ROW LEVEL SECURITY;

-- Allow public to read published updates
CREATE POLICY "Allow public to read published updates"
ON public.barangay_updates FOR SELECT
TO public
USING (is_published = true);

-- Allow authenticated users (staff) to insert and update
CREATE POLICY "Allow authenticated staff to insert updates"
ON public.barangay_updates FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_profiles 
    WHERE uid = auth.uid() 
    AND (role = 'moderator' OR role = 'admin')
  )
);

CREATE POLICY "Allow authenticated staff to update updates"
ON public.barangay_updates FOR UPDATE
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

-- Check barangay_updates table structure
\d public.barangay_updates

-- Check municipality_status view
SELECT * FROM public.municipality_status LIMIT 5;
