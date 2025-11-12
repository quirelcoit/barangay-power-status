# 🔴 Critical Fix: Storage RLS Policy Issue

## Problem

Photo uploads are failing with:

```
StorageApiError: new row violates row level security policy
```

## Root Cause

The `report-photos` storage bucket is **Private** but has **NO RLS policies** allowing public uploads.

## Solution: Add Storage RLS Policies

### Method 1: Using SQL Editor (Try First)

1. Open https://app.supabase.com
2. Select your project `brgy-power-status` (dragaqmmigajbjxlmafm)
3. Go to **SQL Editor** (left sidebar)
4. Copy all SQL from `FIX_STORAGE_RLS.sql` and paste into editor
5. Click **Run**

If you get an error about `storage.policies` - that's okay, it might still have worked. Skip to verification.

### Method 2: Verify in Dashboard UI

1. Go to **Storage** (left sidebar)
2. Click **report-photos** bucket
3. Go to **Policies** tab
4. You should see 3 policies listed:
   - ✅ `Allow public uploads to report-photos`
   - ✅ `Allow public reads from report-photos`
   - ✅ `Allow staff deletes from report-photos`

If you don't see them, use **Method 3** below.

### Method 3: Create Policies Manually via UI (If Needed)

1. Go to **Storage** → **report-photos** bucket
2. Click **Policies** tab
3. Click **New Policy** button

#### Create Policy 1: Allow Public Uploads

- Click "For INSERT" template
- Name: `Allow public uploads to report-photos`
- Roles: `anon` (check the box)
- Filter: `bucket_id = 'report-photos'`
- Click **Create**

#### Create Policy 2: Allow Public Reads

- Click "For SELECT" template
- Name: `Allow public reads from report-photos`
- Roles: `anon` (check the box)
- Filter: `bucket_id = 'report-photos'`
- Click **Create**

#### Create Policy 3: Allow Staff Deletes (Optional)

- Click "For DELETE" template
- Name: `Allow staff deletes from report-photos`
- Roles: `authenticated` (check the box)
- Filter: `bucket_id = 'report-photos' AND EXISTS (SELECT 1 FROM public.staff_profiles WHERE uid = auth.uid())`
- Click **Create**

---

## Test the Fix

After creating the 3 policies:

1. Go to https://barangay-power-status.vercel.app
2. Create a new report **with uploaded photo**
3. Check browser console (F12) - should see:
   ```
   ✅ Photo uploaded successfully
   ✅ Photo record created in database
   ```
4. Go to admin dashboard
5. Click **📸 Photos** button
6. Photos should now appear! ✅

---

## Why This Works

**Before:**

- Bucket privacy: Private
- RLS policies: None ❌
- Result: All uploads blocked

**After:**

- Bucket privacy: Private (unchanged)
- RLS policies: Allow anon INSERT/SELECT ✅
- Result: Public can upload and view photos

RLS policies override bucket privacy - they grant specific access even if bucket is Private.
