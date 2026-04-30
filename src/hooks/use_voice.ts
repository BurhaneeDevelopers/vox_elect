'use client';

/**
 * Custom hook for Web Speech API voice input + TTS output.
 * Degrades gracefully on unsupported browsers.
 */

import { useRef, useCallback, useEffect } from 'react';
import { use_chat_store } from '@/stores/chat_store';

interface use_voice_return {
  is_supported: boolean;
  start_listening: () => void;
  stop_listening: () => void;
  speak: (text: string) => void;
  stop_speaking: () => void;
}

export function use_voice(on_transcript: (text: string) => void): use_voice_return {
  const recognition_ref = useRef<SpeechRecognition | null>(null);
  const { voice_state, tts_enabled, set_voice_state } = use_chat_store();

  const is_supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const tts_supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const start_listening = useCallback(() => {
    if (!is_supported) return;

    type SpeechRecognitionConstructor = new () => SpeechRecognition;
    const win = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognitionClass = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => set_voice_state('listening');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        on_transcript(transcript.trim());
      }
      set_voice_state('idle');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('[Voice] Recognition error:', event.error);
      set_voice_state(event.error === 'not-allowed' ? 'error' : 'idle');
    };

    recognition.onend = () => {
      if (voice_state === 'listening') set_voice_state('idle');
    };

    recognition_ref.current = recognition;
    try {
      recognition.start();
    } catch {
      set_voice_state('error');
    }
  }, [is_supported, on_transcript, set_voice_state, voice_state]);

  const stop_listening = useCallback(() => {
    recognition_ref.current?.stop();
    recognition_ref.current = null;
    set_voice_state('idle');
  }, [set_voice_state]);

  const speak = useCallback(
    (text: string) => {
      if (!tts_supported || !tts_enabled) return;

      window.speechSynthesis.cancel();

      // Strip markdown for TTS
      const clean_text = text
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/>\s/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(clean_text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 0.9;
      utterance.lang = 'en-US';

      utterance.onstart = () => set_voice_state('speaking');
      utterance.onend = () => set_voice_state('idle');
      utterance.onerror = () => set_voice_state('idle');

      window.speechSynthesis.speak(utterance);
    },
    [tts_enabled, tts_supported, set_voice_state]
  );

  const stop_speaking = useCallback(() => {
    if (tts_supported) window.speechSynthesis.cancel();
    set_voice_state('idle');
  }, [tts_supported, set_voice_state]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognition_ref.current?.stop();
      if (tts_supported) window.speechSynthesis.cancel();
    };
  }, [tts_supported]);

  return { is_supported, start_listening, stop_listening, speak, stop_speaking };
}
