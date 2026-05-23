'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import SubmissionModal from '@/components/SubmissionModal';
import Header from '@/components/Header';

interface Item {
  id: string;
  title: string;
  url: string;
  description: string;
  image_url: string;
  category: string;
  email: string;
  status: string;
  tier?: string;
  created_at: string;
}

interface DirectoryLayoutProps {
  initialItems: Item[];
}

const CATEGORIES = [
  'All',
  'Visual & Design',
  'Copywriting & Marketing',
  'Store Optimization',
  'Automation'
];

export default function DirectoryLayout({ initialItems }: DirectoryLayoutProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemsList, setItemsList] = useState<Item[]>(initialItems);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    setVisibleCount(8);
  }, [activeCategory]);

  useEffect(() => {
    // Clear any lingering admin entry keys when the user lands on the homepage
    sessionStorage.removeItem('allow_admin_access');

    // Handle auto-opening of submission modal via query parameters (e.g. from Pricing page)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('submit') === 'true') {
      setIsModalOpen(true);
      // Remove query param from URL without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const allTools = [...itemsList];

  // Sort by created_at DESC (Newest first) so that recently registered sites show at the top!
  allTools.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter tools based on selected activeCategory tab
  const filteredTools = allTools.filter(tool => {
    if (activeCategory === 'All') return true;
    return tool.category.toLowerCase().trim() === activeCategory.toLowerCase().trim();
  });

  const featuredTools = filteredTools.filter(t => t.tier === 'featured' || t.tier === 'premium');
  const standardTools = filteredTools.filter(t => !t.tier || t.tier === 'standard');
  const displayedStandardTools = standardTools.slice(0, visibleCount);

  const handleRefreshData = async () => {
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        setItemsList(data);
      }
    } catch (e) {
      console.error("Failed to silently update list data", e);
    }
  };

  return (
    <>
      {/* TopNavBar */}
      <Header onSubmitClick={() => setIsModalOpen(true)} />

      {/* Main Container */}
      <main className="max-w-container-max w-full mx-auto px-gutter pb-xl flex-grow">
        {/* Hero Section */}
        <section className="pt-md pb-sm md:pt-lg md:pb-md text-center flex flex-col items-center max-w-4xl mx-auto">
          <h1 
            className="font-extrabold text-[44px] md:text-[56px] tracking-[-0.05em] leading-[1.1] text-on-surface mb-sm select-none" 
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ecom<span className="text-on-surface-variant">Stacks</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-md">
            Double your revenue with a curated directory of high-converting micro-tools built specifically for 1-person brands, Shopify builders, and e-commerce growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-base">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-container text-on-primary hover:bg-primary px-lg py-md rounded-lg font-label-md text-label-md shadow-lg transition-all active:scale-95 duration-100"
            >
              Submit Your Tool (Free)
            </button>
            <button 
              onClick={() => document.getElementById('directory-anchor')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low px-lg py-md rounded-lg font-label-md text-label-md transition-all active:scale-95 duration-100"
            >
              Explore Directory
            </button>
          </div>
        </section>

        {/* Directory Anchor */}
        <div id="directory-anchor" className="scroll-mt-20"></div>

        {/* Filtering Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-sm mb-md border-b border-outline-variant pb-sm">
          {CATEGORIES.map(category => (
            <button 
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-md py-base rounded-full font-label-sm text-label-sm transition-all duration-200 select-none ${
                activeCategory === category 
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tool Card Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-xl border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-xs">search_off</span>
            <p className="font-headline-md text-headline-md text-on-surface">No Tools Found</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto mt-xs">
              There are no tools registered in the category &quot;{activeCategory}&quot; yet. Be the first to submit yours!
            </p>
          </div>
        ) : (
          <div className="space-y-md">
            {/* Featured Section */}
            {featuredTools.length > 0 && (
              <div className="mb-xl p-md md:p-lg bg-gradient-to-br from-surface-container-lowest to-primary/5 border-[3px] border-primary rounded-2xl relative shadow-[0_0_25px_rgba(59,130,246,0.25)]">
                <div className="absolute -top-4 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[13px] font-extrabold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-primary/40 z-10">
                  <span className="material-symbols-outlined text-[16px] animate-pulse text-yellow-300">stars</span>
                  FEATURED SPONSORS
                </div>
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md animate-in fade-in duration-500">
                  {featuredTools.map((tool) => (
                    <ToolCard key={tool.id} item={tool} />
                  ))}
                </div>
              </div>
            )}

            {/* Standard Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md animate-in fade-in duration-500">
              {displayedStandardTools.map((tool) => (
                <ToolCard key={tool.id} item={tool} />
              ))}
            </div>
            {standardTools.length > visibleCount && (
              <div className="flex justify-center pt-md">
                <button
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="group flex items-center justify-center gap-xs bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-primary px-lg py-md rounded-xl font-label-md text-label-md transition-all duration-300 active:scale-95 shadow-sm hover:shadow-lg border border-primary hover:border-transparent relative overflow-hidden"
                >
                  <span>Load More Tools</span>
                  <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:translate-y-1 group-hover:scale-110">
                    expand_more
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer id="footer-anchor" className="w-full bg-[#09090b] border-t border-neutral-800 shrink-0 py-xl">
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
              © {new Date().getFullYear()} EcomStacks. All rights reserved.
            </p>
          </div>

          {/* Newsletter Subscription */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-sm">
            <h4 className="text-white font-bold text-lg">Weekly E-Commerce Tools</h4>
            <p className="text-neutral-400 text-sm mb-2 max-w-xs">
              Join 1,000+ founders receiving the best new e-commerce growth tools directly in their inbox.
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
              <Link className="font-label-sm text-neutral-500 hover:text-white transition-colors" href="/pricing">Pricing</Link>
              <a className="font-label-sm text-neutral-500 hover:text-white transition-colors" href="#">Terms</a>
              <a className="font-label-sm text-neutral-500 hover:text-white transition-colors" href="#">Privacy</a>
            </nav>
          </div>
        </div>
      </footer>

      {/* Submission Modal Wrapper */}
      <SubmissionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefreshData}
      />
    </>
  );
}
