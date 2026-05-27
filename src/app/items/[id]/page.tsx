import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SEED_ITEMS } from '@/lib/seeds';
import { getOptimizedCloudinaryUrl, formatDate, getHybridDetails } from '@/lib/utils';
import type { Metadata } from 'next';
import EditToolButton from '@/components/EditToolButton';
import ItemViewTracker from '@/components/ItemViewTracker';
import VisitWebsiteButton from '@/components/VisitWebsiteButton';
import ItemReviews from '@/components/ItemReviews';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';

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

// Fetch reviews for the item
async function getReviewsByItemId(id: string) {
  let dbReviews: any[] = [];
  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (!isPlaceholder && !isBypass) {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('item_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (data) dbReviews = data;
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
  } else {
    try {
      const { getMockReviews } = await import('@/lib/mockDb');
      dbReviews = await getMockReviews('approved', id);
    } catch (e) {
      console.error('Error fetching mock reviews:', e);
    }
  }
  return dbReviews;
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
  const reviews = await getReviewsByItemId(item.id);
  const optimizedImage = getOptimizedCloudinaryUrl(item.image_url);

  return (
    <>
      {/* Silent click & view tracker - fires card_view on mount */}
      <ItemViewTracker itemId={item.id} />

      {/* TopNavBar */}
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant shadow-sm shrink-0 flex flex-col">
        <AnnouncementBar />
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
          <Link href="/?submit=true" className="bg-primary-container text-white px-md py-sm rounded-lg font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all block">
            {process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true' ? 'Submit Your Tool' : 'Submit Your Tool (Free)'}
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
                {(() => {
                  let overviewText = item.detailed_overview || '';
                  let title1 = '';
                  let desc1 = '';
                  let title2 = '';
                  let desc2 = '';

                  if (overviewText.trim().startsWith('{')) {
                    try {
                      const parsed = JSON.parse(overviewText);
                      overviewText = parsed.overview || '';
                      title1 = parsed.title1 || '';
                      desc1 = parsed.desc1 || '';
                      title2 = parsed.title2 || '';
                      desc2 = parsed.desc2 || '';
                    } catch (e) {
                      console.error('Failed to parse detailed_overview JSON:', e);
                    }
                  }

                  if (!overviewText) {
                    overviewText = `${item.title} represents a next-generation utility tailored specifically for e-commerce operators and solo brands. By automating complex visual adjustments, description generations, or conversion rate optimization, this tool removes technical barriers and allows founders to focus entirely on high-level growth and scaling strategies.`;
                  }

                  if (!title1 || !desc1 || !title2 || !desc2) {
                    const hybrid = getHybridDetails(item.category, item.title);
                    title1 = title1 || hybrid.title1;
                    desc1 = desc1 || hybrid.desc1;
                    title2 = title2 || hybrid.title2;
                    desc2 = desc2 || hybrid.desc2;
                  }

                  return (
                    <>
                      <p>{overviewText}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-lg">
                        <div className="space-y-base">
                          <h3 className="font-headline-md text-[20px] text-on-surface font-semibold">{title1}</h3>
                          <p>{desc1}</p>
                        </div>
                        <div className="space-y-base">
                          <h3 className="font-headline-md text-[20px] text-on-surface font-semibold">{title2}</h3>
                          <p>{desc2}</p>
                        </div>
                      </div>
                    </>
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
            <ItemReviews itemId={item.id} itemTitle={item.title} reviews={reviews} />

          </div>

          {/* Right Column Sidebar (30%) */}
          <aside className="lg:w-[30%] space-y-lg">
            <div className="sticky top-28 space-y-lg">
              <h2 className="font-headline-md text-[20px] text-on-surface font-bold">Similar Recommendations</h2>
              
              {recommendations.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">No recommended tools found in this category yet.</p>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden tool-card-shadow tool-card-hover group">
                    <Link href={`/items/${rec.id}`} className="block h-32 bg-surface-container-low overflow-hidden">
                      <img 
                        className="w-full h-full object-cover brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500" 
                        src={getOptimizedCloudinaryUrl(rec.image_url)} 
                        alt={rec.title} 
                      />
                    </Link>
                    <div className="p-md">
                      <div className="flex items-center justify-between mb-xs">
                        <h3 className="font-headline-md text-[16px] text-on-surface font-semibold line-clamp-1 min-w-0">
                          <Link href={`/items/${rec.id}`} className="hover:text-primary transition-colors">
                            {rec.title}
                          </Link>
                        </h3>
                        <span className="material-symbols-outlined text-tertiary-container text-[16px] shrink-0 ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
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
      <Footer />
    </>
  );
}
