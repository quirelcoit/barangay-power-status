# Root Cause: Missing Environment Variables

## Problem

Production app showed blank page because Supabase environment variables weren't set in Vercel.

## Root Cause

`src/lib/supabase.ts` was **throwing an error** if environment variables were missing:

```typescript
// ❌ OLD CODE - THROWS ERROR
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables..."
  );
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {...});
```

When variables were missing → Error thrown → App crashed before rendering → Blank page

## Solution

Changed to use **placeholder values** and show a warning instead:

```typescript
// ✅ NEW CODE - ALLOWS APP TO LOAD
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Missing Supabase environment variables...");
}

export const supabase = createClient(url, key, {...});
```

**Result**:

- ✅ App UI renders and displays
- ✅ Console shows warning if variables missing
- ⚠️ Supabase features (login, report submission) won't work until variables are set

## What Changed

| File                  | Change                                             |
| --------------------- | -------------------------------------------------- |
| `src/lib/supabase.ts` | Remove error throw, use placeholders, show warning |

## Deployment

```
commit: e8ea313
message: Fix: Allow app to load without Supabase env variables
pushed: ✅
```

## Next Steps

### 1. Vercel Redeploy (2-3 minutes)

- Vercel detects push
- Fresh build with fix
- Site should now display UI

### 2. Set Environment Variables in Vercel

Go to Vercel Dashboard → Project Settings → Environment Variables

Add:

- `VITE_SUPABASE_URL` = (your Supabase URL)
- `VITE_SUPABASE_ANON_KEY` = (your Supabase anon key)
- `VITE_TURNSTILE_SITEKEY` = (your Turnstile key)

Then redeploy from Vercel for full functionality.

### 3. Expected Results After Env Vars Set

- ✅ Home page loads with barangay list
- ✅ Report form functional
- ✅ GPS captures location
- ✅ Photo upload works
- ✅ Report submission to Supabase works
- ✅ Admin login functional

## Status

| Item                  | Status                    |
| --------------------- | ------------------------- |
| Code fix              | ✅ Complete               |
| Local build           | ✅ Success                |
| Pushed to GitHub      | ✅ Complete               |
| Vercel deployment     | ⏳ In progress            |
| Environment variables | ⏳ Pending (manual setup) |
| Production live       | ⏳ After env vars added   |

## Testing Phases

**Phase 1: UI Display (Now)**

- App should load and show UI
- Navbar, home page, buttons visible
- Console shows warning about missing env vars

**Phase 2: Full Functionality (After env vars)**

- Set environment variables in Vercel
- Trigger redeploy
- Test all features (GPS, photo, report submission)

---

**Timeline**:

- Deployed: commit e8ea313
- Expected live with UI: ~2-3 minutes
- Full functionality: After environment variables configured

Check production domain in 2-3 minutes. You should see the home page with barangay list! 🚀
