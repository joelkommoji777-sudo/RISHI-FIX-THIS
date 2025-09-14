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

// Import middleware
const { authenticateUser, optionalAuth, checkRateLimit, logActivity } = require('./middleware/auth');

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
Analyze the following resume text and extract ALL information into a comprehensive JSON format.

CRITICAL INSTRUCTIONS:
- Extract EVERY piece of information from the resume - nothing should be left out
- Capture complete descriptions, bullet points, and all details without truncation
- For dates, standardize to MM/YYYY format when possible
- Separate different types of activities into appropriate categories
- Extract ALL projects, skills, achievements, and experiences
- Include ALL technologies, tools, frameworks, and programming languages mentioned
- Capture quantifiable results, metrics, and achievements
- Extract ALL contact information, social media profiles, and personal details

Return ONLY this JSON structure (no markdown, no code blocks):
{
  "personal_info": {
    "name": "string",
    "linkedin": "string",
    "phone": "string",
    "email": "string",
    "gpa": "string",
    "location": "string",
    "website": "string",
    "github": "string",
    "portfolio": "string"
  },
  "education": [
    {
      "degree": "string",
      "school": "string",
      "location": "string",
      "start_date": "string",
      "end_date": "string",
      "gpa": "string",
      "relevant_coursework": ["string"],
      "honors": ["string"],
      "thesis": "string"
    }
  ],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "start_date": "string",
      "end_date": "string",
      "description": ["string"],
      "technologies": ["string"],
      "achievements": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "start_date": "string",
      "end_date": "string",
      "url": "string",
      "github": "string",
      "achievements": ["string"],
      "role": "string"
    }
  ],
  "skills": {
    "programming_languages": ["string"],
    "frameworks": ["string"],
    "tools": ["string"],
    "databases": ["string"],
    "cloud_platforms": ["string"],
    "languages": ["string"],
    "certifications": ["string"]
  },
  "school_involvement": [
    {
      "organization": "string",
      "role": "string",
      "description": "string",
      "start_date": "string",
      "end_date": "string",
      "achievements": ["string"]
    }
  ],
  "volunteering": [
    {
      "organization": "string",
      "role": "string",
      "description": "string",
      "start_date": "string",
      "end_date": "string",
      "achievements": ["string"]
    }
  ],
  "publications": [
    {
      "title": "string",
      "authors": "string",
      "journal": "string",
      "date": "string",
      "url": "string"
    }
  ],
  "awards": [
    {
      "name": "string",
      "organization": "string",
      "date": "string",
      "description": "string"
    }
  ],
  "research": [
    {
      "title": "string",
      "institution": "string",
      "advisor": "string",
      "description": "string",
      "start_date": "string",
      "end_date": "string"
    }
  ]
}

EXTRACTION RULES:
1. PROJECTS: Extract ALL projects from any section (Projects, Portfolio, Key Projects, etc.)
2. SKILLS: Extract ALL technical skills, programming languages, tools, frameworks
3. EXPERIENCE: Include work experience, internships, research positions, teaching
4. EDUCATION: Extract ALL educational background including coursework, honors, thesis
5. INVOLVEMENT: Extract ALL extracurricular activities, clubs, organizations, leadership roles
6. VOLUNTEERING: Extract ALL volunteer work and community service
7. PUBLICATIONS: Extract ALL papers, articles, presentations, patents
8. AWARDS: Extract ALL honors, scholarships, recognitions, competitions
9. RESEARCH: Extract ALL research experience, lab work, academic projects
10. CONTACT: Extract ALL contact information, social profiles, websites

IMPORTANT:
- Do NOT truncate any descriptions or bullet points
- Include ALL technologies and tools mentioned
- Capture ALL achievements and quantifiable results
- Extract ALL dates and time periods
- Include ALL URLs, links, and references
- Preserve the original wording and details
- If information spans multiple lines, combine it into complete descriptions

