'use client';

import React, { useState } from 'react';
import SubmitReviewModal from './SubmitReviewModal';
import { formatDate } from '@/lib/utils';

interface Review {
  id: string;
  item_id: string;
  author: string;
  rating: number;
  content: string;
  created_at: string;
}

interface ItemReviewsProps {
  itemId: string;
  itemTitle: string;
  reviews: Review[];
}

export default function ItemReviews({ itemId, itemTitle, reviews }: ItemReviewsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex gap-xs items-center mt-1">
              <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-bold">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
              <span className="text-on-surface-variant text-body-sm">({reviews.length} verified reviews)</span>
            </div>
          )}
        </div>
        {reviews.length > 0 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-md py-sm rounded-lg font-label-md hover:brightness-110 active:scale-95 transition-all text-sm shrink-0"
          >
            Write a Review
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant/60 rounded-xl p-md flex flex-col sm:flex-row items-center justify-between gap-md animate-in fade-in duration-300">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px] text-primary">rate_review</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">No Reviews Yet</h3>
              <p className="font-body-sm text-on-surface-variant mt-0.5">
                Be the first to share your experience and help other founders!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-xs bg-primary text-white font-label-md px-md py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-sm shrink-0 w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">edit_square</span>
            Write a Review
          </button>
        </div>
      ) : (
        <div className="space-y-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(showAll ? reviews : reviews.slice(0, 4)).map(review => (
              <div key={review.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-[2px] mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`material-symbols-outlined text-[15px] ${review.rating >= s ? 'text-tertiary-container' : 'text-outline-variant'}`} style={{ fontVariationSettings: review.rating >= s ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    ))}
                  </div>
                  <p className="text-[13px] text-on-surface-variant mb-3 italic leading-snug whitespace-pre-wrap">
                    "{review.content}"
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/50 pt-2 mt-auto">
                  <span className="text-[12px] text-on-surface font-semibold">{review.author}</span>
                  <span className="text-[11px] text-neutral-400">{formatDate(review.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
          {reviews.length > 4 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 bg-surface-container-low hover:bg-surface-container-high transition-colors rounded-xl border border-outline-variant font-label-md text-on-surface flex items-center justify-center gap-2"
            >
              <span>Show {reviews.length - 4} more reviews</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          )}
        </div>
      )}

      <SubmitReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        itemId={itemId}
        itemTitle={itemTitle}
      />
    </section>
  );
}
