/**
 * Supabase client configuration for VoxElect
 * Browser-side client for authentication and database operations
 */

import { createBrowserClient } from '@supabase/ssr';

export function create_supabase_client() {
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabase_url || !supabase_anon_key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(supabase_url, supabase_anon_key);
}

// Singleton instance for client-side usage
export const supabase_client = create_supabase_client();
