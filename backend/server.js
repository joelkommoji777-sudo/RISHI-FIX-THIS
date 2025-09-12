const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables FIRST
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Verify Supabase credentials are loaded
console.log('🔧 Checking environment variables...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');

// Import routes
const professorRoutes = require('./routes/professors');
const emailRoutes = require('./routes/emails');
const authRoutes = require('./routes/auth');
const gmailRoutes = require('./routes/gmail');

// Import services
const userService = require('./services/userService');
const hybridEmailService = require('./services/hybridEmailService');

const app = express();
const port = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Enable CORS for frontend communication
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173'],
  credentials: true
}));

// JSON parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount routes
app.use('/api', professorRoutes);
app.use('/api', emailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gmail', gmailRoutes);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize OpenAI (only when API key is available)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key_for_testing') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const userServiceHealth = await userService.healthCheck();
    const emailServiceHealth = await hybridEmailService.healthCheck();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        resumeProcessing: true,
        professorResearch: !!process.env.GEMINI_API_KEY,
        emailGeneration: !!process.env.GEMINI_API_KEY,
        userManagement: userServiceHealth.status === 'healthy',
        emailService: emailServiceHealth.status === 'healthy'
      },
      configuration: {
        openai: !!openai,
        gemini: !!process.env.GEMINI_API_KEY,
        emailjs: !!process.env.EMAILJS_PUBLIC_KEY,
        encryption: !!process.env.ENCRYPTION_KEY
      },
      stats: {
        users: userServiceHealth.usersCount || 0,
        emailConfigs: userServiceHealth.configsCount || 0,
        emailProviders: emailServiceHealth.availableCount || 0
      },
      message: 'Professor Matcher API is running'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Health check failed'
    });
  }
});

