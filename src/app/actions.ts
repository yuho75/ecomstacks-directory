'use strict';
'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

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
    const { error } = await supabaseAdmin
      .from('items')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
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
      maxAge: 60 * 60 * 24 * 7, // 1 week session
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
  return { success: true };
}

