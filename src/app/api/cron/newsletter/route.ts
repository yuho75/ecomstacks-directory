import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Security Check
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const cronKey = searchParams.get('key');
    const expectedSecret = process.env.CRON_SECRET || 'cron-secret-key-999';

    // Verify key in query string or Vercel authorization bearer token
    const isAuthorized = 
      authHeader === `Bearer ${expectedSecret}` || 
      cronKey === expectedSecret ||
      process.env.NODE_ENV !== 'production';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!resend) {
      return NextResponse.json({ error: 'Resend API key is not configured.' }, { status: 500 });
    }

    const now = new Date();
    // Current year-month label (e.g. "2026-05")
    const currentMonthLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Previous calendar month bounds
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';

    let approvedItems: any[] = [];

    // 2. Fetch approved directory items
    if (isPlaceholder || isBypass) {
      // Mock items for local development testing
      approvedItems = [
        {
          id: 'mock-id-1',
          title: 'Aetheris Talisman',
          url: 'https://example.com/aetheris',
          description: 'A premium full-stack temple checkout designed for optimized ecommerce conversion rates.',
          image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
          category: 'Checkout Templates',
          tier: 'featured',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-id-3',
          title: 'Pebblely AI',
          url: 'https://example.com/pebblely',
          description: 'Create AI product photos that help you sell more. No Photoshop skills required.',
          image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500',
          category: 'Design Tools',
          tier: 'featured',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-id-2',
          title: 'Storefront Booster',
          url: 'https://example.com/booster',
          description: 'Enhance your search optimization index and speed up storefront layout rendering automatically.',
          image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500',
          category: 'SEO Tools',
          tier: 'standard',
          created_at: new Date().toISOString()
        }
      ];
    } else {
      // 1. Always fetch ALL approved FEATURED & PREMIUM sponsors (so they are never excluded by limit)
      const { data: sponsors, error: sponsorsErr } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('status', 'approved')
        .in('tier', ['featured', 'premium'])
        .order('created_at', { ascending: false });

      if (sponsorsErr) throw sponsorsErr;

      // 2. Fetch standard tools from the previous month
      const { data: monthStandardItems, error: standardErr } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('status', 'approved')
        .eq('tier', 'standard')
        .gte('created_at', prevMonthStart.toISOString())
        .lte('created_at', prevMonthEnd.toISOString())
        .order('created_at', { ascending: false });

      let standardItems = monthStandardItems || [];

      // Fallback: If previous month's new additions are too sparse (< 3), fetch latest 6 approved standard tools overall
      if (standardErr || standardItems.length < 3) {
        const { data: latestStandardItems, error: fallbackErr } = await supabaseAdmin
          .from('items')
          .select('*')
          .eq('status', 'approved')
          .eq('tier', 'standard')
          .order('created_at', { ascending: false })
          .limit(6);
          
        if (fallbackErr) throw fallbackErr;
        standardItems = latestStandardItems || [];
      }

      // Merge and ensure absolutely no duplicate items
      const sponsorIds = new Set((sponsors || []).map(s => s.id));
      const uniqueStandardItems = standardItems.filter(item => !sponsorIds.has(item.id));

      approvedItems = [...(sponsors || []), ...uniqueStandardItems];
    }

    if (approvedItems.length === 0) {
      return NextResponse.json({ success: true, message: 'No approved tools available to construct the newsletter.' });
    }

    // Sort items to prioritize Featured & Premium (sponsors) at the absolute top (redundancy check)
    const sortedItems = [...approvedItems].sort((a, b) => {
      const aFeatured = a.tier === 'featured' || a.tier === 'premium';
      const bFeatured = b.tier === 'featured' || b.tier === 'premium';
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // 3. Fetch subscribers who haven't received this month's newsletter yet (Up to 80 daily to respect Resend caps)
    let targets: any[] = [];
    if (isPlaceholder || isBypass) {
      targets = [
        { id: 'mock-sub-1', email: 'test_newsletter_recipient@example.com' }
      ];
    } else {
      const { data: dbSubscribers, error: subsErr } = await supabaseAdmin
        .from('subscribers')
        .select('*')
        .neq('last_newsletter_month', 'unsubscribed')
        .or(`last_newsletter_month.neq.${currentMonthLabel},last_newsletter_month.is.null`)
        .limit(80);

      if (subsErr) {
        // Safe check: If column last_newsletter_month doesn't exist yet, we catch it gracefully
        console.error('Failed to query subscribers with batch condition (last_newsletter_month column may be missing):', subsErr);
        return NextResponse.json({ 
          error: 'Subscribers batch query failed. Please make sure the last_newsletter_month column is added to the database.',
          rawError: subsErr
        }, { status: 500 });
      }
      
      targets = dbSubscribers || [];
    }

    if (targets.length === 0) {
      return NextResponse.json({ success: true, message: 'All active subscribers are already fully updated for this month.' });
    }

    // 4. Generate visual newsletter HTML content
    const buildNewsletterHtml = (tools: any[], origin: string) => {
      let toolsHtml = '';
      
      for (const tool of tools) {
        const isSponsor = tool.tier === 'featured' || tool.tier === 'premium';
        const itemUrl = `https://ecomstacksdirectory.com/items/${tool.id}`;
        
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
                                <td align="center" valign="middle" bgcolor="${isSponsor ? '#3525cd' : '#3525cd'}" style="border-radius: 8px; background-color: #3525cd; padding: 0;">
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
                        If you wish to unsubscribe, you can <a href="${origin}/api/unsubscribe?id=SUBSCRIBER_ID_PLACEHOLDER" target="_blank" style="color: #a1a1aa; text-decoration: underline;">unsubscribe automatically</a> at any time.
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

    const origin = new URL(request.url).origin;
    const newsletterHtml = buildNewsletterHtml(sortedItems, origin);
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'hello@ecomstacksdirectory.com';

    const successes: string[] = [];
    const failures: Array<{ email: string; error: any }> = [];

    // 5. Send Batch Emails and update DB on Success
    for (const target of targets) {
      try {
        if (isPlaceholder || isBypass) {
          console.log(`[Sandbox Mock] Sent newsletter batch to ${target.email}`);
          successes.push(target.email);
        } else {
          // Personalize the unsubscribe link for each target subscriber securely
          const personalizedHtml = newsletterHtml.replace('SUBSCRIBER_ID_PLACEHOLDER', target.id);

          const { error: sendErr } = await resend.emails.send({
            from: resendFromEmail,
            to: target.email,
            subject: `🚀 [EcomStacks] Your Monthly E-commerce Toolkit & Curated Stack is Here!`,
            html: personalizedHtml,
          });

          if (sendErr) {
            failures.push({ email: target.email, error: sendErr });
            console.error(`Resend failed to deliver to ${target.email}:`, sendErr);
          } else {
            successes.push(target.email);
            
            // Incrementally mark subscriber as updated for this month to avoid duplicates
            await supabaseAdmin
              .from('subscribers')
              .update({ last_newsletter_month: currentMonthLabel })
              .eq('id', target.id);
          }
        }
      } catch (loopErr: any) {
        failures.push({ email: target.email, error: loopErr.message || loopErr });
        console.error(`Loop error sending to ${target.email}:`, loopErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Batch send execution completed successfully.`,
      stats: {
        totalTargets: targets.length,
        successfulSends: successes.length,
        failedSends: failures.length
      },
      recipients: successes,
      failures: failures
    });

  } catch (err: any) {
    console.error('API Cron Newsletter error:', err);
    return NextResponse.json({ error: 'Internal server error.', details: err.message }, { status: 500 });
  }
}
