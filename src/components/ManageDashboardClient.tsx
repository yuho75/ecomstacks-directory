'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ToolCard from '@/components/ToolCard';

interface DashboardGridProps {
  items: any[];
  email: string;
}

export default function DashboardGrid({ items, email }: DashboardGridProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/manage/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-container-max mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface">My Listings</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Managing tools for <strong>{email}</strong>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-neutral-500 hover:text-rose-500 transition-colors border border-outline-variant px-4 py-2 rounded-lg bg-white"
        >
          Logout
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white border border-outline-variant rounded-xl shadow-sm">
          <p className="text-neutral-500 mb-4">No tools found for this email address.</p>
          <button
            onClick={() => router.push('/?submit=true')}
            className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
          >
            Submit a Tool
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <ToolCard 
              key={item.id} 
              item={item} 
              onEditClick={() => router.push(`/items/${item.id}/edit`)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
