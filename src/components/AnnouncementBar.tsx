'use client';

import React, { useState } from 'react';

export default function AnnouncementBar() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email.');
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        if (res.status === 409) {
          setMessage('Already subscribed.');
        } else {
          setMessage(data.error || 'Subscription failed.');
        }
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="w-full bg-[#09090b] text-neutral-200 border-b border-neutral-800 py-2.5 px-gutter z-50 pointer-events-auto">
      <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-center">
        <div className="flex items-center flex-wrap justify-center gap-2">
          <span className="inline-flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold animate-pulse">
            NEWSLETTER
          </span>
          <span className="text-[12px] text-neutral-300 font-medium tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Get high-converting e-commerce growth tools in your inbox monthly!
          </span>
        </div>
        
        <div className="flex items-center shrink-0 min-h-[28px]">
          {status === 'success' ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[12px] font-bold animate-in fade-in duration-300">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Subscribed successfully!
            </span>
          ) : status === 'error' ? (
            <span className="inline-flex items-center gap-1.5 text-rose-400 text-[12px] font-bold animate-in fade-in duration-300">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {message}
            </span>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                id="announcement-email-input"
                type="email"
                required
                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Please fill out this field.')}
                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading'}
                className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-1 text-[11px] text-white placeholder-neutral-500 focus:outline-none focus:border-primary w-40 sm:w-48 transition-all duration-200 h-7"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-white hover:bg-neutral-200 text-black font-extrabold px-3 py-1 rounded-md text-[11px] transition-all duration-150 active:scale-95 duration-100 flex items-center justify-center shrink-0 h-7"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
