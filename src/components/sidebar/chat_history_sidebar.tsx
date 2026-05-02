/**
 * Chat history sidebar — recent conversations
 */

'use client';

import { MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { useChatHistory } from '@/context/chat_history_context';
import { cn } from '@/lib/utils';

export function ChatHistorySidebar() {
  const {
    conversations,
    active_conversation_id,
    select_conversation,
    remove_conversation,
    is_loading,
  } = useChatHistory();

  if (is_loading) {
    return (
      <div className="p-3 flex justify-center">
        <Loader2 size={14} className="animate-spin text-[#2D5016]" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-3 text-center">
        <p className="text-xs text-[#a8a29e] italic">No chat history yet</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h3 className="text-[10px] text-[#57534e] uppercase tracking-wider font-medium mb-2 px-2">
        Recent Chats
      </h3>
      
      <div className="flex flex-col gap-1">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              'group flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors',
              active_conversation_id === conv.id
                ? 'bg-[#2D5016]/10 border border-[#2D5016]/20'
                : 'hover:bg-[#F5F0E8] border border-transparent'
            )}
            onClick={() => select_conversation(conv.id)}
          >
            <MessageSquare
              size={12}
              className={cn(
                'shrink-0 mt-0.5',
                active_conversation_id === conv.id ? 'text-[#2D5016]' : 'text-[#57534e]'
              )}
              aria-hidden="true"
            />
            
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-xs leading-tight truncate',
                  active_conversation_id === conv.id
                    ? 'text-[#2D5016] font-medium'
                    : 'text-[#1C1917]'
                )}
              >
                {conv.title}
              </p>
              <p className="text-[10px] text-[#a8a29e] mt-0.5">
                {new Date(conv.updated_at).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                remove_conversation(conv.id);
              }}
              className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
              aria-label="Delete conversation"
            >
              <Trash2 size={11} className="text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
