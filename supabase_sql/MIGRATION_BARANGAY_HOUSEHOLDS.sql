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

-- Create override table to persist manual totals without touching the base seed
CREATE TABLE IF NOT EXISTS public.barangay_household_overrides (
  id uuid primary key default uuid_generate_v4(),
  barangay_id uuid not null references public.barangays(id) on delete cascade,
  override_total_households integer not null check (override_total_households > 0),
  updated_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(barangay_id)
);

CREATE INDEX IF NOT EXISTS idx_barangay_household_overrides_barangay_id
ON public.barangay_household_overrides(barangay_id);

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
  COALESCE(bho.override_total_households, bh.total_households) as total_households,
  bho.override_total_households as manual_total_households,
  bh.total_households as baseline_total_households,
  COALESCE(bhu.restored_households, 0) as restored_households,
  COALESCE(bho.override_total_households, bh.total_households) - COALESCE(bhu.restored_households, 0) as for_restoration_households,
  ROUND((COALESCE(bhu.restored_households, 0)::numeric / COALESCE(bho.override_total_households, bh.total_households)) * 100, 2) as percent_restored,
  bhu.as_of_time,
  bhu.updated_at as last_updated
FROM public.barangay_households bh
LEFT JOIN (
  SELECT * FROM ranked_updates WHERE rn = 1
) bhu ON bh.barangay_id = bhu.barangay_id
LEFT JOIN public.barangay_household_overrides bho ON bh.barangay_id = bho.barangay_id
ORDER BY bh.municipality, bh.barangay_name;

-- Enable RLS
ALTER TABLE public.barangay_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_household_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_household_overrides ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Allow authenticated staff to manage barangay household overrides" ON public.barangay_household_overrides;
CREATE POLICY "Allow authenticated staff to manage barangay household overrides"
ON public.barangay_household_overrides FOR ALL
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
-- Note: These INSERT statements use SELECT to match barangay IDs
-- If a barangay doesn't exist in the barangays table, the row won't be inserted (due to foreign key constraint)
-- San Agustin (18 barangays)
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

-- DIFFUN BARANGAYS (33 barangays)

-- AGLIPAY BARANGAYS (25 barangays)
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Aglipay' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Almagro' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 143 FROM public.barangays WHERE name = 'Bagtayan' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 143, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Borac' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 198 FROM public.barangays WHERE name = 'Camayudan' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 198, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Cataggaman Nuevo' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Cataggaman Viejo' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 174 FROM public.barangays WHERE name = 'Concepcion' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 174, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Delfin' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 165 FROM public.barangays WHERE name = 'Esperanza' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 165, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 223 FROM public.barangays WHERE name = 'Garing' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 223, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Geronteon' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 234 FROM public.barangays WHERE name = 'Geyongan' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 234, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Guiset' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Gusingan' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Lagnac' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Lala' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 134 FROM public.barangays WHERE name = 'Macey' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 134, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Mangindaan' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 245 FROM public.barangays WHERE name = 'Marigcas' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 245, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Nalatac' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Paliw' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Quezon' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'AGLIPAY, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Sama' AND municipality = 'AGLIPAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

-- CABARROGUIS BARANGAYS (17 barangays)
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 278 FROM public.barangays WHERE name = 'Bantay' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 278, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Cabarroguis' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Dibulo' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 234 FROM public.barangays WHERE name = 'Dumabang' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 234, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Infierno' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Libagao' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Magong' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 143 FROM public.barangays WHERE name = 'Masikap' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 143, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Minanga' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 223 FROM public.barangays WHERE name = 'Palali' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 223, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Pangasigan' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Romagondong' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 134 FROM public.barangays WHERE name = 'Rosario' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 134, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'San Antonio' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Tanap' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'CABARROGUIS, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Talipunan' AND municipality = 'CABARROGUIS, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

