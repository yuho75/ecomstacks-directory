const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// ANSI Terminal Colors for Premium Styling
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const PURPLE = '\x1b[35m';
const CYAN = '\x1b[36m';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

function printBanner() {
  console.log(`
${CYAN}${BOLD}======================================================================
     _______   ______   ______   .___  ___.     _______.___________.    ___       ______  __  ___      _______
    |   ____| /      | /  __  \\  |   \\/   |    /       |           |   /   \\     /      ||  |/  /     /       |
    |  |__   |  ,----'|  |  |  | |  \\  /  |   |   (----\`---|  |----\`  /  ^  \\   |  ,----'|  '  /     |   (----\`
    |   __|  |  |     |  |  |  | |  |\\/|  |    \\   \\       |  |      /  /_\\  \\  |  |     |    <       \\   \\    
    |  |____ |  \`----.|  \`--'  | |  |  |  |.----)   |      |  |     /  _____  \\ |  \`----.|  .  \\  .----)   |   
    |_______| \\______| \\______/  |__|  |__||_______/       |__|    /__/     \\__\\ \\______||__|\\__\\ |_______/    
                                                                                                               
          --- PRESET AUTOMATION & SCHEMA PROVISIONING ENGINE ---
======================================================================${RESET}
  `);
}

async function main() {
  printBanner();
  console.log(`${YELLOW}Scanning workspace directory for existing databases and API credentials...${RESET}`);

  // Discovered credentials store
  const dbOptions = [];

  // 1. Scan Beyond HRD / AI-Root
  try {
    const aiRootEnvPath = path.join(__dirname, '..', '..', '01_Beyond_HRD', '02_AI-root', '.env.local');
    if (fs.existsSync(aiRootEnvPath)) {
      const content = fs.readFileSync(aiRootEnvPath, 'utf-8');
      const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
      const keyMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
      if (urlMatch && keyMatch) {
        dbOptions.push({
          name: `Beyond-HRD Shared Supabase (AI-Root Workspace)`,
          url: urlMatch[1].trim(),
          serviceKey: keyMatch[1].trim(),
          dbUrl: '' // No direct dbUrl specified in that env, but the API URL is ready
        });
      }
    }
  } catch (e) {
    // Ignore scan failures
  }

  // 2. Scan Talisman Config
  try {
    const talismanEnvPath = path.join(__dirname, '..', '..', '09_Talisman', '.env.local');
    if (fs.existsSync(talismanEnvPath)) {
      const content = fs.readFileSync(talismanEnvPath, 'utf-8');
      const dbUrlMatch = content.match(/DATABASE_URL="?([^"\s]+)"?/);
      const cloudNameMatch = content.match(/CLOUDINARY_CLOUD_NAME=(.+)/);
      if (dbUrlMatch) {
        // Extract project ID from database URL if possible
        const hostMatch = dbUrlMatch[1].match(/postgres\.([^:]+)/);
        const projectId = hostMatch ? hostMatch[1] : 'jkvxppjnhhmvovuwrtkb';
        dbOptions.push({
          name: `Aetheris Talisman Supabase (Prisma Connection String)`,
          url: `https://${projectId}.supabase.co`,
          serviceKey: 'placeholder-service-role-key',
          dbUrl: dbUrlMatch[1].trim(),
          cloudinaryName: cloudNameMatch ? cloudNameMatch[1].trim() : ''
        });
      }
    }
  } catch (e) {
    // Ignore scan failures
  }

  // 3. Scan BIB Config
  try {
    const bibEnvPath = path.join(__dirname, '..', '..', '07_BIB', '.env');
    if (fs.existsSync(bibEnvPath)) {
      const content = fs.readFileSync(bibEnvPath, 'utf-8');
      const dbUrlMatch = content.match(/DATABASE_URL="?([^"\s]+)"?/);
      if (dbUrlMatch) {
        const hostMatch = dbUrlMatch[1].match(/postgres\.([^:]+)/);
        const projectId = hostMatch ? hostMatch[1] : 'iolxsyshulzxxeevdkwa';
        dbOptions.push({
          name: `BIB Project Supabase (Cafe24 Server Database)`,
          url: `https://${projectId}.supabase.co`,
          serviceKey: 'placeholder-service-role-key',
          dbUrl: dbUrlMatch[1].trim()
        });
      }
    }
  } catch (e) {
    // Ignore scan failures
  }

  console.log(`${GREEN}✔ Discovery scan completed! Found ${dbOptions.length} existing database configuration(s).${RESET}\n`);

  // Present choices
  console.log(`${BOLD}Please select a Supabase Database to connect & provision:${RESET}`);
  dbOptions.forEach((opt, idx) => {
    console.log(`  [${idx + 1}] ${CYAN}${opt.name}${RESET}`);
    console.log(`      API URL: ${opt.url}`);
    if (opt.dbUrl) {
      console.log(`      PostgreSQL host: ${opt.dbUrl.split('@')[1] || 'Direct Pooler'}`);
    }
  });

  const nextIndex = dbOptions.length + 1;
  const mockIndex = dbOptions.length + 2;

  console.log(`  [${nextIndex}] ${YELLOW}Connect to a New / Custom Supabase Project${RESET}`);
  console.log(`  [${mockIndex}] ${GREEN}${BOLD}Activate Standalone Mock Sandbox Mode (Recommended - No Cloud Credentials Needed!)${RESET}`);

  console.log('');
  const selectionInput = await question(`${BOLD}Enter your choice (1-${mockIndex}): ${RESET}`);
  const choice = parseInt(selectionInput.trim());

  let selectedConfig = {
    supabaseUrl: 'https://placeholder.supabase.co',
    supabaseAnonKey: 'placeholder-anon-key',
    supabaseServiceKey: 'placeholder-service-role-key',
    databaseUrl: '',
    cloudinaryName: 'ditb2aeea',
    cloudinaryPreset: 'ml_default',
    mockBypass: 'true'
  };

  if (choice >= 1 && choice <= dbOptions.length) {
    const selected = dbOptions[choice - 1];
    console.log(`\n${GREEN}→ Selected: ${selected.name}${RESET}`);
    selectedConfig.supabaseUrl = selected.url;
    selectedConfig.supabaseServiceKey = selected.serviceKey;
    selectedConfig.databaseUrl = selected.dbUrl;
    selectedConfig.mockBypass = 'false'; // Connect to database!
    if (selected.cloudinaryName) {
      selectedConfig.cloudinaryName = selected.cloudinaryName;
    }
  } else if (choice === nextIndex) {
    console.log(`\n${BOLD}=== Custom Supabase Credentials ===${RESET}`);
    selectedConfig.supabaseUrl = (await question(`Enter Supabase Project URL: `)).trim();
    selectedConfig.supabaseAnonKey = (await question(`Enter Supabase Anon Key (Public): `)).trim();
    selectedConfig.supabaseServiceKey = (await question(`Enter Supabase service_role Key (Private): `)).trim();
    selectedConfig.databaseUrl = (await question(`Enter PostgreSQL Database Connection URL (for migration): `)).trim();
    selectedConfig.mockBypass = 'false';
  } else {
    console.log(`\n${GREEN}→ Selected: Standalone Mock Sandbox Mode${RESET}`);
    selectedConfig.mockBypass = 'true';
    console.log(`${YELLOW}Local File System Mock DB (mock_db.json) will be used to record listing items and reviews.${RESET}`);
  }

  // Double check connection URL and run migration if selected
  if (selectedConfig.databaseUrl && selectedConfig.mockBypass === 'false') {
    console.log(`\n${YELLOW}Provisioning database tables and policies...${RESET}`);
    
    // Check if pg is installed in node_modules
    let hasPg = false;
    try {
      require.resolve('pg');
      hasPg = true;
    } catch (e) {
      console.log(`${YELLOW}Package 'pg' is required to execute PostgreSQL migrations. Installing dynamically...${RESET}`);
      try {
        execSync('npm install pg', { stdio: 'inherit' });
        hasPg = true;
        console.log(`${GREEN}✔ Package 'pg' successfully installed.${RESET}`);
      } catch (err) {
        console.error(`${RED}❌ Failed to install 'pg' automatically. Please run 'npm install pg' manually.${RESET}`);
      }
    }

    if (hasPg) {
      const { Client } = require('pg');
      const client = new Client({
        connectionString: selectedConfig.databaseUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });

      try {
        await client.connect();
        console.log(`${GREEN}✔ Connected to database successfully!${RESET}`);

        // Read SQL schema file
        const sqlPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

        console.log(`${YELLOW}Executing SQL Schema Migration...${RESET}`);
        await client.query(sqlContent);
        console.log(`${GREEN}✔ Database provisioning completed successfully! Tables, indexes, and RLS policies are applied.${RESET}`);
      } catch (err) {
        console.error(`${RED}❌ Database connection or migration failed:${RESET}`, err.message);
        console.log(`${YELLOW}Bypassing migration execution. You can manually apply supabase/schema.sql inside Supabase SQL editor.${RESET}`);
      } finally {
        await client.end();
      }
    }
  }

  // Populate .env.local file
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = `# EcomStacks Provisioned Environment Variables
# Created dynamically on ${new Date().toISOString()}

# Toggle mock sandbox mode. When true, bypasses Cloudinary API and PayPal live APIs
NEXT_PUBLIC_MOCK_BYPASS=${selectedConfig.mockBypass}

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=${selectedConfig.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${selectedConfig.supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${selectedConfig.supabaseServiceKey}
DATABASE_URL="${selectedConfig.databaseUrl}"

# Cloudinary Settings
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${selectedConfig.cloudinaryName}
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${selectedConfig.cloudinaryPreset}

# PayPal SDK Settings
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

# System Security
ADMIN_SECRET_KEY=secret-key-123
`;

  fs.writeFileSync(envPath, envContent, 'utf-8');
  console.log(`\n${GREEN}✔ Created and configured .env.local file inside 10_Ecomstacks folder.${RESET}`);

  console.log(`
${GREEN}${BOLD}======================================================================
      PROVISIONING COMPLETE! EcomStacks is ready for launch.
======================================================================${RESET}

  ${BOLD}Next steps to run the application:${RESET}
  1. Open terminal inside '${YELLOW}10_Ecomstacks${RESET}' folder.
  2. Start the Next.js development server:
     ${CYAN}npm run dev${RESET}
  3. Open your browser and navigate to:
     ${CYAN}http://localhost:3000${RESET}
  4. Access the secure control room at:
     ${CYAN}http://localhost:3000/admin?key=secret-key-123${RESET}

  ${BOLD}Sandbox Testing Guide (Mock Mode: ${selectedConfig.mockBypass === 'true' ? 'ACTIVE' : 'INACTIVE'}):${RESET}
  - Go to homepage, click 'Submit Your Tool'.
  - Type in details and drag/drop any screenshot image (Cloudinary direct upload is mocked).
  - Click 'Submit & Pay ($9.99 Sandbox Demo)'. It immediately logs draft and bypasses PayPal.
  - The submission is instantly routed to the Admin Pending queue.
  - Go to /admin?key=secret-key-123, click 'Approve'.
  - Reload the homepage: the new item is listed instantly with ISR revalidation!

  Thank you for utilizing the provisioning engine. Pair programming complete!
  `);

  rl.close();
}

main().catch(err => {
  console.error(`${RED}Provisioning engine exception:${RESET}`, err);
  rl.close();
});
