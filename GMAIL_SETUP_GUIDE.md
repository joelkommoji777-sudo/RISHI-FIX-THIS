# Gmail Integration Setup Guide

This guide will help you set up Gmail integration for the Professor Matcher application.

## Prerequisites

1. Google Cloud Console project
2. Supabase project
3. Node.js and npm installed

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 1.2 Enable Gmail API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3000/oauth-callback` (for development)
   - `https://yourdomain.com/oauth-callback` (for production)
5. Save and download the credentials JSON file
6. Note down the Client ID and Client Secret

## Step 2: Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google OAuth (for Gmail integration)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth-callback

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Step 3: Database Setup

### 3.1 Run the Database Migration
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `backend/fix-gmail-db.sql`
4. Execute the script

This will:
- Set up proper RLS policies for Gmail integration
- Create necessary database functions
- Set up test data

### 3.2 Verify Database Tables
The following tables should be created:
- `users` - stores user information and Gmail preferences
- `email_configurations` - stores Gmail OAuth tokens per user
- `email_logs` - tracks sent emails
- `rate_limits` - manages sending limits

## Step 4: Frontend Configuration

### 4.1 Update OAuth Callback URL
The OAuth callback is already configured in `src/pages/OAuthCallback.tsx` to work with the backend.

### 4.2 Email Settings Page
The `src/pages/EmailSettings.tsx` page is configured to:
- Connect Gmail accounts via OAuth
- Test Gmail connections
- Display connection status

## Step 5: Testing the Integration

### 5.1 Start the Backend Server
```bash
cd backend
npm install
npm start
```

### 5.2 Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5.3 Test Gmail Connection
1. Navigate to `http://localhost:3000/email-settings`
2. Click "Connect Gmail"
3. Complete the OAuth flow in the popup window
4. Verify the connection is successful

## Step 6: API Endpoints

The following Gmail API endpoints are available:

### Authentication
- `POST /api/gmail/auth` - Initiate OAuth flow
- `POST /api/gmail/oauth-callback` - Handle OAuth callback

### Configuration
- `GET /api/gmail/status/:userId` - Get Gmail status
- `GET /api/gmail/test/:userId` - Test Gmail connection
- `POST /api/gmail/disconnect/:userId` - Disconnect Gmail

### Email Sending
- `POST /api/emails/send` - Send email via Gmail
- `POST /api/emails/test` - Test email sending

## Step 7: Troubleshooting

### Common Issues

1. **OAuth Redirect URI Mismatch**
   - Ensure the redirect URI in Google Cloud Console matches exactly
   - Check that the frontend is running on the correct port

2. **Database Permission Errors**
   - Run the `fix-gmail-db.sql` script to fix RLS policies
   - Ensure Supabase service role has proper permissions

3. **Token Storage Issues**
   - Check that the `email_configurations` table exists
   - Verify the `save_gmail_config` function is working

4. **CORS Issues**
   - Ensure the frontend URL is added to CORS origins in server.js
   - Check that the backend is running on the correct port

### Debug Steps

1. Check backend logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test database connection using the health check endpoint
4. Use the Gmail test endpoint to verify token validity

## Step 8: Production Deployment

### 8.1 Update Redirect URIs
- Add your production domain to Google Cloud Console
- Update the `GOOGLE_REDIRECT_URI` environment variable

### 8.2 Database Security
- Review and tighten RLS policies for production
- Remove the permissive policies used for development

### 8.3 Environment Variables
- Set up proper environment variables in your production environment
- Ensure all secrets are properly secured

## Security Considerations

1. **Token Storage**: Gmail tokens are stored encrypted in the database
2. **RLS Policies**: Row Level Security ensures users can only access their own data
3. **Rate Limiting**: Built-in rate limiting prevents abuse
4. **HTTPS**: Always use HTTPS in production for OAuth flows

## Support

If you encounter issues:
1. Check the backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure the database migration was run successfully
4. Test the OAuth flow step by step

The Gmail integration is now ready to use! Users can connect their Gmail accounts and send emails directly through the platform.



