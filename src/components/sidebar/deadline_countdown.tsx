'use client';

/**
 * Countdown timer component for a single election deadline.
 */

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn, days_until, format_date } from '@/lib/utils';
import type { election_deadline } from '@/types/election_types';

interface deadline_countdown_props {
  deadline: election_deadline;
}

const DEADLINE_LABELS: Record<string, string> = {
  voter_registration: 'Voter Registration',
  absentee_request: 'Absentee Request',
  absentee_return: 'Absentee Return',
  election_day: 'Election Day',
};

function DeadlineCountdown({ deadline }: deadline_countdown_props) {
  const [days, set_days] = useState<number>(days_until(deadline.date));

  useEffect(() => {
    // Recalculate at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const ms_until_midnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      set_days(days_until(deadline.date));
    }, ms_until_midnight);

    return () => clearTimeout(timer);
  }, [deadline.date]);

  const is_past = days < 0;
  const is_urgent = days >= 0 && days <= 7;
  const is_soon = days >= 0 && days <= 30;

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 border',
        is_past
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : is_urgent
          ? 'bg-red-50 border-red-200'
          : is_soon
          ? 'bg-[#FDF8ED] border-[#C9A84C]/30'
          : 'bg-white border-[#E7E0D0]'
      )}
      role="timer"
      aria-label={`${DEADLINE_LABELS[deadline.deadline_type] ?? 'Deadline'}: ${is_past ? 'passed' : `${days} days remaining`}`}
    >
      <Clock
        size={14}
        className={cn(
          'flex-shrink-0',
          is_past ? 'text-gray-400' : is_urgent ? 'text-red-500' : 'text-[#C9A84C]'
        )}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#1C1917] truncate">
          {DEADLINE_LABELS[deadline.deadline_type] ?? 'Deadline'}
        </p>
        <p className="text-[10px] text-[#57534e]">{format_date(deadline.date)}</p>
      </div>
      <span
        className={cn(
          'flex-shrink-0 text-xs font-bold tabular-nums',
          is_past ? 'text-gray-400' : is_urgent ? 'text-red-600' : 'text-[#2D5016]'
        )}
        aria-hidden="true"
      >
        {is_past ? 'Passed' : `${days}d`}
      </span>
    </div>
  );
}

export { DeadlineCountdown as deadline_countdown };
