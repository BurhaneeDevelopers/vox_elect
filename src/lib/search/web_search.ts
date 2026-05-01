/**
 * Web search using Tavily API for civic queries.
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  published_date?: string;
}

export async function search_civic_web(
  query: string,
  location?: { zip_code?: string; state?: string; country?: string }
): Promise<SearchResult[]> {
  const api_key = process.env.TAVILY_API_KEY;
  if (!api_key) {
    console.warn('[search_civic_web] TAVILY_API_KEY not set');
    return [];
  }

  // Prepend location to query if available
  let search_query = query;
  if (location?.zip_code) {
    search_query = `${query} near ${location.zip_code}`;
    if (location.state) search_query += ` ${location.state}`;
    if (location.country) search_query += ` ${location.country}`;
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key,
        query: search_query,
        search_depth: 'basic',
        max_results: 5,
        include_domains: [],
        exclude_domains: [],
      }),
    });

    if (!response.ok) {
      console.error('[search_civic_web] Tavily API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    interface TavilyResult {
      title?: string;
      url?: string;
      content?: string;
      published_date?: string;
    }
    
    return ((data.results || []) as TavilyResult[]).slice(0, 5).map((result) => ({
      title: result.title || '',
      url: result.url || '',
      snippet: result.content || '',
      published_date: result.published_date,
    }));
  } catch (err) {
    console.error('[search_civic_web] Error:', err);
    return [];
  }
}
