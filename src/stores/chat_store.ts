'use client';

/**
 * Zustand store for VoxElect chat session state.
 * Manages messages, voice state, location context, and UI panels.
 */

import { create } from 'zustand';
import { generate_id, extract_suggested_question, strip_suggested_question, extract_zip_from_message } from '@/lib/utils';
import type { chat_message, chat_session, user_location_context } from '@/types/chat_types';
import type { voice_state, voice_mode } from '@/types/voice_types';

interface chat_store_state {
  session: chat_session;
  is_loading: boolean;
  voice_state: voice_state;
  voice_mode: voice_mode;
  tts_enabled: boolean;
  right_panel_open: boolean;
  active_zip: string | null;

  // Actions
  add_user_message: (content: string) => chat_message;
  start_assistant_message: () => string;
  append_to_message: (id: string, chunk: string) => void;
  complete_message: (id: string) => void;
  error_message: (id: string, error_text: string) => void;
  set_loading: (loading: boolean) => void;
  set_voice_state: (state: voice_state) => void;
  set_voice_mode: (mode: voice_mode) => void;
  toggle_tts: () => void;
  toggle_right_panel: () => void;
  set_location_context: (ctx: user_location_context) => void;
  clear_location_context: () => void;
  send_suggested_question: (question: string) => void;
  reset_session: () => void;
}

function create_new_session(): chat_session {
  return {
    id: generate_id(),
    messages: [],
    location_context: null,
    created_at: new Date(),
    last_activity: new Date(),
  };
}

export const use_chat_store = create<chat_store_state>((set, get) => ({
  session: create_new_session(),
  is_loading: false,
  voice_state: 'idle',
  voice_mode: 'push_to_talk',
  tts_enabled: false,
  right_panel_open: false,
  active_zip: null,

  add_user_message: (content: string): chat_message => {
    const message: chat_message = {
      id: generate_id(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'complete',
    };

    // Auto-detect ZIP from message
    const zip = extract_zip_from_message(content);

    set((state) => ({
      session: {
        ...state.session,
        messages: [...state.session.messages, message],
        last_activity: new Date(),
      },
      active_zip: zip ?? state.active_zip,
    }));

    return message;
  },

  start_assistant_message: (): string => {
    const id = generate_id();
    const message: chat_message = {
      id,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'streaming',
    };

    set((state) => ({
      session: {
        ...state.session,
        messages: [...state.session.messages, message],
      },
    }));

    return id;
  },

  append_to_message: (id: string, chunk: string) => {
    set((state) => ({
      session: {
        ...state.session,
        messages: state.session.messages.map((m) =>
          m.id === id ? { ...m, content: m.content + chunk } : m
        ),
      },
    }));
  },

  complete_message: (id: string) => {
    set((state) => {
      const updated_messages = state.session.messages.map((m) => {
        if (m.id !== id) return m;
        const suggested = extract_suggested_question(m.content);
        const clean_content = strip_suggested_question(m.content);
        return {
          ...m,
          content: clean_content,
          status: 'complete' as const,
          suggested_questions: suggested,
        };
      });

      return {
        session: {
          ...state.session,
          messages: updated_messages,
          last_activity: new Date(),
        },
      };
    });
  },

  error_message: (id: string, error_text: string) => {
    set((state) => ({
      session: {
        ...state.session,
        messages: state.session.messages.map((m) =>
          m.id === id
            ? { ...m, content: error_text, status: 'error' as const }
            : m
        ),
      },
    }));
  },

  set_loading: (loading: boolean) => set({ is_loading: loading }),

  set_voice_state: (state: voice_state) => set({ voice_state: state }),

  set_voice_mode: (mode: voice_mode) => set({ voice_mode: mode }),

  toggle_tts: () => set((state) => ({ tts_enabled: !state.tts_enabled })),

  toggle_right_panel: () => set((state) => ({ right_panel_open: !state.right_panel_open })),

  set_location_context: (ctx: user_location_context) => {
    set((state) => ({
      session: { ...state.session, location_context: ctx },
      active_zip: ctx.zip_code,
    }));
  },

  clear_location_context: () => {
    set((state) => ({
      session: { ...state.session, location_context: null },
      active_zip: null,
    }));
  },

  send_suggested_question: (question: string) => {
    const store = get();
    if (!store.is_loading) {
      store.add_user_message(question);
    }
  },

  reset_session: () => {
    set({
      session: create_new_session(),
      is_loading: false,
      voice_state: 'idle',
      active_zip: null,
    });
  },
}));
