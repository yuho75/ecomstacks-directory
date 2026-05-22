import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SEED_ITEMS } from '@/lib/seeds';
import { getOptimizedCloudinaryUrl, formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

export const revalidate = 3600; // on-demand static generation with 1-hour background refresh fallback

interface PageProps {
  params: {
    id: string;
  };
}

// Fetch helper that merges database and seed items
async function getToolById(id: string) {
  // Check seeds first
  const seed = SEED_ITEMS.find((s) => s.id === id);
  if (seed) return seed;

  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
  
  if (isPlaceholder || isBypass) {
    try {
      const { getMockItemById } = await import('@/lib/mockDb');
      const mockItem = await getMockItemById(id);
      if (mockItem) return mockItem;
    } catch (e) {
      console.error('Error fetching item from Mock DB:', e);
    }
    return null;
  }

  // Otherwise, fetch from Supabase
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.error('Error fetching item by ID:', e);
  }
  return null;
}

// Fetch recommendations based on category
async function getRecommendations(category: string, currentId: string) {
  let dbItems: any[] = [];
  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (!isPlaceholder && !isBypass) {
    try {
      const { data } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'approved')
        .eq('category', category)
        .neq('id', currentId)
        .limit(3);
      if (data) dbItems = data;
    } catch (e) {
      console.error(e);
    }
  } else {
    try {
      const { getMockItems } = await import('@/lib/mockDb');
      const allMock = await getMockItems('approved');
      dbItems = allMock.filter(item => item.category === category && item.id !== currentId).slice(0, 3);
    } catch (e) {
      console.error('Error fetching recommendations from Mock DB:', e);
    }
  }

  // Combine with seed items in the same category
  const seedRecommendations = SEED_ITEMS.filter(
    (s) => s.category === category && s.id !== currentId
  );

  const combined = [...dbItems, ...seedRecommendations];
  // Remove duplicates and slice first 2
  const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  return unique.slice(0, 2);
}

