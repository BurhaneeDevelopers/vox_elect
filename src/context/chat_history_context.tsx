/**
 * Chat history context — persistent conversations with branching
 * Simplified: DB as source of truth, no complex optimistic updates
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { use_auth } from '@/hooks/use_auth';
import {
  get_conversations,
  create_conversation,
  get_active_messages,
  save_message,
  delete_conversation,
  regenerate_assistant_response,
  edit_user_message,
  switch_to_sibling,
  enrich_messages_with_siblings,
  type Conversation,
  type MessageWithSiblings,
} from '@/lib/db/conversations';

interface ChatHistoryContextValue {
  conversations: Conversation[];
  active_conversation_id: string | null;
  messages: MessageWithSiblings[];
  is_loading: boolean;
  
  start_new_chat: () => void;
  select_conversation: (id: string) => Promise<void>;
  
  create_first_message: (user_message: string) => Promise<string>;
  add_message: (
    conversation_id: string,
    role: 'user' | 'assistant',
    content: string,
    parent_id?: string | null
  ) => Promise<string>;
  
  regenerate: (user_message_id: string) => Promise<void>;
  edit_message: (user_message_id: string) => Promise<string | null>;
  navigate_sibling: (current_id: string, direction: 'prev' | 'next') => Promise<void>;
  
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
  const [messages, set_messages] = useState<MessageWithSiblings[]>([]);
  const [is_loading, set_loading] = useState(false);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    
    set_loading(true);
    get_conversations(user.id)
      .then(set_conversations)
      .catch(console.error)
      .finally(() => set_loading(false));
  }, [user]);

  // Load conversation from URL
  useEffect(() => {
    const id = params?.id as string | undefined;
    if (id && id !== active_id) {
      select_conversation(id);
    }
  }, [params?.id]);

  const start_new_chat = useCallback(() => {
    set_active_id(null);
    set_messages([]);
    
    if (window.location.pathname !== '/chat') {
      window.location.href = '/chat';
    } else {
      window.location.reload();
    }
  }, []);

  const select_conversation = useCallback(async (id: string) => {
    set_loading(true);
    set_active_id(id);
    router.push(`/chat/${id}`);
    
    try {
      const raw = await get_active_messages(id);
      const enriched = await enrich_messages_with_siblings(raw);
      set_messages(enriched);
    } catch (err) {
      console.error('[select_conversation]', err);
    } finally {
      set_loading(false);
    }
  }, [router]);

  const create_first_message = useCallback(
    async (user_message: string): Promise<string> => {
      if (!user) throw new Error('Not authenticated');
      
      const conv = await create_conversation(user.id, user_message);
      set_active_id(conv.id);
      set_conversations(prev => [
        { ...conv, updated_at: new Date().toISOString() },
        ...prev,
      ]);
      
      return conv.id;
    },
    [user]
  );

  const add_message = useCallback(
    async (
      conversation_id: string,
      role: 'user' | 'assistant',
      content: string,
      parent_id?: string | null
    ): Promise<string> => {
      const msg_id = await save_message(conversation_id, role, content, parent_id);

      // Bubble conversation
      set_conversations(prev => {
        const idx = prev.findIndex(c => c.id === conversation_id);
        if (idx < 0) return prev;
        
        const updated = { ...prev[idx], updated_at: new Date().toISOString() };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });

      // Refresh messages
      const raw = await get_active_messages(conversation_id);
      const enriched = await enrich_messages_with_siblings(raw);
      set_messages(enriched);

      return msg_id;
    },
    []
  );

  const regenerate = useCallback(
    async (user_message_id: string): Promise<void> => {
      await regenerate_assistant_response(user_message_id);
      
      if (active_id) {
        const raw = await get_active_messages(active_id);
        const enriched = await enrich_messages_with_siblings(raw);
        set_messages(enriched);
      }
    },
    [active_id]
  );

  const edit_message = useCallback(
    async (user_message_id: string): Promise<string | null> => {
      const { parent_id } = await edit_user_message(user_message_id);
      
      // Refresh messages
      if (active_id) {
        const raw = await get_active_messages(active_id);
        const enriched = await enrich_messages_with_siblings(raw);
        set_messages(enriched);
      }
      
      return parent_id;
    },
    [active_id]
  );

  const navigate_sibling = useCallback(
    async (current_id: string, direction: 'prev' | 'next'): Promise<void> => {
      const current_msg = messages.find(m => m.id === current_id);
      if (!current_msg || current_msg.siblings.length <= 1) return;

      const target_index = direction === 'prev' 
        ? current_msg.sibling_index - 1
        : current_msg.sibling_index + 1;

      if (target_index < 0 || target_index >= current_msg.siblings.length) return;

      const target_id = current_msg.siblings[target_index].id;
      await switch_to_sibling(current_id, target_id);
      
      // Refresh messages
      if (active_id) {
        const raw = await get_active_messages(active_id);
        const enriched = await enrich_messages_with_siblings(raw);
        set_messages(enriched);
      }
    },
    [messages, active_id]
  );

  const remove_conversation = useCallback(
    async (id: string) => {
      await delete_conversation(id);
      set_conversations(prev => prev.filter(c => c.id !== id));
      if (active_id === id) start_new_chat();
    },
    [active_id, start_new_chat]
  );

  return (
    <ChatHistoryContext.Provider
      value={{
        conversations,
        active_conversation_id: active_id,
        messages,
        is_loading,
        start_new_chat,
        select_conversation,
        create_first_message,
        add_message,
        regenerate,
        edit_message,
        navigate_sibling,
        remove_conversation,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}
