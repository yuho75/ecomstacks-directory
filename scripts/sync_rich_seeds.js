const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl = '';
let supabaseServiceKey = '';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
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
  console.error('Failed to locate Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Starting seed rich data synchronization with live Supabase database...\n');

  const seedsPath = path.join(__dirname, '../src/lib/seeds.ts');
  const content = fs.readFileSync(seedsPath, 'utf8');

  // Strip TypeScript annotations from the file content to parse it dynamically in Node.js
  const startIdx = content.indexOf('export const SEED_ITEMS: SeedItem[] = [');
  if (startIdx === -1) {
    console.error('Failed to locate SEED_ITEMS array in seeds.ts');
    process.exit(1);
  }

  // Clean TypeScript syntax to execute array definition safely in standard Node environment
  let cleanCode = content.substring(startIdx)
    .replace('export const SEED_ITEMS: SeedItem[] =', 'const items =')
    .replace(/SeedItem\[\]\s*=/g, '=');

  // Eval the array definition
  let seedItems;
  try {
    const sandbox = {};
    eval(cleanCode + '\nmodule.exports = items;');
    seedItems = module.exports;
  } catch (err) {
    console.error('Failed to parse seeds.ts dynamically:', err.message);
    process.exit(1);
  }

  console.log(`Found ${seedItems.length} seed items to synchronize.\n`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const seedItem of seedItems) {
    try {
      // Find matching item in Supabase by exact URL
      const { data: dbItem, error: fetchErr } = await supabaseAdmin
        .from('items')
        .select('id, title, url')
        .eq('url', seedItem.url)
        .single();

      if (fetchErr || !dbItem) {
        console.warn(`⚠️  Skipped [${seedItem.title}]: URL "${seedItem.url}" not found in database.`);
        skippedCount++;
        continue;
      }

      // Update rich details columns in Supabase
      const { error: updateErr } = await supabaseAdmin
        .from('items')
        .update({
          detailed_overview: seedItem.detailed_overview,
          key_features: seedItem.key_features,
          key_features_descriptions: seedItem.key_features_descriptions,
          rating: seedItem.rating,
          rating_count: seedItem.rating_count,
          customer_review: seedItem.customer_review,
          customer_review_author: seedItem.customer_review_author,
          customer_review_2: seedItem.customer_review_2,
          customer_review_2_author: seedItem.customer_review_2_author,
          integration_guide_1_label: seedItem.integration_guide_1_label,
          integration_guide_1_url: seedItem.integration_guide_1_url,
          integration_guide_2_label: seedItem.integration_guide_2_label,
          integration_guide_2_url: seedItem.integration_guide_2_url
        })
        .eq('id', dbItem.id);

      if (updateErr) {
        console.error(`❌  Failed to update [${seedItem.title}] (ID: ${dbItem.id}):`, updateErr.message);
        errorCount++;
      } else {
        console.log(`✅  Synced [${seedItem.title}] successfully! (ID: ${dbItem.id})`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌  Exception encountered for [${seedItem.title}]:`, err.message || err);
      errorCount++;
    }
  }

  console.log('\n--- SYNCHRONIZATION SUMMARY ---');
  console.log(`Successfully Synced: ${successCount} items`);
  console.log(`Skipped (Not Found): ${skippedCount} items`);
  console.log(`Errors Encountered:  ${errorCount} items`);
  console.log('-------------------------------\n');
}

run();
