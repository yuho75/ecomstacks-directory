'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ToolCard from '@/components/ToolCard';
import SubmissionModal from '@/components/SubmissionModal';

interface Item {
  id: string;
  title: string;
  url: string;
  description: string;
  image_url: string;
  category: string;
  email: string;
  status: string;
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
  const router = useRouter();
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
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
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTime > 1500) {
      setLogoClicks(1);
    } else {
      const newCount = logoClicks + 1;
      if (newCount >= 7) {
        e.preventDefault();
        sessionStorage.setItem('allow_admin_access', 'true');
        router.push('/admin');
        return;
      }
      setLogoClicks(newCount);
    }
    setLastClickTime(now);
  };

  const allTools = [...itemsList];

  // Sort by created_at DESC (Newest first) so that recently registered sites show at the top!
  allTools.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter tools based on selected activeCategory tab
  const filteredTools = allTools.filter(tool => {
    if (activeCategory === 'All') return true;
    return tool.category.toLowerCase().trim() === activeCategory.toLowerCase().trim();
  });

  const displayedTools = filteredTools.slice(0, visibleCount);

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
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant shadow-sm shrink-0">
        <div className="max-w-container-max w-full mx-auto px-gutter h-20 flex justify-between items-center">
          <div className="flex items-center gap-base">
            <Link 
              href="/" 
              onClick={handleLogoClick}
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
              className="text-[15px] font-extrabold tracking-[-0.045em] text-black transition-colors py-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Tools
            </Link>
            <a 
              href="#directory-anchor" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black transition-colors py-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('directory-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Categories
            </a>
            <a 
              href="#footer-anchor" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black transition-colors py-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('footer-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Resources
            </a>
          </nav>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-container text-on-primary hover:bg-primary px-md py-sm rounded-lg font-label-md text-label-md transition-all active:scale-95 duration-100 shadow-sm"
          >
            Submit Your Tool ($9.99)
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-container-max w-full mx-auto px-gutter pb-xl flex-grow">
        {/* Hero Section */}
        <section className="py-xl md:py-[100px] text-center flex flex-col items-center max-w-4xl mx-auto">
          <h1 
            className="font-extrabold text-[52px] md:text-[64px] tracking-[-0.05em] leading-[1.1] text-on-surface mb-md select-none" 
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ecom<span className="text-on-surface-variant">Stacks</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-lg">
            Double your revenue with a curated directory of high-converting micro-tools built specifically for 1-person brands, Shopify builders, and e-commerce growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-base">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-container text-on-primary hover:bg-primary px-lg py-md rounded-lg font-label-md text-label-md shadow-lg transition-all active:scale-95 duration-100"
            >
              Submit Your Tool ($9.99)
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
        <div id="directory-anchor" className="scroll-mt-24"></div>

        {/* Filtering Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-sm mb-lg border-b border-outline-variant pb-md">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md animate-in fade-in duration-500">
              {displayedTools.map((tool) => (
                <ToolCard key={tool.id} item={tool} />
              ))}
            </div>
            {filteredTools.length > visibleCount && (
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
      <footer id="footer-anchor" className="w-full bg-[#09090b] border-t border-neutral-800 shrink-0 py-md">
        <div className="max-w-container-max w-full mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex flex-col md:flex-row items-center gap-sm md:gap-md text-center md:text-left">
            <div className="flex items-center gap-xs">
              <div className="relative w-7 h-7 flex items-center justify-center bg-black rounded shrink-0">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L21 7.5L12 12L3 7.5L12 3Z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M3 12L12 16.5L21 12" />
                  <path d="M3 16.5L12 21L21 16.5" />
                </svg>
              </div>
              <span 
                className="text-[20px] font-extrabold tracking-[-0.045em] text-white select-none" 
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Ecom<span className="text-neutral-400">Stacks</span>
              </span>
            </div>
            <span className="hidden md:inline text-neutral-600 text-sm">•</span>
            <p className="font-body-sm text-body-sm text-neutral-400">
              © {new Date().getFullYear()} EcomStacks. High-trust directory for e-commerce.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-md">
            <a className="font-label-sm text-label-sm text-neutral-400 hover:text-white transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-neutral-400 hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-neutral-400 hover:text-white transition-colors" href="#">Contact Support</a>
          </nav>
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
