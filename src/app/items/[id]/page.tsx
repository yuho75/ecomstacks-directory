import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SEED_ITEMS } from '@/lib/seeds';
import { getOptimizedCloudinaryUrl, formatDate } from '@/lib/utils';
import type { Metadata } from 'next';
import EditToolButton from '@/components/EditToolButton';
import ItemViewTracker from '@/components/ItemViewTracker';
import VisitWebsiteButton from '@/components/VisitWebsiteButton';

export const revalidate = 3600; // on-demand static generation with 1-hour background refresh fallback

interface PageProps {
  params: {
    id: string;
  };
}

async function getToolById(id: string) {
  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
  
  // 1. Fetch from mock DB first if sandbox is active
  if (isPlaceholder || isBypass) {
    try {
      const { getMockItemById } = await import('@/lib/mockDb');
      const mockItem = await getMockItemById(id);
      if (mockItem) {
        if (mockItem.status === 'deleted') return null;
        return mockItem;
      }
    } catch (e) {
      console.error('Error fetching item from Mock DB:', e);
    }
    return null;
  }

  // 2. Fetch directly from live Supabase (now fully populated with rich details!)
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      if (data.status === 'deleted') return null;
      return data;
    }
  } catch (e) {
    console.error('Error fetching item by ID from Supabase:', e);
  }

  // 3. Fallback: Check seeds directly by raw ID if database is disconnected
  const seed = SEED_ITEMS.find((s) => s.id === id);
  if (seed) return seed;

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

