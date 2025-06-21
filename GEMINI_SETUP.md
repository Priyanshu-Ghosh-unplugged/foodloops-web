# Gemini API Setup Guide

## Environment Configuration

To use the Gemini AI chatbot in FoodLoops, you need to set up your environment variables:

### 1. Create Environment File

Create a `.env.local` file in the root directory of the project:

```bash
# .env.local
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Replace `your_gemini_api_key_here` in your `.env.local` file with the actual API key

### 3. Restart Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

## Troubleshooting

### API Key Not Configured
If you see a yellow warning card saying "AI Assistant Unavailable", it means the API key is not properly configured.

### API Errors
- Check the browser console for detailed error messages
- Ensure your API key is valid and has the necessary permissions
- Verify that the Gemini API is enabled in your Google Cloud Console

### Content Blocking
If the API returns content blocking errors, try rephrasing your question or ask something else.

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already added to `.gitignore`
- Use different API keys for development and production environments 