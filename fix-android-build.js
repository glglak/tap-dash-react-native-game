#!/usr/bin/env node

/**
 * This script fixes common Android build issues for Expo/React Native projects
 * targeting Android API 34 and using Gradle 8.x
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Run a command and return the output
function runCommand(command, options = {}) {
  try {
    log(`Running: ${command}`, colors.blue);
    return execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options
    });
  } catch (error) {
    if (options.ignoreError) {
      log(`Command failed but continuing: ${command}`, colors.yellow);
      return '';
    }
    log(`Failed to execute: ${command}`, colors.red);
    log(error.message, colors.red);
    if (!options.continueOnError) {
      process.exit(1);
    }
    return '';
  }
}

// Main function
async function main() {
  log('🛠️ Starting Android build fix script...', colors.green);
  
  // Step 1: Clean the project
  log('\n🧹 Cleaning the project...', colors.green);
  if (process.platform === 'win32') {
    runCommand('rmdir /s /q node_modules', { ignoreError: true, silent: true });
    runCommand('rmdir /s /q android\\build', { ignoreError: true, silent: true });
    runCommand('rmdir /s /q android\\app\\build', { ignoreError: true, silent: true });
  } else {
    runCommand('rm -rf node_modules', { ignoreError: true, silent: true });
    runCommand('rm -rf android/build', { ignoreError: true, silent: true });
    runCommand('rm -rf android/app/build', { ignoreError: true, silent: true });
  }
  
  // Step 2: Install dependencies
  log('\n📦 Installing dependencies...', colors.green);
  runCommand('npm install');
  
  // Step 3: Run the gradle plugin patch
  log('\n🔧 Running Gradle plugin patch...', colors.green);
  runCommand('node ./gradle-plugin-patch.js');
  
  // Step 4: Set executable permission on gradlew
  if (process.platform !== 'win32') {
    log('\n🔑 Setting executable permission on gradlew...', colors.green);
    runCommand('chmod +x android/gradlew');
  }
  
  // Step 5: Clean gradle
  log('\n🧼 Cleaning Gradle cache...', colors.green);
  if (process.platform === 'win32') {
    runCommand('cd android && .\\gradlew clean && cd ..', { continueOnError: true });
  } else {
    runCommand('cd android && ./gradlew clean && cd ..', { continueOnError: true });
  }
  
  // Step 6: Run Metro bundler in a separate process (needed for EAS builds)
  log('\n🚇 Starting Metro bundler...', colors.green);
  if (process.platform === 'win32') {
    runCommand('start cmd /k npx react-native start');
  } else {
    runCommand('npx react-native start &');
  }
  
  // Step 7: Build the Android app
  log('\n🏗️ Building Android app...', colors.green);
  
  // Determine if building APK or AAB
  const buildType = process.argv.includes('--apk') ? 'assembleRelease' : 'bundleRelease';
  
  // Run the appropriate command
  if (process.platform === 'win32') {
    runCommand(`cd android && .\\gradlew ${buildType} && cd ..`);
  } else {
    runCommand(`cd android && ./gradlew ${buildType} && cd ..`);
  }
  
  // Step 8: Show build success message and path to the built file
  if (buildType === 'assembleRelease') {
    log('\n✅ Build completed! APK file can be found at:', colors.green);
    log('android/app/build/outputs/apk/release/app-release.apk', colors.blue);
  } else {
    log('\n✅ Build completed! AAB file can be found at:', colors.green);
    log('android/app/build/outputs/bundle/release/app-release.aab', colors.blue);
  }
}

// Run the main function
main().catch(error => {
  log(`❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});
