# Fix Admin Login Callback URL

## Problem
Supabase redirect URL needs to use hash-based routing for React Router.

## Solution

Go to **Supabase Dashboard** → **Settings** → **Authentication** → **URL Configuration**

Update the **Redirect URLs** to include:

```
https://barangay-power-status.vercel.app/#/admin/callback
https://barangay-power-status.vercel.app/admin/callback
http://localhost:5173/#/admin/callback
http://localhost:5173/admin/callback
```

**Important:** The hash (`#`) routes are needed because we use React Router's hash mode.

## Steps

1. Go to: https://supabase.com/dashboard/project/dragaqmmigajbjxlmafm/settings/auth
2. Scroll to **URL Configuration**
3. In **Redirect URLs**, add these lines (comma-separated or one per line):
   - `https://barangay-power-status.vercel.app/#/admin/callback`
   - `https://barangay-power-status.vercel.app/admin/callback`
   - `http://localhost:5173/#/admin/callback`
   - `http://localhost:5173/admin/callback`
4. Click **Save**

## Test

1. Go to: `https://barangay-power-status.vercel.app/admin/login`
2. Enter your email
3. Click "Send Login Link"
4. Check your email
5. Click the link - should now redirect to dashboard successfully!

If you still get 404, it might be because Supabase is redirecting but the hash routing isn't recognizing it. In that case, we may need to change to browser history routing instead of hash routing.
