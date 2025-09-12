# Research Voyage Backend

A clean Node.js backend API for resume processing and analysis.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following content:
```
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:5173
```

Replace `your_openai_api_key_here` with your actual OpenAI API key from https://platform.openai.com/api-keys

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/resume/extract` - Extract data from resume PDF

The server will run on `http://localhost:3001` by default.

