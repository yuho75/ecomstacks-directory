'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import SubmissionModal from '@/components/SubmissionModal';
import { SeedItem } from '@/lib/seeds';

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
  seedItems: SeedItem[];
}

const CATEGORIES = [
  'All',
  'Visual & Design',
  'Copywriting & Marketing',
  'Store Optimization',
  'Automation'
];

export default function DirectoryLayout({ initialItems, seedItems }: DirectoryLayoutProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemsList, setItemsList] = useState<Item[]>(initialItems);

  // Combine database items and seed items safely without duplicating IDs
  const combinedItemsMap = new Map<string, any>();
  
  // Seed items first
  seedItems.forEach(item => combinedItemsMap.set(item.id, item));
  // Database items overwrite if same ID, or append
  itemsList.forEach(item => combinedItemsMap.set(item.id, item));

  const allTools = Array.from(combinedItemsMap.values());

  // Filter tools based on selected activeCategory tab
  const filteredTools = allTools.filter(tool => {
    if (activeCategory === 'All') return true;
    return tool.category.toLowerCase().trim() === activeCategory.toLowerCase().trim();
  });

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
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-20 bg-surface-container-lowest border-b border-outline-variant shadow-sm shrink-0">
        <div className="flex items-center gap-base">
          <Link href="/" className="text-headline-md font-headline-md font-bold text-on-surface hover:text-primary transition-colors">
            EcomStacks
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <Link 
            href="/" 
            className="font-label-md text-label-md text-primary border-b-2 border-primary py-2 transition-colors"
          >
            Tools
          </Link>
          <a 
            href="#directory-anchor" 
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('directory-anchor')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Categories
          </a>
          <a 
            href="#footer-anchor" 
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
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
      </header>

      {/* Main Container */}
      <main className="max-w-container-max w-full mx-auto px-gutter pb-xl flex-grow">
        {/* Hero Section */}
        <section className="py-xl md:py-[100px] text-center flex flex-col items-center max-w-4xl mx-auto">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-md tracking-tight leading-tight">
            EcomStacks
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md animate-in fade-in duration-500">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} item={tool} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer id="footer-anchor" className="w-full py-xl px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-md border-t border-outline-variant bg-surface-container-low shrink-0">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <span className="font-headline-md text-[20px] font-bold text-on-surface">EcomStacks</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left">
            © {new Date().getFullYear()} EcomStacks. High-trust directory for e-commerce.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-md">
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors hover:underline" href="#">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors hover:underline" href="#">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors hover:underline" href="#">Contact Support</a>
        </nav>
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
