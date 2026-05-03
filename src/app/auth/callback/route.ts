/**
 * OAuth callback handler
 * Handles redirect from Google OAuth and redirects to /chat
 */

import { NextResponse } from 'next/server';
import { supabase_client } from '@/lib/supabase_client';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    await supabase_client.auth.exchangeCodeForSession(code);
  }

  // Redirect to chat after successful OAuth
  return NextResponse.redirect(new URL('/chat', requestUrl.origin));
}
