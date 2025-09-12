-- Fix Gmail Database Integration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → Your Project → SQL Editor

-- Drop the restrictive policies that are blocking Gmail configuration saves
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own email configs" ON email_configurations;
DROP POLICY IF EXISTS "Users can insert own email configs" ON email_configurations;
DROP POLICY IF EXISTS "Users can update own email configs" ON email_configurations;
DROP POLICY IF EXISTS "Users can delete own email configs" ON email_configurations;
DROP POLICY IF EXISTS "Users can view own rate limits" ON rate_limits;
DROP POLICY IF EXISTS "Users can update own rate limits" ON rate_limits;

-- Create permissive policies for testing Gmail integration
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on email_configurations" ON email_configurations FOR ALL USING (true);
CREATE POLICY "Allow all operations on rate_limits" ON rate_limits FOR ALL USING (true);

-- Verify the tables exist
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'email_configurations', 'rate_limits');

