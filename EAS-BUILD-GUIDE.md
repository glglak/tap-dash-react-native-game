# EAS Build Guide for Tap Dash Game

This guide will help you build your Android app bundle (.aab) or APK file using Expo's cloud-based EAS Build service. This method requires no local Java or Android SDK installation.

## Prerequisites

1. An Expo account (free to create)
2. Node.js installed on your computer

## Step 1: Login to Expo

```bash
npx eas-cli login
```

- Enter your Expo username and password when prompted.
- If you don't have an account, you can create one at https://expo.dev/signup

## Step 2: Verify and update configurations

Your configurations are already set up correctly in:
- `app.json`: Android SDK 34 is configured
- `eas.json`: Build profiles are defined
- `package.json`: Build scripts are available

## Step 3: Build the app

### For testing (generates APK file)

```bash
npm run build:preview
```

This creates an APK that can be directly installed on Android devices for testing.

### For Google Play submission (generates AAB file)

```bash
npm run build
```

This creates an Android App Bundle, which is required for Google Play submission.

## What happens during the build?

1. Your code is securely uploaded to Expo's build servers
2. A build environment with all required dependencies is provisioned
3. Your app is compiled against Android SDK 34
4. Once completed, you'll receive a URL to download the finished build

## Troubleshooting Common Issues

### Authentication errors
- Ensure you're logged in with `npx eas-cli login`
- Verify your Expo account has access to this project

### Build failures
- Check the build logs provided by EAS for specific errors
- Ensure your package.json dependencies are compatible with Expo SDK 52
- Make sure Android SDK 34 configurations are correct in app.json

### "Command not found" errors
- Make sure eas-cli is installed: `npm install -g eas-cli`
- Or use the version installed in the project: `npx eas-cli`

## Additional Options

### Building with specific options

```bash
# Force a clean build (recommended for dependency changes)
npx eas-cli build --platform android --profile production --clear-cache

# Build and submit directly to Google Play
npx eas-cli build --platform android --profile production --auto-submit
```

## Need More Help?

- Expo Documentation: https://docs.expo.dev/build/introduction/
- EAS CLI Reference: https://docs.expo.dev/eas-update/eas-cli/
