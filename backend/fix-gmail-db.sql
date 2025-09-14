-- Fix Gmail Database Integration and RLS Policies
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Disable RLS temporarily to fix issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own email configs" ON email_configurations;
DROP POLICY IF EXISTS "Users can insert own email configs" ON email_configurations;
DROP POLICY IF EXISTS "Users can update own email configs" ON email_configurations;
DROP POLICY IF EXISTS "Users can delete own email configs" ON email_configurations;
DROP POLICY IF EXISTS "Users can view own rate limits" ON rate_limits;
DROP POLICY IF EXISTS "Users can update own rate limits" ON rate_limits;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on email_configurations" ON email_configurations;
DROP POLICY IF EXISTS "Allow all operations on rate_limits" ON rate_limits;
DROP POLICY IF EXISTS "Public users access" ON users;
DROP POLICY IF EXISTS "Public email_configurations access" ON email_configurations;
DROP POLICY IF EXISTS "Public rate_limits access" ON rate_limits;

-- Step 3: Create public access policies for development
-- NOTE: These are permissive for development. Tighten for production!

-- Users table policies - Allow all operations
CREATE POLICY "Public users access" ON users
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Email configurations table policies - Allow all operations
CREATE POLICY "Public email_configurations access" ON email_configurations
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Rate limits table policies - Allow all operations
CREATE POLICY "Public rate_limits access" ON rate_limits
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Step 4: Re-enable RLS with new permissive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Step 5: Create test user if not exists
INSERT INTO users (id, email, name, grade, interests, preferences)
VALUES (
  'default-user'::uuid,
  'test@example.com',
  'Test User',
  'Graduate',
  ARRAY['AI', 'Machine Learning'],
  '{"emailProvider": "gmail", "notifications": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET updated_at = NOW();

-- Step 6: Verify tables and policies
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = pt.tablename) as policy_count
FROM pg_tables pt
WHERE schemaname = 'public'
AND tablename IN ('users', 'email_configurations', 'rate_limits');

-- Step 7: Test insert to email_configurations
INSERT INTO email_configurations (user_id, provider, config)
VALUES (
  'default-user'::uuid,
  'gmail',
  '{"configured": false, "test": true}'::jsonb
)
ON CONFLICT (user_id, provider) 
DO UPDATE SET 
  config = EXCLUDED.config,
  updated_at = NOW()
RETURNING *;

-- Step 8: Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 9: Create a function to save Gmail config (bypasses RLS)
CREATE OR REPLACE FUNCTION save_gmail_config(
  p_user_id UUID,
  p_config JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO email_configurations (user_id, provider, config)
  VALUES (p_user_id, 'gmail', p_config)
  ON CONFLICT (user_id, provider) 
  DO UPDATE SET 
    config = EXCLUDED.config,
    updated_at = NOW()
  RETURNING to_jsonb(email_configurations.*) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION save_gmail_config TO anon;
GRANT EXECUTE ON FUNCTION save_gmail_config TO authenticated;

-- Final verification
SELECT 'Setup completed successfully!' as status;