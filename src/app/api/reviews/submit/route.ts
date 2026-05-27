import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, author, rating, content } = body;

    if (!itemId || !author || !rating || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isBypass || isPlaceholder) {
      const { insertMockReview } = await import('@/lib/mockDb');
      await insertMockReview({
        item_id: itemId,
        author,
        rating,
        content,
        status: 'pending'
      });
      return NextResponse.json({ success: true });
    }

    // Insert into live Supabase DB
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert([
        {
          item_id: itemId,
          author: author.trim(),
          rating: Number(rating),
          content: content.trim(),
          status: 'pending'
        }
      ]);

    if (error) {
      console.error('Supabase insert review error:', error);
      return NextResponse.json({ error: 'Database error while submitting review' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API /api/reviews/submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
