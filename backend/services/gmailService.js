const nodemailer = require('nodemailer');
const { google } = require('googleapis');

class GmailService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI;

    this.transporter = null;
    this.oauth2Client = null;

    this.initializeGmail();
  }

  initializeGmail() {
    try {
      console.log('Initializing Gmail service...');

      if (!this.clientId || !this.clientSecret || !this.refreshToken) {
        console.warn('Gmail OAuth credentials not configured');
        return;
      }

      // Create OAuth2 client
      this.oauth2Client = new google.auth.OAuth2(
        this.clientId,
        this.clientSecret,
        this.redirectUri
      );

      // Set credentials
      this.oauth2Client.setCredentials({
        refresh_token: this.refreshToken
      });

      // Create transporter
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GOOGLE_USER_EMAIL || 'noreply@researchvoyage.com',
          clientId: this.clientId,
          clientSecret: this.clientSecret,
          refreshToken: this.refreshToken,
          accessToken: null
        }
      });

      console.log('Gmail service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gmail service:', error.message);
    }
  }

  async sendEmail(emailData, professorEmail) {
    try {
      console.log('Sending email via Gmail to:', professorEmail);

      if (!this.transporter) {
        throw new Error('Gmail service not initialized');
      }

      // Get access token
      const accessToken = await this.oauth2Client.getAccessToken();

      // Update transporter with fresh access token
      this.transporter.set('oauth2_provision_cb', (user, renew, callback) => {
        this.oauth2Client.getAccessToken()
          .then(token => callback(null, token.token))
          .catch(err => callback(err));
      });

      // Prepare email content
      const mailOptions = {
        from: {
          name: emailData.fromName || 'Professor Matcher',
          address: process.env.GOOGLE_USER_EMAIL || 'noreply@researchvoyage.com'
        },
        to: professorEmail,
        subject: emailData.subject,
        html: this.formatEmailBody(emailData),
        replyTo: emailData.fromEmail || 'noreply@researchvoyage.com'
      };

      console.log('Gmail mail options prepared:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transporter.sendMail(mailOptions);

      console.log('Email sent via Gmail successfully:', result.messageId);

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        provider: 'gmail'
      };

    } catch (error) {
      console.error('Gmail sending failed:', error.message);

      // Handle common Gmail errors
      if (error.message.includes('Invalid credentials')) {
        throw new Error('Gmail authentication failed - check OAuth credentials');
      }
      if (error.message.includes('quota')) {
        throw new Error('Gmail sending quota exceeded');
      }
      if (error.message.includes('disabled')) {
        throw new Error('Gmail API access disabled - enable Gmail API in Google Console');
      }

      throw new Error(`Failed to send email via Gmail: ${error.message}`);
    }
  }

  async sendEmailViaAPI(emailData, professorEmail, userConfig) {
    try {
      console.log('Sending email via Gmail API to:', professorEmail);

      // Use user-specific config if provided, otherwise use global config
      const config = userConfig || {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        refreshToken: this.refreshToken,
        userEmail: process.env.GOOGLE_USER_EMAIL || 'noreply@researchvoyage.com'
      };

      // Create OAuth2 client for this user
      const oauth2Client = new google.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Set credentials
      oauth2Client.setCredentials({
        refresh_token: config.refreshToken
      });

      // Create Gmail API client
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Format email content
      const emailContent = this.formatEmailForAPI(emailData, config.userEmail, professorEmail);

      // Send email using Gmail API
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: emailContent
        }
      });

      console.log('Email sent via Gmail API successfully:', result.data.id);

      return {
        success: true,
        messageId: result.data.id,
        threadId: result.data.threadId,
        timestamp: new Date().toISOString(),
        provider: 'gmail',
        userEmail: config.userEmail
      };

    } catch (error) {
      console.error('Gmail API sending failed:', error.message);

      // Handle common Gmail errors
      if (error.message.includes('Invalid credentials') || error.message.includes('invalid_grant')) {
        throw new Error('Gmail authentication failed - please reconnect your Gmail account');
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('Gmail sending quota exceeded - please try again later');
      }
      if (error.message.includes('disabled') || error.message.includes('access_denied')) {
        throw new Error('Gmail API access disabled - please check your Google Cloud Console settings');
      }

      throw new Error(`Failed to send email via Gmail: ${error.message}`);
    }
  }

  formatEmailForAPI(emailData, fromEmail, toEmail) {
    // Create MIME email content for Gmail API
    const subject = emailData.subject;
    const body = this.formatEmailBody(emailData);

    const mimeEmail = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${toEmail}`,
      `From: ${emailData.fromName || 'Professor Matcher'} <${fromEmail}>`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\r\n');

    // Base64 encode for Gmail API
    return Buffer.from(mimeEmail).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  formatEmailBody(emailData) {
    // Format the email body as HTML
    const body = emailData.body || '';

    // Convert line breaks to HTML
    const htmlBody = body.replace(/\n/g, '<br>');

    // Create professional HTML email template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${emailData.subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { padding: 20px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 5px; }
            .footer { margin-top: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 5px; font-size: 12px; color: #6c757d; }
            .signature { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${emailData.subject}</h2>
            </div>

            <div class="content">
              <p>Dear Professor,</p>

              ${htmlBody}

              <div class="signature">
                <p>Best regards,</p>
                <p><strong>${emailData.fromName || 'Professor Matcher User'}</strong></p>
                ${emailData.fromEmail ? `<p>Email: ${emailData.fromEmail}</p>` : ''}
              </div>
            </div>

            <div class="footer">
              <p>This email was sent through Professor Matcher - connecting students with research opportunities.</p>
              <p>If you no longer wish to receive these emails, please reply with "unsubscribe".</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async verifyConfiguration() {
    try {
      if (!this.transporter) {
        return {
          configured: false,
          message: 'Gmail service not initialized'
        };
      }

      // Test connection by getting access token
      const accessToken = await this.oauth2Client.getAccessToken();

      if (accessToken.token) {
        return {
          configured: true,
          message: 'Gmail OAuth configured and ready',
          accessTokenValid: true
        };
      } else {
        return {
          configured: false,
          message: 'Failed to obtain access token'
        };
      }

    } catch (error) {
      return {
        configured: false,
        message: `Gmail configuration error: ${error.message}`
      };
    }
  }

  getRateLimits() {
    return {
      daily: 500,  // Gmail's daily sending limit
      monthly: 15000,
      cooldown: 1, // seconds between emails
      burstLimit: 20 // emails per minute
    };
  }

  getCapabilities() {
    return {
      htmlEmails: true,
      attachments: true,
      tracking: true,
      templates: true,
      customDomains: true,
      bulkSending: false,
      scheduling: false,
      richFormatting: true,
      replyTo: true,
      bcc: true,
      cc: true
    };
  }

  async getUserProfile() {
    try {
      if (!this.oauth2Client) {
        throw new Error('OAuth2 client not initialized');
      }

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const response = await gmail.users.getProfile({ userId: 'me' });

      return {
        emailAddress: response.data.emailAddress,
        totalMessages: response.data.messagesTotal,
        totalThreads: response.data.threadsTotal
      };

    } catch (error) {
      console.error('Failed to get Gmail profile:', error.message);
      throw new Error(`Gmail profile fetch failed: ${error.message}`);
    }
  }

  // Test method to verify Gmail connection
  async testConnection() {
    try {
      console.log('Testing Gmail connection...');

      // Test by getting a fresh access token
      const accessToken = await this.oauth2Client.getAccessToken();

      if (accessToken && accessToken.token) {
        return {
          success: true,
          message: 'Gmail OAuth connection successful - ready to send emails',
          accessTokenValid: true
        };
      } else {
        return {
          success: false,
          message: 'Failed to obtain access token',
          accessTokenValid: false
        };
      }

    } catch (error) {
      console.error('Gmail connection test failed:', error.message);
      return {
        success: false,
        message: `Gmail connection failed: ${error.message}`,
        error: error.message
      };
    }
  }
}

module.exports = new GmailService();
