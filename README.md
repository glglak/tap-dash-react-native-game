# Tap Dash React Native Game

A simple and addictive endless runner game where you tap to jump over obstacles. Built with React Native and Expo.

## Building for Android Without Java

You have multiple options for building Android app bundles (.aab) or APK files without installing Java or the Android SDK locally.

### Option 1: GitHub Actions (Recommended for Free)

The simplest option that doesn't require EAS build quota or local setup:

1. Go to your GitHub repository: https://github.com/glglak/tap-dash-react-native-game
2. Click on the "Actions" tab
3. Select the "Build Android App" workflow
4. Click "Run workflow" and select your build type (aab or apk)
5. Wait for the build to complete (typically 5-10 minutes)
6. Download your build artifacts

This option is completely free and runs in GitHub's cloud.

### Option 2: EAS Build with Google Play Profile

This option uses Expo's cloud build service (requires EAS build quota):

```bash
# Login to your Expo account first
npx eas-cli login

# Build AAB file for Google Play with Gradle 8.3
npm run build:googleplay
```

### Option 3: Standard EAS Build 

Use Expo's cloud build service with standard profiles:

```bash
# For internal testing (APK)
npm run build:preview

# For Google Play submission (AAB)
npm run build
```

### Option 4: Docker-based Build (Requires Docker)

If you have Docker properly configured:

```bash
# Build AAB file for Google Play submission
npm run build:docker

# Or build APK file for direct installation
npm run build:docker-apk
```

## Troubleshooting

If you encounter build issues:

1. **Try the GitHub Actions build**: This runs in GitHub's cloud and doesn't require local setup
2. **Check Expo SDK compatibility**: This project uses Expo SDK 52 with React Native 0.73.4
3. **Target SDK version**: The app is configured for Android 34 as required by Google Play
4. **EAS Build quota**: Free tier has limited builds per month
5. **Docker errors**: Requires WSL2 and virtualization to be properly configured

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
