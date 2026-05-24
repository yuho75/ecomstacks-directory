'use client';

import React, { useState } from 'react';
import { approveItem, rejectItem } from '@/app/actions';
import { getOptimizedCloudinaryUrl, formatDate } from '@/lib/utils';

interface Item {
  id: string;
  title: string;
  url: string;
  description: string;
  image_url: string;
  category: string;
  email: string;
  status: string;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  last_newsletter_month?: string | null;
}

interface AdminPanelProps {
  initialPending: Item[];
  initialApproved: Item[];
  initialRejected: Item[];
  secretKey?: string | null;
  analytics?: {
    totalViews: number;
    totalUniques: number;
    todayViews: number;
    todayUniques: number;
    dailyStats: { date: string; rawDate?: number; views: number; uniques: number }[];
    topPages: { path: string; count: number }[];
  } | null;
  subscribers?: Subscriber[];
  itemClickStats?: Record<string, { cardViews: number; websiteClicks: number }>;
}

export default function AdminPanel({ 
  initialPending, 
  initialApproved, 
  initialRejected, 
  secretKey = null,
  analytics = null,
  subscribers = [],
  itemClickStats = {}
}: AdminPanelProps) {
  const [pendingItems, setPendingItems] = useState<Item[]>(initialPending);
  const [approvedItems, setApprovedItems] = useState<Item[]>(initialApproved);
  const [rejectedItems, setRejectedItems] = useState<Item[]>(initialRejected);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'subscribers'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Time range selector state for analytics chart (7d, 30d, 90d, 180d, 365d, all)
  const [timeRange, setTimeRange] = useState<7 | 30 | 90 | 180 | 365 | 'all'>(7);

  // Subscriber-specific filtering & pagination
  const filteredSubscribers = (subscribers || []).filter(sub => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return sub.email.toLowerCase().includes(term);
  });

  const totalSubscribers = filteredSubscribers.length;
  const totalSubscribersPages = Math.ceil(totalSubscribers / itemsPerPage) || 1;
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setError(null);
    setSuccess(null);
    try {
      await approveItem(id, secretKey);
      setSuccess(activeTab === 'rejected' ? 'Item successfully restored and published!' : 'Item successfully approved and published!');
      
      const itemToApprove = pendingItems.find(item => item.id === id) || rejectedItems.find(item => item.id === id);
      
      // Move to approved list with a slight delay for smooth visual transition
      setTimeout(() => {
        setPendingItems(prev => prev.filter(item => item.id !== id));
        setRejectedItems(prev => prev.filter(item => item.id !== id));
        if (itemToApprove) {
          const approvedCopy = { ...itemToApprove, status: 'approved' };
          setApprovedItems(prev => [approvedCopy, ...prev]);
        }
        setSuccess(null);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to approve item.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    setError(null);
    setSuccess(null);
    try {
      await rejectItem(id, secretKey);
      setSuccess(activeTab === 'approved' ? 'Item successfully unpublished.' : 'Item successfully rejected.');
      
      const itemToReject = pendingItems.find(item => item.id === id) || approvedItems.find(item => item.id === id);
      
      // Move to rejected list with a slight delay for smooth visual transition
      setTimeout(() => {
        setPendingItems(prev => prev.filter(item => item.id !== id));
        setApprovedItems(prev => prev.filter(item => item.id !== id));
        if (itemToReject) {
          const rejectedCopy = { ...itemToReject, status: 'rejected' };
          setRejectedItems(prev => [rejectedCopy, ...prev]);
        }
        setSuccess(null);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reject/unpublish item.');
    } finally {
      setProcessingId(null);
    }
  };

  const activeItems = activeTab === 'pending' 
    ? pendingItems 
    : activeTab === 'approved' 
      ? approvedItems 
      : rejectedItems;

  const filteredActiveItems = activeItems.filter(item => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.title.toLowerCase().includes(term) ||
      item.url.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  const totalItems = filteredActiveItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedItems = filteredActiveItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-md">
      {/* Toast notifications */}
      {success && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white px-md py-sm rounded-lg shadow-xl font-label-md flex items-center gap-xs z-50 animate-bounce">
          <span className="material-symbols-outlined">check_circle</span>
          {success}
        </div>
      )}

      {error && (
        <div className="fixed bottom-5 right-5 bg-error text-white px-md py-sm rounded-lg shadow-xl font-label-md flex items-center gap-xs z-50 animate-shake">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="bg-gradient-to-br from-inverse-surface/5 to-primary/5 border border-outline-variant rounded-2xl p-md md:p-lg mb-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm mb-md pb-sm border-b border-outline-variant/50">
            <div>
              <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span className="material-symbols-outlined text-primary text-[24px]">query_stats</span>
                실시간 방문 분석 (Real-Time Visitor Analytics)
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-0.5">데이터베이스에 자동 집계되는 실시간 트래픽 대시보드입니다.</p>
            </div>
            <span className="bg-green-500/10 text-green-600 px-sm py-xs rounded-full font-label-sm text-[11px] uppercase tracking-wider font-semibold border border-green-500/20 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Live Tracking Active
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-sm mb-md">
            <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl hover:shadow-md transition-shadow duration-300">
              <p className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider">누적 페이지뷰</p>
              <h3 className="text-2xl font-extrabold text-on-surface mt-1">{analytics.totalViews.toLocaleString()}</h3>
              <p className="text-[11px] text-primary font-semibold mt-1 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                Total Pageviews
              </p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl hover:shadow-md transition-shadow duration-300">
              <p className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider">누적 고유 방문자</p>
              <h3 className="text-2xl font-extrabold text-on-surface mt-1">{analytics.totalUniques.toLocaleString()}</h3>
              <p className="text-[11px] text-primary font-semibold mt-1 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">group</span>
                Unique Sessions
              </p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl hover:shadow-md transition-shadow duration-300">
              <p className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider">오늘 페이지뷰</p>
              <h3 className="text-2xl font-extrabold text-on-surface mt-1">{analytics.todayViews.toLocaleString()}</h3>
              <p className="text-[11px] text-green-600 font-semibold mt-1 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                Today Pageviews
              </p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl hover:shadow-md transition-shadow duration-300">
              <p className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider">오늘 고유 방문자</p>
              <h3 className="text-2xl font-extrabold text-on-surface mt-1">{analytics.todayUniques.toLocaleString()}</h3>
              <p className="text-[11px] text-green-600 font-semibold mt-1 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">person</span>
                Today Uniques
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
            {/* Visual Analytics Chart */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant p-md rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-md pb-xs border-b border-outline-variant/30">
                <h4 className="font-bold text-on-surface text-label-md flex items-center gap-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <span className="material-symbols-outlined text-primary text-[20px]">leaderboard</span>
                  트래픽 추이 ({
                    timeRange === 7 || timeRange === 30 ? `최근 ${timeRange}일` :
                    timeRange === 90 ? '최근 3개월' :
                    timeRange === 180 ? '최근 6개월' :
                    timeRange === 365 ? '최근 1년' : '전체 보기'
                  })
                </h4>
                
                {/* Time range selector tabs (capsule buttons) */}
                <div className="flex bg-surface-container-low border border-outline-variant p-0.5 rounded-lg shrink-0 overflow-x-auto max-w-full whitespace-nowrap select-none scrollbar-none gap-[1px]">
                  {([
                    { label: '7일', val: 7 },
                    { label: '30일', val: 30 },
                    { label: '3개월', val: 90 },
                    { label: '6개월', val: 180 },
                    { label: '1년', val: 365 },
                    { label: '전체', val: 'all' }
                  ] as const).map(({ label, val }) => (
                    <button
                      key={label}
                      onClick={() => setTimeRange(val)}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                        timeRange === val
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-on-surface-variant hover:text-primary bg-transparent'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Prepare and aggregate data based on active range */}
              {(() => {
                const rawStats = analytics.dailyStats || [];
                let displayedDailyStats: { date: string; views: number; uniques: number }[] = [];

                if (timeRange === 7 || timeRange === 30) {
                  displayedDailyStats = rawStats.slice(-timeRange);
                } else if (timeRange === 90 || timeRange === 180) {
                  const itemsToGroup = timeRange === 180 ? rawStats.slice(-180) : rawStats.slice(-90);
                  const weeklyStats: { date: string; views: number; uniques: number }[] = [];
                  for (let i = 0; i < itemsToGroup.length; i += 7) {
                    const chunk = itemsToGroup.slice(i, i + 7);
                    if (chunk.length === 0) continue;
                    const views = chunk.reduce((sum, item) => sum + item.views, 0);
                    const maxUniques = Math.max(...chunk.map(item => item.uniques), 0);
                    const uniquesSum = chunk.reduce((sum, item) => sum + item.uniques, 0);
                    const weeklyUniques = Math.max(Math.round(uniquesSum * 0.75), maxUniques);
                    const startDate = chunk[0].date;
                    const endDate = chunk[chunk.length - 1].date;
                    const endLabel = endDate.includes('일') ? endDate.split(' ').pop() || '' : endDate;
                    weeklyStats.push({
                      date: `${startDate}~${endLabel}`,
                      views,
                      uniques: Math.min(weeklyUniques, views)
                    });
                  }
                  displayedDailyStats = weeklyStats;
                } else {
                  const itemsToGroup = timeRange === 365 ? rawStats.slice(-365) : rawStats;
                  const monthlyStatsMap: Record<string, { views: number; uniquesSum: number; maxUniques: number }> = {};
                  const monthOrder: string[] = [];

                  itemsToGroup.forEach(item => {
                    const d = item.rawDate ? new Date(item.rawDate) : new Date();
                    const monthLabel = `${d.getMonth() + 1}월`;
                    if (!monthlyStatsMap[monthLabel]) {
                      monthlyStatsMap[monthLabel] = { views: 0, uniquesSum: 0, maxUniques: 0 };
                      monthOrder.push(monthLabel);
                    }
                    monthlyStatsMap[monthLabel].views += item.views;
                    monthlyStatsMap[monthLabel].uniquesSum += item.uniques;
                    monthlyStatsMap[monthLabel].maxUniques = Math.max(monthlyStatsMap[monthLabel].maxUniques, item.uniques);
                  });

                  displayedDailyStats = monthOrder.map(month => {
                    const data = monthlyStatsMap[month];
                    const monthlyUniques = Math.max(Math.round(data.uniquesSum * 0.65), data.maxUniques);
                    return {
                      date: month,
                      views: data.views,
                      uniques: Math.min(monthlyUniques, data.views)
                    };
                  });
                }

                // Dynamic dimensions to prevent clutter and overflow (optimized for 1 bar per day)
                const barWidthClass = (timeRange === 365 || timeRange === 'all')
                  ? 'w-5 md:w-8'
                  : (timeRange === 90 || timeRange === 180)
                    ? 'w-3.5 md:w-5.5'
                    : timeRange === 30
                      ? 'w-2 sm:w-2.5 md:w-3.5'
                      : 'w-6 md:w-9';

                const dayGapClass = timeRange === 30
                  ? 'gap-[1px] md:gap-[2px]'
                  : (timeRange === 90 || timeRange === 180)
                    ? 'gap-[2px] md:gap-xs'
                    : 'gap-xs md:gap-sm';

                const maxViews = Math.max(...displayedDailyStats.map(s => s.views), 10);

                return (
                  <div className={`h-52 flex items-end pt-xl border-b border-outline-variant px-xs relative ${dayGapClass}`}>
                    {displayedDailyStats.map((stat, idx) => {
                      const viewHeight = (stat.views / maxViews) * 100;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full group relative">
                          {/* Tooltip on Hover - Absolutely positioned high z-index tooltip */}
                          <div className="absolute bottom-full mb-xs bg-inverse-surface text-inverse-on-surface text-[11px] rounded px-xs py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none whitespace-nowrap text-center">
                            <p className="font-bold text-primary-fixed">{stat.date}</p>
                            <p>뷰: {stat.views}회</p>
                            <p>방문자: {stat.uniques}명</p>
                          </div>
                          
                          {/* Stacked Single Bar representation (1 Bar Per Day) */}
                          <div className="w-full flex justify-center items-end h-full">
                            {stat.views > 0 ? (
                              <div 
                                className={`${barWidthClass} bg-indigo-400 hover:bg-indigo-500 rounded-t-sm transition-all duration-300 shadow-sm relative group-hover:scale-y-105 overflow-hidden`}
                                style={{ height: `${Math.max(viewHeight, 6)}%` }}
                              >
                                {/* Unique Visitors stacked at the bottom of the Pageviews bar */}
                                <div 
                                  className="absolute bottom-0 inset-x-0 bg-blue-600 transition-all duration-300"
                                  style={{ height: `${(stat.uniques / Math.max(stat.views, 1)) * 100}%` }}
                                />
                              </div>
                            ) : (
                              // Micro placeholder for 0-views columns to maintain proper spacing
                              <div className="w-2 h-1 bg-transparent" />
                            )}
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-neutral-500 mt-2 truncate max-w-full font-semibold select-none h-4 flex items-center justify-center">
                            {timeRange === 30 
                              ? (idx % 5 === 0 ? stat.date : '\u00a0') 
                              : (timeRange === 90 || timeRange === 180)
                                ? (idx % 3 === 0 ? stat.date.replace('월 ', '/').replace('일', '') : '\u00a0')
                                : stat.date
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <div className="flex gap-md justify-center mt-sm text-[11px] font-semibold text-neutral-500">
                <span className="flex items-center gap-xs">
                  <span className="w-2.5 h-2.5 bg-indigo-400 rounded-sm"></span>
                  페이지뷰 (Pageviews)
                </span>
                <span className="flex items-center gap-xs">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span>
                  고유 방문자 (Uniques)
                </span>
              </div>
            </div>

            {/* Popular Pages Panel */}
            <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl flex flex-col justify-between animate-in fade-in duration-300">
              <div>
                <h4 className="font-bold text-on-surface mb-md text-label-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
                  인기 페이지 순위
                </h4>
                <div className="space-y-sm">
                  {analytics.topPages.map((page, index) => {
                    const maxHits = analytics.topPages[0]?.count || 1;
                    const fillPercent = (page.count / maxHits) * 100;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-[12px] font-bold text-on-surface-variant">
                          <span className="truncate font-mono text-neutral-600 max-w-[70%]">{page.path}</span>
                          <span>{page.count} views</span>
                        </div>
                        <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-t border-outline-variant/50 pt-sm mt-md">
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  💡 **팁**: `/`는 메인 디렉토리, `/pricing`은 요금제 안내 페이지입니다. 유입량에 맞추어 도구 노출 순서와 광고 요금을 최적화할 수 있습니다!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-sm items-stretch sm:items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-xl p-sm mb-sm shadow-sm">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px] select-none">search</span>
          <input
            type="text"
            placeholder={activeTab === 'subscribers' ? "구독자 이메일 검색..." : "도구 이름, URL, 카테고리 또는 이메일 검색..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-9 py-sm font-body-sm text-body-sm text-on-surface placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
              title="검색어 지우기"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
        
        {searchTerm && (
          <div className="text-[13px] font-bold text-neutral-500 bg-primary/5 px-md py-sm rounded-lg border border-primary/10 text-center sm:text-right shrink-0 flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined text-[16px] text-primary">filter_list</span>
            <span>
              {activeTab === 'subscribers' 
                ? `${totalSubscribers}명의 일치하는 구독자 찾음`
                : `${totalItems}개의 일치하는 도구 찾음`}
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-outline-variant gap-xs mb-md overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveTab('pending'); setCurrentPage(1); setSearchTerm(''); }}
          className={`px-md py-base font-label-md text-label-md transition-all duration-200 select-none border-b-2 flex items-center gap-xs whitespace-nowrap cursor-pointer ${
            activeTab === 'pending'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          <span>Pending Submissions</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors duration-200 ${
            activeTab === 'pending' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            {pendingItems.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('approved'); setCurrentPage(1); setSearchTerm(''); }}
          className={`px-md py-base font-label-md text-label-md transition-all duration-200 select-none border-b-2 flex items-center gap-xs whitespace-nowrap cursor-pointer ${
            activeTab === 'approved'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">verified</span>
          <span>Live Directory</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors duration-200 ${
            activeTab === 'approved' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            {approvedItems.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('rejected'); setCurrentPage(1); setSearchTerm(''); }}
          className={`px-md py-base font-label-md text-label-md transition-all duration-200 select-none border-b-2 flex items-center gap-xs whitespace-nowrap cursor-pointer ${
            activeTab === 'rejected'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">cancel</span>
          <span>Rejected / Hidden</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors duration-200 ${
            activeTab === 'rejected' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            {rejectedItems.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('subscribers'); setCurrentPage(1); setSearchTerm(''); }}
          className={`px-md py-base font-label-md text-label-md transition-all duration-200 select-none border-b-2 flex items-center gap-xs whitespace-nowrap cursor-pointer ${
            activeTab === 'subscribers'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">mail</span>
          <span>Subscribers (구독자 명단)</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors duration-200 ${
            activeTab === 'subscribers' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            {subscribers.length}
          </span>
        </button>
      </div>

      {activeTab === 'subscribers' ? (
        subscribers.length === 0 ? (
          <div className="text-center py-xl border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest animate-in fade-in duration-300">
            <span className="material-symbols-outlined text-[64px] text-primary/40 mb-xs">mail</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">No Subscribers Yet</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto mt-xs">
              No users have subscribed to the newsletter yet. Subscriptions via the header announcement bar or footer will appear here!
            </p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-xl border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest animate-in fade-in duration-300">
            <span className="material-symbols-outlined text-[64px] text-primary/40 mb-xs">search_off</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">일치하는 결과 없음</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto mt-xs">
              &quot;{searchTerm}&quot;에 매칭되는 구독자를 찾을 수 없습니다. 철자를 확인하거나 다른 검색어를 입력해 보세요.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant text-[13px] font-bold text-neutral-600">
                      <th className="py-base px-md">구독자 이메일</th>
                      <th className="py-base px-md">구독 신청일</th>
                      <th className="py-base px-md text-center">MailerLite 연동</th>
                      <th className="py-base px-md text-center">Last Sent (최근 발송)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {paginatedSubscribers.map(sub => {
                      const now = new Date();
                      const currentMonthLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                      const isSentThisMonth = sub.last_newsletter_month === currentMonthLabel;

                      return (
                        <tr key={sub.id} className="hover:bg-primary/5 transition-colors">
                          <td className="py-sm px-md font-bold text-on-surface text-[14px]">
                            {sub.email}
                          </td>
                          <td className="py-sm px-md text-neutral-500 text-[13px] font-medium">
                            {formatDate(sub.created_at)}
                          </td>
                          <td className="py-sm px-md text-center">
                            <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 px-sm py-xs rounded-full font-label-sm text-[11px] font-semibold border border-green-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              메일러라이트 연동됨
                            </span>
                          </td>
                          <td className="py-sm px-md text-center">
                            {isSentThisMonth ? (
                              <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 px-sm py-xs rounded-full font-label-sm text-[11px] font-semibold border border-indigo-500/20">
                                <span className="material-symbols-outlined text-[14px]">mark_email_read</span>
                                발송 완료 ({sub.last_newsletter_month?.split('-')[1]}월)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-neutral-500/10 text-neutral-500 px-sm py-xs rounded-full font-label-sm text-[11px] font-semibold border border-neutral-500/20">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                발송 대기 (Pending)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalSubscribersPages > 1 && (
              <div className="flex flex-wrap justify-between items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm mt-md gap-sm shadow-sm">
                <span className="text-[13px] font-bold text-neutral-500 flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">analytics</span>
                  <span>총 {totalSubscribers}명 중 {(currentPage - 1) * itemsPerPage + 1}~{Math.min(currentPage * itemsPerPage, totalSubscribers)}명 표시</span>
                </span>
                
                <div className="flex items-center gap-xs">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface transition-all duration-200 cursor-pointer"
                    title="첫 페이지"
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
                  </button>
                  
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface transition-all duration-200 cursor-pointer"
                    title="이전 페이지"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>

                  <span className="text-[13px] font-bold text-on-surface px-md select-none">
                    {currentPage} / {totalSubscribersPages}
                  </span>

                  <button
                    disabled={currentPage === totalSubscribersPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalSubscribersPages))}
                    className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface transition-all duration-200 cursor-pointer"
                    title="다음 페이지"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>

                  <button
                    disabled={currentPage === totalSubscribersPages}
                    onClick={() => setCurrentPage(totalSubscribersPages)}
                    className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface transition-all duration-200 cursor-pointer"
                    title="마지막 페이지"
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )
      ) : activeItems.length === 0 ? (
        <div className="text-center py-xl border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest animate-in fade-in duration-300">
          <span className="material-symbols-outlined text-[64px] text-primary/40 mb-xs">
            {activeTab === 'pending' ? 'verified_user' : activeTab === 'approved' ? 'grid_view' : 'delete_sweep'}
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            {activeTab === 'pending' ? 'Queue is Empty' : activeTab === 'approved' ? 'No Live Tools' : 'No Rejected Tools'}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto mt-xs">
            {activeTab === 'pending' 
              ? 'There are no pending submissions requiring administrator verification at the moment. All caught up!'
              : activeTab === 'approved'
                ? 'There are no active tools inside the database yet. Go to the Pending tab to approve submitted tools!'
                : 'There are no rejected or hidden tools in the database yet.'}
          </p>
        </div>
      ) : filteredActiveItems.length === 0 ? (
        <div className="text-center py-xl border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest animate-in fade-in duration-300">
          <span className="material-symbols-outlined text-[64px] text-primary/40 mb-xs">search_off</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">일치하는 결과 없음</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto mt-xs">
            &quot;{searchTerm}&quot;에 매칭되는 도구를 찾을 수 없습니다. 철자를 확인하거나 다른 검색어를 입력해 보세요.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-base animate-in fade-in duration-300">
          {paginatedItems.map(item => {
            const isProcessing = processingId === item.id;
            return (
              <div 
                key={item.id} 
                className={`bg-surface-container-lowest border border-outline-variant hover:border-primary/20 rounded-xl p-sm md:py-base md:px-md flex flex-col sm:flex-row gap-sm items-center justify-between tool-card-shadow transition-all duration-300 ${
                  isProcessing ? 'opacity-50 scale-98' : ''
                }`}
              >
                {/* Left Side: Thumbnail + Info */}
                <div className="flex flex-col sm:flex-row items-center gap-sm flex-1 min-w-0 w-full">
                  {/* Visual Thumbnail */}
                  <div className="w-14 h-14 md:w-20 md:h-12 aspect-video bg-surface-container-low border border-outline-variant rounded overflow-hidden shrink-0">
                    <img 
                      src={getOptimizedCloudinaryUrl(item.image_url)} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-xs">
                      <h3 className="font-bold text-[16px] text-on-surface truncate">
                        {item.title}
                      </h3>
                      <span className="bg-surface-container-high text-on-surface-variant px-xs py-0.5 rounded font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <p className="font-body-sm text-[13px] text-on-surface-variant truncate font-semibold italic mt-0.5">
                      &quot;{item.description}&quot;
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-md gap-y-1 text-[12px] text-neutral-500 mt-1">
                      <div className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">link</span>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary truncate max-w-[150px] md:max-w-[200px]">
                          {item.url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">mail</span>
                        <span className="truncate max-w-[150px]">{item.email}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      {/* Per-item click analytics badges */}
                      {itemClickStats[item.id] && (
                        <>
                          <div className="flex items-center gap-0.5 bg-indigo-50 border border-indigo-200 rounded-full px-xs py-0.5">
                            <span className="material-symbols-outlined text-[12px] text-indigo-500">visibility</span>
                            <span className="font-bold text-indigo-600 text-[11px]">{itemClickStats[item.id].cardViews.toLocaleString()} 카드조회</span>
                          </div>
                          <div className="flex items-center gap-0.5 bg-emerald-50 border border-emerald-200 rounded-full px-xs py-0.5">
                            <span className="material-symbols-outlined text-[12px] text-emerald-500">north_east</span>
                            <span className="font-bold text-emerald-600 text-[11px]">{itemClickStats[item.id].websiteClicks.toLocaleString()} 사이트방문</span>
                          </div>
                        </>
                      )}
                      {!itemClickStats[item.id] && (
                        <div className="flex items-center gap-0.5 text-neutral-400">
                          <span className="material-symbols-outlined text-[12px]">bar_chart</span>
                          <span className="text-[11px]">클릭 데이터 없음</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Control Action Buttons */}
                <div className="flex gap-base w-full sm:w-auto shrink-0 justify-center sm:justify-end pt-sm sm:pt-0 sm:pl-sm">
                  {activeTab === 'pending' ? (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleApprove(item.id)}
                        className="bg-green-600 text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:bg-green-700 active:scale-95 transition-all shadow-sm cursor-pointer py-1.5 px-3 text-[13px] font-semibold"
                      >
                        {isProcessing ? (
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[15px]">published_with_changes</span>
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleReject(item.id)}
                        className="bg-error text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer py-1.5 px-3 text-[13px] font-semibold"
                      >
                        {isProcessing ? (
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[15px]">block</span>
                            Reject
                          </>
                        )}
                      </button>
                    </>
                  ) : activeTab === 'approved' ? (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleReject(item.id)}
                      className="bg-error/10 hover:bg-error border border-error/20 hover:border-transparent text-error hover:text-on-error rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs active:scale-95 transition-all shadow-sm duration-300 cursor-pointer py-1.5 px-3 text-[13px] font-semibold"
                    >
                      {isProcessing ? (
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">unpublished</span>
                          Unpublish & Reject
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleApprove(item.id)}
                      className="bg-green-600 text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:bg-green-700 active:scale-95 transition-all shadow-sm cursor-pointer py-1.5 px-3 text-[13px] font-semibold"
                    >
                      {isProcessing ? (
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">publish</span>
                          Re-approve & Publish
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-between items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm mt-md gap-sm shadow-sm">
            <span className="text-[13px] font-bold text-neutral-500 flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px] text-primary">analytics</span>
              <span>총 {totalItems}개 중 {(currentPage - 1) * itemsPerPage + 1}~{Math.min(currentPage * itemsPerPage, totalItems)}개 표시</span>
            </span>
            
            <div className="flex items-center gap-xs">
              {/* First Page */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface transition-all duration-200 cursor-pointer"
                title="첫 페이지"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
              </button>
              
              {/* Prev Page */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface transition-all duration-200 cursor-pointer"
                title="이전 페이지"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {/* Page Indicator */}
              <span className="text-[13px] font-bold text-on-surface px-md select-none">
                {currentPage} / {totalPages}
              </span>

              {/* Next Page */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface transition-all duration-200 cursor-pointer"
                title="다음 페이지"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>

              {/* Last Page */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface transition-all duration-200 cursor-pointer"
                title="마지막 페이지"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
              </button>
            </div>
          </div>
        )}
      </>
      )}
    </div>
  );
}
