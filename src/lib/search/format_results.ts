/**
 * Format search results for injection into Gemini context.
 */

import type { SearchResult } from './web_search';

export function format_search_results(results: SearchResult[]): string {
  if (results.length === 0) return '';

  const formatted = results
    .map((result, index) => {
      let entry = `[${index + 1}] ${result.title}\n`;
      entry += `URL: ${result.url}\n`;
      entry += `${result.snippet}`;
      if (result.published_date) {
        entry += `\nPublished: ${result.published_date}`;
      }
      return entry;
    })
    .join('\n\n');

  return `[Live web search results]\n\n${formatted}\n\n---\n\n`;
}
