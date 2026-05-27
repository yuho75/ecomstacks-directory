import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SEED_ITEMS } from '@/lib/seeds';
import EditItemForm from '@/components/EditItemForm';

export const dynamic = 'force-dynamic';

interface EditPageProps {
  params: {
    id: string;
  };
  searchParams: {
    token?: string;
  };
}

// Fetch helper that merges database and seed items
async function getToolById(id: string) {
  // Seeds cannot be edited
  const seed = SEED_ITEMS.find((s) => s.id === id);
  if (seed) return seed;

  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
  
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

  // Otherwise, fetch from Supabase (using supabaseAdmin since edit_token column is bypassed by anon key RLS)
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const { data, error } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      if (data.status === 'deleted') return null;
      return data;
    }
  } catch (e) {
    console.error('Error fetching item by ID:', e);
  }
  return null;
}

import { cookies } from 'next/headers';

export default async function EditPage({ params, searchParams }: EditPageProps) {
  const { id } = params;
  const token = searchParams.token;
  
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('manage_session_email');
  const sessionEmail = sessionCookie?.value?.toLowerCase();

  let isValid = false;
  let errorMessage = 'The secure link you clicked is invalid or expired. Please request a new edit link from the tool card.';
  let item: any = null;

  item = await getToolById(id);

  if (item) {
    const isSeed = SEED_ITEMS.some((s) => s.id === id);
    if (isSeed) {
      isValid = false;
      errorMessage = 'Seed/System listings are protected and cannot be edited.';
    } else {
      // Check session cookie first
      if (sessionEmail && item.email && sessionEmail === item.email.toLowerCase()) {
        isValid = true;
      } 
      // Fallback to token check
      else if (token) {
        const dbToken = item.edit_token;
        const dbExpiresAt = item.edit_token_expires_at;

        if (dbToken && dbToken === token) {
          const expiryTime = new Date(dbExpiresAt).getTime();
          if (Date.now() <= expiryTime) {
            isValid = true;
          } else {
            errorMessage = 'The secure edit link has expired (valid for 10 minutes). Please request a new link.';
          }
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
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
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-container-max w-full mx-auto px-gutter py-lg flex-grow flex flex-col justify-center">
        {isValid && item ? (
          <div className="max-w-2xl w-full mx-auto">
            <div className="mb-md">
              <Link 
                href={`/items/${id}`} 
                className="inline-flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Cancel & Back to Details
              </Link>
            </div>
            <EditItemForm item={item} token={token!} />
          </div>
        ) : (
          <div className="max-w-md w-full mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-lg text-center space-y-md">
            <span className="material-symbols-outlined text-[64px] text-error">lock_open</span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Access Denied</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {errorMessage}
            </p>
            
            {/* Developer Diagnostics Box */}
            <details className="mt-md text-left bg-neutral-100 dark:bg-neutral-800 p-sm rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-mono select-text">
              <summary className="cursor-pointer font-bold text-neutral-600 dark:text-neutral-300 mb-1">Developer Diagnostics</summary>
              <div className="space-y-1 mt-2 text-[11px] text-neutral-600 dark:text-neutral-300">
                <div><strong>URL Token:</strong> {token || 'undefined'}</div>
                <div><strong>Item Found:</strong> {item ? 'Yes' : 'No'}</div>
                {item && (
                  <>
                    <div><strong>Item Title:</strong> {item.title}</div>
                    <div><strong>Item Status:</strong> {item.status}</div>
                    <div><strong>DB Token:</strong> {item.edit_token || 'null'}</div>
                    <div><strong>DB Expires At:</strong> {item.edit_token_expires_at || 'null'}</div>
                    <div><strong>DB Token Matches?:</strong> {String(item.edit_token === token)}</div>
                    <div><strong>Time Now:</strong> {new Date().toISOString()}</div>
                    <div><strong>Expired?:</strong> {String(Date.now() > new Date(item.edit_token_expires_at).getTime())}</div>
                  </>
                )}
                <div><strong>MOCK_BYPASS:</strong> {String(process.env.NEXT_PUBLIC_MOCK_BYPASS)}</div>
                <div><strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined'}</div>
              </div>
            </details>

            <div className="pt-md border-t border-outline-variant flex flex-col gap-sm">
              <Link 
                href={item ? `/items/${id}` : '/'}
                className="bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all py-xs rounded-lg font-label-md text-label-md block"
              >
                {item ? 'Go to Tool Page' : 'Go to Homepage'}
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#09090b] border-t border-neutral-800 shrink-0 py-md mt-xl">
        <div className="max-w-container-max w-full mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex flex-col md:flex-row items-center gap-sm md:gap-md text-center md:text-left">
            <div className="flex items-center gap-xs">
              <div className="relative w-7 h-7 flex items-center justify-center bg-black rounded shrink-0">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
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
              © 2026 EcomStacks. High-trust directory for e-commerce.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-md">
            <Link className="font-label-sm text-label-sm text-neutral-400 hover:text-white transition-opacity" href="/">Home</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
