// react-native-gradle-plugin-patch.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// This script will be run by EAS before installing dependencies
console.log('Running React Native Gradle plugin patch script...');

// Function to find the React Native Gradle plugin
async function findAndPatchGradlePlugin() {
  const possiblePaths = [
    // In EAS build environment
    '/home/expo/workingdir/build/node_modules/@react-native/gradle-plugin/build.gradle.kts',
    // In EAS local environment
    path.join(process.cwd(), 'node_modules', '@react-native', 'gradle-plugin', 'build.gradle.kts')
  ];
  
  for (const pluginPath of possiblePaths) {
    if (fs.existsSync(pluginPath)) {
      console.log(`Found React Native Gradle plugin at: ${pluginPath}`);
      
      try {
        // Read the plugin file
        const pluginContent = fs.readFileSync(pluginPath, 'utf8');
        
        // Check if it contains the problematic serviceOf calls
        if (pluginContent.includes('import org.gradle.configurationcache.extensions.serviceOf')) {
          console.log('Found serviceOf import, patching file...');
          
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
          return true;
        } else {
          console.log('File does not contain serviceOf, no need to patch.');
          return true;
        }
      } catch (error) {
        console.error(`Error reading or writing plugin file: ${error.message}`);
      }
    }
  }
  
  console.log('React Native Gradle plugin file not found in expected locations.');
  return false;
}

// Function to patch any local Gradle files to disable configuration cache
function patchLocalGradleFiles() {
  const androidDir = path.join(process.cwd(), 'android');
  
  if (fs.existsSync(androidDir)) {
    // Create or update gradle.properties
    const gradlePropertiesPath = path.join(androidDir, 'gradle.properties');
    
    try {
      let content = '';
      if (fs.existsSync(gradlePropertiesPath)) {
        content = fs.readFileSync(gradlePropertiesPath, 'utf8');
      }
      
      // Add configuration cache disabling if not already present
      if (!content.includes('org.gradle.configuration-cache=false')) {
        content += '\n# Disable Gradle configuration cache to avoid serviceOf errors\n';
        content += 'org.gradle.configuration-cache=false\n';
        fs.writeFileSync(gradlePropertiesPath, content);
        console.log('Updated gradle.properties to disable configuration cache');
      }
    } catch (error) {
      console.error(`Error updating gradle.properties: ${error.message}`);
    }
  }
}

// Run the patch functions
async function runPatch() {
  patchLocalGradleFiles();
  
  // The Gradle plugin might not be available at this point during pre-install
  // This is more of a preparation step
  console.log('Plugin patching will be attempted during the build process');
  
  console.log('Gradle patch preparation completed!');
}

runPatch();
