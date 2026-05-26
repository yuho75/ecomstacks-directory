import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Serverless API Route: /api/webhook/paypal
 * Secure listener for PayPal transaction signals.
 * Performs active server-to-server validation against PayPal REST APIs.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    console.log('PayPal Webhook Received Event Type:', payload.event_type);

    const eventType = payload.event_type;
    
    // We listen to PAYMENT.CAPTURE.COMPLETED, which indicates the checkout transaction succeeded.
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const capture = payload.resource;
      const captureId = capture.id;
      const customId = capture.custom_id; // Contains the Supabase item UUID
      const amountValue = capture.amount?.value;

      console.log(`Verifying capture: ${captureId}, amount: ${amountValue}, Supabase ID: ${customId}`);

      // Double-safe fallback: if customId is missing in webhook metadata, we can fetch from order_id reference
      let itemUuid = customId;
      const orderId = capture.supplementary_data?.related_ids?.order_id;

      // 1. Authenticate with PayPal to actively verify the capture
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

      if (clientId && clientSecret) {
        const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const authRes = await fetch(`${apiUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          const accessToken = authData.access_token;

          // Fetch capture details to verify independently
          const verifyRes = await fetch(`${apiUrl}/v2/payments/captures/${captureId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (verifyRes.ok) {
            const verifyData = await verifyRes.ok ? await verifyRes.json() : null;
            if (verifyData) {
              if (verifyData.status !== 'COMPLETED') {
                console.error('PayPal capture is not in COMPLETED status:', verifyData.status);
                return NextResponse.json({ error: 'Capture is not completed.' }, { status: 400 });
              }
              if (parseFloat(verifyData.amount?.value) < 9.99) {
                console.error('Invalid payment amount:', verifyData.amount?.value);
                return NextResponse.json({ error: 'Invalid payment amount.' }, { status: 400 });
              }
              // Update itemUuid if fetched from PayPal API metadata
              if (verifyData.custom_id) {
                itemUuid = verifyData.custom_id;
              }
            }
          } else {
            console.error('Failed to verify capture via PayPal API, falling back to payload values');
          }
        }
      }

      // 2. Identify the target item in our database
      const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

      if (isPlaceholder || isBypass) {
        const { updateMockItemStatus } = await import('@/lib/mockDb');
        const updated = await updateMockItemStatus(itemUuid, 'pending', orderId);
        console.log('Successfully updated Mock DB item state to pending approval:', updated);
        return NextResponse.json({ verified: true, updated: updated ? 1 : 0 });
      }

      let query = supabaseAdmin.from('items').update({ status: 'pending' });

      if (itemUuid) {
        query = query.eq('id', itemUuid);
      } else if (orderId) {
        query = query.eq('paypal_order_id', orderId);
      } else {
        console.error('Could not identify target item UUID from capture payload.');
        return NextResponse.json({ error: 'Missing correlation references.' }, { status: 400 });
      }

      const { data, error: updateError } = await query.select();

      if (updateError) {
        console.error('Database update error on Webhook capture:', updateError);
        return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
      }

      // Send submission email confirmation
      if (data && data.length > 0) {
        try {
          const { sendSubmissionEmail } = await import('@/lib/emails');
          for (const item of data) {
            await sendSubmissionEmail(item.email, item.title, item.tier);
          }
        } catch (emailErr) {
          console.error('Failed to send submission email:', emailErr);
        }
      }

      console.log('Successfully updated Supabase item state to pending approval:', data);
      return NextResponse.json({ verified: true, updated: data?.length || 0 });
    }

    // Acknowledge other event types to PayPal
    return NextResponse.json({ acknowledged: true });
  } catch (err: any) {
    console.error('PayPal Webhook handler Exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
