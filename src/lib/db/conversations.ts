/**
 * Conversation and message persistence layer
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
}

export async function create_conversation(user_id: string, first_message: string) {
  // Auto-generate title from first 50 chars of first message
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

export async function get_messages(conversation_id: string): Promise<Message[]> {
  const { data, error } = await supabase_client
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data ?? [];
}

export async function save_message(
  conversation_id: string,
  role: 'user' | 'assistant',
  content: string
) {
  const { error } = await supabase_client
    .from('messages')
    .insert({ conversation_id, role, content });
  
  if (error) throw error;
}

export async function delete_conversation(id: string) {
  // messages auto-deleted via CASCADE
  const { error } = await supabase_client
    .from('conversations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
