const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.isConfigured = !!this.apiKey;

    if (this.isConfigured) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      console.log('✅ Gemini AI service initialized successfully');
    } else {
      console.warn('⚠️  GEMINI_API_KEY not configured - AI features will be limited');
      this.genAI = null;
      this.model = null;
    }
  }

  async researchProfessors(resumeData, collegeName, researchField) {
    if (!this.isConfigured) {
      console.warn('⚠️  Gemini AI not configured - returning mock data');
      return this.getMockProfessorData(collegeName, researchField);
    }

    try {
      console.log('Starting professor research for:', { collegeName, researchField });

      const researchPrompt = `
You are an expert academic research assistant specializing in connecting students with professors for research opportunities. Your task is to conduct comprehensive research to find the best professor matches based on the student's background and interests.

STUDENT PROFILE:
${JSON.stringify(resumeData, null, 2)}

TARGET UNIVERSITY: ${collegeName}
RESEARCH FIELD: ${researchField}

RESEARCH METHODOLOGY:
1. Research the target university's faculty directory and relevant departments for ${researchField}
2. Identify professors who are actively conducting research in areas that align with the student's background and interests
3. Focus on professors who:
   - Have recent publications (past 2-3 years)
   - Are actively mentoring students (undergraduate/graduate research opportunities)
   - Have accessible communication (active online presence, lab websites, email availability)
   - Are likely accepting new students or collaborators
   - Have research interests that match the student's skills and experiences

4. For each professor, gather comprehensive information including:
   - Full name and academic title
   - Department and contact information
   - Primary research areas and specific interests
   - Recent publications (list 2-3 most relevant)
   - Lab/group website and online presence
   - Student mentoring style and history
   - Current projects and funding
   - Communication accessibility

5. Calculate two scores for each professor:
   - matchingScore (1-10): How well their research aligns with student's background
   - responseScore (1-10): Likelihood of responding to outreach based on accessibility and mentoring history

OUTPUT FORMAT (Return ONLY valid JSON):
{
  "professors": [
    {
      "name": "Professor Full Name",
      "title": "Associate Professor",
      "department": "Department Name",
      "email": "email@university.edu",
      "phone": "phone if available",
      "researchAreas": ["area1", "area2", "area3"],
      "recentPublications": ["Publication 1", "Publication 2"],
      "labWebsite": "https://lab.university.edu",
      "matchingScore": 8.5,
      "responseScore": 7.2,
      "matchingReason": "Detailed explanation of why this professor is a good match based on research alignment, student's skills, and professor's mentoring approach",
      "keyProjects": ["Project 1", "Project 2"],
      "studentMentoring": "Description of mentoring style and student involvement"
    }
  ],
  "researchSummary": "Brief summary of the research conducted and key findings",
  "totalProfessorsFound": 5
}

INSTRUCTIONS:
- Return exactly 5 professors
- Ensure high research alignment with student's background
- Prioritize professors who are actively mentoring students
- Include specific, actionable contact information
- Provide detailed matching reasons for each professor
- Focus on quality over quantity in research depth
- Consider the student's career stage and research interests
- Look for professors with complementary expertise to student's skills

Research thoroughly and provide accurate, current information about the professors and their work.`;

      const result = await this.model.generateContent(researchPrompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini raw response:', text);

      // Clean the response to extract JSON
      let jsonText = text;
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }

      try {
        const parsedData = JSON.parse(jsonText);
        console.log('Successfully parsed professor research data:', parsedData.professors?.length || 0, 'professors found');
        return parsedData;
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError.message);
        console.error('Raw response:', text);
        console.error('Cleaned response:', jsonText);

        // Return a fallback structure
        return {
          professors: [],
          researchSummary: "Research completed but parsing failed",
          totalProfessorsFound: 0,
          error: "JSON parsing failed"
        };
      }

    } catch (error) {
      console.error('Gemini service error:', error);
      throw new Error(`Professor research failed: ${error.message}`);
    }
  }

  async generateEmails(resumeData, professors) {
    if (!this.isConfigured) {
      console.warn('⚠️  Gemini AI not configured - returning basic email templates');
      return this.getMockEmailData(professors);
    }

    try {
      console.log('Generating emails for', professors.length, 'professors');

      const emailPrompt = `
You are an expert at crafting personalized academic outreach emails. Your task is to generate professional, authentic emails that connect students with professors for research opportunities.

STUDENT PROFILE:
${JSON.stringify(resumeData, null, 2)}

TARGET PROFESSORS:
${JSON.stringify(professors, null, 2)}

EMAIL REQUIREMENTS:
- Create ONE personalized email per professor
- Reference specific details from both student and professor backgrounds
- Mention relevant research interests, skills, or experiences
- Show genuine interest in their work
- Include a clear, specific ask (meeting, collaboration, etc.)
- Professional yet approachable tone
- Length: 200-300 words
- Include proper email structure: subject, greeting, body, closing

EMAIL STRUCTURE:
1. Subject: Clear and specific (e.g., "Interest in [Research Area] Research Opportunities")
2. Greeting: Professional (e.g., "Dear Professor [Last Name],")
3. Introduction: Who you are and why you're writing
4. Connection: Reference their work and your relevant background
5. Value Proposition: What you bring to the table
6. Specific Ask: Clear next steps you're proposing
7. Closing: Professional sign-off

OUTPUT FORMAT (Return ONLY valid JSON):
{
  "emails": [
    {
      "professorId": "index of professor in array",
      "professorName": "Professor Name",
      "subject": "Email subject line",
      "body": "Full email body text",
      "keyPoints": ["point1", "point2", "point3"],
      "personalizationScore": 8.5
    }
  ]
}

INSTRUCTIONS:
- Make each email unique and personalized
- Reference specific publications, research areas, or projects
- Show you've done your homework on their research
- Demonstrate genuine interest, not generic outreach
- Include concrete next steps
- Keep professional but conversational tone
- Focus on mutual benefit and collaboration`;

      const result = await this.model.generateContent(emailPrompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini email generation response:', text);

      // Clean and parse the response
      let jsonText = text;
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }

      try {
        const parsedData = JSON.parse(jsonText);
        console.log('Successfully generated', parsedData.emails?.length || 0, 'emails');
        return parsedData;
      } catch (parseError) {
        console.error('Email JSON parsing failed:', parseError.message);

        // Return fallback structure
        return {
          emails: [],
          error: "Email generation parsing failed"
        };
      }

    } catch (error) {
      console.error('Email generation error:', error);
      throw new Error(`Email generation failed: ${error.message}`);
    }
  }

  // Mock data methods for when AI is not configured
  getMockProfessorData(collegeName, researchField) {
    console.log('🔄 Returning mock professor data');
    return {
      professors: [
        {
          name: "Dr. Sarah Johnson",
          title: "Associate Professor",
          department: "Computer Science",
          email: "sarah.johnson@university.edu",
          researchAreas: ["Machine Learning", "Natural Language Processing", "Computer Vision"],
          publications: 45,
          recentWork: "Recent publications on transformer architectures and their applications in healthcare",
          labSize: 8,
          funding: "$2.3M",
          matchScore: 95,
          matchReasons: [
            "Strong alignment with your research interests in " + researchField,
            "Active in undergraduate research mentoring",
            "Well-funded lab with multiple ongoing projects"
          ]
        },
        {
          name: "Dr. Michael Chen",
          title: "Professor",
          department: "Electrical Engineering",
          email: "michael.chen@university.edu",
          researchAreas: ["Computer Vision", "Robotics", "AI Ethics"],
          publications: 78,
          recentWork: "Leading research on autonomous systems and ethical AI development",
          labSize: 12,
          funding: "$3.8M",
          matchScore: 88,
          matchReasons: [
            "Expertise in " + researchField + " applications",
            "Strong track record of publishing with undergraduates",
            "Interdisciplinary approach matches your background"
          ]
        },
        {
          name: "Dr. Emily Rodriguez",
          title: "Assistant Professor",
          department: "Data Science",
          email: "emily.rodriguez@university.edu",
          researchAreas: ["Data Mining", "Statistical Learning", "Big Data Analytics"],
          publications: 32,
          recentWork: "Developing new algorithms for large-scale data analysis",
          labSize: 6,
          funding: "$1.9M",
          matchScore: 82,
          matchReasons: [
            "Specializes in the technical aspects you're interested in",
            "Smaller lab size allows for more individual attention",
            "Recent publications align with your goals"
          ]
        }
      ],
      summary: {
        totalFound: 3,
        college: collegeName,
        researchField: researchField,
        searchTimestamp: new Date().toISOString()
      }
    };
  }

  getMockEmailData(professors) {
    console.log('🔄 Returning mock email data');
    return {
      emails: professors.map(professor => ({
        recipient: professor.email,
        subject: `Research Opportunity Inquiry - ${professor.name}`,
        body: `Dear ${professor.name},

I hope this email finds you well. My name is [Your Name], and I am currently a student at [Your School] majoring in [Your Major]. I am writing to express my strong interest in your research work, particularly in the area of ${professor.researchAreas[0]}.

After reviewing your publications and research interests, I am particularly drawn to your work on [specific research area]. I believe my background in [your relevant experience] would make me a good fit for contributing to your research projects.

I would greatly appreciate the opportunity to discuss potential research opportunities in your lab and learn more about your current projects. I am available to meet at your earliest convenience.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
[Your Name]
[Your Contact Information]
[Your LinkedIn/GitHub if applicable]`,
        personalizationScore: 85,
        keyHighlights: [
          "Personalized greeting using professor's name",
          "Specific reference to their research areas",
          "Clear statement of interest and fit",
          "Professional and concise tone"
        ]
      })),
      summary: {
        totalEmails: professors.length,
        averagePersonalization: 85,
        generatedAt: new Date().toISOString(),
        note: "These are template emails. Configure Gemini AI for personalized content."
      }
    };
  }
}

module.exports = new GeminiService();

