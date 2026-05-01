/**
 * GET /api/elections — Civic data API proxy.
 * Primary: Free APIs (civicAPI.org, OpenStates)
 * Fallback: Google Civic API (if key available)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetch_voter_info,
  fetch_representatives as fetch_google_representatives,
  get_mock_election_calendar,
  get_state_deadlines,
} from '@/lib/civic_api_client';
import { get_election_data, get_representatives } from '@/lib/civic_data';
import { is_valid_zip_code, sanitise_input } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const zip = searchParams.get('zip');
  const address = searchParams.get('address');
  const state = searchParams.get('state');

  switch (action) {
    case 'elections': {
      // New action — uses free civicAPI.org
      const sanitised_zip = zip ? sanitise_input(zip, 10) : undefined;
      const sanitised_state = state ? sanitise_input(state, 2) : undefined;

      try {
        const elections = await get_election_data(sanitised_zip, sanitised_state);
        return NextResponse.json({ data: elections }, {
          headers: { 'Cache-Control': 'public, max-age=3600' },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[/api/elections elections]', msg);
        return NextResponse.json({ error: 'Unable to fetch election data.' }, { status: 502 });
      }
    }

    case 'representatives': {
      // Try OpenStates first (free tier), fallback to Google
      const state_code = state ? sanitise_input(state, 2).toUpperCase() : undefined;
      
      if (state_code) {
        try {
          const reps = await get_representatives(state_code);
          if (reps.length > 0) {
            return NextResponse.json({ data: reps }, {
              headers: { 'Cache-Control': 'public, max-age=86400' },
            });
          }
        } catch (err) {
          console.warn('[/api/elections representatives] OpenStates failed, trying Google:', err);
        }
      }

      // Fallback to Google Civic API
      const query_address = address ?? zip;
      if (!query_address) {
        return NextResponse.json({ error: 'Address, ZIP, or state code required.' }, { status: 400 });
      }

      try {
        const reps = await fetch_google_representatives(sanitise_input(query_address, 200));
        return NextResponse.json({ data: reps }, {
          headers: { 'Cache-Control': 'private, max-age=86400' },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[/api/elections representatives]', msg);
        return NextResponse.json({ error: 'Unable to fetch representatives.' }, { status: 502 });
      }
    }

    case 'voter_info': {
      // Google Civic API only (requires key)
      const query_address = address ?? zip;
      if (!query_address) {
        return NextResponse.json({ error: 'Address or ZIP code is required.' }, { status: 400 });
      }

      const sanitised = sanitise_input(query_address, 200);

      if (zip && !is_valid_zip_code(zip)) {
        return NextResponse.json({ error: 'Invalid ZIP code format.' }, { status: 400 });
      }

      try {
        const voter_info = await fetch_voter_info(sanitised);
        return NextResponse.json({ data: voter_info }, {
          headers: { 'Cache-Control': 'private, max-age=3600' },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        if (msg.includes('400') || msg.includes('notFound')) {
          return NextResponse.json(
            { error: 'No election information found for this address. Try a more specific address.' },
            { status: 404 }
          );
        }
        console.error('[/api/elections voter_info]', msg);
        return NextResponse.json({ error: 'Unable to fetch voter information.' }, { status: 502 });
      }
    }

    case 'calendar': {
      const events = get_mock_election_calendar();
      return NextResponse.json({ data: events }, {
        headers: { 'Cache-Control': 'public, max-age=3600' },
      });
    }

    case 'deadlines': {
      const state_code = state ? sanitise_input(state, 2) : undefined;
      const deadlines = get_state_deadlines(state_code);
      return NextResponse.json({ data: deadlines }, {
        headers: { 'Cache-Control': 'public, max-age=3600' },
      });
    }

    default:
      return NextResponse.json(
        { error: 'Invalid action. Valid: elections, representatives, voter_info, calendar, deadlines.' },
        { status: 400 }
      );
  }
}
