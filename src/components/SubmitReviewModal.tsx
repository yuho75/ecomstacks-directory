'use client';

import React, { useState } from 'react';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
}

export default function SubmitReviewModal({ isOpen, onClose, itemId, itemTitle }: SubmitReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  // Honeypot field - should be left empty by real users
  const [website, setWebsite] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Honeypot check (bot protection)
    if (website !== '') {
      // Silently pretend it worked for bots
      setSuccess(true);
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!author.trim() || !content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          author,
          rating,
          content
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // Reset form after closing
          setTimeout(() => {
            setSuccess(false);
            setRating(0);
            setAuthor('');
            setContent('');
          }, 300);
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isSubmitting && !success ? onClose : undefined}
      ></div>
      
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/50">
          <div>
            <h2 className="font-headline-md text-[20px] font-bold text-on-surface">Write a Review</h2>
            <p className="font-body-sm text-on-surface-variant line-clamp-1 text-sm mt-0.5">
              For {itemTitle}
            </p>
          </div>
          {!isSubmitting && !success && (
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant focus:outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        <div className="p-lg">
          {success ? (
            <div className="text-center py-xl">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-md animate-bounce">
                <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="font-headline-md text-on-surface font-bold mb-xs">Review Submitted!</h3>
              <p className="font-body-md text-on-surface-variant">
                Thank you for your feedback. Your review is pending approval and will appear shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-md">
              {/* Star Rating */}
              <div className="flex flex-col items-center mb-6">
                <p className="font-label-md text-on-surface-variant mb-2">Select your rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <span 
                        className={`material-symbols-outlined text-[36px] transition-colors ${
                          (hoveredRating || rating) >= star 
                            ? "text-tertiary-container" 
                            : "text-outline-variant"
                        }`} 
                        style={{ fontVariationSettings: (hoveredRating || rating) >= star ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-label-md text-on-surface mb-xs">Your Name</label>
                <input 
                  type="text" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Jessica H. - Content Lead"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>

              {/* Honeypot field (hidden from screen readers and visual users) */}
              <div className="opacity-0 absolute top-0 left-0 h-0 w-0 z-[-1] overflow-hidden" aria-hidden="true">
                <label>Website</label>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              <div>
                <label className="block font-label-md text-on-surface mb-xs">Review Content</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Share your experience using ${itemTitle}...`}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors h-32 resize-none"
                  required
                ></textarea>
              </div>

              {error && (
                <div className="bg-error/10 text-error px-md py-sm rounded-lg font-body-sm flex items-start gap-xs">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                  <p>{error}</p>
                </div>
              )}

              <div className="pt-sm">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white px-md py-sm rounded-lg font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-xs shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
