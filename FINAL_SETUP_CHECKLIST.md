# Setup Checklist: Before Going Live

## ✅ Phase 1: Database Configuration (Required)

### Step 1A: Load All Quirino Barangays

- [ ] Open Supabase → SQL Editor
- [ ] Create new query
- [ ] Copy all SQL from `QUIRINO_BARANGAYS.sql`
- [ ] Click Run
- [ ] Verify: `SELECT COUNT(*) FROM barangays;` shows **132**

### Step 1B: Add Custom Location Support

- [ ] Open Supabase → SQL Editor
- [ ] Create new query
- [ ] Copy all SQL from `MIGRATION_CUSTOM_LOCATION.sql`
- [ ] Click Run
- [ ] Verify: `SELECT column_name FROM information_schema.columns WHERE table_name='reports' AND column_name='custom_location';` returns a row

---

## ✅ Phase 2: Configure Supabase Redirect URLs

### For OTP Email Login (Admin)

- [ ] Go to Supabase Dashboard → Settings → Authentication
- [ ] Go to URL Configuration section
- [ ] Add Redirect URLs:
  - [ ] `http://localhost:5173/admin/callback`
  - [ ] `http://localhost:5173`
  - [ ] (Later when deployed) `https://your-vercel-domain.vercel.app/admin/callback`
- [ ] Click Save

---

## ✅ Phase 3: Test on Local Dev Server

### Test Predefined Barangays

- [ ] Open http://localhost:5173/
- [ ] Should see **5 barangays** displayed (from one municipality)
- [ ] Hard refresh (Ctrl+F5)
- [ ] Should see **all 132 Quirino barangays** grouped by municipality

### Test Report Form

- [ ] Click "Report Hazard" button
- [ ] Form loads with category selection
- [ ] Barangay dropdown shows **all 132 options + "Other"**
- [ ] Can select a barangay
- [ ] Can select "Other" → text input appears
- [ ] Can type custom location

### Test Offline Functionality

- [ ] Open DevTools → Network → set to **Offline**
- [ ] Navigate to http://localhost:5173/report
- [ ] Select category and barangay
- [ ] Click "Get GPS Location" (should show offline message)
- [ ] Add description and photo
- [ ] Click Submit
- [ ] Should see "Offline - Queued" message
- [ ] Check localStorage: `localStorage.getItem('brgy-report-queue')` shows report
- [ ] Go back **Online** (DevTools → Network)
- [ ] Report should auto-sync within 5 seconds

### Test Admin OTP Login

- [ ] Go to http://localhost:5173/admin/login
- [ ] Enter your staff email
- [ ] Click "Send OTP"
- [ ] Check your email for verification link
- [ ] Click link in email immediately
- [ ] Should redirect to `/admin/callback` → then `/admin/dashboard`
- [ ] See Admin Dashboard with moderation queue

### Test Mobile View

- [ ] Open DevTools → Device Emulation (iPhone 12 or Pixel 5)
- [ ] Test all pages in mobile view
- [ ] Report form is responsive
- [ ] Photo capture works (shows camera/gallery option)
- [ ] GPS button works
- [ ] No horizontal scrolling

---

## ✅ Phase 4: Verify Data Integrity

### Check Barangay Data

```sql
-- Run in Supabase SQL Editor
SELECT municipality, COUNT(*) as count
FROM public.barangays
GROUP BY municipality
ORDER BY municipality;

-- Should show:
-- Aglipay: 25
-- Cabarroguis: 17
-- Diffun: 34
-- Maddela: 32
-- Nagtipunan: 16
-- Saguday: 9
-- Total: 132
```

### Check RLS Policies

- [ ] Supabase → Table Editor → select `barangays` table
- [ ] Click "Policies" tab
- [ ] Should see RLS policies are set (SELECT allowed for everyone)

### Check Storage Bucket

- [ ] Supabase → Storage
- [ ] Should see `report-photos` bucket
- [ ] Bucket should be **Private**

---

## ✅ Phase 5: Pre-Deployment Build Test

