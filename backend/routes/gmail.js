const express = require('express');
const { google } = require('googleapis');
const userService = require('../services/userService');
const router = express.Router();

// GET /api/gmail/auth-url
// Get OAuth authorization URL for Gmail
router.post('/auth-url', async (req, res) => {
  try {
    const { userId, redirectUri } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        success: false
      });
    }

    console.log(`🔗 Generating Gmail OAuth URL for user: ${userId}`);

    // Check if user exists
    const user = await userService.getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found. Please register first.',
        success: false
      });
    }

    // Create OAuth2 client with proper redirect URI
    const finalRedirectUri = redirectUri || `${process.env.FRONTEND_URL || 'http://localhost:8080'}/oauth-callback.html`;
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      finalRedirectUri
    );

    // Generate state parameter for security (include userId)
    const state = Buffer.from(JSON.stringify({
      userId: userId,
      timestamp: Date.now()
    })).toString('base64');

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      state: state,
      prompt: 'consent' // Force consent screen to get refresh token
    });

    console.log(`✅ Gmail OAuth URL generated for user: ${userId}`);

    res.json({
      success: true,
      authUrl: authUrl,
      message: 'OAuth URL generated successfully'
    });

  } catch (error) {
    console.error('❌ Gmail auth URL generation error:', error);
    res.status(500).json({
      error: 'Failed to generate OAuth URL',
      message: error.message,
      success: false
    });
  }
});

// POST /api/gmail/oauth-callback
// Handle OAuth callback and store tokens
router.post('/oauth-callback', async (req, res) => {
  try {
    const { code, state, redirectUri } = req.body;

    if (!code || !state) {
      return res.status(400).json({
        error: 'Authorization code and state are required',
        success: false
      });
    }

    console.log('🔄 Processing Gmail OAuth callback...');

    // Decode state parameter
    let decodedState;
    try {
      decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid state parameter',
        success: false
      });
    }

    const { userId } = decodedState;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID not found in state parameter',
        success: false
      });
    }

    console.log(`🔄 Processing OAuth for user: ${userId}`);

    // Check if user exists
    const user = await userService.getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found. Please register first.',
        success: false
      });
    }

    // Create OAuth2 client with proper redirect URI
    const finalRedirectUri = redirectUri || `${process.env.FRONTEND_URL || 'http://localhost:8080'}/oauth-callback.html`;
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      finalRedirectUri
    );

    // Exchange authorization code for tokens
    console.log('🔄 Exchanging authorization code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return res.status(400).json({
        error: 'Failed to obtain access tokens',
        success: false
      });
    }

    // Set credentials to get user profile
    oauth2Client.setCredentials(tokens);

    // Get user profile information
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    const userEmail = profile.data.emailAddress;

    // Save Gmail configuration for user
    const gmailConfig = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      user_email: userEmail,
      configured: true,
      last_updated: new Date().toISOString()
    };

    console.log(`💾 Attempting to save Gmail config for user: ${userId}`);
    console.log(`💾 Config data:`, {
      user_email: userEmail,
      has_access_token: !!tokens.access_token,
      has_refresh_token: !!tokens.refresh_token,
      configured: true
    });

    try {
      const saveResult = await userService.saveGmailConfig(userId, gmailConfig);
      console.log(`💾 Save result:`, saveResult);

      if (!saveResult || !saveResult.success) {
        throw new Error('Failed to save Gmail configuration to database');
      }

      console.log(`✅ Gmail configuration saved for user: ${userId} (${userEmail})`);

      res.json({
        success: true,
        message: 'Gmail connected successfully',
        user: {
          id: userId,
          email: userEmail,
          configured: true
        }
      });

    } catch (saveError) {
      console.error('❌ Failed to save Gmail config:', saveError);
      return res.status(500).json({
        error: 'Failed to save Gmail configuration',
        message: saveError.message,
        success: false
      });
    }

  } catch (error) {
    console.error('❌ Gmail OAuth callback error:', error);
    res.status(500).json({
      error: 'Failed to complete Gmail authentication',
      message: error.message,
      success: false
    });
  }
});

