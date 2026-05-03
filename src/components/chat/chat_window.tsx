/**
 * Chat window with branching support
 * Production-grade implementation
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { ChatMessage } from './chat_message';
import { ChatInput as ChatInput } from './chat_input';
import { useChatHistory } from '@/context/chat_history_context';
import { use_chat_store } from '@/stores/chat_store';
import { use_voice } from '@/hooks/use_voice';
import { extract_suggested_question, strip_suggested_question } from '@/lib/utils';

const AI_STATUS_MESSAGES = [
  'Analyzing your question...',
  'Searching civic databases...',
  'Gathering election information...',
  'Verifying details...',
  'Consulting voter resources...',
  'Preparing response...',
];

function ChatWindow() {
  const {
    messages,
    active_conversation_id,
    is_loading,
    create_first_message,
    add_message,
    regenerate,
    edit_message,
    navigate_sibling,
  } = useChatHistory();

  const { session, set_ai_activity_status, tts_enabled } = use_chat_store();
  const { speak } = use_voice(() => {});
  const router = useRouter();

  const [is_streaming, set_streaming] = useState(false);
  const [streaming_content, set_streaming_content] = useState('');
  const [error_msg, set_error_msg] = useState<string | null>(null);
  
  const is_submitting = useRef(false);
  const abort_controller_ref = useRef<AbortController | null>(null);
  const status_interval_ref = useRef<NodeJS.Timeout | null>(null);
  const bottom_ref = useRef<HTMLDivElement>(null);
  const last_user_msg_id_ref = useRef<string | null>(null);

  // ============================================================================
  // Status cycling
  // ============================================================================
  
  const start_status_cycling = useCallback(() => {
    let index = 0;
    set_ai_activity_status(AI_STATUS_MESSAGES[0]);
    status_interval_ref.current = setInterval(() => {
      index = (index + 1) % AI_STATUS_MESSAGES.length;
      set_ai_activity_status(AI_STATUS_MESSAGES[index]);
    }, 2000);
  }, [set_ai_activity_status]);

  const stop_status_cycling = useCallback(() => {
    if (status_interval_ref.current) {
      clearInterval(status_interval_ref.current);
      status_interval_ref.current = null;
    }
    set_ai_activity_status('');
  }, [set_ai_activity_status]);

  // ============================================================================
  // Auto-scroll
  // ============================================================================
  
  useEffect(() => {
    bottom_ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streaming_content]);

  // ============================================================================
  // Send message (core logic)
  // ============================================================================
  
  const generate_assistant_response = useCallback(
    async (
      conv_id: string,
      user_msg_id: string,
      ai_messages: { role: 'user' | 'assistant'; content: string }[]
    ) => {
      try {
        set_streaming(true);
        set_streaming_content('');
        start_status_cycling();

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: ai_messages,
            location_context: session.location_context,
          }),
          signal: abort_controller_ref.current?.signal,
        });

        if (!response.ok) {
          throw new Error(`API error ${response.status}`);
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let full_response = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full_response += chunk;
          set_streaming_content(full_response);
        }

        // Save assistant response
        await add_message(conv_id, 'assistant', full_response, user_msg_id);
        set_streaming_content('');
        
        // TTS
        if (tts_enabled && full_response) speak(strip_suggested_question(full_response));
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[chat] Canceled');
        } else {
          console.error('[chat]', err);
          set_error_msg(err instanceof Error ? err.message : 'Error occurred');
        }
      } finally {
        stop_status_cycling();
        set_streaming(false);
        is_submitting.current = false;
      }
    },
    [session, start_status_cycling, stop_status_cycling, add_message, speak, tts_enabled]
  );

  const send_message = useCallback(
    async (user_input: string, parent_id?: string | null) => {
      if (!user_input.trim() || is_streaming || is_submitting.current) return;
      
      is_submitting.current = true;
      set_error_msg(null);

      abort_controller_ref.current?.abort();
      abort_controller_ref.current = new AbortController();

      let conv_id = active_conversation_id;

      try {
        // Create conversation if first message
        if (!conv_id) {
          conv_id = await create_first_message(user_input);
          if (window.location.pathname === '/chat') {
            window.history.replaceState(null, '', `/chat/${conv_id}`);
          }
        }

        // Save user message
        const user_msg_id = await add_message(conv_id, 'user', user_input, parent_id);
        last_user_msg_id_ref.current = user_msg_id;

        // Build AI context
        let context_messages = messages;
        if (parent_id !== undefined) {
          if (parent_id === null) {
            context_messages = [];
          } else {
            const parent_index = messages.findIndex(m => m.id === parent_id);
            if (parent_index !== -1) {
              context_messages = messages.slice(0, parent_index + 1);
            } else {
              context_messages = [];
            }
          }
        }

        const ai_messages = context_messages.map(m => ({ 
          role: m.role, 
          content: strip_suggested_question(m.content)
        }));
        
        ai_messages.push({ role: 'user', content: user_input });

        await generate_assistant_response(conv_id, user_msg_id, ai_messages);
      } catch (err) {
        console.error('[chat] Send error', err);
        set_error_msg('Failed to send message');
        is_submitting.current = false;
      }
    },
    [
      active_conversation_id,
      is_streaming,
      messages,
      create_first_message,
      add_message,
      router,
      generate_assistant_response,
    ]
  );

  // ============================================================================
  // User actions
  // ============================================================================
  
  const handle_cancel = useCallback(() => {
    abort_controller_ref.current?.abort();
    stop_status_cycling();
    set_streaming(false);
    set_streaming_content('');
    is_submitting.current = false;
  }, [stop_status_cycling]);

  const handle_edit = useCallback(
    async (message_id: string, new_content: string) => {
      const parent_id = await edit_message(message_id);
      await send_message(new_content, parent_id);
    },
    [edit_message, send_message]
  );

  const handle_regenerate = useCallback(
    async (user_message_id: string) => {
      if (is_streaming || is_submitting.current) return;
      
      const msg_index = messages.findIndex(m => m.id === user_message_id);
      if (msg_index === -1) return;
      const msg = messages[msg_index];
      if (msg.role !== 'user') return;

      is_submitting.current = true;
      set_error_msg(null);

      abort_controller_ref.current?.abort();
      abort_controller_ref.current = new AbortController();

      try {
        await regenerate(user_message_id);
        
        const ai_messages = messages.slice(0, msg_index + 1).map(m => ({ 
          role: m.role, 
          content: strip_suggested_question(m.content)
        }));

        await generate_assistant_response(active_conversation_id!, user_message_id, ai_messages);
      } catch (err) {
        console.error('[chat] Regenerate error', err);
        set_error_msg('Failed to regenerate response');
        is_submitting.current = false;
      }
    },
    [messages, regenerate, active_conversation_id, generate_assistant_response, is_streaming]
  );

  const handle_sibling_nav = useCallback(
    async (message_id: string, direction: 'prev' | 'next') => {
      await navigate_sibling(message_id, direction);
    },
    [navigate_sibling]
  );

  // ============================================================================
  // Display messages
  // ============================================================================
  
  const display_messages = [
    ...messages,
    ...(is_streaming
      ? [
          {
            id: 'streaming',
            role: 'assistant' as const,
            content: streaming_content,
            created_at: new Date().toISOString(),
            sibling_index: 0,
            sibling_count: 1,
            siblings: [],
          },
        ]
      : []),
  ];

  const is_empty = messages.length === 0 && !streaming_content && !is_streaming;

  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <div className="flex flex-col h-full bg-[#FDFAF4]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4" role="list">
        {is_loading && (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-[#2D5016]" />
          </div>
        )}

        {/* Welcome */}
        <AnimatePresence>
          {is_empty && !is_loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-[300px] px-6 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2D5016] to-[#3d6b1f] flex items-center justify-center shadow-lg mb-5"
              >
                <span className="text-3xl font-serif font-bold text-white">E</span>
              </motion.div>

              <h1 className="font-serif text-2xl font-bold text-[#2D5016] mb-2">
                Hello! I&apos;m Elora
              </h1>
              <p className="text-[#57534e] text-sm max-w-sm leading-relaxed mb-1">
                Your trusted civic companion. Ask me anything about elections, voting, and civic processes.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#C9A84C] font-medium mt-2">
                <Sparkles size={13} />
                <span>Powered by Taheri Developers</span>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {['🗳️ Voter registration', '📍 Polling locations', '📅 Deadlines', '⚖️ Neutral'].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="text-xs px-2.5 py-1 rounded-full bg-[#F5F0E8] border border-[#E7E0D0] text-[#57534e]"
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error_msg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 my-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle size={15} className="shrink-0" />
            <span>{error_msg}</span>
          </motion.div>
        )}

        {/* Messages */}
        {!is_loading &&
          display_messages.map((msg, index) => {
            const suggested = extract_suggested_question(msg.content);
            const clean_content = strip_suggested_question(msg.content);

            return (
              <ChatMessage
                key={msg.id}
                message={{
                  id: msg.id,
                  role: msg.role,
                  content: clean_content,
                  timestamp: new Date(msg.created_at),
                  status: msg.id === 'streaming' ? 'streaming' : 'complete',
                  suggested_questions: suggested.length > 0 ? suggested : undefined,
                }}
                is_last={index === display_messages.length - 1}
                on_suggested_question={send_message}
                on_edit={handle_edit}
                on_rerun={handle_regenerate}
                on_copy={async (content) => {
                  await navigator.clipboard.writeText(content);
                }}
                on_prev_sibling={() => handle_sibling_nav(msg.id, 'prev')}
                on_next_sibling={() => handle_sibling_nav(msg.id, 'next')}
                sibling_index={msg.sibling_index}
                sibling_count={msg.sibling_count}
              />
            );
          })}

        <div ref={bottom_ref} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[#E7E0D0] bg-[#FDFAF4] px-4 py-3">
        <ChatInput
          on_send={send_message}
          is_loading={is_streaming}
          on_cancel={handle_cancel}
        />
        <p className="text-center text-[10px] text-[#a8a29e] mt-2">
          Elora provides factual civic information only. Never partisan. Always neutral.
        </p>
      </div>
    </div>
  );
}

export { ChatWindow as chat_window };
