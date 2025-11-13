# Project Checklist & Next Steps

## ✅ Completed

- [x] React 19 + Vite + TypeScript project initialized
- [x] Tailwind CSS configured
- [x] All dependencies installed (`npm install --legacy-peer-deps`)
- [x] Supabase client library (`src/lib/supabase.ts`)
- [x] Utility libraries (image, EXIF, geo, Turnstile)
- [x] React components (Navbar, Card, StatusBadge, etc.)
- [x] Page components (Home, ReportNew, BarangayView, Admin pages)
- [x] React Router setup with all routes
- [x] Custom hooks (useOnlineQueue, useSupabaseQuery)
- [x] LocalStorage report queue store
- [x] Service Worker for PWA + offline support
- [x] Build configuration (vite.config.ts, postcss.config.js)
- [x] Environment variables template (.env.example)
- [x] Tailwind CSS custom colors (power-_, danger-_)
- [x] Production build working (`npm run build` ✓ 426KB gzipped)
- [x] Documentation (README.md, SUPABASE_SETUP.md, DEPLOYMENT.md)

---

## ⏭️ Next Steps (In Order)

### 1. Local Testing (30 min)

```bash
npm install  # Already done
npm run dev  # Start dev server at http://localhost:5173
```

**Test these user flows:**

- [ ] Home page loads, search works
- [ ] Submit report form (all fields)
  - [ ] Category selection
  - [ ] Photo capture/upload
  - [ ] GPS button
  - [ ] Barangay picker
- [ ] Offline simulation
  - [ ] Disable WiFi
  - [ ] Submit report (should queue)
  - [ ] See "Offline: Report queued" message
  - [ ] Re-enable WiFi (should sync)

### 2. Supabase Setup (45 min)

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md):

