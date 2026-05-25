import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(
        `<html>
          <head>
            <title>Invalid Request</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f8f9ff; color: #374151; }
              .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: inline-block; max-width: 400px; }
              h1 { color: #ef4444; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Invalid Unsubscribe Request</h1>
              <p>The unsubscribe link is invalid or expired. Please contact support if you need assistance.</p>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';

    let subscriberEmail = '';

    if (!isPlaceholder && !isBypass) {
      // 1. Fetch subscriber's email before updating
      const { data: subscriber, error: fetchErr } = await supabaseAdmin
        .from('subscribers')
        .select('email')
        .eq('id', id)
        .single();

      if (fetchErr || !subscriber) {
        console.error('Subscriber not found for unsubscribe ID:', id);
        return new NextResponse(
          `<html>
            <head>
              <title>Unsubscribe Error</title>
              <style>
                body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f8f9ff; color: #374151; }
                .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: inline-block; max-width: 400px; }
                h1 { color: #ef4444; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Unsubscribe Error</h1>
                <p>Could not find a subscriber associated with this link. You may already be unsubscribed.</p>
              </div>
            </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      subscriberEmail = subscriber.email;

      // 2. Mark as 'unsubscribed' in Supabase to permanently prevent cron sends
      const { error: updateErr } = await supabaseAdmin
        .from('subscribers')
        .update({ last_newsletter_month: 'unsubscribed' })
        .eq('id', id);

      if (updateErr) throw updateErr;

      // 3. Sync unsubscription to MailerLite if key exists
      const mailerliteApiKey = process.env.MAILERLITE_API_KEY;
      if (mailerliteApiKey && subscriberEmail) {
        try {
          const response = await fetch(`https://connect.mailerlite.com/api/subscribers/${subscriberEmail}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${mailerliteApiKey}`,
            },
            body: JSON.stringify({
              status: 'unsubscribed',
            }),
          });

          if (!response.ok) {
            console.error('Failed to sync unsubscribe to MailerLite:', await response.text());
          } else {
            console.log(`Successfully unsubscribed ${subscriberEmail} from MailerLite.`);
          }
        } catch (err) {
          console.error('MailerLite unsubscribe call error:', err);
        }
      }
    } else {
      subscriberEmail = 'sandbox_recipient@example.com';
    }

    // Gorgeous, minimal, professional HTML confirmation page
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed Successfully - EcomStacks</title>
        <style>
          body {
            background-color: #f8f9ff;
            color: #1f2937;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-h: 100vh;
            height: 100vh;
          }
          .container {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 40px 32px;
            text-align: center;
            max-width: 440px;
            width: 90%;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          }
          .icon-box {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: #f3f4f6;
            color: #4b5563;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
          }
          .icon {
            font-size: 28px;
            font-weight: bold;
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            color: #09090b;
            margin: 0 0 12px 0;
            letter-spacing: -0.02em;
          }
          p {
            font-size: 14px;
            color: #4b5563;
            line-height: 1.6;
            margin: 0 0 24px 0;
          }
          .email-tag {
            font-weight: bold;
            color: #09090b;
            background-color: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            display: inline-block;
          }
          .btn {
            display: inline-block;
            background-color: #3525cd;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #271a9e;
          }
          .footer {
            margin-top: 32px;
            font-size: 11px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon-box">
            <span class="icon">✓</span>
          </div>
          <h1>Successfully Unsubscribed</h1>
          <p>
            Your email address <span class="email-tag">${subscriberEmail}</span> has been successfully removed from our monthly newsletter subscription.
          </p>
          <a href="https://ecomstacksdirectory.com" class="btn">Return to EcomStacks</a>
          <div class="footer">
            &copy; 2026 EcomStacks. All rights reserved.
          </div>
        </div>
      </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

  } catch (err: any) {
    console.error('Unsubscribe API error:', err);
    return new NextResponse(
      `<html>
        <head>
          <title>System Error</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f8f9ff; }
            .card { background: white; padding: 40px; border-radius: 12px; display: inline-block; max-width: 400px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 style="color: red;">Unsubscribe Failed</h1>
            <p>An internal server error occurred. Please try again later or contact us directly.</p>
          </div>
        </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
