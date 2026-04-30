-- ============================================================================
-- Elora Database Seed Data
-- ============================================================================
-- This file contains sample data for testing and development
-- DO NOT RUN IN PRODUCTION
-- ============================================================================

-- Note: You cannot directly insert into auth.users table
-- Users must be created through Supabase Auth API
-- This seed file is for reference only

-- Sample data structure for testing:
-- ============================================================================

-- After creating a user through the registration page, their profile will be
-- automatically created by the trigger. You can then update it with:

-- UPDATE public.profiles
-- SET 
--   location_zip_code = '10001',
--   location_state = 'NY',
--   notification_preferences = '{"email": true, "push": true}'::jsonb
-- WHERE email = 'test@example.com';

-- ============================================================================
-- Test Queries
-- ============================================================================

-- View all profiles
-- SELECT * FROM public.profiles ORDER BY created_at DESC;

-- View user activity
-- SELECT * FROM public.user_activity_log WHERE user_id = 'your-user-id' ORDER BY created_at DESC;

-- View chat sessions
-- SELECT * FROM public.chat_sessions WHERE user_id = 'your-user-id' ORDER BY last_message_at DESC;

-- View messages in a session
-- SELECT * FROM public.chat_messages WHERE session_id = 'your-session-id' ORDER BY created_at ASC;

-- Count users by state
-- SELECT location_state, COUNT(*) as user_count 
-- FROM public.profiles 
-- WHERE location_state IS NOT NULL 
-- GROUP BY location_state 
-- ORDER BY user_count DESC;

-- Most active users (by message count)
-- SELECT 
--   p.email,
--   p.full_name,
--   COUNT(cm.id) as message_count
-- FROM public.profiles p
-- LEFT JOIN public.chat_messages cm ON p.id = cm.user_id
-- GROUP BY p.id, p.email, p.full_name
-- ORDER BY message_count DESC
-- LIMIT 10;

-- ============================================================================
-- End of Seed File
-- ============================================================================
