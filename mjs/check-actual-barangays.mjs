import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ydvsofqzhokfamjtifkf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdnNvZnF6aG9rZmFtanRpZmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNDc4MzIsImV4cCI6MjA0NDcyMzgzMn0.v4hS1S2b2jPgWlP0b5KzcIl3nJQbFJu8xKgY8K9J7Gk'
);

async function checkBarangays() {
  const { data, error } = await supabase
    .from('barangays')
    .select('id, name, municipality')
    .order('municipality, name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total barangays in database: ${data.length}\n`);

  const byMuni = {};
  data.forEach(b => {
    if (!byMuni[b.municipality]) byMuni[b.municipality] = [];
    byMuni[b.municipality].push(b.name);
  });

  Object.entries(byMuni).forEach(([muni, names]) => {
    console.log(`\n${muni} (${names.length}):`);
    names.forEach(name => console.log(`  - ${name}`));
  });

  // Generate INSERT statement
  console.log('\n\n-- INSERT STATEMENT FOR ALL ACTUAL BARANGAYS:');
  console.log('INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)');
  console.log('VALUES');
  
  const values = [];
  data.forEach(b => {
    values.push(`  ('${b.municipality}', '${b.id}', '${b.name}', 0)`);
  });
  
  console.log(values.join(',\n'));
  console.log(';');
}

checkBarangays();
