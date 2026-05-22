import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * API Endpoint: GET /api/items
 * Fetches all approved items in the system. Used by the client for hot refreshes.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Failed to retrieve items via JSON API:', err);
    return NextResponse.json({ error: err.message || 'Internal Database Error' }, { status: 500 });
  }
}
