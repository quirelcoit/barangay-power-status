# 🔴 Critical Fix: Storage RLS Policy Issue

## Problem
Photo uploads are failing with:
```
StorageApiError: new row violates row level security policy
```

## Root Cause
The `report-photos` storage bucket is **Private** but has **NO RLS policies** allowing public uploads.

## Solution: Add Storage RLS Policies

### Step 1: Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your project `brgy-power-status` (dragaqmmigajbjxlmafm)
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run the Fix Script
Copy all the SQL from `FIX_STORAGE_RLS.sql` and paste into SQL Editor, then click "Run"

The script will:
- ✅ Allow anonymous users to **upload** to `report-photos` bucket
- ✅ Allow anonymous users to **read** from `report-photos` bucket
- ✅ Allow admin staff to **delete** from `report-photos` bucket

### Step 3: Verify the Fix
Run this query to confirm policies exist:

```sql
SELECT policy_name, roles, operation
FROM storage.policies
WHERE bucket_id = 'report-photos';
```

You should see 3 policies:
- `Allow public uploads to report-photos` (for INSERT)
- `Allow public reads from report-photos` (for SELECT)
- `Allow staff deletes from report-photos` (for DELETE)

### Step 4: Test the App
1. Go to https://barangay-power-status.vercel.app
2. Create a new report **with uploaded photo**
3. Check browser console - should see:
   ```
   ✅ Photo uploaded successfully
   ✅ Photo record created in database
   ```
4. Go to admin dashboard → **📸 Photos** button
5. Photos should now appear! ✅

---

## Alternative: Fix via Supabase Dashboard (If SQL doesn't work)

1. Go to **Storage** in Supabase Dashboard
2. Click **report-photos** bucket
3. Go to **Policies** tab
4. Click **New Policy** → **For INSERT**:
   - Name: `Allow public uploads`
   - Roles: `anon`
   - Check: `bucket_id = 'report-photos'`
   - Click **Create**
5. Repeat for **SELECT** (read) policy

---

## Why This Works

**Before:**
- Bucket: Private ❌
- RLS policies: None ❌
- Result: All uploads blocked

**After:**
- Bucket: Private (doesn't matter)
- RLS policies: Allow anon INSERT/SELECT ✅
- Result: Public can upload and view photos

RLS policies at the **row level** override bucket privacy settings - they grant access even if bucket is Private.
