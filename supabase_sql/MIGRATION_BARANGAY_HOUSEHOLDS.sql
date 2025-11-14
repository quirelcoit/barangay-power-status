-- Database Migration: Barangay Household Data
-- Run this in Supabase SQL Editor
-- Stores household data per barangay for granular restoration tracking

-- Create barangay_households table (fixed household counts per barangay)
CREATE TABLE IF NOT EXISTS public.barangay_households (
  id uuid primary key default uuid_generate_v4(),
  municipality text not null,
  barangay_id uuid not null references public.barangays(id),
  barangay_name text not null,
  total_households integer not null check (total_households > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(barangay_id)
);

-- Create barangay_household_updates table (tracks restoration progress per barangay)
CREATE TABLE IF NOT EXISTS public.barangay_household_updates (
  id uuid primary key default uuid_generate_v4(),
  municipality text not null,
  barangay_id uuid not null references public.barangays(id),
  barangay_name text not null,
  total_households integer not null,
  restored_households integer not null check (restored_households >= 0 and restored_households <= total_households),
  remarks text,
  photo_url text,
  updated_by uuid references auth.users(id),
  is_published boolean default true,
  as_of_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_barangay_households_municipality 
ON public.barangay_households(municipality);

CREATE INDEX IF NOT EXISTS idx_barangay_households_barangay_id 
ON public.barangay_households(barangay_id);

CREATE INDEX IF NOT EXISTS idx_barangay_household_updates_barangay_id 
ON public.barangay_household_updates(barangay_id);

CREATE INDEX IF NOT EXISTS idx_barangay_household_updates_municipality 
ON public.barangay_household_updates(municipality);

CREATE INDEX IF NOT EXISTS idx_barangay_household_updates_updated_at 
ON public.barangay_household_updates(updated_at desc);

-- Create view to get latest household update per barangay
DROP VIEW IF EXISTS public.barangay_household_status;

CREATE VIEW public.barangay_household_status AS
WITH ranked_updates AS (
  SELECT 
    id,
    municipality,
    barangay_id,
    barangay_name,
    total_households,
    restored_households,
    as_of_time,
    updated_at,
    ROW_NUMBER() OVER (PARTITION BY barangay_id ORDER BY updated_at DESC, id DESC) as rn
  FROM public.barangay_household_updates
  WHERE is_published = true
)
SELECT 
  bh.municipality,
  bh.barangay_id,
  bh.barangay_name,
  bh.total_households,
  COALESCE(bhu.restored_households, 0) as restored_households,
  bh.total_households - COALESCE(bhu.restored_households, 0) as for_restoration_households,
  ROUND((COALESCE(bhu.restored_households, 0)::numeric / bh.total_households) * 100, 2) as percent_restored,
  bhu.as_of_time,
  bhu.updated_at as last_updated
FROM public.barangay_households bh
LEFT JOIN (
  SELECT * FROM ranked_updates WHERE rn = 1
) bhu ON bh.barangay_id = bhu.barangay_id
ORDER BY bh.municipality, bh.barangay_name;

-- Enable RLS
ALTER TABLE public.barangay_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_household_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for barangay_households (read-only)
DROP POLICY IF EXISTS "Allow public to read barangay households" ON public.barangay_households;
CREATE POLICY "Allow public to read barangay households"
ON public.barangay_households FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow authenticated staff to manage barangay households" ON public.barangay_households;
CREATE POLICY "Allow authenticated staff to manage barangay households"
ON public.barangay_households FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_profiles 
    WHERE uid = auth.uid() 
    AND (role = 'moderator' OR role = 'admin')
  )
);

-- RLS Policies for barangay_household_updates
DROP POLICY IF EXISTS "Allow public to read published barangay household updates" ON public.barangay_household_updates;
CREATE POLICY "Allow public to read published barangay household updates"
ON public.barangay_household_updates FOR SELECT
TO public
USING (is_published = true);

DROP POLICY IF EXISTS "Allow authenticated staff to insert barangay household updates" ON public.barangay_household_updates;
CREATE POLICY "Allow authenticated staff to insert barangay household updates"
ON public.barangay_household_updates FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_profiles 
    WHERE uid = auth.uid() 
    AND (role = 'moderator' OR role = 'admin')
  )
);

DROP POLICY IF EXISTS "Allow authenticated staff to update barangay household updates" ON public.barangay_household_updates;
CREATE POLICY "Allow authenticated staff to update barangay household updates"
ON public.barangay_household_updates FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_profiles 
    WHERE uid = auth.uid() 
    AND (role = 'moderator' OR role = 'admin')
  )
);

-- Insert barangay household data
-- San Agustin
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 247 FROM public.barangays WHERE name = 'Bautista' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 247, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 85 FROM public.barangays WHERE name = 'Calaocan' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 85, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 429 FROM public.barangays WHERE name = 'Dabubu Grande' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 429, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 183 FROM public.barangays WHERE name = 'Dabubu Pequeño' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 183, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 169 FROM public.barangays WHERE name = 'Dappig' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 169, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 282 FROM public.barangays WHERE name = 'Laoag' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 282, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 362 FROM public.barangays WHERE name = 'Mapalad' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 362, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 325 FROM public.barangays WHERE name = 'Palacian' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 325, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 201 FROM public.barangays WHERE name = 'Panang' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 174 FROM public.barangays WHERE name = 'Quimalabasa Norte' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 174, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 139 FROM public.barangays WHERE name = 'Quimalabasa Sur' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 139, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 116 FROM public.barangays WHERE name = 'Rang-ay' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 116, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 256 FROM public.barangays WHERE name = 'Salay' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 256, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 132 FROM public.barangays WHERE name = 'San Antonio' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 132, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 475 FROM public.barangays WHERE name = 'Santo Niño' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 475, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 149 FROM public.barangays WHERE name = 'Sinaoangan Norte' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 149, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 170 FROM public.barangays WHERE name = 'Sinaoangan Sur' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 170, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAN AGUSTIN, ISABELA', id, name, 300 FROM public.barangays WHERE name = 'Virgoneza' AND municipality = 'SAN AGUSTIN, ISABELA'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 300, updated_at = now();
