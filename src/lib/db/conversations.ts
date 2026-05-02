/**
 * Conversation and message persistence layer with branching support
 */

import { supabase_client } from '@/lib/supabase_client';

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  parent_message_id?: string | null;
  is_active?: boolean;
}

export interface MessageWithSiblings extends Message {
  sibling_index: number;
  sibling_count: number;
  siblings: Message[];
}

// ============================================================================
// Conversation Management
// ============================================================================

export async function create_conversation(user_id: string, first_message: string) {
  const title = first_message.slice(0, 50) + (first_message.length > 50 ? '...' : '');
  
  const { data, error } = await supabase_client
    .from('conversations')
    .insert({ user_id, title })
    .select('id, title')
    .single();
  
  if (error) throw error;
  return data;
}

export async function get_conversations(user_id: string): Promise<Conversation[]> {
  const { data, error } = await supabase_client
    .from('conversations')
    .select('id, title, updated_at')
    .eq('user_id', user_id)
    .order('updated_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data ?? [];
}

export async function delete_conversation(id: string) {
  const { error } = await supabase_client
    .from('conversations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================================================
// Message Operations
// ============================================================================

export async function save_message(
  conversation_id: string,
  role: 'user' | 'assistant',
  content: string,
  parent_message_id?: string | null
): Promise<string> {
  const { data, error } = await supabase_client
    .from('messages')
    .insert({ 
      conversation_id, 
      role, 
      content, 
      parent_message_id,
      is_active: true 
    })
    .select('id')
    .single();
  
  if (error) throw error;
  return data.id;
}

export async function get_active_messages(conversation_id: string): Promise<Message[]> {
  const { data, error } = await supabase_client
    .from('messages')
    .select('id, role, content, created_at, parent_message_id, is_active')
    .eq('conversation_id', conversation_id)
    .eq('is_active', true)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data ?? [];
}

// ============================================================================
// Branching Operations
// ============================================================================

export async function get_message_siblings(message_id: string): Promise<Message[]> {
  // Get parent_message_id of current message
  const { data: current, error: current_error } = await supabase_client
    .from('messages')
    .select('parent_message_id, conversation_id')
    .eq('id', message_id)
    .single();
  
  if (current_error) throw current_error;

  // Get all messages with same parent (siblings)
  const { data, error } = await supabase_client
    .from('messages')
    .select('id, role, content, created_at, parent_message_id')
    .eq('conversation_id', current.conversation_id)
    .eq('parent_message_id', current.parent_message_id)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data ?? [];
}

export async function deactivate_branch_from_message(message_id: string): Promise<void> {
  // Get conversation_id first
  const { data: msg, error: msg_error } = await supabase_client
    .from('messages')
    .select('conversation_id')
    .eq('id', message_id)
    .single();
  
  if (msg_error) throw msg_error;

  // Use RPC function to deactivate message and all descendants
  const { error } = await supabase_client.rpc('deactivate_branch', { 
    root_message_id: message_id 
  });
  
  if (error) throw error;
}

export async function switch_to_sibling(
  current_message_id: string,
  target_message_id: string
): Promise<void> {
  // Deactivate current message
  await supabase_client
    .from('messages')
    .update({ is_active: false })
    .eq('id', current_message_id);

  // Activate target message
  await supabase_client
    .from('messages')
    .update({ is_active: true })
    .eq('id', target_message_id);
}

// ============================================================================
// Regenerate Response
// ============================================================================

export async function regenerate_assistant_response(user_message_id: string): Promise<void> {
  // Find assistant message that follows this user message
  const { data: messages, error: fetch_error } = await supabase_client
    .from('messages')
    .select('id, role, parent_message_id, created_at')
    .eq('parent_message_id', user_message_id)
    .eq('role', 'assistant')
    .eq('is_active', true)
    .single();
  
  if (fetch_error && fetch_error.code !== 'PGRST116') throw fetch_error;
  
  // If assistant response exists, deactivate it
  if (messages) {
    await supabase_client
      .from('messages')
      .update({ is_active: false })
      .eq('id', messages.id);
  }
}

// ============================================================================
// Edit User Message
// ============================================================================

export async function edit_user_message(
  message_id: string
): Promise<{ parent_id: string | null; conversation_id: string }> {
  // Get message details
  const { data: msg, error: msg_error } = await supabase_client
    .from('messages')
    .select('parent_message_id, conversation_id')
    .eq('id', message_id)
    .single();
  
  if (msg_error) throw msg_error;

  // Deactivate this message and all descendants
  await deactivate_branch_from_message(message_id);

  return {
    parent_id: msg.parent_message_id,
    conversation_id: msg.conversation_id
  };
}

// ============================================================================
// Helper: Enrich messages with sibling info
// ============================================================================

export async function enrich_messages_with_siblings(
  messages: Message[]
): Promise<MessageWithSiblings[]> {
  const enriched: MessageWithSiblings[] = [];
  
  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.parent_message_id) {
      const siblings = await get_message_siblings(msg.id);
      const sibling_index = siblings.findIndex(s => s.id === msg.id);
      
      enriched.push({
        ...msg,
        sibling_index: sibling_index !== -1 ? sibling_index : 0,
        sibling_count: siblings.length,
        siblings
      });
    } else {
      enriched.push({
        ...msg,
        sibling_index: 0,
        sibling_count: 1,
        siblings: [msg]
      });
    }
  }
  
  return enriched;
}
