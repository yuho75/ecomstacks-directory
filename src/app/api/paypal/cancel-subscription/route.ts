import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, token } = body;

    if (!itemId || !token) {
      return NextResponse.json({ error: 'Item ID and authorization token are required.' }, { status: 400 });
    }

    const isBypass = process.env.NEXT_PUBLIC_PAYPAL_ENABLED !== 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    let item: any;

    // 1. Fetch the item and verify the edit token
    if (isPlaceholder) {
      const { getMockItemById } = await import('@/lib/mockDb');
      item = await getMockItemById(itemId);
    } else {
      const { data, error } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();
      
      if (error || !data) {
        return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
      }
      item = data;
    }

    if (!item) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    // Auth check: verify edit_token matches and hasn't expired
    if (item.edit_token !== token) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }

    const expiryTime = new Date(item.edit_token_expires_at).getTime();
    if (Date.now() > expiryTime) {
      return NextResponse.json({ error: 'Unauthorized: Secure link has expired.' }, { status: 401 });
    }

    const subscriptionId = item.paypal_subscription_id;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'No active subscription linked to this item.' }, { status: 400 });
    }

    // 2. Perform cancellation
    if (isBypass || isPlaceholder) {
      console.warn('⚠️ Sandbox/Bypass Mode: Simulating subscription cancellation in DB.');

      if (isPlaceholder) {
        const { updateMockItemSubscriptionStatus } = await import('@/lib/mockDb');
        await updateMockItemSubscriptionStatus(itemId, 'cancelled');
      } else {
        await supabaseAdmin
          .from('items')
          .update({ subscription_status: 'cancelled' })
          .eq('id', itemId);
      }

      return NextResponse.json({ success: true, message: 'Mock subscription cancelled successfully.' });
    }

    // 3. Authenticate with PayPal
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'PayPal API credentials are missing.' }, { status: 500 });
    }

    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const authRes = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!authRes.ok) {
      const authError = await authRes.text();
      console.error('❌ PayPal OAuth failed:', authError);
      return NextResponse.json({ error: 'PayPal OAuth failed.' }, { status: 500 });
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // 4. Send Cancellation request to PayPal
    const cancelRes = await fetch(`${apiUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'Cancelled by user on EcomStacks dashboard.'
      })
    });

    // Note: PayPal cancellation returns HTTP 204 No Content upon success
    if (cancelRes.status !== 204) {
      const cancelError = await cancelRes.text();
      console.error('❌ PayPal subscription cancel request failed:', cancelError);
      return NextResponse.json({ error: 'Failed to request cancellation from PayPal.' }, { status: 500 });
    }

    // 5. Update Database to cancelled (will remain featured until current cycle ends via Webhook)
    const { error: dbError } = await supabaseAdmin
      .from('items')
      .update({ subscription_status: 'cancelled' })
      .eq('id', itemId);

    if (dbError) {
      console.error('❌ Failed to update subscription status in database:', dbError);
      return NextResponse.json({ error: 'Failed to update cancellation state in database.' }, { status: 500 });
    }

    console.log(`✅ Subscription ${subscriptionId} for item ${itemId} has been successfully cancelled.`);

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully cancelled.'
    });

  } catch (err: any) {
    console.error('❌ PayPal subscription cancel handler exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
