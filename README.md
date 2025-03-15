# Tap Dash React Native Game

A simple and addictive endless runner game where you tap to jump over obstacles.

## Fixed Issues

Recent fixes have addressed:
- Added proper `index.js` that registers the main component directly using AppRegistry
- Fixed "main has not been registered" error by ensuring correct component registration
- Resolved issues with Expo native modules by simplifying code structure
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
npm install
npm cache clean --force
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

### If you encounter the "Uncaught Error: main has not been registered" error:

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

5. **Fix Expo Dependencies**:
   ```
   npx expo install --fix
   ```

6. **Restart Your Device/Simulator**:
   Sometimes a clean restart of your test device can resolve caching issues.

## Additional Debug Information

If you're still having issues, check:
1. The Metro bundler logs for specific module errors
2. Make sure your bundle identifier in app.json matches your project
3. Verify all native dependencies are properly linked

## Assets

Place sound files in `assets/sounds/` directory:
- background.mp3
- jump.mp3
- score.mp3
- game-over.mp3
- milestone5.mp3

## Technologies Used

- React Native
- Expo
- React Native Game Engine
