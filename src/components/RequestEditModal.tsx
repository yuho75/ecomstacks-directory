'use client';

import React, { useState } from 'react';

interface RequestEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
}

export default function RequestEditModal({ isOpen, onClose, itemId, itemTitle }: RequestEditModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockUrl, setMockUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setMockUrl(null);

    try {
      const res = await fetch(`/api/items/${itemId}/request-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request. Please check the email.');
      }

      setSuccess(true);
      if (data.isMock && data.editUrl) {
        setMockUrl(data.editUrl);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    setError(null);
    setMockUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          if (!loading) handleClose();
        }}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 z-10 p-md md:p-lg flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant pb-sm mb-md shrink-0">
          <h2 className="font-headline-md text-headline-md text-on-surface">Edit Tool Listing</h2>
          <button 
            className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            onClick={handleClose}
            disabled={loading}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-md text-center space-y-sm">
            <span className="material-symbols-outlined text-[54px] text-green-500 animate-bounce">check_circle</span>
            <h3 className="font-title-lg text-title-lg text-on-surface">Magic Link Sent!</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              A secure one-time edit link has been sent to <strong>{email}</strong>.
            </p>
            <p className="font-body-sm text-body-sm text-neutral-500">
              Please check your inbox (and spam folder) to complete editing <strong>{itemTitle}</strong>.
            </p>

            {mockUrl && (
              <div className="mt-md w-full bg-primary-container/20 border border-primary/20 rounded-lg p-sm text-left">
                <span className="font-label-sm text-label-sm text-primary flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[16px]">bug_report</span>
                  Developer Mode Active
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
                  Since you are testing locally in Mock/Bypass mode, click the button below to bypass email sending and open the edit page directly:
                </p>
                <a 
                  href={mockUrl}
                  onClick={handleClose}
                  className="inline-flex w-full items-center justify-center bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] transition-all py-xs rounded-md font-label-md text-label-md"
                >
                  Bypass & Go to Edit Page
                </a>
              </div>
            )}

            <button 
              onClick={handleClose}
              className="mt-lg border border-outline-variant px-md py-xs rounded-lg font-label-md text-label-md hover:bg-neutral-100 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form className="space-y-md" onSubmit={handleSubmit}>
            <p className="font-body-md text-body-md text-on-surface-variant">
              To edit the details of <strong>{itemTitle}</strong>, please enter the submitter email registered with this tool. We will email you a secure link to access the editing form.
            </p>

            {error && (
              <div className="bg-error-container text-on-error-container p-xs rounded-lg font-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Registered Email Address</label>
              <input 
                className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                placeholder="you@example.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-sm justify-end pt-sm border-t border-outline-variant">
              <button 
                type="button"
                onClick={handleClose}
                className="border border-outline-variant px-md py-xs rounded-lg font-label-md text-label-md hover:bg-neutral-100 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all px-md py-xs rounded-lg font-label-md text-label-md flex items-center gap-xs"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Send Edit Link
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
