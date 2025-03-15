// .eas-hooks/pre-build.js
const fs = require('fs');
const path = require('path');

module.exports = async (config) => {
  console.log('Running pre-build hook...');
  
  // Only run for Android platform
  if (config.platform === 'android') {
    console.log('Platform is Android, applying fixes...');
    
    try {
      // Make sure android directory exists
      const androidDir = path.join(process.cwd(), 'android');
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
org.gradle.unsafe.configuration-cache=false

# Android SDK Config
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true

# Disable R8 full mode
android.enableR8.fullMode=false
`;
      
      fs.writeFileSync(gradlePropertiesPath, gradlePropertiesContent);
      console.log('Created/updated gradle.properties');
      
      // Create gradle wrapper properties file
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
      
      // Now look for and patch the React Native Gradle plugin file
      console.log('Searching for React Native Gradle plugin to patch...');
      
      // Wait until the file exists
      let maxAttempts = 5;
      let attempt = 0;
      let pluginFound = false;
      let pluginPath;
      
      while (attempt < maxAttempts) {
        try {
          // We're going to look in several common locations for the React Native Gradle plugin file
          const possiblePaths = [
            // In EAS building environment
            '/home/expo/workingdir/build/node_modules/@react-native/gradle-plugin/build.gradle.kts',
            // In standard React Native project
            path.join(process.cwd(), 'node_modules', '@react-native', 'gradle-plugin', 'build.gradle.kts')
          ];
          
          for (const potentialPath of possiblePaths) {
            if (fs.existsSync(potentialPath)) {
              pluginPath = potentialPath;
              pluginFound = true;
              break;
            }
          }
          
          if (pluginFound) break;
        } catch (err) {
          console.log(`Attempt ${attempt + 1}: Error finding plugin file:`, err.message);
        }
        
        // Wait a bit before next attempt
        console.log(`Waiting for React Native Gradle plugin to be available... (attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempt++;
      }
      
      if (!pluginFound) {
        console.log('WARNING: Could not find React Native Gradle plugin to patch!');
        return;
      }
      
      console.log(`Found React Native Gradle plugin at: ${pluginPath}`);
      
      // Read the plugin file
      const pluginContent = fs.readFileSync(pluginPath, 'utf8');
      
      // Replace the problematic serviceOf calls with a workaround
      let newContent = pluginContent;
      
      // Replace the import
      newContent = newContent.replace(
        'import org.gradle.configurationcache.extensions.serviceOf',
        '// import org.gradle.configurationcache.extensions.serviceOf'
      );
      
      // Replace the serviceOf usage with direct service access
      newContent = newContent.replace(
        'serviceOf<ModuleRegistry>()',
        'project.gradle.sharedServices.registrations.findByName("moduleRegistry")?.service ?: throw GradleException("ModuleRegistry service not found")'
      );
      
      // Write the patched content back
      fs.writeFileSync(pluginPath, newContent);
      console.log('Successfully patched React Native Gradle plugin!');
      
    } catch (error) {
      console.error('Error in pre-build hook:', error);
    }
  }
};