RESUME TEXT: ${text.substring(0, 8000)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume parser. Extract ALL information from resumes into structured JSON. Never truncate descriptions. Always return valid JSON without markdown formatting. Capture every detail including projects, skills, achievements, and contact information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 3000,
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

        // Return a comprehensive fallback structure
        extractedData = {
          personal_info: { 
            name: '', linkedin: '', phone: '', email: '', gpa: '', 
            location: '', website: '', github: '', portfolio: '' 
          },
          education: [],
          experience: [],
          projects: [],
          skills: {
            programming_languages: [],
            frameworks: [],
            tools: [],
            databases: [],
            cloud_platforms: [],
            languages: [],
            certifications: []
          },
          school_involvement: [],
          volunteering: [],
          publications: [],
          awards: [],
          research: [],
          error: 'JSON parsing failed, returning empty structure'
        };
      }
    }

    // Ensure all arrays exist and are properly formatted
    const processedData = {
      personal_info: {
        name: extractedData.personal_info?.name || '',
        linkedin: extractedData.personal_info?.linkedin || '',
        phone: extractedData.personal_info?.phone || '',
        email: extractedData.personal_info?.email || '',
        gpa: extractedData.personal_info?.gpa || '',
        location: extractedData.personal_info?.location || '',
        website: extractedData.personal_info?.website || '',
        github: extractedData.personal_info?.github || '',
        portfolio: extractedData.personal_info?.portfolio || ''
      },
      education: Array.isArray(extractedData.education) ? extractedData.education : [],
      experience: Array.isArray(extractedData.experience) ? extractedData.experience : [],
      projects: Array.isArray(extractedData.projects) ? extractedData.projects : [],
      skills: {
        programming_languages: Array.isArray(extractedData.skills?.programming_languages) ? extractedData.skills.programming_languages : [],
        frameworks: Array.isArray(extractedData.skills?.frameworks) ? extractedData.skills.frameworks : [],
        tools: Array.isArray(extractedData.skills?.tools) ? extractedData.skills.tools : [],
        databases: Array.isArray(extractedData.skills?.databases) ? extractedData.skills.databases : [],
        cloud_platforms: Array.isArray(extractedData.skills?.cloud_platforms) ? extractedData.skills.cloud_platforms : [],
        languages: Array.isArray(extractedData.skills?.languages) ? extractedData.skills.languages : [],
        certifications: Array.isArray(extractedData.skills?.certifications) ? extractedData.skills.certifications : []
      },
      school_involvement: Array.isArray(extractedData.school_involvement) ? extractedData.school_involvement : [],
      volunteering: Array.isArray(extractedData.volunteering) ? extractedData.volunteering : [],
      publications: Array.isArray(extractedData.publications) ? extractedData.publications : [],
      awards: Array.isArray(extractedData.awards) ? extractedData.awards : [],
      research: Array.isArray(extractedData.research) ? extractedData.research : []
    };

    console.log('Final extracted data structure:', JSON.stringify(processedData, null, 2));
    console.log('Experience entries found:', processedData.experience?.length || 0);
    console.log('Projects extracted:', processedData.projects?.length || 0);
    console.log('Skills extracted:', Object.keys(processedData.skills).reduce((acc, key) => acc + processedData.skills[key].length, 0));
    return processedData;

  } catch (error) {
    console.error('AI extraction error:', error);
    throw new Error('Failed to process resume with AI');
  }
}

// Resume extraction endpoint
app.post('/api/resume/extract', upload.single('resume'), optionalAuth, checkRateLimit, logActivity('resume_upload'), async (req, res) => {
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
        gpa: '',
        location: '',
        website: '',
        github: '',
        portfolio: ''
      },
      education: structuredData.education || [],
      experience: structuredData.experience || [],
      projects: structuredData.projects || [],
      skills: structuredData.skills || {
        programming_languages: [],
        frameworks: [],
        tools: [],
        databases: [],
        cloud_platforms: [],
        languages: [],
        certifications: []
      },
      school_involvement: structuredData.school_involvement || [],
      volunteering: structuredData.volunteering || [],
      publications: structuredData.publications || [],
      awards: structuredData.awards || [],
      research: structuredData.research || [],
      success: true
    };

    // If user is authenticated, save resume data to database
    if (req.userId) {
      try {
        console.log(`Saving resume data to database for user ${req.userId}`);
        const updateResult = await userService.updateUser(req.userId, {
          resume: responseData
        });
        
        if (updateResult.success) {
          console.log(`✅ Resume data saved to database for user ${req.userId}`);
        } else {
          console.log(`⚠️ Failed to save resume data to database for user ${req.userId}`);
        }
      } catch (dbError) {
        console.error('Database save failed:', dbError);
        // Don't fail the request if database save fails
      }
    }

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
