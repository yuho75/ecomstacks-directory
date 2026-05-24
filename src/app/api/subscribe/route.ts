import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    // 1. Save to Supabase (Local/Production Database)
    let dbResult = null;
    if (isPlaceholder) {
      console.log('Mock Newsletter Subscribe:', email);
    } else {
      const { data, error } = await supabaseAdmin
        .from('subscribers')
        .insert([{ email }])
        .select()
        .single();

      if (error) {
        // 23505 is PostgreSQL unique constraint violation
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Already subscribed.' }, { status: 409 });
        }
        throw error;
      }
      dbResult = data;
    }

    // 2. Add to MailerLite Active Subscribers List
    const mailerliteApiKey = process.env.MAILERLITE_API_KEY;
    
    if (mailerliteApiKey) {
      try {
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${mailerliteApiKey}`,
          },
          body: JSON.stringify({
            email: email,
            status: 'active',
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.error('MailerLite subscription error:', errData);
        } else {
          console.log(`Successfully added ${email} to MailerLite`);
        }
      } catch (err) {
        console.error('Failed to call MailerLite API:', err);
      }
    } else {
      console.log('MailerLite integration skipped (API key missing)');
    }

    // 3. Send Welcome Email via Resend
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'; // Fallback to sandbox if not set
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: resendFromEmail,
          to: email,
          subject: '🚀 Welcome to EcomStacks - E-commerce Development Growth Toolkit!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
              <h1 style="color: #09090b; border-bottom: 2px solid #e4e4e7; padding-bottom: 10px;">Welcome to EcomStacks! ✨</h1>
              <p>Thank you for subscribing to EcomStacks! We are thrilled to have you join our community.</p>
              <p>Every month, we curate and share <strong>supercharged growth tools, stacks, and strategies</strong> that will help double your e-commerce revenue and speed up development.</p>
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #e4e4e7;">
                <h3 style="margin-top: 0; color: #09090b;">What to expect:</h3>
                <ul style="padding-left: 20px; margin-bottom: 0;">
                  <li>🔥 Hand-picked full-stack templates</li>
                  <li>⚡ Best practices for scaling Next.js stores</li>
                  <li>📈 High-converting checkouts and payment stack optimizations</li>
                </ul>
              </div>
              <p>If you have any questions or just want to say hi, feel free to reply directly to this email!</p>
              <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
              <p style="font-size: 12px; color: #71717a;">
                &copy; 2026 EcomStacks. All rights reserved.<br/>
                You received this email because you subscribed to our newsletter at ecomstacks.com.
              </p>
            </div>
          `,
        });

        if (error) {
          console.error('Resend email error:', error);
        } else {
          console.log(`Successfully sent welcome email to ${email} via Resend`, data);
        }
      } catch (err) {
        console.error('Failed to call Resend API:', err);
      }
    } else {
      console.log('Resend welcome email skipped (API key missing)');
    }

    return NextResponse.json({ success: true, subscriber: dbResult });
  } catch (err: any) {
    console.error('Subscribe API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
