import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import AdminPanel from '@/components/AdminPanel';

export const dynamic = 'force-dynamic';

interface AdminPageProps {
  searchParams: {
    key?: string;
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const secretKey = searchParams.key;
  const expectedKey = process.env.ADMIN_SECRET_KEY;

  // Enforce silent redirect back to landing if the verification key is absent or incorrect
  if (!expectedKey || secretKey !== expectedKey) {
    redirect('/');
  }

  // Retrieve pending queue listings directly from database
  let pendingItems: any[] = [];
  try {
    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
    
    if (!isPlaceholder && !isBypass) {
      const { data, error } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!error && data) {
        pendingItems = data;
      } else if (error) {
        console.error('Database query returned an error inside admin page:', error);
      }
    } else {
      const { getMockItems } = await import('@/lib/mockDb');
      pendingItems = await getMockItems('pending');
      console.log('Loaded pending items from local Mock DB:', pendingItems.length);
    }
  } catch (err) {
    console.error('Failed to establish database fetch for pending queue:', err);
  }

  return (
    <div className="bg-surface-container-low min-h-screen flex flex-col justify-between">
      {/* Admin TopNavBar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-20 bg-surface-container-lowest border-b border-outline-variant shadow-sm shrink-0">
        <div className="flex items-center gap-base">
          <Link href="/" className="text-headline-md font-headline-md font-bold text-on-surface hover:text-primary transition-colors">
            EcomStacks Control Room
          </Link>
          <span className="bg-primary/10 text-primary px-sm py-xs rounded-full font-label-sm text-[11px] uppercase tracking-wider font-semibold border border-primary/20">
            System Admin
          </span>
        </div>
        <Link 
          href="/"
          className="bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low px-md py-sm rounded-lg font-label-md text-label-md transition-all active:scale-95 duration-100"
        >
          View Live Directory
        </Link>
      </header>

      {/* Admin Panel Workspace */}
      <main className="max-w-container-max w-full mx-auto px-gutter py-xl flex-grow">
        <div className="mb-lg">
          <h1 className="font-display-lg text-[32px] text-on-surface mb-xs tracking-tight font-extrabold flex items-center gap-xs">
            <span className="material-symbols-outlined text-[36px] text-primary">gavel</span>
            Pending Submissions
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Verify payment completions, review submissions descriptions, and approve or reject submissions to update the live EcomStacks directory globally in real-time.
          </p>
        </div>

        {/* Dynamic reactive approval flow */}
        <AdminPanel 
          initialPending={pendingItems} 
          secretKey={secretKey} 
        />
      </main>

      {/* Admin Footer */}
      <footer className="w-full py-xl px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-base border-t border-outline-variant bg-surface-container-low shrink-0 text-on-surface-variant/80">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <span className="font-label-md font-semibold text-[14px]">EcomStacks Administration Dashboard</span>
          <p className="font-body-sm text-[12px]">Secure session active. Changes trigger global edge revalidations.</p>
        </div>
        <p className="font-body-sm text-[12px]">© {new Date().getFullYear()} EcomStacks. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
