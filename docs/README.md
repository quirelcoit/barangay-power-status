# Barangay Power Status Reporter

A minimalist, disaster-ready web app for residents to report hazards (broken poles, fallen wires, trees on lines, buzzing transformers, damaged meters) with photo + GPS, and to check the latest restoration update per barangay.

**Zero-cost deployment** using generous free tiers (Supabase, Cloudflare Pages, Turnstile).

---

## Features

### For Residents
- **Submit hazard reports** with category, photo, GPS location, and optional description
- **Works offline** – reports queue locally and auto-sync when online
- **View barangay status** – last official update, power status, ETA
- **Mobile-first PWA** – installable, fast, works on poor connectivity
- **No account required** – just submit and help

### For Staff (EC/Lineman Teams)
- **Email OTP login** – secure, no passwords
- **Moderation queue** – triage, merge, and resolve reports
- **Post official updates** – headline, details, power status, ETA
- **Export-ready** – structured data for briefings

---

## Quick Start

### 1. Prerequisites
- Node.js 18+, npm/yarn
- Supabase project (free tier)
- Cloudflare Turnstile sitekey (free)

### 2. Setup
```bash
git clone <repo-url>
cd brgy-power-stat-reporter
npm install
```

### 3. Configure Supabase
See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for full schema setup.

### 4. Set Environment Variables
Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TURNSTILE_SITEKEY=your-cloudflare-sitekey
```

### 5. Run
```bash
npm run dev  # Dev server
npm run build  # Production build
```

---

## Key Pages

- `/` – Home & barangay search
- `/report` – Submit hazard report
- `/barangay/:id` – View barangay status & updates
- `/admin/login` – Staff email OTP login
- `/admin/dashboard` – Moderation queue
- `/admin/updates` – Post official update

---

## Tech Stack
- **Frontend**: React 19 + Vite + TypeScript + Tailwind
- **Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Hosting**: Cloudflare Pages
- **PWA**: Service Worker + Background Sync

---

## Deployment

### Cloudflare Pages
1. Push to GitHub
2. Create Cloudflare Pages project, connect repo
3. Build command: `npm run build`, Output: `dist`
4. Set env vars (VITE_* variables)
5. Deploy

### Vercel / Netlify
Same process – connect Git, set env vars, auto-deploy.

---

## Security
- No resident accounts – reports are public & anonymous
- EXIF stripping – client-side photo processing
- Row-Level Security – Supabase RLS enforces permissions
- Turnstile CAPTCHA – spam protection
- Signed URLs – short-lived photo access (5 min expiry)

---

## Support
- See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database setup
- Check inline code comments
- Issues? Open GitHub issue

---

**Designed for disaster resilience. Zero cost. Maximum impact.** ���
