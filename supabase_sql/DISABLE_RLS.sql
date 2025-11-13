-- DISABLE RLS COMPLETELY - NUCLEAR FIX
-- This will allow the app to read barangays immediately

-- Step 1: Disable RLS on barangays table
ALTER TABLE public.barangays DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify it's disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'barangays';
-- Should show rowsecurity = false

-- Step 3: Test query
SELECT COUNT(*) as total FROM public.barangays WHERE is_active = true;
-- Should return 132
