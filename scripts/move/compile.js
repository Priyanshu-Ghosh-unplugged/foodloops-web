#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('🔨 Compiling Move contract...');

try {
  // Get __dirname equivalent in ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

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