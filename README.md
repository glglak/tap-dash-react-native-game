# Tap Dash React Native Game

A simple and addictive endless runner game where you tap to jump over obstacles. Built with React Native and Expo.

## Building for Android

### Local Build (With Java/JDK)

If you have Java installed (via Adoptium/Eclipse Temurin or any JDK):

```bash
# Build AAB file for Google Play
npm run build:local

# Build APK file for direct installation
npm run build:local-apk
```

This uses your local Java installation and doesn't count against EAS build quota.

### Cloud-Based Options

#### Option 1: EAS Build with Google Play Profile

This option uses Expo's cloud build service (requires EAS build quota):

```bash
# Login to your Expo account first
npx eas-cli login

# Build AAB file for Google Play with Gradle 8.3
npm run build:googleplay
```

#### Option 2: Standard EAS Build 

Use Expo's cloud build service with standard profiles:

```bash
# For internal testing (APK)
npm run build:preview

# For Google Play submission (AAB)
npm run build
```

## Android SDK Requirements

- Target SDK Version: 34 (Required by Google Play)
- Compile SDK Version: 34
- Min SDK Version: 21

## Troubleshooting

If you encounter build issues:

1. **Verify Java installation**: Make sure JAVA_HOME is set in your environment 
2. **Gradle errors**: The patch script should fix common compatibility issues
3. **EAS Build quota**: Free tier has limited builds per month
4. **Missing files**: Check the exact output path shown in the console

## Development

To start the development server:

```bash
npm start
```

## Technical Notes

- This project uses Expo SDK 52 with React Native 0.73.4
- The app has been configured to support Android SDK 34 as required by Google Play
- We've created a patch for the React Native Gradle plugin to ensure compatibility
- For local builds, we use a custom script that handles common compatibility issues
