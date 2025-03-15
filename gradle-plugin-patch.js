// gradle-plugin-patch.js
// This script will attempt to modify the React Native Gradle plugin
// to work with newer Gradle versions by patching the serviceOf method

const fs = require('fs');
const path = require('path');

const PLUGIN_PATHS = [
  // EAS build environment
  '/home/expo/workingdir/build/node_modules/@react-native/gradle-plugin/build.gradle.kts',
  // Local development
  path.join(process.cwd(), 'node_modules', '@react-native', 'gradle-plugin', 'build.gradle.kts')
];

function patchGradlePlugin() {
  let foundPlugin = false;
  let pluginPath = '';

  for (const path of PLUGIN_PATHS) {
    if (fs.existsSync(path)) {
      foundPlugin = true;
      pluginPath = path;
      break;
    }
  }

  if (!foundPlugin) {
    console.log("React Native Gradle plugin not found. It may not be installed yet.");
    return;
  }

  console.log(`Found Gradle plugin at: ${pluginPath}`);

  try {
    // Read the content
    const content = fs.readFileSync(pluginPath, 'utf8');

    // Check if it contains the problematic import
    if (content.includes('import org.gradle.configurationcache.extensions.serviceOf')) {
      console.log('Found serviceOf import, patching...');

      // Create a backup first
      fs.writeFileSync(`${pluginPath}.bak`, content);

      // Replace the problematic code
      let newContent = content;
      
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

      // Write the modified content back
      fs.writeFileSync(pluginPath, newContent);
      console.log('Successfully patched the Gradle plugin!');
    } else {
      console.log('No serviceOf import found, no need to patch.');
    }
  } catch (error) {
    console.error(`Error patching Gradle plugin: ${error.message}`);
  }
}

try {
  console.log('Starting Gradle plugin patch process...');
  patchGradlePlugin();
  console.log('Patch process completed.');
} catch (err) {
  console.error('Error in patch script:', err);
}
