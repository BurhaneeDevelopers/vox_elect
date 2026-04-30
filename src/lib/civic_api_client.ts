/**
 * Google Civic Information API client for VoxElect.
 * Proxied through /api/elections to keep API key server-side only.
 */

import type {
  civic_voter_info,
  civic_api_error,
  election_calendar_event,
  election_deadline,
} from '@/types/election_types';

const CIVIC_API_BASE = 'https://www.googleapis.com/civicinfo/v2';

function get_civic_api_key(): string {
  const key = process.env.GOOGLE_CIVIC_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_CIVIC_API_KEY is not configured.');
  }
  return key;
}

/**
 * Fetch voter information for a given address using Google Civic API.
 * This runs server-side only (API route).
 */
export async function fetch_voter_info(address: string): Promise<civic_voter_info> {
  const api_key = get_civic_api_key();
  const encoded_address = encodeURIComponent(address);

  const url = `${CIVIC_API_BASE}/voterinfo?key=${api_key}&address=${encoded_address}&returnAllAvailableData=true`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 }, // Cache for 1 hour — election data is relatively stable
  });

  if (!response.ok) {
    const error_body = await response.json().catch(() => ({})) as { error?: civic_api_error };
    const error_message = error_body?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Civic API error: ${error_message}`);
  }

  return response.json() as Promise<civic_voter_info>;
}

/**
 * Fetch representatives for a given address.
 */
export async function fetch_representatives(address: string): Promise<Record<string, unknown>> {
  const api_key = get_civic_api_key();
  const encoded_address = encodeURIComponent(address);

  const url = `${CIVIC_API_BASE}/representatives?key=${api_key}&address=${encoded_address}`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 86400 }, // Cache representatives for 24 hours
  });

  if (!response.ok) {
    const error_body = await response.json().catch(() => ({})) as { error?: civic_api_error };
    const error_message = error_body?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Civic API representatives error: ${error_message}`);
  }

  return response.json();
}

/**
 * Returns mock/static election calendar events when no live API is connected.
 * Replace with real USA.gov or FEC API calls when API key is available.
 */
export function get_mock_election_calendar(): election_calendar_event[] {
  const current_year = new Date().getFullYear();
  return [
    {
      id: 'ev_1',
      title: 'Voter Registration Deadline',
      date: `${current_year}-10-08`,
      type: 'deadline',
      description: 'Last day to register to vote in most states for the general election.',
      url: 'https://vote.gov/register',
    },
    {
      id: 'ev_2',
      title: 'Early Voting Begins',
      date: `${current_year}-10-17`,
      type: 'deadline',
      description: 'Early in-person voting opens in most states.',
      url: 'https://vote.gov/',
    },
    {
      id: 'ev_3',
      title: 'Absentee/Mail Ballot Request Deadline',
      date: `${current_year}-10-25`,
      type: 'deadline',
      description: 'Last day to request an absentee or mail-in ballot in many states.',
      url: 'https://vote.gov/absentee-voting',
    },
    {
      id: 'ev_4',
      title: 'General Election Day',
      date: `${current_year}-11-04`,
      type: 'general',
      description: 'Federal and state general election day. Polls are typically open 6am–8pm local time.',
      url: 'https://vote.gov/',
    },
    {
      id: 'ev_5',
      title: 'State Primary Elections',
      date: `${current_year}-03-05`,
      type: 'primary',
      description: 'Super Tuesday — multiple state primary elections.',
      url: 'https://ballotpedia.org/Super_Tuesday',
    },
  ];
}

/**
 * Returns election deadlines for common states.
 * Extend this with real OpenStates / state API data.
 */
export function get_state_deadlines(state_code?: string): election_deadline[] {
  const all_deadlines: election_deadline[] = [
    {
      state: 'CA',
      deadline_type: 'voter_registration',
      date: `${new Date().getFullYear()}-10-22`,
      notes: 'Online, mail, or in-person registration. Same-day registration available.',
      url: 'https://registertovote.ca.gov/',
    },
    {
      state: 'TX',
      deadline_type: 'voter_registration',
      date: `${new Date().getFullYear()}-10-07`,
      notes: 'Must be postmarked by October 7.',
      url: 'https://www.votetexas.gov/',
    },
    {
      state: 'NY',
      deadline_type: 'voter_registration',
      date: `${new Date().getFullYear()}-10-25`,
      notes: 'Online registration deadline is October 25.',
      url: 'https://www.elections.ny.gov/',
    },
    {
      state: 'FL',
      deadline_type: 'voter_registration',
      date: `${new Date().getFullYear()}-10-07`,
      notes: 'Register online, by mail, or in person.',
      url: 'https://dos.fl.gov/elections/voters/',
    },
  ];

  if (state_code) {
    return all_deadlines.filter((d) => d.state === state_code.toUpperCase());
  }
  return all_deadlines;
}
