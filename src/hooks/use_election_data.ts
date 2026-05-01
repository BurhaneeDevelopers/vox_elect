'use client';

/**
 * TanStack React Query v5 hooks for election data fetching.
 */

import { useQuery } from '@tanstack/react-query';
import type { civic_voter_info, election_calendar_event, election_deadline } from '@/types/election_types';

interface api_response<T> {
  data: T;
  error?: string;
}

async function fetch_election_data<T>(params: Record<string, string>): Promise<T> {
  const search_params = new URLSearchParams(params);
  const response = await fetch(`/api/elections?${search_params.toString()}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }
  const result = await response.json() as api_response<T>;
  return result.data;
}

/** Fetch voter info for a ZIP or address */
export function use_voter_info(zip: string | null) {
  return useQuery<civic_voter_info, Error>({
    queryKey: ['voter_info', zip],
    queryFn: () =>
      fetch_election_data<civic_voter_info>({ action: 'voter_info', zip: zip! }),
    enabled: Boolean(zip),
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch election calendar events */
export function use_election_calendar() {
  return useQuery<election_calendar_event[], Error>({
    queryKey: ['election_calendar'],
    queryFn: () => fetch_election_data<election_calendar_event[]>({ action: 'calendar' }),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/** Fetch live elections from civicAPI.org */
export function use_live_elections(zip?: string, state?: string) {
  return useQuery({
    queryKey: ['live_elections', zip, state],
    queryFn: () =>
      fetch_election_data({
        action: 'elections',
        ...(zip ? { zip } : {}),
        ...(state ? { state } : {}),
      }),
    enabled: Boolean(zip || state),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/** Fetch state-specific voting deadlines */
export function use_state_deadlines(state_code: string | null) {
  return useQuery<election_deadline[], Error>({
    queryKey: ['state_deadlines', state_code],
    queryFn: () =>
      fetch_election_data<election_deadline[]>({
        action: 'deadlines',
        ...(state_code ? { state: state_code } : {}),
      }),
    staleTime: 60 * 60 * 1000,
  });
}
