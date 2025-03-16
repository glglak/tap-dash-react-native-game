# Local Building Approach for Tap Dash Game

After reviewing GitHub issue [#973 in expo/eas-cli](https://github.com/expo/eas-cli/issues/973), it's clear you're experiencing the same issue where EAS Build can't find the Android build files. This happens because of how EAS Build handles projects and the fact that the Android native code hasn't been properly generated or included.

## Understanding the Issue

The error `ENOENT: no such file or directory, open '/home/expo/workingdir/build/android/gradlew'` is a classic symptom of a project where:

1. The native Android code was never generated with `npx expo prebuild`
2. OR the native code exists locally but isn't being uploaded to the EAS build environment

## Solution: Build Locally Instead

Since EAS Build is causing problems, the most reliable approach is to build the app locally. Here's how:

### Step 1: Generate Native Code

```bash
# Clean your environment first
rm -rf node_modules
npm install

# Generate the Android native code
npx expo prebuild --platform android
```

### Step 2: Use our provided build-android.bat script (on Windows)

The `build-android.bat` script we added to your repository will handle all the build steps:

1. Run the script by double-clicking it or from the command line:
   ```
   build-android.bat
   ```

2. Choose option 2 for a Release APK or option 3 for an AAB bundle

### Step 3: Find your built files

The output files will be in:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Why This Is Better Than EAS Build

1. **Direct Control**: You have direct control over the build process
2. **Faster Iterations**: No waiting for EAS cloud builds
3. **Easier Debugging**: You can see exactly what's happening during the build
4. **No Upload Issues**: You avoid the issues with EAS trying to find files in the wrong locations

## Common Issues & Solutions

### If gradlew fails with permission issues:

On Windows:
```
attrib -R android\gradlew
```

On Mac/Linux:
```
chmod +x android/gradlew
```

### If you get Java errors:

Make sure you have JDK 11 or 17 installed and your JAVA_HOME environment variable is set correctly.

### If you get SDK location errors:

Create a `android/local.properties` file with:
```
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```
(Adjust the path to match your Android SDK location)

## Conclusion

Building locally gives you more control and fewer surprises. The scripts we've added to your repository should make this process much easier.
