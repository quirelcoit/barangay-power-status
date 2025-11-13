# Fix: Barangays Not Loading + Phone 404 Error

## Problem 1: PC Shows "Found 0 barangay(s)"

The barangays table is empty - SQL insert didn't execute.

## Problem 2: Phone Shows "404: NOT_FOUND"

Supabase storage bucket not set up for photo uploads.

---

## QUICK FIX - PC First (5 minutes)

### Option A: Use New Simplified SQL (RECOMMENDED)

1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Copy **ALL** of: `BARANGAYS_INSERT_SIMPLE.sql`
4. Paste into SQL editor
5. Click **Run** (green button)
6. Should show: `132` rows affected

**Why this works better:**

- Disables RLS temporarily to allow INSERT
- Re-enables RLS after data added
- Simpler, fewer syntax issues

---

### Option B: If Option A Fails

Try this minimal SQL:

```sql
DELETE FROM public.barangays;

INSERT INTO public.barangays (name, municipality, is_active) VALUES
('Alicia', 'Aglipay', true),
('Cabugao', 'Aglipay', true),
('Test Barangay', 'Test', true);

SELECT COUNT(*) FROM public.barangays;
```

If this returns `3`, your table is working and the full insert just needs tweaking.

---

## AFTER PC IS FIXED

### Step 1: Test on PC

1. Refresh: https://barangay-power-status.vercel.app/
2. Should now show barangay list
3. Try searching for "Aglipay"

### Step 2: Set Up Photo Storage on Phone

Go back to Supabase Dashboard:

1. **Left sidebar** → **Storage**
2. Look for bucket named `report_photos`
3. If it doesn't exist, click **Create Bucket**
   - Name: `report_photos`
   - Public: Yes (toggle ON)
   - Click **Create**

### Step 3: Test Phone

1. On phone: https://barangay-power-status.vercel.app/
2. Click "Report Hazard"
3. Should now see the form
4. Try:
   - [ ] Getting GPS location
   - [ ] Taking a photo
   - [ ] Submitting a report

---

## What's Happening on Phone

**404 Error means:**

- App is looking for `/storage/v1/object/public/report_photos/...`
- That storage bucket doesn't exist or isn't public
- App crashes before rendering main page

**After creating storage bucket:**

- Phone will load normally
- Photo upload will work
- No more 404 errors

---

## Complete Checklist

### Phase 1: Database (Do Now)

- [ ] Run BARANGAYS_INSERT_SIMPLE.sql
- [ ] See "132" result
- [ ] Refresh PC browser
- [ ] Barangays appear

### Phase 2: Storage (If Phone is broken)

- [ ] Go to Supabase Storage
- [ ] Create bucket: `report_photos` (public)
- [ ] Hard refresh phone
- [ ] Form loads without 404

### Phase 3: Test Everything

- [ ] PC: Search barangay → works
- [ ] PC: Click barangay → view opens
- [ ] PC: Click "Report Hazard" → form loads
- [ ] Phone: Form loads without 404
- [ ] Phone: GPS button works
- [ ] Phone: Photo buttons work
- [ ] Phone: Submit creates report

---

## If Still Issues

### Barangays not showing after SQL?

1. Check Supabase says "132" rows inserted
2. Hard refresh (Ctrl+Shift+R)
3. Wait 30 seconds
4. Try incognito/private browser

### Phone still shows 404?

1. Check Supabase Storage has `report_photos` bucket
2. Bucket visibility is "Public"
3. Hard refresh phone (or force clear app cache)
4. Try different browser on phone

### Still blank on both?

1. Check browser console for errors (F12)
2. Look for red error messages
3. Share the error text for debugging

---

## File References

**For SQL Insert:**

- `BARANGAYS_INSERT_SIMPLE.sql` - Clean insert with RLS management
- `QUIRINO_BARANGAYS.sql` - Original (may have issues)

**After This Works:**

- Your app will display all 132 barangays
- Users can submit reports with GPS + photos
- Admin can review reports
- System ready for Quirino community

---

**Status**: Ready to fix! Run the SQL first, then set up storage. Let me know results!
