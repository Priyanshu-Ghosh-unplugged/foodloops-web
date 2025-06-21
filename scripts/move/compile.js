#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔨 Compiling Move contract...');

try {
  // Change to contract directory
  const contractDir = path.join(__dirname, '../../contract');
  process.chdir(contractDir);

  // Run aptos move compile
  execSync('aptos move compile', { 
    stdio: 'inherit',
    cwd: contractDir
  });

  console.log('✅ Contract compiled successfully!');
  console.log('📁 Build artifacts are in: contract/build/');
} catch (error) {
  console.error('❌ Compilation failed:', error.message);
  process.exit(1);
} 