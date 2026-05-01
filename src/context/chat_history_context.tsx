/**
 * Chat history context — persistent conversations
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { use_auth } from '@/hooks/use_auth';
import {
  get_conversations,
  create_conversation,
  get_messages,
  save_message,
  delete_conversation,
  type Conversation,
  type Message,
} from '@/lib/db/conversations';

interface ChatHistoryContextValue {
  conversations: Conversation[];
  active_conversation_id: string | null;
  messages: Message[];
  is_loading_history: boolean;
  start_new_chat: () => void;
  select_conversation: (id: string) => Promise<void>;
  on_first_message: (user_message: string) => Promise<string>;
  append_message: (conversation_id: string, role: 'user' | 'assistant', content: string) => Promise<void>;
  remove_conversation: (id: string) => Promise<void>;
}

const ChatHistoryContext = createContext<ChatHistoryContextValue | undefined>(undefined);

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within ChatHistoryProvider');
  }
  return context;
}

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const { user } = use_auth();
  const router = useRouter();
  const params = useParams();
  const [conversations, set_conversations] = useState<Conversation[]>([]);
  const [active_id, set_active_id] = useState<string | null>(null);
  const [messages, set_messages] = useState<Message[]>([]);
  const [is_loading_history, set_loading] = useState(false);

  // Load sidebar on mount
  useEffect(() => {
    if (!user) return;
    set_loading(true);
    get_conversations(user.id)
      .then(set_conversations)
      .catch(console.error)
      .finally(() => set_loading(false));
  }, [user]);

  const start_new_chat = useCallback(() => {
    console.log('[start_new_chat] Called, current path:', window.location.pathname);
    set_active_id(null);
    set_messages([]);
    
    // Force navigation
    if (window.location.pathname !== '/chat') {
      console.log('[start_new_chat] Navigating to /chat');
      window.location.href = '/chat';
    } else {
      console.log('[start_new_chat] Already at /chat, reloading');
      window.location.reload();
    }
  }, []);

  const select_conversation = useCallback(async (id: string) => {
    set_loading(true);
    set_active_id(id);
    router.push(`/chat/${id}`);
    try {
      const msgs = await get_messages(id);
      set_messages(msgs);
    } catch (err) {
      console.error('[select_conversation] Error:', err);
    } finally {
      set_loading(false);
    }
  }, [router]);

  // Load conversation from URL param
  useEffect(() => {
    const id = params?.id as string | undefined;
    if (id && id !== active_id) {
      select_conversation(id);
    }
  }, [params?.id, active_id, select_conversation]);

  // Called when user sends FIRST message in a new chat
  const on_first_message = useCallback(
    async (user_message: string): Promise<string> => {
      if (!user) throw new Error('Not authenticated');
      
      const conv = await create_conversation(user.id, user_message);
      set_active_id(conv.id);
      set_conversations((prev) => [
        { ...conv, updated_at: new Date().toISOString() },
        ...prev,
      ]);
      
      // Don't redirect yet — let chat_window handle it after streaming
      
      return conv.id;
    },
    [user]
  );

  const append_message = useCallback(
    async (conversation_id: string, role: 'user' | 'assistant', content: string) => {
      // Optimistic update
      const optimistic: Message = {
        id: crypto.randomUUID(),
        role,
        content,
        created_at: new Date().toISOString(),
      };
      set_messages((prev) => [...prev, optimistic]);

      try {
        await save_message(conversation_id, role, content);

        // Bubble conversation to top of sidebar
        set_conversations((prev) => {
          const idx = prev.findIndex((c) => c.id === conversation_id);
          if (idx < 0) return prev;
          
          const updated = { ...prev[idx], updated_at: new Date().toISOString() };
          return [updated, ...prev.filter((_, i) => i !== idx)];
        });
      } catch (err) {
        console.error('[append_message] Error:', err);
      }
    },
    []
  );

  const remove_conversation = useCallback(
    async (id: string) => {
      try {
        await delete_conversation(id);
        set_conversations((prev) => prev.filter((c) => c.id !== id));
        if (active_id === id) start_new_chat();
      } catch (err) {
        console.error('[remove_conversation] Error:', err);
      }
    },
    [active_id, start_new_chat]
  );

  return (
    <ChatHistoryContext.Provider
      value={{
        conversations,
        active_conversation_id: active_id,
        messages,
        is_loading_history,
        start_new_chat,
        select_conversation,
        on_first_message,
        append_message,
        remove_conversation,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}
