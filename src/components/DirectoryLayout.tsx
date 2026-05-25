'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import SubmissionModal from '@/components/SubmissionModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Tier = 'standard' | 'featured' | 'premium';

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
  const [defaultTier, setDefaultTier] = useState<Tier>('standard');
  const [itemsList, setItemsList] = useState<Item[]>(initialItems);
  const [visibleCount, setVisibleCount] = useState(12);

  const isPaypalEnabled = process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true';

  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory]);

  useEffect(() => {
    // Clear any lingering admin entry keys when the user lands on the homepage
    sessionStorage.removeItem('allow_admin_access');

    // Handle auto-opening of submission modal via query parameters (e.g. from Pricing page)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('submit') === 'true') {
      // Optionally pre-select a tier if ?tier=featured etc.
      const tierParam = urlParams.get('tier') as Tier | null;
      if (tierParam && ['standard', 'featured', 'premium'].includes(tierParam)) {
        setDefaultTier(tierParam);
      }
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

  const handleOpenModal = (tier: Tier = 'standard') => {
    setDefaultTier(tier);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* TopNavBar */}
      <Header onSubmitClick={() => handleOpenModal('standard')} />

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
          <div className="flex justify-center">
            <button
              onClick={() => handleOpenModal('standard')}
              className="bg-primary-container text-on-primary hover:bg-primary px-xl py-md rounded-lg font-label-md text-label-md shadow-lg transition-all active:scale-95 duration-100"
            >
              {isPaypalEnabled ? 'Submit Your Tool' : 'Submit Your Tool (Free)'}
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
              <div className="mb-xl">
                {/* Minimal Elegant Section Header */}
                <div className="flex items-center gap-xs mb-base select-none">
                  <span className="material-symbols-outlined text-[20px] text-primary animate-pulse">stars</span>
                  <h2 className="font-extrabold text-[15px] uppercase tracking-wider text-on-surface" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Featured Sponsors
                  </h2>
                  <div className="flex-grow h-[1px] bg-outline-variant/50 ml-sm"></div>
                </div>
                
                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md animate-in fade-in duration-500">
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
                  onClick={() => setVisibleCount(prev => prev + 12)}
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
      <Footer />

      {/* Submission Modal Wrapper */}
      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefreshData}
        defaultTier={defaultTier}
      />
    </>
  );
}
