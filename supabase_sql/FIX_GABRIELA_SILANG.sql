-- Fix Gabriela Silang - set restored_households to 0
-- Run this in Supabase SQL editor

UPDATE barangay_household_updates
SET restored_households = 0
WHERE barangay_name = 'Gabriela Silang' 
  AND municipality = 'Diffun';

-- Verify the change
SELECT barangay_name, municipality, total_households, restored_households
FROM barangay_household_updates
WHERE barangay_name = 'Gabriela Silang' 
  AND municipality = 'Diffun';
