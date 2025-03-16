#!/usr/bin/env node

/**
 * This script helps build the Android app bundle using Docker without requiring
 * local Java or Android SDK installation
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Determine the platform-specific command for cleaning up containers
const platform = os.platform();
const isWindows = platform === 'win32';

// Handle Windows path conversion for Docker
function getDockerPath(localPath) {
  if (isWindows) {
    // Convert Windows path to Docker path format
    return localPath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '//$1');
  }
  return localPath;
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

// Docker command to run the build
const dockerCommand = `docker run --rm -v "${projectDir}:${dockerProjectPath}" cimg/android:2023.11.1-node bash -c "cd ${dockerProjectPath} && npm install && cd android && chmod +x ./gradlew && ./gradlew ${buildCommand} --no-daemon"`;

console.log('\\nRunning build with Docker. This may take several minutes...\\n');

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
    console.log('\\n✅ Build completed successfully!');
    console.log(`\\nOutput file: ${outputFile}`);
  } else {
    console.log('\\n✅ Build completed but output file not found at expected location.');
    console.log('Check the android/app/build/outputs directory for your build artifacts.');
  }
} catch (error) {
  console.error('\\n❌ Build failed:', error.message);
  console.log('\\nTroubleshooting tips:');
  console.log('1. Make sure Docker is installed and running on your system');
  console.log('2. Verify you have sufficient disk space');
  console.log('3. Try running with the --apk flag for a smaller build');
  console.log('4. If all else fails, use the cloud-based EAS build with:');
  console.log('   npm run build');
  process.exit(1);
}
