import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  // Vercel Cron Secret 검증 (설정되어 있을 경우에만 강력 보안망으로 작동하고, 미설정 시에는 활성화 조회를 위해 우회 허용)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase environment variables are missing or placeholders. Skipping DB query.');
    return NextResponse.json({
      success: true,
      message: 'Supabase URL is mock/placeholder. No database query performed.',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // 실제 데이터베이스 조회를 강제 발생시켜 Supabase를 항상 활성 상태로 유지합니다.
    const { data, error } = await supabaseAdmin
      .from('items')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Ecomstacks Keep-Alive Cron executed successfully and generated DB traffic.');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      itemsCount: data?.length || 0,
      message: 'Supabase database activity generated successfully!'
    });
  } catch (error: any) {
    console.error('❌ Ecomstacks Keep-Alive Cron failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
