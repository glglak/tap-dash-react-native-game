# Tap Dash React Native Game

A simple and addictive endless runner game where you tap to jump over obstacles. Built with React Native and Expo.

## Building for Android Without Java

You have multiple options for building Android app bundles (.aab) or APK files without installing Java or the Android SDK locally.

### Option 1: EAS Build with Google Play Profile (Recommended)

This option uses a special build profile configured specifically for Google Play submission with Gradle 8.3:

```bash
# Login to your Expo account first
npx eas-cli login

# Build AAB file for Google Play with Gradle 8.3
npm run build:googleplay
```

### Option 2: Standard EAS Build 

Use Expo's cloud build service with standard profiles:

```bash
# For internal testing (APK)
npm run build:preview

# For Google Play submission (AAB)
npm run build
```

### Option 3: Docker-based Build (Requires Docker)

If you have Docker installed and running:

```bash
# Build AAB file for Google Play submission
npm run build:docker

# Or build APK file for direct installation
npm run build:docker-apk
```

## Troubleshooting

If you encounter build issues:

1. **Try the Google Play specific build**: `npm run build:googleplay`
2. **Check Expo SDK compatibility**: This project uses Expo SDK 52 with React Native 0.73.4
3. **Target SDK version**: The app is configured for Android 34 as required by Google Play
4. **Clean gradle**: Try `cd android && ./gradlew clean` if you have Java installed
5. **Update dependencies**: Run `npm install` to ensure dependencies are up to date

## Common Build Errors

- **Gradle plugin errors**: The patching script in this repo fixes most Gradle compatibility issues
- **Concurrency limits**: EAS Build sometimes has a queue, especially on free tier accounts
- **Missing Java**: Local builds require Java, use EAS Build (Option 1 or 2) to avoid this
- **Docker errors**: Make sure Docker Desktop is running before using Option 3

## Development

To start the development server:

```bash
npm start
```

## File Structure

- `App.js` - Main entry point of the application
- `components/` - Game UI components
- `game/` - Game logic and physics engine integration
- `assets/` - Images, sounds, and other static files
