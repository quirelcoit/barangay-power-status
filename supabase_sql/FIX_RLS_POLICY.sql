-- COMPLETE DIAGNOSTIC AND FIX FOR BARANGAYS
-- Run this ENTIRE script in Supabase SQL Editor

-- ==============================================
-- STEP 1: Check if data exists
-- ==============================================
SELECT 'STEP 1: Data Check' as step;
SELECT COUNT(*) as total_barangays FROM public.barangays;
-- Expected: 132

-- ==============================================
-- STEP 2: Check RLS status
-- ==============================================
SELECT 'STEP 2: RLS Status' as step;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'barangays';
-- Shows if RLS is enabled

-- ==============================================
-- STEP 3: Check existing RLS policies
-- ==============================================
SELECT 'STEP 3: Current RLS Policies' as step;
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'barangays';
-- Shows all policies

-- ==============================================
-- STEP 4: DROP ALL existing RLS policies
-- ==============================================
SELECT 'STEP 4: Dropping old policies' as step;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.barangays;
DROP POLICY IF EXISTS "Public barangays are viewable by everyone" ON public.barangays;
DROP POLICY IF EXISTS "Allow public read access to barangays" ON public.barangays;
DROP POLICY IF EXISTS "barangays_public_read" ON public.barangays;

-- ==============================================
-- STEP 5: CREATE new policy for public SELECT
-- ==============================================
SELECT 'STEP 5: Creating public read policy' as step;
CREATE POLICY "barangays_public_read"
ON public.barangays
FOR SELECT
USING (true);

-- ==============================================
-- STEP 6: Enable RLS
-- ==============================================
SELECT 'STEP 6: Enabling RLS' as step;
ALTER TABLE public.barangays ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 7: Test as anonymous user
-- ==============================================
SELECT 'STEP 7: Final Test' as step;
SELECT COUNT(*) as accessible_barangays FROM public.barangays WHERE is_active = true;
-- This simulates what the app will see
-- Expected: 132

-- ==============================================
-- STEP 8: Show sample data
-- ==============================================
SELECT 'STEP 8: Sample Data' as step;
SELECT id, name, municipality, is_active 
FROM public.barangays 
WHERE is_active = true 
LIMIT 5;
