#!/usr/bin/env node

/**
 * This script identifies and removes potentially problematic features and dependencies
 * from the project to help resolve build issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Potentially problematic dependencies
const PROBLEMATIC_DEPENDENCIES = [
  'react-native-sound',
  'react-native-haptic-feedback',
  'expo-haptics',
  'expo-av',
];

// Check if we should run in aggressive mode (remove more features)
const AGGRESSIVE_MODE = process.argv.includes('--aggressive');

console.log('🔍 Analyzing project for problematic features...');
console.log(`Mode: ${AGGRESSIVE_MODE ? 'Aggressive (removing more features)' : 'Conservative (minimal changes)'}`);

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('✅ Successfully read package.json');
} catch (error) {
  console.error('❌ Failed to read package.json:', error.message);
  process.exit(1);
}

// Create a backup of the package.json file
const backupPath = path.join(__dirname, 'package.json.backup');
try {
  fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log(`✅ Created backup at ${backupPath}`);
} catch (error) {
  console.error('❌ Failed to create backup:', error.message);
  process.exit(1);
}

// Copy minimal app.json to app.json
const minimalAppJsonPath = path.join(__dirname, 'minimal-app.json');
const appJsonPath = path.join(__dirname, 'app.json');
try {
  if (fs.existsSync(minimalAppJsonPath)) {
    const minimalAppJson = fs.readFileSync(minimalAppJsonPath, 'utf8');
    
    // Create a backup of app.json if it exists
    if (fs.existsSync(appJsonPath)) {
      fs.copyFileSync(appJsonPath, appJsonPath + '.backup');
      console.log(`✅ Created backup of app.json at ${appJsonPath}.backup`);
    }
    
    fs.writeFileSync(appJsonPath, minimalAppJson, 'utf8');
    console.log('✅ Updated app.json with minimal configuration');
  } else {
    console.log('❌ minimal-app.json not found, skipping app.json update');
  }
} catch (error) {
  console.error('❌ Failed to update app.json:', error.message);
}

// Identify problematic dependencies
const problematicDepsFound = [];
for (const dep of PROBLEMATIC_DEPENDENCIES) {
  if (packageJson.dependencies[dep]) {
    problematicDepsFound.push(dep);
  }
}

if (problematicDepsFound.length > 0) {
  console.log(`Found ${problematicDepsFound.length} potentially problematic dependencies:`);
  for (const dep of problematicDepsFound) {
    console.log(`  - ${dep}`);
  }
  
  // Remove problematic dependencies
  console.log('\nRemoving problematic dependencies...');
  for (const dep of problematicDepsFound) {
    delete packageJson.dependencies[dep];
    console.log(`  ✅ Removed ${dep}`);
  }
} else {
  console.log('No known problematic dependencies found');
}

// If in aggressive mode, also remove reanimated and game-engine
if (AGGRESSIVE_MODE) {
  const aggressiveRemoveDeps = [
    'react-native-reanimated',
    'react-native-game-engine',
    'matter-js'
  ];
  
  console.log('\nIn aggressive mode, also removing:');
  for (const dep of aggressiveRemoveDeps) {
    if (packageJson.dependencies[dep]) {
      delete packageJson.dependencies[dep];
      console.log(`  ✅ Removed ${dep}`);
    } else {
      console.log(`  ⚠️ Dependency ${dep} not found, skipping`);
    }
  }
}

// Update the package.json file
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('\n✅ Successfully updated package.json');
} catch (error) {
  console.error('\n❌ Failed to update package.json:', error.message);
  process.exit(1);
}

// Clean Android build directory
console.log('\nCleaning Android build directory...');
const androidBuildDir = path.join(__dirname, 'android', 'app', 'build');
if (fs.existsSync(androidBuildDir)) {
  try {
    // On Windows, we need to use rimraf or a recursive deletion function
    // This is a simple implementation for demonstration
    const deleteFolderRecursive = function(pathToDelete) {
      if (fs.existsSync(pathToDelete)) {
        fs.readdirSync(pathToDelete).forEach((file) => {
          const curPath = path.join(pathToDelete, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            // Recursive call
            deleteFolderRecursive(curPath);
          } else {
            // Delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(pathToDelete);
      }
    };
    
    deleteFolderRecursive(androidBuildDir);
    console.log(`  ✅ Removed ${androidBuildDir}`);
  } catch (error) {
    console.error(`  ❌ Failed to remove ${androidBuildDir}: ${error.message}`);
  }
} else {
  console.log(`  ⚠️ Directory ${androidBuildDir} does not exist, skipping cleanup`);
}

// Instructions for next steps
console.log('\n📋 Next steps:');
console.log('1. Run "npm install" to update node_modules');
console.log('2. Run "npx expo prebuild --platform android --clean" to regenerate native code');
console.log('3. Try building with "npm run build:windows"');
console.log('\nIf the build still fails, try running this script with the --aggressive flag:');
console.log('  node feature-remover.js --aggressive');
console.log('\nTo restore your original configuration:');
console.log(`  cp ${backupPath} ${packageJsonPath}`);
console.log(`  cp ${appJsonPath}.backup ${appJsonPath} (if backup exists)`);
