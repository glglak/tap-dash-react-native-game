# Tap Dash React Native Game

A simple and addictive endless runner game where you tap to jump over obstacles. Built with React Native and Expo.

## Building for Android Without Java

You have two options for building Android app bundles (.aab) or APK files without installing Java or the Android SDK locally.

### Option 1: EAS Build (Cloud-based)

Use Expo's cloud build service to create your app bundle:

```bash
# Login to your Expo account first
npx eas-cli login

# For internal testing (APK)
npm run build:preview

# For Google Play submission (AAB)
npm run build
```

This will build your app in Expo's cloud and provide a download link when complete.

### Option 2: Docker-based Build (Local)

If you have Docker installed, you can build locally without Java:

```bash
# Make sure Docker is running first

# Build AAB file for Google Play submission
npm run build:docker

# Or build APK file for direct installation
npm run build:docker-apk
```

This uses a Docker container with the Android SDK pre-installed.

## Troubleshooting

If you encounter build issues:

1. **Check Expo SDK compatibility**: This project uses Expo SDK 52 with React Native 0.73.4
2. **Target SDK version**: The app is configured for Android 34 as required by Google Play
3. **Clean gradle**: Try `cd android && ./gradlew clean` if you have Java installed
4. **Update dependencies**: Run `npm install` to ensure dependencies are up to date

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

## Notes

- The game uses Matter.js for physics
- Sounds are managed with Expo AV
- React Native Game Engine orchestrates game updates
