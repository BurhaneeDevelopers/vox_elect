-- ============================================================================
-- MIGRATION 004: Message Branching Support
-- ============================================================================
-- Adds parent_message_id to support conversation branching/threading
-- ============================================================================

-- Add parent_message_id column for branching
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL;

-- Add index for parent lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent_id ON public.chat_messages(parent_message_id);

-- Add branch_path for efficient tree queries (stores path from root)
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS branch_path UUID[] DEFAULT ARRAY[]::UUID[];

-- Add index for branch path queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_branch_path ON public.chat_messages USING GIN(branch_path);

-- Function: Update branch_path on insert
CREATE OR REPLACE FUNCTION public.update_message_branch_path()
RETURNS TRIGGER AS $$
DECLARE
  parent_path UUID[];
BEGIN
  IF NEW.parent_message_id IS NULL THEN
    -- Root message
    NEW.branch_path := ARRAY[NEW.id];
  ELSE
    -- Get parent's path and append current id
    SELECT branch_path INTO parent_path
    FROM public.chat_messages
    WHERE id = NEW.parent_message_id;
    
    NEW.branch_path := parent_path || NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Set branch_path on message insert
DROP TRIGGER IF EXISTS on_message_branch_path ON public.chat_messages;
CREATE TRIGGER on_message_branch_path
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_message_branch_path();

-- Add is_active flag to mark active branch
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Index for active messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_active ON public.chat_messages(session_id, is_active) WHERE is_active = true;

-- ============================================================================
-- Migration 004 Complete!
-- ============================================================================
