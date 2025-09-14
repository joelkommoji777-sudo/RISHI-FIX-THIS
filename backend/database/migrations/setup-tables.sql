-- Professor Matcher Database Setup
-- Run this SQL in your Supabase SQL editor to create the necessary tables

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  grade VARCHAR(100),
  interests TEXT[], -- Array of interests
  resume JSONB, -- Store resume data as JSON
  preferences JSONB DEFAULT '{"emailProvider": "gmail", "notifications": true, "theme": "light"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_configurations table
CREATE TABLE IF NOT EXISTS email_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'gmail'
  config JSONB NOT NULL, -- Encrypted configuration data
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  daily_count INTEGER DEFAULT 0,
  monthly_count INTEGER DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  daily_limit INTEGER DEFAULT 10,
  monthly_limit INTEGER DEFAULT 200,
  cooldown_seconds INTEGER DEFAULT 30,
  UNIQUE(user_id)
);

-- Create campaigns table (for future use)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, completed
  target_university VARCHAR(255),
  target_field VARCHAR(255),
  email_template JSONB,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_logs table (for tracking sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(500),
  provider VARCHAR(50), -- 'gmail'
  status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, bounced, etc.
  message_id VARCHAR(255), -- Provider's message ID
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for email_configurations table
CREATE POLICY "Users can view own email configs" ON email_configurations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email configs" ON email_configurations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email configs" ON email_configurations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email configs" ON email_configurations
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for rate_limits table
CREATE POLICY "Users can view own rate limits" ON rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits" ON rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for campaigns table
CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for email_logs table
CREATE POLICY "Users can view own email logs" ON email_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email logs" ON email_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_email_configs_user_provider ON email_configurations(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign ON email_logs(campaign_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_configs_updated_at BEFORE UPDATE ON email_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RPC functions for table creation (used by the service)
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  -- Table creation is handled above, this is just a placeholder
  RAISE NOTICE 'Users table creation handled in migration';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_email_configs_table()
RETURNS void AS $$
BEGIN
  RAISE NOTICE 'Email configurations table creation handled in migration';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_rate_limits_table()
RETURNS void AS $$
BEGIN
  RAISE NOTICE 'Rate limits table creation handled in migration';
END;
$$ LANGUAGE plpgsql;

-- Insert some test data (optional - remove in production)
-- This creates a test user for development
INSERT INTO users (email, name, grade, interests)
VALUES ('test@example.com', 'Test User', 'College Senior', ARRAY['Computer Science', 'AI', 'Research'])
ON CONFLICT (email) DO NOTHING;

