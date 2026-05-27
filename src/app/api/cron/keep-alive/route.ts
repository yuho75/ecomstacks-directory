import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ status: 'ignored', message: 'No URL found' });
  
  try {
    await fetch(`${url}/api/v1/health` || `${url}`);
    return NextResponse.json({ status: 'ok', message: 'Supabase kept alive via fetch' });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}
