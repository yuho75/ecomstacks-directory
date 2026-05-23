import React from 'react';
import { supabase } from '@/lib/supabase';
import DirectoryLayout from '@/components/DirectoryLayout';

// Force next to pre-render EcomStacks as a highly optimized static page.
// In combination with revalidatePath() inside Server Actions, this forms 
// a robust On-Demand Incremental Static Regeneration (ISR) flow.
export const revalidate = 3600; // static generation with 1-hour background refresh fallback

export default async function Page() {
  let initialItems: any[] = [];

  try {
    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
    
    if (!isPlaceholder && !isBypass) {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data) {
        initialItems = data;
      } else {
        console.warn('Supabase fetch returned warning or empty:', error);
      }
    } else {
      // Load approved items from local Mock Database
      const { getMockItems } = await import('@/lib/mockDb');
      initialItems = await getMockItems('approved');
      console.log('Loaded approved items from local Mock DB:', initialItems.length);
    }
  } catch (err) {
    console.error('Failed to fetch items from database:', err);
    // Silent failover to empty list during CI build pipelines
  }

  return (
    <DirectoryLayout 
      initialItems={initialItems}
    />
  );
}
