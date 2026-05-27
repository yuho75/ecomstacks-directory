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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-md py-sm rounded-lg font-label-md hover:brightness-110 active:scale-95 transition-all text-sm shrink-0"
        >
          Write a Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-primary/40 mb-xs">rate_review</span>
          <p className="font-body-md text-on-surface-variant mb-md">
            아직 작성된 리뷰가 없습니다. 이 툴을 사용해 보셨나요? 첫 번째 리뷰를 남겨주세요!
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-xs text-primary font-label-md hover:underline bg-primary/10 px-md py-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            리뷰 작성하기
          </button>
        </div>
      ) : (
        <div className="flex gap-md overflow-x-auto pb-md custom-scrollbar">
          {reviews.map(review => (
            <div key={review.id} className="min-w-[320px] bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow shrink-0 flex flex-col justify-between">
              <div>
                <div className="flex gap-xs mb-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`material-symbols-outlined text-[18px] ${review.rating >= s ? 'text-tertiary-container' : 'text-outline-variant'}`} style={{ fontVariationSettings: review.rating >= s ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  ))}
                </div>
                <p className="font-body-md text-on-surface-variant mb-md italic leading-relaxed whitespace-pre-wrap">
                  "{review.content}"
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/30 pt-sm mt-sm">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">{review.author}</span>
                <span className="font-label-sm text-[12px] text-neutral-400">{formatDate(review.created_at)}</span>
              </div>
            </div>
          ))}
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
