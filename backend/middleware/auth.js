const sessionService = require('../services/sessionService');
const userService = require('../services/userService');

// Middleware to authenticate users via session token
const authenticateUser = async (req, res, next) => {
  try {
    // Get session token from various sources
    let sessionToken = null;
    
    // 1. Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }
    
    // 2. Check session-token header
    if (!sessionToken) {
      sessionToken = req.headers['session-token'];
    }
    
    // 3. Check query parameter (for testing)
    if (!sessionToken) {
      sessionToken = req.query.sessionToken;
    }
    
    // 4. Check cookies
    if (!sessionToken) {
      sessionToken = req.cookies?.sessionToken;
    }

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'No session token provided',
        message: 'Please log in to access this resource'
      });
    }

    // Validate session
    const session = await sessionService.getSession(sessionToken);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
        message: 'Please log in again'
      });
    }

    // Get user data
    const userResult = await userService.getUser(session.user_id);
    
    if (!userResult.success) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'Please log in again'
      });
    }

    // Attach user and session info to request
    req.user = userResult.user;
    req.session = session;
    req.userId = session.user_id;
    
    next();

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'Internal server error'
    });
  }
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    // Get session token from various sources
    let sessionToken = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }
    
    if (!sessionToken) {
      sessionToken = req.headers['session-token'];
    }
    
    if (!sessionToken) {
      sessionToken = req.query.sessionToken;
    }

    if (!sessionToken) {
      sessionToken = req.cookies?.sessionToken;
    }

    if (sessionToken) {
      const session = await sessionService.getSession(sessionToken);
      
      if (session) {
        const userResult = await userService.getUser(session.user_id);
        
        if (userResult.success) {
          req.user = userResult.user;
          req.session = session;
          req.userId = session.user_id;
        }
      }
    }

    next();

  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    // Don't fail the request, just continue without user info
    next();
  }
};

// Middleware to ensure user has specific permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // For now, all authenticated users have all permissions
    // In the future, you can implement role-based permissions here
    const userPermissions = req.user.permissions || ['read', 'write', 'admin'];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

// Middleware to log user activity
const logActivity = (activity) => {
  return (req, res, next) => {
    if (req.user) {
      console.log(`User ${req.userId} performed activity: ${activity}`);
      // In production, you might want to log this to a database
    }
    next();
  };
};

// Middleware to check rate limits
const checkRateLimit = async (req, res, next) => {
  try {
    if (!req.userId) {
      return next(); // Skip rate limiting for unauthenticated requests
    }

    const rateLimitResult = await userService.checkRateLimit(req.userId);
    
    if (!rateLimitResult.canSend) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: rateLimitResult.cooldown,
        limits: {
          daily: rateLimitResult.dailyCount,
          dailyLimit: rateLimitResult.dailyLimit,
          monthly: rateLimitResult.monthlyCount,
          monthlyLimit: rateLimitResult.monthlyLimit
        }
      });
    }

    next();

  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Don't fail the request if rate limiting fails
    next();
  }
};

module.exports = {
  authenticateUser,
  optionalAuth,
  requirePermission,
  logActivity,
  checkRateLimit
};



