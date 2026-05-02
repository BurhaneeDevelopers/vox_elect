'use client';

/**
 * Chat input bar with voice button, send button, ZIP detector, and TTS toggle.
 */

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, X } from 'lucide-react';
import { voice_button as VoiceButton } from './voice_button';
import { use_chat_store } from '@/stores/chat_store';
import { is_valid_zip_code, sanitise_input, cn } from '@/lib/utils';
import { MAX_INPUT_LENGTH, QUICK_PROMPTS } from '@/lib/constants';

interface chat_input_props {
  on_send: (message: string) => void;
  is_loading: boolean;
  on_cancel?: () => void;
}

export function chat_input({ on_send, is_loading, on_cancel }: chat_input_props) {
  const [input_value, set_input_value] = useState('');
  const [show_zip_hint, set_show_zip_hint] = useState(false);
  const textarea_ref = useRef<HTMLTextAreaElement>(null);

  const { active_zip, set_location_context, clear_location_context, voice_state } =
    use_chat_store();

  const detected_zip = input_value.match(/\b(\d{5})\b/)?.[1];

  const handle_submit = useCallback(() => {
    const trimmed = sanitise_input(input_value);
    if (!trimmed || is_loading) return;

    // Auto-set location context if ZIP detected
    if (detected_zip && is_valid_zip_code(detected_zip)) {
      set_location_context({ zip_code: detected_zip });
    }

    on_send(trimmed);
    set_input_value('');
    if (textarea_ref.current) {
      textarea_ref.current.style.height = 'auto';
    }
  }, [input_value, is_loading, detected_zip, on_send, set_location_context]);

  const handle_key_down = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handle_submit();
    }
  };

  const handle_input_change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, MAX_INPUT_LENGTH);
    set_input_value(value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
    set_show_zip_hint(Boolean(value.match(/\b\d{5}\b/)));
  };

  const handle_voice_transcript = useCallback(
    (transcript: string) => {
      set_input_value(transcript);
    },
    []
  );

  const handle_quick_prompt = (prompt: string) => {
    on_send(prompt);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Quick prompt chips — shown when input is empty and not loading */}
      {!input_value && !is_loading && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 px-1"
          role="group"
          aria-label="Quick prompts"
        >
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handle_quick_prompt(prompt)}
              disabled={voice_state === 'listening'}
              className={cn(
                "text-xs px-3 py-1 rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:outline-none",
                voice_state === 'listening' 
                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-[#F5F0E8] hover:bg-[#EDE7D6] border-[#E7E0D0] text-[#2D5016] cursor-pointer"
              )}
              aria-label={`Quick question: ${prompt}`}
            >
              {prompt}
            </button>
          ))}
        </motion.div>
      )}

      {/* Active ZIP indicator */}
      {active_zip && (
        <div className="flex items-center gap-1.5 px-1">
          <MapPin size={12} className="text-[#C9A84C]" aria-hidden="true" />
          <span className="text-xs text-[#57534e]">
            Location set: <span className="font-medium text-[#2D5016]">{active_zip}</span>
          </span>
          <button
            onClick={clear_location_context}
            className="ml-1 text-[#57534e] hover:text-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] rounded"
            aria-label="Clear location"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ZIP detection hint */}
      {show_zip_hint && detected_zip && !active_zip && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-1.5 px-2 py-1 bg-[#FDF8ED] border border-[#C9A84C]/30 rounded-lg text-xs text-[#57534e]"
          role="status"
        >
          <MapPin size={11} className="text-[#C9A84C]" aria-hidden="true" />
          ZIP <span className="font-semibold text-[#2D5016]">{detected_zip}</span> detected — local election info will be included
        </motion.div>
      )}

      {/* Main input row */}
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border px-3 py-2 bg-white transition-all duration-200',
          'focus-within:border-[#2D5016] focus-within:shadow-sm border-[#E7E0D0]'
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textarea_ref}
          value={input_value}
          onChange={handle_input_change}
          onKeyDown={handle_key_down}
          placeholder="Ask Elora about elections, voting, candidates…"
          rows={1}
          maxLength={MAX_INPUT_LENGTH}
          disabled={is_loading || voice_state === 'listening'}
          aria-label="Message to Elora"
          aria-describedby="char_count"
          className="flex-1 resize-none bg-transparent outline-none text-sm text-[#1C1917] placeholder-[#a8a29e] leading-relaxed min-h-[24px] max-h-[140px] py-0.5 disabled:opacity-60"
        />

        {/* Char count */}
        {input_value.length > 800 && (
          <span
            id="char_count"
            className="text-xs text-[#a8a29e] self-end mb-1 flex-shrink-0"
            aria-live="polite"
          >
            {MAX_INPUT_LENGTH - input_value.length}
          </span>
        )}

        {/* Voice button */}
        <VoiceButton
          on_transcript={handle_voice_transcript}
          class_name="flex-shrink-0 mb-0.5"
        />

        {/* Send / Cancel button */}
        {is_loading ? (
          <motion.button
            type="button"
            onClick={on_cancel}
            aria-label="Cancel response"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 mb-0.5 w-10 h-10 rounded-full bg-[#E7E0D0] hover:bg-[#d4ccc0] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] cursor-pointer"
          >
            <X size={16} className="text-[#57534e]" aria-hidden="true" />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handle_submit}
            disabled={!input_value.trim() || is_loading || voice_state === 'listening'}
            aria-label="Send message"
            whileHover={input_value.trim() ? { scale: 1.05 } : {}}
            whileTap={input_value.trim() ? { scale: 0.95 } : {}}
            className={cn(
              'flex-shrink-0 mb-0.5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2',
              input_value.trim() && !is_loading && voice_state !== 'listening'
                ? 'bg-[#2D5016] hover:bg-[#3d6b1f] text-white shadow-sm cursor-pointer'
                : 'bg-[#E7E0D0] text-[#a8a29e] cursor-not-allowed'
            )}
          >
            <Send size={15} aria-hidden="true" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
