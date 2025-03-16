#!/usr/bin/env node

/**
 * This script helps build the Android app bundle using Docker without requiring
 * local Java or Android SDK installation
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Check if Docker is available first
console.log('Checking if Docker is installed and running...');
try {
  // Test Docker availability first with a simple command
  const dockerCheck = spawnSync('docker', ['info'], { stdio: 'pipe' });
  
  if (dockerCheck.status !== 0) {
    console.error('\n❌ Docker is not running or not installed correctly.');
    console.log('\nDocker error details:');
    console.log(dockerCheck.stderr.toString());
    console.log('\nEither:');
    console.log('1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/');
    console.log('2. Make sure Docker Desktop is running (check the system tray)');
    console.log('3. Or use the cloud-based EAS build instead:');
    console.log('   npm run build');
    process.exit(1);
  }
  
  console.log('✅ Docker is running and available!');
} catch (error) {
  console.error('\n❌ Docker command not found. Is Docker installed?');
  console.log('\nPlease:');
  console.log('1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/');
  console.log('2. Make sure it\'s running properly');
  console.log('3. Or use the cloud-based EAS build instead:');
  console.log('   npm run build');
  process.exit(1);
}

// Determine the platform-specific command for cleaning up containers
const platform = os.platform();
const isWindows = platform === 'win32';

// Handle Windows path conversion for Docker
function getDockerPath(localPath) {
  if (isWindows) {
    // Convert Windows path to Docker path format
    // Remove drive letter and replace backslashes with forward slashes
    return '/app';
  }
  return '/app';
}

// Create docker command with the correct path mapping
const projectDir = path.resolve(__dirname);
const dockerProjectPath = getDockerPath(projectDir);

console.log('Starting Docker-based Android build...');
console.log(`Project directory: ${projectDir}`);

// Determine what build profile to use
const args = process.argv.slice(2);
let buildType = 'app-bundle'; // Default for Google Play
let buildCommand = ':app:bundleRelease';

if (args.includes('--apk')) {
  buildType = 'apk';
  buildCommand = ':app:assembleRelease';
  console.log('Building APK file...');
} else {
  console.log('Building AAB file for Google Play submission...');
}

// Docker command to run the build - simplified with fixed path mapping
const dockerCommand = `docker run --rm -v "${projectDir}:/app" cimg/android:2023.11.1-node bash -c "cd /app && npm install && cd android && chmod +x ./gradlew && ./gradlew ${buildCommand} --no-daemon"`;

console.log('\nRunning build with Docker. This may take several minutes...\n');

try {
  execSync(dockerCommand, { stdio: 'inherit' });
  
  // Print success message with file location
  let outputFile = '';
  if (buildType === 'apk') {
    outputFile = path.join(projectDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  } else {
    outputFile = path.join(projectDir, 'android', 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
  }
  
  if (fs.existsSync(outputFile)) {
    console.log('\n✅ Build completed successfully!');
    console.log(`\nOutput file: ${outputFile}`);
  } else {
    console.log('\n✅ Build completed but output file not found at expected location.');
    console.log('Check the android/app/build/outputs directory for your build artifacts.');
  }
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure Docker is installed and running on your system');
  console.log('2. Verify you have sufficient disk space');
  console.log('3. Try running with the --apk flag for a smaller build');
  console.log('4. If all else fails, use the cloud-based EAS build with:');
  console.log('   npm run build');
  process.exit(1);
}
