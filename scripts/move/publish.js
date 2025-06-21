#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Publishing Move contract to blockchain...');

try {
  // Change to contract directory
  const contractDir = path.join(__dirname, '../../contract');
  process.chdir(contractDir);

  // Run aptos move publish
  execSync('aptos move publish', { 
    stdio: 'inherit',
    cwd: contractDir
  });

  console.log('✅ Contract published successfully!');
  console.log('📝 Update your .env file with the deployed module address');
} catch (error) {
  console.error('❌ Publication failed:', error.message);
  process.exit(1);
} 