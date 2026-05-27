import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  const type = request.nextUrl.searchParams.get('type') || 'page';
  
  if (path) {
    revalidatePath(path, type as 'page' | 'layout');
    return NextResponse.json({ revalidated: true, now: Date.now(), path });
  }

  return NextResponse.json({
    revalidated: false,
    now: Date.now(),
    message: 'Missing path to revalidate',
  });
}
