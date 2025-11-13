-- Migration: Add household_status table for household power restoration tracking

-- 1. Create household_updates table to store individual updates
CREATE TABLE IF NOT EXISTS household_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality TEXT NOT NULL,
  total_households INTEGER NOT NULL,
  energized_households INTEGER NOT NULL,
  remarks TEXT,
  updated_by TEXT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  as_of_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create household_status VIEW to get latest status per municipality
CREATE OR REPLACE VIEW household_status AS
SELECT DISTINCT ON (municipality)
  municipality,
  total_households,
  energized_households,
  ROUND(
    CASE 
      WHEN total_households > 0 
      THEN (energized_households::NUMERIC / total_households * 100)
      ELSE 0
    END, 
    2
  ) AS percent_energized,
  as_of_time,
  updated_at,
  is_published
FROM household_updates
WHERE is_published = TRUE
ORDER BY municipality, updated_at DESC;

-- 3. Enable Row Level Security
ALTER TABLE household_updates ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for household_updates
-- Public read policy (only published records)
DROP POLICY IF EXISTS "Public can read published household updates" ON household_updates;
CREATE POLICY "Public can read published household updates" ON household_updates
  FOR SELECT USING (is_published = TRUE);

-- Staff insert policy
DROP POLICY IF EXISTS "Staff can insert household updates" ON household_updates;
CREATE POLICY "Staff can insert household updates" ON household_updates
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Staff update policy (update own records or any record if admin)
DROP POLICY IF EXISTS "Staff can update household updates" ON household_updates;
CREATE POLICY "Staff can update household updates" ON household_updates
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5. Create indexes for better query performance
DROP INDEX IF EXISTS idx_household_updates_municipality;
CREATE INDEX idx_household_updates_municipality ON household_updates(municipality);

DROP INDEX IF EXISTS idx_household_updates_is_published;
CREATE INDEX idx_household_updates_is_published ON household_updates(is_published);

DROP INDEX IF EXISTS idx_household_updates_created_at;
CREATE INDEX idx_household_updates_created_at ON household_updates(created_at DESC);
