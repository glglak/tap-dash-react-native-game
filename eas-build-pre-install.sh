#!/bin/bash

# This script runs before installing dependencies on EAS Build
echo "Running EAS Build pre-install script..."

# Create android directory if it doesn't exist
mkdir -p android/gradle/wrapper

# Create gradle.properties
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

# Create gradle-wrapper.properties
cat > android/gradle/wrapper/gradle-wrapper.properties << 'EOL'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.3-all.zip
networkTimeout=10000
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOL

echo "Pre-install script completed!"
