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
  secretKey: string;
}

export default function AdminPanel({ initialPending, secretKey }: AdminPanelProps) {
  const [items, setItems] = useState<Item[]>(initialPending);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setError(null);
    setSuccess(null);
    try {
      await approveItem(id, secretKey);
      setSuccess('Item successfully approved and published!');
      // Remove item from pending list with a slight delay for smooth visual transition
      setTimeout(() => {
        setItems(prev => prev.filter(item => item.id !== id));
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
      setSuccess('Item successfully rejected.');
      // Remove item from pending list
      setTimeout(() => {
        setItems(prev => prev.filter(item => item.id !== id));
        setSuccess(null);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reject item.');
    } finally {
      setProcessingId(null);
    }
  };

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

      {items.length === 0 ? (
        <div className="text-center py-xl border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
          <span className="material-symbols-outlined text-[64px] text-primary mb-xs">verified_user</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">Queue is Empty</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto mt-xs">
            There are no pending submissions requiring administrator verification at the moment. All caught up!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-md">
          {items.map(item => {
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
                <div className="flex sm:flex-row md:flex-col gap-base w-full md:w-auto self-stretch justify-end shrink-0 pt-md md:pt-0 md:border-l md:border-outline-variant md:pl-md">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleApprove(item.id)}
                    className="flex-1 bg-green-600 text-white px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:bg-green-700 active:scale-95 transition-all shadow-sm"
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
                    className="flex-1 bg-error text-white px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:brightness-110 active:scale-95 transition-all shadow-sm"
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
