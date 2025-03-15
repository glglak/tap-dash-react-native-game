// patch-gradle.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create android directory if it doesn't exist
const androidDir = path.join(__dirname, 'android');
if (!fs.existsSync(androidDir)) {
  fs.mkdirSync(androidDir, { recursive: true });
}

// Create or update gradle.properties
const gradlePropertiesPath = path.join(androidDir, 'gradle.properties');
const gradlePropertiesContent = `
# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g -XX:+HeapDumpOnOutOfMemoryError
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.configuration-cache=false

# Android SDK Config
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true

# Use this property to specify which architecture you want to build
android.enableR8.fullMode=false
`;

fs.writeFileSync(gradlePropertiesPath, gradlePropertiesContent);
console.log('Created/updated gradle.properties');

// Create gradle wrapper directory and properties file
const gradleWrapperDir = path.join(androidDir, 'gradle', 'wrapper');
fs.mkdirSync(gradleWrapperDir, { recursive: true });

const gradleWrapperPath = path.join(gradleWrapperDir, 'gradle-wrapper.properties');
const gradleWrapperContent = `
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.3-all.zip
networkTimeout=10000
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

fs.writeFileSync(gradleWrapperPath, gradleWrapperContent);
console.log('Created/updated gradle-wrapper.properties');

// Update package.json to include prebuild script
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts.prebuild = "node ./patch-gradle.js";
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with prebuild script');
} catch (error) {
  console.error('Error updating package.json:', error);
}

console.log('Gradle patch script completed successfully!');
