'use client';

/**
 * Voice input button with waveform animation.
 * Uses Web Speech API. Degrades to disabled if unsupported.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';
import { use_chat_store } from '@/stores/chat_store';
import { use_voice } from '@/hooks/use_voice';
import { cn } from '@/lib/utils';

interface voice_button_props {
  on_transcript: (text: string) => void;
  class_name?: string;
}

function waveform_animation() {
  return (
    <div
      className="flex items-center gap-0.5 h-5"
      aria-hidden="true"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`waveform_bar w-0.5 bg-white rounded-full h-full origin-bottom`}
          style={{ animationDelay: `${(i - 1) * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function voice_button({ on_transcript, class_name }: voice_button_props) {
  const { voice_state, voice_mode } = use_chat_store();
  const { is_supported, start_listening, stop_listening } = use_voice(on_transcript);

  const is_listening = voice_state === 'listening';
  const is_speaking = voice_state === 'speaking';
  const is_error = voice_state === 'error';

  const handle_click = () => {
    if (!is_supported) return;
    if (is_listening) {
      stop_listening();
    } else if (voice_mode === 'toggle') {
      start_listening();
    } else {
      start_listening();
    }
  };

  const handle_mouse_down = () => {
    if (voice_mode === 'push_to_talk' && is_supported && !is_listening) {
      start_listening();
    }
  };

  const handle_mouse_up = () => {
    if (voice_mode === 'push_to_talk' && is_listening) {
      stop_listening();
    }
  };

  const get_aria_label = () => {
    if (!is_supported) return 'Voice input not supported in this browser';
    if (is_error) return 'Microphone permission denied';
    if (is_listening) return 'Listening — click or release to stop';
    if (is_speaking) return 'Elara is speaking';
    return voice_mode === 'push_to_talk' ? 'Hold to speak' : 'Click to speak';
  };

  return (
    <motion.button
      type="button"
      onClick={handle_click}
      onMouseDown={handle_mouse_down}
      onMouseUp={handle_mouse_up}
      onTouchStart={handle_mouse_down}
      onTouchEnd={handle_mouse_up}
      disabled={!is_supported || is_error}
      aria-label={get_aria_label()}
      aria-pressed={is_listening}
      whileHover={is_supported && !is_error ? { scale: 1.05 } : {}}
      whileTap={is_supported && !is_error ? { scale: 0.95 } : {}}
      className={cn(
        'relative flex items-center justify-center rounded-full transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2',
        is_listening
          ? 'w-11 h-11 bg-red-500 shadow-lg shadow-red-200'
          : is_speaking
          ? 'w-10 h-10 bg-[#2D5016] shadow-md'
          : is_error
          ? 'w-10 h-10 bg-gray-300 cursor-not-allowed'
          : !is_supported
          ? 'w-10 h-10 bg-gray-200 cursor-not-allowed opacity-50'
          : 'w-10 h-10 bg-[#C9A84C] hover:bg-[#a8872e] shadow-sm cursor-pointer',
        class_name
      )}
    >
      <AnimatePresence mode="wait">
        {is_listening ? (
          <motion.div
            key="listening"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {waveform_animation()}
          </motion.div>
        ) : is_speaking ? (
          <motion.div
            key="speaking"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <Square size={14} className="text-white" aria-hidden="true" />
          </motion.div>
        ) : is_error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MicOff size={16} className="text-gray-500" aria-hidden="true" />
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Mic size={16} className="text-white" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse ring when listening */}
      {is_listening && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-red-400"
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}
