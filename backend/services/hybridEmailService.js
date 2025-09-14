const gmailService = require('./gmailService');

class HybridEmailService {
  constructor() {
    this.providers = {
      gmail: gmailService,
    };

    this.userPreferences = new Map(); // In-memory cache for performance
    this._userService = null; // Lazy-loaded to avoid circular dependency
  }

  // Lazy load userService to avoid circular dependency
  get userService() {
    if (!this._userService) {
      this._userService = require('./userService');
    }
    return this._userService;
  }

  async sendEmail(emailData, professorEmail, userId, preferredProvider = 'gmail') {
    try {
      console.log(`Sending email for user ${userId} using ${preferredProvider}`);
      console.log('Email data:', {
        subject: emailData.subject,
        fromName: emailData.fromName,
        fromEmail: emailData.fromEmail,
        to: professorEmail
      });

      // Use Gmail as the primary provider
      const provider = 'gmail';
      console.log(`Selected provider: ${provider}`);

      // Validate provider availability
      if (!this.providers[provider]) {
        throw new Error(`Email provider ${provider} is not available`);
      }

      // Send email using Gmail
      let result;
      try {
        const configKey = `${userId}_gmail`;
        let userConfig = this.userPreferences.get(configKey);

        // If not in cache, try database using new Gmail methods
        if (!userConfig && this.userService?.useDatabase) {
          try {
            const dbConfig = await this.userService.getGmailConfig(userId);
            if (dbConfig && dbConfig.configured) {
              userConfig = dbConfig;
              // Cache it for future use
              this.userPreferences.set(configKey, userConfig);
              console.log(`✅ Loaded Gmail config from database for user ${userId}`);
            }
          } catch (dbError) {
            console.log(`Database check failed for user ${userId}:`, dbError.message);
          }
        }

        if (userConfig) {
          console.log(`📧 Sending email via Gmail API for user ${userId}`);
          result = await this.providers[provider].sendEmailWithRetry(emailData, professorEmail, userConfig);
        } else {
          console.log(`⚠️ Gmail config not found for user ${userId}, using fallback`);
          result = await this.providers[provider].sendEmail(emailData, professorEmail);
        }
      } catch (configError) {
        console.error(`❌ Error getting Gmail config for user ${userId}:`, configError.message);
        // Fallback to regular Gmail service (which will also fail, but with better error)
        result = await this.providers[provider].sendEmail(emailData, professorEmail);
      }

      // Log the successful send
      this.logEmailSend(userId, provider, result);

      return {
        ...result,
        provider: provider,
        userId: userId
      };

    } catch (error) {
      console.error(`Email send failed for user ${userId}:`, error.message);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async getUserProvider(userId, preferredProvider) {
    try {
      // First check in-memory cache
      let userGmailConfig = this.userPreferences.get(`${userId}_gmail`);

      // If not in cache, try to get from database (if using Supabase)
      if (!userGmailConfig && this.userService?.useDatabase) {
        try {
          const dbConfig = await this.userService.getGmailConfig(userId);
          if (dbConfig && dbConfig.configured) {
            // Cache it in memory for future requests
            this.userPreferences.set(`${userId}_gmail`, dbConfig);
            userGmailConfig = dbConfig;
            console.log(`✅ Loaded Gmail config from database for user ${userId}`);
          }
        } catch (dbError) {
          console.log(`Database check failed for user ${userId}, using in-memory only:`, dbError.message);
        }
      }

      // Always use Gmail as the primary provider
      return 'gmail';
    } catch (error) {
      console.error(`Error getting provider for user ${userId}:`, error);
      return 'gmail'; // Default to Gmail
    }
  }

  async configureProvider(userId, provider, config) {
    try {
      console.log(`Configuring ${provider} for user ${userId}`);

      if (provider === 'gmail') {
        // Validate Gmail OAuth configuration
        if (!config.clientId || !config.clientSecret || !config.refreshToken) {
          throw new Error('Gmail OAuth configuration incomplete');
        }

        // Store user-specific Gmail configuration
        this.userPreferences.set(`${userId}_gmail`, config);

        return {
          success: true,
          provider: 'gmail',
          configured: true,
          message: 'Gmail OAuth configured successfully'
        };
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }

    } catch (error) {
      console.error(`Provider configuration failed: ${error.message}`);
      throw error;
    }
  }

  async getUserEmailHistory(userId, limit = 50) {
    // In production, this would query a database
    // For now, return mock data structure
    return {
      userId: userId,
      totalSent: 0,
      recentEmails: [],
      rateLimits: this.getUserRateLimits(userId)
    };
  }

  getUserRateLimits(userId) {
    // Get rate limits based on user's plan/subscription
    // In production, this would check user's subscription tier
    const baseLimits = {
      gmail: {
        daily: 500,  // Gmail's daily sending limit
        monthly: 15000,
        cooldown: 1
      }
    };

    return baseLimits;
  }

  async checkProviderStatus(provider) {
    try {
      if (!this.providers[provider]) {
        return {
          available: false,
          message: `Provider ${provider} is not configured`
        };
      }

      if (provider === 'gmail') {
        // Gmail status check would go here
        return {
          available: true,
          message: 'Gmail integration ready',
          limits: { daily: 500, monthly: 15000, cooldown: 1 },
          capabilities: {
            htmlEmails: true,
            attachments: true,
            tracking: true,
            templates: true,
            customDomains: true,
            bulkSending: false,
            scheduling: false
          }
        };
      }

    } catch (error) {
      return {
        available: false,
        message: `Status check failed: ${error.message}`,
        error: error.message
      };
    }
  }

  async getAvailableProviders() {
    const providers = [];

    for (const [name, service] of Object.entries(this.providers)) {
      try {
        const status = await this.checkProviderStatus(name);
        providers.push({
          name: name,
          ...status
        });
      } catch (error) {
        providers.push({
          name: name,
          available: false,
          message: `Failed to check status: ${error.message}`
        });
      }
    }

    return providers;
  }

  logEmailSend(userId, provider, result) {
    // In production, this would log to a database
    console.log(`Email sent - User: ${userId}, Provider: ${provider}, Result: ${result.success ? 'Success' : 'Failed'}`);

    // Update user's email count (in production, this would be in database)
    // This is a simple in-memory counter for demo purposes
    const userKey = `user_${userId}_emails_today`;
    const today = new Date().toDateString();
    const lastUpdateKey = `user_${userId}_last_update`;

    if (this.userPreferences.get(lastUpdateKey) !== today) {
      this.userPreferences.set(userKey, 0);
      this.userPreferences.set(lastUpdateKey, today);
    }

    const currentCount = this.userPreferences.get(userKey) || 0;
    this.userPreferences.set(userKey, currentCount + 1);
  }

  getUserEmailCount(userId) {
    const today = new Date().toDateString();
    const lastUpdateKey = `user_${userId}_last_update`;

    if (this.userPreferences.get(lastUpdateKey) !== today) {
      return 0; // Reset count for new day
    }

    return this.userPreferences.get(`user_${userId}_emails_today`) || 0;
  }

  // Test Gmail connection
  async testGmailConnection() {
    try {
      console.log('Testing Gmail connection via hybrid service...');

      if (!this.providers.gmail) {
        throw new Error('Gmail service not available');
      }

      const result = await this.providers.gmail.testConnection();

      return {
        success: result.success,
        message: result.message,
        profile: result.profile,
        provider: 'gmail',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Gmail connection test failed in hybrid service:', error.message);
      return {
        success: false,
        message: `Gmail connection test failed: ${error.message}`,
        error: error.message,
        provider: 'gmail',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Health check for the hybrid service
  async healthCheck() {
    try {
      const providers = await this.getAvailableProviders();
      const availableProviders = providers.filter(p => p.available);

      return {
        status: availableProviders.length > 0 ? 'healthy' : 'degraded',
        providers: providers,
        availableCount: availableProviders.length,
        totalCount: providers.length,
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

module.exports = new HybridEmailService();
