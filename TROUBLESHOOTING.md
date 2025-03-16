# Troubleshooting Android Builds

If you're having issues building the Android app, here are some common problems and solutions.

## Java Compilation Errors

If you encounter Java compilation errors, the most reliable approach is to rebuild everything from scratch using our fresh build script:

```bash
npm run build:fresh
```

This script:
1. Deletes the existing Android directory
2. Runs `expo prebuild` to generate fresh native code
3. Adds necessary compatibility flags
4. Builds the app with the correct configuration

## Common Errors and Solutions

### "Plugin [id: 'com.facebook.react.settings'] was not found"

This error indicates incompatibilities with the React Native Gradle plugin. Our solution:
- Use the `build:fresh` script to completely regenerate the native code
- This avoids any issues with the existing configuration

### "Could not find method allprojects()"

This happens when `allprojects` is incorrectly used in a settings.gradle file. Our solution:
- Properly separate build.gradle and settings.gradle configurations
- Move project-wide repositories into the correct place

### "Compilation failed; see the compiler error output"

This error can have many causes. If it occurs:
1. Try the `build:fresh` script which regenerates all native code
2. If that fails, check if the error contains more specific information

### "JAVA_HOME is not set"

This means Java isn't properly configured:
1. Install Java from https://adoptium.net/
2. Our scripts will automatically detect Java in common installation locations
3. Or set JAVA_HOME manually to your Java installation

## Build Options

We provide multiple build scripts for different scenarios:

| Command | Description |
|---------|-------------|
| `npm run build:fresh` | Regenerates all native code and builds an AAB file |
| `npm run build:fresh-apk` | Same as above but builds an APK file |
| `npm run build:windows` | Uses the existing native code, may encounter errors |
| `npm run build` | Uses Expo cloud builds (requires quota) |

## Last Resort: EAS Build

If all else fails and local builds don't work, you can use Expo's cloud building service:

```bash
npm run build:googleplay
```

This requires an Expo account and uses your build quota.
