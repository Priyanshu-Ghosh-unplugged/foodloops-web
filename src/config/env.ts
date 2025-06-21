export const config = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  // Try different endpoints - the API might be using a different model or endpoint
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
} as const;

export const isGeminiConfigured = () => {
  return !!config.geminiApiKey;
}; 