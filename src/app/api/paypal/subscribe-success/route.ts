import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscriptionId, itemId } = body;

    if (!subscriptionId || !itemId) {
      return NextResponse.json({ error: 'Subscription ID and Item ID are required.' }, { status: 400 });
    }

    const isBypass = process.env.NEXT_PUBLIC_PAYPAL_ENABLED !== 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isBypass || isPlaceholder) {
      console.warn('⚠️ Sandbox/Bypass Mode: Simulating subscription success in DB.');
      
      if (isPlaceholder) {
        const { updateMockItemSubscription } = await import('@/lib/mockDb');
        await updateMockItemSubscription(itemId, subscriptionId, 'active');
      } else {
        await supabaseAdmin
          .from('items')
          .update({
            status: 'pending',
            paypal_subscription_id: subscriptionId,
            subscription_status: 'active',
            tier: 'featured'
          })
          .eq('id', itemId);
      }

      return NextResponse.json({ success: true, message: 'Mock subscription success recorded.' });
    }

    // 1. Fetch PayPal Access Token
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    if (!clientId || !clientSecret) {
      console.error('❌ PayPal API credentials are not configured.');
      return NextResponse.json({ error: 'PayPal credentials missing.' }, { status: 500 });
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

    // 2. Fetch Subscription Details from PayPal API
    const subRes = await fetch(`${apiUrl}/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!subRes.ok) {
      const subError = await subRes.text();
      console.error('❌ PayPal Subscription verification failed:', subError);
      return NextResponse.json({ error: 'Failed to verify subscription with PayPal.' }, { status: 500 });
    }

    const subscription = await subRes.json();
    const status = subscription.status; // 'ACTIVE', 'SUSPENDED', 'CANCELLED', etc.

    if (status !== 'ACTIVE' && status !== 'APPROVED') {
      console.error(`❌ Subscription ${subscriptionId} is not active: status is ${status}`);
      return NextResponse.json({ error: `Subscription is not active. Status: ${status}` }, { status: 400 });
    }

    // 3. Update Supabase with verified subscription details
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('items')
      .update({
        paypal_subscription_id: subscriptionId,
        subscription_status: 'active',
        status: 'pending', // Move to admin pending queue for review
        tier: 'featured'   // Upgrade to featured plan
      })
      .eq('id', itemId)
      .select('email, title, tier')
      .single();

    if (dbError || !dbData) {
      console.error('❌ Failed to update database with subscription info:', dbError);
      return NextResponse.json({ error: 'Failed to record subscription status.' }, { status: 500 });
    }

    // Send submission email confirmation
    try {
      const { sendSubmissionEmail } = await import('@/lib/emails');
      await sendSubmissionEmail(dbData.email, dbData.title, dbData.tier);
    } catch (emailErr) {
      console.error('Failed to send submission email:', emailErr);
    }

    console.log(`✅ Subscription ${subscriptionId} successfully mapped to item ${itemId}.`);

    return NextResponse.json({
      success: true,
      subscriptionId,
      status: 'active'
    });

  } catch (err: any) {
    console.error('❌ Create PayPal subscription success handler exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
