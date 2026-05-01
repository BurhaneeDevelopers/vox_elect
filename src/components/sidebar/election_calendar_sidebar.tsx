'use client';

/**
 * Left sidebar: election calendar events + state deadlines.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, ExternalLink, Loader2, MapPin } from 'lucide-react';
import { deadline_countdown as DeadlineCountdown } from './deadline_countdown';
import { ChatHistorySidebar } from './chat_history_sidebar';
import { use_election_calendar, use_state_deadlines, use_live_elections } from '@/hooks/use_election_data';
import { use_chat_store } from '@/stores/chat_store';
import { useLocation } from '@/context/location_context';
import { format_date, days_until } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { election_calendar_event } from '@/types/election_types';

const EVENT_TYPE_STYLES: Record<string, string> = {
  primary: 'bg-blue-100 text-blue-700',
  general: 'bg-[#2D5016]/10 text-[#2D5016]',
  runoff: 'bg-purple-100 text-purple-700',
  special: 'bg-orange-100 text-orange-700',
  deadline: 'bg-[#C9A84C]/15 text-[#a8872e]',
};

function CalendarEventCard({ event }: { event: election_calendar_event }) {
  const [expanded, set_expanded] = useState(false);
  
  // Validate date format
  const date_obj = new Date(event.date + 'T00:00:00');
  const is_valid_date = !isNaN(date_obj.getTime());
  
  const days = is_valid_date ? days_until(event.date) : null;
  const is_past = days !== null && days < 0;

  // Skip rendering if invalid date
  if (!is_valid_date) {
    return null;
  }

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border overflow-hidden transition-opacity',
        is_past ? 'opacity-50' : '',
        'border-[#E7E0D0] bg-white'
      )}
    >
      <button
        className="w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-[#F5F0E8] transition-colors"
        onClick={() => set_expanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`${event.title}, ${format_date(event.date)}${event.description ? '. Click to expand' : ''}`}
      >
        {/* Date column */}
        <div className="flex-shrink-0 w-10 text-center">
          <div className="text-[10px] text-[#57534e] uppercase tracking-wide">
            {date_obj.toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-lg font-bold text-[#2D5016] leading-tight">
            {date_obj.getDate()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#1C1917] leading-tight truncate">{event.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                EVENT_TYPE_STYLES[event.type] ?? 'bg-gray-100 text-gray-600'
              )}
            >
              {event.type}
            </span>
            {!is_past && days !== null && (
              <span className="text-[10px] text-[#57534e]">
                {days === 0 ? 'Today!' : `${days}d away`}
              </span>
            )}
          </div>
        </div>

        {event.description && (
          <div className="flex-shrink-0 text-[#57534e] mt-0.5">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        )}
      </button>

      <AnimatePresence>
        {expanded && event.description && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 pb-3"
          >
            <p className="text-xs text-[#57534e] leading-relaxed">{event.description}</p>
            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#2D5016] underline underline-offset-1 mt-1.5 hover:text-[#3d6b1f]"
                aria-label={`${event.title} - Learn more (opens in new tab)`}
              >
                Learn more
                <ExternalLink size={10} aria-hidden="true" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function election_calendar_sidebar() {
  const { data: calendar, isLoading: calendar_loading, isError: calendar_error } =
    use_election_calendar();
  const { location, loading: location_loading, refresh_location } = useLocation();
  const { active_zip } = use_chat_store();

  // Use location from context or active_zip from store
  const zip = location?.zip_code || active_zip;
  const state = location?.state;

  // Fetch live elections from civicAPI.org
  const { data: live_elections, isLoading: live_loading } = use_live_elections(zip || undefined, state || undefined);

  const { data: deadlines, isLoading: deadlines_loading } = use_state_deadlines(state || null);

  return (
    <aside
      className="h-full overflow-y-auto bg-[#F5F0E8] border-r border-[#E7E0D0]"
      aria-label="Election calendar and deadlines"
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-[#2D5016]" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-[#2D5016]">Election Calendar</h2>
        </div>

        {/* Location indicator */}
        {zip ? (
          <div className="flex items-center justify-between gap-2 mb-3 px-2 py-1.5 rounded-lg bg-[#2D5016]/5 border border-[#2D5016]/10">
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="text-[#2D5016]" aria-hidden="true" />
              <span className="text-xs text-[#2D5016]">
                ZIP: <strong>{zip}</strong>
                {state && <span className="ml-1 text-[#57534e]">({state})</span>}
              </span>
            </div>
            <button
              onClick={refresh_location}
              disabled={location_loading}
              className="p-1 rounded hover:bg-[#2D5016]/10 transition-colors disabled:opacity-50"
              aria-label="Refresh location"
            >
              <RefreshCw
                size={11}
                className={cn('text-[#2D5016]', location_loading && 'animate-spin')}
              />
            </button>
          </div>
        ) : (
          <p className="text-xs text-[#a8a29e] mb-3 italic px-1">
            Share your ZIP for local deadlines
          </p>
        )}

        {/* Deadlines section */}
        {deadlines_loading ? (
          <div className="flex justify-center py-4" aria-live="polite" aria-label="Loading deadlines">
            <Loader2 size={16} className="animate-spin text-[#2D5016]" />
          </div>
        ) : deadlines && deadlines.length > 0 ? (
          <div className="mb-4">
            <p className="text-[10px] text-[#57534e] uppercase tracking-wider font-medium mb-2 px-1">
              Key Deadlines
            </p>
            <div className="flex flex-col gap-1.5">
              {deadlines.map((deadline, i) => (
                <DeadlineCountdown key={i} deadline={deadline} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Calendar events */}
        <div>
          <p className="text-[10px] text-[#57534e] uppercase tracking-wider font-medium mb-2 px-1">
            Upcoming Events
          </p>

          <div className="text-center py-6 px-3 rounded-lg bg-white border border-[#E7E0D0]">
            <p className="text-sm text-[#2D5016] font-medium">Coming Soon</p>
            <p className="text-xs text-[#57534e] mt-1">
              Election events will appear here
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E7E0D0] my-3" />

        {/* Chat History */}
        <ChatHistorySidebar />

        {/* Attribution */}
        <p className="text-[10px] text-[#a8a29e] text-center mt-4 leading-relaxed">
          Data from{' '}
          <a
            href="https://civicapi.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#57534e]"
            aria-label="CivicAPI.org (opens in new tab)"
          >
            CivicAPI.org
          </a>
          {', '}
          <a
            href="https://vote.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#57534e]"
            aria-label="Vote.gov (opens in new tab)"
          >
            Vote.gov
          </a>
          {' & '}
          <a
            href="https://openstates.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#57534e]"
            aria-label="OpenStates (opens in new tab)"
          >
            OpenStates
          </a>
        </p>
      </div>
    </aside>
  );
}
