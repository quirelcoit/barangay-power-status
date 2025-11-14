# Deployment Guide

## Overview

The **Barangay Power Status Reporter** is designed for zero-cost deployment using free tiers of:

- **Supabase** (database, auth, storage)
- **Cloudflare Pages** (static hosting)
- **Cloudflare Turnstile** (CAPTCHA)

This guide walks you through deployment from start to finish.

---

## Prerequisites

Before deploying, ensure:

1. **GitHub Repository**: Push code to GitHub (or GitLab/Gitea)
2. **Supabase Project**: Create free project at https://supabase.com
3. **Cloudflare Account**: Free account at https://dash.cloudflare.com
4. **Domain** (optional): Custom domain for better UX (e.g., `status.myec.ph`)

---

## Step 1: Supabase Setup

### 1a. Create Supabase Project

1. Go to https://supabase.com and sign up
2. Create a new project:
   - Name: `brgy-power-status` (or your choice)
   - Password: Save securely
   - Region: Closest to your users
3. Wait for project to initialize (~2 minutes)

### 1b. Run SQL Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Copy all SQL from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. Paste into SQL editor and run each section
4. Verify tables are created under **Database > Tables**

### 1c. Create Storage Bucket

1. Go to **Storage > Buckets**
2. Click **Create Bucket**
   - Name: `report-photos`
   - Privacy: **Private**
   - Allowed file types: images/\*

### 1d. Seed Barangays

1. Go to **SQL Editor**
2. Run Step 11 from SUPABASE_SETUP.md (or customize with your barangays)
3. Verify in **Database > Tables > barangays**

### 1e. Get API Keys

1. Go to **Settings > API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon/Public Key** → `VITE_SUPABASE_ANON_KEY`
   - Save these for later

---

## Step 2: Cloudflare Setup

### 2a. Get Turnstile Sitekey

1. Go to https://dash.cloudflare.com
2. **Turnstile > Create Site**
   - Domain: Your domain or `localhost`
   - Mode: Managed (default)
3. Copy **Site Key** → `VITE_TURNSTILE_SITEKEY`

### 2b. Create Cloudflare Pages Project

1. Go to **Pages > Create Project**
2. Choose **Connect to Git** (select GitHub/GitLab)
3. Authorize and select your repo
4. **Build Settings**:
   - Framework: **None** (or Vite)
   - Build command: `npm run build`
   - Build output directory: `dist`
5. **Environment Variables** (add):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TURNSTILE_SITEKEY`
6. Click **Deploy**

### 2c. Wait for Deployment

Cloudflare Pages will automatically:

- Clone your repo
- Run `npm install`
- Run `npm run build`
- Deploy to global CDN

First deployment takes ~5 minutes. Subsequent pushes are faster.

---

## Step 3: Create Staff Accounts

### 3a. Invite Staff via Supabase Auth

1. Go to Supabase **Authentication > Users**
2. Click **Invite User**
   - Email: `staff@myec.ph`
   - Send invite
3. Staff gets email with sign-up link

### 3b. Add to staff_profiles Table

After staff signs up, add them to staff_profiles:

1. Go to **SQL Editor**
2. Get their UUID from **Users** table
3. Run:
   ```sql
   insert into public.staff_profiles (uid, display_name, role) values
   ('[THEIR_UUID]', 'John Operator', 'moderator');
   ```

---

## Step 4: Custom Domain (Optional)

### With Cloudflare

If you use Cloudflare for DNS:

1. Go to Cloudflare **Domains**
2. Add CNAME record:
   - Name: `status`
   - Content: `[your-project].pages.dev`
   - Proxied: Yes
3. Save
4. Update Turnstile allowed domain in Cloudflare dashboard

### Without Cloudflare

1. Get Pages deployment URL from Cloudflare dashboard
2. At your domain registrar, add CNAME:
   - `status` → `[your-project].pages.dev`
3. DNS propagates in 24-48 hours

### Update Supabase CORS

If using custom domain:

1. Go to Supabase **Settings > API > CORS**
2. Add your domain: `https://status.myec.ph`

---

## Step 5: Verify Deployment

1. Visit `https://[your-project].pages.dev` (or custom domain)
2. Test features:
   - **Home page**: Search barangay
   - **Submit Report**: Photo, GPS, barangay selection
   - **Admin Login**: Email OTP login
   - **Offline mode**: Turn off WiFi, submit report (should queue)
   - **Online sync**: Turn WiFi back on (report should sync)

