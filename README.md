# Tap Dash Game

A simple and addictive endless runner game where you tap to jump over obstacles.

## Project Setup

### Prerequisites

- Node.js (LTS version)
- JDK 21 (recommend: Eclipse Adoptium)
- Android Studio with Android SDK 34 installed
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/glglak/tap-dash-react-native-game.git
   cd tap-dash-react-native-game
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Prebuild the Android project
   ```
   npm run prebuild
   ```

## Development

### Starting the development server

```
npm start
```

### Running on Android device/emulator

```
npm run android
```

## Building the App

### Local Builds

We have several options for building the app locally:

1. **Recommended: Quick Gradle Build (APK)**
   ```
   npm run gradle:apk
   ```
   Result will be at: `android/app/build/outputs/apk/release/app-release.apk`

2. **Recommended: Quick Gradle Build (AAB for Play Store)**
   ```
   npm run gradle:bundle
   ```
   Result will be at: `android/app/build/outputs/bundle/release/app-release.aab`

3. **Alternative: Fresh Build**
   Completely regenerates the Android project and builds it.
   ```
   npm run build:fresh
   ```

4. **Alternative: Minimal Build**
   A simpler, more direct build approach.
   ```
   npm run build:minimal
   ```

### Expo EAS Builds (Cloud)

For building in the cloud with Expo's build service:

1. **Preview Build (for testing)**
   ```
   npm run build:preview
   ```

2. **Production Build (for Play Store)**
   ```
   npm run build:production
   ```

## Maintenance and Troubleshooting

### Cleaning the project

To clean up all build artifacts and temporary files:

```
npm run clean
```

### JDK Configuration

The build scripts expect JDK to be installed at:
```
C:\Program Files\Eclipse Adoptium\jdk-21.0.6.7-hotspot
```

If your JDK is installed elsewhere, please update the path in these files:
- `gradle-build.bat`
- `fresh-build.bat`
- `cleanup.bat`

### Common Build Issues

1. **Resource busy or locked**
   - Run the cleanup script: `npm run clean`
   - Close any applications that might be using project files

2. **Compilation errors**
   - Make sure you have Android SDK 34 installed
   - Run `npm run prebuild` to regenerate the Android project

3. **Gradle errors**
   - Try cleaning Gradle: `npm run clean:gradle`
   - Try the more verbose Gradle build: `cd android && ./gradlew assembleRelease --info --stacktrace`

## Project Structure

- `/android` - Native Android code (generated by Expo)
- `/assets` - Game assets (images, sounds)
- `/components` - React components for the game
- `/src` - Source code
  - `/contexts` - React contexts for game state management

## License

This project is private and confidential.

## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue or email.

### Git Workflow

1. Create a feature branch
2. Make your changes
3. Test your changes
4. Submit a pull request

Always run the cleanup script before committing to avoid including build artifacts in your commits.
