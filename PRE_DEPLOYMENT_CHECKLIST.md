# Pre-Deployment Verification Checklist

Before deploying to Vercel, verify everything works correctly using this checklist.

## 1. Local Development Server ✓

- [ ] `npm run dev` starts without errors
- [ ] Dev server runs on http://localhost:5173
- [ ] No error messages in terminal

## 2. Build Verification ✓

- [ ] Run `npm run build` successfully
- [ ] Build completes in ~7 seconds
- [ ] Bundle size is reasonable (~444 KB gzipped)
- [ ] No TypeScript errors
- [ ] No build warnings

```bash
npm run build
```

## 3. Home Page (Public)

- [ ] Page loads without blank screen
- [ ] Navbar displays with Power icon and "Report Hazard" button
- [ ] Barangay search input appears
- [ ] Can scroll through barangay list (if data loaded from Supabase)
- [ ] Latest status badges show (if data available)
- [ ] Mobile responsive (test in DevTools)

**Test in browser:**

- Open http://localhost:5173/
- Check DevTools Console for errors
- Try searching for barangays

## 4. Report New Page

- [ ] Navigate to /report (click "Report Hazard" button)
- [ ] Form elements render:
  - [ ] Category dropdown with 6 options (broken_pole, fallen_wire, tree_on_line, transformer_noise, kwh_meter_damage, other)
  - [ ] Barangay picker loads
  - [ ] GPS button shows coordinates (click to test)
  - [ ] Photo capture input appears (mobile camera or file upload)
  - [ ] Description textarea renders
  - [ ] Turnstile CAPTCHA widget appears (if Turnstile key valid)
- [ ] Submit button is clickable
- [ ] Form validation works (try submitting empty form - should show errors)

**Test in browser:**

```
http://localhost:5173/report
```

## 5. GPS Functionality

- [ ] Click "Get GPS Location" button
- [ ] Browser requests location permission
- [ ] Coordinates display in format: "14.5994° N, 120.9842° E"
- [ ] Coordinates update if you click again
- [ ] Works on mobile (test with DevTools mobile emulation)

## 6. Photo Capture

- [ ] Click photo input
- [ ] Can select file from computer
- [ ] On mobile, offers camera capture option
- [ ] Image preview shows after selection
- [ ] Image is compressed (check file size reduced)
- [ ] No EXIF data leaked (check with online EXIF tool)

## 7. Offline Functionality

- [ ] Submit a report while ONLINE
- [ ] Verify report appears in Supabase `reports` table
- [ ] Test offline mode:
  - [ ] Open DevTools → Network tab → Set to "Offline"
  - [ ] Navigate to /report again
  - [ ] Fill out a report
  - [ ] Click Submit
  - [ ] Should see "Offline - Queued" banner
  - [ ] Report stored in localStorage (check DevTools → Application → Local Storage)
- [ ] Go back online (DevTools → Network → No throttling)
- [ ] Report should auto-sync within 5 seconds
- [ ] Check Supabase - report appears with photo

## 8. Admin Login (Optional - requires staff email)

- [ ] Navigate to /admin/login
- [ ] Enter a staff email address
- [ ] Click "Send OTP"
- [ ] Check email for OTP code
- [ ] Enter OTP on page
- [ ] Should redirect to /admin/dashboard
- [ ] See moderation queue with reports

## 9. Supabase Integration

- [ ] Open Supabase dashboard
- [ ] Check `barangays` table has data
- [ ] Check `reports` table received your test submissions
- [ ] Check `report_photos` table has uploaded images
- [ ] Check RLS policies are active (View → Policies)
- [ ] Check Storage bucket "report-photos" exists and is private

## 10. Service Worker & PWA

- [ ] Open DevTools → Application → Service Workers
- [ ] Should show registered service worker with status "activated and running"
- [ ] In Application → Cache Storage, should see cache entries
- [ ] Test offline:
  - [ ] Enable offline mode (DevTools → Network)
  - [ ] Reload page
  - [ ] Page should still display (served from cache)
  - [ ] Navigation should work (Home, Report, etc.)

## 11. TypeScript & Linting

- [ ] Run `npm run build` with no errors
- [ ] No TypeScript compilation errors
- [ ] Check terminal output for warnings

## 12. Environment Variables

- [ ] Check `.env.local` contains:
  - [ ] `VITE_SUPABASE_URL` (not empty)
  - [ ] `VITE_SUPABASE_ANON_KEY` (not empty)
  - [ ] `VITE_TURNSTILE_SITEKEY` (not empty)
- [ ] Verify `.env.local` is NOT committed to git (check `.gitignore`)

## 13. Mobile Testing

- [ ] Use DevTools Device Emulation (iPhone 12, Pixel 5)
- [ ] Test all pages in mobile view
- [ ] Test photo capture (tap on input, camera/gallery appears)
- [ ] Test GPS (should request permission)
- [ ] Test form submission
- [ ] Test navigation (hamburger menu or links)
- [ ] Check no horizontal scrolling

## 14. Performance

- [ ] Open DevTools → Network tab
- [ ] Reload page
- [ ] Check initial load time (should be <3 seconds)
- [ ] Check JavaScript bundle size (<500 KB gzipped is good)
- [ ] Check CSS size (<50 KB is good)
- [ ] No failed requests in Network tab

## 15. Error Handling

- [ ] Try accessing invalid route: http://localhost:5173/invalid
- [ ] Should show graceful 404 or redirect to home
- [ ] Check DevTools Console for JavaScript errors (red messages)
- [ ] Try submitting form with invalid data - should show validation errors

## 16. Security Checks

- [ ] No API keys/secrets visible in browser Console
- [ ] No credentials exposed in Network tab requests
- [ ] CAPTCHA widget loads (prevents automated abuse)
- [ ] GPS only requests with user permission
- [ ] Photo EXIF data is stripped before upload

---

## Quick Test Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Check for build errors
npm run build -- --outDir dist

# Run type check
npm run build  # This includes TypeScript check via "tsc -b"
```

## Sign-off Checklist

- [ ] All 16 sections above verified as working
- [ ] No errors in browser DevTools Console
- [ ] Production build passes: `npm run build`
- [ ] Mobile responsive verified
- [ ] Offline functionality tested
- [ ] Supabase integration confirmed
- [ ] Service Worker active and caching
- [ ] Ready for Vercel deployment

---

## Next Steps After Verification

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Connect GitHub repo to Vercel
   - Set environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_TURNSTILE_SITEKEY)
   - Deploy!

3. **Post-Deployment**
   - Test live site (verify all pages work on production domain)
   - Monitor for errors in Vercel dashboard
   - Share link with community
