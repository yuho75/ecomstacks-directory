import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // revalidate at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ecomstacksdirectory.com';

  // 1. Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 2. Dynamic Tool Pages (Items)
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
    
    if (!isPlaceholder && !isBypass) {
      const { data, error } = await supabase
        .from('items')
        .select('id, updated_at')
        .eq('status', 'approved');

      if (!error && data) {
        dynamicRoutes = data.map((item) => ({
          url: `${baseUrl}/items/${item.id}`,
          lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        }));
      }
    }
  } catch (err) {
    console.error('Failed to fetch items for sitemap:', err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
