// Simple test script to verify the resume extraction API
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testResumeAPI() {
  try {
    console.log('🧪 Testing Resume Extraction API...');
    
    // Test health endpoint first
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    
    // Test professor research endpoint
    const professorResponse = await fetch('http://localhost:3001/api/research-professors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData: {
          personal_info: { name: 'Test User', email: 'test@example.com' },
          experience: [{ title: 'Software Engineer', company: 'Tech Corp' }],
          education: 'Computer Science Degree'
        },
        collegeName: 'Stanford University',
        researchField: 'Computer Science'
      }),
    });
    
    const professorData = await professorResponse.json();
    console.log('✅ Professor research test:', professorData.success ? 'SUCCESS' : 'FAILED');
    
    if (professorData.success) {
      console.log(`📊 Found ${professorData.data.totalProfessorsFound} professors`);
      console.log('🎯 First professor:', professorData.data.professors[0]?.name || 'None');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testResumeAPI();

