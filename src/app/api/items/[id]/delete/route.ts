import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { token } = body;

    // Validate request inputs
    if (!token) {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 401 });
    }

    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    let item: any = null;

    if (isPlaceholder || isBypass) {
      const { getMockItemById } = await import('@/lib/mockDb');
      item = await getMockItemById(id);
    } else {
      const { data, error } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        item = data;
      }
    }

    if (!item) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (item.status === 'deleted') {
      return NextResponse.json({ error: 'Listing is already deleted.' }, { status: 400 });
    }

    // Verify token matches and has not expired
    const dbToken = item.edit_token;
    const dbExpiresAt = item.edit_token_expires_at;

    if (!dbToken || dbToken !== token) {
      return NextResponse.json({ error: 'Invalid verification token.' }, { status: 401 });
    }

    const expiryTime = new Date(dbExpiresAt).getTime();
    if (Date.now() > expiryTime) {
      return NextResponse.json({ error: 'Verification link has expired. Please request a new link.' }, { status: 401 });
    }

    // Soft delete the item and invalidate the token
    if (isPlaceholder || isBypass) {
      const { updateMockItemStatus, updateMockItemToken } = await import('@/lib/mockDb');
      await updateMockItemStatus(id, 'deleted');
      await updateMockItemToken(id, null, null); // clear token
    } else {
      const { error: dbError } = await supabaseAdmin
        .from('items')
        .update({
          status: 'deleted',
          edit_token: null, // clear token
          edit_token_expires_at: null // clear token expiry
        })
        .eq('id', id);

      if (dbError) {
        console.error('Database soft delete failed:', dbError);
        return NextResponse.json({ error: 'Failed to delete listing in database.' }, { status: 500 });
      }
    }

    // Instantly revalidate the homepage and the detail page to reflect deletion in cache
    revalidatePath('/');
    revalidatePath(`/items/${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Soft delete item exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
