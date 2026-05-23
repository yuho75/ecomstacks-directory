import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - EcomStacks',
  description: 'Pricing plans for EcomStacks directory listing.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant shadow-sm shrink-0">
        <div className="max-w-container-max w-full mx-auto px-gutter h-20 flex justify-between items-center">
          <div className="flex items-center gap-base">
            <Link 
              href="/" 
              className="flex items-center gap-xs font-bold text-on-surface hover:text-primary transition-colors select-none group"
            >
              <div className="relative w-8 h-8 flex items-center justify-center bg-black rounded-md shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L21 7.5L12 12L3 7.5L12 3Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M3 12L12 16.5L21 12" />
                  <path d="M3 16.5L12 21L21 16.5" />
                </svg>
              </div>
              <span 
                className="text-[22px] font-extrabold tracking-[-0.045em] text-on-surface select-none" 
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Ecom<span className="text-on-surface-variant">Stacks</span>
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-lg">
            <Link 
              href="/" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black transition-colors py-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Tools
            </Link>
            <Link 
              href="/pricing" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-black transition-colors py-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Pricing
            </Link>
            <Link 
              href="/#footer-anchor" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black transition-colors py-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Subscribe
            </Link>
          </nav>
          <Link 
            href="/"
            className="bg-primary-container text-on-primary hover:bg-primary px-md py-sm rounded-lg font-label-md text-label-md transition-all active:scale-95 duration-100 shadow-sm"
          >
            Submit Your Tool (Free)
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-md md:px-xl py-24 flex flex-col items-center">
        <div className="text-center max-w-2xl mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Reach 10,000+ E-Commerce Founders
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Get your tool in front of the right audience. Choose a plan that fits your growth stage. 
            <br className="hidden md:block"/> No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          
          {/* Standard */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 flex flex-col hover:border-outline transition-colors relative">
            <div className="absolute -top-3 left-8 bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1 rounded-full">
              Phase 1 Special
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Standard</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">Permanent directory listing for early-stage tools.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-on-surface">Free</span>
              <span className="text-on-surface-variant ml-2 line-through">$9.99</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface">Permanent Do-follow link</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface">Standard directory placement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface">Approval in 2-4 weeks</span>
              </li>
            </ul>
            <Link 
              href="/"
              className="w-full py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-center transition-colors"
            >
              Submit for Free
            </Link>
          </div>

          {/* Featured */}
          <div className="bg-primary/5 border-2 border-primary rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-xl">
            <div className="absolute -top-4 inset-x-0 flex justify-center">
              <span className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                Most Popular
              </span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Featured</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">Max visibility to drive immediate traffic and signups.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-on-surface">$49</span>
              <span className="text-on-surface-variant ml-2">/ month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface font-medium">Pinned to top of homepage</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface font-medium">Highlight border & large thumbnail</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface font-medium">Approval in 24 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface font-medium">Everything in Standard</span>
              </li>
            </ul>
            <button 
              disabled
              className="w-full py-3 rounded-xl bg-primary/50 text-white font-bold text-center cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          {/* Premium Launch */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 flex flex-col hover:border-outline transition-colors relative opacity-80">
            <h3 className="text-xl font-bold text-on-surface mb-2">Premium Launch</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">The ultimate launch package for serious software companies.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-on-surface">$199</span>
              <span className="text-on-surface-variant ml-2">one-time</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface">Dedicated Newsletter Shoutout</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface">Twitter & LinkedIn Promotion</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface">1 Month Featured Placement</span>
              </li>
            </ul>
            <button 
              disabled
              className="w-full py-3 rounded-xl bg-surface-container text-on-surface-variant font-bold text-center cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