### Build for Production

```bash
cd /path/to/project
npm run build
```

- [ ] Build completes without errors
- [ ] Output shows bundle sizes:
  - [ ] HTML: ~0.5 KB
  - [ ] CSS: ~15-20 KB
  - [ ] JS: ~400-450 KB
  - [ ] Service Worker: ~1 KB
- [ ] Build time: < 10 seconds

### Test Production Build Locally

```bash
npm run preview
```

- [ ] Preview server starts
- [ ] Visit http://localhost:4173/
- [ ] All pages load correctly
- [ ] Forms work as expected
- [ ] Service Worker registered (DevTools → Application → Service Workers)

---

## ✅ Phase 6: Environment Variables Check

### Verify .env.local

- [ ] File exists: `.env.local` (not committed to git)
- [ ] Contains:
  - [ ] `VITE_SUPABASE_URL` - not empty
  - [ ] `VITE_SUPABASE_ANON_KEY` - not empty
  - [ ] `VITE_TURNSTILE_SITEKEY` - not empty

### Verify .gitignore

- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.local` is NOT committed to git

```bash
# Check git status
git status
# Should NOT show .env.local as untracked
```

---

## ✅ Phase 7: Git Preparation

### Prepare for Deployment

```bash
# Check status
git status

# Add all files
git add .

# Commit with meaningful message
git commit -m "Add flexible barangay selection with custom location support

- Integrated all 132 Quirino barangays
- Added 'Other' option for unknown locations
- Support for offline queueing with custom locations
- Updated migration script for database
- Complete documentation included"

# Push to GitHub
git push origin main
```

- [ ] All changes committed
- [ ] No uncommitted files (git status shows clean)
- [ ] Changes pushed to GitHub

---

## ✅ Phase 8: Ready for Vercel Deployment

### Environment Setup on Vercel

When deploying to Vercel, set these environment variables:

- [ ] `VITE_SUPABASE_URL` - copy from `.env.local`
- [ ] `VITE_SUPABASE_ANON_KEY` - copy from `.env.local`
- [ ] `VITE_TURNSTILE_SITEKEY` - copy from `.env.local`

### Post-Deployment Test

- [ ] Vercel deployment completes
- [ ] Visit production domain
- [ ] Test all functionality (same as Phase 3)
- [ ] Verify Supabase is still connected
- [ ] Test report submission end-to-end

---

## 📊 Final Verification

- [ ] **Local Dev**: All features working
- [ ] **Build**: Production build successful
- [ ] **Database**: 132 barangays loaded
- [ ] **Forms**: All inputs functional
- [ ] **Offline**: Queuing and sync working
- [ ] **Admin**: OTP login working
- [ ] **Mobile**: Responsive on all sizes
- [ ] **Git**: Changes committed and pushed

---

## 🎉 You're Ready!

Once all checkboxes are complete, your app is production-ready:

✅ Flexible barangay selection (132 official + custom)  
✅ Offline-first architecture  
✅ OTP admin authentication  
✅ Zero-cost deployment  
✅ Mobile-optimized  
✅ Production-tested

**Time to go live with your Quirino power hazard reporting system!**

---

## Quick Reference: SQL Commands

```sql
-- Verify barangays loaded
SELECT COUNT(*) FROM public.barangays;

-- Check custom location column exists
\d public.reports

-- View all municipalities
SELECT DISTINCT municipality FROM public.barangays ORDER BY municipality;

-- Find custom locations after reports arrive
SELECT DISTINCT custom_location FROM public.reports WHERE custom_location IS NOT NULL;

-- Add a missing barangay
INSERT INTO public.barangays (name, municipality, island_group, is_active)
VALUES ('New Barangay Name', 'Municipality Name', 'Luzon', true);
```

---

## Support

For issues, refer to:

- `README.md` - Project overview
- `CUSTOM_LOCATIONS_FEATURE.md` - Custom location feature details
- `OTP_LOGIN_FIX.md` - OTP authentication troubleshooting
- `DEPLOYMENT.md` - Deployment guide
