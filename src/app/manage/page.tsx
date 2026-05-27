'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ManageListingsPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/manage/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('A magic link has been sent to your email. Click it to access your dashboard.');
        
        // For development environment bypass
        if (data.isMock && data.editUrl) {
           console.log("Mock URL:", data.editUrl);
           // In mock mode, automatically redirect after 2s for ease of testing
           setTimeout(() => {
             window.location.href = data.editUrl;
           }, 2000);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send magic link.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-gutter">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-outline-variant">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">Manage My Listings</h1>
            <p className="text-neutral-500 text-sm">
              Enter the email you used to submit your tools. We will send you a secure magic link to access your dashboard.
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-100 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check your inbox
              </div>
              <p>{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-1">
                  Registered Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-black placeholder-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && (
                <div className="text-rose-500 text-sm font-medium">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-black text-white hover:bg-neutral-800 font-bold px-4 py-3 rounded-lg transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <span className="opacity-80">Sending...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Send Magic Link
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
