-- ============================================================================
-- VoxElect Complete Database Setup
-- ============================================================================
-- This file contains ALL migrations in the correct order
-- Copy and paste this entire file into Supabase SQL Editor and run it
-- ============================================================================

-- ============================================================================
-- MIGRATION 001: User Profiles Table
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  location_zip_code TEXT,
  location_state TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT zip_code_format CHECK (location_zip_code IS NULL OR location_zip_code ~* '^\d{5}(-\d{4})?$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_location_zip ON public.profiles(location_zip_code) WHERE location_zip_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on profile changes
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function: Update last_login_at
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET last_login_at = NOW() WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update last_login_at on login
DROP TRIGGER IF EXISTS on_user_login ON auth.users;
CREATE TRIGGER on_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.handle_user_login();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- ============================================================================
-- MIGRATION 002: Chat History Tables
-- ============================================================================

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  location_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT title_length CHECK (char_length(title) <= 200)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  suggested_questions TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT content_not_empty CHECK (char_length(content) > 0),
  CONSTRAINT content_length CHECK (char_length(content) <= 50000)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON public.chat_sessions(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_deleted_at ON public.chat_sessions(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON public.chat_messages(role);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.chat_sessions;

CREATE POLICY "Users can view their own sessions"
  ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON public.chat_messages;

CREATE POLICY "Users can view their own messages"
  ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
  ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function: Update session's last_message_at
CREATE OR REPLACE FUNCTION public.update_session_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update session timestamp on new message
DROP TRIGGER IF EXISTS on_message_created ON public.chat_messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_last_message();

-- Trigger: Update updated_at for sessions
DROP TRIGGER IF EXISTS on_session_updated ON public.chat_sessions;
CREATE TRIGGER on_session_updated
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;

-- ============================================================================
-- MIGRATION 003: Analytics Tables
-- ============================================================================

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'login',
    'logout',
    'chat_message',
    'profile_update',
    'location_update',
    'election_search',
    'polling_location_search'
  )),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON public.user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_type ON public.user_activity_log(user_id, activity_type);

-- Enable RLS
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can create their own activity" ON public.user_activity_log;

CREATE POLICY "Users can view their own activity"
  ON public.user_activity_log FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity"
  ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_activity_log TO authenticated;

-- ============================================================================
-- MIGRATION 004: Message Branching Support
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
-- Setup Complete!
-- ============================================================================
-- Tables created:
--   ✅ public.profiles
--   ✅ public.chat_sessions
--   ✅ public.chat_messages
--   ✅ public.user_activity_log
--
-- Features enabled:
--   ✅ Row Level Security on all tables
--   ✅ Automatic profile creation on signup
--   ✅ Automatic timestamp updates
--   ✅ Last login tracking
--   ✅ Session timestamp updates
--   ✅ Message branching/threading support
--
-- Next steps:
--   1. Verify tables exist in Table Editor
--   2. Register a test user
--   3. Check profile was auto-created
--   4. Test chat functionality
-- ============================================================================
