'use client';

/**
 * Individual chat message component.
 * User messages: gold-tinted bubbles, right-aligned.
 * Elora messages: white with green left-border, left-aligned.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, User, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { response_renderer as ResponseRenderer } from './response_renderer';
import { suggested_questions_bar as SuggestedQuestionsBar } from './suggested_questions_bar';
import { message_actions as MessageActions } from './message_actions';
import type { chat_message } from '@/types/chat_types';
import { cn } from '@/lib/utils';
import { use_chat_store } from '@/stores/chat_store';

interface chat_message_props {
  message: chat_message;
  on_suggested_question?: (q: string) => void;
  is_last?: boolean;
  on_edit?: (message_id: string, new_content: string) => void;
  on_rerun?: (message_id: string) => void;
  on_copy?: (content: string) => void;
  on_prev_sibling?: (message_id: string) => void;
  on_next_sibling?: (message_id: string) => void;
  sibling_index?: number;
  sibling_count?: number;
}

export function ChatMessage({
  message,
  on_suggested_question,
  is_last = false,
  on_edit,
  on_rerun,
  on_copy,
  on_prev_sibling,
  on_next_sibling,
  sibling_index,
  sibling_count,
}: chat_message_props) {
  const [is_hovered, set_is_hovered] = useState(false);
  const [is_editing, set_is_editing] = useState(false);
  const [edit_value, set_edit_value] = useState(message.content);
  const { ai_activity_status, voice_state } = use_chat_store();
  
  const is_user = message.role === 'user';
  const is_error = message.status === 'error';
  const is_streaming = message.status === 'streaming';

  const handle_save_edit = () => {
    if (edit_value.trim() && edit_value !== message.content) {
      on_edit?.(message.id, edit_value.trim());
    }
    set_is_editing(false);
  };

  const handle_cancel_edit = () => {
    set_edit_value(message.content);
    set_is_editing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex gap-3 px-4 py-1 relative group',
        is_user ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => set_is_hovered(true)}
      onMouseLeave={() => set_is_hovered(false)}
      role="listitem"
      aria-label={is_user ? 'Your message' : "Elora's response"}
    >
      {/* Avatar */}
      {!is_user && (
        <div
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
            'bg-[#2D5016] text-white shadow-sm',
            is_streaming && 'Elora_thinking'
          )}
          aria-hidden="true"
        >
          <span className="text-sm font-serif font-bold select-none">E</span>
        </div>
      )}

      {is_user && (
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[#C9A84C] text-white shadow-sm"
          aria-hidden="true"
        >
          <User size={16} />
        </div>
      )}

      {/* Bubble */}
      <div className={cn('flex flex-col gap-2 max-w-[82%]', is_user ? 'items-end' : 'items-start')}>
        {/* Name label */}
        <span className={cn('text-xs font-medium', is_user ? 'text-[#a8872e]' : 'text-[#2D5016]')}>
          {is_user ? 'You' : 'Elora'}
        </span>

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            is_user
              ? 'bg-[#FDF3D0] border border-[#C9A84C]/30 rounded-tr-sm text-[#1C1917]'
              : is_error
              ? 'bg-red-50 border-l-4 border-red-400 text-red-700 rounded-tl-sm'
              : 'bg-white border-l-4 border-[#2D5016] rounded-tl-sm text-[#1C1917]'
          )}
        >
          {is_error && (
            <div className="flex items-center gap-2 text-sm text-red-600 mb-1">
              <AlertCircle size={14} aria-hidden="true" />
              <span className="font-medium">Oops..</span>
            </div>
          )}

          {is_editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={edit_value}
                onChange={(e) => set_edit_value(e.target.value)}
                className="w-full min-h-[60px] p-2 text-sm border border-[#E7E0D0] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handle_save_edit();
                  } else if (e.key === 'Escape') {
                    handle_cancel_edit();
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handle_cancel_edit}
                  className="px-3 py-1 text-xs rounded-lg border border-[#E7E0D0] hover:bg-[#F5F0E8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handle_save_edit}
                  className="px-3 py-1 text-xs rounded-lg bg-[#2D5016] text-white hover:bg-[#3d6b1f] transition-colors"
                >
                  Save & Submit
                </button>
              </div>
            </div>
          ) : is_user ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
              {message.content}
            </p>
          ) : is_streaming && !message.content ? (
            <div className="flex items-center gap-2 py-1 px-1" aria-label="Elora is working" role="status">
              <Loader2 className="w-4 h-4 text-[#2D5016] animate-spin" aria-hidden="true" />
              <span className="text-sm text-[#57534e] font-medium animate-pulse">
                {ai_activity_status}
              </span>
            </div>
          ) : (
            <ResponseRenderer content={message.content} />
          )}
        </div>

        {/* Branch navigation for assistant messages with siblings */}
        {!is_user && sibling_count && sibling_count > 1 && sibling_index !== undefined && (
          <div className="flex items-center gap-2 text-xs text-[#57534e]">
            <button
              onClick={() => on_prev_sibling?.(message.id)}
              disabled={sibling_index === 0 || voice_state === 'listening'}
              className="p-1 rounded hover:bg-[#F5F0E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous response"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-medium">
              {sibling_index + 1} / {sibling_count}
            </span>
            <button
              onClick={() => on_next_sibling?.(message.id)}
              disabled={sibling_index === sibling_count - 1 || voice_state === 'listening'}
              className="p-1 rounded hover:bg-[#F5F0E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next response"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Hover actions - below bubble */}
        <AnimatePresence>
          {is_hovered && message.status === 'complete' && !is_editing && voice_state !== 'listening' && (
            <MessageActions
              message_id={message.id}
              role={message.role}
              content={message.content}
              on_edit={() => set_is_editing(true)}
              on_rerun={on_rerun}
              on_copy={on_copy}
            />
          )}
        </AnimatePresence>

        {/* Suggested follow-up questions */}
        {is_last &&
          !is_user &&
          message.status === 'complete' &&
          message.suggested_questions &&
          message.suggested_questions.length > 0 &&
          on_suggested_question && (
            <SuggestedQuestionsBar
              questions={message.suggested_questions}
              on_select={on_suggested_question}
            />
          )}
      </div>
    </motion.div>
  );
}
