# 🧪 Quick Testing Guide

## 🚀 Getting Started

### Start Development Server

```bash
cd c:\Users\kaloy\OneDrive\Desktop\Office\Apps\brgy-power-stat-reporter-v1
npm run dev
```

The app will be available at: `http://localhost:5173`

---

## ✅ Test Case 1: Municipality Expansion

### Scenario: User taps on a municipality to see energized barangays

**Steps:**

1. Open the app home page
2. Navigate to the **Barangay View** tab (if on Household tab)
3. Look for the municipality table with rows like "DIFFUN", "CABARROGUIS", etc.
4. **CLICK** on any municipality row (e.g., "DIFFUN")
5. **EXPECTED**: The row should expand downward

**What You Should See:**

```
DIFFUN (row highlighted)
  ▼ Expands to show:

  ✓ Energized Barangays (9)
  [Grid of barangay names with GREEN background]
  ⚡ Name 1      ⚡ Name 2      ⚡ Name 3
  ⚡ Name 4      ⚡ Name 5      ⚡ Name 6
  ⚡ Name 7      ⚡ Name 8      ⚡ Name 9

  Still Restoring (24)
  [Grid of barangay names with GRAY background]
  Name 10    Name 11    Name 12
  ... and 21 more
```

**Verification Checklist:**

- [ ] Row expands when clicked
- [ ] "Energized Barangays" section shows with correct count
- [ ] All energized barangay names are displayed
- [ ] Names match your database
- [ ] Green background on energized items
- [ ] "Still Restoring" section shows if any barangays not energized
- [ ] Gray background on restoring items
- [ ] Clicking again collapses the section
- [ ] No console errors (Press F12 to check)

**Example Success Output:**

```
✓ Energized Barangays (9):
  ⚡ Abueg
  ⚡ Ambag
  ⚡ Bacug
  ⚡ Bobonan
  ⚡ Cabanauan
  ⚡ Caberizaan
  ⚡ Cabugnayan
  ⚡ Casiguran
  ⚡ Castillo

Still Restoring (24):
  Dabbung
  Diffun Proper
  ... and 22 more
```

---

## ✅ Test Case 2: Loading State

### Scenario: Verify loading indicator appears while data is fetched

**Steps:**

1. Expand a municipality row
2. **IMMEDIATELY** watch for a loading indicator
3. Barangays should appear after ~1 second

**Expected Behavior:**

```
[Click Municipality]
  ↓
"Loading barangays..."
  ↓ (after 1 second)
[Barangays displayed]
```

**Verification Checklist:**

- [ ] "Loading barangays..." message appears briefly
- [ ] Message disappears after data loads
- [ ] Barangays appear in correct order
- [ ] No "Cannot read property" errors

---

## ✅ Test Case 3: Related Barangays Navigation

### Scenario: User views a barangay and sees related barangays

**Steps:**

1. From home page, click on any barangay card
   (E.g., Click on "Diffun" barangay card)
2. Wait for the barangay detail page to load
3. Scroll down below the "Update History" section
4. Look for **"Other Barangays in DIFFUN"** section

**What You Should See:**

```
Other Barangays in DIFFUN
📍 Abueg                    [ENERGIZED]  →
📍 Ambag                    [PARTIAL]    →
📍 Bacug                    [NO POWER]   →
📍 Bobonan                  [ENERGIZED]  →
... and more
```

**Verification Checklist:**

- [ ] "Other Barangays" section appears
- [ ] All barangays from same municipality are listed
- [ ] Each barangay shows its power status badge
- [ ] Barangay names are correct
- [ ] Status colors match (Green/Yellow/Red)
- [ ] No console errors

---

## ✅ Test Case 4: Navigation Between Barangays

### Scenario: User clicks on a related barangay to view its details

**Steps:**

1. You're viewing a barangay detail page
2. Scroll to "Other Barangays" section
3. **CLICK** on another barangay card
4. **EXPECTED**: Should navigate to that barangay's detail page

**Verification Checklist:**

- [ ] Clicking a related barangay navigates to its page
- [ ] New barangay details load correctly
- [ ] "Other Barangays" section updates for new municipality
- [ ] Status badges update correctly
- [ ] No console errors
- [ ] Navigation is smooth (no page flicker)

---

## ✅ Test Case 5: Responsive Design

