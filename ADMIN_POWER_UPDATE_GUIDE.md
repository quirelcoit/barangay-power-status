# Admin Power Update - Barangay Selection Feature

## How Staff Updates Energized Barangays

### Access the Admin Power Update Page

1. Go to admin panel: `/admin/power-update`
2. Click on "Barangay Update" tab (if on Household tab)
3. Set the "Report As Of Date & Time" - this is when the status was taken

### Select Energized Barangays

**For each municipality:**

1. **Click on the municipality name** to expand it

   - Example: Click on "DIFFUN" row
   - The row expands downward showing all barangays

2. **Wait for barangays to load** (shows "Loading barangays...")

3. **Check the checkboxes** for energized barangays

   - Green checkmark appears when selected
   - Each selection updates the count automatically
   - Shows "Selected: X / Y" at the bottom

4. **The count updates** in real-time
   - "Energized: [number]" updates in the municipality header
   - Percentage bar updates instantly

### Visual Feedback

**Municipality Header Shows:**

- Total barangays in municipality
- Count of energized barangays
- Percentage (color-coded: green=100%, yellow=50-74%, etc.)
- Chevron icon shows if expanded ▼ or collapsed ▶

**Barangay Checklist:**

- Scrollable grid with all barangay names
- Checkboxes for easy selection
- Search would be helpful (can add later)
- "Selected: X / Y" shows count

### Submit the Update

1. **Review the summary** at bottom showing:

   - Total Energized Barangays across all municipalities
   - Progress bar showing overall energization percentage

2. **Click "✅ Submit Barangay Updates"** button

3. **Wait for confirmation**
   - Green success message appears
   - Barangay-level data saved to database
   - Municipality-level aggregate also saved
   - Main dashboard updates automatically

### What Gets Saved

When you submit:

1. **municipality_updates table** - Gets the aggregate count

   ```
   municipality: "DIFFUN"
   total_barangays: 33
   energized_barangays: 9  (from checkbox selections)
   ```

2. **barangay_updates table** - Gets individual status

   ```
   Each selected barangay gets:
   - power_status: "energized"
   - headline: "Power Status Update - [timestamp]"

   Each non-selected barangay gets:
   - power_status: "no_power"
   ```

### Result on Main Dashboard

When users go to home page and expand a municipality:

- ✅ **Energized barangays** show in GREEN section with ⚡ emoji
- ⚠️ **Non-energized barangays** show in GRAY "Still Restoring" section
- **Barangay names** are displayed exactly as selected
- Updates sync automatically - no refresh needed

### Examples

**Example 1: Updating Diffun**

```
1. Click "DIFFUN" municipality
2. Barangays load: Abueg, Ambag, Bacug, ... (33 total)
3. Check: Abueg, Ambag, Bacug, Bobonan, Cabanauan,
          Caberizaan, Cabugnayan, Casiguran, Castillo
4. Shows "Selected: 9 / 33"
5. Municipality header shows "Energized: 9"
6. Click Submit
7. On main dashboard: 9 green barangays, 24 gray barangays in Diffun
```

**Example 2: All energized**

```
1. Click "SAGUDAY"
2. Check ALL 9 barangays
3. Shows "Selected: 9 / 9"
4. Percentage shows 100% (green)
5. Submit
6. Main dashboard shows all 9 in GREEN
```

**Example 3: Partial**

```
1. Click "CABARROGUIS"
2. Check 12 out of 17
3. Shows "Selected: 12 / 17"
4. Percentage shows 70.59% (yellow)
5. Submit
6. Main dashboard: 12 green, 5 gray
```

---

## Benefits of This Approach

✅ **Accurate** - Staff sees actual barangay names, not just numbers
✅ **Transparent** - Clear visual of which barangays are energized vs restoring  
✅ **Efficient** - Quick to check/uncheck vs typing numbers
✅ **Error-proof** - Can't exceed total (can only check what exists)
✅ **Synced** - Data automatically shows on public dashboard
✅ **Trackable** - Individual barangay history in database
✅ **Mobile-friendly** - Responsive checkbox grid

---

## Tips for Staff

1. **Take note of time** - Set "As Of" time accurately
2. **Expand one municipality at a time** - Easier to manage
3. **Double-check selections** - Before clicking submit
4. **Use on desktop** - Easier to scroll and select checkboxes
5. **Refresh page** - If something looks wrong, refresh and try again