function getHybridDetails(category: string, title: string) {
  const normCategory = category?.toLowerCase() || '';

  if (normCategory.includes('visual') || normCategory.includes('design')) {
    return {
      title1: "Automated Studio Quality",
      desc1: `Generate professional-grade product visuals instantly. Get flawless background removals, custom studio lighting, and high-fidelity product placement in seconds with ${title}.`,
      title2: "High-Speed Asset Pipeline",
      desc2: "Designed for fast catalog updates and ad creatives. Export pixel-perfect marketing assets directly optimized for Shopify, Instagram, or Etsy storefronts."
    };
  } else if (normCategory.includes('copywriting') || normCategory.includes('marketing')) {
    return {
      title1: "Conversion-Focused AI Copy",
      desc1: `Leverage retail psychology and consumer behavior datasets. Craft persuasive sales copy, high-engagement captions, and social media reels that turn visitors into buyers using ${title}.`,
      title2: "Multi-Store Scaling",
      desc2: "Easily sync your product feeds. Generate bulk product descriptions, email flows, and social creatives for Shopify, Amazon, or boutique shops in a single click."
    };
  } else if (normCategory.includes('store') || normCategory.includes('optimization') || normCategory.includes('popup') || normCategory.includes('review')) {
    return {
      title1: "Frictionless Checkout Funnels",
      desc1: `Optimize every touchpoint of your customer journey. Minimize cart abandonment, boost average order value (AOV), and design stunning elements built to convert with ${title}.`,
      title2: "Real-Time Customer Trust",
      desc2: "Embed social proof, interactive reviews, and high-converting popups. Build immediate shopper credibility and turn first-time visitors into repeat purchasers."
    };
  } else if (normCategory.includes('analytics') || normCategory.includes('tracking') || normCategory.includes('metric')) {
    return {
      title1: "Data-Driven Decisions",
      desc1: `Uncover hidden marketing and traffic insights. Gain granular attribution, track accurate customer lifetime value (LTV), and stop wasting ad spend with ${title}.`,
      title2: "Multi-Channel Tracking",
      desc2: "Unify your shop metrics across TikTok, Google, Meta, and Shopify. View accurate conversion sources and pixel events in a single, consolidated dashboard."
    };
  } else {
    // Default fallback (e.g. Operations & Automation or others)
    return {
      title1: "Zero-Touch E-commerce Workflows",
      desc1: `Eliminate manual backend bottlenecks. Connect your storefront with ERPs, automate customer support triggers, and sync inventories across suppliers seamlessly via ${title}.`,
      title2: "Infinite Scale Integration",
      desc2: "Designed for modern solopreneurs. Build complex automated triggers and database syncs without writing a single line of custom code."
    };
  }
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
      {/* Silent click & view tracker - fires card_view on mount */}
      <ItemViewTracker itemId={item.id} />

      {/* TopNavBar */}
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
              className="text-[15px] font-extrabold tracking-[-0.045em] text-black transition-colors py-2 px-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Tools
            </Link>
            <Link 
              href="/#directory-anchor" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black transition-colors py-2 px-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Categories
            </Link>
            <Link 
              href="/#footer-anchor" 
              className="text-[15px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black transition-colors py-2 px-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Resources
            </Link>
          </nav>
          <Link href="/" className="bg-primary-container text-white px-md py-sm rounded-lg font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all block">
            Submit Your Tool ($9.99)
          </Link>
        </div>
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
            <div className="flex flex-col sm:flex-row gap-md items-stretch sm:items-center">
              <VisitWebsiteButton itemId={item.id} url={item.url} />
              <EditToolButton itemId={item.id} itemTitle={item.title} />
              <div className="flex items-center gap-xs text-on-surface-variant font-label-md whitespace-nowrap self-center">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
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
                  {item.detailed_overview || `${item.title} represents a next-generation utility tailored specifically for e-commerce operators and solo brands. By automating complex visual adjustments, description generations, or conversion rate optimization, this tool removes technical barriers and allows founders to focus entirely on high-level growth and scaling strategies.`}
                </p>
                {(() => {
                  const hybrid = getHybridDetails(item.category, item.title);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-lg">
                      <div className="space-y-base">
                        <h3 className="font-headline-md text-[20px] text-on-surface font-semibold">{hybrid.title1}</h3>
                        <p>{hybrid.desc1}</p>
                      </div>
                      <div className="space-y-base">
                        <h3 className="font-headline-md text-[20px] text-on-surface font-semibold">{hybrid.title2}</h3>
                        <p>{hybrid.desc2}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* Key Features */}
            <section>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Key Features</h2>
              {item.key_features && item.key_features.length >= 3 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow">
                    <span className="material-symbols-outlined text-primary mb-base" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
                    <h4 className="font-headline-md text-[18px] text-on-surface mb-xs font-semibold">{item.key_features[0]}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.key_features_descriptions?.[0] || "Elevate product and marketing visuals into stunning premium-grade graphics with simple inputs."}
                    </p>
                  </div>
                  <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow">
                    <span className="material-symbols-outlined text-primary mb-base" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                    <h4 className="font-headline-md text-[18px] text-on-surface mb-xs font-semibold">{item.key_features[1]}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.key_features_descriptions?.[1] || "Tuned specifically around retail psychology to capture traffic and maximize checkout actions."}
                    </p>
                  </div>
                  <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow">
                    <span className="material-symbols-outlined text-primary mb-base" style={{ fontVariationSettings: "'FILL' 1" }}>integration_instructions</span>
                    <h4 className="font-headline-md text-[18px] text-on-surface mb-xs font-semibold">{item.key_features[2]}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.key_features_descriptions?.[2] || "Zero complex integrations required. Deploy, embed, or integrate into storefront configurations instantly."}
                    </p>
                  </div>
                </div>
              ) : (
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
              )}
            </section>

            {/* Customer Reviews */}
            <section>
              <div className="flex items-center justify-between mb-md">
                <h2 className="font-headline-md text-headline-md text-on-surface">Customer Reviews</h2>
                <div className="flex gap-xs items-center">
                  <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold">{item.rating || "4.9"}</span>
                  <span className="text-on-surface-variant text-body-sm">({item.rating_count || "124"} verified reviews)</span>
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
                  <p className="font-body-md text-on-surface-variant mb-md italic leading-relaxed">&quot;{item.customer_review || "Saved us over 40 hours of manual editing last month alone. Absolute game-changer for solo sellers!"}&quot;</p>
                  <div className="flex items-center gap-sm">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">{item.customer_review_author || "Sarah J. - Shopify Plus Merchant"}</span>
                  </div>
                </div>
                {/* Review Card 2 */}
                <div className="min-w-[320px] bg-surface-container-lowest p-md rounded-xl border border-outline-variant tool-card-shadow shrink-0">
                  <div className="flex gap-xs mb-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-tertiary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-md italic leading-relaxed">
                    &quot;{item.customer_review_2 || "Allows us to display stunning, verified high-converting assets without expensive photography rigs."}&quot;
                  </p>
                  <div className="flex items-center gap-sm">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                      {item.customer_review_2_author || "Michael L. - Brand Owner"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Integration Guide */}
            <section className="bg-surface-container-low p-lg rounded-xl border border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Integration Guide &amp; Docs</h2>
              <ul className="space-y-sm">
                <li>
                  <a 
                    className="flex items-center gap-sm text-primary hover:underline group" 
                    href={item.integration_guide_1_url || "#"}
                    target={item.integration_guide_1_url ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  >
                    <span className="material-symbols-outlined text-[20px]">description</span>
                    <span className="font-body-md">{item.integration_guide_1_label || `${item.title} Setup Guide for E-commerce`}</span>
                    <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                  </a>
                </li>
                <li>
                  <a 
                    className="flex items-center gap-sm text-primary hover:underline group" 
                    href={item.integration_guide_2_url || "#"}
                    target={item.integration_guide_2_url ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  >
                    <span className="material-symbols-outlined text-[20px]">code</span>
                    <span className="font-body-md">{item.integration_guide_2_label || "SaaS Integration Endpoints"}</span>
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
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              )}

              {/* Sidebar CTA */}
              <div className="bg-primary-container p-md rounded-xl text-white shadow-md">
                <h4 className="font-headline-md text-[18px] mb-xs font-bold text-white">List your AI tool</h4>
                <p className="font-body-sm text-body-sm text-on-primary-container mb-md leading-relaxed">
                  Promote your tool to e-commerce brands and online sellers looking for AI and SaaS solutions.
                </p>
                <Link 
                  href="/?submit=true"
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
      <footer className="w-full bg-[#09090b] border-t border-neutral-800 shrink-0 py-md">
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
            <Link className="font-label-sm text-label-sm text-neutral-400 hover:text-white transition-opacity" href="/">Home</Link>
            <a className="font-label-sm text-label-sm text-neutral-400 hover:text-white transition-opacity" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-neutral-400 hover:text-white transition-opacity" href="#">Privacy Policy</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
