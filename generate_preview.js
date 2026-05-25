const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Visual newsletter HTML compiler (Identical to route.ts)
const buildNewsletterHtml = (tools) => {
  let toolsHtml = '';
  
  for (const tool of tools) {
    const isSponsor = tool.tier === 'featured' || tool.tier === 'premium';
    
    // Premium Sponsor Styling vs Clean Standard Styling
    const cardBgColor = isSponsor ? '#faf9ff' : '#ffffff';
    const cardBorder = isSponsor ? '2px solid #6366f1' : '1px solid #e4e4e7';
    const cardShadow = isSponsor 
      ? '0 10px 20px -3px rgba(99, 102, 241, 0.12), 0 4px 6px -2px rgba(99, 102, 241, 0.06)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
    
    toolsHtml += `
      <!-- Tool Card Container Table -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="${isSponsor ? 'sponsor-card-table' : 'card-table'}" style="margin-bottom: 24px; background-color: ${cardBgColor}; border: ${cardBorder}; border-radius: 12px; border-collapse: separate; overflow: hidden; box-shadow: ${cardShadow}; text-align: left;">
        ${isSponsor ? `
          <tr>
            <td style="background-color: #6366f1; color: #ffffff; font-size: 11px; font-weight: bold; padding: 12px 20px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #4f46e5; border-top-left-radius: 10px; border-top-right-radius: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              ⚡ OFFICIAL FEATURED SPONSOR
            </td>
          </tr>
        ` : ''}
        <tr>
          <td style="padding: 20px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td valign="top" style="padding-bottom: 16px;">
                  <img src="${tool.image_url}" alt="${tool.title}" width="540" style="display: block; width: 100%; max-width: 540px; height: auto; max-height: 260px; object-fit: cover; border-radius: 8px; border: 1px solid #f4f4f5;" />
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <h3 class="card-title" style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #09090b; font-size: ${isSponsor ? '20px' : '18px'}; font-weight: bold; line-height: 1.2;">
                    ${tool.title} ${isSponsor ? '🌟' : ''}
                  </h3>
                  <p class="card-category" style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #71717a; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.2;">
                    Category: ${tool.category}
                  </p>
                  <p class="card-description" style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #4b5563; font-size: 13px; line-height: 1.5; font-style: italic;">
                    "${tool.description}"
                  </p>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td valign="middle">
                        <!-- Outlook-compatible Category Badge -->
                        <table border="0" cellspacing="0" cellpadding="0" style="display: inline-block; border-collapse: separate; vertical-align: middle;">
                          <tr>
                            <td bgcolor="${isSponsor ? '#e0e7ff' : '#f3f4f6'}" style="border-radius: 6px; background-color: ${isSponsor ? '#e0e7ff' : '#f3f4f6'}; padding: 4px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: ${isSponsor ? '#4338ca' : '#374151'}; text-align: center; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1;">
                              ${tool.category}
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td align="right" valign="middle">
                        <!-- Outlook-compatible Bulletproof Button -->
                        <table border="0" cellspacing="0" cellpadding="0" align="right" style="border-collapse: separate;">
                          <tr>
                            <td align="center" valign="middle" bgcolor="#3525cd" style="border-radius: 8px; background-color: #3525cd; padding: 0;">
                              <a href="${tool.url}" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 10px 20px; border: 1px solid #3525cd; display: inline-block; text-align: center; white-space: nowrap;">
                                Visit Website &rarr;
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EcomStacks Monthly Newsletter</title>
      <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <style>
        /* Support for Outlook and General Client Layout Fixes */
        body, table, td {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
      </style>
    </head>
    <body class="body-bg" style="background-color: #f8f9ff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <center>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="body-bg" style="background-color: #f8f9ff; padding: 40px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="600" class="content-table" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                
                <!-- Header Accent Bar -->
                <tr>
                  <td align="center" style="background-color: #09090b; padding: 32px 24px; border-bottom: 3px solid #3525cd;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; tracking-[-0.04em];">
                            EcomStacks
                          </h1>
                          <p style="margin: 6px 0 0 0; color: #a1a1aa; font-size: 13px; font-weight: 500; tracking: 0.05em; text-transform: uppercase;">
                            Monthly Development & Growth Curated Stack
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Intro Greetings -->
                <tr>
                  <td style="padding: 32px 32px 16px 32px; text-align: left;">
                    <h2 style="margin: 0 0 12px 0; color: #09090b; font-size: 20px; font-weight: 700;">
                      Your Monthly E-commerce Growth Toolkit is Here! 🚀
                    </h2>
                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                      Hello EcomStacks subscriber! We are excited to bring you the hand-picked, highly-vetted e-commerce templates, tools, and growth solutions from the past month. 
                      Check out the curated stack below, including our featured sponsor tools, to accelerate your development and maximize conversion rates!
                    </p>
                  </td>
                </tr>
                
                <!-- Tools List Section -->
                <tr>
                  <td style="padding: 16px 32px 24px 32px;">
                    ${toolsHtml}
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color: #09090b; padding: 24px; color: #71717a; font-size: 12px; line-height: 1.6; border-top: 1px solid #18181b;">
                    <p style="margin: 0 0 8px 0; color: #a1a1aa; font-weight: 600;">EcomStacks Directory</p>
                    <p style="margin: 0 0 16px 0;">
                      You are receiving this email because you subscribed to the EcomStacks monthly newsletter.
                    </p>
                    <p style="margin: 0;">
                      &copy; 2026 EcomStacks. All rights reserved.<br/>
                      If you wish to unsubscribe, please reply to this email (hello@ecomstacksdirectory.com) or contact us.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
};

async function run() {
  try {
    console.log('Fetching live sponsors and tools from database...');
    
    // 1. Fetch ALL approved Featured & Premium sponsors
    const { data: sponsors, error: sponsorsErr } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('status', 'approved')
      .in('tier', ['featured', 'premium'])
      .order('created_at', { ascending: false });

    if (sponsorsErr) throw sponsorsErr;

    // 2. Fetch latest approved standard tools
    const { data: standardItems, error: standardErr } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('status', 'approved')
      .eq('tier', 'standard')
      .order('created_at', { ascending: false })
      .limit(6);
      
    if (standardErr) throw standardErr;

    // Merge and deduplicate
    const sponsorIds = new Set((sponsors || []).map(s => s.id));
    const uniqueStandardItems = (standardItems || []).filter(item => !sponsorIds.has(item.id));
    const approvedItems = [...(sponsors || []), ...uniqueStandardItems];

    console.log(`Fetched ${sponsors.length} sponsors and ${uniqueStandardItems.length} standard tools.`);

    const html = buildNewsletterHtml(approvedItems);
    const outputPath = path.join(__dirname, 'newsletter_preview.html');
    fs.writeFileSync(outputPath, html, 'utf8');

    console.log(`\n🎉 Success! Preview generated at:`);
    console.log(outputPath);

  } catch (err) {
    console.error('Failed to generate preview:', err);
  }
}

run();
