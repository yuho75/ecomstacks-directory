import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import AdminPanel from '@/components/AdminPanel';
import AdminLoginForm from '@/components/AdminLoginForm';
import { logoutAdmin, logoutAndRedirectToHome } from '@/app/actions';

export const dynamic = 'force-dynamic';

interface AdminPageProps {
  searchParams: {
    key?: string;
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const cookieStore = cookies();
  const session = cookieStore.get('ecomstacks_admin_session');
  const isSessionAuthenticated = session?.value === 'authenticated';

  const secretKey = searchParams.key || null;
  const expectedKey = process.env.ADMIN_SECRET_KEY || 'secret-key-123';
  const isKeyAuthenticated = !!(secretKey && secretKey === expectedKey);

  const isAuthenticated = isSessionAuthenticated || isKeyAuthenticated;

  // Retrieve pending, approved & rejected queue listings directly from database if authenticated
  let pendingItems: any[] = [];
  let approvedItems: any[] = [];
  let rejectedItems: any[] = [];
  let analyticsData: any = null;
  let subscriberList: any[] = [];
  let itemClickStats: Record<string, { cardViews: number; websiteClicks: number }> = {};

  if (isAuthenticated) {
    try {
      const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
      
      // Pre-populate standard mock analytics (30 days of history)
      const mockDailyStats = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        mockDailyStats.push({
          date: dateStr,
          views: Math.floor(Math.random() * 80) + 120,
          uniques: Math.floor(Math.random() * 40) + 60
        });
      }
      let tempAnalytics = {
        totalViews: 1248,
        totalUniques: 512,
        todayViews: 145,
        todayUniques: 78,
        dailyStats: mockDailyStats,
        topPages: [
          { path: '/', count: 842 },
          { path: '/pricing', count: 326 },
          { path: '/items/seed-1', count: 80 }
        ]
      };

      if (!isPlaceholder && !isBypass) {
        // 1. Fetch pending items
        const { data: pData, error: pError } = await supabaseAdmin
          .from('items')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!pError && pData) {
          pendingItems = pData;
        }

        // 2. Fetch approved items
        const { data: aData, error: aError } = await supabaseAdmin
          .from('items')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (!aError && aData) {
          approvedItems = aData;
        }

        // 3. Fetch rejected items
        const { data: rData, error: rError } = await supabaseAdmin
          .from('items')
          .select('*')
          .eq('status', 'rejected')
          .order('created_at', { ascending: false });

        if (!rError && rData) {
          rejectedItems = rData;
        }

        // 4. Fetch Visitor Analytics
        try {
          // Fetch overall total rows from page_views
          const { count: totalViews, error: errTotal } = await supabaseAdmin
            .from('page_views')
            .select('*', { count: 'exact', head: true });

          // Fetch last 30 days pageviews to allow dynamic toggle (7d, 14d, 30d) in UI
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          thirtyDaysAgo.setHours(0,0,0,0);

          const { data: recentViews, error: errRecent } = await supabaseAdmin
            .from('page_views')
            .select('session_id, created_at, pathname')
            .gte('created_at', thirtyDaysAgo.toISOString());

          if (!errTotal && !errRecent && recentViews) {
            const allViews = recentViews;
            
            // Total Unique sessions (approximated from unique session IDs in this period)
            const allUniqueSessions = new Set(allViews.map(v => v.session_id));
            
            // Today's range start
            const todayStart = new Date();
            todayStart.setHours(0,0,0,0);
            
            const todayViewsList = allViews.filter(v => new Date(v.created_at) >= todayStart);
            const todayUniquesSet = new Set(todayViewsList.map(v => v.session_id));

            // Breakdown for last 30 days
            const dailyStats = [];
            for (let i = 29; i >= 0; i--) {
              const dateObj = new Date();
              dateObj.setDate(dateObj.getDate() - i);
              
              const startOfDay = new Date(dateObj);
              startOfDay.setHours(0,0,0,0);
              
              const endOfDay = new Date(dateObj);
              endOfDay.setHours(23,59,59,999);
              
              const dayViews = allViews.filter(v => {
                const d = new Date(v.created_at);
                return d >= startOfDay && d <= endOfDay;
              });
              const dayUniques = new Set(dayViews.map(v => v.session_id));
              
              dailyStats.push({
                date: startOfDay.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                views: dayViews.length,
                uniques: dayUniques.size
              });
            }

            // Build a map of item ID -> item Title to translate cryptic UUID paths to human-readable titles
            const allItemsMap: Record<string, string> = {};
            pendingItems.forEach(item => { if (item.id && item.title) allItemsMap[item.id] = item.title; });
            approvedItems.forEach(item => { if (item.id && item.title) allItemsMap[item.id] = item.title; });
            rejectedItems.forEach(item => { if (item.id && item.title) allItemsMap[item.id] = item.title; });

            // Top pages breakdown
            const pageCounts: Record<string, number> = {};
            allViews.forEach(v => {
              pageCounts[v.pathname] = (pageCounts[v.pathname] || 0) + 1;
            });
            const topPages = Object.entries(pageCounts)
              .map(([path, count]) => {
                // If path matches /items/<uuid>
                const match = path.match(/^\/items\/([a-fA-F0-9-]{36})(?:\/|$)/);
                let displayPath = path;
                if (match) {
                  const uuid = match[1];
                  const itemTitle = allItemsMap[uuid];
                  if (itemTitle) {
                    displayPath = `도구: ${itemTitle}`;
                  }
                }
                return { path: displayPath, count };
              })
              .sort((a, b) => b.count - a.count)
              .slice(0, 30);

            tempAnalytics = {
              totalViews: totalViews || 0,
              totalUniques: allUniqueSessions.size,
              todayViews: todayViewsList.length,
              todayUniques: todayUniquesSet.size,
              dailyStats,
              topPages
            };
          }
        } catch (eAnalytics) {
          console.warn("Analytics fetch warning:", eAnalytics);
        }

        // 5. Fetch subscribers list
        try {
          const { data: sData, error: sError } = await supabaseAdmin
            .from('subscribers')
            .select('*')
            .order('created_at', { ascending: false });

          if (!sError && sData) {
            subscriberList = sData;
          }
        } catch (eSub) {
          console.warn("Subscribers table may not exist yet in Supabase.");
        }

        // 6. Fetch per-item click stats from item_clicks table
        try {
          const { data: clickData, error: clickError } = await supabaseAdmin
            .from('item_clicks')
            .select('item_id, type');

          if (!clickError && clickData) {
            const stats: Record<string, { cardViews: number; websiteClicks: number }> = {};
            for (const row of clickData) {
              if (!stats[row.item_id]) stats[row.item_id] = { cardViews: 0, websiteClicks: 0 };
              if (row.type === 'card_view') stats[row.item_id].cardViews++;
              if (row.type === 'website_click') stats[row.item_id].websiteClicks++;
            }
            itemClickStats = stats;
          }
        } catch (eClicks) {
          console.warn('item_clicks table may not exist yet:', eClicks);
        }
      } else {
        const { getMockItems } = await import('@/lib/mockDb');
        pendingItems = await getMockItems('pending');
        approvedItems = await getMockItems('approved');
        rejectedItems = await getMockItems('rejected');
        subscriberList = [
          { id: 'mock-sub-1', email: 'test_founder@example.com', created_at: new Date().toISOString() },
          { id: 'mock-sub-2', email: 'growth_hacker@domain.com', created_at: new Date(Date.now() - 86400000).toISOString() }
        ];
        console.log('Loaded mock items for admin workspace:', pendingItems.length, approvedItems.length, rejectedItems.length);
      }

      analyticsData = tempAnalytics;
    } catch (err) {
      console.error('Failed to establish database fetch for admin workspace:', err);
    }
  }

  return (
    <div className="bg-surface-container-low min-h-screen flex flex-col justify-between">
      {/* Admin TopNavBar */}
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant shadow-sm shrink-0">
        <div className="max-w-container-max w-full mx-auto px-gutter h-20 flex justify-between items-center">
          <div className="flex items-center gap-base">
            <form action={logoutAndRedirectToHome} className="inline flex items-center">
              <button 
                type="submit" 
                className="flex items-center gap-xs font-bold text-on-surface hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer align-middle select-none text-left group"
              >
                <div className="relative w-8 h-8 flex items-center justify-center bg-black rounded-md shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L21 7.5L12 12L3 7.5L12 3Z" fill="currentColor" fillOpacity="0.2" />
                    <path d="M3 12L12 16.5L21 12" />
                    <path d="M3 16.5L12 21L21 16.5" />
                  </svg>
                </div>
                <span 
                  className="text-[22px] font-extrabold tracking-[-0.045em] text-on-surface select-none" 
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Ecom<span className="text-on-surface-variant">Stacks</span>
                  <span className="text-body-sm font-normal text-on-surface-variant group-hover:text-primary ml-1.5 align-middle select-none">Control Room</span>
                </span>
              </button>
            </form>
            <span className="bg-primary/10 text-primary px-sm py-xs rounded-full font-label-sm text-[11px] uppercase tracking-wider font-semibold border border-primary/20">
              System Admin
            </span>
            <span className="bg-on-surface/5 text-on-surface-variant px-sm py-xs rounded-full font-label-sm text-[11px] uppercase tracking-wider font-semibold border border-outline-variant/30 flex items-center gap-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60"></span>
              Since 2026-05-25
            </span>
          </div>
          <div className="flex items-center gap-md">
            {isAuthenticated && (
              <form action={logoutAdmin}>
                <button 
                  type="submit"
                  className="bg-error/10 border border-error/20 text-error hover:bg-error hover:text-on-error px-md py-sm rounded-lg font-label-md text-label-md transition-all active:scale-95 duration-100 flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* Admin Panel Workspace */}
      <main className="max-w-container-max w-full mx-auto px-gutter py-xl flex-grow">
        {!isAuthenticated ? (
          <AdminLoginForm />
        ) : (
          <>

            {/* Dynamic reactive approval flow */}
            <AdminPanel 
              initialPending={pendingItems} 
              initialApproved={approvedItems}
              initialRejected={rejectedItems}
              secretKey={secretKey}
              analytics={analyticsData}
              subscribers={subscriberList}
              itemClickStats={itemClickStats}
            />
          </>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="w-full bg-[#09090b] border-t border-neutral-800 shrink-0 text-neutral-400">
        <div className="max-w-container-max w-full mx-auto px-gutter py-sm flex flex-col md:flex-row justify-between items-center gap-base">
          <div className="flex flex-col items-center md:items-start gap-xs">
            <div className="flex items-center gap-xs">
              <div className="relative w-6 h-6 flex items-center justify-center bg-black rounded shrink-0">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L21 7.5L12 12L3 7.5L12 3Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M3 12L12 16.5L21 12" />
                  <path d="M3 16.5L12 21L21 16.5" />
                </svg>
              </div>
              <span 
                className="text-[18px] font-extrabold tracking-[-0.045em] text-white select-none" 
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Ecom<span className="text-neutral-400">Stacks</span>
                <span className="text-[12px] font-normal text-neutral-400 ml-1.5 align-middle select-none">Administration Dashboard</span>
              </span>
            </div>
            <p className="font-body-sm text-[12px] text-neutral-400">Secure session active. Changes trigger global edge revalidations.</p>
          </div>
          <p className="font-body-sm text-[12px] text-neutral-400">© {new Date().getFullYear()} EcomStacks. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
