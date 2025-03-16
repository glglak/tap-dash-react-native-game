# Tap Dash React Native Game

A simple and addictive endless runner game where you tap to jump over obstacles.

## Building for Android without Java

### Option 1: EAS Build (Recommended)

To build your app using Expo's cloud build service (no local Java/Android SDK needed):

```bash
# Login to your Expo account first (create one if needed)
npx eas-cli login

# For internal testing (generates APK file)
npx eas build --platform android --profile preview

# For Google Play submission (generates AAB file)
npx eas build --platform android --profile production
```

This will build your app in Expo's cloud and provide a download link when complete.

### Option 2: Expo Application Services (EAS) Submit

To build AND submit directly to Google Play:

```bash
# Build and submit to Google Play internal testing track
npx eas build --platform android --profile production --auto-submit
```

Note: Requires a Google Play service account configured in your project.