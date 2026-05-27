'use strict';
'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server Action: Approves a pending tool submission.
 * Verifies admin credentials, changes status to 'approved',
 * and instantly revalidates the homepage and detail page cache.
 */
export async function approveItem(id: string, secretKey: string | null) {
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'secret-key-123';
  
  const cookieStore = cookies();
  const session = cookieStore.get('ecomstacks_admin_session');
  const isSessionAuthenticated = session?.value === 'authenticated';

  if (!isSessionAuthenticated && secretKey !== adminSecret) {
    throw new Error('Unauthorized administrative action.');
  }

  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isPlaceholder || isBypass) {
    const { updateMockItemStatus } = await import('@/lib/mockDb');
    const updated = await updateMockItemStatus(id, 'approved');
    if (!updated) {
      throw new Error('Item not found in mock database.');
    }
  } else {
    // 1. Fetch the item's raw submission fields to analyze
    const { data: itemData, error: fetchError } = await supabaseAdmin
      .from('items')
      .select('title, url, description, detailed_overview, email')
      .eq('id', id)
      .single();

    if (fetchError || !itemData) {
      throw new Error(`Failed to retrieve item details: ${fetchError?.message || 'Not found'}`);
    }

    // 2. If it doesn't have a detailed overview yet, enrich it using Gemini AI
    let aiUpdates = {};
    if (!itemData.detailed_overview && process.env.GEMINI_API_KEY) {
      console.log(`🤖 Enriching tool ${itemData.title} using Gemini AI...`);
      try {
        const { generateToolDetailsWithAI } = await import('@/lib/gemini');
        const aiData = await generateToolDetailsWithAI(itemData.title, itemData.url, itemData.description);
        if (aiData) {
          aiUpdates = {
            detailed_overview: aiData.detailed_overview,
            key_features: aiData.key_features,
            key_features_descriptions: aiData.key_features_descriptions,
            rating: aiData.rating,
            rating_count: aiData.rating_count,
            customer_review: aiData.customer_review,
            customer_review_author: aiData.customer_review_author,
            customer_review_2: aiData.customer_review_2,
            customer_review_2_author: aiData.customer_review_2_author,
            integration_guide_1_label: aiData.integration_guide_1_label,
            integration_guide_1_url: aiData.integration_guide_1_url
          };
          console.log(`🤖 Gemini AI successfully generated detailed content for ${itemData.title}!`);
        }
      } catch (geminiErr) {
        console.error('❌ Failed to enrich with Gemini, approving with basic details:', geminiErr);
      }
    }

    // 3. Approve and save the rich details
    const { error } = await supabaseAdmin
      .from('items')
      .update({
        status: 'approved',
        ...aiUpdates
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // 4. Send Approval welcome email to the tool owner via Resend
    try {
      const { sendApprovalEmail } = await import('@/lib/emails');
      await sendApprovalEmail(itemData.email, itemData.title, id);
    } catch (emailErr) {
      console.error('Failed to send approval email:', emailErr);
    }
  }

  // Instantly revalidate the Landing Page and the Detail Page to invalidate Vercel CDN ISR cache
  revalidatePath('/');
  revalidatePath(`/items/${id}`);

  return { success: true };
}

/**
 * Server Action: Rejects a pending tool submission.
 * Verifies admin credentials, changes status to 'rejected',
 * and instantly revalidates the homepage cache.
 */
export async function rejectItem(id: string, secretKey: string | null) {
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'secret-key-123';
  
  const cookieStore = cookies();
  const session = cookieStore.get('ecomstacks_admin_session');
  const isSessionAuthenticated = session?.value === 'authenticated';

  if (!isSessionAuthenticated && secretKey !== adminSecret) {
    throw new Error('Unauthorized administrative action.');
  }

  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isPlaceholder || isBypass) {
    const { updateMockItemStatus } = await import('@/lib/mockDb');
    const updated = await updateMockItemStatus(id, 'rejected');
    if (!updated) {
      throw new Error('Item not found in mock database.');
    }
  } else {
    const { error } = await supabaseAdmin
      .from('items')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Instantly revalidate the lists
  revalidatePath('/');

  return { success: true };
}

/**
 * Server Action: Validates administrator credentials and sets an HTTP-only session cookie.
 */
export async function loginAdmin(usernameInput: string, passwordInput: string) {
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (usernameInput === adminUser && passwordInput === adminPass) {
    const cookieStore = cookies();
    cookieStore.set('ecomstacks_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    return { success: true };
  } else {
    return { success: false, error: 'Incorrect username or password.' };
  }
}

/**
 * Server Action: Clears the administrator session cookie.
 */
export async function logoutAdmin() {
  const cookieStore = cookies();
  cookieStore.delete('ecomstacks_admin_session');
  redirect('/admin');
}

/**
 * Server Action: Clears the administrator session cookie and redirects to the home page.
 */
export async function logoutAndRedirectToHome() {
  const cookieStore = cookies();
  cookieStore.delete('ecomstacks_admin_session');
  redirect('/');
}

/**
 * Server Action: Manually updates all attributes of a listing from the Admin Panel.
 * Verifies administrative credentials, updates Supabase/MockDB, and revalidates Next.js cache.
 */
export async function updateItemAdmin(id: string, updates: any, secretKey: string | null) {
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'secret-key-123';
  
  const cookieStore = cookies();
  const session = cookieStore.get('ecomstacks_admin_session');
  const isSessionAuthenticated = session?.value === 'authenticated';

  if (!isSessionAuthenticated && secretKey !== adminSecret) {
    throw new Error('Unauthorized administrative action.');
  }

  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isPlaceholder || isBypass) {
    const { updateMockItemFullDetails } = await import('@/lib/mockDb');
    const updated = await updateMockItemFullDetails(id, updates);
    if (!updated) {
      throw new Error('Item not found in mock database.');
    }
  } else {
    const { error } = await supabaseAdmin
      .from('items')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Instantly revalidate Landing Page lists and the tool's detailed page
  revalidatePath('/');
  revalidatePath(`/items/${id}`);

  return { success: true };
}



export async function approveReview(id: string, secretKey: string | null) {
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'secret-key-123';
  const cookieStore = cookies();
  const session = cookieStore.get('ecomstacks_admin_session');
  const isSessionAuthenticated = session?.value === 'authenticated';

  if (!isSessionAuthenticated && secretKey !== adminSecret) {
    throw new Error('Unauthorized');
  }

  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isBypass || isPlaceholder) {
    const { updateMockReviewStatus } = await import('@/lib/mockDb');
    await updateMockReviewStatus(id, 'approved');
  } else {
    const { error } = await supabaseAdmin.from('reviews').update({ status: 'approved' }).eq('id', id);
    if (error) throw new Error('Database error');
  }
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/items/[id]', 'page');
}

export async function rejectReview(id: string, secretKey: string | null) {
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'secret-key-123';
  const cookieStore = cookies();
  const session = cookieStore.get('ecomstacks_admin_session');
  const isSessionAuthenticated = session?.value === 'authenticated';

  if (!isSessionAuthenticated && secretKey !== adminSecret) {
    throw new Error('Unauthorized');
  }

  const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (isBypass || isPlaceholder) {
    const { updateMockReviewStatus } = await import('@/lib/mockDb');
    await updateMockReviewStatus(id, 'rejected');
  } else {
    const { error } = await supabaseAdmin.from('reviews').update({ status: 'rejected' }).eq('id', id);
    if (error) throw new Error('Database error');
  }
  revalidatePath('/admin');
}
