import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ydvsofqzhokfamjtifkf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdnNvZnF6aG9rZmFtanRpZmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMwNDMwNzQsImV4cCI6MjAxODYxOTA3NH0.Y6u-OX6tDmM8x0z-M-qLTVz9Ak8F0q0EqCL3sKrJ1Eo'
);

const { data, error } = await supabase
  .from('barangays')
  .select('id, name, municipality')
  .order('municipality')
  .order('name');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

const grouped = {};
data.forEach(b => {
  if (!grouped[b.municipality]) grouped[b.municipality] = [];
  grouped[b.municipality].push(b);
});

console.log('INSERT INTO public.barangay_household_updates (municipality, barangay_id, barangay_name, total_households, restored_households, as_of_time) VALUES');

const values = [];
Object.keys(grouped).sort().forEach(municipality => {
  grouped[municipality].forEach((b, idx) => {
    values.push(`('${municipality}', '${b.id}', '${b.name.replace(/'/g, "''")}', 0, 0, now())`);
  });
});

console.log(values.join(',\n') + ';');
console.log('\n-- Summary:');
console.log(`-- Total barangays: ${data.length}`);
Object.keys(grouped).sort().forEach(m => {
  console.log(`-- ${m}: ${grouped[m].length}`);
});
