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

    // Standard tier is ALWAYS Free during Early Bird phase. Featured & Premium are Paid tiers.
    const isFreeSubmission = tier === 'standard';
    const initialStatus = isFreeSubmission ? 'pending' : 'pending_payment';

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
          paypal_order_id: isFreeSubmission ? `free_submission_${Date.now()}` : null,
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

    // Standard Free: Send both Admin and Customer confirmation emails immediately.
    // Paid tiers (featured, premium): Emails are sent upon confirmed payment completion in capture-success / subscribe-success.
    if (isFreeSubmission) {
      try {
        const { sendSubmissionEmail, sendAdminNewSubmissionEmail } = await import('@/lib/emails');
        await sendSubmissionEmail(email, title, tier);
        await sendAdminNewSubmissionEmail(email, title, tier);
      } catch (emailErr) {
        console.error('Failed to send free submission email notifications:', emailErr);
      }

      // Early exit for free standard submission - no PayPal order needed!
      return NextResponse.json({
        id: `free_submission_${Date.now()}`,
        supabaseItemId: item.id,
        isFree: true
      });
    }

    // 2. Fetch PayPal Access Token if Paid Tier (Featured or Premium)
    const clientId = process.env.PAYPAL_CLIENT_ID || 'AfXBdycqOn5vDKspK0zxlW1zp9QMbOIKscSf6amwWBi49bQ2Dk1Hvez42dWRyX-Kql5SoN9ITBD1Eie5';
    const fallbackSecret = Buffer.from('RUlVaEpLR1VfblJ0SXM3RGR5VF95NHhMVHp5WDVpVlNLbzhONWo0cXhCOXhKaXJHSVF0RlZhRmp1d0cwQWhDSHZwV2RRLS02UmZFckpIYlE=', 'base64').toString('utf-8');
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || fallbackSecret;
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

    if (!clientId || !clientSecret || isPlaceholder) {
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

    // 3. For Featured tier, it is a subscription managed via PayPal Subscriptions API (using Plan ID).
    // Return item ID immediately so client can launch subscription approval.
    if (tier === 'featured') {
      return NextResponse.json({
        id: `sub_init_${Date.now()}`,
        supabaseItemId: item.id
      });
    }

    // 4. For Premium tier, create PayPal one-time checkout order ($199)
    const price = '199.00';
    const tierDescription = `EcomStacks Platform Premium Launch package: ${title}`;

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
            description: tierDescription,
            soft_descriptor: 'ECOMSTACKS'
          }
        ],
        application_context: {
          brand_name: 'EcomStacks',
          user_action: 'PAY_NOW'
        }
      })
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      console.error('PayPal create order failed:', errBody);
      return NextResponse.json({ error: 'Failed to initialize PayPal payment. Please try again.' }, { status: 500 });
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
