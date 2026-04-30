'use client';

/**
 * Main chat window — scrolling message list + input bar.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { chat_message_component as ChatMessage } from './chat_message';
import { chat_input as ChatInput } from './chat_input';
import { use_chat } from '@/hooks/use_chat';
import { use_chat_store } from '@/stores/chat_store';

function ChatWindow() {
  const { send_message, cancel_stream, is_loading, messages } = use_chat();
  use_chat_store();
  const scroll_ref = useRef<HTMLDivElement>(null);
  const bottom_ref = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottom_ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  const handle_suggested_question = (question: string) => {
    send_message(question);
  };

  const is_empty = messages.length === 0;

  return (
    <div
      className="flex flex-col h-full bg-[#FDFAF4]"
      role="main"
      aria-label="Chat with Elara, your civic guide"
    >
      {/* Messages area */}
      <div
        ref={scroll_ref}
        className="flex-1 overflow-y-auto py-4"
        role="list"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Conversation"
      >
        {/* Welcome state */}
        <AnimatePresence>
          {is_empty && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-[300px] px-6 text-center"
            >
              {/* Elara avatar */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2D5016] to-[#3d6b1f] flex items-center justify-center shadow-lg mb-5"
                aria-hidden="true"
              >
                <span className="text-3xl font-serif font-bold text-white select-none">E</span>
              </motion.div>

              <h1 className="font-serif text-2xl font-bold text-[#2D5016] mb-2">
                Hello! I&apos;m Elara
              </h1>
              <p className="text-[#57534e] text-sm max-w-sm leading-relaxed mb-1">
                Your trusted civic companion. I&apos;m here to help you understand elections,
                voting, candidates, and civic processes — clearly and without any political bias.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#C9A84C] font-medium mt-2">
                <Sparkles size={13} aria-hidden="true" />
                <span>Powered by <a href="https://wa.me/+919003078610" target='_blank' rel='noopener'>Taheri Developers</a></span>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {[
                  '🗳️ Voter registration',
                  '📍 Polling locations',
                  '📅 Election deadlines',
                  '🎙️ Voice enabled',
                  '⚖️ Always neutral',
                ].map((badge) => (
                  <span
                    key={badge}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#F5F0E8] border border-[#E7E0D0] text-[#57534e]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            is_last={index === messages.length - 1}
            on_suggested_question={handle_suggested_question}
          />
        ))}

        <div ref={bottom_ref} aria-hidden="true" />
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 border-t border-[#E7E0D0] bg-[#FDFAF4] px-4 py-3"
        role="region"
        aria-label="Message input"
      >
        <ChatInput
          on_send={send_message}
          is_loading={is_loading}
          on_cancel={cancel_stream}
        />
        {/* Neutrality disclaimer */}
        <p className="text-center text-[10px] text-[#a8a29e] mt-2">
          Elara provides factual civic information only. Never partisan. Always neutral.
        </p>
      </div>
    </div>
  );
}

export { ChatWindow as chat_window };
