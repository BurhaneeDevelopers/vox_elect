// Chat and message types for VoxElect

export type message_role = 'user' | 'assistant' | 'system';

export type message_status = 'pending' | 'streaming' | 'complete' | 'error';

export interface chat_message {
  id: string;
  role: message_role;
  content: string;
  timestamp: Date;
  status: message_status;
  suggested_questions?: string[];
  sources?: source_citation[];
}

export interface source_citation {
  title: string;
  url: string;
  source_name: string;
  accessed_at?: string;
}

export interface user_location_context {
  zip_code: string;
  state?: string;
  city?: string;
  county?: string;
}

export interface chat_session {
  id: string;
  messages: chat_message[];
  location_context: user_location_context | null;
  created_at: Date;
  last_activity: Date;
}

export interface gemini_chat_request {
  messages: { role: message_role; content: string }[];
  location_context?: user_location_context | null;
}

export interface gemini_chat_response {
  content: string;
  suggested_questions: string[];
  sources: source_citation[];
}
