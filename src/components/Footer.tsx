'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer-anchor" className="w-full bg-[#09090b] border-t border-neutral-800 shrink-0 py-xl mt-auto">
      <div className="max-w-container-max w-full mx-auto px-gutter grid grid-cols-1 md:grid-cols-2 gap-xl">
        {/* Brand & Copyright */}
        <div className="flex flex-col gap-md text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-xs">
            <div className="relative w-8 h-8 flex items-center justify-center bg-black rounded shrink-0 border border-neutral-800">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L21 7.5L12 12L3 7.5L12 3Z" fill="currentColor" fillOpacity="0.2" />
                <path d="M3 12L12 16.5L21 12" />
                <path d="M3 16.5L12 21L21 16.5" />
              </svg>
            </div>
            <span 
              className="text-[24px] font-extrabold tracking-[-0.045em] text-white select-none" 
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Ecom<span className="text-neutral-400">Stacks</span>
            </span>
          </div>
          <p className="font-body-md text-neutral-400 max-w-sm">
            Discover the best high-converting micro-tools built specifically for e-commerce growth.
          </p>
          <p className="font-body-sm text-neutral-600 mt-auto">
            &copy; {new Date().getFullYear()} EcomStacks. All rights reserved.
          </p>
        </div>

        {/* Newsletter Subscription */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-sm">
          <h4 className="text-white font-bold text-lg">Monthly E-Commerce Tools</h4>
          <p className="text-neutral-400 text-sm mb-2 max-w-xs">
            Get the best new e-commerce growth tools delivered directly to your inbox.
          </p>
          <form 
            className="flex w-full max-w-sm gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const emailInput = form.elements.namedItem('email') as HTMLInputElement;
              const email = emailInput.value;
              if (!email) return;
              try {
                const res = await fetch('/api/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                });
                if (res.ok) {
                  alert('Successfully subscribed!');
                  emailInput.value = '';
                } else {
                  alert('Failed to subscribe or already subscribed.');
                }
              } catch (err) {
                alert('Network error. Please try again.');
              }
            }}
          >
            <input 
              name="email"
              type="email" 
              required
              placeholder="you@example.com" 
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button 
              type="submit" 
              className="bg-white text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-neutral-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
          
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-md gap-y-2 mt-8">
            <Link className="font-label-sm text-neutral-500 hover:text-white transition-colors" href="/subscribe">Subscribe</Link>
            <Link className="font-label-sm text-neutral-500 hover:text-white transition-colors" href="/pricing">Pricing</Link>
            <Link className="font-label-sm text-neutral-500 hover:text-white transition-colors" href="/terms">Terms</Link>
            <Link className="font-label-sm text-neutral-500 hover:text-white transition-colors" href="/privacy">Privacy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
