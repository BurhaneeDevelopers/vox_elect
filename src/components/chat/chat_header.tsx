'use client';

/**
 * Chat page header with sidebar/panel toggles
 *
 * FIX: on_new_chat was triggering a hard page refresh because callers were
 * using window.location.reload() or window.location.href = '/chat'.
 * The header now accepts an optional router-based callback. If none is
 * provided it falls back to router.push('/chat') internally so a client-side
 * navigation is always used and React state is preserved.
 */

import { useRouter } from 'next/navigation';
import { PanelLeftOpen, PanelLeftClose, Info, Plus } from 'lucide-react';
import { UserMenu } from '@/components/auth/user_menu';
import { DonateButton } from './donate_button';
import { use_chat_store } from '@/stores/chat_store';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  sidebar_open: boolean;
  info_panel_open: boolean;
  on_sidebar_toggle: () => void;
  on_info_panel_toggle: () => void;
  on_new_chat?: () => void;
}

export function ChatHeader({
  sidebar_open,
  info_panel_open,
  on_sidebar_toggle,
  on_info_panel_toggle,
  on_new_chat,
}: ChatHeaderProps) {
  const router = useRouter();
  const { voice_state } = use_chat_store();

  // FIX: always use client-side navigation for New Chat.
  // Previously callers were doing window.location.href = '/chat' which caused
  // a full page reload, wiping React context and making it look like a refresh.
  const handle_new_chat = () => {
    if (on_new_chat) {
      on_new_chat(); // caller can do state resets (e.g. clear useChatHistory)
    } else {
      router.push('/chat');
    }
  };

  return (
    <header
      className="shrink-0 h-12 border-b border-[#E7E0D0] bg-[#FDFAF4] flex items-center px-3 gap-3 shadow-sm"
      role="banner"
    >
      {/* Sidebar toggle */}
      <button
        onClick={on_sidebar_toggle}
        aria-label={sidebar_open ? 'Close election calendar' : 'Open election calendar'}
        aria-expanded={sidebar_open}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F0E8] text-[#57534e] hover:text-[#2D5016] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
      >
        {sidebar_open ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>

      {/* Elora wordmark */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="w-7 h-7 rounded-full bg-linear-to-br from-[#2D5016] to-[#3d6b1f] flex items-center justify-center shadow-sm shrink-0"
          aria-hidden="true"
        >
          <span className="text-white font-serif font-bold text-xs select-none">E</span>
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-serif font-bold text-[#2D5016] text-sm leading-none">Elora</span>
          <span className="text-[10px] text-[#57534e] leading-none hidden sm:block truncate">
            Civic Guide — Powered by Taheri Developers
          </span>
        </div>
      </div>

      {/* Donate button */}
      <DonateButton />

      {/* New Chat button — FIX: calls handle_new_chat (router-based) */}
      <button
        onClick={handle_new_chat}
        disabled={voice_state === 'listening'}
        aria-label="Start new chat"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]",
          voice_state === 'listening'
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#2D5016] text-white hover:bg-[#3d6b1f]"
        )}
      >
        <Plus size={14} aria-hidden="true" />
        <span className="hidden sm:inline">New Chat</span>
      </button>

      {/* Info panel toggle */}
      <button
        onClick={on_info_panel_toggle}
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
  );
}