import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pathname, sessionId, userAgent, referer } = body;

    if (!pathname || !sessionId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!isPlaceholder && !isBypass) {
      const { error } = await supabaseAdmin
        .from('page_views')
        .insert({
          session_id: sessionId,
          pathname,
          user_agent: userAgent || null,
          referer: referer || null
        });

      if (error) {
        console.error('Failed to log page view in Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Graceful fallback for local development or mock database mode
      console.log(`[Mock Analytics] Page view logged: session=${sessionId}, path=${pathname}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Analytics tracking error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
