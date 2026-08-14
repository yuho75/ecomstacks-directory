import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, url, description, category, email, image_url, tier = 'standard' } = body;

    // Validate inputs
    if (!title || !url || !description || !category || !email || !image_url) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const isPaypalEnabled = process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true';
    const isBypass = !isPaypalEnabled;
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    // Free phase: insert directly as 'pending' for review. Paid phase: insert as 'pending_payment'.
    const initialStatus = isPaypalEnabled ? 'pending_payment' : 'pending';

    let item: any;

    if (isPlaceholder) {
      const { insertMockItem } = await import('@/lib/mockDb');
      item = await insertMockItem({
        title,
        url,
        description,
        category,
        email,
        image_url,
        status: initialStatus,
        tier
      });
    } else {
      // 1. Insert item into Supabase
      const { data, error: dbError } = await supabaseAdmin
        .from('items')
        .insert({
          title,
          url,
          description,
          category,
          email,
          image_url,
          status: initialStatus,
          paypal_order_id: isPaypalEnabled ? null : `free_submission_${Date.now()}`,
          tier
        })
        .select()
        .single();

      if (dbError || !data) {
        console.error('Supabase item insertion error:', dbError);
        return NextResponse.json({ error: 'Failed to initialize database entry.' }, { status: 500 });
      }
      item = data;
    }

    // FREE MODE: Send submission email & admin alert immediately upon registration.
    // PAID MODE: Email is deferred until PayPal payment capture succeeds in /api/paypal/capture-success.
    if (!isPaypalEnabled) {
      try {
        const { sendSubmissionEmail } = await import('@/lib/emails');
        await sendSubmissionEmail(email, title, tier);
      } catch (emailErr) {
        console.error('Failed to send submission email:', emailErr);
      }
    }

    // 2. Fetch PayPal Access Token if PayPal is active
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    if (!clientId || !clientSecret || isBypass || isPlaceholder) {
      return NextResponse.json({
        id: `submission_order_${Date.now()}`,
        supabaseItemId: item.id,
        isMock: true
      });
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
      // Return success with item ID even if PayPal auth fails during free phase
      return NextResponse.json({
        id: `submission_order_${Date.now()}`,
        supabaseItemId: item.id
      });
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // 3. Create PayPal checkout order with custom_id linked to the Supabase item id
    let price = '9.99';
    let tierDescription = `EcomStacks Platform Standard lifetime listing: ${title}`;

    if (tier === 'featured') {
      price = '49.00';
      tierDescription = `EcomStacks Platform Featured listing (30 days): ${title}`;
    } else if (tier === 'premium' || tier === 'premium_launch') {
      price = '199.00';
      tierDescription = `EcomStacks Platform Premium Launch package: ${title}`;
    }

    const orderRes = await fetch(`${apiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: price
            },
            custom_id: item.id,
            description: tierDescription
          }
        ]
      })
    });

    if (!orderRes.ok) {
      return NextResponse.json({
        id: `submission_order_${Date.now()}`,
        supabaseItemId: item.id
      });
    }

    const order = await orderRes.json();

    // Update Supabase item with PayPal order ID
    await supabaseAdmin
      .from('items')
      .update({ paypal_order_id: order.id })
      .eq('id', item.id);

    return NextResponse.json({
      id: order.id,
      supabaseItemId: item.id
    });

  } catch (err: any) {
    console.error('Create order handler exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
