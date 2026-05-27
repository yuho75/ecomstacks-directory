'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ManageListingsPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    
    // Simply redirect to the dashboard with the email as a query parameter
    router.push(`/manage/dashboard?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-gutter">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-outline-variant">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">Find My Listings</h1>
            <p className="text-neutral-500 text-sm">
              Enter the email you used to submit your tools. We will show you all the tools registered under this email.
            </p>
          </div>

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
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white hover:bg-neutral-800 font-bold px-4 py-3 rounded-lg transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find My Tools
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
