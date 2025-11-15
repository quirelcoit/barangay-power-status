## Fix for 300 Defaults in Barangay Households

### Problem

Diffun and other barangays were showing `Total HH = 300` instead of their actual values (e.g., Aklan Village should be 155, Andres Bonifacio should be 1820).

### Root Cause

- Municipality name mismatch: Database stores `'DIFFUN, QUIRINO'` but the reseed script was trying to match just `'DIFFUN'`
- Complex normalization logic was failing silently, causing the `COALESCE(NULLIF(..., 0), 300)` fallback to activate

### Solution

Created a clean reseed script with:

1. **Corrected municipality names**: All `'DIFFUN'` entries changed to `'DIFFUN, QUIRINO'` to match actual database values
2. **Simplified JOIN logic**: Removed complex normalization functions, using exact string equality on both municipality and barangay name
3. **Direct matching**: `ON b.municipality = pt.municipality AND b.name = pt.barangay_name`

### How to Apply

1. **Open Supabase SQL Editor**

   - Go to https://app.supabase.com
   - Select your project
   - Click "SQL Editor" in the sidebar
   - Click "New Query"

2. **Copy and paste the entire contents of:**

   ```
   FINAL_RESEED_FIX_CLEAN.sql
   ```

3. **Run the query** (Ctrl+Enter or Cmd+Enter)

4. **Expected output** (in Results):

   - Row count checks showing all barangays populated
   - Grand Totals should match your Excel totals
   - Sample from DIFFUN shows correct values (155, 1820, 562, 768, etc.)
   - "Any barangay still at 300 default" query should return only a few barangays (those intentionally set to 300 in your Excel like VIRGONEZA in San Agustin)

5. **Verify in the UI**
   - Refresh the admin panel
   - Click on "Barangay Households" tab
   - Expand Diffun—should now show correct totals instead of 300

### If anything shows 300 unexpectedly

Use the admin panel's new editable Total HH field to manually override it (click the Total HH cell to edit).
