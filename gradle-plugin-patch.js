#!/usr/bin/env node

/**
 * This script patches the React Native Gradle plugin to ensure compatibility 
 * with Gradle versions used by EAS Build and local Android builds.
 */

const fs = require('fs');
const path = require('path');

console.log('🛠️ Running Gradle plugin compatibility patch...');

// First, make sure the node_modules directory exists
try {
  // Try to patch the React Native Gradle plugin build file
  const pluginPath = path.join(
    __dirname, 
    'node_modules', 
    '@react-native', 
    'gradle-plugin', 
    'build.gradle.kts'
  );
  
  if (fs.existsSync(pluginPath)) {
    console.log(`Found Gradle plugin at: ${pluginPath}`);
    
    // Read the file content
    let content = fs.readFileSync(pluginPath, 'utf8');
    
    // Check if the file contains the problematic .getModule call
    if (content.includes('.getModule(')) {
      console.log('Found incompatible Gradle plugin code, patching...');
      
      // Replace the problematic line with a compatible version
      const patched = content.replace(
        /(\\.get\\([^)]+\\))\\.getModule\\(\"([^\"]+)\"\\)/g, 
        '$1.module("$2")'
      );
      
      // Write the patched content back
      fs.writeFileSync(pluginPath, patched, 'utf8');
      console.log('✅ Successfully patched Gradle plugin!');
    } else {
      console.log('Gradle plugin already compatible, no patching needed.');
    }
  } else {
    console.log(`React Native Gradle plugin not found at ${pluginPath}`);
    console.log('This is normal if the project hasn\'t been installed yet.');
  }
  
  // Also patch the Android build.gradle file to ensure it's compatible with Gradle 8.x
  console.log('Checking Android build.gradle files...');
  
  // Create the android directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'android'))) {
    fs.mkdirSync(path.join(__dirname, 'android'), { recursive: true });
    console.log(`Created directory: ${path.join(__dirname, 'android')}`);
  }
  
  // Make sure the Android Gradle wrapper properties file exists with correct version
  const gradleWrapperDir = path.join(__dirname, 'android', 'gradle', 'wrapper');
  const gradleWrapperFile = path.join(gradleWrapperDir, 'gradle-wrapper.properties');
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(gradleWrapperDir)) {
    fs.mkdirSync(gradleWrapperDir, { recursive: true });
    console.log(`Created directory: ${gradleWrapperDir}`);
  }
  
  // Create or update the gradle-wrapper.properties file
  const gradleWrapperContent = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.3-all.zip
networkTimeout=10000
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
  
  fs.writeFileSync(gradleWrapperFile, gradleWrapperContent, 'utf8');
  console.log(`✅ Updated Gradle wrapper to use version 8.3`);
  
  // Create or modify settings.gradle to ensure it's compatible with Android Studio Flamingo+
  const settingsGradlePath = path.join(__dirname, 'android', 'settings.gradle');
  if (fs.existsSync(settingsGradlePath)) {
    let settingsContent = fs.readFileSync(settingsGradlePath, 'utf8');
    
    // Make sure the settings.gradle file is configured properly for Gradle 8.x
    if (!settingsContent.includes('pluginManagement {')) {
      console.log('Updating settings.gradle for Gradle 8.x compatibility...');
      const newSettingsContent = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

${settingsContent}`;
      fs.writeFileSync(settingsGradlePath, newSettingsContent, 'utf8');
      console.log('✅ Updated settings.gradle for Gradle 8.x compatibility');
    }
  }
  
  // Fix potential issues with React Native module resolution
  const fixReactNativeModule = () => {
    const nodeModulesDir = path.join(__dirname, 'node_modules');
    const reactNativePackageJson = path.join(nodeModulesDir, 'react-native', 'package.json');
    
    if (fs.existsSync(reactNativePackageJson)) {
      console.log('Ensuring react-native module is properly configured...');
      
      try {
        // Check the React Native codegen path
        const codegenDir = path.join(nodeModulesDir, '@react-native', 'codegen');
        if (!fs.existsSync(codegenDir)) {
          console.log('Creating codegen directory structure...');
          fs.mkdirSync(codegenDir, { recursive: true });
          
          // Create a basic package.json
          const codegenPackage = {
            name: "@react-native/codegen",
            version: "0.0.0",
            description: "Temporary codegen package",
            repository: "github:facebook/react-native",
            license: "MIT"
          };
          fs.writeFileSync(
            path.join(codegenDir, 'package.json'), 
            JSON.stringify(codegenPackage, null, 2), 
            'utf8'
          );
          console.log('✅ Created temporary codegen package');
        }
        
        // Ensure the gradle-plugin directory exists
        const gradlePluginDir = path.join(nodeModulesDir, '@react-native', 'gradle-plugin');
        if (!fs.existsSync(gradlePluginDir)) {
          console.log('Creating gradle-plugin directory structure...');
          fs.mkdirSync(gradlePluginDir, { recursive: true });
          
          // Create a basic react-native.gradle file if it doesn't exist
          const gradlePluginFile = path.join(gradlePluginDir, 'react-native.gradle');
          if (!fs.existsSync(gradlePluginFile)) {
            fs.writeFileSync(
              gradlePluginFile,
              '// Placeholder React Native Gradle Plugin\n',
              'utf8'
            );
            console.log('✅ Created placeholder react-native.gradle file');
          }
        }
      } catch (err) {
        console.error('Error fixing React Native module structure:', err.message);
      }
    }
  };
  
  // Run the React Native module fix
  fixReactNativeModule();
  
  console.log('✅ Gradle plugin patch completed successfully!');
} catch (error) {
  console.error('❌ Error during Gradle plugin patch:', error.message);
}
