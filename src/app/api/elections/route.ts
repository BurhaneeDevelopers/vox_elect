/**
 * GET /api/elections — Google Civic Information API proxy.
 * Keeps the API key server-side. Returns voter info, polling locations, calendar.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetch_voter_info,
  fetch_representatives,
  get_mock_election_calendar,
  get_state_deadlines,
} from '@/lib/civic_api_client';
import { is_valid_zip_code, sanitise_input } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const zip = searchParams.get('zip');
  const address = searchParams.get('address');
  const state = searchParams.get('state');

  switch (action) {
    case 'voter_info': {
      const query_address = address ?? zip;
      if (!query_address) {
        return NextResponse.json({ error: 'Address or ZIP code is required.' }, { status: 400 });
      }

      const sanitised = sanitise_input(query_address, 200);

      // Validate ZIP if that's what was provided
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
        // Google Civic API returns 400 for addresses it can't find
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

    case 'representatives': {
      const query_address = address ?? zip;
      if (!query_address) {
        return NextResponse.json({ error: 'Address or ZIP code is required.' }, { status: 400 });
      }

      try {
        const reps = await fetch_representatives(sanitise_input(query_address, 200));
        return NextResponse.json({ data: reps }, {
          headers: { 'Cache-Control': 'private, max-age=86400' },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[/api/elections representatives]', msg);
        return NextResponse.json({ error: 'Unable to fetch representatives.' }, { status: 502 });
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
        { error: 'Invalid action. Valid actions: voter_info, representatives, calendar, deadlines.' },
        { status: 400 }
      );
  }
}
