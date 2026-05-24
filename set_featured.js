const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl = '';
let supabaseServiceKey = '';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseServiceKey = line.split('=')[1].trim();
  });
} catch (e) {
  console.error('Failed to read .env.local');
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials not found.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setFeatured() {
  // Get one item
  const { data, error } = await supabase.from('items').select('id, title').limit(1);
  if (error || !data || data.length === 0) {
    console.error('No items found or error:', error);
    return;
  }
  
  const targetId = data[0].id;
  const targetTitle = data[0].title;
  
  // Update to featured
  const { error: updateError } = await supabase
    .from('items')
    .update({ tier: 'featured' })
    .eq('id', targetId);
    
  if (updateError) {
    console.error('Update failed:', updateError);
  } else {
    console.log(`Successfully set "${targetTitle}" to featured!`);
  }
}

setFeatured();
