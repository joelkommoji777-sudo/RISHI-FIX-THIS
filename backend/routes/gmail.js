const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const userService = require('../services/userService');

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth-callback'
);

// Initiate Gmail OAuth flow
router.post('/auth', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log(`🔐 Initiating Gmail OAuth for user: ${userId}`);

    // Generate auth URL with necessary scopes
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Force consent to get refresh token
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      state: JSON.stringify({ userId })
    });

    console.log(`✅ Auth URL generated for user ${userId}`);

    res.json({
      success: true,
      authUrl,
      message: 'Please complete authorization in the popup window'
    });

  } catch (error) {
    console.error('Gmail auth initiation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Gmail authorization',
      error: error.message
    });
  }
});

// Handle OAuth callback
router.post('/oauth-callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Parse state to get userId
    const stateData = state ? JSON.parse(state) : { userId: 'default-user' };
    const userId = stateData.userId;

    console.log(`🔄 Processing OAuth callback for user: ${userId}`);

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log(`🎫 Tokens received:`, {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date
    });

    // Set credentials to get user info
    oauth2Client.setCredentials(tokens);

    // Get user's email address
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    console.log(`📧 User email retrieved: ${userInfo.email}`);

    // Prepare Gmail configuration
    const gmailConfig = {
      user_email: userInfo.email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type || 'Bearer',
      expiry_date: tokens.expiry_date,
      configured: true,
      connected_at: new Date().toISOString()
    };

    // Save Gmail configuration using userService
    console.log(`💾 Saving Gmail config for user ${userId}`);
    const saveResult = await userService.saveGmailConfig(userId, gmailConfig);
    
    if (!saveResult.success) {
      throw new Error('Failed to save Gmail configuration');
    }

    console.log(`✅ Gmail successfully connected for user ${userId}`);

    res.json({
      success: true,
      message: 'Gmail account connected successfully',
      email: userInfo.email,
      storage: saveResult.storage
    });

  } catch (error) {
    console.error('OAuth callback processing failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete Gmail authorization',
      error: error.message
    });
  }
});

// Test Gmail connection
router.get('/test/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🧪 Testing Gmail connection for user: ${userId}`);

    // Get user's Gmail configuration
    const gmailConfig = await userService.getGmailConfig(userId);
    
    if (!gmailConfig || !gmailConfig.configured) {
      return res.status(404).json({
        success: false,
        message: 'Gmail not configured for this user'
      });
    }

    // Test if we can refresh the access token
    const testClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    testClient.setCredentials({
      refresh_token: gmailConfig.refresh_token
    });

    const { credentials } = await testClient.refreshAccessToken();
    
    res.json({
      success: true,
      message: 'Gmail connection is working',
      email: gmailConfig.user_email,
      tokenValid: !!credentials.access_token
    });

  } catch (error) {
    console.error('Gmail connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Gmail connection test failed',
      error: error.message
    });
  }
});

// Disconnect Gmail
router.post('/disconnect/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🔌 Disconnecting Gmail for user: ${userId}`);

    const result = await userService.deleteGmailConfig(userId);
    
    res.json({
      success: true,
      message: 'Gmail disconnected successfully'
    });

  } catch (error) {
    console.error('Gmail disconnect failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Gmail',
      error: error.message
    });
  }
});

// Get Gmail configuration status
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const gmailConfig = await userService.getGmailConfig(userId);
    
    if (!gmailConfig || !gmailConfig.configured) {
      return res.json({
        success: true,
        configured: false,
        message: 'Gmail not configured'
      });
    }

    res.json({
      success: true,
      configured: true,
      email: gmailConfig.user_email,
      connectedAt: gmailConfig.connected_at
    });

  } catch (error) {
    console.error('Gmail status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Gmail status',
      error: error.message
    });
  }
});

module.exports = router;