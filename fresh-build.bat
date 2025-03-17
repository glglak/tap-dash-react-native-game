@echo off
echo ========================================
echo  Fresh Android Build with Expo CLI
echo ========================================

REM Step 1: Clean up existing build artifacts
echo Cleaning up existing build artifacts...
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build
if exist android\.gradle rmdir /s /q android\.gradle

REM Step 2: Run Expo prebuild to generate native code
echo Generating fresh Android project with Expo...
call npx expo prebuild --platform android --clean

REM Step 3: Set Java Home
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.6.7-hotspot"
echo Using Java Home: %JAVA_HOME%

REM Step 4: Try to build with EAS
echo Building with EAS CLI...
call npx eas-cli build --platform android --profile preview --local

echo Build process completed.
echo If successful, look for the APK in the build artifacts directory shown above.
pause
