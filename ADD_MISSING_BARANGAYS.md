# How to Add Missing Barangays/Sitios

## For Admins: When You Need to Add New Barangays

If residents report hazards from barangays or sitios NOT in the original 132-barangay list, use this SQL to add them.

### Quick Add (Single Barangay)

Go to **Supabase → SQL Editor → New Query** and run:

```sql
INSERT INTO public.barangays (name, municipality, island_group, is_active)
VALUES ('Your Barangay Name', 'Your Municipality', 'Luzon', true);
```

**Example:**

```sql
-- Add a sitio
INSERT INTO public.barangays (name, municipality, island_group, is_active)
VALUES ('Sitio Mapagkakatalunan', 'Aglipay', 'Luzon', true);
```

### Batch Add (Multiple Barangays)

If you have multiple missing barangays, add them all at once:

```sql
INSERT INTO public.barangays (name, municipality, island_group, is_active)
VALUES
('Sitio Nueva Era', 'Aglipay', 'Luzon', true),
('Sitio Pag-asa', 'Maddela', 'Luzon', true),
('Brgy. Extension North', 'Diffun', 'Luzon', true),
('Sitio Bagong Pamumuhay', 'Nagtipunan', 'Luzon', true),
('Purok San Jose', 'Cabarroguis', 'Luzon', true);
```

### Verify It Was Added

Run this to check if your barangay was added:

```sql
SELECT * FROM public.barangays
WHERE name LIKE '%Mapagkakatalunan%'
OR municipality = 'Aglipay'
ORDER BY name;
```

### Refresh Your App

After adding barangays in Supabase:

1. Hard refresh browser: **Ctrl+F5** (or **Cmd+Shift+R** on Mac)
2. Go to http://localhost:5173/report
3. Open the barangay dropdown - should show your newly added barangay!

---

## How This Works in the App

### Users See Two Options:

**Option 1: Select from Predefined List**

- Dropdown shows all 132 Quirino barangays
- Quick and easy for known locations

**Option 2: Enter Custom Location**

- If barangay/sitio is NOT in the list, users can select "Other"
- They then type in the exact location name
- Report gets submitted with custom location

### Admin Workflow

1. **Monitor incoming reports** in Admin Dashboard
2. **See reports marked as "Other - [Custom Location]"**
3. **Identify patterns** (e.g., "Sitio Mapagkakatalunan" appears frequently)
4. **Add to database** using SQL above
5. **Next time**, that barangay appears in the dropdown for all users

---

## Example: Adding San Fernando (Hypothetical)

Suppose residents from "San Fernando, Maddela" (a sitio not in the original list) start reporting hazards.

### Step 1: Users Report with "Other"

- Select barangay: "Other"
- Type location: "San Fernando, Maddela"
- Submit report

### Step 2: Admin Sees Pattern

- Check Admin Dashboard
- Notice 5 reports with "Other - San Fernando, Maddela"

### Step 3: Admin Adds to Database

```sql
INSERT INTO public.barangays (name, municipality, island_group, is_active)
VALUES ('San Fernando', 'Maddela', 'Luzon', true);
```

### Step 4: Future Reports

- Next user from "San Fernando" sees it in dropdown
- Selects directly instead of using "Other"
- Data becomes consistent and organized

---

## Reference: All Municipalities

When adding barangays, use the correct municipality name:

- **Aglipay**
- **Cabarroguis**
- **Diffun**
- **Maddela**
- **Nagtipunan**
- **Saguday**

---

## Tips

- Always set `is_active = true` so barangay appears in dropdown
- Use consistent spelling (check existing barangays for reference)
- You can update a barangay's name if you made a typo:

  ```sql
  UPDATE public.barangays
  SET name = 'Correct Name'
  WHERE name = 'Wrong Name';
  ```

- To deactivate a barangay (remove from dropdown but keep reports):
  ```sql
  UPDATE public.barangays
  SET is_active = false
  WHERE name = 'Barangay Name';
  ```
