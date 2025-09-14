# Research Voyage Backend API

A comprehensive Node.js backend API for resume processing, professor research, and email generation. This backend provides AI-powered resume extraction, professor matching, and automated email generation capabilities.

## Features

- **Resume Processing**: Extract structured data from PDF resumes using OpenAI
- **Professor Research**: Find and research professors using Gemini AI
- **Email Generation**: Generate personalized emails for professor outreach
- **Gmail Integration**: Send emails directly through Gmail API
- **User Management**: Complete user authentication and data management
- **Database Integration**: Supabase integration for data persistence

## Project Structure

```
backend/
├── routes/           # API route handlers
├── services/         # Business logic services
├── middleware/       # Authentication and rate limiting
├── database/         # Database migrations and setup
└── uploads/          # File upload storage
```

## Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```env
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
GMAIL_CLIENT_ID=your_gmail_client_id_here
GMAIL_CLIENT_SECRET=your_gmail_client_secret_here
GMAIL_REDIRECT_URI=your_gmail_redirect_uri_here
EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here
EMAILJS_SERVICE_ID=your_emailjs_service_id_here
EMAILJS_TEMPLATE_ID=your_emailjs_template_id_here
ENCRYPTION_KEY=your_encryption_key_here
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint with service status

### Resume Processing
- `POST /api/resume/extract` - Extract structured data from resume PDF

### Professor Research
- `GET /api/professors/search` - Search for professors
- `GET /api/professors/:id` - Get professor details
- `POST /api/professors/research` - Research professor background

### Email Management
- `POST /api/emails/generate` - Generate personalized emails
- `POST /api/emails/send` - Send emails via Gmail
- `GET /api/emails/history` - Get email history

### Gmail Integration
- `GET /api/gmail/auth` - Initiate Gmail OAuth
- `GET /api/gmail/callback` - Handle OAuth callback
- `POST /api/gmail/send` - Send email via Gmail API

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

## Services

- **Resume Extraction**: Uses OpenAI to extract structured data from PDF resumes
- **Professor Research**: Uses Gemini AI to research professor backgrounds
- **Email Generation**: AI-powered email generation for professor outreach
- **Gmail Service**: Direct Gmail API integration for sending emails
- **User Management**: Complete user authentication and data management
- **Database Service**: Supabase integration for data persistence

## Dependencies

- Express.js for the web framework
- OpenAI for resume processing
- Google Gemini for professor research
- Supabase for database management
- Gmail API for email sending
- Multer for file uploads
- PDF-parse for PDF text extraction

## Documentation

- [Gmail Integration Guide](GMAIL_INTEGRATION_GUIDE.md)
- [Gmail Setup Guide](GMAIL_SETUP_GUIDE.md)
- [Supabase Setup Guide](SUPABASE_SETUP_GUIDE.md)
- [Production Setup Guide](PRODUCTION_SETUP.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)