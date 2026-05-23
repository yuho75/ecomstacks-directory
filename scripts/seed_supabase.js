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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // We need to read seeds.ts and parse it. Since it's a TS file with export const, 
  // we'll just extract the array using regex or simple evaluation.
  const seedsPath = path.join(__dirname, '../src/lib/seeds.ts');
  const content = fs.readFileSync(seedsPath, 'utf8');
  
  // Extract all the items
  const matches = [...content.matchAll(/{[^}]+id:\s*"seed-[^}]+}/g)];
  console.log(`Found ${matches.length} items to insert.`);

  // Because regex parsing of objects is brittle, let's just use the TS compiler or a simple regex approach 
  // to get title, url, description, image_url, category, email, status
  
  const itemsToInsert = [];
  
  const blockRegex = /{([^}]+)}/g;
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    const block = match[1];
    if (block.includes('id: "seed-')) {
      const getVal = (key) => {
        const m = block.match(new RegExp(`${key}:\\s*"([^"]+)"`));
        return m ? m[1] : null;
      };
      
      const title = getVal('title');
      const url = getVal('url');
      const description = getVal('description');
      const image_url = getVal('image_url');
      const category = getVal('category');
      const email = getVal('email');
      const status = getVal('status');
      const created_at = getVal('created_at');
      
      if (title && url) {
        // check if it already exists
        const { data: existing } = await supabaseAdmin.from('items').select('id').eq('url', url).single();
        if (!existing) {
            itemsToInsert.push({
                title, url, description, image_url, category, email, status, created_at
            });
        } else {
            console.log(`Already exists in DB: ${url}`);
        }
      }
    }
  }

  if (itemsToInsert.length > 0) {
      console.log(`Inserting ${itemsToInsert.length} items...`);
      const { error } = await supabaseAdmin.from('items').insert(itemsToInsert);
      if (error) {
          console.error("Insert error:", error);
      } else {
          console.log("Successfully inserted seed items!");
      }
  } else {
      console.log("No new items to insert.");
  }
}

run();
