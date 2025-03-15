// gradle-plugin-patch.js
// Enhanced version: This script modifies the React Native Gradle plugin
// to work with newer Gradle versions by patching the serviceOf method

const fs = require('fs');
const path = require('path');

// Extended list of possible plugin locations
const PLUGIN_PATHS = [
  // EAS build environment
  '/home/expo/workingdir/build/node_modules/@react-native/gradle-plugin/build.gradle.kts',
  // Local development paths
  path.join(process.cwd(), 'node_modules', '@react-native', 'gradle-plugin', 'build.gradle.kts'),
  // Alternative paths
  path.join(process.cwd(), 'android', 'app', 'build.gradle'),
  path.join(process.cwd(), 'node_modules', 'react-native', 'android', 'app', 'build.gradle'),
  path.join(process.cwd(), 'node_modules', 'react-native', 'gradle-plugin', 'build.gradle.kts'),
  // For expo projects
  path.join(process.cwd(), '.expo', 'node_modules', '@react-native', 'gradle-plugin', 'build.gradle.kts'),
];

function patchGradlePlugin() {
  let foundPlugin = false;
  let patchedFiles = [];

  for (const pluginPath of PLUGIN_PATHS) {
    if (fs.existsSync(pluginPath)) {
      try {
        console.log(`Found potential Gradle file at: ${pluginPath}`);
        
        // Read the content
        const content = fs.readFileSync(pluginPath, 'utf8');
        let needsPatching = false;
        let newContent = content;

        // Check for different problematic patterns
        if (content.includes('import org.gradle.configurationcache.extensions.serviceOf')) {
          console.log(`Found serviceOf import in ${pluginPath}, patching...`);
          needsPatching = true;
          
          // Create a backup
          fs.writeFileSync(`${pluginPath}.bak`, content);
          
          // Comment out the import
          newContent = newContent.replace(
            'import org.gradle.configurationcache.extensions.serviceOf',
            '// import org.gradle.configurationcache.extensions.serviceOf // Commented out to fix build issues'
          );
          
          // Replace the usage with a direct access approach
          newContent = newContent.replace(
            'serviceOf<ModuleRegistry>()',
            'project.gradle.sharedServices.registrations.findByName("moduleRegistry")?.service ?: throw GradleException("ModuleRegistry service not found")'
          );
        }

        // Check for configuration cache issues
        if (content.includes('enableFeaturePreview("CONFIGURATION_CACHE")')) {
          console.log(`Found configuration cache feature in ${pluginPath}, disabling...`);
          needsPatching = true;
          
          if (!fs.existsSync(`${pluginPath}.bak`)) {
            fs.writeFileSync(`${pluginPath}.bak`, content);
          }
          
          // Comment out the configuration cache enablement
          newContent = newContent.replace(
            'enableFeaturePreview("CONFIGURATION_CACHE")',
            '// enableFeaturePreview("CONFIGURATION_CACHE") // Disabled to fix build issues'
          );
        }

        // If Android Gradle plugin version needs updating
        if (pluginPath.endsWith('build.gradle') && content.includes('com.android.tools.build:gradle:')) {
          const gradlePluginPattern = /com\.android\.tools\.build:gradle:[0-9.]+/g;
          if (gradlePluginPattern.test(content)) {
            console.log(`Found Android Gradle plugin in ${pluginPath}, checking version...`);
            
            // Only back up if we haven't yet
            if (!fs.existsSync(`${pluginPath}.bak`)) {
              fs.writeFileSync(`${pluginPath}.bak`, content);
            }
            
            // Update to a compatible version if needed
            const currentVersion = content.match(gradlePluginPattern)[0];
            if (currentVersion.split(':')[2] < '7.4.2') {
              needsPatching = true;
              newContent = newContent.replace(
                currentVersion,
                'com.android.tools.build:gradle:7.4.2'
              );
              console.log(`Updated Android Gradle plugin from ${currentVersion} to com.android.tools.build:gradle:7.4.2`);
            }
          }
        }

        // Write changes if needed
        if (needsPatching) {
          fs.writeFileSync(pluginPath, newContent);
          patchedFiles.push(pluginPath);
          foundPlugin = true;
        } else {
          console.log(`No issues found in ${pluginPath}, skipping patch.`);
        }
      } catch (error) {
        console.error(`Error processing ${pluginPath}: ${error.message}`);
      }
    }
  }

  return { foundPlugin, patchedFiles };
}

// Create basic gradle.properties file if it doesn't exist
function createGradleProperties() {
  const gradlePropsPath = path.join(process.cwd(), 'android', 'gradle.properties');
  const directory = path.dirname(gradlePropsPath);
  
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Creating directory: ${directory}`);
      fs.mkdirSync(directory, { recursive: true });
    }
    
    if (!fs.existsSync(gradlePropsPath)) {
      console.log('Creating basic gradle.properties file...');
      const content = `
# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
org.gradle.configureondemand=false
org.gradle.configuration-cache=false
android.nonTransitiveRClass=false
android.nonFinalResIds=false
`;
      fs.writeFileSync(gradlePropsPath, content);
      console.log('Created gradle.properties file successfully.');
    } else {
      console.log('gradle.properties already exists, checking configuration...');
      let content = fs.readFileSync(gradlePropsPath, 'utf8');
      let modified = false;
      
      // Ensure configuration cache is disabled
      if (!content.includes('org.gradle.configuration-cache=false')) {
        content += '\norg.gradle.configuration-cache=false';
        modified = true;
      }
      
      // Ensure Android R class generation is compatible
      if (!content.includes('android.nonTransitiveRClass=false')) {
        content += '\nandroid.nonTransitiveRClass=false';
        modified = true;
      }
      
      if (!content.includes('android.nonFinalResIds=false')) {
        content += '\nandroid.nonFinalResIds=false';
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(gradlePropsPath, content);
        console.log('Updated gradle.properties with compatible settings.');
      }
    }
  } catch (error) {
    console.error(`Error creating gradle.properties: ${error.message}`);
  }
}

try {
  console.log('Starting enhanced Gradle plugin patch process...');
  const { foundPlugin, patchedFiles } = patchGradlePlugin();
  
  if (foundPlugin) {
    console.log('Successfully patched the following files:');
    patchedFiles.forEach(file => console.log(` - ${file}`));
  } else {
    console.log('No React Native Gradle plugin files needed patching or they were not found.');
    console.log('Continuing with configuration setup...');
  }
  
  // Create/update gradle.properties for better compatibility
  createGradleProperties();
  
  console.log('Patch process completed.');
} catch (err) {
  console.error('Error in patch script:', err);
}
