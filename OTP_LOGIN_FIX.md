# Fix OTP Email Login Issue

## Problem

When clicking the OTP link in the email, you get: `error=access_denied&error_code=otp_expired`

## Root Cause

Supabase doesn't know where to redirect after email verification. You need to whitelist the redirect URL in Supabase settings.

## Solution

### Step 1: Update Supabase Redirect URLs

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add these URLs:

   - `http://localhost:5173/admin/callback` (for local development)
   - `http://localhost:5173` (fallback)
   - `https://your-vercel-domain.vercel.app/admin/callback` (when deploying to production)

5. Click **Save**

### Step 2: Test OTP Login Flow

1. Open http://localhost:5173/admin/login
2. Enter your staff email address
3. Click **"Send OTP"**
4. Check your email for the verification link
5. **Click the link in the email immediately** (within a few minutes)
6. You should be redirected to `/admin/callback`
7. Then automatically redirected to `/admin/dashboard`

### Step 3: What Changed in the Code

#### New Route Added

- **`/admin/callback`** - Handles OTP verification callback from Supabase

#### Updated Files

- `src/lib/supabase.ts` - Added `persistSession: true` for session persistence
- `src/pages/Admin/Login.tsx` - Added `emailRedirectTo` option when sending OTP
- `src/pages/Admin/Callback.tsx` - New page that verifies the session and redirects to dashboard
- `src/routes.tsx` - Added callback route

### Step 4: Staff Account Setup

Before you can log in, ensure a staff account exists in your Supabase:

```sql
-- In Supabase SQL Editor, run:
INSERT INTO public.staff_profiles (uid, display_name, role)
VALUES ('[YOUR_UID]', 'Your Name', 'moderator');
```

To get your UID:

1. Invite a staff member to sign up via email (use Supabase Auth UI or your email)
2. Once they confirm the email, they'll have a UID in the `auth.users` table
3. Then add them to `staff_profiles` table with the SQL above

### Troubleshooting

| Error                                | Solution                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `otp_expired`                        | The redirect URL isn't configured in Supabase settings. Follow Step 1 above.                          |
| `access_denied`                      | Your email isn't registered as a staff account. Check `staff_profiles` table.                         |
| Blank page after clicking email link | Service Worker may be caching old pages. Clear browser cache (DevTools → Application → Clear storage) |
| Session not persisting               | Browser cookies disabled or incognito mode. Try normal browsing mode.                                 |

### Testing Locally

```bash
# Start dev server
npm run dev

# Visit login page
# http://localhost:5173/admin/login

# Submit email → check inbox → click link → should see /admin/callback loading → redirect to dashboard
```

### Production Deployment

Before deploying to Vercel:

1. Add production redirect URL to Supabase:

   - Replace `your-vercel-domain` with your actual Vercel domain
   - Example: `https://brgy-power-reporter.vercel.app/admin/callback`

2. Deploy to Vercel with environment variables set

3. Test OTP flow on production domain
