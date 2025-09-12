# 📧 EmailJS Setup Guide - Immediate Email Solution

## Overview

EmailJS allows you to send emails directly from your frontend without needing backend email servers or OAuth verification. This is perfect for immediate deployment while you work on Gmail OAuth verification.

## 🚀 Quick Setup (5 minutes)

### 1. Create EmailJS Account

1. Go to [emailjs.com](https://emailjs.com)
2. Click **"Sign Up"** (free account)
3. Verify your email

### 2. Add Email Service

1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended)
   - **Outlook**
   - **Yahoo**
   - **Custom SMTP**

4. **For Gmail:**
   - Service name: "Gmail"
   - Connect Account
   - Grant permissions
   - Note the **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template

1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Set up template with these variables:

**Template Name:** `professor_contact`

**Subject:**
```
{{subject}}
```

**To Email:**
```
{{to_email}}
```

**From Name:**
```
{{from_name}}
```

**From Email:**
```
{{from_email}}
```

**Reply To:**
```
{{reply_to}}
```

**Message/Body:**
```
{{message}}
```

4. **Save template**
5. Note the **Template ID** (e.g., `template_xyz789`)

### 4. Get API Keys

1. Go to **"Account"** → **"General"**
2. Copy the **Public Key** (this is your main API key)

**Example:**
- Service ID: `service_abc123`
- Template ID: `template_xyz789`
- Public Key: `abcdefghijklmnop`

### 5. Configure Environment Variables

Update your `backend/.env` file:

```env
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_TEMPLATE_ID=template_xyz789
EMAILJS_PUBLIC_KEY=abcdefghijklmnop
```

### 6. Test Configuration

Restart your backend server:

```bash
cd backend
node server.js
```

Check the health endpoint to verify EmailJS is configured:

```bash
curl http://localhost:3001/health
```

You should see:
```json
{
  "services": {
    "emailService": true
  },
  "configuration": {
    "emailjs": true
  }
}
```

## 🎯 How It Works

### Frontend Integration

Your frontend will send emails using EmailJS directly:

```javascript
// In your email sending function
const sendEmail = async (emailData) => {
  const serviceId = 'service_abc123';
  const templateId = 'template_xyz789';
  const publicKey = 'abcdefghijklmnop';

  const templateParams = {
    to_email: professorEmail,
    from_name: userName,
    from_email: userEmail,
    subject: emailData.subject,
    message: emailData.body,
    reply_to: userEmail
  };

  try {
    const result = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    console.log('Email sent successfully!', result);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};
```

### Backend Integration

Your backend will use the hybrid email service:

```javascript
// The hybrid service automatically uses EmailJS
const result = await hybridEmailService.sendEmail(
  emailData,
  professorEmail,
  userId,
  'emailjs' // Forces EmailJS usage
);
```

## ⚙️ Advanced Configuration

### Custom Email Templates

Create multiple templates for different scenarios:

1. **Initial Contact:** `template_initial_contact`
2. **Follow-up:** `template_follow_up`
3. **Meeting Request:** `template_meeting_request`

### Rate Limiting

EmailJS has built-in limits:
- **Free tier:** 200 emails/month
- **Paid tier:** 5,000+ emails/month

Your backend automatically enforces user-specific limits:
- Daily: 10 emails
- Monthly: 200 emails
- Cooldown: 30 seconds between emails

### Template Variables

You can add more variables to your templates:

```
{{student_name}}
{{student_university}}
{{student_major}}
{{professor_name}}
{{professor_university}}
{{research_field}}
{{custom_message}}
```

## 🔧 Troubleshooting

### Common Issues

**"EmailJS service not configured"**
- Check your environment variables
- Verify the service ID, template ID, and public key
- Restart your backend server

**"Template not found"**
- Verify the template ID matches your EmailJS template
- Check if the template is published (not in draft)

**"Rate limit exceeded"**
- Wait for the cooldown period
- Check your daily/monthly limits
- Upgrade to EmailJS paid plan if needed

**"Email not delivered"**
- Check spam/junk folder
- Verify recipient email address
- Check EmailJS dashboard for delivery status

### Testing Emails

1. **Use your own email** for testing
2. **Check EmailJS dashboard** for sent emails
3. **Monitor delivery status** in real-time
4. **Test different email providers** (Gmail, Outlook, etc.)

## 📊 Monitoring

### EmailJS Dashboard

Monitor your email activity:
- **Sent emails count**
- **Delivery success rate**
- **Bounce rates**
- **Open rates** (if enabled)

### Backend Logs

Check your server logs for:
- Email sending attempts
- Success/failure rates
- Rate limit hits
- Error details

## 🚀 Production Deployment

### Environment Variables

For production, use your production EmailJS keys:

```env
EMAILJS_SERVICE_ID=your_production_service_id
EMAILJS_TEMPLATE_ID=your_production_template_id
EMAILJS_PUBLIC_KEY=your_production_public_key
```

### Security Considerations

- **Never expose private keys** in frontend code
- **Use environment variables** for all EmailJS credentials
- **Monitor email usage** to prevent abuse
- **Implement user authentication** before allowing email sending

## 🔄 Upgrading to Gmail OAuth

When you're ready to add Gmail OAuth:

1. **Keep EmailJS as backup**
2. **Add Gmail OAuth credentials**
3. **Update hybrid email service**
4. **Test both providers**
5. **Allow users to choose** their preferred method

### Hybrid Configuration

```javascript
// Users can choose their email method
const userPreference = await userService.getUserEmailPreference(userId);
const result = await hybridEmailService.sendEmail(
  emailData,
  professorEmail,
  userId,
  userPreference.provider // 'gmail' or 'emailjs'
);
```

## 📞 Support

### EmailJS Support
- **Documentation:** [emailjs.com/docs](https://emailjs.com/docs)
- **Dashboard:** [dashboard.emailjs.com](https://dashboard.emailjs.com)
- **Community:** [emailjs.com/community](https://emailjs.com/community)

### Professor Matcher Support
- **Technical Issues:** Check server logs
- **Email Issues:** Verify EmailJS configuration
- **Rate Limits:** Monitor usage in dashboard

## 🎯 Best Practices

1. **Test thoroughly** before going live
2. **Monitor email delivery** rates
3. **Have backup email providers** ready
4. **Implement proper error handling**
5. **Keep users informed** about email status
6. **Regularly update** EmailJS credentials
7. **Monitor for abuse** and implement security measures

---

## ⚡ Ready to Launch!

With EmailJS configured, you can:

✅ **Send emails immediately** without OAuth verification
✅ **Test all email functionality** in development
✅ **Deploy to production** today
✅ **Work on Gmail OAuth** in the background
✅ **Provide full email service** to your users

**Launch your professor matching platform now!** 🚀

