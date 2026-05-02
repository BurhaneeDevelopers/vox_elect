/**
 * POST /api/chat — Gemini 1.5 Pro streaming chat endpoint.
 * Validates input, calls Gemini, streams response back as text/event-stream.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stream_chat_response } from '@/lib/gemini_client';
import { sanitise_input } from '@/lib/utils';
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS, MAX_MESSAGE_HISTORY } from '@/lib/constants';
import type { gemini_chat_request } from '@/types/chat_types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limiting in-memory store (per IP, resets on server restart)
// In production replace with Redis/Upstash
const rate_limit_map = new Map<string, { count: number; reset_at: number }>();

function check_rate_limit(ip: string): boolean {
  const now = Date.now();
  const record = rate_limit_map.get(ip);
  if (!record || now > record.reset_at) {
    rate_limit_map.set(ip, { count: 1, reset_at: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  record.count++;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse | Response> {
  // IP-based rate limiting
  const forwarded_for = req.headers.get('x-forwarded-for');
  const ip = forwarded_for ? forwarded_for.split(',')[0].trim() : 'unknown';
  if (!check_rate_limit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  // Parse and validate request body
  let body: gemini_chat_request;
  try {
    body = await req.json() as gemini_chat_request;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
  }

  // Validate and sanitise messages
  const sanitised_messages = body.messages
    .filter((m) => m.role && m.content && typeof m.content === 'string')
    .map((m) => ({
      role: m.role,
      content: sanitise_input(m.content),
    }));

  if (sanitised_messages.length === 0) {
    return NextResponse.json({ error: 'No valid messages provided.' }, { status: 400 });
  }

  // Limit conversation history to last 20 messages to manage token usage
  const trimmed_messages = sanitised_messages.slice(-MAX_MESSAGE_HISTORY);

  try {
    const stream = await stream_chat_response({
      messages: trimmed_messages,
      location_context: body.location_context ?? null,
    });

    // Encode string stream to Uint8Array for the Response body
    const encoder = new TextEncoder();
    const encoded_stream = stream.pipeThrough(
      new TransformStream<string, Uint8Array>({
        transform(chunk, controller) {
          controller.enqueue(encoder.encode(chunk));
        },
      })
    );

    // Stream response as plain text
    return new Response(encoded_stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const error_message = err instanceof Error ? err.message : 'Unknown error';
    // Log error without exposing sensitive details
    if (process.env.NODE_ENV === 'development') {
      console.error('[/api/chat] Error:', error_message);
    }
    return NextResponse.json(
      { error: 'Elora is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
