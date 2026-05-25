'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-container-low to-primary/5 flex flex-col justify-between">
      {/* Header / Nav Anchor */}
      <header className="w-full shrink-0 max-w-5xl mx-auto px-gutter py-md">
        <Link href="/" className="inline-flex items-center gap-xs font-bold text-on-surface group">
          <div className="relative w-8 h-8 flex items-center justify-center bg-black rounded-md shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L21 7.5L12 12L3 7.5L12 3Z" fill="currentColor" fillOpacity="0.2" />
              <path d="M3 12L12 16.5L21 12" />
              <path d="M3 16.5L12 21L21 16.5" />
            </svg>
          </div>
          <span 
            className="text-[20px] font-extrabold tracking-[-0.045em] text-on-surface" 
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ecom<span className="text-on-surface-variant">Stacks</span>
          </span>
        </Link>
      </header>

      {/* Main Focus Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-gutter py-12 md:py-16">
        <div className="w-full max-w-[440px]">
          
          {/* Card Container */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {status !== 'success' ? (
              <>
                {/* Heading */}
                <h1 
                  className="text-2xl font-extrabold text-on-surface tracking-tight mb-2 text-center" 
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Monthly Growth Toolkit
                </h1>
                <p className="text-sm text-on-surface-variant text-center leading-relaxed mb-6">
                  Get the best new e-commerce growth tools delivered directly to your inbox. Once a month. Zero spam.
                </p>

                {/* Core Benefits */}
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5 select-none">
                      check_circle
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface leading-tight">100% Curated Tools</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Hand-picked micro-tools proven to double visual and store conversion rates.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5 select-none">
                      check_circle
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface leading-tight">Monthly Digest</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Only 1 high-value digest email sent at the start of each month. Zero spam, zero noise.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5 select-none">
                      check_circle
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface leading-tight">Autopilot Unsubscribe</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Instantly, automatically unsubscribe with a single click at any time.
                      </p>
                    </div>
                  </li>
                </ul>

                {/* Subscription Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input 
                      type="email"
                      required
                      disabled={status === 'loading'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-surface-container border border-outline-variant/60 rounded-xl px-4 py-3.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-xs text-error font-medium flex items-center gap-1.5 animate-shake">
                      <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-primary hover:bg-primary/95 text-on-primary font-bold py-3.5 px-4 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 select-none shadow-md cursor-pointer"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subscribing...
                      </>
                    ) : (
                      'Subscribe to Toolkit'
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-400">
                <div className="w-14 h-14 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                  <span className="material-symbols-outlined text-[28px] font-bold">check</span>
                </div>
                <h2 
                  className="text-2xl font-extrabold text-on-surface tracking-tight mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  You&apos;re Subscribed! 🎉
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto mb-6">
                  We&apos;ve sent a welcome e-commerce toolkit email to <span className="font-semibold text-on-surface bg-on-surface/5 px-1.5 py-0.5 rounded">{email}</span>.
                </p>
                <div className="space-y-3">
                  <Link 
                    href="/" 
                    className="inline-block w-full bg-primary hover:bg-primary/95 text-on-primary font-bold py-3.5 px-4 rounded-xl text-sm transition-all active:scale-[0.98] shadow-md"
                  >
                    Return to Directory
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Minimal Bottom Nav */}
          <div className="mt-8 text-center text-xs text-on-surface-variant/60 flex items-center justify-center gap-md">
            <span>&copy; {new Date().getFullYear()} EcomStacks</span>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/30"></span>
            <Link href="/" className="hover:text-primary transition-colors font-medium">Home</Link>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/30"></span>
            <Link href="/pricing" className="hover:text-primary transition-colors font-medium">Pricing</Link>
          </div>

        </div>
      </main>

      {/* Spacer footer to maintain flex justify-between */}
      <footer className="w-full shrink-0 py-6"></footer>
    </div>
  );
}
