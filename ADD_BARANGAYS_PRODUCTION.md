# Add Barangay Data to Production

## The Issue

App shows "Found 0 barangay(s)" because the `barangays` table in Supabase is empty.

## The Fix

Run a SQL script to insert all 132 Quirino barangays into your database.

---

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard/projects
2. Select your project: **dragaqmmigajbjxlmafm**

### Step 2: Open SQL Editor

1. Click **"SQL Editor"** in left sidebar
2. Click **"+ New Query"**

### Step 3: Copy the SQL Script

The file `QUIRINO_BARANGAYS.sql` contains all 132 barangays.

**Copy the entire contents and paste into Supabase SQL Editor.**

### Step 4: Execute

1. Click **"Run"** (green play button)
2. Wait for completion
3. You should see: `Success - 132 rows inserted`

---

## What Gets Added

**132 Barangays across 6 municipalities:**

| Municipality | Count   |
| ------------ | ------- |
| Aglipay      | 25      |
| Cabarroguis  | 17      |
| Diffun       | 34      |
| Maddela      | 32      |
| Nagtipunan   | 16      |
| Saguday      | 9       |
| **Total**    | **132** |

---

## After Running the Script

1. **Refresh your browser** at: https://barangay-power-status.vercel.app/
2. **You should now see** all 132 barangays in the list
3. **Test features:**
   - [ ] Search for a barangay (e.g., "Aglipay")
   - [ ] Click on a barangay to view it
   - [ ] Click "Report Hazard" button
   - [ ] Try getting GPS location
   - [ ] Try uploading a photo

---

## Troubleshooting

### If SQL fails with "permission denied"

- Check your Supabase user has admin rights
- Try running as: `SELECT * FROM public.barangays LIMIT 1;` to verify table exists

### If you see "Found 0 barangay(s)" after running SQL

- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Wait 30 seconds for cache to clear

### If the SQL script has errors

- Make sure you're copying the complete file
- Check for any line breaks or special characters

---

## File Location

The SQL script is at:

```
QUIRINO_BARANGAYS.sql
```

**It contains:**

- DELETE statement to clear old data
- 132 INSERT statements with all barangay names
- Municipalities: Aglipay, Cabarroguis, Diffun, Maddela, Nagtipunan, Saguday

---

## Next Steps

1. ✅ **Run the SQL script** (you are here)
2. ✅ **Refresh the app** - should show all barangays
3. ✅ **Test Report Hazard** - get GPS, take photo, submit
4. ✅ **Test Admin Login** - verify authentication works
5. ✅ **Go live** - share with Quirino community

---

**Your app is almost ready! Just need to populate this one table.** 🚀

Let me know once you've run the SQL and the barangays appear!