---

## Monitoring & Maintenance

### View Logs

1. **Supabase**: **Logs** tab shows database queries
2. **Cloudflare Pages**: **Deployments** tab shows build/deploy status
3. **Errors**: Check browser console or Supabase error logs

### Backup Data

1. Supabase free tier includes **7-day backups**
2. For longer retention, use Supabase **Database > Backups** (Pro tier)
3. Or export CSV via SQL:
   ```sql
   copy (select * from public.reports) to stdout with csv header;
   ```

### Update Code

To deploy code changes:

1. Commit and push to GitHub
2. Cloudflare Pages automatically rebuilds and redeploys
3. Monitor **Deployments** tab for status

---

## Scaling (After Launch)

### Free Tier Limits

| Service              | Limit                         | Notes                    |
| -------------------- | ----------------------------- | ------------------------ |
| **Supabase**         | 500 MB database, 1 GB storage | Plenty for small regions |
| **Cloudflare Pages** | Unlimited bandwidth           | No overage charges       |
| **Auth**             | Unlimited users               | Email OTP is free        |

### When to Upgrade

Upgrade to **Supabase Pro** ($25/mo) if:

- Database > 500 MB
- Storage > 1 GB
- Need real-time updates or custom functions
- Running 24/7 high-traffic application

Upgrade to **Cloudflare Pro** ($20/mo) if:

- Need custom SSL/TLS
- Want advanced analytics
- Plan to serve very high traffic

---

## Troubleshooting

### Build Fails

- Check `npm run build` locally
- Verify all dependencies installed: `npm install`
- Check build log in Cloudflare Pages > Deployments

### Reports Not Saving

- Check Supabase connection in browser console
- Verify API keys in `.env.local`
- Check Supabase RLS policies are enabled
- Verify storage bucket permissions

### Photos Not Uploading

- Ensure `report-photos` bucket exists and is private
- Check file size (< 5MB after compression)
- Verify Supabase storage quota not exceeded
- Check CORS settings in Supabase

### Login Fails

- Verify staff user exists in Supabase Auth
- Check user is in `staff_profiles` table
- Confirm email was received (check spam)
- Test with different email domain

### Slow Performance

- Check Supabase query logs for slow queries
- Add indexes (see SUPABASE_SETUP.md Step 10)
- Verify Cloudflare cache is working
- Check image compression (should be ~1600px max)

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **This Project**: Check README.md and inline code comments

---

## 📋 Current Deployment Status (November 13, 2025)

### ✅ Latest Changes Deployed

**Commit**: `8af05be`  
**Date**: November 13, 2025

#### New Features:
1. **Municipality Expansion** - Users can now tap municipalities to see all energized barangays
2. **Related Barangays Navigation** - Easy navigation between barangays in same municipality
3. **Enhanced Data Display** - Proper barangay names and status indicators

#### Files Updated:
- `src/pages/PowerProgress.tsx` - Enhanced with real barangay data
- `src/pages/BarangayView.tsx` - Added related barangays section
- `docs/` - Added comprehensive documentation

#### Documentation Added:
- `BARANGAY_VIEW_IMPROVEMENTS.md` - Feature documentation
- `CODE_CHANGES_REFERENCE.md` - Detailed code changes
- `IMPLEMENTATION_COMPLETE_V2.md` - Implementation summary
- `QUICK_TESTING_GUIDE.md` - Testing procedures

### 🚀 Deployment to Vercel

**Git Status**: ✅ Pushed to `origin/main`
**Vercel Status**: ⏳ Automatic deployment triggered

#### What to Do:
1. Visit https://github.com/quirelcoit/barangay-power-status
2. Verify latest commit is visible (hash: 8af05be)
3. Go to Vercel dashboard: https://vercel.com/dashboard
4. Monitor deployment progress (3-5 minutes)
5. Once "Ready" (green), test at live URL

#### Test After Deployment:
```
1. Open home page (/)
2. Click any municipality to expand and see energized barangays
3. Click any barangay to view details
4. Scroll to "Other Barangays" section
5. Click another barangay to navigate
6. Verify no console errors (F12)
```

---

**Your deployment is now live! 🚀**

Monitor the admin dashboard regularly and respond to reports quickly for best community impact.
