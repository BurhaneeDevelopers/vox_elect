'use client';

/**
 * /chat — Main Elora chat interface.
 * Three-column layout: election calendar sidebar | chat | info panel.
 */

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftOpen, PanelLeftClose, Info } from 'lucide-react';
import { chat_window as ChatWindow } from '@/components/chat/chat_window';
import { election_calendar_sidebar as ElectionCalendarSidebar } from '@/components/sidebar/election_calendar_sidebar';
import { info_panel as InfoPanel } from '@/components/panels/info_panel';
import { AuthGuard } from '@/components/auth/auth_guard';
import { UserMenu } from '@/components/auth/user_menu';
import { create_query_client } from '@/lib/query_client_config';
import { cn } from '@/lib/utils';

// Create QueryClient once at module level (stable across renders)
const query_client = create_query_client();

export default function ChatPage() {
  const [sidebar_open, set_sidebar_open] = useState(true);
  const [info_panel_open, set_info_panel_open] = useState(false);

  return (
    <QueryClientProvider client={query_client}>
      <AuthGuard>
        <div className="flex flex-col h-full bg-[#F5F0E8]">
          {/* Top navigation bar */}
          <header
            className="flex-shrink-0 h-12 border-b border-[#E7E0D0] bg-[#FDFAF4] flex items-center px-3 gap-3 shadow-sm"
            role="banner"
          >
            {/* Sidebar toggle */}
            <button
              onClick={() => set_sidebar_open(!sidebar_open)}
              aria-label={sidebar_open ? 'Close election calendar' : 'Open election calendar'}
              aria-expanded={sidebar_open}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F0E8] text-[#57534e] hover:text-[#2D5016] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
            >
              {sidebar_open ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>

            {/* Elora wordmark */}
            <div className="flex items-center gap-2 flex-1">
              <div
                className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2D5016] to-[#3d6b1f] flex items-center justify-center shadow-sm flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-white font-serif font-bold text-xs select-none">V</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-serif font-bold text-[#2D5016] text-sm leading-none">Elora</span>
                <span className="text-[10px] text-[#57534e] leading-none">
                  Civic Guide — Powered by Taheri Developers
                </span>
              </div>
            </div>

            {/* Info panel toggle */}
            <button
              onClick={() => set_info_panel_open(!info_panel_open)}
              aria-label={info_panel_open ? 'Close info panel' : 'Open info panel'}
              aria-expanded={info_panel_open}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]',
                info_panel_open
                  ? 'bg-[#2D5016] text-white'
                  : 'hover:bg-[#F5F0E8] text-[#57534e] hover:text-[#2D5016]'
              )}
            >
              <Info size={15} aria-hidden="true" />
            </button>

            {/* User Menu */}
            <UserMenu />
          </header>

          {/* Main three-column layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar: Election Calendar */}
            <AnimatePresence initial={false}>
              {sidebar_open && (
                <motion.div
                  key="sidebar"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="flex-shrink-0 overflow-hidden"
                  aria-hidden={!sidebar_open}
                >
                  <div className="w-60 h-full">
                    <ElectionCalendarSidebar />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center: Chat window */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <ChatWindow />
            </div>

            {/* Right panel: Info / Sources / Polling */}
            <AnimatePresence initial={false}>
              {info_panel_open && (
                <motion.div
                  key="info_panel"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 256, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="flex-shrink-0 overflow-hidden"
                  aria-hidden={!info_panel_open}
                >
                  <div className="w-64 h-full">
                    <InfoPanel on_close={() => set_info_panel_open(false)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AuthGuard>
    </QueryClientProvider>
  );
}
