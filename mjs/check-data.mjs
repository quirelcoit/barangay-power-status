import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ydvsofqzhokfamjtifkf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdnNvZnF6aG9rZmFtanRpZmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMwNDMwNzQsImV4cCI6MjAxODYxOTA3NH0.Y6u-OX6tDmM8x0z-M-qLTVz9Ak8F0q0EqCL3sKrJ1Eo'
);

console.log('=== CHECKING DATABASE ===\n');

// Check barangays table
const { data: barangays, error: err1 } = await supabase
  .from('barangays')
  .select('count', { count: 'exact' });
console.log('barangays count:', barangays?.[0]?.count || 0);

// Check barangay_households
const { data: households, error: err2 } = await supabase
  .from('barangay_households')
  .select('count', { count: 'exact' });
console.log('barangay_households count:', households?.[0]?.count || 0);

// Check barangay_household_updates
const { data: updates, error: err3 } = await supabase
  .from('barangay_household_updates')
  .select('count', { count: 'exact' });
console.log('barangay_household_updates count:', updates?.[0]?.count || 0);

// Get sample from households
const { data: hh_sample } = await supabase
  .from('barangay_households')
  .select('*')
  .limit(5);
console.log('\nSample barangay_households:', hh_sample?.length || 0, 'rows');
if (hh_sample?.length) {
  console.log(hh_sample[0]);
}

// Get sample from updates
const { data: up_sample } = await supabase
  .from('barangay_household_updates')
  .select('*')
  .limit(5);
console.log('\nSample barangay_household_updates:', up_sample?.length || 0, 'rows');
if (up_sample?.length) {
  console.log(up_sample[0]);
}

// Check view
const { data: view_data } = await supabase
  .from('barangay_household_status')
  .select('*')
  .eq('municipality', 'SAN AGUSTIN, ISABELA')
  .limit(5);
console.log('\nView data for SAN AGUSTIN, ISABELA:', view_data?.length || 0, 'rows');
if (view_data?.length) {
  console.log(view_data[0]);
}
