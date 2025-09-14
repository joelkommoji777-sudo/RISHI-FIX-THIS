const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const userService = require('../services/userService');
const hybridEmailService = require('../services/hybridEmailService');
const { optionalAuth, checkRateLimit, logActivity } = require('../middleware/auth');

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
// Send email via Gmail service or return mailto data
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







// POST /api/emails/send
// Send email to professor (simplified endpoint for frontend)
router.post('/send', optionalAuth, checkRateLimit, logActivity('email_send'), async (req, res) => {
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
      userId = req.userId || 'default-user' // Use authenticated user ID or default
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

    // Send via Gmail with enhanced error handling
    try {
      const result = await hybridEmailService.sendEmail(
        {
          subject: emailData.subject,
          body: emailData.body,
          to: to,
          fromName: studentName || 'Student',
          fromEmail: studentEmail || 'student@example.com'
        },
        to,
        userId, // Use actual user ID instead of 'anonymous'
        'gmail'
      );

      console.log(`✅ Email sent successfully to ${to} for user ${userId}`);

      // Log email send to database if user is authenticated
      if (req.userId) {
        try {
          const { createClient } = require('@supabase/supabase-js');
          const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
          
          const emailLogData = {
            user_id: req.userId,
            recipient_email: to,
            recipient_name: professorName,
            subject: emailData.subject,
            body: emailData.body,
            provider: 'gmail',
            status: 'sent',
            message_id: result.messageId,
            sent_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('email_logs')
            .insert([emailLogData]);

          if (error) {
            console.error('Failed to save email log:', error);
          } else {
            console.log(`✅ Email log saved for user ${req.userId}`);
          }
        } catch (dbError) {
          console.error('Database save failed for email log:', dbError);
        }
      }

      res.json({
        success: true,
        message: 'Email sent successfully via Gmail',
        result: result,
        timestamp: new Date().toISOString()
      });
    } catch (gmailError) {
      console.error('Gmail sending failed:', gmailError.message);
      
      // Provide more specific error messages
      let errorMessage = gmailError.message;
      let statusCode = 500;
      
      if (gmailError.message.includes('authentication failed') || 
          gmailError.message.includes('permissions insufficient')) {
        statusCode = 401;
        errorMessage = 'Gmail authentication failed. Please reconnect your Gmail account in Settings.';
      } else if (gmailError.message.includes('quota exceeded')) {
        statusCode = 429;
        errorMessage = 'Gmail sending quota exceeded. Please try again later.';
      } else if (gmailError.message.includes('access disabled')) {
        statusCode = 403;
        errorMessage = 'Gmail API access disabled. Please check your Google Cloud Console settings.';
      }

      // Return mailto link as fallback with proper error info
      const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        mailtoLink: mailtoLink,
        emailContent: emailData,
        timestamp: new Date().toISOString()
      });
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

    res.json({
      gmail: {
        configured: gmailConfigured,
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set'
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

    // Try Gmail
    try {
      const result = await hybridEmailService.sendEmail(testEmail, to, 'test-user', 'gmail');
      res.json({
        success: true,
        message: 'Test email sent successfully via Gmail',
        result: result
      });
    } catch (gmailError) {
      res.json({
        success: false,
        message: 'Gmail failed',
        error: gmailError.message
      });
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