// Generate dynamic SEO titles and metadata tags per product
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getToolById(params.id);
  if (!item) {
    return {
      title: 'Tool Not Found | EcomStacks',
    };
  }
  return {
    title: `${item.title} | EcomStacks Directory`,
    description: item.description,
    openGraph: {
      title: `${item.title} - Curated E-commerce Stack`,
      description: item.description,
      images: [{ url: item.image_url }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const item = await getToolById(params.id);

  if (!item) {
    notFound();
  }

  const recommendations = await getRecommendations(item.category, item.id);
  const optimizedImage = getOptimizedCloudinaryUrl(item.image_url);

  return (
    <>
      {/* TopNavBar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-20 bg-surface-container-lowest border-b border-outline-variant shadow-sm shrink-0">
        <div className="flex items-center gap-base">
          <Link href="/" className="text-headline-md font-headline-md font-bold text-on-surface">
            EcomStacks
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <Link href="/" className="font-label-md text-label-md text-primary border-b-2 border-primary py-2 px-1">
            Tools
          </Link>
          <Link href="/#directory-anchor" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2 px-1">
            Categories
          </Link>
          <Link href="/#footer-anchor" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2 px-1">
            Resources
          </Link>
        </nav>
        <Link href="/" className="bg-primary-container text-white px-md py-sm rounded-lg font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all block">
          Submit Your Tool ($9.99)
        </Link>
      </header>

      {/* Main content */}
      <main className="max-w-container-max w-full mx-auto px-gutter py-md flex-grow">
        {/* Back Button */}
        <div className="mb-md">
          <Link 
            href="/" 
            className="inline-flex items-center gap-xs bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Tools
          </Link>
        </div>

        {/* Hero Section Tool Card */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg tool-card-shadow flex flex-col md:flex-row gap-lg mb-xl">
          <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low group shrink-0">
            <img 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              src={optimizedImage} 
              alt={`${item.title} Screenshot Preview`}
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-sm mb-base">
              <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined">auto_fix_high</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">{item.title}</h1>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-md leading-relaxed">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-sm mb-lg">
              <span className="bg-surface-container-high text-on-surface-variant px-sm py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider border border-outline-variant">
                {item.category}
              </span>
              <span className="bg-surface-container-high text-on-surface-variant px-sm py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider border border-outline-variant">
                Shopify Optimized
              </span>
              <span className="bg-surface-container-high text-on-surface-variant px-sm py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider border border-outline-variant">
                1-Person Scale
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-md items-start sm:items-center">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-primary text-on-primary px-lg py-md rounded-lg font-headline-md text-headline-md flex items-center justify-center gap-sm hover:brightness-110 active:scale-95 transition-all w-full sm:w-auto text-center"
              >
                Visit Website 
                <span className="material-symbols-outlined">north_east</span>
              </a>
              <div className="flex items-center gap-xs text-on-surface-variant font-label-md px-md">
                <span className="material-symbols-outlined text-primary">verified</span>
                Verified Listing
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-xl">
          {/* Left Column (70%) */}
          <div className="lg:w-[70%] space-y-xl">
            {/* Detailed Description */}
            <section>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Detailed Overview</h2>
              <div className="space-y-md text-on-surface-variant font-body-md leading-relaxed">
                <p>
                  {item.title} represents a next-generation utility tailored specifically for e-commerce operators and solo brands. By automating complex visual adjustments, description generations, or conversion rate optimization, this tool removes technical barriers and allows founders to focus entirely on high-level growth and scaling strategies.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-lg">
                  <div className="space-y-base">
                    <h3 className="font-headline-md text-[20px] text-on-surface font-semibold">1-Person E-commerce Optimization</h3>
                    <p>Designed exactly for high-speed operation. Seamless integrations with Shopify storefronts, Etsy collections, or Amazon listings guarantee maximum output in minimum hours.</p>
                  </div>
                  <div className="space-y-base">
                    <h3 className="font-headline-md text-[20px] text-on-surface font-semibold">Verified Professional Workflows</h3>
                    <p>Utilized daily by thousands of global entrepreneurs. Accelerates creation processes, enhances storefront visuals, and improves retention funnels automatically.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Features */}
            <section>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow">
                  <span className="material-symbols-outlined text-primary mb-base" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
                  <h4 className="font-headline-md text-[18px] text-on-surface mb-xs font-semibold">Visual Excellence</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Elevate product and marketing visuals into stunning premium-grade graphics with simple inputs.</p>
                </div>
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow">
                  <span className="material-symbols-outlined text-primary mb-base" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  <h4 className="font-headline-md text-[18px] text-on-surface mb-xs font-semibold">Conversion Lift</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Tuned specifically around retail psychology to capture traffic and maximize checkout actions.</p>
                </div>
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow">
                  <span className="material-symbols-outlined text-primary mb-base" style={{ fontVariationSettings: "'FILL' 1" }}>integration_instructions</span>
                  <h4 className="font-headline-md text-[18px] text-on-surface mb-xs font-semibold">Simple Launch</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Zero complex integrations required. Deploy, embed, or integrate into storefront configurations instantly.</p>
                </div>
              </div>
            </section>

            {/* Customer Reviews */}
            <section>
              <div className="flex items-center justify-between mb-md">
                <h2 className="font-headline-md text-headline-md text-on-surface">Customer Reviews</h2>
                <div className="flex gap-xs items-center">
                  <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold">4.9</span>
                  <span className="text-on-surface-variant text-body-sm">(124 verified reviews)</span>
                </div>
              </div>
              <div className="flex gap-md overflow-x-auto pb-md custom-scrollbar">
                {/* Review Card 1 */}
                <div className="min-w-[320px] bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow shrink-0">
                  <div className="flex gap-xs mb-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-tertiary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-md italic leading-relaxed">&quot;Saved us over 40 hours of manual editing last month alone. Absolute game-changer for solo sellers!&quot;</p>
                  <div className="flex items-center gap-sm">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">Sarah J. - Shopify Plus Merchant</span>
                  </div>
                </div>
                {/* Review Card 2 */}
                <div className="min-w-[320px] bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow shrink-0">
                  <div className="flex gap-xs mb-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-tertiary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-md italic leading-relaxed">&quot;Allows us to display stunning, verified high-converting assets without expensive photography rigs.&quot;</p>
                  <div className="flex items-center gap-sm">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">Michael L. - Brand Owner</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Integration Guide */}
            <section className="bg-surface-container-low p-lg rounded-xl border border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Integration Guide &amp; Docs</h2>
              <ul className="space-y-sm">
                <li>
                  <a className="flex items-center gap-sm text-primary hover:underline group" href="#">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                    <span className="font-body-md">{item.title} Setup Guide for E-commerce</span>
                    <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                  </a>
                </li>
                <li>
                  <a className="flex items-center gap-sm text-primary hover:underline group" href="#">
                    <span className="material-symbols-outlined text-[20px]">code</span>
                    <span className="font-body-md">SaaS Integration Endpoints</span>
                    <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                  </a>
                </li>
              </ul>
            </section>
          </div>

          {/* Right Column Sidebar (30%) */}
          <aside className="lg:w-[30%] space-y-lg">
            <div className="sticky top-28 space-y-lg">
              <h2 className="font-headline-md text-[20px] text-on-surface font-bold">Similar Recommendations</h2>
              
              {recommendations.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">No recommended tools found in this category yet.</p>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden tool-card-shadow tool-card-hover">
                    <div className="h-32 bg-surface-container-low overflow-hidden">
                      <img className="w-full h-full object-cover" src={getOptimizedCloudinaryUrl(rec.image_url)} alt={rec.title} />
                    </div>
                    <div className="p-md">
                      <div className="flex items-center justify-between mb-xs">
                        <h3 className="font-headline-md text-[16px] text-on-surface font-semibold">{rec.title}</h3>
                        <span className="material-symbols-outlined text-tertiary-container text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-1">{rec.description}</p>
                      <Link className="text-primary font-label-sm text-label-sm flex items-center gap-xs hover:underline" href={`/items/${rec.id}`}>
                        View Details <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}

              {/* Sidebar CTA */}
              <div className="bg-primary-container p-md rounded-xl text-white shadow-md">
                <h4 className="font-headline-md text-[18px] mb-xs font-bold text-white">List your AI tool</h4>
                <p className="font-body-sm text-body-sm text-on-primary-container mb-md leading-relaxed">
                  Reach 50,000+ Shopify merchants searching for AI and SaaS solutions every month.
                </p>
                <Link 
                  href="/"
                  className="bg-white text-primary px-md py-sm rounded-lg font-label-md text-label-md w-full hover:bg-surface-container-lowest transition-colors text-center block shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-base border-t border-outline-variant bg-surface-container-low shrink-0">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <span className="font-headline-md text-headline-md font-bold text-on-surface">EcomStacks</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">© {new Date().getFullYear()} EcomStacks. High-trust directory for e-commerce.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-md">
          <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity hover:underline" href="/">Home</Link>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity hover:underline" href="#">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity hover:underline" href="#">Privacy Policy</a>
        </nav>
      </footer>
    </>
  );
}
