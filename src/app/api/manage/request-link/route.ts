import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const inputEmail = email.toLowerCase().trim();
    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    let targetItemId = null;

    if (isPlaceholder || isBypass) {
      // In mock mode, we just pretend we found an item or use a mock item ID
      // To keep it simple, we'll just fake success
      targetItemId = 'mock-id-123';
    } else {
      // Find the most recently created item for this email
      const { data, error } = await supabaseAdmin
        .from('items')
        .select('id')
        .ilike('email', inputEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'No listings found for this email address.' }, { status: 404 });
      }
      targetItemId = data.id;
    }

    // Generate secure one-time token and expiration time (10 minutes)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    if (isPlaceholder || isBypass) {
      console.log(`[Mock] Saving token ${token} for ${inputEmail}`);
    } else {
      const { error: dbError } = await supabaseAdmin
        .from('items')
        .update({
          edit_token: token,
          edit_token_expires_at: expiresAt
        })
        .eq('id', targetItemId);

      if (dbError) {
        console.error('Failed to save manage token to database:', dbError);
        return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
      }
    }

    // Build the Magic Link url
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const editUrl = `${origin}/manage/verify?token=${token}&email=${encodeURIComponent(inputEmail)}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    const isDevMode = isBypass || isPlaceholder || !resendApiKey || resendApiKey.includes('placeholder');

    if (isDevMode) {
      console.log('--- EcomStacks Manage Dashboard Magic Link (Dev/Bypass Mode) ---');
      console.log(`URL: ${editUrl}`);
      console.log('----------------------------------------------------');

      return NextResponse.json({
        success: true,
        isMock: true,
        editUrl: editUrl
      });
    }

    // Instantiate Resend and send the email
    const resend = new Resend(resendApiKey);
    const { error: mailError } = await resend.emails.send({
      from: 'EcomStacks <onboarding@resend.dev>',
      to: inputEmail,
      subject: `[EcomStacks] Secure link to access your dashboard`,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 40px 20px; color: #171717;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.045em; color: #000; text-transform: uppercase;">Ecom<span style="color: #2563eb;">Stacks</span></span>
          </div>
          <h2 style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #111; margin-top: 0; margin-bottom: 12px;">Manage Your Listings</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 24px;">
            You requested a secure link to manage your submitted tools on EcomStacks. Click the button below to access your private dashboard. This link is valid for 10 minutes.
          </p>
          <a href="${editUrl}" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; text-align: center; margin-bottom: 24px;">
            Go to Dashboard
          </a>
          <p style="font-size: 13px; line-height: 1.5; color: #888; margin-top: 0;">
            If you did not request this link, you can safely ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 32px 0;" />
          <p style="font-size: 12px; color: #a3a3a3; text-align: center; margin: 0;">
            &copy; ${new Date().getFullYear()} EcomStacks. High-trust directory for e-commerce.
          </p>
        </div>
      `
    });

    if (mailError) {
      console.error('Resend email delivery failed:', mailError);
      return NextResponse.json({ error: 'Failed to deliver the magic link email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Request manage link exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
