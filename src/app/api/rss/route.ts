import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    let approvedItems: any[] = [];

    if (isPlaceholder || isBypass) {
      // Mock data for sandbox
      approvedItems = [
        {
          id: 'mock-1',
          title: 'Mock E-commerce Optimizer',
          url: 'https://example.com/opt',
          description: 'Supercharge your e-commerce conversions with zero code.',
          image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
          category: 'Analytics',
          tier: 'featured',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-2',
          title: 'Checkout Booster Pro',
          url: 'https://example.com/checkout',
          description: 'A premium Next.js checkout template optimized for conversion rates.',
          image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500',
          category: 'Checkout',
          tier: 'standard',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    } else {
      // Query live approved items from Supabase
      const { data, error } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      approvedItems = data || [];
    }

    // Prioritize Featured/Premium items (sponsors) at the top of the RSS feed
    const sortedItems = [...approvedItems].sort((a, b) => {
      const aFeatured = a.tier === 'featured' || a.tier === 'premium';
      const bFeatured = b.tier === 'featured' || b.tier === 'premium';
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Construct standard RSS XML
    let rssItemsXml = '';
    for (const item of sortedItems) {
      const itemUrl = `https://ecomstacksdirectory.com/items/${item.id}`;
      const pubDate = new Date(item.created_at).toUTCString();
      const sponsorBadge = (item.tier === 'featured' || item.tier === 'premium') ? ' [⭐ SPONSOR]' : '';
      
      rssItemsXml += `
    <item>
      <title><![CDATA[${item.title}${sponsorBadge}]]></title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${item.category}]]></category>
      <description><![CDATA[${item.description}]]></description>
      <content:encoded><![CDATA[
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
          ${(item.tier === 'featured' || item.tier === 'premium') ? `
          <div style="background-color: #eff6ff; color: #1e40af; font-size: 11px; font-weight: bold; padding: 6px 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #dbeafe;">
            ✨ 이달의 추천 공식 스폰서 툴
          </div>
          ` : ''}
          <div style="padding: 20px;">
            <img src="${item.image_url}" alt="${item.title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; border: 1px solid #f4f4f5; margin-bottom: 15px;" />
            <h3 style="margin-top: 0; color: #09090b; font-size: 18px; font-weight: bold; margin-bottom: 10px;">${item.title}</h3>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">${item.description}</p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <span style="background-color: #f3f4f6; color: #374151; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 6px;">
                    ${item.category}
                  </span>
                </td>
                <td align="right">
                  <a href="${item.url}" style="display: inline-block; padding: 8px 16px; background-color: #09090b; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: bold;">
                    웹사이트 방문하기 &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </div>
      ]]></content:encoded>
    </item>`;
    }

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>EcomStacks Directory Feed</title>
    <link>https://ecomstacksdirectory.com</link>
    <description>The ultimate e-commerce development growth directory for founders.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItemsXml}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (err: any) {
    console.error('RSS Feed Generation Error:', err);
    return new Response('<?xml version="1.0" encoding="UTF-8" ?><rss><channel><title>Error</title><description>Failed to generate feed</description></channel></rss>', {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      status: 500
    });
  }
}
