'use client';

/**
 * Three-column layout wrapper for the chat page.
 * Left: Election calendar sidebar
 * Center: Chat window
 * Right: Collapsible info panel
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelRightOpen, Vote, MessageSquare, Plus } from 'lucide-react';
import { chat_window as ChatWindow } from './chat_window';
import { election_calendar_sidebar as ElectionCalendarSidebar } from '@/components/sidebar/election_calendar_sidebar';
import { info_panel as InfoPanel } from '@/components/panels/info_panel';
import { chat_history_drawer as ChatHistoryDrawer } from './chat_history_drawer';
import { UserMenu } from '@/components/auth/user_menu';
import { cn } from '@/lib/utils';

export function chat_layout() {
  const [sidebar_open, set_sidebar_open] = useState(true);
  const [info_panel_open, set_info_panel_open] = useState(false);
  const [history_drawer_open, set_history_drawer_open] = useState(false);

  const handle_new_chat = () => {
    // TODO: Implement new chat logic
    console.log('New chat clicked');
  };

  const handle_select_session = (session_id: string) => {
    // TODO: Load session from DB
    console.log('Load session:', session_id);
  };

  const handle_delete_session = (session_id: string) => {
    // TODO: Delete session from DB
    console.log('Delete session:', session_id);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F5F0E8]">
      {/* Top nav bar */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 h-13 bg-[#2D5016] border-b border-[#1e3710] shadow-sm z-10"
        role="banner"
      >
        <div className="flex items-center gap-2.5">
          {/* Sidebar toggle */}
          <button
            onClick={() => set_sidebar_open(!sidebar_open)}
            aria-label={sidebar_open ? 'Hide election calendar' : 'Show election calendar'}
            aria-expanded={sidebar_open}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#2D5016]"
          >
            <Vote size={18} className="text-white" aria-hidden="true" />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-white tracking-tight">
              VoxElect
            </span>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] font-medium border border-[#C9A84C]/30">
              BETA
            </span>
          </div>
        </div>

        {/* Center subtitle */}
        <div className="hidden md:flex items-center gap-1.5 text-white/60 text-xs">
          <span>Powered by</span>
          <span className="font-medium text-[#C9A84C]">Taheri Developers</span>
          <span>&amp;</span>
          <span className="font-medium text-[#C9A84C]">Civic API</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* New chat button */}
          <button
            onClick={handle_new_chat}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              'bg-white/10 text-white hover:bg-white/15',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#2D5016]'
            )}
            aria-label="Start new chat"
          >
            <Plus size={14} aria-hidden="true" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Past chats button */}
          <button
            onClick={() => set_history_drawer_open(true)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              'bg-white/10 text-white hover:bg-white/15',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#2D5016]'
            )}
            aria-label="View past chats"
          >
            <MessageSquare size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Past Chats</span>
          </button>

          {/* User menu */}
          <UserMenu />

          {/* Info panel toggle */}
          <button
            onClick={() => set_info_panel_open(!info_panel_open)}
            aria-label={info_panel_open ? 'Hide info panel' : 'Show sources and polling info'}
            aria-expanded={info_panel_open}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#2D5016]',
              info_panel_open
                ? 'bg-[#C9A84C] text-[#1C1917]'
                : 'bg-white/10 text-white hover:bg-white/15'
            )}
          >
            <PanelRightOpen size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Sources</span>
          </button>
        </div>
      </header>

      {/* Chat history drawer */}
      <ChatHistoryDrawer
        is_open={history_drawer_open}
        on_close={() => set_history_drawer_open(false)}
        on_select_session={handle_select_session}
        on_delete_session={handle_delete_session}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <AnimatePresence initial={false}>
          {sidebar_open && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-shrink-0 overflow-hidden"
              aria-hidden={!sidebar_open}
            >
              <div className="w-[220px] h-full">
                <ElectionCalendarSidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center chat */}
        <main className="flex-1 overflow-hidden min-w-0">
          <ChatWindow />
        </main>

        {/* Right info panel */}
        <AnimatePresence initial={false}>
          {info_panel_open && (
            <motion.div
              key="info_panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-shrink-0 overflow-hidden"
              aria-hidden={!info_panel_open}
            >
              <div className="w-[260px] h-full">
                <InfoPanel on_close={() => set_info_panel_open(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
