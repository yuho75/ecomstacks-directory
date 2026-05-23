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
              href="/pricing" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black transition-colors py-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Pricing
            </Link>
            <Link 
              href="/" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-black transition-colors py-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Tools
            </Link>
            <a 
              href="#footer-anchor" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black transition-colors py-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('footer-anchor')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                  const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
                  if (emailInput) emailInput.focus();
                }, 800);
              }}
            >
              Subscribe
            </a>
          </nav>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-container text-on-primary hover:bg-primary px-md py-sm rounded-lg font-label-md text-label-md transition-all active:scale-95 duration-100 shadow-sm"
          >
            Submit Your Tool (Free)
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
            {/* Featured Section */}
            {displayedTools.filter(t => t.tier === 'featured' || t.tier === 'premium').length > 0 && (
              <div className="mb-xl p-md md:p-lg bg-primary/5 border-2 border-primary rounded-2xl relative shadow-sm">
                <div className="absolute -top-3.5 left-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  Featured Tools
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md animate-in fade-in duration-500">
                  {displayedTools.filter(t => t.tier === 'featured' || t.tier === 'premium').map((tool) => (
                    <ToolCard key={tool.id} item={tool} />
                  ))}
                </div>
              </div>
            )}

            {/* Standard Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md animate-in fade-in duration-500">
              {displayedTools.filter(t => !t.tier || t.tier === 'standard').map((tool) => (
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
