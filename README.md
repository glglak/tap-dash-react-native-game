# Tap Dash Game

A simple and addictive endless runner game where you tap to jump over obstacles.

## Important Build Instructions

### First Time Setup 

Before building for the first time:

```bash
# Make sure you have the latest CLI tools
npm install -g expo-cli@latest
npm install -g eas-cli@latest

# Install dependencies
npm install

# Generate Android native code (critical step!)
npx expo prebuild --platform android

# Make gradlew executable
chmod +x android/gradlew  # Linux/Mac
# or
attrib -R android\gradlew  # Windows
```

### Building Options

#### Option 1: Build locally (recommended)

Use the included scripts to build locally:

**Linux/Mac:**
```bash
# Make the script executable
chmod +x local-build-check.sh
./local-build-check.sh
```

**Windows:**
```
local-build.bat
```

These scripts guide you through the build process and create:
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`
- App Bundle: `android/app/build/outputs/bundle/release/app-release.aab`

#### Option 2: Build with EAS (requires Expo account)

```bash
# Make sure prebuild is done first!
npx expo prebuild --platform android

# Then use EAS Build
npx eas-cli build --platform android --profile preview
# or
npx eas-cli build --platform android --profile production
```

### Troubleshooting

If you get `no such file or directory, open '/home/expo/workingdir/build/android/gradlew'` error:
1. Make sure you ran `npx expo prebuild --platform android` first
2. Try building locally instead of with EAS
3. Check your environment with `./local-build-check.sh`

## Running the Game

```bash
npm start
```

## Technology Stack

- React Native
- Expo
- Matter.js (Physics)
- React Native Game Engine

## Gameplay

Tap to make your character jump over obstacles. See how far you can go!
