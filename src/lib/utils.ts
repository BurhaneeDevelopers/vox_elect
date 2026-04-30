/**
 * General utility helpers for Elora.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Generate a random UUID for message IDs */
export function generate_id(): string {
  return crypto.randomUUID();
}

/**
 * Sanitise user-supplied strings for use in API calls.
 * Trims whitespace, collapses multiple spaces, limits length.
 */
export function sanitise_input(input: string, max_length = 2000): string {
  return input.replace(/\s+/g, ' ').trim().slice(0, max_length);
}

/** Validate ZIP code format (US 5-digit) */
export function is_valid_zip_code(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim());
}

/** Extract ZIP code from a message string if present */
export function extract_zip_from_message(message: string): string | null {
  const match = message.match(/\b(\d{5})\b/);
  return match ? match[1] : null;
}

/** Format a date string for display */
export function format_date(date_str: string): string {
  try {
    const date = new Date(date_str + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return date_str;
  }
}

/** Calculate days remaining until a date */
export function days_until(date_str: string): number {
  const target = new Date(date_str + 'T00:00:00');
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Extract suggested follow-up question from Elora's response.
 * Elora formats it as: **Suggested question:** [text]
 */
export function extract_suggested_question(content: string): string[] {
  const match = content.match(/\*\*Suggested question:\*\*\s*(.+?)(?:\n|$)/i);
  if (match?.[1]) {
    return [match[1].trim()];
  }
  // Fallback: look for lines starting with "?"
  const q_match = content.match(/^\?(.+?)$/m);
  if (q_match?.[1]) return [q_match[1].trim()];
  return [];
}

/** Strip the suggested question line from response content for clean rendering */
export function strip_suggested_question(content: string): string {
  return content.replace(/\*\*Suggested question:\*\*\s*.+?(?:\n|$)/i, '').trim();
}

/** Simple state code lookup from state name */
export const STATE_CODE_MAP: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH',
  'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
  'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA',
  'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN',
  texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA',
  'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
};
