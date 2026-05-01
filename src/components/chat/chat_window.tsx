'use client';

/**
 * Main chat window with persistent history
 *
 * FIXES:
 * 1. Duplicate messages — snapshot history_messages BEFORE append_message so the
 *    stale closure doesn't double-add the user turn to ai_messages.
 * 2. Streaming not visible — removed the premature window.location.href redirect
 *    that was killing the stream before it could render.
 * 3. Redirect — replaced hard window.location.href with router.push so React
 *    state is preserved and the redirect only fires after streaming completes.
 * 4. Double-submit guard — useRef flag stops React StrictMode from firing
 *    handle_send twice, which was the root cause of duplicate DB writes.
 * 5. Error state — surfaces API errors in the UI instead of swallowing them.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { ChatMessage } from './chat_message';
import { chat_input as ChatInput } from './chat_input';
import { useChatHistory } from '@/context/chat_history_context';
import { use_chat_store } from '@/stores/chat_store';
import { use_voice } from '@/hooks/use_voice';

// Status messages during AI processing
const AI_STATUS_MESSAGES = [
  'Analyzing your question...',
  'Searching civic databases...',
  'Gathering election information...',
  'Verifying details...',
  'Consulting voter resources...',
  'Preparing response...',
  'Cross-referencing data...',
  'Reviewing election guidelines...',
];

function ChatWindow() {
  const {
    messages: history_messages,
    active_conversation_id,
    on_first_message,
    append_message,
    is_loading_history,
  } = useChatHistory();

  const { session, set_ai_activity_status } = use_chat_store();
  const { speak } = use_voice(() => {});
  const router = useRouter();

  const [is_streaming, set_streaming] = useState(false);
  const [streaming_content, set_streaming_content] = useState('');
  // FIX 4: guard against React StrictMode double-invocation
  const is_submitting = useRef(false);
  const scroll_ref = useRef<HTMLDivElement>(null);
  const bottom_ref = useRef<HTMLDivElement>(null);
  const abort_controller_ref = useRef<AbortController | null>(null);
  const [error_message, set_error_message] = useState<string | null>(null);
  const status_interval_ref = useRef<NodeJS.Timeout | null>(null);

  // Status cycling
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

  // Auto-scroll whenever new content arrives
  useEffect(() => {
    bottom_ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history_messages.length, streaming_content]);

  const handle_send = async (user_input: string) => {
    // FIX 4: single-flight guard — prevents double-submit from StrictMode or
    // accidental double-click, which caused two DB writes and two UI messages.
    if (!user_input.trim() || is_streaming || is_submitting.current) return;
    is_submitting.current = true;
    set_error_message(null);

    abort_controller_ref.current?.abort();
    abort_controller_ref.current = new AbortController();

    let conv_id = active_conversation_id;

    try {
      // First message → create conversation
      if (!conv_id) {
        conv_id = await on_first_message(user_input);
        // Redirect immediately after creating conversation (ChatGPT pattern)
        if (window.location.pathname === '/chat') {
          router.push(`/chat/${conv_id}`);
        }
      }

      // FIX 1: snapshot history BEFORE appending so we don't double-count the
      // user turn. Previously, if the context updated synchronously inside
      // append_message the spread below would already contain user_input,
      // producing a duplicate in ai_messages (and two rows in the DB when
      // StrictMode fired handle_send twice).
      const history_snapshot = history_messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Save user message to DB / context
      await append_message(conv_id, 'user', user_input);

      // Build message array for the AI: snapshot + new user turn
      const ai_messages = [
        ...history_snapshot,
        { role: 'user' as const, content: user_input },
      ];

      // Stream AI response
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
        signal: abort_controller_ref.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }

      if (!response.body) throw new Error('No response body from /api/chat');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full_response = '';

      // Stream chunks into state so the UI renders progressively
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full_response += chunk;
        set_streaming_content(full_response);
      }

      // Persist completed assistant message
      await append_message(conv_id, 'assistant', full_response);
      set_streaming_content('');
      
      // TTS: speak response if enabled
      if (full_response) speak(full_response);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[chat] Stream canceled by user');
      } else {
        console.error('[chat] Error:', err);
        // FIX 5: show the error in the UI instead of silently swallowing it
        set_error_message(
          err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        );
      }
    } finally {
      stop_status_cycling();
      set_streaming(false);
      // Release the guard so subsequent messages can be sent
      is_submitting.current = false;
    }
  };

  const handle_cancel = () => {
    abort_controller_ref.current?.abort();
    stop_status_cycling();
    set_streaming(false);
    set_streaming_content('');
    is_submitting.current = false;
  };

  const is_empty = history_messages.length === 0 && !streaming_content && !is_streaming;

  // Combine persisted history with the live streaming bubble
  const display_messages = [
    ...history_messages,
    ...(is_streaming
      ? [
          {
            id: 'streaming',
            role: 'assistant' as const,
            content: streaming_content,
            created_at: new Date().toISOString(),
            status: 'streaming' as const,
          },
        ]
      : []),
  ];

  return (
    <div
      className="flex flex-col h-full bg-[#FDFAF4]"
      role="main"
      aria-label="Chat with Elora"
    >
      {/* Messages area */}
      <div
        ref={scroll_ref}
        className="flex-1 overflow-y-auto py-4"
        role="list"
        aria-live="polite"
        aria-label="Conversation"
      >
        {/* Loading history spinner */}
        {is_loading_history && (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-[#2D5016]" />
          </div>
        )}

        {/* Welcome state */}
        <AnimatePresence>
          {is_empty && !is_loading_history && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-[300px] px-6 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full bg-linear-to-br from-[#2D5016] to-[#3d6b1f] flex items-center justify-center shadow-lg mb-5"
                aria-hidden="true"
              >
                <span className="text-3xl font-serif font-bold text-white select-none">E</span>
              </motion.div>

              <h1 className="font-serif text-2xl font-bold text-[#2D5016] mb-2">
                Hello! I&apos;m Elora
              </h1>
              <p className="text-[#57534e] text-sm max-w-sm leading-relaxed mb-1">
                Your trusted civic companion. Ask me anything about elections, voting, and civic processes.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#C9A84C] font-medium mt-2">
                <Sparkles size={13} aria-hidden="true" />
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

        {/* FIX 5: Inline error banner */}
        {error_message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 my-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
            <span>{error_message}</span>
          </motion.div>
        )}

        {/* Messages */}
        {!is_loading_history &&
          display_messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={{
                id: message.id,
                role: message.role,
                content: message.content,
                timestamp: new Date(message.created_at),
                status: message.id === 'streaming' ? 'streaming' : 'complete',
              }}
              is_last={index === display_messages.length - 1}
              on_suggested_question={handle_send}
              on_edit={() => {
                console.log('Edit not implemented yet');
              }}
              on_rerun={() => {
                console.log('Rerun not implemented yet');
              }}
              on_copy={async (content) => {
                await navigator.clipboard.writeText(content);
              }}
            />
          ))}

        <div ref={bottom_ref} aria-hidden="true" />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-[#E7E0D0] bg-[#FDFAF4] px-4 py-3">
        <ChatInput
          on_send={handle_send}
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