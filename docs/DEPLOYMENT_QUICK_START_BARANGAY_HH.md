# DEPLOYMENT QUICK START

## ✅ Current Status: Feature Complete

All code is ready. Just need to run the database migration.

---

## 🚀 Deployment Steps

### 1️⃣ Backup Current Database (Optional but Recommended)

```bash
# Supabase Dashboard → Projects → Your Project → Backups
# Click "Create backup"
```

### 2️⃣ Run Migration

**In Supabase SQL Editor:**

1. Go to: https://app.supabase.com → Your Project → SQL Editor
2. Create new query
3. Copy-paste entire contents from:
   ```
   supabase_sql/MIGRATION_BARANGAY_HOUSEHOLDS.sql
   ```
4. Click "Run"
5. Wait for completion (should be <30 seconds)

**Expected Output:**

- "Executed in XXms"
- No errors

### 3️⃣ Verify Migration Success

**In SQL Editor, run:**

```sql
-- Check table exists
SELECT COUNT(*) as barangay_count FROM barangay_households;
-- Should return: 150

-- Check view exists
SELECT COUNT(*) as status_view_count FROM barangay_household_status;
-- Should return: 150
```

### 4️⃣ Test in Staging (Deploy Preview)

1. Go to: https://github.com/quirelcoit/barangay-power-status
2. Click "Vercel" deployment status
3. Wait for staging build to complete
4. Test URL will be provided (usually: brgy-power-stat-reporter-v1-staging.vercel.app)

**Test Checklist:**

- [ ] Admin → Power Update → Barangay Households tab visible
- [ ] Municipalities list appears
- [ ] Click DIFFUN to expand (should show 33 barangays)
- [ ] Barangay grid appears with columns: Name | Total HH | Restored | For Restore | %
- [ ] Try entering a value (e.g., 150) in first barangay
- [ ] Click Submit
- [ ] Green success toast appears
- [ ] Refresh page - value should persist
- [ ] Go to PowerProgress page
- [ ] Click DIFFUN to expand Energized Barangays
- [ ] Barangay cards should appear with household data

### 5️⃣ Deploy to Production

```bash
# All production builds happen automatically on push
# Latest changes already in GitHub main branch
# Will auto-deploy to: https://brgy-power-stat-reporter-v1.vercel.app
```

**Or manually:**

1. Go to Vercel dashboard
2. Click project "brgy-power-stat-reporter-v1"
3. Find "main" branch
4. Click "..." menu → "Deploy"

### 6️⃣ Final Verification

1. Open: https://brgy-power-stat-reporter-v1.vercel.app
2. Test Admin form (Power Update → Barangay Households)
3. Test Dashboard (PowerProgress → Energized Barangays)
4. All should match staging behavior

---

## 📋 What Got Deployed

| Component            | What's New                                               |
| -------------------- | -------------------------------------------------------- |
| **Admin Form**       | "Barangay Households" tab with expandable municipalities |
| **Dashboard**        | Barangay-level household cards in Energized section      |
| **Database**         | 3 new tables/views + 150 barangays + RLS policies        |
| **Form Persistence** | localStorage saves for form data recovery                |
| **Color Coding**     | Dynamic progress bars (Red/Orange/Yellow/Lime/Green)     |

---

## 🔄 Rolling Back (If Needed)

If something breaks:

**Option 1: Restore Database Backup**

- Supabase Dashboard → Backups → Select backup date → Restore

**Option 2: Revert Git Commit**

```bash
git revert b93cbfa  # Last commit hash
git push origin main
# Vercel auto-redeploys
```

---

## 📞 Support

**If migration fails:**

- Check error message in Supabase SQL Editor
- Ensure all SQL syntax is correct
- Verify tables don't already exist (first-time migrations only)

**If app breaks after deploy:**

- Check browser console for errors (F12)
- Verify database connection in app logs
- Compare with staging build to isolate issue

---

## 📊 Key Metrics

| Metric                      | Value                 |
| --------------------------- | --------------------- |
| Total Barangays             | 150                   |
| Total Municipalities        | 7                     |
| Avg Households per Barangay | 228                   |
| Database Records Created    | 450+ (tables + views) |
| New State Variables         | 4                     |
| New Functions               | 4                     |
| Lines of Code Added         | 1,680+                |

---

**Ready? You can run the migration now!** 🎯
