const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = '';
let supabaseServiceKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith('#')) continue;
    const parts = cleanLine.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceKey = val;
    }
  }
} catch (e) {
  console.error('Failed to read .env.local file:', e);
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabaseAdmin.from('items').select('*').limit(1);
  if (error) {
    console.error('Error fetching columns:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in items table:', Object.keys(data[0]));
    console.log('Sample item values:', data[0]);
  } else {
    console.log('No items found to inspect.');
  }
}

run();
