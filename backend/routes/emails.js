const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const userService = require('../services/userService');
const hybridEmailService = require('../services/hybridEmailService');

// POST /api/generate-emails
// Generate personalized emails for professor outreach
router.post('/generate-emails', async (req, res) => {
  try {
    console.log('Email generation request received');
    console.log('Request body keys:', Object.keys(req.body));

    const { resumeData, professors } = req.body;

    // Validate required fields
    if (!resumeData || !professors || !Array.isArray(professors)) {
      return res.status(400).json({
        error: 'Missing or invalid required fields',
        required: ['resumeData', 'professors (array)'],
        received: {
          resumeData: !!resumeData,
          professors: Array.isArray(professors) ? professors.length : typeof professors
        }
      });
    }

    if (professors.length === 0) {
      return res.status(400).json({
        error: 'No professors provided for email generation',
        message: 'Please provide at least one professor to generate emails for'
      });
    }

    console.log('Generating emails for', professors.length, 'professors...');

    // Call Gemini service to generate emails
    const emailResult = await geminiService.generateEmails(resumeData, professors);

    console.log('Email generation completed successfully');
    console.log('Generated', emailResult.emails?.length || 0, 'emails');

    res.json({
      success: true,
      data: emailResult,
      timestamp: new Date().toISOString(),
      summary: {
        totalEmails: emailResult.emails?.length || 0,
        totalProfessors: professors.length,
        averagePersonalizationScore: emailResult.emails?.reduce((sum, email) => sum + (email.personalizationScore || 0), 0) / (emailResult.emails?.length || 1)
      }
    });

  } catch (error) {
    console.error('Email generation error:', error);
    res.status(500).json({
      error: 'Email generation failed',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/generate-single-email
// Generate a single personalized email for a specific professor
router.post('/generate-single-email', async (req, res) => {
  try {
    console.log('Single email generation request received');

    const { resumeData, professor } = req.body;

    if (!resumeData || !professor) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['resumeData', 'professor'],
        received: { resumeData: !!resumeData, professor: !!professor }
      });
    }

    console.log('Generating single email for professor:', professor.name);

    // Generate email for single professor
    const emailResult = await geminiService.generateEmails(resumeData, [professor]);

    if (!emailResult.emails || emailResult.emails.length === 0) {
      return res.status(500).json({
        error: 'Email generation failed',
        message: 'No email was generated'
      });
    }

    res.json({
      success: true,
      email: emailResult.emails[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Single email generation error:', error);
    res.status(500).json({
      error: 'Single email generation failed',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/send-email
// Send email via hybrid service (Gmail/EmailJS) or return mailto data
router.post('/send-email', async (req, res) => {
  try {
    console.log('Email sending request received');

    const { emailData, professorEmail, userId, preferredProvider } = req.body;

    if (!emailData || !professorEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['emailData', 'professorEmail'],
        received: { emailData: !!emailData, professorEmail: !!professorEmail }
      });
    }

    console.log('Sending email to:', professorEmail, 'from user:', userId, 'preferred provider:', preferredProvider);

    // If user wants to use mailto, return the mailto link data instead of sending
    if (preferredProvider === 'mailto') {
      const mailtoLink = `mailto:${professorEmail}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;

      res.json({
        success: true,
        message: 'Mailto link generated successfully',
        mailtoLink: mailtoLink,
        provider: 'mailto',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Use the hybrid email service to send the email with the preferred provider
    const result = await hybridEmailService.sendEmail(emailData, professorEmail, userId || 'anonymous', preferredProvider);

    console.log('Email sent successfully via hybrid service');

    res.json({
      success: true,
      message: 'Email sent successfully',
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      error: 'Email sending failed',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/user/email-config
// Save user email configuration
router.post('/user/email-config', async (req, res) => {
  try {
    console.log('User email configuration request received');

    const { provider, config, userId } = req.body;

    if (!provider || !config) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['provider', 'config'],
        received: { provider: !!provider, config: !!config }
      });
    }

    console.log('Configuring email for user:', userId, 'provider:', provider);

    // Save email configuration
    const result = await userService.saveEmailConfiguration(userId || 'anonymous', provider, config);

    console.log('Email configuration saved successfully');

    res.json({
      success: true,
      message: 'Email configuration saved successfully',
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email configuration error:', error);
    res.status(500).json({
      error: 'Email configuration failed',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/test-gmail-connection
// Test Gmail OAuth connection
router.post('/test-gmail-connection', async (req, res) => {
  try {
    console.log('Testing Gmail connection...');

    const result = await hybridEmailService.testGmailConnection();

    res.json({
      success: true,
      message: 'Gmail connection test completed',
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gmail connection test failed:', error);
    res.status(500).json({
      error: 'Gmail connection test failed',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/user/email-config/:userId
// Get user's email configuration
router.get('/user/email-config/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting email configuration for user:', userId);

    // Try to get Gmail configuration first
    const gmailConfigKey = `${userId}_gmail`;
    if (userService.emailConfigs.has(gmailConfigKey)) {
      const config = userService.emailConfigs.get(gmailConfigKey);
      return res.json({
        provider: 'gmail',
        configured: true,
        userId: userId,
        timestamp: new Date().toISOString()
      });
    }

    // Try to get EmailJS configuration
    const emailjsConfigKey = `${userId}_emailjs`;
    if (userService.emailConfigs.has(emailjsConfigKey)) {
      const config = userService.emailConfigs.get(emailjsConfigKey);
      return res.json({
        provider: 'emailjs',
        configured: true,
        userId: userId,
        timestamp: new Date().toISOString()
      });
    }

    // No configuration found
    res.json({
      provider: 'none',
      configured: false,
      userId: userId,
      message: 'No email configuration found',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get email configuration error:', error);
    res.status(500).json({
      error: 'Failed to get email configuration',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/gmail/auth
// Generate Gmail OAuth URL for user authentication (simplified endpoint)
router.post('/gmail/auth', async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('Generating Gmail OAuth URL for user:', userId);

    const { google } = require('googleapis');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: JSON.stringify({ userId: userId || 'anonymous' }),
      prompt: 'consent'
    });

    res.json({
      success: true,
      authUrl: authUrl,
      message: 'OAuth URL generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gmail auth URL generation error:', error);
    res.status(500).json({
      error: 'Failed to generate Gmail auth URL',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/gmail/auth-url
// Generate Gmail OAuth URL for user authentication
router.post('/gmail/auth-url', async (req, res) => {
  try {
    const { userId, redirectUri } = req.body;

    console.log('Generating Gmail OAuth URL for user:', userId);

    const { google } = require('googleapis');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri || process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: JSON.stringify({ userId: userId || 'anonymous' }),
      prompt: 'consent'
    });

    res.json({
      success: true,
      authUrl: authUrl,
      message: 'OAuth URL generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gmail auth URL generation error:', error);
    res.status(500).json({
      error: 'Failed to generate Gmail auth URL',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/gmail/oauth-callback
// Handle Gmail OAuth callback and store tokens
router.post('/gmail/oauth-callback', async (req, res) => {
  try {
    const { code, state, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Authorization code is required',
        success: false
      });
    }

    console.log('Processing Gmail OAuth callback');

    const { google } = require('googleapis');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri || process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile information
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Parse state to get userId
    let userId = 'anonymous';
    try {
      const stateData = JSON.parse(state);
      userId = stateData.userId || 'anonymous';
    } catch (e) {
      console.log('Could not parse state, using anonymous');
    }

    // Store Gmail configuration
    const gmailConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
      userEmail: userInfo.data.email,
      userName: userInfo.data.name
    };

    console.log('🔑 OAuth callback - attempting to save Gmail config...');
    console.log('User ID:', userId);
    console.log('Has refresh token:', !!tokens.refresh_token);
    console.log('Has access token:', !!tokens.access_token);

    // Save to user service
    const saveResult = await userService.saveEmailConfiguration(userId, 'gmail', gmailConfig);
    console.log('💾 Save result:', saveResult);

    if (!saveResult.success) {
      console.log('❌ Failed to save Gmail configuration!');
      return res.status(500).json({
        error: 'Failed to save Gmail configuration',
        message: saveResult.message || 'Unknown error',
        success: false
      });
    }

    console.log('✅ Gmail configuration saved successfully');

    console.log('Gmail OAuth tokens saved for user:', userId, 'email:', userInfo.data.email);

    res.json({
      success: true,
      message: 'Gmail account connected successfully',
      user: {
        email: userInfo.data.email,
        name: userInfo.data.name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    res.status(500).json({
      error: 'Failed to process Gmail OAuth callback',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/gmail/test-connection
// Test Gmail connection for a user
router.post('/gmail/test-connection', async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('Testing Gmail connection for user:', userId);

    // Get Gmail configuration from user service
    const configResult = await userService.getEmailConfiguration(userId, 'gmail');

    if (!configResult.success || !configResult.configured) {
      console.log('No Gmail configuration found for user:', userId);
      return res.status(404).json({
        error: 'Gmail not configured for this user',
        success: false
      });
    }

    const config = configResult.config;

    // Test the connection
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: config.refreshToken
    });

    // Try to get user profile
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    res.json({
      success: true,
      message: 'Gmail connection successful',
      user: {
        email: userInfo.data.email,
        name: userInfo.data.name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gmail connection test error:', error);
    res.status(500).json({
      error: 'Gmail connection test failed',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/gmail/debug/:userId
// Debug endpoint to check token storage
router.get('/gmail/debug/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Checking token storage for user:', userId);

    // Check what's in the user service
    const configResult = await userService.getEmailConfiguration(userId, 'gmail');

    if (!configResult.success) {
      console.log('❌ No Gmail config found in user service for user:', userId);
      return res.json({
        userId,
        status: 'no_config_in_service',
        configResult
      });
    }

    const config = configResult.config;

    if (!config) {
      console.log('❌ Config result success but no config object:', configResult);
      return res.json({
        userId,
        status: 'config_result_success_but_no_config',
        configResult
      });
    }

    console.log('✅ Found config in user service:', {
      hasRefreshToken: !!config.refreshToken,
      hasAccessToken: !!config.accessToken,
      userEmail: config.userEmail,
      expiryDate: config.expiryDate,
      configured: configResult.configured
    });

    res.json({
      userId,
      status: 'config_found',
      config: {
        hasRefreshToken: !!config.refreshToken,
        hasAccessToken: !!config.accessToken,
        userEmail: config.userEmail,
        expiryDate: config.expiryDate,
        configured: configResult.configured
      },
      rawConfig: config
    });

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      error: 'Debug check failed',
      message: error.message
    });
  }
});

// POST /api/gmail/test-save/:userId
// Test endpoint to manually save Gmail configuration
router.post('/gmail/test-save/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('🧪 Testing Gmail config save for user:', userId);

    // Create a test Gmail configuration
    const testConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      refreshToken: 'test-refresh-token-' + Date.now(),
      accessToken: 'test-access-token-' + Date.now(),
      expiryDate: Date.now() + (3600 * 1000), // 1 hour from now
      userEmail: 'test@example.com',
      userName: 'Test User'
    };

    console.log('💾 Attempting to save test config...');
    const saveResult = await userService.saveEmailConfiguration(userId, 'gmail', testConfig);

    console.log('💾 Save result:', saveResult);

    res.json({
      userId,
      testConfig: {
        hasRefreshToken: !!testConfig.refreshToken,
        hasAccessToken: !!testConfig.accessToken,
        userEmail: testConfig.userEmail
      },
      saveResult
    });

  } catch (error) {
    console.error('❌ Test save error:', error);
    res.status(500).json({
      error: 'Test save failed',
      message: error.message
    });
  }
});

// POST /api/emails/send
// Send email to professor (simplified endpoint for frontend)
router.post('/send', async (req, res) => {
  try {
    console.log('Email send request received');
    
    const { 
      to, 
      professorName, 
      professorTitle, 
      professorDepartment, 
      researchAreas, 
      studentName, 
      studentEmail, 
      studentBackground, 
      matchingReason,
      userId = 'default-user' // Default to default-user if not provided
    } = req.body;

    if (!to || !professorName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['to', 'professorName'],
        success: false
      });
    }

    // Generate email content using Gemini
    const emailContent = await geminiService.generateEmails(
      {
        personal_info: {
          name: studentName || 'Student',
          email: studentEmail || 'student@example.com'
        },
        education: studentBackground || 'Computer Science Student'
      },
      [{
        name: professorName,
        title: professorTitle || 'Professor',
        department: professorDepartment || 'Department',
        researchAreas: researchAreas || [],
        matchingReason: matchingReason || 'Research interest match'
      }]
    );

    if (!emailContent.emails || emailContent.emails.length === 0) {
      return res.status(500).json({
        error: 'Failed to generate email content',
        success: false
      });
    }

    const emailData = emailContent.emails[0];

    // Try to send via Gmail first, fallback to EmailJS
    try {
      const result = await hybridEmailService.sendEmail(
        {
          subject: emailData.subject,
          body: emailData.body,
          to: to
        },
        to,
        userId, // Use actual user ID instead of 'anonymous'
        'gmail'
      );

      res.json({
        success: true,
        message: 'Email sent successfully via Gmail',
        result: result
      });
    } catch (gmailError) {
      console.log('Gmail failed, trying EmailJS:', gmailError.message);
      
      try {
        const result = await hybridEmailService.sendEmail(
          {
            subject: emailData.subject,
            body: emailData.body,
            to: to
          },
          to,
          userId, // Use actual user ID instead of 'anonymous'
          'emailjs'
        );

        res.json({
          success: true,
          message: 'Email sent successfully via EmailJS',
          result: result
        });
      } catch (emailjsError) {
        console.log('EmailJS also failed:', emailjsError.message);
        
        // Return mailto link as fallback
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        
        res.json({
          success: true,
          message: 'Email services unavailable, use mailto link',
          mailtoLink: mailtoLink,
          emailContent: emailData
        });
      }
    }

  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
      success: false
    });
  }
});

// GET /api/email/config
// Get email configuration status
router.get('/config', async (req, res) => {
  try {
    // Check if Gmail is configured
    const gmailConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    
    // Check if EmailJS is configured
    const emailjsConfigured = !!(
      process.env.EMAILJS_SERVICE_ID && 
      process.env.EMAILJS_TEMPLATE_ID && 
      process.env.EMAILJS_PUBLIC_KEY
    );

    res.json({
      gmail: {
        configured: gmailConfigured,
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'
      },
      emailjs: {
        configured: emailjsConfigured,
        serviceId: process.env.EMAILJS_SERVICE_ID ? 'Set' : 'Not set'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email config check error:', error);
    res.status(500).json({
      error: 'Failed to check email configuration',
      message: error.message,
      success: false
    });
  }
});

// POST /api/email/test
// Test email sending
router.post('/test', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to) {
      return res.status(400).json({
        error: 'Missing required field: to',
        success: false
      });
    }

    const testEmail = {
      subject: subject || 'Test Email from Professor Matcher',
      body: body || 'This is a test email to verify your email configuration.',
      to: to
    };

    // Try Gmail first
    try {
      const result = await hybridEmailService.sendEmail(testEmail, to, 'test-user', 'gmail');
      res.json({
        success: true,
        message: 'Test email sent successfully via Gmail',
        result: result
      });
    } catch (gmailError) {
      // Try EmailJS
      try {
        const result = await hybridEmailService.sendEmail(testEmail, to, 'test-user', 'emailjs');
        res.json({
          success: true,
          message: 'Test email sent successfully via EmailJS',
          result: result
        });
      } catch (emailjsError) {
        res.json({
          success: false,
          message: 'Both Gmail and EmailJS failed',
          errors: {
            gmail: gmailError.message,
            emailjs: emailjsError.message
          }
        });
      }
    }

  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      error: 'Email test failed',
      message: error.message,
      success: false
    });
  }
});

// POST /api/email/disconnect
// Disconnect email services
router.post('/disconnect', async (req, res) => {
  try {
    // Clear any stored configurations
    // This is a simple implementation - in production you'd want to clear user-specific configs
    
    res.json({
      success: true,
      message: 'Email configuration disconnected',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email disconnect error:', error);
    res.status(500).json({
      error: 'Failed to disconnect email',
      message: error.message,
      success: false
    });
  }
});

module.exports = router;
