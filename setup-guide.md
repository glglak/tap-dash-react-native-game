# Tap Dash Game - Setup Guide

This guide will help you set up and build the Tap Dash game using EAS (Expo Application Services), which is more reliable than manual building.

## Prerequisites

1. Node.js (LTS version recommended)
2. Yarn or npm
3. Expo CLI
4. EAS CLI

## Installation Steps

### 1. Install the required tools

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account (create one if you don't have it)
eas login
```

### 2. Clone and set up the repository

```bash
# Clone the repository
git clone https://github.com/glglak/tap-dash-react-native-game.git
cd tap-dash-react-native-game

# Install dependencies
yarn install
# or if using npm
npm install
```

### 3. Configure development build

To develop and test locally, you'll need a development build:

```bash
# Configure your development build
eas build:configure
```

## Building the App

### For Local Testing (Development Build)

```bash
# Create a development build for Android
eas build --profile development --platform android
```

Once the build completes, you'll receive a link to download the APK file.

### For Internal Distribution (Preview)

```bash
# Create a preview build
eas build --profile preview --platform android
```

This will create an APK that you can share with others for testing.

### For Production

```bash
# Create a production build
eas build --profile production --platform android
```

This creates an AAB file for Google Play Store submission.

## Common Issues and Solutions

### 1. Gradle Version Issues

The repository includes a `gradle-plugin-patch.js` script that runs on postinstall to fix common Gradle issues. If you're still facing Gradle problems, try:

```bash
# Update the patch script manually
node ./gradle-plugin-patch.js

# Make gradlew executable if needed
chmod +x ./android/gradlew
```

### 2. No Such File or Directory Errors

These are often related to missing Android build files. Instead of building locally, use EAS:

```bash
# For Android
eas build --platform android --profile preview

# For iOS (requires Mac)
eas build --platform ios --profile preview
```

### 3. Expo SDK Version Compatibility

This project uses Expo SDK 52. Make sure your Expo CLI is up to date:

```bash
npm install -g expo-cli@latest
npm install -g eas-cli@latest
```

## Developing

Start the development server:

```bash
npx expo start
```

For a local development build that works with the development server:

```bash
eas build --profile development --platform android
```

Install the resulting app on your device, then connect to your development server.
