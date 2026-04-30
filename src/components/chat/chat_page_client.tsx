/**
 * Client component for chat page
 * Handles state and interactivity
 */

'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { chat_window as ChatWindow } from '@/components/chat/chat_window';
import { election_calendar_sidebar as ElectionCalendarSidebar } from '@/components/sidebar/election_calendar_sidebar';
import { info_panel as InfoPanel } from '@/components/panels/info_panel';
import { AuthGuard } from '@/components/auth/auth_guard';
import { ChatHeader } from '@/components/chat/chat_header';
import { ChatThreeColumnLayout } from '@/components/chat/chat_three_column_layout';
import { create_query_client } from '@/lib/query_client_config';

// Create QueryClient once at module level (stable across renders)
const query_client = create_query_client();

export function ChatPageClient() {
  const [sidebar_open, set_sidebar_open] = useState(true);
  const [info_panel_open, set_info_panel_open] = useState(false);

  return (
    <QueryClientProvider client={query_client}>
      <AuthGuard>
        <div className="flex flex-col h-full bg-[#F5F0E8]">
          <ChatHeader
            sidebar_open={sidebar_open}
            info_panel_open={info_panel_open}
            on_sidebar_toggle={() => set_sidebar_open(!sidebar_open)}
            on_info_panel_toggle={() => set_info_panel_open(!info_panel_open)}
          />

          <ChatThreeColumnLayout
            sidebar_open={sidebar_open}
            info_panel_open={info_panel_open}
            sidebar={<ElectionCalendarSidebar />}
            chat={<ChatWindow />}
            info_panel={<InfoPanel on_close={() => set_info_panel_open(false)} />}
          />
        </div>
      </AuthGuard>
    </QueryClientProvider>
  );
}
