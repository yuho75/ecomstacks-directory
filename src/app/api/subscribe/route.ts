import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isPlaceholder) {
      console.log('Mock Newsletter Subscribe:', email);
      return NextResponse.json({ success: true, email });
    }

    // Insert into subscribers table
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

    return NextResponse.json({ success: true, subscriber: data });
  } catch (err: any) {
    console.error('Subscribe API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
