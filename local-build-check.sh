#!/bin/bash
# Script to check local environment and validate Gradle setup

echo "==== Checking Environment Versions ===="
echo ""

# Check Node.js version
echo "Node.js version:"
node -v

# Check npm version
echo "npm version:"
npm -v

# Check Expo CLI version
echo "Expo CLI version:"
npx expo --version

# Check EAS CLI version
echo "EAS CLI version:"
npx eas-cli --version

echo ""
echo "==== Checking Project Configuration ===="
echo ""

# Check package.json expo version
echo "Project Expo SDK version:"
grep -m 1 '"expo":' package.json

# Check if Android directory exists
if [ -d "android" ]; then
  echo "Android directory: EXISTS"
else
  echo "Android directory: MISSING (Run 'npx expo prebuild --platform android')"
fi

# Check if gradlew exists
if [ -f "android/gradlew" ]; then
  echo "gradlew file: EXISTS"
  
  # Check if gradlew is executable
  if [ -x "android/gradlew" ]; then
    echo "gradlew is executable: YES"
  else
    echo "gradlew is executable: NO (Run 'chmod +x android/gradlew')"
  fi
  
  # Check gradlew version
  echo ""
  echo "Gradle version:"
  cd android && ./gradlew --version | grep "Gradle " | head -n 1 && cd ..
else
  echo "gradlew file: MISSING (Run 'npx expo prebuild --platform android')"
fi

echo ""
echo "==== Recommended Commands ===="
echo ""
echo "To update Expo CLI:"
echo "npm install -g expo-cli@latest"
echo ""
echo "To update EAS CLI:"
echo "npm install -g eas-cli@latest"
echo ""
echo "To generate Android files:"
echo "npx expo prebuild --platform android"
echo ""
echo "To make gradlew executable:"
echo "chmod +x android/gradlew"
echo ""
echo "To build locally (APK):"
echo "cd android && ./gradlew assembleRelease"
echo ""
echo "To build locally (AAB):"
echo "cd android && ./gradlew bundleRelease"
