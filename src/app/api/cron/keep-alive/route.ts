import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화 (서비스 롤 키 사용하여 RLS 우회 및 실제 DB 접근 보장)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: Request) {
  // Vercel Cron Secret 검증 (설정되어 있을 경우 안전망으로 작동)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    return NextResponse.json(
      { success: false, error: 'Environment variables are missing' },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 실제 데이터베이스 트래픽을 유발하기 위해 limit(1) 조회 시도
    // 테이블이 존재하지 않더라도, 이 API 요청 자체로 Supabase 활동 기록이 남아서 Auto-pause 방지 가능
    const { data: keepAliveData, error } = await supabase
      .from('contents') // 테이블 이름은 중요하지 않으며 트래픽 발생이 목적임
      .select('id')
      .limit(1);

    if (error) {
      console.warn('Keep-alive DB Query Warning (Non-critical, activity still generated):', error.message);
    }

    console.log('✅ Supabase Keep-Alive Cron executed successfully and generated DB traffic.');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Supabase database activity generated successfully!'
    });
  } catch (error: any) {
    console.error('❌ Supabase Keep-Alive Cron failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
