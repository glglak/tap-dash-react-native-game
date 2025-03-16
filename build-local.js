#!/usr/bin/env node

/**
 * Local build script for Android that uses your installed Java
 * rather than using EAS cloud build
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting local Android build...');

// Run the Gradle patch first (important for compatibility)
console.log('Running Gradle plugin patch...');
require('./gradle-plugin-patch');

// Make sure the Gradle wrapper is executable
try {
  const isWindows = process.platform === 'win32';
  const gradlewPath = path.join(__dirname, 'android', isWindows ? 'gradlew.bat' : 'gradlew');
  
  if (!isWindows) {
    // On non-Windows platforms, make sure gradlew is executable
    fs.chmodSync(gradlewPath, '755');
  }
  
  console.log('Gradle wrapper is ready.');
} catch (error) {
  console.error('Error preparing Gradle wrapper:', error.message);
  process.exit(1);
}

// Determine what to build based on command-line arguments
const args = process.argv.slice(2);
let buildCommand = '';

if (args.includes('--apk')) {
  buildCommand = 'assembleRelease';
  console.log('Building APK file...');
} else {
  buildCommand = 'bundleRelease';
  console.log('Building AAB file for Google Play submission...');
}

// Build the command to run
const command = `cd android && ${process.platform === 'win32' ? 'gradlew.bat' : './gradlew'} :app:${buildCommand} --no-daemon`;

console.log(`\nRunning Gradle command: ${command}\n`);

try {
  // Execute the Gradle command
  execSync(command, { stdio: 'inherit' });
  
  // Determine the output file path
  const outputFile = path.join(
    __dirname, 
    'android', 
    'app', 
    'build', 
    'outputs', 
    buildCommand === 'bundleRelease' ? 'bundle/release/app-release.aab' : 'apk/release/app-release.apk'
  );
  
  // Check if the file exists and print its location
  if (fs.existsSync(outputFile)) {
    console.log(`\n✅ Build completed successfully!`);
    console.log(`\nOutput file: ${outputFile}`);
  } else {
    console.log(`\n✅ Build completed but output file not found at expected location.`);
    console.log('Check the android/app/build/outputs directory for your build artifacts.');
  }
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure JAVA_HOME is set correctly in your environment');
  console.log('2. Try running with the --apk flag for a smaller build');
  console.log('3. Check the error message above for specific Gradle issues');
  process.exit(1);
}
