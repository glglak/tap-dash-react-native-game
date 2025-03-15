# Tap Dash React Native Game

A simple and addictive endless runner game where you tap to jump over obstacles.

## Fixed Issues

Recent fixes have addressed:
- Fixed package version mismatches (expo-haptics and expo-sharing were for Expo SDK 50 but we're using SDK 49)
- Added proper `index.js` that registers the main component
- Resolved issues with Expo native modules
- Implemented inline game systems to reduce import complexity
- Added proper babel and metro configuration

## Game Features

- Simple tap controls
- Double jump mechanics
- Progressive difficulty
- High score tracking
- Sound effects and background music
- Haptic feedback

## How to Play

- Tap to jump over obstacles
- Hold for a higher jump
- Double tap for a double jump
- Every 5 points gives a special bonus!

## Development Setup

1. Install dependencies:
```
npm install
```

2. Clean your development environment:
```
rm -rf node_modules
npm cache clean --force
npm install
```

3. Start the development server with a clean slate:
```
npx expo start --clear
```

4. Run on simulator or device:
   - Press `i` for iOS simulator
   - Press `a` for Android simulator
   - Scan QR code with Expo Go app for physical device

## Troubleshooting

### If you encounter the "requireOptionalNativeModule is not a function" error:

This is typically caused by incompatible package versions with your Expo SDK. This project uses Expo SDK 49 and requires these specific versions:

```
"expo-haptics": "~12.4.0",
"expo-sharing": "~11.5.0",
```

If you're upgrading or changing packages, make sure they're compatible with your Expo SDK version.

### For general "main has not been registered" errors:

1. **Complete Reset** (Most Effective):
   ```
   rm -rf node_modules/
   npm cache clean --force
   npm install
   npx expo start --clear
   ```

2. **Delete Metro Cache**:
   ```
   rm -rf $TMPDIR/metro-*
   ```

3. **Make sure you're in the correct directory**:
   Verify you're running the Metro bundler from the project's root directory.

4. **Reinstall Expo CLI**:
   ```
   npm uninstall -g expo-cli
   npm install -g expo-cli
   ```

## Assets

Place sound files in `assets/sounds/` directory:
- background.mp3
- jump.mp3
- score.mp3
- game-over.mp3
- milestone5.mp3

## Technologies Used

- React Native
- Expo SDK 49
- React Native Game Engine
