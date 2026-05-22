import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

// Use service role key as a fallback for the public client on the server side if anon key is a placeholder
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : supabaseServiceRoleKey;

// Public Supabase client for reading approved items (complies with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Administrative/Service Supabase client for backend inserts and updates (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});


