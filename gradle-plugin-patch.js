#!/usr/bin/env node

/**
 * This script patches the React Native Gradle plugin to ensure compatibility 
 * with Gradle versions used by EAS Build.
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
        /(\.get\([^)]+\))\.getModule\("([^"]+)"\)/g, 
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
  
  // Also create a direct patch file for the specific Kotlin build script error
  // This fixes the specific error: Unresolved reference: getModule
  const directPatchPath = path.join(
    __dirname, 
    'android', 
    'build.gradle'
  );
  
  // Create the android directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'android'))) {
    fs.mkdirSync(path.join(__dirname, 'android'), { recursive: true });
  }
  
  // Add a subproject patch for the React Native Gradle plugin
  let buildGradleContent = '';
  if (fs.existsSync(directPatchPath)) {
    buildGradleContent = fs.readFileSync(directPatchPath, 'utf8');
  }
  
  // Add a configuration block that patches the module function during the build
  if (!buildGradleContent.includes('patchReactNativeGradlePlugin')) {
    const patchBlock = `
// This patch fixes the "Unresolved reference: getModule" error
allprojects {
    configurations.all {
        resolutionStrategy.eachDependency { DependencyResolveDetails details ->
            if (details.requested.group == 'com.android.tools.build' && details.requested.name == 'gradle') {
                details.useVersion '8.0.0'
            }
        }
    }
}

// Add this to your settings.gradle to apply our plugin fix
gradle.beforeProject { project ->
    if (project.name == 'react-native-gradle-plugin') {
        project.buildscript {
            doLast {
                def pluginBuildFile = project.file('build.gradle.kts')
                if (pluginBuildFile.exists()) {
                    def content = pluginBuildFile.text
                    if (content.contains(".getModule(")) {
                        def patched = content.replaceAll(/(\\.(get|findByName|getByName)\\([^)]+\\))\\.getModule\\("([^"]+)"\\)/, '$1.module("$2")')
                        pluginBuildFile.text = patched
                        println "Patched React Native Gradle plugin build file to fix getModule reference"
                    }
                }
            }
        }
    }
}
`;
    
    // Add the patch block to the build.gradle file
    buildGradleContent = buildGradleContent + patchBlock;
    fs.writeFileSync(directPatchPath, buildGradleContent, 'utf8');
    console.log('✅ Added Gradle plugin patching to build.gradle');
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
  
  console.log('✅ Gradle plugin patch completed successfully!');
} catch (error) {
  console.error('❌ Error during Gradle plugin patch:', error.message);
}
