# How to Add All 132 Quirino Barangays to Your App

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Copy & Paste the SQL Script

1. Open the file `QUIRINO_BARANGAYS.sql` in your project (it's in the root folder)
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click the **Run** button (▶️)

**Alternative:** If you prefer, you can run this simplified version:

- Go to Supabase → SQL Editor → New Query
- Delete all sample data: `DELETE FROM public.barangays;`
- Then paste the INSERT statements from `QUIRINO_BARANGAYS.sql`

### Step 3: Verify the Data

After running the SQL, you should see:

- ✅ **132 total barangays** inserted
- ✅ **6 municipalities**: Aglipay, Cabarroguis, Diffun, Maddela, Nagtipunan, Saguday

To verify, run this query in SQL Editor:

```sql
SELECT municipality, COUNT(*) as count FROM public.barangays GROUP BY municipality ORDER BY municipality;
```

Should show:

```
Aglipay       | 25
Cabarroguis   | 17
Diffun        | 34
Maddela       | 32
Nagtipunan    | 16
Saguday       | 9
```

### Step 4: Refresh Your App

1. Go to http://localhost:5173/
2. **Hard refresh** (Ctrl+F5 or Cmd+Shift+R on Mac)
3. All 132 Quirino barangays should now appear!

---

## What Changes in Your App

### Home Page

- **Before**: 5 sample barangays from Nueva Ecija
- **After**: 132 Quirino barangays grouped by municipality
- Users can search for any barangay (e.g., "Aglipay" shows all 25 Aglipay barangays)

### Report Form (/report)

- **Before**: Dropdown had 5 sample barangays
- **After**: Dropdown has all 132 Quirino barangays organized by municipality
- Users select their specific barangay before submitting hazard report

### Barangay Detail Page (/barangay/[id])

- Each of the 132 barangays now has a detail page showing:
  - Latest power status
  - Timeline of updates
  - Recent hazard reports from residents

### Admin Dashboard

- Staff can see reports filtered by each municipality
- Easy to manage hazard reports per barangay in Quirino

---

## Testing the Update

### Test 1: Search Filter

1. Go to http://localhost:5173/
2. Try searching: "Maddela" → should show all 32 Maddela barangays
3. Try searching: "San" → should show all barangays with "San" in name

### Test 2: Report Submission

1. Click "Report Hazard" button
2. Click the barangay dropdown
3. Should see all 132 barangays
4. Select "San Francisco, Aglipay"
5. Form should be ready to submit

### Test 3: Click a Barangay

1. On home page, click any barangay card (e.g., "Alicia")
2. Should go to `/barangay/[id]` showing details for that barangay
3. Page should load successfully

---

## Troubleshooting

| Issue                                  | Solution                                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Still seeing old barangays             | Hard refresh browser (Ctrl+F5) or clear Service Worker cache (DevTools → Application → Clear storage) |
| SQL error when running query           | Make sure you're in the correct database. Check `VITE_SUPABASE_URL` in `.env.local`                   |
| Barangay dropdown still shows old list | Try `npm run build` then refresh                                                                      |
| Barangays not appearing in search      | Check that `is_active = true` for all barangays in the SQL                                            |

---

## File Reference

- **QUIRINO_BARANGAYS.sql** - Complete SQL script with all 132 barangays
- **Run this in:** Supabase Dashboard → SQL Editor
- **Time to run:** < 1 second
- **Tables affected:** `public.barangays`

---

## Summary

After completing these steps:

- ✅ 132 Quirino barangays loaded in database
- ✅ All 6 municipalities properly organized
- ✅ App fully functional with actual Quirino data
- ✅ Ready to test hazard reporting
- ✅ Ready to deploy to Vercel

**You're all set to go live with your actual Quirino community data!**
