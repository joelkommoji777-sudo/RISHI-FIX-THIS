-- Fix Database Schema for User ID Compatibility
-- Run this in Supabase SQL Editor

-- First, check current table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('users', 'email_configurations', 'rate_limits')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Drop existing tables (if they exist) to recreate with correct schema
DROP TABLE IF EXISTS email_configurations CASCADE;
DROP TABLE IF EXISTS rate_limits CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with TEXT user_id
CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- Changed from UUID to TEXT to support base64-encoded emails
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  grade VARCHAR(100),
  interests TEXT[],
  resume JSONB,
  preferences JSONB DEFAULT '{"emailProvider": "emailjs", "notifications": true, "theme": "light"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_configurations table with TEXT user_id
CREATE TABLE email_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,  -- Changed from UUID to TEXT
  provider VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create rate_limits table with TEXT user_id
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,  -- Changed from UUID to TEXT
  daily_count INTEGER DEFAULT 0,
  monthly_count INTEGER DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  daily_limit INTEGER DEFAULT 10,
  monthly_limit INTEGER DEFAULT 200,
  cooldown_seconds INTEGER DEFAULT 30,
  UNIQUE(user_id)
);

-- Create permissive RLS policies
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on email_configurations" ON email_configurations FOR ALL USING (true);
CREATE POLICY "Allow all operations on rate_limits" ON rate_limits FOR ALL USING (true);

-- Verify the schema
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('users', 'email_configurations', 'rate_limits')
AND column_name = 'id'
ORDER BY table_name;
