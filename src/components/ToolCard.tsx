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

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden tool-card-shadow tool-card-hover transition-all group flex flex-col h-full">
      {/* Thumbnail Area */}
      <Link href={`/items/${item.id}`} className="aspect-video relative overflow-hidden bg-surface-container-high block shrink-0">
        <img 
          src={optimizedImageSrc} 
          alt={`${item.title} Screenshot`} 
          className="w-full h-full object-cover brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500" 
          loading="lazy"
        />
      </Link>

      {/* Info Area */}
      <div className="p-md flex flex-col justify-between flex-grow">
        <div>
          <div className="flex flex-col gap-1 mb-2">
            <div>
              <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-label-sm text-[10px] uppercase tracking-wider whitespace-nowrap border border-outline-variant/30">
                {displayCategory}
              </span>
            </div>
            <h3 className="font-headline-md text-[18px] text-on-surface font-bold line-clamp-1 min-w-0">
              <Link href={`/items/${item.id}`} className="hover:text-primary transition-colors">
                {item.title}
              </Link>
            </h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-2 min-h-[40px]">
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
