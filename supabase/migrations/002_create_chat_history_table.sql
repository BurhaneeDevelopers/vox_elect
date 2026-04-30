-- ============================================================================
-- VoxElect Chat History Table
-- ============================================================================
-- This migration creates a chat_history table to store user conversations
-- with Elora for analytics and conversation continuity.
-- ============================================================================

-- Create chat_sessions table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to user
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session metadata
  title TEXT,
  location_context JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT title_length CHECK (char_length(title) <= 200)
);

-- Create chat_messages table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Message metadata
  suggested_questions TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT content_not_empty CHECK (char_length(content) > 0),
  CONSTRAINT content_length CHECK (char_length(content) <= 50000)
);

-- Create indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON public.chat_sessions(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_deleted_at ON public.chat_sessions(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON public.chat_messages(role);

-- Enable Row Level Security
-- ============================================================================
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.chat_sessions;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON public.chat_messages;

-- RLS Policies for chat_sessions
-- ============================================================================
CREATE POLICY "Users can view their own sessions"
  ON public.chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.chat_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.chat_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
-- ============================================================================
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function: Update session's last_message_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_session_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions
  SET 
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update session timestamp on new message
-- ============================================================================
DROP TRIGGER IF EXISTS on_message_created ON public.chat_messages;

CREATE TRIGGER on_message_created
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_last_message();

-- Function: Update updated_at timestamp for sessions
-- ============================================================================
DROP TRIGGER IF EXISTS on_session_updated ON public.chat_sessions;

CREATE TRIGGER on_session_updated
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
-- ============================================================================
GRANT ALL ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;

-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE public.chat_sessions IS 'Chat sessions for tracking user conversations';
COMMENT ON TABLE public.chat_messages IS 'Individual messages within chat sessions';

COMMENT ON COLUMN public.chat_sessions.id IS 'Unique session identifier';
COMMENT ON COLUMN public.chat_sessions.user_id IS 'User who owns this session';
COMMENT ON COLUMN public.chat_sessions.title IS 'Session title (auto-generated or user-defined)';
COMMENT ON COLUMN public.chat_sessions.location_context IS 'Location context for this session (JSON)';

COMMENT ON COLUMN public.chat_messages.id IS 'Unique message identifier';
COMMENT ON COLUMN public.chat_messages.session_id IS 'Session this message belongs to';
COMMENT ON COLUMN public.chat_messages.user_id IS 'User who owns this message';
COMMENT ON COLUMN public.chat_messages.role IS 'Message role: user, assistant, or system';
COMMENT ON COLUMN public.chat_messages.content IS 'Message content';
COMMENT ON COLUMN public.chat_messages.suggested_questions IS 'Follow-up questions suggested by AI';
COMMENT ON COLUMN public.chat_messages.metadata IS 'Additional message metadata (JSON)';

-- ============================================================================
-- Migration Complete
-- ============================================================================
