const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

// POST /api/research-professors
// Research and match professors based on student resume and preferences
router.post('/research-professors', async (req, res) => {
  try {
    console.log('Professor research request received');
    console.log('Request body:', req.body);

    const { resumeData, collegeName, researchField } = req.body;

    // Validate required fields
    if (!resumeData || !collegeName || !researchField) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['resumeData', 'collegeName', 'researchField'],
        received: { resumeData: !!resumeData, collegeName: !!collegeName, researchField: !!researchField }
      });
    }

    console.log('Starting professor research...');
    console.log('College:', collegeName);
    console.log('Research Field:', researchField);
    console.log('Resume data keys:', Object.keys(resumeData));

    // Call Gemini service to research professors
    const researchResult = await geminiService.researchProfessors(resumeData, collegeName, researchField);

    console.log('Professor research completed successfully');
    console.log('Found', researchResult.professors?.length || 0, 'professors');

    res.json({
      success: true,
      data: researchResult,
      timestamp: new Date().toISOString(),
      searchCriteria: {
        college: collegeName,
        researchField: researchField,
        resumeSkills: resumeData.experience?.length || 0,
        resumeProjects: resumeData.school_involvement?.length || 0
      }
    });

  } catch (error) {
    console.error('Professor research error:', error);
    res.status(500).json({
      error: 'Professor research failed',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/research-professors/health
// Health check for professor research service
router.get('/health', async (req, res) => {
  try {
    // Test Gemini service connectivity
    const isGeminiConfigured = !!process.env.GEMINI_API_KEY;

    res.json({
      status: 'ok',
      service: 'professor-research',
      geminiConfigured: isGeminiConfigured,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'professor-research',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

