import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, type } = body; // type: 'card_view' or 'website_click'

    if (!itemId || !type) {
      return NextResponse.json({ error: 'Missing required parameters: itemId, type' }, { status: 400 });
    }

    if (!['card_view', 'website_click'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "card_view" or "website_click"' }, { status: 400 });
    }

    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!isPlaceholder && !isBypass) {
      const { error } = await supabaseAdmin
        .from('item_clicks')
        .insert({
          item_id: itemId,
          type,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log click in Supabase:', error);
        // Don't fail silently but also don't break the user experience
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      console.log(`[Mock Analytics] Click tracked: item=${itemId}, type=${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Click tracking error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
