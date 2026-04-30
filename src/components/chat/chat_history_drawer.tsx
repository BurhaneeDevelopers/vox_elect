'use client';

/**
 * Chat history drawer — slides from right, shows past conversations
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { chat_session } from '@/types/chat_types';

interface chat_history_drawer_props {
  is_open: boolean;
  on_close: () => void;
  on_select_session: (session_id: string) => void;
  on_delete_session?: (session_id: string) => void;
  current_session_id?: string;
}

export function chat_history_drawer({
  is_open,
  on_close,
  on_select_session,
  on_delete_session,
  current_session_id,
}: chat_history_drawer_props) {
  const [sessions, set_sessions] = useState<chat_session[]>([]);
  const [loading, set_loading] = useState(false);

  useEffect(() => {
    if (is_open) {
      load_sessions();
    }
  }, [is_open]);

  const load_sessions = async () => {
    set_loading(true);
    try {
      // TODO: Fetch from Supabase
      // const { data } = await supabase
      //   .from('chat_sessions')
      //   .select('*')
      //   .order('last_message_at', { ascending: false });
      // set_sessions(data || []);
      
      // Mock data for now
      set_sessions([]);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      set_loading(false);
    }
  };

  const format_date = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const get_session_title = (session: chat_session) => {
    if (session.title) return session.title;
    const first_user_msg = session.messages.find((m) => m.role === 'user');
    if (first_user_msg) {
      return first_user_msg.content.slice(0, 50) + (first_user_msg.content.length > 50 ? '...' : '');
    }
    return 'New conversation';
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {is_open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={on_close}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {is_open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFAF4] shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-label="Chat history"
            aria-modal="true"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#E7E0D0]">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-[#2D5016]" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-[#2D5016]">Past Chats</h2>
              </div>
              <button
                onClick={on_close}
                className="p-1.5 rounded-lg hover:bg-[#F5F0E8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                aria-label="Close drawer"
              >
                <X size={20} className="text-[#57534e]" />
              </button>
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2D5016] border-t-transparent" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MessageSquare size={32} className="text-[#a8a29e] mb-2" aria-hidden="true" />
                  <p className="text-sm text-[#57534e]">No past conversations yet</p>
                  <p className="text-xs text-[#a8a29e] mt-1">Start chatting to build your history</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <motion.button
                      key={session.id}
                      onClick={() => {
                        on_select_session(session.id);
                        on_close();
                      }}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-all group',
                        'hover:border-[#2D5016] hover:shadow-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]',
                        current_session_id === session.id
                          ? 'bg-[#F5F0E8] border-[#2D5016]'
                          : 'bg-white border-[#E7E0D0]'
                      )}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1C1917] truncate">
                            {get_session_title(session)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock size={11} className="text-[#a8a29e]" aria-hidden="true" />
                            <span className="text-xs text-[#a8a29e]">
                              {format_date(session.last_activity)}
                            </span>
                            <span className="text-xs text-[#a8a29e]">
                              · {session.messages.length} messages
                            </span>
                          </div>
                        </div>
                        {on_delete_session && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              on_delete_session(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                            aria-label="Delete conversation"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
