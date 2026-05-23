const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = '';
let supabaseServiceKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.replace('NEXT_PUBLIC_SUPABASE_URL=', '').replace(/['"]/g, '');
    } else if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = trimmed.replace('SUPABASE_SERVICE_ROLE_KEY=', '').replace(/['"]/g, '');
    }
  });
} catch (err) {
  console.error('Error reading .env.local:', err.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const seedsPath = 'src/lib/seeds.ts';
  const content = fs.readFileSync(seedsPath, 'utf8');
  
  // Extract all urls and image_urls
  const matches = [...content.matchAll(/url:\s*"([^"]+)",\s*image_url:\s*"([^"]+)"/g)];
  console.log(`Found ${matches.length} items to update in DB.`);

  for (const match of matches) {
    const url = match[1];
    const newImageUrl = match[2];
    
    // update in supabase
    const { data, error } = await supabaseAdmin
      .from('items')
      .update({ image_url: newImageUrl })
      .eq('url', url);

    if (error) {
      console.error(`Error updating ${url}:`, error.message);
    } else {
      console.log(`Updated ${url}`);
    }
  }
  console.log('Finished updating Supabase.');
}

run();
