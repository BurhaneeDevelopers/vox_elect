-- ============================================================================
-- VoxElect Analytics Tables
-- ============================================================================
-- This migration creates tables for tracking user activity and analytics
-- ============================================================================

-- Create user_activity_log table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'login',
    'logout',
    'chat_message',
    'profile_update',
    'location_update',
    'election_search',
    'polling_location_search'
  )),
  
  -- Activity metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON public.user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_type ON public.user_activity_log(user_id, activity_type);

-- Enable Row Level Security
-- ============================================================================
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can create their own activity" ON public.user_activity_log;

CREATE POLICY "Users can view their own activity"
  ON public.user_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity"
  ON public.user_activity_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
-- ============================================================================
GRANT ALL ON public.user_activity_log TO authenticated;

-- Comments
-- ============================================================================
COMMENT ON TABLE public.user_activity_log IS 'Log of user activities for analytics';
COMMENT ON COLUMN public.user_activity_log.activity_type IS 'Type of activity performed';
COMMENT ON COLUMN public.user_activity_log.metadata IS 'Additional activity data (JSON)';

-- ============================================================================
-- Migration Complete
-- ============================================================================
