import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const eventType = payload.event_type;
    const resource = payload.resource;

    if (!eventType || !resource) {
      return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
    }

    const subscriptionId = resource.id;

    if (!subscriptionId) {
      console.warn('⚠️ Webhook received without subscription ID. Skipping.');
      return NextResponse.json({ success: true, message: 'No subscription ID found.' });
    }

    console.log(`🔔 Received PayPal Webhook event: ${eventType} for Subscription ID: ${subscriptionId}`);

    // Fetch the item related to this subscription
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('paypal_subscription_id', subscriptionId)
      .single();

    if (fetchError || !item) {
      console.warn(`⚠️ No item found in Supabase matching PayPal Subscription ID: ${subscriptionId}`);
      return NextResponse.json({ success: true, message: 'Subscription ID not mapped in DB.' });
    }

    // Process webhook events
    let updateFields: any = {};

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        updateFields = {
          subscription_status: 'active',
          tier: 'featured'
        };
        console.log(`✅ Subscription ${subscriptionId} is ACTIVATED. Upgraded ${item.title} to Featured.`);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        // When cancelled, we mark subscription_status as cancelled and demote the tool tier back to standard
        updateFields = {
          subscription_status: 'cancelled',
          tier: 'standard'
        };
        console.log(`🛑 Subscription ${subscriptionId} is CANCELLED. Demoted ${item.title} back to Standard.`);
        break;

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        updateFields = {
          subscription_status: 'expired',
          tier: 'standard'
        };
        console.log(`⌛ Subscription ${subscriptionId} is EXPIRED. Demoted ${item.title} back to Standard.`);
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        updateFields = {
          subscription_status: 'suspended',
          tier: 'standard'
        };
        console.log(`⚠️ Subscription ${subscriptionId} is SUSPENDED. Demoted ${item.title} back to Standard.`);
        break;

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        // Payment failed - we can log it, keep active for grace period, or demote.
        // For EcomStacks, we immediately demote to keep it robust and prevent unpaid listings.
        updateFields = {
          subscription_status: 'suspended',
          tier: 'standard'
        };
        console.warn(`💸 Payment FAILED for subscription ${subscriptionId}. Demoted ${item.title} to Standard.`);
        break;

      default:
        console.log(`ℹ️ Unhandled PayPal webhook event type: ${eventType}`);
        return NextResponse.json({ success: true, message: `Event type ${eventType} ignored.` });
    }

    // Update database row
    const { error: updateError } = await supabaseAdmin
      .from('items')
      .update(updateFields)
      .eq('id', item.id);

    if (updateError) {
      console.error(`❌ Webhook handler failed to update database for item ${item.id}:`, updateError);
      return NextResponse.json({ error: 'Failed to update item state in database.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Webhook ${eventType} processed successfully.`
    });

  } catch (err: any) {
    console.error('❌ PayPal Webhook handler exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
