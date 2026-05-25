import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Pricing - EcomStacks',
  description: 'Simple, transparent pricing to list your e-commerce tool on EcomStacks directory.',
};

export default function PricingPage() {
  const isPaypalEnabled = process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-md md:px-xl py-24 flex flex-col items-center">
        <div className="text-center max-w-2xl mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1
            className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Reach 10,000+ E-Commerce Founders
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Get your tool in front of the right audience. Choose a plan that fits your growth stage.{' '}
            <br className="hidden md:block" /> No hidden fees, cancel anytime.
          </p>
          {!isPaypalEnabled && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-[16px]">celebration</span>
              Early Bird Special — Standard listing is FREE right now!
            </div>
          )}
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">

          {/* ── Standard ── */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 flex flex-col hover:border-outline transition-colors relative">
            {!isPaypalEnabled && (
              <div className="absolute -top-3 left-8 bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1 rounded-full">
                Phase 1 Special
              </div>
            )}
            <h3 className="text-xl font-bold text-on-surface mb-2">Standard</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">
              Permanent directory listing for early-stage tools.
            </p>

            {isPaypalEnabled ? (
              /* PAID MODE */
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-on-surface">$9.99</span>
                <span className="text-on-surface-variant ml-2 text-sm">one-time</span>
              </div>
            ) : (
              /* FREE MODE */
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-on-surface">Free</span>
                <span className="text-on-surface-variant line-through text-base">$9.99</span>
              </div>
            )}

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
                <span className="text-sm text-on-surface">Approval in 2–4 weeks</span>
              </li>
            </ul>

            <Link
              href="/?submit=true&tier=standard"
              className="w-full py-3 rounded-xl bg-primary text-white font-bold text-center transition-colors hover:brightness-110 active:scale-95"
            >
              {isPaypalEnabled ? 'Get Listed — $9.99' : 'Submit for Free'}
            </Link>
          </div>

          {/* ── Featured ── */}
          <div className="bg-primary/5 border-2 border-primary rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-xl">
            <div className="absolute -top-4 inset-x-0 flex justify-center">
              <span className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                Most Popular
              </span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Featured</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">
              Max visibility to drive immediate traffic and signups.
            </p>
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
                <span className="text-sm text-on-surface font-medium">Highlight border &amp; large thumbnail</span>
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

            {isPaypalEnabled ? (
              <Link
                href="/?submit=true&tier=featured"
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-center transition-colors hover:brightness-110 active:scale-95"
              >
                Get Featured — $49/mo
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-primary/40 text-white font-bold text-center cursor-not-allowed select-none"
              >
                Coming Soon
              </button>
            )}
          </div>

          {/* ── Premium Launch ── */}
          <div
            className={`bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 flex flex-col hover:border-outline transition-colors relative ${
              !isPaypalEnabled ? 'opacity-75' : ''
            }`}
          >
            <h3 className="text-xl font-bold text-on-surface mb-2">Premium Launch</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">
              The ultimate launch package for serious software companies.
            </p>
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
                <span className="text-sm text-on-surface">Twitter &amp; LinkedIn Promotion</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface">1 Month Featured Placement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span className="text-sm text-on-surface">Everything in Featured</span>
              </li>
            </ul>

            {isPaypalEnabled ? (
              <Link
                href="/?submit=true&tier=premium"
                className="w-full py-3 rounded-xl bg-on-surface text-surface font-bold text-center transition-colors hover:brightness-90 active:scale-95"
              >
                Launch Premium — $199
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-surface-container text-on-surface-variant font-bold text-center cursor-not-allowed select-none"
              >
                Coming Soon
              </button>
            )}
          </div>

        </div>

        {/* FAQ / Trust Signals */}
        {!isPaypalEnabled && (
          <div className="mt-16 max-w-2xl text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-on-surface-variant text-sm">
              ⚡ <strong>Early Bird Phase:</strong> We&apos;re in launch mode. Standard listings are completely free while we grow the directory to 10,000+ visitors. Featured &amp; Premium plans are coming soon.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
