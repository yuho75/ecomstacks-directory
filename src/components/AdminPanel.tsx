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
    dailyStats: { date: string; views: number; uniques: number }[];
    topPages: { path: string; count: number }[];
  } | null;
}

export default function AdminPanel({ 
  initialPending, 
  initialApproved, 
  initialRejected, 
  secretKey = null,
  analytics = null
}: AdminPanelProps) {
  const [pendingItems, setPendingItems] = useState<Item[]>(initialPending);
  const [approvedItems, setApprovedItems] = useState<Item[]>(initialApproved);
  const [rejectedItems, setRejectedItems] = useState<Item[]>(initialRejected);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
              <h4 className="font-bold text-on-surface mb-md text-label-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">leaderboard</span>
                일별 트래픽 추이 (최근 7일)
              </h4>
              <div className="h-48 flex items-end gap-sm md:gap-md pt-sm border-b border-outline-variant px-sm relative">
                {analytics.dailyStats.map((stat, idx) => {
                  // Find the maximum views in the stats to scale the bars properly
                  const maxViews = Math.max(...analytics.dailyStats.map(s => s.views), 10);
                  const viewHeight = (stat.views / maxViews) * 100;
                  const uniqueHeight = (stat.uniques / maxViews) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full group relative">
                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-full mb-xs bg-inverse-surface text-inverse-on-surface text-[11px] rounded px-xs py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none whitespace-nowrap text-center">
                        <p className="font-bold text-primary-fixed">{stat.date}</p>
                        <p>뷰: {stat.views}회</p>
                        <p>방문자: {stat.uniques}명</p>
                      </div>
                      
                      {/* Stacked/Double Bar Chart representation */}
                      <div className="w-full flex justify-center gap-xs items-end h-full">
                        {/* Pageviews Bar */}
                        <div 
                          className="w-3 md:w-5 bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all duration-300 shadow-sm relative group-hover:scale-y-105"
                          style={{ height: `${Math.max(viewHeight, 6)}%` }}
                        >
                          <div className="absolute inset-x-0 bottom-0 bg-primary/40 h-1 md:h-1.5 rounded-t-sm"></div>
                        </div>
                        {/* Unique Visitors Bar */}
                        <div 
                          className="w-3 md:w-5 bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 rounded-t-sm transition-all duration-300 shadow-sm relative group-hover:scale-y-105"
                          style={{ height: `${Math.max(uniqueHeight, 6)}%` }}
                        >
                          <div className="absolute inset-x-0 top-0 bg-yellow-300/30 h-1 rounded-t-sm"></div>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500 mt-2 truncate max-w-full font-semibold">{stat.date}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-md justify-center mt-sm text-[11px] font-semibold text-neutral-500">
                <span className="flex items-center gap-xs">
                  <span className="w-2.5 h-2.5 bg-primary/20 border border-primary/40 rounded-sm"></span>
                  페이지뷰 (Pageviews)
                </span>
                <span className="flex items-center gap-xs">
                  <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-sm"></span>
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

      {/* Tab Navigation */}
      <div className="flex border-b border-outline-variant gap-xs mb-md overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('pending')}
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
          onClick={() => setActiveTab('approved')}
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
          onClick={() => setActiveTab('rejected')}
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
      </div>

      {activeItems.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 gap-md animate-in fade-in duration-300">
          {activeItems.map(item => {
            const isProcessing = processingId === item.id;
            return (
              <div 
                key={item.id} 
                className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg flex flex-col md:flex-row gap-md items-start tool-card-shadow transition-all duration-500 ${
                  isProcessing ? 'opacity-50 scale-98' : ''
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="w-full md:w-48 aspect-video bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden shrink-0">
                  <img 
                    src={getOptimizedCloudinaryUrl(item.image_url)} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-sm mb-xs">
                    <h3 className="font-headline-md text-[20px] text-on-surface font-bold truncate">
                      {item.title}
                    </h3>
                    <span className="bg-surface-container-high text-on-surface-variant px-sm py-xs rounded font-label-sm text-[11px] uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-md font-semibold italic">
                    &quot;{item.description}&quot;
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs text-[13px] text-on-surface-variant border-t border-outline-variant/60 pt-sm">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">link</span>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary truncate">
                        {item.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                      <span className="truncate">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                      <span>Submitted: {formatDate(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">fingerprint</span>
                      <span className="font-mono text-[11px] truncate">ID: {item.id}</span>
                    </div>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex sm:flex-row md:flex-col gap-base w-full md:w-auto self-stretch justify-end shrink-0 pt-md md:pt-0 md:border-l md:border-outline-variant md:pl-md min-w-[180px]">
                  {activeTab === 'pending' ? (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 bg-green-600 text-white px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:bg-green-700 active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        {isProcessing ? (
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">published_with_changes</span>
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleReject(item.id)}
                        className="flex-1 bg-error text-white px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        {isProcessing ? (
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">block</span>
                            Reject
                          </>
                        )}
                      </button>
                    </>
                  ) : activeTab === 'approved' ? (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleReject(item.id)}
                      className="w-full bg-error/10 hover:bg-error border border-error/20 hover:border-transparent text-error hover:text-on-error px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs active:scale-95 transition-all shadow-sm duration-300 cursor-pointer"
                    >
                      {isProcessing ? (
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">unpublished</span>
                          Unpublish & Reject
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleApprove(item.id)}
                      className="w-full bg-green-600 text-white px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:bg-green-700 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      {isProcessing ? (
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">publish</span>
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
      )}
    </div>
  );
}
