'use client';

/**
 * Core chat hook — sends messages to /api/chat, handles streaming, TTS.
 */

import { useCallback, useRef } from 'react';
import { use_chat_store } from '@/stores/chat_store';
import { use_voice } from './use_voice';
import { sanitise_input } from '@/lib/utils';

// Dynamic status messages that cycle during AI processing
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

export function use_chat() {
  const {
    session,
    is_loading,
    add_user_message,
    start_assistant_message,
    append_to_message,
    complete_message,
    error_message,
    set_loading,
    set_ai_activity_status,
  } = use_chat_store();

  const abort_controller_ref = useRef<AbortController | null>(null);
  const status_interval_ref = useRef<NodeJS.Timeout | null>(null);

  const { speak } = use_voice(() => {});

  // Cycle through status messages
  const start_status_cycling = useCallback(() => {
    let index = 0;
    set_ai_activity_status(AI_STATUS_MESSAGES[0]);
    
    status_interval_ref.current = setInterval(() => {
      index = (index + 1) % AI_STATUS_MESSAGES.length;
      set_ai_activity_status(AI_STATUS_MESSAGES[index]);
    }, 2000); // Change status every 2 seconds
  }, [set_ai_activity_status]);

  const stop_status_cycling = useCallback(() => {
    if (status_interval_ref.current) {
      clearInterval(status_interval_ref.current);
      status_interval_ref.current = null;
    }
  }, []);

  const send_message = useCallback(
    async (content: string) => {
      const trimmed = sanitise_input(content);
      if (!trimmed || is_loading) return;

      // Cancel any in-flight request
      abort_controller_ref.current?.abort();
      abort_controller_ref.current = new AbortController();

      add_user_message(trimmed);
      const assistant_id = start_assistant_message();
      set_loading(true);
      start_status_cycling();

      // Build message history for the API (exclude streaming placeholder)
      const history = session.messages
        .filter((m) => m.status === 'complete' && m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      // Add current user message
      history.push({ role: 'user', content: trimmed });

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            location_context: session.location_context,
          }),
          signal: abort_controller_ref.current.signal,
        });

        if (!response.ok) {
          const err_data = await response.json().catch(() => ({ error: 'Server error' })) as { error?: string };
          throw new Error(err_data.error ?? `HTTP ${response.status}`);
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let full_text = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full_text += chunk;
          append_to_message(assistant_id, chunk);
        }

        complete_message(assistant_id);

        // Speak the completed response if TTS is on
        if (full_text) speak(full_text);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          stop_status_cycling();
          return;
        }
        const msg = err instanceof Error ? err.message : 'Something went wrong.';
        error_message(
          assistant_id,
          `I'm having trouble connecting right now. ${msg} Please try again in a moment.`
        );
      } finally {
        stop_status_cycling();
        set_loading(false);
      }
    },
    [
      session,
      is_loading,
      add_user_message,
      start_assistant_message,
      append_to_message,
      complete_message,
      error_message,
      set_loading,
      set_ai_activity_status,
      start_status_cycling,
      stop_status_cycling,
      speak,
    ]
  );

  const cancel_stream = useCallback(() => {
    abort_controller_ref.current?.abort();
    stop_status_cycling();
    set_loading(false);
  }, [set_loading, stop_status_cycling]);

  return { send_message, cancel_stream, is_loading, messages: session.messages };
}
