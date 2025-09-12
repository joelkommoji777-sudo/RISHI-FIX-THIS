# 🚀 Professor Matcher Production Setup Guide

## Overview

This guide will help you set up Professor Matcher for production deployment with all the necessary configurations, legal compliance, and third-party integrations.

## 📋 Prerequisites

- Node.js 18+ and npm
- Domain name (yourapp.com)
- Google Cloud Console account
- EmailJS account (for immediate email functionality)
- Database (PostgreSQL or MongoDB)
- SSL certificate

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your production variables:

```bash
cp .env.production.example backend/.env
```

**Required Environment Variables:**

```env
# AI Services
OPENAI_API_KEY=your_production_openai_key
GEMINI_API_KEY=your_production_gemini_key

# EmailJS (Immediate Solution)
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Application
NODE_ENV=production
PORT=3001
APP_HOMEPAGE=https://yourapp.com
PRIVACY_POLICY_URL=https://yourapp.com/privacy-policy
TERMS_SERVICE_URL=https://yourapp.com/terms-of-service
SUPPORT_EMAIL=support@yourapp.com

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
SESSION_SECRET=your_session_secret_key

# Database
DATABASE_URL=your_database_connection_string
```

### 3. Database Setup

Choose and configure your database:

**PostgreSQL:**
```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

**MongoDB:**
```env
MONGODB_URI=mongodb://username:password@host:27017/database
```

### 4. Legal Pages Setup

The legal pages are already created in `public/legal/`:
- `privacy-policy.html`
- `terms-of-service.html`
- `support.html`

Upload these to your web server at:
- `https://yourapp.com/privacy-policy`
- `https://yourapp.com/terms-of-service`
- `https://yourapp.com/support`

## 📧 EmailJS Setup (Immediate Solution)

### 1. Create EmailJS Account
1. Go to [emailjs.com](https://emailjs.com)
2. Create a free account
3. Add your email provider (Gmail, Outlook, etc.)

### 2. Configure Email Service
1. Go to **Email Services** in EmailJS dashboard
2. Add your email provider
3. Note the **Service ID**

### 3. Create Email Template
1. Go to **Email Templates**
2. Create a template with these variables:
   - `{{to_email}}` - Professor's email
   - `{{from_name}}` - Student's name
   - `{{from_email}}` - Student's email
   - `{{subject}}` - Email subject
   - `{{message}}` - Email body
3. Note the **Template ID**

### 4. Get API Keys
1. Go to **Account** > **General**
2. Copy the **Public Key**
3. Copy the **Private Key** (if using premium features)

### 5. Update Environment Variables
```env
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

## ☁️ Google Cloud Setup (Future Gmail Integration)

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Gmail API

### 2. Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in app information:
   - **App name:** Professor Matcher
   - **User support email:** support@yourapp.com
   - **Developer contact:** your-email@yourapp.com
   - **App logo:** 120x120px professional image
   - **App domain:** yourapp.com

### 3. Add OAuth Scopes
Required scopes for Gmail integration:
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

### 4. Create OAuth Credentials
1. Go to **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `https://yourapp.com/auth/google/callback`
   - `http://localhost:3001/auth/google/callback` (for testing)

### 5. Update Environment Variables
```env
GOOGLE_CLIENT_ID=your_client_id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourapp.com/auth/google/callback
GMAIL_VERIFICATION_STATUS=pending
```

## 🚀 Deployment Steps

### 1. Backend Deployment

```bash
# Build and deploy backend
cd backend
npm run build
npm start
```

### 2. Frontend Deployment

```bash
# Build for production
npm run build

# Deploy the dist/ folder to your web server
```

### 3. Database Migration

```bash
# Run database migrations if using a database
npm run migrate
```

### 4. SSL Configuration

Ensure your domain has SSL certificate configured for HTTPS.

## 🔒 Security Checklist

- [ ] All sensitive data encrypted
- [ ] HTTPS enabled everywhere
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF protection enabled

## 📊 Monitoring Setup

### 1. Error Tracking
```env
SENTRY_DSN=your_sentry_dsn
```

### 2. Logging
```env
LOG_LEVEL=info
```

### 3. Performance Monitoring
- Set up application performance monitoring
- Configure uptime monitoring
- Set up alerting for critical errors

## 🧪 Testing Checklist

### Functional Tests
- [ ] Resume upload and processing
- [ ] Professor search functionality
- [ ] Email generation and sending
- [ ] User registration and login
- [ ] All user flows end-to-end

### Performance Tests
- [ ] API response times under load
- [ ] File upload limits
- [ ] Email sending limits
- [ ] Database query performance

### Security Tests
- [ ] Authentication and authorization
- [ ] Input validation
- [ ] Rate limiting
- [ ] Data encryption

## 🔄 Maintenance Tasks

### Regular Updates
- [ ] Update dependencies monthly
- [ ] Monitor error logs
- [ ] Update SSL certificates
- [ ] Backup data regularly

### Monitoring
- [ ] Set up automated alerts
- [ ] Monitor user metrics
- [ ] Track performance metrics
- [ ] Review security logs

## 🚨 Emergency Procedures

### Rollback Plan
1. Have previous version ready to deploy
2. Keep database backups
3. Document rollback procedures
4. Test rollback process regularly

### Incident Response
1. Identify the issue
2. Assess impact
3. Communicate with users
4. Implement fix
5. Post-mortem analysis

## 📞 Support Setup

### User Support
- Set up help desk system
- Create FAQ and knowledge base
- Train support team
- Set up user feedback channels

### Technical Support
- Configure error tracking
- Set up log aggregation
- Create troubleshooting guides
- Establish escalation procedures

## 📈 Success Metrics

### Key Metrics to Track
- User registration rate
- Resume processing success rate
- Professor match quality
- Email delivery success rate
- User retention and engagement
- Application performance

### Quality Metrics
- Application uptime (>99.5%)
- Average response time (<2 seconds)
- Error rate (<1%)
- User satisfaction scores

---

## ⚡ Quick Launch with EmailJS

For immediate deployment without Gmail OAuth verification:

1. **Complete EmailJS setup** (steps above)
2. **Deploy backend and frontend**
3. **Users can send emails immediately**
4. **Work on Gmail verification in background**

This allows you to launch the core functionality while Google processes your OAuth verification (2-4 weeks).

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com)
- [EmailJS Dashboard](https://dashboard.emailjs.com)
- [Professor Matcher Legal Pages](https://yourapp.com/privacy-policy)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

## 📞 Need Help?

- **Technical Issues:** dev@yourapp.com
- **Security Issues:** security@yourapp.com
- **Legal Issues:** legal@yourapp.com
- **User Support:** support@yourapp.com

Remember: Always test thoroughly in staging before deploying to production!

