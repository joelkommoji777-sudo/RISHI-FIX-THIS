require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

console.log('=== STARTING FRESH BACKEND ===');
console.log('API Key loaded:', !!process.env.OPENAI_API_KEY);
console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}

// File upload configuration
const upload = multer({ 
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Test OpenAI connection
app.get('/api/test-openai', async (req, res) => {
  try {
    console.log('Testing OpenAI connection...');
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured'
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ 
        role: "user", 
        content: "Say 'OpenAI is working perfectly!'" 
      }],
      max_tokens: 20
    });

    res.json({
      success: true,
      message: response.choices[0].message.content,
      model: response.model
    });
  } catch (error) {
    console.error('OpenAI test error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PDF processing endpoint
app.post('/api/resume/extract', upload.single('resume'), async (req, res) => {
  try {
    console.log('PDF processing request received');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    console.log('Processing file:', req.file.originalname);

    // Read and parse PDF
    const pdfBuffer = await fs.readFile(req.file.path);
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    console.log('PDF text extracted, length:', text.length);

    if (!text || text.trim().length < 50) {
      // Clean up file
      await fs.unlink(req.file.path);
      
      return res.json({
        success: false,
        education: '',
        experience: [],
        skills: [],
        message: 'Could not extract text from PDF. Please ensure the PDF contains selectable text.'
      });
    }

    // Use OpenAI to extract structured data
    console.log('Sending to OpenAI for processing...');
    
    const prompt = `Extract structured information from this resume text. Return a JSON object with the following format:
{
  "education": "string - highest degree and institution",
  "experience": ["string - each work experience as a separate item"],
  "skills": ["string - each skill as a separate item"]
}

Resume text: ${text.substring(0, 3000)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const structuredData = JSON.parse(completion.choices[0].message.content);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    console.log('PDF processing completed successfully');

    res.json({
      success: true,
      education: structuredData.education || '',
      experience: structuredData.experience || [],
      skills: structuredData.skills || [],
      message: 'Resume processed successfully'
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message,
      education: '',
      experience: [],
      skills: []
    });
  }
});

// Start server
app.listen(port, () => {
  console.log('🚀 Fresh backend server running on http://localhost:' + port);
  console.log('📋 Health check: http://localhost:' + port + '/health');
  console.log('🧪 OpenAI test: http://localhost:' + port + '/api/test-openai');
  console.log('📄 PDF processing: POST http://localhost:' + port + '/api/resume/extract');
});

