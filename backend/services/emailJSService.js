const axios = require('axios');

class EmailJSService {
  constructor() {
    this.serviceId = process.env.EMAILJS_SERVICE_ID;
    this.templateId = process.env.EMAILJS_TEMPLATE_ID;
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY;
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY;
    this.isConfigured = !!this.publicKey;

    if (this.isConfigured) {
      console.log('✅ EmailJS service initialized successfully');
    } else {
      console.warn('⚠️  EMAILJS_PUBLIC_KEY not configured - EmailJS features will be limited');
    }
  }

  async sendEmail(emailData, professorEmail) {
    try {
      console.log('Sending email via EmailJS to:', professorEmail);

      // Prepare EmailJS template parameters
      const templateParams = {
        to_email: professorEmail,
        from_name: emailData.fromName || 'Professor Matcher User',
        from_email: emailData.fromEmail || 'noreply@professormatcher.com',
        subject: emailData.subject,
        message: emailData.body,
        professor_name: this.extractProfessorName(emailData.body),
        reply_to: emailData.fromEmail || 'noreply@professormatcher.com'
      };

      // EmailJS API endpoint
      const url = `https://api.emailjs.com/api/v1.0/email/send`;

      const data = {
        service_id: this.serviceId,
        template_id: this.templateId,
        user_id: this.publicKey,
        template_params: templateParams
        // Remove accessToken unless private key is available
      };

      // Only add accessToken if private key is available
      if (this.privateKey && this.privateKey !== 'your_emailjs_private_key') {
        data.accessToken = this.privateKey;
      }

      console.log('EmailJS request data prepared');
      console.log('EmailJS Service ID:', this.serviceId);
      console.log('EmailJS Template ID:', this.templateId);
      console.log('EmailJS Public Key:', this.publicKey ? 'Set' : 'Not set');
      console.log('EmailJS Private Key:', this.privateKey && this.privateKey !== 'your_emailjs_private_key' ? 'Set' : 'Not set');
      console.log('Template params:', templateParams);

      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('EmailJS response:', response.status, response.statusText);
      console.log('EmailJS response data:', response.data);

      if (response.status === 200) {
        return {
          success: true,
          messageId: response.data || 'email_sent',
          provider: 'EmailJS',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`EmailJS returned status ${response.status}`);
      }

    } catch (error) {
      console.error('EmailJS service error:', error.response?.data || error.message);

      // Provide detailed error information
      let errorMessage = 'Failed to send email via EmailJS';

      if (error.response) {
        errorMessage += `: ${error.response.status} - ${error.response.data}`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += ': Request timeout - please try again';
      } else {
        errorMessage += `: ${error.message}`;
      }

      throw new Error(errorMessage);
    }
  }

  extractProfessorName(emailBody) {
    // Extract professor name from email greeting
    const greetingPatterns = [
      /Dear (?:Professor|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Dear\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Hello\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Hi\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];

    for (const pattern of greetingPatterns) {
      const match = emailBody.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return 'Professor';
  }

  async verifyConfiguration() {
    try {
      // Test EmailJS configuration
      const requiredVars = [
        'EMAILJS_SERVICE_ID',
        'EMAILJS_TEMPLATE_ID',
        'EMAILJS_PUBLIC_KEY'
      ];

      const missingVars = requiredVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        return {
          configured: false,
          missing: missingVars,
          message: `Missing EmailJS configuration: ${missingVars.join(', ')}`
        };
      }

      return {
        configured: true,
        serviceId: this.serviceId,
        templateId: this.templateId,
        message: 'EmailJS is properly configured'
      };

    } catch (error) {
      return {
        configured: false,
        error: error.message,
        message: 'EmailJS configuration verification failed'
      };
    }
  }

  // Get rate limits for EmailJS (EmailJS has its own limits)
  getRateLimits() {
    return {
      daily: 200,    // EmailJS free tier limit
      monthly: 6000, // EmailJS free tier limit
      cooldown: 5,   // 5 seconds between emails
      provider: 'EmailJS'
    };
  }

  // Get supported features
  getCapabilities() {
    return {
      htmlEmails: true,
      attachments: false, // EmailJS has limited attachment support
      tracking: false,
      templates: true,
      customDomains: false,
      bulkSending: false,
      scheduling: false
    };
  }
}

module.exports = new EmailJSService();