### Mobile (< 640px):

```
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set to mobile view
4. Verify:
   - [ ] Barangays show in 1 column
   - [ ] Text is readable (not cramped)
   - [ ] Cards are full-width
   - [ ] Buttons are easy to tap
```

### Tablet (640-1024px):

```
1. Set device to tablet size (768px width)
2. Verify:
   - [ ] Barangays show in 2 columns
   - [ ] Spacing is balanced
   - [ ] Text is properly sized
```

### Desktop (> 1024px):

```
1. Set device to desktop size (1280px width)
2. Verify:
   - [ ] Barangays show in 3 columns (PowerProgress)
   - [ ] Barangays show in 2 columns (BarangayView)
   - [ ] Layout is optimal for larger screens
```

---

## ✅ Test Case 6: Edge Cases

### No Data:

```
If a municipality has 0 energized barangays:
✓ Energized Barangays (0)
  No energized barangays yet

Still Restoring (N)
  [List of all barangays]
```

**Verification:**

- [ ] Empty message appears when no energized barangays
- [ ] Still restoring section shows all barangays
- [ ] No layout breaks

### Single Barangay:

```
If municipality has only 1 barangay:
- [ ] Barangay detail shows (when viewing it)
- [ ] "Other Barangays" section should NOT appear
- [ ] No console errors
```

### Many Barangays:

```
If municipality has 30+ barangays:
- [ ] All appear in grid (may be tall)
- [ ] Scrolling works smoothly
- [ ] No performance issues
- [ ] Grid responsive (1-3 columns based on screen)
```

---

## 🐛 Troubleshooting

### Issue: "Loading barangays..." appears forever

**Solution:**

1. Check Supabase connection (should show in Network tab)
2. Verify `barangays` table has data
3. Verify `barangay_updates` table has records
4. Check browser console for error messages (F12)
5. Look for error message like:
   ```
   Failed to load barangay details
   ```

### Issue: Barangay names don't appear

**Solution:**

1. Verify `barangays` table is populated:
   ```sql
   SELECT COUNT(*) FROM barangays WHERE municipality = 'DIFFUN';
   ```
2. Verify barangay names are not NULL
3. Check that `is_active = true`

### Issue: Status badges are wrong

**Solution:**

1. Verify `barangay_updates` table has data:
   ```sql
   SELECT * FROM barangay_updates
   WHERE is_published = true
   ORDER BY created_at DESC LIMIT 10;
   ```
2. Check that `power_status` is one of: 'energized', 'partial', 'no_power'
3. Verify `is_published = true`

### Issue: Related barangays not showing

**Solution:**

1. Verify barangay detail page loads
2. Check that municipality has multiple barangays
3. Verify barangay you're viewing is in the database
4. Check console for errors
5. Try scrolling down (might be below the fold)

---

## 📊 Performance Test

### Measure Load Time:

**Steps:**

1. Open DevTools (F12)
2. Go to Network tab
3. Expand a municipality
4. Check how long the network requests take

**Expected Performance:**

- Network requests: < 1 second
- Rendering: < 500ms
- Total: < 2 seconds

**Check Console for Warnings:**

```bash
# Should have NO errors like:
# ❌ Cannot read property 'map' of undefined
# ❌ Failed to fetch
# ❌ RLS policy violation

# Should have info messages like:
# ℹ "Could not load household status" (this is OK, optional feature)
```

---

## ✅ Final Acceptance Checklist

- [ ] Municipality expansion shows energized barangays
- [ ] Barangay names are correct
- [ ] Loading state appears and disappears
- [ ] Related barangays section appears on detail page
- [ ] Navigation between barangays works
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] No console errors
- [ ] No broken links
- [ ] Build completes without errors
- [ ] Feature matches documentation

---

## 🚀 Ready for Production?

Once all tests pass, the app is ready to:

1. ✅ Deploy to Vercel
2. ✅ Share with stakeholders
3. ✅ Go live

---

## 📝 Log Results

### Test Date: ******\_******

### Tester Name: ******\_******

### Device/Browser: ******\_******

#### Tests Passed: \_\_\_/10

#### Issues Found: ****\_****

#### Notes: ****\_****

---

**Happy Testing! 🎉**

If you encounter any issues, check the browser console (F12) for error messages and refer to the Troubleshooting section above.
