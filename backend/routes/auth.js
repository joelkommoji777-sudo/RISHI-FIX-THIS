const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const sessionService = require('../services/sessionService');
const { authenticateUser, optionalAuth } = require('../middleware/auth');

// POST /api/auth/login
// Login user and create session
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received');
    
    const { email, name, grade, interests } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        message: 'Please provide an email address'
      });
    }

    // Check if user exists, create if not
    let user;
    try {
      // Try to find existing user by email
      const existingUsers = await userService.getAllUsers();
      user = existingUsers.find(u => u.email === email);
      
      if (!user) {
        // Create new user
        console.log(`Creating new user for email: ${email}`);
        const userData = {
          email,
          name: name || '',
          grade: grade || '',
          interests: interests || [],
          resume: null,
          preferences: {
            emailProvider: 'gmail',
            notifications: true,
            theme: 'light'
          }
        };
        
        const createResult = await userService.createUser(userData);
        if (!createResult.success) {
          throw new Error('Failed to create user');
        }
        
        user = createResult.user;
        console.log(`✅ New user created: ${user.id}`);
      } else {
        console.log(`✅ Existing user found: ${user.id}`);
      }
    } catch (userError) {
      console.error('User creation/retrieval failed:', userError);
      return res.status(500).json({
        success: false,
        error: 'User authentication failed',
        message: 'Unable to authenticate user'
      });
    }

    // Create session
    const session = await sessionService.createSession(user.id, 24); // 24 hours

    // Set session cookie
    res.cookie('sessionToken', session.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    console.log(`✅ Session created for user ${user.id}`);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        grade: user.grade,
        interests: user.interests,
        preferences: user.preferences
      },
      session: {
        token: session.session_token,
        expiresAt: session.expires_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// POST /api/auth/logout
// Logout user and destroy session
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const sessionToken = req.session.session_token;
    
    // Delete session
    await sessionService.deleteSession(sessionToken);
    
    // Clear session cookie
    res.clearCookie('sessionToken');
    
    console.log(`✅ User ${req.userId} logged out`);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error.message
    });
  }
});

// GET /api/auth/me
// Get current user info
router.get('/me', authenticateUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        grade: req.user.grade,
        interests: req.user.interests,
        preferences: req.user.preferences,
        resume: req.user.resume,
        created_at: req.user.created_at,
        last_login: req.user.last_login
      },
      session: {
        token: req.session.session_token,
        expiresAt: req.session.expires_at,
        lastActivity: req.session.last_activity
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info',
      message: error.message
    });
  }
});

// PUT /api/auth/profile
// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, grade, interests, preferences } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (grade !== undefined) updates.grade = grade;
    if (interests !== undefined) updates.interests = interests;
    if (preferences !== undefined) updates.preferences = preferences;

    const result = await userService.updateUser(req.userId, updates);
    
    if (!result.success) {
      throw new Error('Failed to update profile');
    }

    console.log(`✅ Profile updated for user ${req.userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile update failed',
      message: error.message
    });
  }
});

// POST /api/auth/refresh
// Refresh session token
router.post('/refresh', authenticateUser, async (req, res) => {
  try {
    const oldSessionToken = req.session.session_token;
    
    // Create new session
    const newSession = await sessionService.createSession(req.userId, 24);
    
    // Delete old session
    await sessionService.deleteSession(oldSessionToken);
    
    // Set new session cookie
    res.cookie('sessionToken', newSession.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    console.log(`✅ Session refreshed for user ${req.userId}`);

    res.json({
      success: true,
      message: 'Session refreshed successfully',
      session: {
        token: newSession.session_token,
        expiresAt: newSession.expires_at
      }
    });

  } catch (error) {
    console.error('Session refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Session refresh failed',
      message: error.message
    });
  }
});

// GET /api/auth/sessions
// Get user's active sessions
router.get('/sessions', authenticateUser, async (req, res) => {
  try {
    const sessions = await sessionService.getUserSessions(req.userId);
    
    // Remove sensitive data
    const safeSessions = sessions.map(session => ({
      id: session.id,
      created_at: session.created_at,
      last_activity: session.last_activity,
      expires_at: session.expires_at,
      is_current: session.session_token === req.session.session_token
    }));

    res.json({
      success: true,
      sessions: safeSessions
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions',
      message: error.message
    });
  }
});

// DELETE /api/auth/sessions/:sessionId
// Delete a specific session
router.delete('/sessions/:sessionId', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get user's sessions to verify ownership
    const sessions = await sessionService.getUserSessions(req.userId);
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: 'Session not found or does not belong to user'
      });
    }

    // Don't allow deleting current session
    if (session.session_token === req.session.session_token) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete current session',
        message: 'Use logout to end current session'
      });
    }

    await sessionService.deleteSession(session.session_token);

    console.log(`✅ Session ${sessionId} deleted for user ${req.userId}`);

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete session',
      message: error.message
    });
  }
});

// GET /api/auth/status
// Check authentication status (optional auth)
router.get('/status', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      res.json({
        success: true,
        authenticated: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name
        }
      });
    } else {
      res.json({
        success: true,
        authenticated: false,
        message: 'Not authenticated'
      });
    }

  } catch (error) {
    console.error('Auth status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Auth status check failed',
      message: error.message
    });
  }
});

module.exports = router;