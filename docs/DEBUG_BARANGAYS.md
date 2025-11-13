# Direct Test: Check If Barangays Table Has Data

## Run this in Supabase SQL Editor

Copy and run each query one at a time to debug:

### Query 1: Count total rows

```sql
SELECT COUNT(*) as total_count FROM public.barangays;
```

Expected result: `132`

---

### Query 2: Show first 5 barangays

```sql
SELECT id, name, municipality FROM public.barangays LIMIT 5;
```

Expected: Shows 5 rows with barangay names

---

### Query 3: Count by municipality

```sql
SELECT municipality, COUNT(*) as count
FROM public.barangays
GROUP BY municipality
ORDER BY municipality;
```

Expected: Shows 6 rows (Aglipay, Cabarroguis, Diffun, Maddela, Nagtipunan, Saguday)

---

### Query 4: Check for NULL values

```sql
SELECT COUNT(*) as null_ids FROM public.barangays WHERE id IS NULL;
```

Expected: `0`

---

### Query 5: Check RLS is enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'barangays';
```

Expected: Shows `rowsecurity = true`

---

## If Queries Show 0 Rows

The INSERT didn't work. Try this simpler approach:

### Step A: Delete old data

```sql
DELETE FROM public.barangays WHERE municipality IN ('Aglipay', 'Cabarroguis', 'Diffun', 'Maddela', 'Nagtipunan', 'Saguday');
```

### Step B: Disable RLS

```sql
ALTER TABLE public.barangays DISABLE ROW LEVEL SECURITY;
```

### Step C: Try inserting just one test barangay

```sql
INSERT INTO public.barangays (name, municipality, island_group, is_active)
VALUES ('Test Barangay', 'Test Municipality', 'Luzon', true);
```

### Step D: Check if it worked

```sql
SELECT COUNT(*) FROM public.barangays WHERE municipality = 'Test Municipality';
```

Expected: `1`

---

## If Test Barangay Works But Full Insert Doesn't

The issue is likely:

1. **RLS Policy blocking INSERT** - Need to adjust RLS policy
2. **Foreign key constraint** - Barangays table has references
3. **Column mismatch** - Check exact column names and types

---

## If Nothing Works

Please share:

1. Result of Query 1 (total count)
2. Any error messages from the SQL
3. Whether "Test Barangay" insert succeeded

This will help diagnose the exact issue!
