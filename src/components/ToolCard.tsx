'use client';

import React from 'react';
import Link from 'next/link';
import { getOptimizedCloudinaryUrl } from '@/lib/utils';

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
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-on-surface/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-on-surface font-label-md bg-white/90 px-md py-sm rounded-lg backdrop-blur shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            View Details
          </span>
        </div>
      </Link>

      {/* Info Area */}
      <div className="p-md flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-start gap-xs mb-xs">
            <h3 className="font-headline-md text-[18px] text-on-surface font-bold line-clamp-1">
              <Link href={`/items/${item.id}`} className="hover:text-primary transition-colors">
                {item.title}
              </Link>
            </h3>
            <span className="bg-surface-container text-on-secondary-container px-xs py-xs rounded font-label-sm text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0">
              {displayCategory}
            </span>
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
            className="inline-flex items-center gap-xs font-label-sm text-label-sm text-primary hover:underline group/link"
          >
            Visit Website 
            <span className="material-symbols-outlined text-[16px] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform">
              north_east
            </span>
          </a>
          
          <Link 
            href={`/items/${item.id}`}
            className="text-on-surface-variant hover:text-primary text-[12px] font-medium flex items-center gap-xs transition-colors"
          >
            Learn More
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
