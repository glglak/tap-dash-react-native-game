@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Minimal Android Build Script
echo ===================================

REM Set Java home to your JDK path
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.6.7-hotspot"
echo Using JAVA_HOME: %JAVA_HOME%

REM Try building with Expo CLI first
echo Attempting build with Expo CLI...
npx expo prebuild --platform android --clean

REM Change to android directory
cd android

REM Check for debug.keystore
if not exist app\debug.keystore (
    echo Creating debug keystore...
    mkdir -p app
    keytool -genkey -v -keystore app\debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
)

REM Set GRADLE_OPTS to allocate more memory
set "GRADLE_OPTS=-Xmx4096m -XX:MaxMetaspaceSize=512m"

REM Clean and build
echo Cleaning project...
call .\gradlew clean || echo Continuing despite clean error...

echo Building Android project with Gradle...
call .\gradlew %1 --stacktrace

REM Check the result
if %ERRORLEVEL% NEQ 0 (
    echo Build failed with error code: %ERRORLEVEL%
    echo Trying to build with additional debug info...
    call .\gradlew %1 --info --debug --stacktrace
) else (
    echo Build completed successfully!
    if "%1"=="bundleRelease" (
        echo AAB file location: app\build\outputs\bundle\release\app-release.aab
    ) else if "%1"=="assembleRelease" (
        echo APK file location: app\build\outputs\apk\release\app-release.apk
    )
)

REM Return to original directory
cd ..

echo Build process completed.
pause
