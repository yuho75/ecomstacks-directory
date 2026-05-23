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
}

export default function AdminPanel({ initialPending, initialApproved, initialRejected, secretKey = null }: AdminPanelProps) {
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
