const crypto = require('crypto');
const supabaseService = require('./supabaseService');

class SessionService {
  constructor() {
    this.sessions = new Map(); // In-memory session cache
    this.useDatabase = false;
    
    // Check database connection after a short delay
    setTimeout(() => {
      this.useDatabase = supabaseService.isConnected;
      console.log(`🔄 SessionService initialized with ${this.useDatabase ? 'Supabase database' : 'in-memory storage'}`);
    }, 1000);
  }

  // Generate a secure session token
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create a new user session
  async createSession(userId, expiresInHours = 24) {
    try {
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
      
      const sessionData = {
        id: crypto.randomUUID(),
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      };

      // Store in database if available
      if (this.useDatabase) {
        try {
          const { data, error } = await supabaseService.supabase
            .from('user_sessions')
            .insert([sessionData])
            .select()
            .single();

          if (error) throw error;
          
          // Cache in memory
          this.sessions.set(sessionToken, data);
          console.log(`✅ Session created in database for user ${userId}`);
          return data;
        } catch (dbError) {
          console.error('Database session creation failed:', dbError);
          // Fall through to in-memory storage
        }
      }

      // Fallback to in-memory storage
      this.sessions.set(sessionToken, sessionData);
      console.log(`📝 Session created in-memory for user ${userId}`);
      return sessionData;

    } catch (error) {
      console.error('Session creation failed:', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  // Validate and get session data
  async getSession(sessionToken) {
    try {
      // First check in-memory cache
      let session = this.sessions.get(sessionToken);

      // If not in cache and database is available, try database
      if (!session && this.useDatabase) {
        try {
          const { data, error } = await supabaseService.supabase
            .from('user_sessions')
            .select('*')
            .eq('session_token', sessionToken)
            .single();

          if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
          
          if (data) {
            session = data;
            // Cache in memory
            this.sessions.set(sessionToken, session);
          }
        } catch (dbError) {
          console.error('Database session retrieval failed:', dbError);
        }
      }

      if (!session) {
        return null;
      }

      // Check if session is expired
      const now = new Date();
      const expiresAt = new Date(session.expires_at);
      
      if (now > expiresAt) {
        console.log(`Session expired for token: ${sessionToken.substring(0, 8)}...`);
        await this.deleteSession(sessionToken);
        return null;
      }

      // Update last activity
      await this.updateLastActivity(sessionToken);
      
      return session;

    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  // Update last activity timestamp
  async updateLastActivity(sessionToken) {
    try {
      const now = new Date().toISOString();
      
      // Update in-memory cache
      const session = this.sessions.get(sessionToken);
      if (session) {
        session.last_activity = now;
        this.sessions.set(sessionToken, session);
      }

      // Update in database if available
      if (this.useDatabase) {
        try {
          await supabaseService.supabase
            .from('user_sessions')
            .update({ last_activity: now })
            .eq('session_token', sessionToken);
        } catch (dbError) {
          console.error('Database last activity update failed:', dbError);
        }
      }

    } catch (error) {
      console.error('Last activity update failed:', error);
    }
  }

  // Delete a session
  async deleteSession(sessionToken) {
    try {
      // Remove from in-memory cache
      this.sessions.delete(sessionToken);

      // Remove from database if available
      if (this.useDatabase) {
        try {
          await supabaseService.supabase
            .from('user_sessions')
            .delete()
            .eq('session_token', sessionToken);
        } catch (dbError) {
          console.error('Database session deletion failed:', dbError);
        }
      }

      console.log(`Session deleted: ${sessionToken.substring(0, 8)}...`);

    } catch (error) {
      console.error('Session deletion failed:', error);
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  // Delete all sessions for a user
  async deleteUserSessions(userId) {
    try {
      // Remove from in-memory cache
      for (const [token, session] of this.sessions.entries()) {
        if (session.user_id === userId) {
          this.sessions.delete(token);
        }
      }

      // Remove from database if available
      if (this.useDatabase) {
        try {
          await supabaseService.supabase
            .from('user_sessions')
            .delete()
            .eq('user_id', userId);
        } catch (dbError) {
          console.error('Database user sessions deletion failed:', dbError);
        }
      }

      console.log(`All sessions deleted for user: ${userId}`);

    } catch (error) {
      console.error('User sessions deletion failed:', error);
      throw new Error(`Failed to delete user sessions: ${error.message}`);
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions() {
    try {
      const now = new Date();
      let cleanedCount = 0;

      // Clean in-memory cache
      for (const [token, session] of this.sessions.entries()) {
        const expiresAt = new Date(session.expires_at);
        if (now > expiresAt) {
          this.sessions.delete(token);
          cleanedCount++;
        }
      }

      // Clean database if available
      if (this.useDatabase) {
        try {
          const { error } = await supabaseService.supabase
            .from('user_sessions')
            .delete()
            .lt('expires_at', now.toISOString());

          if (error) throw error;
        } catch (dbError) {
          console.error('Database session cleanup failed:', dbError);
        }
      }

      console.log(`Cleaned up ${cleanedCount} expired sessions`);
      return cleanedCount;

    } catch (error) {
      console.error('Session cleanup failed:', error);
      return 0;
    }
  }

  // Get user's active sessions
  async getUserSessions(userId) {
    try {
      const userSessions = [];

      // Get from in-memory cache
      for (const [token, session] of this.sessions.entries()) {
        if (session.user_id === userId) {
          userSessions.push(session);
        }
      }

      // Get from database if available
      if (this.useDatabase) {
        try {
          const { data, error } = await supabaseService.supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('last_activity', { ascending: false });

          if (error) throw error;
          
          // Merge with in-memory data (avoid duplicates)
          if (data) {
            for (const dbSession of data) {
              const exists = userSessions.some(s => s.id === dbSession.id);
              if (!exists) {
                userSessions.push(dbSession);
              }
            }
          }
        } catch (dbError) {
          console.error('Database user sessions retrieval failed:', dbError);
        }
      }

      return userSessions;

    } catch (error) {
      console.error('Get user sessions failed:', error);
      return [];
    }
  }

  // Health check
  async healthCheck() {
    try {
      const activeSessions = this.sessions.size;
      const expiredCount = await this.cleanupExpiredSessions();

      return {
        status: 'healthy',
        activeSessions: activeSessions,
        expiredCleaned: expiredCount,
        useDatabase: this.useDatabase,
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

module.exports = new SessionService();



