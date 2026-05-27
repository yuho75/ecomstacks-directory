import React from 'react';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardGrid from '@/components/ManageDashboardClient';

export const dynamic = 'force-dynamic';

interface ManageDashboardPageProps {
  searchParams: {
    email?: string;
  };
}

export default async function ManageDashboardPage({ searchParams }: ManageDashboardPageProps) {
  const email = searchParams.email;
  
  if (!email) {
    redirect('/manage');
  }

  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  let items = [];

  if (isPlaceholder || isBypass) {
    const { getMockItems } = await import('@/lib/mockDb');
    const allMockItems = await getMockItems();
    items = allMockItems.filter((i: any) => i.email.toLowerCase() === email.toLowerCase());
  } else {
    const { data, error } = await supabaseAdmin
      .from('items')
      .select('*')
      .ilike('email', email)
      .order('created_at', { ascending: false });

    if (!error && data) {
      items = data;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Header />
      <main className="flex-1 w-full pt-10 pb-20 px-gutter">
        <DashboardGrid items={items} email={email} />
      </main>
      <Footer />
    </div>
  );
}
