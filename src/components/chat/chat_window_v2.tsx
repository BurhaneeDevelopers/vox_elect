'use client';

/**
 * Main chat window with persistent history
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from './chat_message';
import { chat_input as ChatInput } from './chat_input';
import { useChatHistory } from '@/context/chat_history_context';
import { use_chat_store } from '@/stores/chat_store';

function ChatWindowV2() {
  const {
    messages: history_messages,
    active_conversation_id,
    on_first_message,
    append_message,
    is_loading_history,
  } = useChatHistory();
  
  const { session } = use_chat_store();
  const [is_streaming, set_streaming] = useState(false);
  const [streaming_content, set_streaming_content] = useState('');
  const scroll_ref = useRef<HTMLDivElement>(null);
  const bottom_ref = useRef<HTMLDivElement>(null);
  const abort_controller_ref = useRef<AbortController | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottom_ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history_messages.length, streaming_content]);

  const handle_send = async (user_input: string) => {
    if (!user_input.trim() || is_streaming) return;

    abort_controller_ref.current?.abort();
    abort_controller_ref.current = new AbortController();

    let conv_id = active_conversation_id;

    try {
      // First message → create conversation
      if (!conv_id) {
        conv_id = await on_first_message(user_input);
      }

      // Save user message
      await append_message(conv_id, 'user', user_input);

      // Build message history for AI (include just-saved user message)
      const ai_messages = [
        ...history_messages,
        { role: 'user' as const, content: user_input },
      ].map((m) => ({ role: m.role, content: m.content }));

      // Stream AI response via API
      set_streaming(true);
      set_streaming_content('');
      
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
        throw new Error(`HTTP ${response.status}`);
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

      // Save completed AI response
      await append_message(conv_id, 'assistant', full_response);
      set_streaming_content('');
      
      // Now safe to redirect (after streaming done)
      if (window.location.pathname === '/chat') {
        window.location.href = `/chat/${conv_id}`;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[chat] Stream canceled');
      } else {
        console.error('[chat] Error:', err);
      }
    } finally {
      set_streaming(false);
    }
  };

  const handle_cancel = () => {
    abort_controller_ref.current?.abort();
    set_streaming(false);
    set_streaming_content('');
  };

  const is_empty = history_messages.length === 0 && !streaming_content;

  // Combine history + streaming message
  const display_messages = [
    ...history_messages,
    ...(streaming_content
      ? [
          {
            id: 'streaming',
            role: 'assistant' as const,
            content: streaming_content,
            created_at: new Date().toISOString(),
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
        {/* Loading history */}
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
                // TODO: Implement edit
                console.log('Edit not implemented yet');
              }}
              on_rerun={() => {
                // TODO: Implement rerun
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

export { ChatWindowV2 as chat_window };