// POST /api/gmail/test-connection
// Test Gmail connection for a user
router.post('/test-connection', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        success: false
      });
    }

    console.log(`🔍 Testing Gmail connection for user: ${userId}`);

    // Get Gmail configuration for user
    const gmailConfig = await userService.getGmailConfig(userId);

    if (!gmailConfig || !gmailConfig.configured) {
      return res.status(404).json({
        error: 'Gmail not configured for this user',
        success: false
      });
    }

    // Create OAuth2 client with user's tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials
    oauth2Client.setCredentials({
      access_token: gmailConfig.access_token,
      refresh_token: gmailConfig.refresh_token,
      expiry_date: gmailConfig.expiry_date
    });

    // Test connection by getting profile
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    console.log(`✅ Gmail connection test successful for user: ${userId}`);

    res.json({
      success: true,
      message: 'Gmail connection test successful',
      user: {
        email: profile.data.emailAddress,
        messagesTotal: profile.data.messagesTotal,
        threadsTotal: profile.data.threadsTotal
      }
    });

  } catch (error) {
    console.error('❌ Gmail connection test error:', error);

    // Check if it's a token refresh issue
    if (error.message.includes('invalid_grant') || error.message.includes('access_denied')) {
      // Try to refresh the token
      try {
        const gmailConfig = await userService.getGmailConfig(userId);

        if (gmailConfig && gmailConfig.refresh_token) {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
          );

          oauth2Client.setCredentials({
            refresh_token: gmailConfig.refresh_token
          });

          const { credentials } = await oauth2Client.refreshAccessToken();
          const { access_token, expiry_date } = credentials;

          // Update stored tokens
          await userService.saveGmailConfig(userId, {
            ...gmailConfig,
            access_token,
            expiry_date,
            last_updated: new Date().toISOString()
          });

          return res.json({
            success: true,
            message: 'Gmail tokens refreshed successfully',
            refreshed: true
          });
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
      }
    }

    res.status(500).json({
      error: 'Gmail connection test failed',
      message: error.message,
      success: false
    });
  }
});

// GET /api/gmail/config/:userId
// Get Gmail configuration status for a user
router.get('/config/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`📋 Getting Gmail config for user: ${userId}`);

    const gmailConfig = await userService.getGmailConfig(userId);
    console.log(`📋 Gmail config retrieved:`, gmailConfig);

    if (!gmailConfig || !gmailConfig.configured) {
      console.log(`❌ No Gmail config found for user: ${userId}`);
      return res.json({
        success: true,
        configured: false,
        message: 'Gmail not configured'
      });
    }

    // Check if access token is still valid
    const now = Date.now();
    const expiryDate = gmailConfig.expiry_date;
    const isExpired = expiryDate && (now >= expiryDate);

    res.json({
      success: true,
      configured: true,
      userEmail: gmailConfig.user_email,
      isExpired: isExpired,
      lastUpdated: gmailConfig.last_updated
    });

  } catch (error) {
    console.error('❌ Gmail config retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get Gmail configuration',
      message: error.message,
      success: false
    });
  }
});

// POST /api/gmail/test-save
// Test endpoint to debug Gmail config saving
router.post('/test-save', async (req, res) => {
  try {
    const { userId, gmailConfig } = req.body;

    if (!userId || !gmailConfig) {
      return res.status(400).json({
        error: 'User ID and Gmail config are required',
        success: false
      });
    }

    console.log(`🧪 Testing Gmail config save for user: ${userId}`);
    console.log(`🧪 Config data:`, gmailConfig);

    const result = await userService.saveGmailConfig(userId, gmailConfig);
    console.log(`🧪 Save result:`, result);

    res.json({
      success: true,
      message: 'Test save completed',
      result: result
    });

  } catch (error) {
    console.error('❌ Test save error:', error);
    res.status(500).json({
      error: 'Test save failed',
      message: error.message,
      success: false
    });
  }
});

module.exports = router;
