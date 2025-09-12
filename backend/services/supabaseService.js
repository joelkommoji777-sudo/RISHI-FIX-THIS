const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Supabase Service Initialization:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Present' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found. Using in-memory storage as fallback.');
  console.warn('Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file');
  console.warn('Current working directory:', process.cwd());
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

class SupabaseService {
  constructor() {
    this.isConnected = false;
    this.testConnection();
  }

  async testConnection() {
    if (!supabase) {
      console.log('🔄 Supabase not configured - using in-memory storage');
      return false;
    }

    try {
      console.log('🔍 Testing Supabase connection...');
      // Try to test connection with a simple query
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      console.log('🔍 Supabase query result:', { data, error: error ? { code: error.code, message: error.message } : null });

      if (error) {
        console.log('❌ Supabase query failed with error:', error);

        // If it's a permissions error (RLS blocking), still consider it connected
        // but log the issue
        if (error.code === 'PGRST301' || error.message.includes('permission') || error.message.includes('RLS')) {
          console.log('⚠️  RLS permission error detected - policies may be restrictive');
          console.log('🔄 Setting isConnected = true despite RLS error');
          this.isConnected = true;
          return true;
        }

        // If it's "table doesn't exist" error, tables haven't been created yet
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('⚠️  Users table does not exist');
          console.warn('🔄 Run the SQL setup script to create tables');
          return false;
        }

        // Other errors mean connection issues
        console.warn('⚠️  Supabase connection test failed with error:', error);
        console.warn('🔄 Falling back to in-memory storage');
        return false;
      }

      this.isConnected = true;
      console.log('✅ Supabase connected successfully - no RLS issues');
      return true;
    } catch (error) {
      console.warn('⚠️  Supabase connection failed with exception:', error);
      console.warn('🔄 Falling back to in-memory storage');
      return false;
    }
  }

  // Database table creation (run this once to set up your database)
  async createTables() {
    if (!supabaseAdmin) {
      console.log('⚠️  Supabase admin client not available');
      return false;
    }

    try {
      console.log('🔧 Creating database tables...');

      // Create users table
      const { error: usersError } = await supabaseAdmin.rpc('create_users_table', {});
      if (usersError && !usersError.message.includes('already exists')) {
        console.error('❌ Failed to create users table:', usersError);
      } else {
        console.log('✅ Users table ready');
      }

      // Create email_configurations table
      const { error: configsError } = await supabaseAdmin.rpc('create_email_configs_table', {});
      if (configsError && !configsError.message.includes('already exists')) {
        console.error('❌ Failed to create email_configurations table:', configsError);
      } else {
        console.log('✅ Email configurations table ready');
      }

      // Create rate_limits table
      const { error: rateLimitsError } = await supabaseAdmin.rpc('create_rate_limits_table', {});
      if (rateLimitsError && !rateLimitsError.message.includes('already exists')) {
        console.error('❌ Failed to create rate_limits table:', rateLimitsError);
      } else {
        console.log('✅ Rate limits table ready');
      }

      return true;
    } catch (error) {
      console.error('❌ Table creation failed:', error);
      return false;
    }
  }

  // User operations
  async createUser(userData) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userData.id, // Include the ID from userData
          email: userData.email,
          name: userData.name,
          grade: userData.grade,
          interests: userData.interests || [],
          resume: userData.resume || null,
          preferences: {
            emailProvider: 'emailjs',
            notifications: true,
            theme: 'light'
          }
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ User created in database: ${data.id}`);
      return data;
    } catch (error) {
      console.error('❌ Database user creation failed:', error);
      return null;
    }
  }

  async getUser(userId) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database user retrieval failed:', error);
      return null;
    }
  }

  async updateUser(userId, updates) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database user update failed:', error);
      return null;
    }
  }

  async deleteUser(userId) {
    if (!this.isConnected) return false;

    try {
      // Delete related records first
      await supabase.from('email_configurations').delete().eq('user_id', userId);
      await supabase.from('rate_limits').delete().eq('user_id', userId);

      // Delete user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      console.log(`✅ User deleted from database: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Database user deletion failed:', error);
      return false;
    }
  }

  // Email configuration operations
  async saveEmailConfig(userId, provider, config) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('email_configurations')
        .upsert([{
          user_id: userId,
          provider: provider,
          config: config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Email config saved to database for user ${userId}, provider ${provider}`);
      return data;
    } catch (error) {
      console.error('❌ Database email config save failed:', error);
      return null;
    }
  }

  async getEmailConfig(userId, provider) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', provider)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    } catch (error) {
      console.error('❌ Database email config retrieval failed:', error);
      return null;
    }
  }

  async updateEmailConfig(userId, provider, updates) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('email_configurations')
        .update({
          config: updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('provider', provider)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database email config update failed:', error);
      return null;
    }
  }

  // Rate limit operations
  async getRateLimit(userId) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

      if (!data) {
        // Create default rate limit record
        return await this.createRateLimit(userId);
      }

      return data;
    } catch (error) {
      console.error('❌ Database rate limit retrieval failed:', error);
      return null;
    }
  }

  async createRateLimit(userId) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('rate_limits')
        .insert([{
          user_id: userId,
          daily_count: 0,
          monthly_count: 0,
          last_reset: new Date().toISOString(),
          daily_limit: 10,
          monthly_limit: 200,
          cooldown_seconds: 30
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database rate limit creation failed:', error);
      return null;
    }
  }

  async updateRateLimit(userId, updates) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('rate_limits')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database rate limit update failed:', error);
      return null;
    }
  }

  // Gmail configuration operations
  async saveGmailConfig(userId, gmailConfig) {
    if (!this.isConnected) return null;

    try {
      // Check if Gmail config already exists for this user
      const existingConfig = await this.getGmailConfig(userId);

      if (existingConfig) {
        // Update existing configuration
        const { data, error } = await supabase
          .from('email_configurations')
          .update({
            config: gmailConfig,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('provider', 'gmail')
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new Gmail configuration
        const { data, error } = await supabase
          .from('email_configurations')
          .insert([{
            user_id: userId,
            provider: 'gmail',
            config: gmailConfig
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('❌ Database Gmail config save failed:', error);
      return null;
    }
  }

  async getGmailConfig(userId) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    } catch (error) {
      console.error('❌ Database Gmail config retrieval failed:', error);
      return null;
    }
  }

  async updateGmailConfig(userId, updates) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('email_configurations')
        .update({
          config: updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database Gmail config update failed:', error);
      return null;
    }
  }

  async deleteGmailConfig(userId) {
    if (!this.isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('email_configurations')
        .delete()
        .eq('user_id', userId)
        .eq('provider', 'gmail');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database Gmail config deletion failed:', error);
      return null;
    }
  }

  // Utility methods
  async getAllUsers() {
    if (!this.isConnected) return [];

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Database users retrieval failed:', error);
      return [];
    }
  }

  async getAllEmailConfigs() {
    if (!this.isConnected) return [];

    try {
      const { data, error } = await supabase
        .from('email_configurations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Database email configs retrieval failed:', error);
      return [];
    }
  }
}

module.exports = new SupabaseService();
