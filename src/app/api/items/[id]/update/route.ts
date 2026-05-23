import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { token, title, url, description, category, image_url } = body;

    // Validate request inputs
    if (!token) {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 401 });
    }
    if (!title || !url || !description || !category || !image_url) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
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

    // Update item and invalidate the token (one-time use)
    if (isPlaceholder || isBypass) {
      const { updateMockItemDetails, updateMockItemToken } = await import('@/lib/mockDb');
      await updateMockItemDetails(id, title, url, description, category, image_url);
      await updateMockItemToken(id, null, null); // clear token
    } else {
      const { error: dbError } = await supabaseAdmin
        .from('items')
        .update({
          title,
          url,
          description,
          category,
          image_url,
          edit_token: null, // clear token
          edit_token_expires_at: null // clear token expiry
        })
        .eq('id', id);

      if (dbError) {
        console.error('Database update failed:', dbError);
        return NextResponse.json({ error: 'Failed to update listing in database.' }, { status: 500 });
      }
    }

    // Instantly revalidate the homepage and the detail page
    revalidatePath('/');
    revalidatePath(`/items/${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update item details exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
