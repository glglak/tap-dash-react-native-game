# Tap Dash React Native Game

A simple and addictive endless runner game where you tap to jump over obstacles.

## Fixed Issues

Recent fixes have addressed:
- Added missing `index.js` file to register the main component
- Created missing game systems (Physics, ObstacleGenerator, DifficultySystem)
- Implemented proper entity setup and initialization
- Fixed "main has not been registered" error that was preventing the game from running

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

2. Start the development server:
```
npx expo start
```

3. Run on simulator or device:
   - Press `i` for iOS simulator
   - Press `a` for Android simulator
   - Scan QR code with Expo Go app for physical device

## Troubleshooting

If you encounter the "Uncaught Error: main has not been registered" error:
1. Make sure the Metro bundler is running
2. Try restarting the development server with `npx expo start --clear`
3. If the error persists, delete the node_modules folder and reinstall dependencies

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
