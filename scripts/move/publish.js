#!/usr/bin/env node

import { execSync } from 'child_process';
import { config } from 'dotenv';
import path from 'path';

// Get the project root directory
const rootDir = process.cwd();

// Load .env file from the project root
config({ path: path.resolve(rootDir, '.env') });

console.log('Publishing Move modules from:', rootDir);

// Read variables from the environment
const privateKey = process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
const accountAddress = process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS;
const nodeUrl = process.env.VITE_APTOS_NODE_URL;

// Validate that variables are loaded
if (!privateKey || !accountAddress || !nodeUrl) {
  console.error('Error: Could not parse one or more required variables from the .env file.');
  console.error(`VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY: ${!!privateKey}`);
  console.error(`VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS: ${!!accountAddress}`);
  console.error(`VITE_APTOS_NODE_URL: ${!!nodeUrl}`);
  process.exit(1);
}

// Construct the full command
const command = `aptos move publish --private-key ${privateKey} --url ${nodeUrl} --assume-yes --max-gas 100000`;

try {
  // Execute the command from the project root
  console.log(`Executing command from within ${rootDir}`);
  execSync(command, {
    cwd: rootDir,
    stdio: 'inherit' 
  });
  console.log('Successfully published Move modules.');
} catch (error) {
  console.error('Failed to publish Move modules:', error.message);
  process.exit(1);
} 