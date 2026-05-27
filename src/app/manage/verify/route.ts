import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/manage?error=MissingParameters', request.url));
    }

    const inputEmail = email.toLowerCase().trim();
    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    let isValid = false;

    if (isPlaceholder || isBypass) {
      // In mock mode, assume valid
      isValid = true;
    } else {
      // Find if there is any item with this edit_token, email, and not expired
      const { data, error } = await supabaseAdmin
        .from('items')
        .select('id, edit_token_expires_at')
        .eq('edit_token', token)
        .ilike('email', inputEmail)
        .limit(1)
        .single();

      if (error || !data) {
        return NextResponse.redirect(new URL('/manage?error=InvalidToken', request.url));
      }

      const expiresAt = new Date(data.edit_token_expires_at);
      if (expiresAt < new Date()) {
        return NextResponse.redirect(new URL('/manage?error=TokenExpired', request.url));
      }

      isValid = true;
      
      // Optionally invalidate token after use to prevent replay
      await supabaseAdmin
        .from('items')
        .update({ edit_token: null, edit_token_expires_at: null })
        .eq('id', data.id);
    }

    if (isValid) {
      // Set secure HTTP-only cookie
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      cookies().set({
        name: 'manage_session_email',
        value: inputEmail,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: Date.now() + oneWeek
      });

      return NextResponse.redirect(new URL('/manage/dashboard', request.url));
    }

    return NextResponse.redirect(new URL('/manage?error=UnknownError', request.url));
  } catch (err) {
    console.error('Verify token exception:', err);
    return NextResponse.redirect(new URL('/manage?error=ServerError', request.url));
  }
}
