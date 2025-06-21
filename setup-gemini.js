#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Setting up Gemini API for FoodLoops...\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env.local file already exists!');
  console.log('Please check if VITE_GEMINI_API_KEY is set in your .env.local file.\n');
} else {
  // Create .env.local file
  const envContent = `# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=AIzaSyAlA3unQELAAW5jeahTPKlu8xCiSLFTFmM

# Instructions:
# 1. The API key above is the one that was previously hardcoded
# 2. For production, get a new API key from: https://makersuite.google.com/app/apikey
# 3. Restart your development server
# 4. The chatbot should now work properly
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with the existing API key');
    console.log('📝 The API key has been moved to environment variables');
    console.log('🔑 For production, get a new API key from: https://makersuite.google.com/app/apikey\n');
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
    console.log('Please create .env.local manually and add:');
    console.log('VITE_GEMINI_API_KEY=AIzaSyAlA3unQELAAW5jeahTPKlu8xCiSLFTFmM\n');
  }
}

console.log('📖 For more information, see GEMINI_SETUP.md');
console.log('🚀 After setting up the API key, restart your development server'); 