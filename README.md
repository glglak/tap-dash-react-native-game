# Tap Dash Game

A simple and addictive endless runner game where you tap to jump over obstacles.

## Building the Game

There are several ways to build this app. Choose the method that works best for you:

### Option 1: Use the Simplified Build Script (Recommended)

```bash
# Install dependencies first
npm install

# Run the build script (for production build)
npm run build

# For a preview build (APK for testing)
npm run build:preview

# For a development build
npm run build:dev
```

### Option 2: Direct EAS Commands

If you prefer to use EAS commands directly:

```bash
# Make sure you have the right EAS CLI version
npm install

# Then run the build
npx eas-cli build --platform android --profile production --clear-cache
```

### Troubleshooting Build Issues

If you encounter errors:

1. **Clean your environment**:
   ```bash
   npm run clean
   ```

2. **Make sure gradlew is executable**:
   ```bash
   npm run prepare-gradlew
   ```

3. **Try with a specific EAS CLI version**:
   ```bash
   npm install --save-dev eas-cli@3.13.3
   ```

4. **Use a minimal EAS configuration**:
   If you're still seeing errors with `eas.json`, try:
   ```bash
   npx eas-cli build --platform android
   ```

## Running the Game Locally

To run the game in development mode:

```bash
npm start
```

This will start the Expo development server, allowing you to run the app on a connected device or emulator.

## Technology Stack

- React Native
- Expo
- Matter.js (Physics)
- React Native Game Engine

## Gameplay

Tap to make your character jump over obstacles. See how far you can go!

## Credits

Game created by glglak.
