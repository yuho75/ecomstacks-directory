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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Check .env.local');
  process.exit(1);
}

console.log(`Supabase URL: ${supabaseUrl}`);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    console.log('Querying latest modified items from Supabase...');
    const { data: items, error } = await supabaseAdmin
      .from('items')
      .select('id, title, email, edit_token, edit_token_expires_at, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Supabase query error:', error);
      return;
    }

    console.log('\n--- LATEST ITEMS ---');
    items.forEach(item => {
      console.log(`ID: ${item.id}`);
      console.log(`Title: ${item.title}`);
      console.log(`Email: ${item.email}`);
      console.log(`Token: ${item.edit_token}`);
      console.log(`Expires At: ${item.edit_token_expires_at}`);
      console.log(`Status: ${item.status}`);
      if (item.edit_token_expires_at) {
        const expiresTime = new Date(item.edit_token_expires_at).getTime();
        const nowTime = Date.now();
        console.log(`Expires Time (ms): ${expiresTime}`);
        console.log(`Now Time (ms):     ${nowTime}`);
        console.log(`Difference (mins): ${(expiresTime - nowTime) / (60 * 1000)}`);
        console.log(`Is Token Valid?:   ${nowTime <= expiresTime}`);
      }
      console.log('--------------------');
    });

    console.log(`\nSystem Current Time ISO: ${new Date().toISOString()}`);
    console.log(`System Date.now(): ${Date.now()}`);

  } catch (err) {
    console.error('Exception:', err);
  }
}

run();
