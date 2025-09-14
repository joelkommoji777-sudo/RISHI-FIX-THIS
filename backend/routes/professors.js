const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const userService = require('../services/userService');
const { optionalAuth, checkRateLimit, logActivity } = require('../middleware/auth');

// POST /api/research-professors
// Research and match professors based on student resume and preferences
router.post('/research-professors', optionalAuth, checkRateLimit, logActivity('professor_search'), async (req, res) => {
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

    // Save search history if user is authenticated
    if (req.userId) {
      try {
        console.log(`Saving search history for user ${req.userId}`);
        
        // Create search record in database
        const searchData = {
          user_id: req.userId,
          university: collegeName,
          research_field: researchField,
          search_criteria: {
            resumeSkills: resumeData.experience?.length || 0,
            resumeProjects: resumeData.projects?.length || 0,
            resumeEducation: resumeData.education?.length || 0,
            resumeSkills: Object.keys(resumeData.skills || {}).reduce((acc, key) => acc + (resumeData.skills[key]?.length || 0), 0)
          },
          results_count: researchResult.professors?.length || 0
        };

        // Save to database using Supabase
        if (userService.useDatabase) {
          const { createClient } = require('@supabase/supabase-js');
          const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
          
          const { error } = await supabase
            .from('professor_searches')
            .insert([searchData]);

          if (error) {
            console.error('Failed to save search history:', error);
          } else {
            console.log(`✅ Search history saved for user ${req.userId}`);
          }
        }
      } catch (dbError) {
        console.error('Database save failed for search history:', dbError);
        // Don't fail the request if database save fails
      }
    }

    res.json({
      success: true,
      data: researchResult,
      timestamp: new Date().toISOString(),
      searchCriteria: {
        college: collegeName,
        researchField: researchField,
        resumeSkills: resumeData.experience?.length || 0,
        resumeProjects: resumeData.projects?.length || 0
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

