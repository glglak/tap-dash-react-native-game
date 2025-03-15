#!/bin/bash

# This script directly edits the React Native Gradle plugin to fix the serviceOf error
# It should be run during EAS build process

echo "Attempting to fix React Native Gradle plugin..."

# Define the path to the problematic file
RN_GRADLE_PLUGIN_PATH="/home/expo/workingdir/build/node_modules/@react-native/gradle-plugin/build.gradle.kts"

# Wait for the file to exist (it might not be available immediately)
MAX_ATTEMPTS=10
ATTEMPT=1
while [ ! -f "$RN_GRADLE_PLUGIN_PATH" ] && [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "Attempt $ATTEMPT: Waiting for React Native Gradle plugin file to be available..."
  sleep 10
  ATTEMPT=$((ATTEMPT + 1))
done

if [ ! -f "$RN_GRADLE_PLUGIN_PATH" ]; then
  echo "ERROR: React Native Gradle plugin file not found after $MAX_ATTEMPTS attempts."
  exit 1
fi

echo "Found React Native Gradle plugin at: $RN_GRADLE_PLUGIN_PATH"

# Create backup of the original file
cp "$RN_GRADLE_PLUGIN_PATH" "${RN_GRADLE_PLUGIN_PATH}.bak"
echo "Created backup at: ${RN_GRADLE_PLUGIN_PATH}.bak"

# Use sed to comment out the import line for serviceOf
sed -i 's/import org.gradle.configurationcache.extensions.serviceOf/\/\/ import org.gradle.configurationcache.extensions.serviceOf/' "$RN_GRADLE_PLUGIN_PATH"

# Use sed to replace the serviceOf call with an alternative approach
sed -i 's/serviceOf<ModuleRegistry>()/project.gradle.sharedServices.registrations.findByName("moduleRegistry")?.service ?: throw GradleException("ModuleRegistry service not found")/' "$RN_GRADLE_PLUGIN_PATH"

echo "Successfully patched React Native Gradle plugin!"

# Create android directory and required files if they don't exist
mkdir -p android/gradle/wrapper
echo "Created android directory structure"

# Create gradle.properties with configuration cache disabled
cat > android/gradle.properties << 'EOL'
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
EOL
echo "Created gradle.properties with configuration cache disabled"

# Create gradle-wrapper.properties with specific Gradle version
cat > android/gradle/wrapper/gradle-wrapper.properties << 'EOL'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.3-all.zip
networkTimeout=10000
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOL
echo "Created gradle-wrapper.properties with Gradle 8.3"

echo "Gradle configuration completed!"
