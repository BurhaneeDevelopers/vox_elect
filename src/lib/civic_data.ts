/**
 * Civic data client — elections, representatives, voter info.
 * Uses free APIs: civicAPI.org (no key) + OpenStates (free tier).
 */

import { search_civic_web } from './search/web_search';

export interface Election {
  id: string;
  name: string;
  election_day: string;
  state?: string;
  scope?: string;
  description?: string;
}

export interface Representative {
  id: string;
  name: string;
  party?: string;
  district?: string;
  chamber?: string;
  email?: string;
  phone?: string;
  image?: string;
}

/**
 * Get upcoming elections for location.
 * Primary: civicAPI.org (no key needed)
 * Fallback: Tavily web search
 */
export async function get_election_data(
  zip?: string,
  state?: string,
  country_code?: string
): Promise<Election[]> {
  // Try civicAPI.org first — no key needed
  try {
    const params = new URLSearchParams();
    if (zip) params.set('zip', zip);
    if (state) params.set('state', state);
    
    const url = `https://civicapi.org/elections${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Elora Civic App' },
    });

    if (response.ok) {
      const data = await response.json();
      return normalize_civic_api_elections(data);
    }
  } catch (err) {
    console.warn('[get_election_data] civicAPI.org failed:', err);
  }

  // Fallback: Tavily web search
  try {
    const query = `upcoming elections ${zip || ''} ${state || ''}`.trim();
    const results = await search_civic_web(query, { zip_code: zip, state, country: country_code });
    
    // Convert search results to election format
    return results.slice(0, 3).map((result, idx) => ({
      id: `search-${idx}`,
      name: result.title,
      election_day: extract_date_from_text(result.snippet) || 'Date TBD',
      description: result.snippet,
    }));
  } catch (err) {
    console.error('[get_election_data] Fallback search failed:', err);
    return [];
  }
}

/**
 * Get state representatives via OpenStates API.
 * Free tier: 500 req/day
 */
export async function get_representatives(state_code: string): Promise<Representative[]> {
  const api_key = process.env.OPENSTATES_API_KEY;
  if (!api_key) {
    console.warn('[get_representatives] OPENSTATES_API_KEY not set');
    return [];
  }

  try {
    const url = `https://v3.openstates.org/people?jurisdiction=${state_code}&apikey=${api_key}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Elora Civic App' },
    });

    if (!response.ok) {
      console.error('[get_representatives] OpenStates error:', response.status);
      return [];
    }

    const data = await response.json();
    return normalize_openstates_people(data.results || []);
  } catch (err) {
    console.error('[get_representatives] Error:', err);
    return [];
  }
}

/**
 * Normalize civicAPI.org election response
 */
function normalize_civic_api_elections(data: unknown): Election[] {
  if (!data || typeof data !== 'object' || !('elections' in data)) return [];
  
  const elections_data = data as { elections?: unknown[] };
  if (!Array.isArray(elections_data.elections)) return [];
  
  return elections_data.elections.map((election: unknown) => {
    const e = election as Record<string, unknown>;
    return {
      id: String(e.id || e.ocdDivisionId || `election-${Date.now()}`),
      name: String(e.name || 'Election'),
      election_day: String(e.electionDay || e.date || 'Date TBD'),
      state: e.state ? String(e.state) : undefined,
      scope: e.scope ? String(e.scope) : undefined,
      description: e.description ? String(e.description) : undefined,
    };
  });
}

/**
 * Normalize OpenStates people response
 */
function normalize_openstates_people(people: unknown[]): Representative[] {
  return people.map((person: unknown) => {
    const p = person as Record<string, unknown>;
    const current_role = p.current_role as Record<string, unknown> | undefined;
    
    return {
      id: String(p.id || ''),
      name: String(p.name || ''),
      party: p.party ? String(p.party) : undefined,
      district: current_role?.district ? String(current_role.district) : undefined,
      chamber: current_role?.title ? String(current_role.title) : undefined,
      email: p.email ? String(p.email) : undefined,
      phone: p.capitol_voice ? String(p.capitol_voice) : undefined,
      image: p.image ? String(p.image) : undefined,
    };
  });
}

/**
 * Extract date from text (simple regex)
 */
function extract_date_from_text(text: string): string | null {
  // Match patterns like "November 5, 2024" or "Nov 5, 2024"
  const date_pattern = /(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i;
  const match = text.match(date_pattern);
  return match ? match[0] : null;
}
