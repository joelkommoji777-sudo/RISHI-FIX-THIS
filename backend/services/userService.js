const crypto = require('crypto');
const supabaseService = require('./supabaseService');

class UserService {
  constructor() {
    this.users = new Map();
    this.emailConfigs = new Map();
    this.rateLimits = new Map();

    // Encryption key for sensitive data
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'ProfessorMatcherSecureKey2024_32CharsLong!';
    this.algorithm = 'aes-256-cbc';

    // Check database connection after a short delay to allow async connection
    setTimeout(() => {
      this.useDatabase = supabaseService.isConnected;
      console.log(`🔄 UserService initialized with ${this.useDatabase ? 'Supabase database' : 'in-memory storage'}`);
    }, 1000);
  }

  // User management methods
  async createUser(userData) {
    try {
      // Wait for database connection to be established
      if (this.useDatabase === undefined) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      if (this.useDatabase) {
        // Use Supabase database
        const dbUser = await supabaseService.createUser(userData);
        if (dbUser) {
          // Also store in memory for fast access
          this.users.set(dbUser.id, dbUser);
          return {
            success: true,
            userId: dbUser.id,
            user: dbUser
          };
        }
      }

      // Fallback to in-memory storage
      const userId = this.generateUserId();
      const user = {
        id: userId,
        email: userData.email,
        name: userData.name,
        grade: userData.grade,
        interests: userData.interests || [],
        resume: userData.resume || null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        preferences: {
          emailProvider: 'gmail', // Default to Gmail
          notifications: true,
          theme: 'light'
        }
      };

      this.users.set(userId, user);
      this.initializeUserRateLimits(userId);

      console.log(`📝 User created (in-memory): ${userId} (${userData.email})`);

      return {
        success: true,
        userId: userId,
        user: user
      };

    } catch (error) {
      console.error('User creation failed:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async getUser(userId) {
    try {
      // Wait for database connection to be established
      if (this.useDatabase === undefined) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // First check in-memory cache
      let user = this.users.get(userId);

      if (!user && this.useDatabase) {
        // Try to get from database
        user = await supabaseService.getUser(userId);
        if (user) {
          // Cache in memory for future requests
          this.users.set(userId, user);
        }
      }

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: user
      };

    } catch (error) {
      console.error('User retrieval failed:', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    try {
      const user = this.users.get(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Update user data
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.users.set(userId, updatedUser);

      console.log(`User updated: ${userId}`);

      return {
        success: true,
        user: updatedUser
      };

    } catch (error) {
      console.error('User update failed:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = this.users.get(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Remove user data
      this.users.delete(userId);

      // Remove associated email configurations
      this.emailConfigs.delete(`${userId}_gmail`);

      // Remove rate limit data
      this.rateLimits.delete(userId);

      console.log(`User deleted: ${userId}`);

      return {
        success: true,
        message: 'User and all associated data deleted successfully'
      };

    } catch (error) {
      console.error('User deletion failed:', error);
      throw error;
    }
  }

  // Email configuration management
  async saveEmailConfiguration(userId, provider, config) {
    try {
      console.log(`💾 Attempting to save ${provider} config for user ${userId}`);
      console.log(`💾 useDatabase = ${this.useDatabase}`);

      if (this.useDatabase) {
        console.log(`💾 Saving to Supabase database...`);
        // Use Supabase database
        const dbConfig = await supabaseService.saveEmailConfig(userId, provider, config);
        console.log(`💾 Supabase save result:`, dbConfig);

        if (dbConfig) {
          // Also cache in memory
          const configKey = `${userId}_${provider}`;
          this.emailConfigs.set(configKey, dbConfig);
          console.log(`💾 Email config saved to database for user ${userId}, provider ${provider}`);
          return {
            success: true,
            provider: provider,
            configured: true
          };
        } else {
          console.log(`❌ Supabase save returned null/undefined`);
        }
      } else {
        console.log(`💾 useDatabase is false, falling back to in-memory storage`);
      }

      // Fallback to in-memory storage
      const configKey = `${userId}_${provider}`;

      // Encrypt sensitive data
      const encryptedConfig = this.encryptConfig(config);

      this.emailConfigs.set(configKey, {
        ...encryptedConfig,
        provider: provider,
        userId: userId,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      console.log(`📝 Email config saved (in-memory) for user ${userId}, provider ${provider}`);

      return {
        success: true,
        provider: provider,
        configured: true
      };

    } catch (error) {
      console.error('Email configuration save failed:', error);
      throw new Error(`Failed to save email configuration: ${error.message}`);
    }
  }

  async getEmailConfiguration(userId, provider) {
    try {
      // First check in-memory cache
      const configKey = `${userId}_${provider}`;
      let config = this.emailConfigs.get(configKey);

      if (!config && this.useDatabase) {
        // Try to get from database
        config = await supabaseService.getEmailConfig(userId, provider);
        if (config) {
          // Cache in memory for future requests
          this.emailConfigs.set(configKey, config);
        }
      }

      if (!config) {
        return {
          success: true,
          configured: false,
          message: `${provider} not configured for user`
        };
      }

      // Decrypt sensitive data
      const decryptedConfig = this.decryptConfig(config);

      return {
        success: true,
        configured: true,
        provider: provider,
        config: decryptedConfig,
        lastUpdated: config.lastUpdated || config.updated_at
      };

    } catch (error) {
      console.error('Email configuration retrieval failed:', error);
      throw error;
    }
  }

  async updateEmailConfiguration(userId, provider, updates) {
    try {
      const configKey = `${userId}_${provider}`;
      const existingConfig = this.emailConfigs.get(configKey);

      if (!existingConfig) {
        throw new Error(`${provider} configuration not found for user`);
      }

      // Merge updates with existing config
      const updatedConfig = {
        ...existingConfig,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      // Re-encrypt if sensitive data was updated
      if (updates.apiKey || updates.serviceId || updates.templateId) {
        const sensitiveUpdates = {
          apiKey: updates.apiKey,
          serviceId: updates.serviceId,
          templateId: updates.templateId
        };
        Object.assign(updatedConfig, this.encryptConfig(sensitiveUpdates));
      }

      this.emailConfigs.set(configKey, updatedConfig);

      console.log(`Email config updated for user ${userId}, provider ${provider}`);

      return {
        success: true,
        provider: provider,
        updated: true,
        lastUpdated: updatedConfig.lastUpdated
      };

    } catch (error) {
      console.error('Email configuration update failed:', error);
      throw error;
    }
  }

  // Rate limiting methods
  initializeUserRateLimits(userId) {
    this.rateLimits.set(userId, {
      dailyCount: 0,
      monthlyCount: 0,
      lastReset: new Date().toISOString(),
      limits: {
        daily: 10,    // Default limits, can be customized per user
        monthly: 200,
        cooldown: 30  // seconds between emails
      }
    });
  }

  async checkRateLimit(userId) {
    try {
      let userLimits = this.rateLimits.get(userId);

      if (!userLimits) {
        this.initializeUserRateLimits(userId);
        userLimits = this.rateLimits.get(userId);
      }

      // Reset counters if needed
      this.resetRateLimitsIfNeeded(userLimits);

      return {
        success: true,
        canSend: userLimits.dailyCount < userLimits.limits.daily,
        dailyCount: userLimits.dailyCount,
        dailyLimit: userLimits.limits.daily,
        monthlyCount: userLimits.monthlyCount,
        monthlyLimit: userLimits.limits.monthly,
        cooldown: userLimits.limits.cooldown,
        nextReset: this.getNextResetTime(userLimits.lastReset)
      };

    } catch (error) {
      console.error('Rate limit check failed:', error);
      throw error;
    }
  }

  async incrementRateLimit(userId) {
    try {
      const userLimits = this.rateLimits.get(userId);

      if (!userLimits) {
        this.initializeUserRateLimits(userId);
        return this.incrementRateLimit(userId); // Retry
      }

      userLimits.dailyCount += 1;
      userLimits.monthlyCount += 1;

      this.rateLimits.set(userId, userLimits);

      console.log(`Rate limit incremented for user ${userId}: ${userLimits.dailyCount}/${userLimits.limits.daily} daily`);

      return {
        success: true,
        dailyCount: userLimits.dailyCount,
        monthlyCount: userLimits.monthlyCount
      };

    } catch (error) {
      console.error('Rate limit increment failed:', error);
      throw error;
    }
  }

  resetRateLimitsIfNeeded(userLimits) {
    const now = new Date();
    const lastReset = new Date(userLimits.lastReset);

    // Reset daily count if it's a new day
    if (now.getDate() !== lastReset.getDate() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()) {
      userLimits.dailyCount = 0;
      userLimits.lastReset = now.toISOString();
      console.log('Daily rate limit reset');
    }

    // Reset monthly count if it's a new month
    if (now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()) {
      userLimits.monthlyCount = 0;
      console.log('Monthly rate limit reset');
    }
  }

  getNextResetTime(lastReset) {
    const resetDate = new Date(lastReset);
    resetDate.setDate(resetDate.getDate() + 1); // Next day
    resetDate.setHours(0, 0, 0, 0); // Midnight

    return resetDate.toISOString();
  }

  // Encryption/Decryption methods for sensitive data
  encryptConfig(config) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey.padEnd(32, '0'), 'utf8').slice(0, 32), iv);

      let encrypted = cipher.update(JSON.stringify(config), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        encrypted: encrypted,
        iv: iv.toString('hex')
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt configuration');
    }
  }

  decryptConfig(encryptedData) {
    try {
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey.padEnd(32, '0'), 'utf8').slice(0, 32), iv);

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt configuration');
    }
  }

  // Utility methods
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Gmail configuration methods
  async saveGmailConfig(userId, gmailConfig) {
    try {
      console.log(`💾 Attempting to save Gmail config for user ${userId}`);
      console.log(`💾 Config data:`, {
        user_email: gmailConfig.user_email,
        has_access_token: !!gmailConfig.access_token,
        has_refresh_token: !!gmailConfig.refresh_token,
        configured: gmailConfig.configured
      });
      
      // Wait for database connection to be established
      if (this.useDatabase === undefined) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      console.log(`💾 Database available: ${this.useDatabase}`);

      if (this.useDatabase) {
        console.log(`💾 Saving to Supabase database...`);
        const dbConfig = await supabaseService.saveGmailConfig(userId, gmailConfig);
        console.log(`💾 Database save result:`, dbConfig);
        
        if (dbConfig) {
          // Also store in memory for fast access
          this.emailConfigs.set(`${userId}_gmail`, dbConfig);
          console.log(`✅ Gmail config saved to database and cached for user ${userId}`);
          return {
            success: true,
            config: dbConfig,
            storage: 'database'
          };
        } else {
          console.error(`⚠️ Database save returned null for user ${userId}`);
        }
      }

      // Only use in-memory as last resort
      console.warn(`⚠️ Using in-memory storage for Gmail config (database not available)`);
      const configKey = `${userId}_gmail`;
      const config = {
        id: `gmail_${Date.now()}`,
        user_id: userId,
        provider: 'gmail',
        config: gmailConfig,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.emailConfigs.set(configKey, config);
      console.log(`📝 Gmail config saved in-memory for user ${userId}`);

      return {
        success: true,
        config: config,
        storage: 'memory',
        warning: 'Config saved in memory only - will be lost on server restart'
      };

    } catch (error) {
      console.error('Gmail config save failed:', error);
      throw new Error(`Failed to save Gmail config: ${error.message}`);
    }
  }

  async getGmailConfig(userId) {
    try {
      console.log(`🔍 Getting Gmail config for user ${userId}`);
      
      // Wait for database connection to be established
      if (this.useDatabase === undefined) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // First check in-memory cache
      const cacheKey = `${userId}_gmail`;
      let config = this.emailConfigs.get(cacheKey);
      console.log(`🔍 Cache check result:`, config ? 'Found in cache' : 'Not in cache');

      if (!config && this.useDatabase) {
        console.log(`🔍 Config not in cache, checking database...`);
        // Try to get from database
        config = await supabaseService.getGmailConfig(userId);
        console.log(`🔍 Database config result:`, config);
        
        if (config) {
          // Cache in memory for future requests
          this.emailConfigs.set(cacheKey, config);
          console.log(`✅ Gmail config loaded from database for user ${userId}`);
        }
      }

      if (!config) {
        console.log(`❌ No Gmail config found for user ${userId}`);
        return null;
      }

      // Return the actual config object with proper structure
      const actualConfig = config.config || config;
      console.log(`🔍 Returning config:`, {
        configured: actualConfig.configured,
        user_email: actualConfig.user_email,
        has_access_token: !!actualConfig.access_token,
        has_refresh_token: !!actualConfig.refresh_token
      });

      return actualConfig;

    } catch (error) {
      console.error('Gmail config retrieval failed:', error);
      throw error;
    }
  }

  async updateGmailConfig(userId, updates) {
    try {
      const existingConfig = this.emailConfigs.get(`${userId}_gmail`);

      if (!existingConfig) {
        throw new Error('Gmail configuration not found');
      }

      // Update configuration
      const updatedConfig = {
        ...existingConfig,
        config: {
          ...existingConfig.config,
          ...updates,
          last_updated: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      };

      this.emailConfigs.set(`${userId}_gmail`, updatedConfig);

      console.log(`Gmail config updated: ${userId}`);

      return {
        success: true,
        config: updatedConfig
      };

    } catch (error) {
      console.error('Gmail config update failed:', error);
      throw error;
    }
  }

  async deleteGmailConfig(userId) {
    try {
      const configKey = `${userId}_gmail`;
      const config = this.emailConfigs.get(configKey);

      if (!config) {
        throw new Error('Gmail configuration not found');
      }

      this.emailConfigs.delete(configKey);

      console.log(`Gmail config deleted: ${userId}`);

      return {
        success: true
      };

    } catch (error) {
      console.error('Gmail config deletion failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      return {
        status: 'healthy',
        usersCount: this.users.size,
        configsCount: this.emailConfigs.size,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new UserService();