// Extract text from PDF
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract structured data using OpenAI
async function extractResumeData(text) {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.');
  }

  try {
    const prompt = `
Analyze the following resume text and extract structured information into JSON format.

INSTRUCTIONS:
- Extract all relevant information accurately and completely
- If information is missing, use empty string or empty array
- For dates, standardize to MM/YYYY format when possible
- For bullet points, separate into individual array items
- Identify achievements and quantifiable results separately
- Separate school involvement (clubs, teams, organizations) from volunteering activities
- Extract personal contact information when available
- EXTRACT PROJECTS SECTION: Any projects listed should be treated as work experience entries
- EXTRACT COMPLETE DESCRIPTIONS: Make sure to capture the full text of all descriptions, bullet points, and details
- For projects, use "Personal Project" or "Academic Project" as the company name when not specified
- Include all technologies, tools, methodologies, and outcomes mentioned in descriptions

Return only this JSON structure:
{
  "personal_info": {
    "name": "string",
    "linkedin": "string",
    "phone": "string",
    "email": "string",
    "gpa": "string"
  },
  "education": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "start_date": "string",
      "end_date": "string",
      "description": ["string"]
    }
  ],
  "school_involvement": [
    {
      "organization": "string",
      "role": "string",
      "description": "string",
      "start_date": "string",
      "end_date": "string"
    }
  ],
  "volunteering": [
    {
      "organization": "string",
      "role": "string",
      "description": "string",
      "start_date": "string",
      "end_date": "string"
    }
  ]
}

IMPORTANT:
- Extract ALL text from descriptions, bullet points, and project details
- Do not truncate or summarize - include the complete original text
- For projects without dates, use "Present" as end_date and estimate start_date if possible
- Treat projects section as additional work experience entries
- Capture all technologies, programming languages, frameworks, and tools mentioned
- If a "Projects" section exists, convert each project to a work experience entry
- Use descriptive titles for projects (e.g., "E-commerce Website Project", "Mobile App Development")
- For project descriptions, include all implementation details, technologies used, and outcomes

PROJECT EXTRACTION RULES:
- Look for sections titled "Projects", "Personal Projects", "Academic Projects", "Portfolio", "Key Projects", etc.
- Convert each project into an experience entry with:
  * Title: Project name or descriptive title (e.g., "E-commerce Website", "Mobile Task Manager App")
  * Company: "Personal Project", "Academic Project", "Independent Project", or "Portfolio Project"
  * Location: "Remote", "Online", or relevant location mentioned
  * Description: Full project details, technologies, frameworks, languages, and outcomes
  * Dates: Project timeline or "Present" if ongoing, or reasonable estimate based on context
- If no dates are mentioned for projects, use "Present" as end_date and estimate start_date
- Capture ALL technical details: programming languages, frameworks, databases, APIs, deployment methods, etc.
- Include project outcomes, impact, and any quantitative results mentioned

RESUME TEXT: ${text.substring(0, 6000)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting structured information from resumes. Always return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Do not wrap the JSON in ```json``` or any other formatting. Extract ALL project information and include it in the experience array. Capture complete descriptions without truncation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    console.log('Raw OpenAI response:', response);

    // Try to parse the response as JSON
    let extractedData;
    try {
      extractedData = JSON.parse(response);
      console.log('Successfully parsed JSON response');
    } catch (parseError) {
      console.log('Direct JSON parse failed, trying to clean response');
      console.log('Parse error:', parseError.message);

      // Try multiple cleaning strategies
      let cleanResponse = response;

      // Remove markdown code blocks
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Remove any leading/trailing whitespace and newlines
      cleanResponse = cleanResponse.trim();

      // If response starts with text before JSON, try to find the JSON part
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
      }

      console.log('Cleaned response:', cleanResponse);

      try {
        extractedData = JSON.parse(cleanResponse);
        console.log('Successfully parsed cleaned JSON response');
      } catch (secondParseError) {
        console.error('Failed to parse cleaned response:', secondParseError.message);
        console.error('Final cleaned response:', cleanResponse);

        // Return a fallback structure instead of throwing
        extractedData = {
          personal_info: { name: '', linkedin: '', phone: '', email: '', gpa: '' },
          education: '',
          experience: [],
          school_involvement: [],
          volunteering: [],
          error: 'JSON parsing failed, returning empty structure'
        };
      }
    }

    console.log('Final extracted data structure:', JSON.stringify(extractedData, null, 2));
    console.log('Experience entries found:', extractedData.experience?.length || 0);
    console.log('Projects extracted:', extractedData.experience?.filter(exp => exp.company?.toLowerCase().includes('project')).length || 0);
    return extractedData;

  } catch (error) {
    console.error('AI extraction error:', error);
    throw new Error('Failed to process resume with AI');
  }
}

// Resume extraction endpoint
app.post('/api/resume/extract', upload.single('resume'), async (req, res) => {
  try {
    console.log('Resume extraction request received');

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname);

    // Extract text from PDF
    const pdfBuffer = req.file.buffer;
    const extractedText = await extractTextFromPDF(pdfBuffer);

    console.log('Extracted text length:', extractedText.length);

    // Check if we have meaningful text
    if (!extractedText || extractedText.trim().length < 50) {
      return res.json({
        personal_info: {
          name: '',
          linkedin: '',
          phone: '',
          email: '',
          gpa: ''
        },
        education: '',
        experience: [],
        school_involvement: [],
        volunteering: [],
        message: 'Could not extract sufficient text from PDF. Please ensure the PDF contains readable text.',
        success: true
      });
    }

    // Use AI to extract structured data
    console.log('Sending text to OpenAI for processing...');
    const structuredData = await extractResumeData(extractedText);

    console.log('Structured data extracted successfully');

    const responseData = {
      personal_info: structuredData.personal_info || {
        name: '',
        linkedin: '',
        phone: '',
        email: '',
        gpa: ''
      },
      education: structuredData.education || '',
      experience: structuredData.experience || [],
      school_involvement: structuredData.school_involvement || [],
      volunteering: structuredData.volunteering || [],
      success: true
    };

    console.log('Response data being sent:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (error) {
    console.error('Resume extraction error:', error);
    res.status(500).json({
      error: 'Failed to process resume',
      details: error.message,
      success: false
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ error: 'Internal server error' });
});

console.log(`Attempting to start server on port ${port}...`);
console.log('✅ Project extraction feature enabled - will extract projects into experience section');
console.log('🔍 Gemini API service configured:', !!process.env.GEMINI_API_KEY);
console.log('📧 Email generation service ready');
console.log('🎓 Professor research service ready');

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Backend server successfully running on http://localhost:${port}`);
  console.log(`✅ Also available on http://127.0.0.1:${port}`);
  console.log(`✅ Health check available at http://localhost:${port}/health`);
  console.log(`✅ Server is listening on port ${port}`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
