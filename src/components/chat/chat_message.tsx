'use client';

/**
 * Individual chat message component.
 * User messages: gold-tinted bubbles, right-aligned.
 * Elara messages: white with green left-border, left-aligned.
 */

import { motion } from 'framer-motion';
import { AlertCircle, User, Loader2 } from 'lucide-react';
import { response_renderer as ResponseRenderer } from './response_renderer';
import { suggested_questions_bar as SuggestedQuestionsBar } from './suggested_questions_bar';
import type { chat_message } from '@/types/chat_types';
import { cn } from '@/lib/utils';
import { use_chat_store } from '@/stores/chat_store';

interface chat_message_props {
  message: chat_message;
  on_suggested_question?: (q: string) => void;
  is_last?: boolean;
}

function ai_activity_indicator() {
  const { ai_activity_status } = use_chat_store();
  
  return (
    <div className="flex items-center gap-2 py-1 px-1" aria-label="Elara is working" role="status">
      <Loader2 className="w-4 h-4 text-[#2D5016] animate-spin" aria-hidden="true" />
      <span className="text-sm text-[#57534e] font-medium animate-pulse">
        {ai_activity_status}
      </span>
    </div>
  );
}

export function chat_message_component({
  message,
  on_suggested_question,
  is_last = false,
}: chat_message_props) {
  const is_user = message.role === 'user';
  const is_error = message.status === 'error';
  const is_streaming = message.status === 'streaming';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex gap-3 px-4 py-1',
        is_user ? 'flex-row-reverse' : 'flex-row'
      )}
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
              <span className="font-medium">Connection issue</span>
            </div>
          )}

          {is_user ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : is_streaming && !message.content ? (
            ai_activity_indicator()
          ) : (
            <ResponseRenderer content={message.content} />
          )}
        </div>

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