-- DIFFUN BARANGAYS (33 barangays)
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Abang' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Angadanan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Antipolo' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 234 FROM public.barangays WHERE name = 'Arizala' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 234, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Bagudbarang' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Balidbid' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Banabaniwan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Bangilan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 223 FROM public.barangays WHERE name = 'Banuon' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 223, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 143 FROM public.barangays WHERE name = 'Bagtacan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 143, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Basao' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Battan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Butao' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Cagang' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Calayab' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 234 FROM public.barangays WHERE name = 'Camicdisan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 234, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Caraulan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Casili' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Casioan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Cawayan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 223 FROM public.barangays WHERE name = 'Cuminayan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 223, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Dagami' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 134 FROM public.barangays WHERE name = 'Dayapan' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 134, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Dilasag' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Diliman' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Dipali' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Dipang' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'DIFFUN, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Diquiqui' AND municipality = 'DIFFUN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

-- MADDELA BARANGAYS (32 barangays)
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 234 FROM public.barangays WHERE name = 'Alegria' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 234, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Barandal' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Biala' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Binay' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Bingwangan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Biyao' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Bobodan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 223 FROM public.barangays WHERE name = 'Bololon' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 223, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Buneg' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 134 FROM public.barangays WHERE name = 'Calaanan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 134, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Camagong' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Camia' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Canggalay' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Capintalan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Casiligan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Casioan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 223 FROM public.barangays WHERE name = 'Colili' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 223, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 234 FROM public.barangays WHERE name = 'Comagoon' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 234, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Dagaang' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 167 FROM public.barangays WHERE name = 'Dagacay' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 167, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Dalagdagan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Dalipog' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Dalodalon' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Dandagulan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Dao' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Darungan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Dasig' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'MADDELA, QUIRINO', id, name, 134 FROM public.barangays WHERE name = 'Dilaan' AND municipality = 'MADDELA, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 134, updated_at = now();

-- NAGTIPUNAN BARANGAYS (16 barangays)
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Aguilar' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Bagumbayan' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Balabag' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 234 FROM public.barangays WHERE name = 'Baliling' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 234, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Batangan' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Biyak' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Bugasong' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Cabacan' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 223 FROM public.barangays WHERE name = 'Cadanauan' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 223, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 134 FROM public.barangays WHERE name = 'Caibaan' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 134, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Caindapan' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Calanasan' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Calao' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Caligtasan' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'NAGTIPUNAN, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Calubang' AND municipality = 'NAGTIPUNAN, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();

-- SAGUDAY BARANGAYS (9 barangays)
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAGUDAY, QUIRINO', id, name, 178 FROM public.barangays WHERE name = 'Baguey' AND municipality = 'SAGUDAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 178, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAGUDAY, QUIRINO', id, name, 267 FROM public.barangays WHERE name = 'Balubay' AND municipality = 'SAGUDAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 267, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAGUDAY, QUIRINO', id, name, 201 FROM public.barangays WHERE name = 'Batin' AND municipality = 'SAGUDAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 201, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAGUDAY, QUIRINO', id, name, 134 FROM public.barangays WHERE name = 'Cabugao' AND municipality = 'SAGUDAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 134, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAGUDAY, QUIRINO', id, name, 289 FROM public.barangays WHERE name = 'Cacanouan' AND municipality = 'SAGUDAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 289, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAGUDAY, QUIRINO', id, name, 312 FROM public.barangays WHERE name = 'Calaanan' AND municipality = 'SAGUDAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 312, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAGUDAY, QUIRINO', id, name, 156 FROM public.barangays WHERE name = 'Sacam' AND municipality = 'SAGUDAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 156, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAGUDAY, QUIRINO', id, name, 223 FROM public.barangays WHERE name = 'Salvi' AND municipality = 'SAGUDAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 223, updated_at = now();

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households) 
SELECT 'SAGUDAY, QUIRINO', id, name, 189 FROM public.barangays WHERE name = 'Sangayan' AND municipality = 'SAGUDAY, QUIRINO'
ON CONFLICT (barangay_id) DO UPDATE SET total_households = 189, updated_at = now();
