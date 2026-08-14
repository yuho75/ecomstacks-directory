import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
    }

    const isBypass = process.env.NEXT_PUBLIC_PAYPAL_ENABLED !== 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    let dbItem: any = null;

    if (isPlaceholder || isBypass) {
      const { updateMockItemStatus } = await import('@/lib/mockDb');
      dbItem = await updateMockItemStatus(itemId, 'pending', orderId || `mock_order_${Date.now()}`);
    } else {
      const { data, error: dbError } = await supabaseAdmin
        .from('items')
        .update({
          status: 'pending',
          paypal_order_id: orderId || `paid_order_${Date.now()}`
        })
        .eq('id', itemId)
        .select()
        .single();

      if (dbError || !data) {
        console.error('❌ Failed to update item status to pending on capture success:', dbError);
        return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
      }
      dbItem = data;
    }

    // Trigger instant email notification to both Customer and Admin
    if (dbItem) {
      try {
        const { sendSubmissionEmail } = await import('@/lib/emails');
        await sendSubmissionEmail(dbItem.email, dbItem.title, dbItem.tier || 'standard');
      } catch (emailErr) {
        console.error('❌ Failed to send submission/admin notification email:', emailErr);
      }
    }

    return NextResponse.json({ success: true, itemId: dbItem?.id });
  } catch (err: any) {
    console.error('❌ PayPal capture success handler exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
