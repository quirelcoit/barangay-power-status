# Feature: Support for Missing Barangays/Sitios

## What's New

Your app now has **two-way flexibility** for barangay selection:

### ✅ Option 1: Select from Predefined List

- Users can select from **all 132 Quirino barangays**
- Fast and easy
- Data is consistent and organized

### ✅ Option 2: Enter Custom Location (NEW!)

- If a barangay/sitio is NOT in the list, users can select **"➕ Other (Not in List)"**
- They type in the exact location name
- Report is submitted with custom location
- Admin can review and add to database later

---

## How It Works - User Perspective

### Scenario 1: Reporting from a Known Barangay

1. User opens Report Hazard form
2. Clicks barangay dropdown
3. Sees all 132 Quirino barangays grouped by municipality
4. Selects "San Francisco, Aglipay"
5. Fills rest of form and submits
   ✅ Report recorded with barangay ID for consistency

### Scenario 2: Reporting from an Unknown Sitio

1. User opens Report Hazard form
2. Clicks barangay dropdown
3. Doesn't see their location in the list
4. Scrolls down and selects **"➕ Other (Not in List)"**
5. Text input appears: "Enter barangay or sitio name..."
6. Types: "Sitio Bagong Pag-asa"
7. Fills rest of form and submits
   ✅ Report recorded with custom location text

---

## How It Works - Admin Perspective

### Monitoring Custom Reports

1. Go to Admin Dashboard
2. Filter reports by custom locations
3. Look for patterns (e.g., "Sitio Bagong Pag-asa" appears 5 times)
4. When ready, add to official list using SQL

### Adding to Database

```sql
-- When you see multiple reports from "Sitio Bagong Pag-asa"
INSERT INTO public.barangays (name, municipality, island_group, is_active)
VALUES ('Sitio Bagong Pag-asa', 'Aglipay', 'Luzon', true);
```

5. **Refresh app** - next user sees it in dropdown automatically

---

## Data Storage

### Reports Table - Updated

The `reports` table now has flexibility:

```sql
-- If user selected from predefined list:
{
  barangay_id: "uuid-123",      -- Links to official barangay
  custom_location: NULL
}

-- If user entered custom location:
{
  barangay_id: NULL,
  custom_location: "Sitio Bagong Pag-asa"
}
```

### Admin Query to See Custom Locations

```sql
-- Find all custom location reports
SELECT custom_location, COUNT(*) as count
FROM public.reports
WHERE custom_location IS NOT NULL
GROUP BY custom_location
ORDER BY count DESC;
```

This shows which locations appear most frequently and are candidates for adding to the official list.

---

## Building Your Complete List Over Time

### Month 1 (Initial)

- 132 official Quirino barangays loaded
- Users submit reports from "Other" → 47 different custom locations recorded

### Analysis

Admin runs query above:

```
Sitio Bagong Pag-asa    | 8 reports
Sitio Nueva Era         | 6 reports
Purok San Jose          | 5 reports
Sitio Pag-asa Norte     | 4 reports
...
```

### Month 2 (Update)

Admin adds the top 10 custom locations:

```sql
INSERT INTO public.barangays (name, municipality, island_group, is_active) VALUES
('Sitio Bagong Pag-asa', 'Aglipay', 'Luzon', true),
('Sitio Nueva Era', 'Aglipay', 'Luzon', true),
('Purok San Jose', 'Cabarroguis', 'Luzon', true),
... (7 more)
```

### Month 3

- List now has 142 barangays
- "Other" still available for truly new locations
- Users from top locations now see them in predefined list
- Data becomes more structured and useful

---

## Implementation Details

### Code Changes Made

#### 1. **BarangayPicker Component**

- Added "Other" option with ID: `__CUSTOM__`
- When selected, shows text input for custom location
- Auto-focus on input for better UX

#### 2. **ReportNew Page**

- Updated to handle both regular and custom barangays
- Passes custom location to backend
- Works for both online and offline modes

#### 3. **ReportQueue Store**

- `barangayId` is now optional (for custom reports)
- Added `customLocation` field (optional)
- Supports offline queueing with custom locations

---

## Testing the Feature

### Test 1: Regular Barangay Selection

1. Go to http://localhost:5173/report
2. Click barangay dropdown
3. Select "San Francisco, Aglipay"
4. Submit report ✅

### Test 2: Custom Location

1. Go to http://localhost:5173/report
2. Click barangay dropdown
3. Scroll to bottom → select "➕ Other (Not in List)"
4. Text input appears
5. Type: "Sitio Test Location"
6. Submit report ✅
7. Check database: `SELECT * FROM reports WHERE custom_location = 'Sitio Test Location';` ✅

### Test 3: Offline with Custom Location

1. Open DevTools → Network → set to Offline
2. Go to http://localhost:5173/report
3. Select "➕ Other (Not in List)"
4. Type custom location
5. Submit → should queue
6. Check localStorage: `localStorage.getItem('brgy-report-queue')`
7. Turn online → should sync ✅

---

## Admin Commands

### See All Custom Locations

```sql
SELECT DISTINCT custom_location
FROM public.reports
WHERE custom_location IS NOT NULL
ORDER BY custom_location;
```

### Find Most Reported Custom Locations

```sql
SELECT custom_location, COUNT(*) as count,
       MAX(created_at) as last_report
FROM public.reports
WHERE custom_location IS NOT NULL
GROUP BY custom_location
ORDER BY count DESC
LIMIT 20;
```

### Delete Duplicate Entries (if barangay was added later)

```sql
-- If "Sitio Bagong Pag-asa" was added to barangays table but old reports still have custom_location
UPDATE public.reports
SET custom_location = NULL,
    barangay_id = (SELECT id FROM barangays WHERE name = 'Sitio Bagong Pag-asa' LIMIT 1)
WHERE custom_location = 'Sitio Bagong Pag-asa';
```

---

## Workflow Summary

**Phase 1: Launching with 132 Barangays**

- Users report from known locations → predefined dropdown
- Users report from unknown locations → "Other" + type custom name
- Reports captured with either `barangay_id` or `custom_location`

**Phase 2: Growing the List**

- Admin monitors dashboard
- Identifies patterns in custom locations
- Adds top locations to database
- Gradually build complete list

**Phase 3: Data Consistency**

- More reports use predefined list
- Fewer "Other" submissions as list grows
- Better data organization and analysis
- Admin can track power outages by barangay precisely

---

## Benefits

✅ **User-Friendly**: Never blocks users because location isn't listed  
✅ **Data-Driven**: Build your list based on actual usage patterns  
✅ **Flexible**: Add new locations instantly via SQL  
✅ **Offline Support**: Custom locations work in offline mode too  
✅ **Scalable**: Start with 132, grow to 200+ barangays organically  
✅ **Admin Control**: Easy to monitor and manage locations

---

## Next Steps

1. ✅ Feature implemented and tested
2. Deploy to production
3. Monitor incoming reports
4. Add custom locations monthly as patterns emerge
5. Grow your list to 100% coverage of Quirino Province

**You're all set!** The app now supports both predefined and custom barangays. 🎉
