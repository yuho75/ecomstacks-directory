/**
 * Automatically embeds Cloudinary optimization parameters (f_auto, q_auto, w_600, h_400, c_fill)
 * into Cloudinary image source URLs to maximize media loading speed and responsiveness.
 */
export function getOptimizedCloudinaryUrl(url: string | null | undefined): string {
  if (!url) return "";
  // Check if this is a standard Cloudinary delivery URL
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_600,h_400,c_fill/");
  }
  return url;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    return "";
  }
}

export function getHybridDetails(category: string, title: string) {
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
