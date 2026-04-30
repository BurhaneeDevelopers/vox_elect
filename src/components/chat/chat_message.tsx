'use client';

/**
 * Individual chat message component.
 * User messages: gold-tinted bubbles, right-aligned.
 * Elara messages: white with green left-border, left-aligned.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, User, Loader2 } from 'lucide-react';
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
  on_edit?: (message_id: string) => void;
  on_rerun?: (message_id: string) => void;
  on_copy?: (content: string) => void;
}

export function ChatMessage({
  message,
  on_suggested_question,
  is_last = false,
  on_edit,
  on_rerun,
  on_copy,
}: chat_message_props) {
  const [is_hovered, set_is_hovered] = useState(false);
  const { ai_activity_status } = use_chat_store();
  
  const is_user = message.role === 'user';
  const is_error = message.status === 'error';
  const is_streaming = message.status === 'streaming';

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
      aria-label={is_user ? 'Your message' : "Elara's response"}
    >
      {/* Avatar */}
      {!is_user && (
        <div
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
            'bg-[#2D5016] text-white shadow-sm',
            is_streaming && 'elara_thinking'
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
          {is_user ? 'You' : 'Elara'}
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

          {is_user ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : is_streaming && !message.content ? (
            <div className="flex items-center gap-2 py-1 px-1" aria-label="Elara is working" role="status">
              <Loader2 className="w-4 h-4 text-[#2D5016] animate-spin" aria-hidden="true" />
              <span className="text-sm text-[#57534e] font-medium animate-pulse">
                {ai_activity_status}
              </span>
            </div>
          ) : (
            <ResponseRenderer content={message.content} />
          )}
        </div>

        {/* Hover actions - below bubble */}
        <AnimatePresence>
          {is_hovered && message.status === 'complete' && (
            <MessageActions
              message_id={message.id}
              role={message.role}
              content={message.content}
              on_edit={on_edit}
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
