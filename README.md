# Tap Dash React Native Game

A simple and addictive endless runner game where you tap to jump over obstacles. Built with React Native and Expo.

## Building for Android Without Java

You have multiple options for building Android app bundles (.aab) or APK files without installing Java or the Android SDK locally.

### Option 1: GitHub Actions - Release Method (Recommended)

The simplest option that doesn't require EAS build quota or local setup:

1. Go to your GitHub repository: https://github.com/glglak/tap-dash-react-native-game
2. Click on the "Actions" tab
3. Select the "Basic Android Build" workflow
4. Click "Run workflow" and select your build type (aab or apk)
5. Wait for the build to complete (typically 5-10 minutes)
6. Go to the "Releases" section of your repository
7. Find the latest release and download your app file

This approach creates an official GitHub Release for each build, making it easy to download and track versions.

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

## Troubleshooting

If you encounter build issues:

1. **Try the GitHub Actions build**: This runs in GitHub's cloud and doesn't require local setup
2. **Check Expo SDK compatibility**: This project uses Expo SDK 52 with React Native 0.73.4
3. **Target SDK version**: The app is configured for Android 34 as required by Google Play
4. **EAS Build quota**: Free tier has limited builds per month
5. **Build downloads**: Built files are available in GitHub Releases

## Development

To start the development server:

```bash
npm start
```

## GitHub Actions Build Notes

The GitHub Actions workflow:
1. Sets up a clean Linux environment with Java 11 and Node.js 16
2. Installs all dependencies
3. Runs the Gradle patch to fix compatibility issues
4. Creates a debug keystore for signing the app
5. Builds the app in the specified format (AAB or APK)
6. Creates a GitHub Release with the build file attached

No local setup required - everything happens in GitHub's cloud environment.
