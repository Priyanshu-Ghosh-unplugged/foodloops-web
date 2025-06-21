import { config } from '@/config/env';

// List of possible Gemini API endpoints to test
const API_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
];

export const testAllEndpoints = async () => {
  const results = [];
  
  for (const endpoint of API_ENDPOINTS) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      
      const response = await fetch(`${endpoint}?key=${config.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello!'
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 50,
          }
        })
      });

      const data = await response.json();
      
      results.push({
        endpoint,
        status: response.status,
        success: response.ok,
        data: data
      });

      if (response.ok) {
        console.log(`✅ SUCCESS: ${endpoint}`);
        console.log('Response:', data);
        return { success: true, workingEndpoint: endpoint, data };
      } else {
        console.log(`❌ FAILED: ${endpoint} - ${response.status}`);
        console.log('Error:', data);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${endpoint} - ${error}`);
      results.push({
        endpoint,
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('All endpoint test results:', results);
  return { success: false, results };
};

// Test the current endpoint
export const testCurrentEndpoint = async () => {
  try {
    console.log(`Testing current endpoint: ${config.geminiApiUrl}`);
    
    const response = await fetch(`${config.geminiApiUrl}?key=${config.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello!'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        }
      })
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 