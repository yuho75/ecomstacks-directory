const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = '';
let supabaseServiceKey = '';
let cloudName = 'ditb2aeea';
let uploadPreset = 'ecomstacks_preset';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.replace('NEXT_PUBLIC_SUPABASE_URL=', '').replace(/['"]/g, '');
    } else if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = trimmed.replace('SUPABASE_SERVICE_ROLE_KEY=', '').replace(/['"]/g, '');
    } else if (trimmed.startsWith('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=')) {
      cloudName = trimmed.replace('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=', '').replace(/['"]/g, '');
    } else if (trimmed.startsWith('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=')) {
      uploadPreset = trimmed.replace('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=', '').replace(/['"]/g, '');
    }
  });
} catch (err) {
  console.error('Error reading .env.local:', err.message);
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function uploadToCloudinary(url) {
  const formData = new FormData();
  formData.append('file', url);
  formData.append('upload_preset', uploadPreset);
  
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }
  
  const data = await res.json();
  return data.secure_url;
}

async function run() {
  const seedsPath = 'src/lib/seeds.ts';
  let content = fs.readFileSync(seedsPath, 'utf8');
  
  const matches = [...content.matchAll(/url:\s*"([^"]+)",\s*image_url:\s*"([^"]+)"/g)];
  console.log(`Found ${matches.length} items to update.`);

  for (const match of matches) {
    const url = match[1];
    const thumUrl = match[2];
    
    if (thumUrl.includes('cloudinary.com')) {
      console.log(`Skipping ${url}, already on Cloudinary`);
      continue;
    }
    
    console.log(`Uploading ${url} to Cloudinary...`);
    try {
      const cloudinaryUrl = await uploadToCloudinary(thumUrl);
      
      // Update seeds.ts content in memory
      content = content.replace(`image_url: "${thumUrl}"`, `image_url: "${cloudinaryUrl}"`);
      
      // Update in Supabase
      const { error } = await supabaseAdmin
        .from('items')
        .update({ image_url: cloudinaryUrl })
        .eq('url', url);

      if (error) {
        console.error(`  -> Error updating Supabase for ${url}:`, error.message);
      } else {
        console.log(`  -> Successfully updated DB for ${url}`);
      }
    } catch (err) {
      console.error(`  -> Failed for ${url}: ${err.message}`);
    }
  }
  
  // Write back to seeds.ts
  fs.writeFileSync(seedsPath, content);
  console.log('Finished updating all items.');
}

run();
