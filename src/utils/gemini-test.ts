import { config, isGeminiConfigured } from '@/config/env';

export const testGeminiAPI = async () => {
  if (!isGeminiConfigured()) {
    console.error('Gemini API key not configured');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const response = await fetch(`${config.geminiApiUrl}?key=${config.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello, can you respond with a simple greeting?'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API test failed:', errorData);
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorData
      };
    }

    const data = await response.json();
    console.log('API test response:', data);

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return { 
        success: true, 
        response: data.candidates[0].content.parts[0].text 
      };
    } else {
      return { 
        success: false, 
        error: 'Invalid response structure',
        details: data
      };
    }
  } catch (error) {
    console.error('API test error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 