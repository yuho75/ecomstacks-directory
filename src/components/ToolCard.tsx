'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getOptimizedCloudinaryUrl } from '@/lib/utils';
import RequestEditModal from './RequestEditModal';

interface Item {
  id: string;
  title: string;
  url: string;
  description: string;
  image_url: string;
  category: string;
  email: string;
  status: string;
  tier?: string;
  created_at: string;
}

interface ToolCardProps {
  item: Item;
}

export default function ToolCard({ item }: ToolCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Apply Cloudinary real-time URL transformer for speed
  const optimizedImageSrc = getOptimizedCloudinaryUrl(item.image_url);

  // Format category text to display cleanly
  const displayCategory = item.category || 'Visual & Design';

  const isPremiumOrFeatured = item.tier === 'premium' || item.tier === 'featured';

  return (
    <div className={`rounded-xl overflow-hidden tool-card-shadow transition-all duration-300 group flex h-full ${
      isPremiumOrFeatured
        ? `flex-col sm:flex-row col-span-1 sm:col-span-2 md:col-span-2 hover:-translate-y-1.5 ${
            item.tier === 'premium'
              ? 'bg-gradient-to-br from-amber-500/[0.04] via-surface-container-lowest to-amber-500/[0.01] border-2 border-amber-500/40 shadow-md hover:border-amber-500 hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)]'
              : 'bg-gradient-to-br from-primary/[0.04] via-surface-container-lowest to-primary/[0.01] border-2 border-primary/40 shadow-md hover:border-primary hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)]'
          }`
        : 'bg-surface-container-lowest flex-col col-span-1 border border-outline-variant tool-card-hover'
    }`}>
      {/* Thumbnail Area */}
      <Link 
        href={`/items/${item.id}`} 
        className={`${
          isPremiumOrFeatured
            ? 'w-full sm:w-[45%] h-auto sm:h-full aspect-video sm:aspect-auto'
            : 'w-full aspect-video'
        } relative overflow-hidden bg-surface-container-high block shrink-0`}
      >
        <img 
          src={optimizedImageSrc} 
          alt={`${item.title} Screenshot`} 
          className="w-full h-full object-cover brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500" 
          loading="lazy"
        />
      </Link>

      {/* Info Area */}
      <div className={`p-md flex flex-col justify-between flex-grow ${
        isPremiumOrFeatured ? 'w-full sm:w-[55%]' : 'w-full'
      }`}>
        <div>
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex flex-wrap items-center gap-xs">
              <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-label-sm text-[10px] uppercase tracking-wider whitespace-nowrap border border-outline-variant/30">
                {displayCategory}
              </span>
              {item.tier === 'premium' && (
                <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-[3px] shadow-sm select-none border border-amber-400/30 animate-pulse">
                  <span className="material-symbols-outlined text-[12px] font-bold">diamond</span>
                  Premium Sponsor
                </span>
              )}
              {item.tier === 'featured' && (
                <span className="bg-gradient-to-r from-indigo-600 via-primary to-blue-500 text-white px-2 py-0.5 rounded font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-[3px] shadow-sm select-none border border-primary/20">
                  <span className="material-symbols-outlined text-[12px] font-bold">workspace_premium</span>
                  Featured Sponsor
                </span>
              )}
            </div>
            <h3 className={`font-headline-md text-on-surface font-bold line-clamp-1 min-w-0 ${
              isPremiumOrFeatured ? 'text-[20px] sm:text-[23px] tracking-tight font-extrabold mt-1' : 'text-[18px]'
            }`}>
              <Link href={`/items/${item.id}`} className="hover:text-primary transition-colors">
                {item.title}
              </Link>
            </h3>
          </div>
          <p className={`font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-2 min-h-[40px] ${
            isPremiumOrFeatured ? 'sm:text-[15px] sm:leading-[22px] text-on-surface/85' : ''
          }`}>
            {item.description}
          </p>
        </div>

        <div className="pt-sm border-t border-outline-variant/60 flex justify-between items-center shrink-0">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-xs font-label-sm text-label-sm text-primary group/link"
          >
            Visit Website 
          </a>
          
          <div className="flex items-center gap-xs">
            <button
              onClick={() => setIsEditOpen(true)}
              className="text-neutral-400 hover:text-neutral-700 text-[12px] font-medium flex items-center gap-xs transition-colors focus:outline-none"
              title="Request edit link"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit
            </button>
            <span className="text-neutral-300 select-none">|</span>
            <Link 
              href={`/items/${item.id}`}
              className="text-on-surface-variant hover:text-primary text-[12px] font-medium flex items-center gap-xs transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      <RequestEditModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        itemId={item.id} 
        itemTitle={item.title} 
      />
    </div>
  );
}
