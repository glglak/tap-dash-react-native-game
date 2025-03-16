# Troubleshooting Android Builds

If you're having issues building the Android app, here are some common problems and solutions.

## Recommended Approach: Use EAS Build

If you're encountering persistent Java/Gradle compilation errors, the most reliable approach is to use our simple EAS build script that builds in the cloud:

```bash
npm run build:simple
```

This script:
1. Checks your Expo CLI installation
2. Creates a simple eas.json configuration
3. Logs you into your Expo account
4. Provides options to build either an APK or AAB file
5. Uses Expo's cloud infrastructure for building

You will receive a URL to download the built app when it's complete.

## Java Compilation Errors

If you want to try building locally and encounter Java compilation errors, you could try:

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
- Use the `build:simple` script which avoids this issue entirely
- Or use `build:fresh` to regenerate native code

### "Could not find method allprojects()"

This happens when `allprojects` is incorrectly used in a settings.gradle file. Our solution:
- Use the `build:simple` script to avoid any local build issues

### "Execution failed for task ':gradle-plugin:compileJava'"

This error indicates issues with the React Native Gradle plugin compilation:
1. Use the `build:simple` script which builds in the cloud
2. This avoids all local Java compilation issues

### "JAVA_HOME is not set"

This means Java isn't properly configured:
1. Install Java from https://adoptium.net/
2. Our scripts will automatically detect Java in common installation locations
3. Or use the `build:simple` script which doesn't require local Java

## Build Options

We provide multiple build scripts for different scenarios:

| Command | Description |
|---------|-------------|
| `npm run build:simple` | **RECOMMENDED**: Uses Expo EAS cloud build (interactive) |
| `npm run build:fresh` | Regenerates native code and builds locally (may fail) |
| `npm run build:windows` | Uses existing native code (most likely to fail) |
| `npm run build` | Uses Expo cloud builds (non-interactive, requires quota) |

## Using EAS Build

The Expo Application Services (EAS) build platform is the most reliable way to build your app:

1. Create a free Expo account at https://expo.dev/signup
2. Run `npm run build:simple` and follow the prompts
3. When the build completes, you'll get a download link

This approach bypasses all local environment issues.