- [ ] Create Supabase project (https://supabase.com)
- [ ] Run SQL schema (all 12 steps)
- [ ] Create storage bucket `report-photos` (private)
- [ ] Seed barangays (or customize for your region)
- [ ] Copy API keys to `.env.local`

```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

### 3. Cloudflare Setup (30 min)

- [ ] Create Cloudflare account (https://dash.cloudflare.com)
- [ ] Create Turnstile site (get sitekey)
- [ ] Add to `.env.local`:
  ```
  VITE_TURNSTILE_SITEKEY=[sitekey]
  ```
- [ ] Test locally: `npm run dev` should load Turnstile widget

### 4. Test with Real Backend (15 min)

```bash
npm run dev
```

- [ ] Navigate to "Report Hazard" page
- [ ] Fill form and submit
- [ ] Check Supabase > Tables > reports (should have new row)
- [ ] Test photo upload
- [ ] Check Supabase Storage > report-photos (should have image)

### 5. Admin Setup (15 min)

- [ ] Invite staff user in Supabase Auth
- [ ] Staff signs up via email link
- [ ] Add staff to `staff_profiles` table (SQL):
  ```sql
  insert into public.staff_profiles (uid, display_name, role)
  values ('[UUID]', 'John Operator', 'moderator');
  ```
- [ ] Login to admin dashboard
- [ ] Create a barangay update

### 6. Production Build & Deploy (30 min)

**Locally:**

```bash
npm run build  # Should succeed without errors
npm run preview  # Test production build locally
```

**Deploy to Cloudflare Pages:**

- [ ] Push code to GitHub repo
- [ ] Create Cloudflare Pages project (connect GitHub)
- [ ] Configure build:
  - Build command: `npm run build`
  - Build output: `dist`
- [ ] Add environment variables to Cloudflare:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_TURNSTILE_SITEKEY`
- [ ] Trigger deploy
- [ ] Wait for build to complete
- [ ] Visit `https://[project].pages.dev`

### 7. Test Production (20 min)

- [ ] Test home page
- [ ] Test report submission
- [ ] Test admin login
- [ ] Submit report from mobile (iOS/Android)
- [ ] Test offline mode on mobile

### 8. Custom Domain (Optional, 15 min)

- [ ] Register domain if needed
- [ ] Point domain to Cloudflare Pages (CNAME record)
- [ ] Update Supabase CORS to allow domain
- [ ] Update Turnstile allowed domains
- [ ] Test with custom domain

### 9. Go Live! 🚀

- [ ] Share link with stakeholders
- [ ] Monitor admin dashboard for reports
- [ ] Respond to high-priority hazards
- [ ] Post official updates as needed
- [ ] Gather feedback for v2 improvements

---

## 📋 Project Files

| File                 | Purpose                               |
| -------------------- | ------------------------------------- |
| `README.md`          | Project overview, quick start         |
| `SUPABASE_SETUP.md`  | Database schema & setup instructions  |
| `DEPLOYMENT.md`      | Production deployment guide           |
| `CHECKLIST.md`       | This file – next steps                |
| `.env.example`       | Environment variables template        |
| `src/lib/`           | Core utilities (image, geo, Supabase) |
| `src/components/`    | Reusable UI components                |
| `src/pages/`         | Route pages (Home, Report, Admin)     |
| `src/hooks/`         | Custom hooks (offline sync, queries)  |
| `src/store/`         | LocalStorage queue management         |
| `src/worker/`        | Service Worker for PWA                |
| `vite.config.ts`     | Vite build configuration              |
| `tailwind.config.js` | Tailwind CSS theme                    |
| `postcss.config.js`  | PostCSS + Tailwind                    |

---

## 🔧 Commands

```bash
npm run dev         # Start dev server (http://localhost:5173)
npm run build       # Build for production (dist/)
npm run preview     # Preview production build locally
npm run lint        # Run ESLint
npm install         # Install dependencies (with legacy-peer-deps flag)
npm install --legacy-peer-deps  # For dependency conflicts
```

---

## 📱 Mobile Considerations

The app is mobile-first with PWA support:

- ✅ Responsive design (Tailwind CSS)
- ✅ Large tap targets (buttons, inputs)
- ✅ Offline-first architecture
- ✅ Photo capture from camera (`capture="environment"`)
- ✅ GPS geolocation support
- ✅ Service Worker caching
- ✅ Installable as PWA (Add to Home Screen)

**To install PWA on mobile:**

1. Open in browser
2. Menu > "Install app" or "Add to Home Screen"
3. App appears as native app on home screen

---

## 🔒 Security Checklist

- [x] No sensitive data in frontend code
- [x] EXIF stripping on client before upload
- [x] Row-Level Security (RLS) enabled in Supabase
- [x] Turnstile CAPTCHA on submit form
- [x] Anonymous reports (no personal data stored)
- [x] Signed URLs for photo access (5-min expiry)
- [ ] Content Security Policy (CSP) headers (add if needed)
- [ ] Rate limiting on API (consider Supabase Edge Functions)

---

## 🚀 Performance Tips

- Image compression: Auto-resizes to ~1600px, JPEG quality 0.7
- Service Worker: Caches static assets on first visit
- Supabase Storage: Use signed URLs instead of public URLs
- Cloudflare Pages: Global CDN automatically compresses & caches
- Tailwind CSS: Purges unused styles in production build (16.28 KB CSS)

Current build sizes:

- HTML: 0.46 KB (gzipped)
- CSS: 16.28 KB (gzipped)
- JavaScript: 426.82 KB (gzipped)
- Service Worker: 0.89 KB (gzipped)

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vite.dev
- **Tailwind Docs**: https://tailwindcss.com
- **Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **This Project README**: See README.md

---

## 🎯 Post-Launch Improvements (v2)

- [ ] Real-time updates (Supabase Realtime)
- [ ] Heatmap visualization (Leaflet + clustering)
- [ ] Duplicate detection (spatial proximity)
- [ ] Crew assignment system
- [ ] SMS notifications (Twilio integration)
- [ ] Multi-language support
- [ ] CSV export for LGU reports
- [ ] Analytics dashboard
- [ ] Integration with GIS systems

---

**Ready to deploy? Start with Step 1: Local Testing** ✅

Questions? Check the documentation files or review inline code comments.

Good luck! 🚀
