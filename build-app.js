#!/usr/bin/env node

/**
 * This script helps build the app using the local eas-cli installation
 * to avoid version compatibility issues.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Make sure gradle.properties directory exists
const gradlePropsDir = path.join(__dirname, 'android');
if (!fs.existsSync(gradlePropsDir)) {
  fs.mkdirSync(gradlePropsDir, { recursive: true });
}

// Run the gradle patch first
console.log('Running gradle plugin patch...');
try {
  require('./gradle-plugin-patch');
} catch (err) {
  console.error('Error running patch:', err);
}

// Determine what build profile to use
const args = process.argv.slice(2);
let profile = 'production';
let clearCache = true;

if (args.includes('--preview')) {
  profile = 'preview';
}

if (args.includes('--dev') || args.includes('--development')) {
  profile = 'development';
}

if (args.includes('--no-clear-cache')) {
  clearCache = false;
}

// Build the command
const command = `npx eas-cli build --platform android --profile ${profile}${clearCache ? ' --clear-cache' : ''}`;

console.log(`\nRunning build with command: ${command}\n`);

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed with error:', error.message);
  
  // If we get a validation error with eas.json, provide helpful information
  if (error.message.includes('eas.json is not valid')) {
    console.log('\n\n------------------------------------');
    console.log('eas.json validation error detected!');
    console.log('------------------------------------');
    console.log('This might be due to version incompatibility.');
    console.log('\nTry these solutions:');
    console.log('1. Install a specific EAS CLI version:');
    console.log('   npm install --save-dev eas-cli@3.13.3');
    console.log('\n2. Try without any profile or with minimal settings:');
    console.log('   npx eas-cli build --platform android');
    console.log('\n3. Clean your environment:');
    console.log('   rm -rf node_modules && npm install');
    console.log('------------------------------------\n');
  }
  
  process.exit(1);
}
