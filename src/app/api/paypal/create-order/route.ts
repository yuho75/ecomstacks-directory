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

    const isBypass = true; // Force bypass for Phase 1 (Free submissions)
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

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
        status: 'pending_payment',
        tier
      });
    } else {
      // 1. Insert draft item into Supabase with 'pending_payment' status
      const { data, error: dbError } = await supabaseAdmin
        .from('items')
        .insert({
          title,
          url,
          description,
          category,
          email,
          image_url,
          status: 'pending_payment',
          tier
        })
        .select()
        .single();

      if (dbError || !data) {
        console.error('Supabase draft insertion error:', dbError);
        return NextResponse.json({ error: 'Failed to initialize database entry.' }, { status: 500 });
      }
      item = data;
    }

    // 2. Fetch PayPal Access Token
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    if (!clientId || !clientSecret || isBypass || isPlaceholder) {
      console.warn('Bypassing PayPal checkout for early bird free phase.');
      
      // If credentials are missing, we bypass PayPal for easier developer experience
      // and immediately promote to pending status for demo testing
      if (isPlaceholder) {
        const { updateMockItemStatus } = await import('@/lib/mockDb');
        await updateMockItemStatus(item.id, 'pending', `mock_order_${Date.now()}`);
      } else {
        await supabaseAdmin
          .from('items')
          .update({
            status: 'pending',
            paypal_order_id: `mock_order_${Date.now()}`
          })
          .eq('id', item.id);
      }

      return NextResponse.json({
        id: `mock_order_${Date.now()}`,
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
      const authError = await authRes.text();
      console.error('PayPal authentication failed:', authError);
      return NextResponse.json({ error: 'PayPal authentication failed.' }, { status: 500 });
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // 3. Create PayPal checkout order with custom_id linked to the Supabase item id
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
              value: '9.99'
            },
            custom_id: item.id, // Links Supabase row UUID
            description: `EcomStacks Platform lifetime listing: ${title}`
          }
        ]
      })
    });

    if (!orderRes.ok) {
      const orderError = await orderRes.text();
      console.error('PayPal order creation failed:', orderError);
      return NextResponse.json({ error: 'PayPal order creation failed.' }, { status: 500 });
    }

    const order = await orderRes.json();

    // 4. Update Supabase item with the PayPal order ID
    const { error: updateError } = await supabaseAdmin
      .from('items')
      .update({ paypal_order_id: order.id })
      .eq('id', item.id);

    if (updateError) {
      console.error('Failed to link PayPal order to database:', updateError);
    }

    return NextResponse.json({
      id: order.id,
      supabaseItemId: item.id
    });

  } catch (err: any) {
    console.error('Create PayPal order handler exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
